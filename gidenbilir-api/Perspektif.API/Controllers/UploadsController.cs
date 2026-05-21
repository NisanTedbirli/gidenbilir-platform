using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Perspektif.API.Common;
using Perspektif.API.Data;
using Perspektif.API.Models;
using Perspektif.API.Services;

namespace Perspektif.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadsController(AppDbContext db, CloudinaryService cloudinary) : ControllerBase
{
    // POST /api/uploads/experience/{experienceId}
    // multipart/form-data: file=<image>
    [HttpPost("experience/{experienceId}")]
    [RequestSizeLimit(10_000_000)] // 10 MB
    public async Task<IActionResult> UploadExperiencePhoto(int experienceId, IFormFile file)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var experience = await db.Experiences.FindAsync(experienceId);
        if (experience == null) return NotFound(new { message = "Deneyim bulunamadı." });
        if (experience.UserId != userId) return Forbid();

        var currentCount = await db.ExperiencePhotos.CountAsync(p => p.ExperienceId == experienceId);
        if (currentCount >= 5)
            return BadRequest(new { message = "Bir deneyime en fazla 5 fotoğraf eklenebilir." });

        // Magic byte validation — content-type ile dosya başlığı eşleşmeli
        if (!await FileValidator.IsValidImageAsync(file))
            return BadRequest(new { message = "Geçersiz görsel dosyası. JPG, PNG, WebP veya GIF olmalı, 10 MB'tan küçük olmalı." });

        var (url, publicId) = await cloudinary.UploadAsync(file);

        db.ExperiencePhotos.Add(new ExperiencePhoto
        {
            ExperienceId = experienceId,
            CloudinaryUrl = url,
            PublicId = publicId,
            Order = currentCount
        });
        await db.SaveChangesAsync();

        return Ok(new { url, publicId });
    }

    // POST /api/uploads/experience/{experienceId}/video
    [HttpPost("experience/{experienceId}/video")]
    [RequestSizeLimit(100_000_000)] // 100 MB
    public async Task<IActionResult> UploadExperienceVideo(int experienceId, IFormFile file)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var experience = await db.Experiences.FindAsync(experienceId);
        if (experience == null) return NotFound(new { message = "Deneyim bulunamadı." });
        if (experience.UserId != userId) return Forbid();

        var allowedTypes = new[] { "video/mp4", "video/quicktime", "video/webm", "video/x-msvideo" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Geçersiz video formatı. MP4, MOV, WebM veya AVI olmalı." });

        if (!string.IsNullOrEmpty(experience.VideoPublicId))
            await cloudinary.DeleteVideoAsync(experience.VideoPublicId);

        var (url, publicId) = await cloudinary.UploadVideoAsync(file);
        experience.VideoUrl = url;
        experience.VideoPublicId = publicId;
        await db.SaveChangesAsync();

        return Ok(new { url, publicId });
    }

    // DELETE /api/uploads/experience/{experienceId}/video
    [HttpDelete("experience/{experienceId}/video")]
    public async Task<IActionResult> DeleteExperienceVideo(int experienceId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var experience = await db.Experiences.FindAsync(experienceId);
        if (experience == null) return NotFound();
        if (experience.UserId != userId) return Forbid();
        if (string.IsNullOrEmpty(experience.VideoPublicId)) return NoContent();

        await cloudinary.DeleteVideoAsync(experience.VideoPublicId);
        experience.VideoUrl = null;
        experience.VideoPublicId = null;
        await db.SaveChangesAsync();
        return Ok();
    }

    // DELETE /api/uploads/photo/{photoId}
    [HttpDelete("photo/{photoId}")]
    public async Task<IActionResult> DeletePhoto(int photoId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var photo = await db.ExperiencePhotos
            .Include(p => p.Experience)
            .FirstOrDefaultAsync(p => p.Id == photoId);

        if (photo == null) return NotFound();
        if (photo.Experience.UserId != userId) return Forbid();

        await cloudinary.DeleteAsync(photo.PublicId);
        db.ExperiencePhotos.Remove(photo);
        await db.SaveChangesAsync();

        return Ok();
    }
}
