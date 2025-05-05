using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiTrocaLivros.Models
{
    [Table("books")]
    public class Book
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BookId { get; set; }
        
        [Required]
        public int OwnerId { get; set; }
        
        [ForeignKey("OwnerId")]
        public virtual User Owner { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Title { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Author { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Genre { get; set; }
        
        [Required] 
        [StringLength(50)]
        public string Publisher { get; set; }
        
        [Required]
        public int Pages { get; set; }
        
        [Required]
        public int Year { get; set; }
        
        public string? Sinopse { get; set; }
        
        [StringLength(200)]
        public string? CoverImageUrl { get; set; }
        
        [Required]
        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        public bool IsAvaiable { get; set; } = true;
        
    }
}