namespace ApiTrocaLivros.DTOs
{
    public class RatingDTOs
    {
        public class RatingRequestDTO
        {
            public int TradeId { get; set; }
            public int EvaluatedUserId { get; set; }
            public int Score { get; set; } 
            public string Comment { get; set; }
        }

        public class RatingResponseDTO
        {
            public int RatingId { get; set; }
            public int TradeId { get; set; }
            public int EvaluatorUserId { get; set; }
            public string EvaluatorUserName { get; set; }
            public int EvaluatedUserId { get; set; }
            public string EvaluatedUserName { get; set; }
            public int Score { get; set; }
            public string Comment { get; set; }
            public DateTime RatingDate { get; set; }
        }

        public class RatingUpdateDTO
        {
            public int Score { get; set; }
            public string Comment { get; set; }
        }
    }
}