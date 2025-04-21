using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiTrocaLivros.Migrations
{
    /// <inheritdoc />
    public partial class BlackListenedToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "blacklisted_tokens",
                columns: table => new
                {
                    Jti = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_blacklisted_tokens", x => x.Jti);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "blacklisted_tokens");
        }
    }
}
