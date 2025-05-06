using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using ApiTrocaLivros.Models;    // para TradeStatus

namespace ApiTrocaLivros.DTOs
{
    public static class TradeDTOs
    {
        /// 1) Criação de uma nova solicitação de troca.
        public class TradeRequestDTO
        {
            [Required]
            public int OfferedBookId { get; set; }
            
            [Required]
            public int TargetBookId { get; set; }
        }
        
        /// 2) Atualização de detalhes livres da troca (por exemplo, trocar o livro oferecido/solicitado).
        /// Campos opcionais para permitir partial update via PUT.
        public class TradeUpdateDTO
        {
            public int? OfferedBookId { get; set; }
            public int? TargetBookId  { get; set; }
        }

        
        /// 3) Apenas alteração de status (Pending → Accepted/Rejected/Cancelled/Completed).
        public class ChangeTradeStatusDTO
        {
            [Required]
            public TradeStatus Status { get; set; }
        }


        /// 4) DTO de resposta para exibir ao cliente.
        public class TradeResponseDTO
        {
            public int TradeId         { get; set; }
            public int RequesterId     { get; set; }
            public int OfferedBookId   { get; set; }
            public int TargetBookId    { get; set; }
            public DateTime CreatedAt  { get; set; }
            public DateTime? UpdatedAt { get; set; }
            [JsonConverter(typeof(JsonStringEnumConverter))]
            public TradeStatus Status { get; set; }
            
            public String? Email { get; set; }
            public String? Telefone { get; set; }
            
            public BookDTOs.BookResponseDTO OfferedBook { get; set; }
            public BookDTOs.BookResponseDTO TargetBook  { get; set; }
            public UserDTOs.UserResponseDTO Requester   { get; set; }
        }
        
        public class TradeContactInfoDTO
        {
            public string? Email { get; set; }
            public string? Telefone { get; set; }
        }
        
        /// 5) Opcional: filtros para listar trocas (via query string).
        public class TradeFilterDTO
        {
            public TradeStatus? Status     { get; set; }
            public int? RequesterId        { get; set; }
            public int? BookId             { get; set; } // Offered ou Target
            public DateTime? CreatedAfter  { get; set; }
            public DateTime? CreatedBefore { get; set; }
        }
    }
}
