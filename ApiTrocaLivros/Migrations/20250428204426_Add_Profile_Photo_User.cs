using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiTrocaLivros.Migrations
{
    /// <inheritdoc />
    public partial class Add_Profile_Photo_User : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfilePhoto",
                table: "users",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfilePhoto",
                table: "users");
        }
    }
}
