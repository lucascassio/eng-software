using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiTrocaLivros.Migrations
{
    /// <inheritdoc />
    public partial class Add_Book_Photo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverImageUrl",
                table: "books",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverImageUrl",
                table: "books");
        }
    }
}
