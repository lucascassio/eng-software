using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace ApiTrocaLivros.Models
{
    [Table("notifications")]
    public class Notification
    {
        [Key] 
        public int NotificationId { get; set; }
        public int UserId { get; set; } // Referência para o usuário que vai receber a notificação
        public string Message { get; set; } // Mensagem da notificação
        public bool IsRead { get; set; } // Marca como lida ou não
        public DateTime CreatedAt { get; set; } // Quando a notificação foi gerada
        public int TradeId { get; set; }  // ID da troca associada, pode ser null se não for relevante para a notificação

        [ForeignKey("UserId")] 
        public virtual User User { get; set; }
        
        public virtual Trade Trade { get; set; }  // Relacionamento com a tabela de Trocas

    }
}