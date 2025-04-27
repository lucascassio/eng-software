using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiTrocaLivros.Models
{
    [Table("trade")]
    public class Trade
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TradeID { get; set; }
        
        [Required]
        public int OfferedBookId { get; set; }

        [Required]
        public int TargetBookId { get; set; }

        [Required]
        public int RequesterId { get; set; }
        
        [ForeignKey("TargetBookId")]
        public virtual Book TargetBook { get; set; } 
        
        [ForeignKey("OfferedBookId")]
        public virtual Book OfferedBook { get; set; } 
        
        [ForeignKey("RequesterId")]
        public virtual User Requester { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public TradeStatus Status { get; set; }
        
        // status no ciclo de vida da troca:
        // Pending → Accepted → Completed
        //            ↘ Rejected
        //   ↘ Cancelled
        
    }

    public enum TradeStatus
    {
        Pending, //0
        Accepted, //1
        Rejected, //2
        Cancelled, //3
        Completed //4
    }
}
