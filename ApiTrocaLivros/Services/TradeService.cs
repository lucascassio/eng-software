using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ApiTrocaLivros.Data;
using ApiTrocaLivros.Services;
using ApiTrocaLivros.DTOs;
using ApiTrocaLivros.Models;
using ApiTrocaLivros.Functions;
using System.IdentityModel.Tokens.Jwt;

namespace ApiTrocaLivros.Services
{
    public class TradeService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly NotificationService _notificationService;

        public TradeService(AppDbContext context, IHttpContextAccessor httpContextAccessor, NotificationService notificationService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }

        // Obtém o ID do usuário autenticado
        private int GetCurrentUserId()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null || !user.Identity.IsAuthenticated)
                throw new Exception("Usuário não autenticado");

            var idClaim = user.FindFirst(JwtRegisteredClaimNames.Sub)
                          ?? user.FindFirst(ClaimTypes.NameIdentifier);

            if (idClaim == null)
                throw new Exception("Usuário não autenticado");

            return int.Parse(idClaim.Value);
        }

        // Criação de uma nova troca
        public async Task<TradeDTOs.TradeResponseDTO> Create(TradeDTOs.TradeRequestDTO dto)
        {
            var requesterId = GetCurrentUserId();

            // Verifica se os livros existem no banco
            var offeredBook = await _context.Books.FindAsync(dto.OfferedBookId)
                              ?? throw new KeyNotFoundException($"Livro oferecido com ID '{dto.OfferedBookId}' não encontrado.");
            var targetBook = await _context.Books.FindAsync(dto.TargetBookId)
                             ?? throw new KeyNotFoundException($"Livro alvo com ID '{dto.TargetBookId}' não encontrado.");

            // Validações de lógica de negócio
            if (offeredBook.OwnerId != requesterId)
                throw new UnauthorizedAccessException("Você não tem permissão para ofertar esse livro.");

            if (!offeredBook.IsAvaiable)
                throw new InvalidOperationException($"O livro ofertado '{offeredBook.Title}' não está disponível para troca.");
            if (!targetBook.IsAvaiable)
                throw new InvalidOperationException($"O livro alvo '{targetBook.Title}' não está disponível para troca.");

            if (dto.OfferedBookId == dto.TargetBookId)
                throw new ArgumentException("Não é possível trocar o mesmo livro.");

            // Cria a troca
            var trade = new Trade
            {
                OfferedBookId = dto.OfferedBookId,
                TargetBookId = dto.TargetBookId,
                RequesterId = requesterId,
                CreatedAt = DateTime.UtcNow,
                Status = TradeStatus.Pending
            };

            _context.Trades.Add(trade);

            try
            {
                // Salva no banco
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new Exception("Erro ao salvar a troca no banco de dados.", ex);
            }

            // Retorna a troca criada
            var fullTrade = await _context.Trades
                                .Include(t => t.OfferedBook)
                                .Include(t => t.TargetBook)
                                .Include(t => t.Requester)
                                .FirstOrDefaultAsync(t => t.TradeID == trade.TradeID)
                            ?? throw new Exception("Erro ao recarregar a troca criada.");

            return MapToDTO(fullTrade);
        }

        // Busca detalhes de uma troca específica pelo ID
        public async Task<TradeDTOs.TradeResponseDTO> Get(int id)
        {
            var trade = await _context.Trades
                            .Include(t => t.OfferedBook)
                            .Include(t => t.TargetBook)
                            .Include(t => t.Requester)
                            .FirstOrDefaultAsync(t => t.TradeID == id)
                        ?? throw new KeyNotFoundException($"Troca com ID '{id}' não encontrada.");

            return MapToDTO(trade);
        }

        // Lista todas as trocas solicitadas pelo usuário autenticado
        public async Task<List<TradeDTOs.TradeResponseDTO>> GetAllByRequesterId()
        {
            var requesterId = GetCurrentUserId();
            var trades = await _context.Trades
                .Include(t => t.OfferedBook)
                .Include(t => t.TargetBook)
                .Include(t => t.Requester)
                .Where(t => t.RequesterId == requesterId)
                .ToListAsync();

            if (!trades.Any())
                throw new KeyNotFoundException("Você não possui nenhuma troca.");

            return trades.Select(MapToDTO).ToList();
        }

        // Lista todas as solicitações recebidas para os livros do usuário autenticado
        public async Task<List<TradeDTOs.TradeResponseDTO>> GetAllReceivedRequests()
        {
            var userId = GetCurrentUserId();

            // Inclui a navegação antes de filtrar
            var trades = await _context.Trades
                .Include(t => t.TargetBook) // Garante que TargetBook está carregado
                .Where(t => t.TargetBook.OwnerId == userId)
                .ToListAsync();
            return trades.Select(MapToDTO).ToList(); // Retorna a lista, mesmo que vazia
        }
        // Atualiza os detalhes de uma troca
        public async Task<TradeDTOs.TradeResponseDTO> Update(int id, TradeDTOs.TradeUpdateDTO dto)
        {
            var trade = await _context.Trades.FindAsync(id)
                        ?? throw new KeyNotFoundException($"Troca com ID '{id}' não encontrada.");

            var requesterId = GetCurrentUserId();
            if (trade.RequesterId != requesterId)
                throw new UnauthorizedAccessException("Você não pode alterar esta troca.");

            if (dto.TargetBookId is not null)
                trade.TargetBookId = dto.TargetBookId.Value;

            if (dto.OfferedBookId is not null)
                trade.OfferedBookId = dto.OfferedBookId.Value;

            trade.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var fullTrade = await _context.Trades
                .Include(t => t.OfferedBook)
                .Include(t => t.TargetBook)
                .Include(t => t.Requester)
                .FirstOrDefaultAsync(t => t.TradeID == trade.TradeID);

            return MapToDTO(fullTrade!);
        }

        // Altera o status de uma troca (aceitar, recusar, cancelar, concluir)
        public async Task<TradeDTOs.TradeResponseDTO> ChangeStatus(int id, TradeDTOs.ChangeTradeStatusDTO dto)
        {
            var trade = await _context.Trades
                .Include(t => t.OfferedBook)
                .Include(t => t.TargetBook)
                .FirstOrDefaultAsync(t => t.TradeID == id)
                ?? throw new KeyNotFoundException($"Troca com ID '{id}' não encontrada.");

            var userId = GetCurrentUserId();

            if (dto.Status is TradeStatus.Accepted or TradeStatus.Rejected)
            {
                if (trade.TargetBook.OwnerId != userId)
                    throw new UnauthorizedAccessException("Você não tem permissão para alterar esta troca.");
            }
            else if (dto.Status is TradeStatus.Cancelled or TradeStatus.Completed)
            {
                if (trade.RequesterId != userId)
                    throw new UnauthorizedAccessException("Você não tem permissão para alterar esta troca.");
            }

            trade.Status = dto.Status;
            trade.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDTO(trade);
        }

        // Mapeia a entidade Trade para o DTO
        private static TradeDTOs.TradeResponseDTO MapToDTO(Trade trade)
        {
            return new TradeDTOs.TradeResponseDTO
            {
                TradeId = trade.TradeID,
                RequesterId = trade.RequesterId,
                OfferedBookId = trade.OfferedBookId,
                TargetBookId = trade.TargetBookId,
                CreatedAt = trade.CreatedAt,
                UpdatedAt = trade.UpdatedAt,
                Status = trade.Status,
                OfferedBook = new BookDTOs.BookResponseDTO
                {
                    BookId = trade.OfferedBook.BookId,
                    Title = trade.OfferedBook.Title,
                    IsAvailable = trade.OfferedBook.IsAvaiable
                },
                TargetBook = new BookDTOs.BookResponseDTO
                {
                    BookId = trade.TargetBook.BookId,
                    Title = trade.TargetBook.Title,
                    IsAvailable = trade.TargetBook.IsAvaiable
                },
                Requester = new UserDTOs.UserResponseDTO
                {
                    Id = trade.Requester.Id,
                    Name = trade.Requester.Name
                }
            };
        }
    }
}