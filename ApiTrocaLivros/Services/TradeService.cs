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

            // Busca as trocas solicitadas pelo usuário autenticado
            var trades = await _context.Trades
                .Include(t => t.OfferedBook)
                .Include(t => t.TargetBook)
                .Include(t => t.Requester)
                .Where(t => t.RequesterId == requesterId)
                .ToListAsync();

            // Mapeia a lista de trocas para o formato DTO (se vazia, retornará uma lista vazia)
            return trades.Select(MapToDTO).ToList();
        }
        
        // Lista todas as solicitações recebidas para os livros do usuário autenticado
        public async Task<List<TradeDTOs.TradeResponseDTO>> GetAllReceivedRequests()
        {
            var userId = GetCurrentUserId();

            var trades = await _context.Trades
                .Include(t => t.OfferedBook)
                .Include(t => t.TargetBook)
                .Include(t => t.Requester)
                .Where(t => t.TargetBook.OwnerId == userId)
                .ToListAsync();

            return trades.Select(MapToDTO).ToList();
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

        // In TradeService.cs
        public async Task<TradeDTOs.TradeResponseDTO> ChangeStatus(int id, string newStatus)
        {
            try
            {
                var trade = await _context.Trades
                    .Include(t => t.OfferedBook)
                    .Include(t => t.TargetBook)
                    .Include(t => t.Requester)
                    .FirstOrDefaultAsync(t => t.TradeID == id);

                if (trade == null)
                    throw new KeyNotFoundException($"Troca com ID '{id}' não encontrada.");

                var userId = GetCurrentUserId();

                if (!Enum.TryParse<TradeStatus>(newStatus, true, out var status))
                    throw new ArgumentException($"Status '{newStatus}' inválido.");

                // Additional logging
                Console.WriteLine($"Trade status change: ID={id}, Current status={trade.Status}, New status={status}, UserId={userId}");
                Console.WriteLine($"Target book owner: {trade.TargetBook.OwnerId}, Requester: {trade.RequesterId}");

                if (status is TradeStatus.Accepted or TradeStatus.Rejected)
                {
                    if (trade.TargetBook.OwnerId != userId)
                        throw new UnauthorizedAccessException("Você não tem permissão para alterar esta troca. Apenas o dono do livro alvo pode aceitar ou rejeitar.");
                }
                else if (status is TradeStatus.Cancelled or TradeStatus.Completed)
                {
                    if (trade.RequesterId != userId)
                        throw new UnauthorizedAccessException("Você não tem permissão para alterar esta troca. Apenas o solicitante pode cancelar ou marcar como concluída.");
                }

                trade.Status = status;
                trade.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return MapToDTO(trade);
            }
            catch (Exception ex)
            {
                // Log the full exception
                Console.WriteLine($"Exception in ChangeStatus: {ex}");
                throw; // rethrow to be handled by controller
            }
        }
        
        public async Task<TradeDTOs.TradeResponseDTO> UpdateContactInfo(int id, string? email, string? telefone)
        {
            // Carrega a troca e os objetos relacionados
            var trade = await _context.Trades
                            .Include(t => t.OfferedBook)
                            .Include(t => t.TargetBook)
                            .Include(t => t.Requester)
                            .FirstOrDefaultAsync(t => t.TradeID == id)
                        ?? throw new KeyNotFoundException($"Troca com ID '{id}' não encontrada.");

            var userId = GetCurrentUserId();

            // Valida se o usuário tem permissão para atualizar
            if (trade.RequesterId != userId)
                throw new UnauthorizedAccessException("Você não tem permissão para atualizar as informações de contato desta troca.");

            // Verifica se a troca está concluída
            if (trade.Status != TradeStatus.Completed)
                throw new InvalidOperationException("As informações de contato só podem ser adicionadas para trocas concluídas.");

            // Atualiza os campos de contato
            trade.Email = email?.Trim(); // Usa Trim para remover espaços extras
            trade.Telefone = telefone?.Trim(); // Usa Trim para remover espaços extras
            trade.UpdatedAt = DateTime.UtcNow;

            // Salva as mudanças no banco de dados
            var rowsAffected = await _context.SaveChangesAsync();
            if (rowsAffected == 0)
                throw new Exception("Nenhuma linha foi atualizada no banco de dados.");

            // Retorna o DTO atualizado
            return MapToDTO(trade);
        }
        
    private static TradeDTOs.TradeResponseDTO MapToDTO(Trade trade)
    {
        if (trade == null)
            throw new ArgumentNullException(nameof(trade), "A troca fornecida é nula.");

        return new TradeDTOs.TradeResponseDTO
        {
            TradeId = trade.TradeID,
            RequesterId = trade.RequesterId,
            OfferedBookId = trade.OfferedBookId,
            TargetBookId = trade.TargetBookId,
            CreatedAt = trade.CreatedAt,
            UpdatedAt = trade.UpdatedAt,
            Status = trade.Status,
            Email = trade.Email ?? string.Empty, // Padroniza valores nulos como string vazia
            Telefone = trade.Telefone ?? string.Empty, // Padroniza valores nulos como string vazia

            OfferedBook = trade.OfferedBook != null ? new BookDTOs.BookResponseDTO
            {
                BookId = trade.OfferedBook.BookId,
                OwnerId = trade.OfferedBook.OwnerId,
                Title = trade.OfferedBook.Title,
                Author = trade.OfferedBook.Author,
                Genre = trade.OfferedBook.Genre,
                Publisher = trade.OfferedBook.Publisher,
                Pages = trade.OfferedBook.Pages,
                Year = trade.OfferedBook.Year,
                Sinopse = trade.OfferedBook.Sinopse ?? string.Empty,
                RegistrationDate = trade.OfferedBook.RegistrationDate,
                IsAvailable = trade.OfferedBook.IsAvaiable,
                CoverImageUrl = trade.OfferedBook.CoverImageUrl ?? string.Empty
            } : null,

            TargetBook = trade.TargetBook != null ? new BookDTOs.BookResponseDTO
            {
                BookId = trade.TargetBook.BookId,
                OwnerId = trade.TargetBook.OwnerId,
                Title = trade.TargetBook.Title,
                Author = trade.TargetBook.Author,
                Genre = trade.TargetBook.Genre,
                Publisher = trade.TargetBook.Publisher,
                Pages = trade.TargetBook.Pages,
                Year = trade.TargetBook.Year,
                Sinopse = trade.TargetBook.Sinopse ?? string.Empty,
                RegistrationDate = trade.TargetBook.RegistrationDate,
                IsAvailable = trade.TargetBook.IsAvaiable,
                CoverImageUrl = trade.TargetBook.CoverImageUrl ?? string.Empty
            } : null,

            Requester = trade.Requester != null ? new UserDTOs.UserResponseDTO
            {
                Id = trade.Requester.Id,
                Name = trade.Requester.Name,
                Email = trade.Requester.Email,
                Course = trade.Requester.Course,
                RegistrationDate = trade.Requester.RegistrationDate,
                IsActive = trade.Requester.IsActive
            } : null
        };
    }
    }
}