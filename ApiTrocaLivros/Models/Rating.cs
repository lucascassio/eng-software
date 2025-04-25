using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiTrocaLivros.Models
{
    [Table("ratings")]
    public class Rating
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RatingId { get; set; }

        [Required]
        public int TradeId { get; set; }

        [ForeignKey("TradeId")]
        public virtual Trade Trade { get; set; }

        [Required]
        public int EvaluatorUserId { get; set; } // Usuário que está fazendo a avaliação

        [ForeignKey("EvaluatorUserId")]
        public virtual User EvaluatorUser { get; set; }

        [Required]
        public int EvaluatedUserId { get; set; } // Usuário que está sendo avaliado

        [ForeignKey("EvaluatedUserId")]
        public virtual User EvaluatedUser { get; set; }

        [Required]
        [Range(1, 5)]
        public int Score { get; set; } // Nota de 1 a 5

        [StringLength(500)]
        public string Comment { get; set; }

        [Required]
        public DateTime RatingDate { get; set; } = DateTime.UtcNow;
    }
}