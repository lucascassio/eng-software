using ApiTrocaLivros.Data;
using ApiTrocaLivros.DTOs;
using ApiTrocaLivros.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiTrocaLivros.Services
{
    public class RatingService
    {
        private readonly AppDbContext _context;

        public RatingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RatingDTOs.RatingResponseDTO> Create(RatingDTOs.RatingRequestDTO dto, int evaluatorUserId)
        {
            var trade = await _context.Trades
                .Include(t => t.OfferedBook)
                .Include(t => t.TargetBook)
                .FirstOrDefaultAsync(t => t.TradeID == dto.TradeId && t.Status == TradeStatus.Completed);

            if (trade == null)
            {
                throw new KeyNotFoundException("Troca não encontrada ou não concluída.");
            }

            // Verificar se o avaliador tem permissão para avaliar esta troca
            if (evaluatorUserId != trade.RequesterId && evaluatorUserId != trade.TargetBook.OwnerId)
            {
                throw new UnauthorizedAccessException("Você não tem permissão para avaliar esta troca.");
            }

            // Verificar se o usuário avaliado está envolvido na troca
            if (dto.EvaluatedUserId != trade.RequesterId && dto.EvaluatedUserId != trade.TargetBook.OwnerId)
            {
                throw new ArgumentException("O usuário avaliado deve ser um dos participantes da troca.");
            }

            // Verificar se o avaliador não está avaliando a si mesmo
            if (evaluatorUserId == dto.EvaluatedUserId)
            {
                throw new ArgumentException("Você não pode se autoavaliar.");
            }

            // Verificar se já existe uma avaliação deste usuário para esta troca
            var existingRating = await _context.Ratings
                .FirstOrDefaultAsync(r => r.TradeId == dto.TradeId && r.EvaluatorUserId == evaluatorUserId);

            if (existingRating != null)
            {
                throw new InvalidOperationException("Você já avaliou esta troca.");
            }

            // Validar a nota
            if (dto.Score < 1 || dto.Score > 5)
            {
                throw new ArgumentException("A nota deve estar entre 1 e 5.");
            }

            var rating = new Rating
            {
                TradeId = dto.TradeId,
                EvaluatorUserId = evaluatorUserId,
                EvaluatedUserId = dto.EvaluatedUserId,
                Score = dto.Score,
                Comment = dto.Comment,
                RatingDate = DateTime.UtcNow
            };

            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();

            return await GetRatingResponse(rating.RatingId);
        }

        public async Task<RatingDTOs.RatingResponseDTO> Get(int id)
        {
            var rating = await _context.Ratings
                .Include(r => r.EvaluatorUser)
                .Include(r => r.EvaluatedUser)
                .FirstOrDefaultAsync(r => r.RatingId == id);

            if (rating == null)
            {
                throw new KeyNotFoundException("Avaliação não encontrada.");
            }

            return new RatingDTOs.RatingResponseDTO
            {
                RatingId = rating.RatingId,
                TradeId = rating.TradeId,
                EvaluatorUserId = rating.EvaluatorUserId,
                EvaluatorUserName = rating.EvaluatorUser.Name,
                EvaluatedUserId = rating.EvaluatedUserId,
                EvaluatedUserName = rating.EvaluatedUser.Name,
                Score = rating.Score,
                Comment = rating.Comment,
                RatingDate = rating.RatingDate
            };
        }

        public async Task<List<RatingDTOs.RatingResponseDTO>> GetUserRatings(int userId)
        {
            var ratings = await _context.Ratings
                .Include(r => r.EvaluatorUser)
                .Include(r => r.EvaluatedUser)
                .Where(r => r.EvaluatedUserId == userId)
                .OrderByDescending(r => r.RatingDate)
                .ToListAsync();

            return ratings.Select(r => new RatingDTOs.RatingResponseDTO
            {
                RatingId = r.RatingId,
                TradeId = r.TradeId,
                EvaluatorUserId = r.EvaluatorUserId,
                EvaluatorUserName = r.EvaluatorUser.Name,
                EvaluatedUserId = r.EvaluatedUserId,
                EvaluatedUserName = r.EvaluatedUser.Name,
                Score = r.Score,
                Comment = r.Comment,
                RatingDate = r.RatingDate
            }).ToList();
        }

        public async Task<RatingDTOs.RatingResponseDTO> Update(int id, RatingDTOs.RatingUpdateDTO dto, int userId)
        {
            var rating = await _context.Ratings.FindAsync(id);

            if (rating == null)
            {
                throw new KeyNotFoundException("Avaliação não encontrada.");
            }

            if (rating.EvaluatorUserId != userId)
            {
                throw new UnauthorizedAccessException("Você não tem permissão para editar esta avaliação.");
            }

            // Validar a nota
            if (dto.Score < 1 || dto.Score > 5)
            {
                throw new ArgumentException("A nota deve estar entre 1 e 5.");
            }

            rating.Score = dto.Score;
            rating.Comment = dto.Comment;

            await _context.SaveChangesAsync();

            return await GetRatingResponse(rating.RatingId);
        }

        public async Task Delete(int id, int userId)
        {
            var rating = await _context.Ratings.FindAsync(id);

            if (rating == null)
            {
                throw new KeyNotFoundException("Avaliação não encontrada.");
            }

            if (rating.EvaluatorUserId != userId)
            {
                throw new UnauthorizedAccessException("Você não tem permissão para excluir esta avaliação.");
            }

            _context.Ratings.Remove(rating);
            await _context.SaveChangesAsync();
        }

        private async Task<RatingDTOs.RatingResponseDTO> GetRatingResponse(int ratingId)
        {
            var rating = await _context.Ratings
                .Include(r => r.EvaluatorUser)
                .Include(r => r.EvaluatedUser)
                .FirstOrDefaultAsync(r => r.RatingId == ratingId);

            return new RatingDTOs.RatingResponseDTO
            {
                RatingId = rating.RatingId,
                TradeId = rating.TradeId,
                EvaluatorUserId = rating.EvaluatorUserId,
                EvaluatorUserName = rating.EvaluatorUser.Name,
                EvaluatedUserId = rating.EvaluatedUserId,
                EvaluatedUserName = rating.EvaluatedUser.Name,
                Score = rating.Score,
                Comment = rating.Comment,
                RatingDate = rating.RatingDate
            };
        }
    }
}