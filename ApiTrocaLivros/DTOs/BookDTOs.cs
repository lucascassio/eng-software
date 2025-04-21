using System.ComponentModel.DataAnnotations;

namespace ApiTrocaLivros.DTOs;
public class BookDTOs
{
    public class BookRequestDTO
    {
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
    }

    public class BookUpdateRequestDTO
    {
        [StringLength(50)]
        public string? Title { get; set; }
        
        [StringLength(50)]
        public string? Author { get; set; }
        
        [StringLength(50)]
        public string? Genre { get; set; }
        
        [StringLength(50)]
        public string? Publisher { get; set; }
        
        public int? Pages { get; set; }
        
        public int? Year { get; set; }
        
        public string? Sinopse { get; set; }
        
        public bool? IsAvailable { get; set; }
    }

    public class BookResponseDTO
    {
        public int BookId { get; set; }
        public int OwnerId { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string Genre { get; set; }
        public string Publisher { get; set; }
        public int Pages { get; set; }
        public int Year { get; set; }
        public string? Sinopse { get; set; }
        public DateTime RegistrationDate { get; set; }
        public bool IsAvailable { get; set; }
    }
    
    
}