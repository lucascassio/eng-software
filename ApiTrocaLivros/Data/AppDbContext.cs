using Microsoft.EntityFrameworkCore;
using ApiTrocaLivros.Models;

namespace ApiTrocaLivros.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<User> Users { get; set; }
        public DbSet<Book> Books { get; set; }
        
        //Duvida sobre esse protected override
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
        }
    }
}