using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Perspektif.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVideoToExperience : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VideoPublicId",
                table: "Experiences",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Experiences",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VideoPublicId",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Experiences");
        }
    }
}
