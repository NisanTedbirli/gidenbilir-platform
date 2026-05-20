using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Perspektif.API.Controllers;
using Perspektif.API.Data;
using Perspektif.API.DTOs;
using Perspektif.API.Hubs;
using Perspektif.API.Models;
using System.Security.Claims;

namespace Perspektif.API.Tests;

// SignalR çağrılarını sessizce yutmak için minimal fake
file sealed class FakeChatHub : IHubContext<ChatHub>
{
    public IHubClients Clients => new FakeHubClients();
    public IGroupManager Groups => new FakeGroupManager();
}

file sealed class FakeHubClients : IHubClients
{
    public IClientProxy All => new FakeClientProxy();
    public IClientProxy AllExcept(IReadOnlyList<string> excludedConnectionIds) => new FakeClientProxy();
    public IClientProxy Client(string connectionId) => new FakeClientProxy();
    public IClientProxy Clients(IReadOnlyList<string> connectionIds) => new FakeClientProxy();
    public IClientProxy Group(string groupName) => new FakeClientProxy();
    public IClientProxy GroupExcept(string groupName, IReadOnlyList<string> excludedConnectionIds) => new FakeClientProxy();
    public IClientProxy Groups(IReadOnlyList<string> groupNames) => new FakeClientProxy();
    public IClientProxy User(string userId) => new FakeClientProxy();
    public IClientProxy Users(IReadOnlyList<string> userIds) => new FakeClientProxy();
}

file sealed class FakeClientProxy : IClientProxy
{
    public Task SendCoreAsync(string method, object?[] args, CancellationToken cancellationToken = default)
        => Task.CompletedTask;
}

file sealed class FakeGroupManager : IGroupManager
{
    public Task AddToGroupAsync(string connectionId, string groupName, CancellationToken cancellationToken = default) => Task.CompletedTask;
    public Task RemoveFromGroupAsync(string connectionId, string groupName, CancellationToken cancellationToken = default) => Task.CompletedTask;
}

public class MessagesControllerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly ConversationsController _sut;
    private readonly int _user1Id = 1;
    private readonly int _user2Id = 2;

    public MessagesControllerTests()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(opts);

        // Seed test data
        var nationality = new Nationality { Id = 1, Name = "Türk", Code = "TR", FlagEmoji = "🇹🇷" };
        _db.Nationalities.Add(nationality);

        var user1 = new User
        {
            Id = _user1Id,
            FullName = "User One",
            Email = "user1@test.com",
            PasswordHash = "hash",
            NationalityId = 1
        };

        var user2 = new User
        {
            Id = _user2Id,
            FullName = "User Two",
            Email = "user2@test.com",
            PasswordHash = "hash",
            NationalityId = 1
        };

        _db.Users.AddRange(user1, user2);
        _db.SaveChanges();

        _sut = new ConversationsController(_db, new FakeChatHub());
    }

    public void Dispose() => _db.Dispose();

    private void SetCurrentUser(int userId)
    {
        var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);

        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    // ─── Test Scenario 1: User A sends message, deletes it, User B still sees it ───
    [Fact]
    public async Task DeleteMessage_WhenUser1Deletes_OnlyMarksUser1AsDeleted()
    {
        // Arrange
        SetCurrentUser(_user1Id);

        var conversation = new Conversation { User1Id = _user1Id, User2Id = _user2Id };
        _db.Conversations.Add(conversation);
        await _db.SaveChangesAsync();

        var message = new Message
        {
            Content = "Test message",
            SenderId = _user1Id,
            ConversationId = conversation.Id
        };
        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        // Act
        var result = await _sut.DeleteMessage(conversation.Id, message.Id);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult?.Value.Should().BeEquivalentTo(new { success = true });

        var deletedMessage = await _db.Messages.FirstOrDefaultAsync(m => m.Id == message.Id);
        deletedMessage.Should().NotBeNull();
        deletedMessage!.IsDeletedByUser1.Should().BeTrue();
        deletedMessage.IsDeletedByUser2.Should().BeFalse();
    }

    // ─── Test Scenario 2: User B should still see the message after User A deleted ───
    [Fact]
    public async Task GetMessages_AfterUser1Deletes_User2StillSees()
    {
        // Arrange
        var conversation = new Conversation { User1Id = _user1Id, User2Id = _user2Id };
        _db.Conversations.Add(conversation);
        await _db.SaveChangesAsync();

        var message = new Message
        {
            Content = "Test message",
            SenderId = _user1Id,
            ConversationId = conversation.Id,
            IsDeletedByUser1 = true,
            IsDeletedByUser2 = false
        };
        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        // Act: User2 fetches messages
        SetCurrentUser(_user2Id);
        var result = await _sut.GetMessages(conversation.Id);

        // Assert: User2 sees the message
        result.Should().BeOfType<OkObjectResult>();
        var pagedResult = ((OkObjectResult)result).Value as PagedResult<MessageDto>;
        pagedResult?.Items.Should().HaveCount(1);
        pagedResult?.Items.First().Content.Should().Be("Test message");
    }

    // ─── Test Scenario 3: User A doesn't see deleted message ───
    [Fact]
    public async Task GetMessages_AfterUser1Deletes_User1DoesntSee()
    {
        // Arrange
        var conversation = new Conversation { User1Id = _user1Id, User2Id = _user2Id };
        _db.Conversations.Add(conversation);
        await _db.SaveChangesAsync();

        var message = new Message
        {
            Content = "Test message",
            SenderId = _user1Id,
            ConversationId = conversation.Id,
            IsDeletedByUser1 = true,
            IsDeletedByUser2 = false
        };
        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        // Act: User1 fetches messages
        SetCurrentUser(_user1Id);
        var result = await _sut.GetMessages(conversation.Id);

        // Assert: User1 doesn't see the message
        result.Should().BeOfType<OkObjectResult>();
        var pagedResult = ((OkObjectResult)result).Value as PagedResult<MessageDto>;
        pagedResult?.Items.Should().HaveCount(0);
    }

    // ─── Test Scenario 4: Hard delete when both users delete ───
    [Fact]
    public async Task DeleteMessage_WhenBothUsersDelete_HardDeletes()
    {
        // Arrange
        var conversation = new Conversation { User1Id = _user1Id, User2Id = _user2Id };
        _db.Conversations.Add(conversation);
        await _db.SaveChangesAsync();

        var message = new Message
        {
            Content = "Test message",
            SenderId = _user1Id,
            ConversationId = conversation.Id,
            IsDeletedByUser1 = false,
            IsDeletedByUser2 = true
        };
        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        // Act: User1 also deletes
        SetCurrentUser(_user1Id);
        var result = await _sut.DeleteMessage(conversation.Id, message.Id);

        // Assert
        result.Should().BeOfType<OkObjectResult>();

        var deletedMessage = await _db.Messages.FirstOrDefaultAsync(m => m.Id == message.Id);
        deletedMessage.Should().BeNull();
    }

    // ─── Test Scenario 5: New message is visible to both ───
    [Fact]
    public async Task SendMessage_AfterBothDeletedPrevious_NewMessageVisibleToBoth()
    {
        // Arrange
        SetCurrentUser(_user1Id);

        await _sut.CreateConversation(new CreateConversationRequest(_user2Id));

        var conversation = await _db.Conversations
            .FirstOrDefaultAsync(c => c.User1Id == _user1Id && c.User2Id == _user2Id);
        var conversationId = conversation!.Id;

        // Send and delete first message
        await _sut.SendMessage(conversationId, new SendMessageRequest("First message"));

        var firstMessage = await _db.Messages.FirstOrDefaultAsync();
        firstMessage!.IsDeletedByUser1 = true;
        firstMessage.IsDeletedByUser2 = true;
        _db.Messages.Update(firstMessage);
        await _db.SaveChangesAsync();

        // Act: Send new message
        var result = await _sut.SendMessage(conversationId, new SendMessageRequest("Second message"));

        // Assert
        result.Should().BeOfType<CreatedAtActionResult>();

        var user1Messages = await _db.Messages
            .Where(m => m.ConversationId == conversationId && !m.IsDeletedByUser1)
            .ToListAsync();
        var user2Messages = await _db.Messages
            .Where(m => m.ConversationId == conversationId && !m.IsDeletedByUser2)
            .ToListAsync();

        user1Messages.Should().HaveCount(1);
        user2Messages.Should().HaveCount(1);
        user1Messages[0].Content.Should().Be("Second message");
        user2Messages[0].Content.Should().Be("Second message");
    }
}
