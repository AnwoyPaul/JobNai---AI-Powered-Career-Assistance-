using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobNai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAchievementsField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Achievements",
                table: "ResumeProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Achievements",
                table: "ResumeProfiles");
        }
    }
}
