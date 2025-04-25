using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ApiTrocaLivros.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Course { get; set; }
            
        [Required]
        [StringLength(255)]
        public string Password { get; set; }
        
        [Required]
        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        public bool IsActive { get; set; } = true;
    }
}