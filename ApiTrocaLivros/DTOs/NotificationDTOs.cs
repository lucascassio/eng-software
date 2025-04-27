using System.ComponentModel.DataAnnotations;
namespace ApiTrocaLivros.DTOs;

public class NotificationDTOs
{
    public class NotificationRequestDTO
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public string Message { get; set; }
        
        [Required]
        public int TradeId { get; set; }
    }
    
    public class NotificationResponseDTO
    {
        public int NotificationId { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TradeId { get; set; }
    }
}