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

        public async Task<TradeDTOs.TradeResponseDTO> Create(TradeDTOs.TradeRequestDTO dto)
        {
            var requesterId = GetCurrentUserId();

            var offeredBook = await _context.Books.FindAsync(dto.OfferedBookId)
                              ?? throw new KeyNotFoundException($"Livro oferecido com ID '{dto.OfferedBookId}' não encontrado.");
            var targetBook = await _context.Books.FindAsync(dto.TargetBookId)
                             ?? throw new KeyNotFoundException($"Livro alvo com ID '{dto.TargetBookId}' não encontrado.");

            if (offeredBook.OwnerId != requesterId)
                throw new UnauthorizedAccessException("Você não tem permissão para ofertar esse livro.");

            if (!offeredBook.IsAvaiable)
                throw new InvalidOperationException($"O livro ofertado '{offeredBook.Title}' não está disponível para troca.");
            if (!targetBook.IsAvaiable)
                throw new InvalidOperationException($"O livro alvo '{targetBook.Title}' não está disponível para troca.");

            if (dto.OfferedBookId == dto.TargetBookId)
                throw new ArgumentException("Não é possível trocar o mesmo livro.");

            var trade = new Trade
            {
                OfferedBookId = dto.OfferedBookId,
                TargetBookId  = dto.TargetBookId,
                RequesterId   = requesterId,
                CreatedAt     = DateTime.UtcNow,
                Status        = TradeStatus.Pending
            };

            _context.Trades.Add(trade);
            await _context.SaveChangesAsync();

            // 6) Dispara notificação para o solicitante (quem fez a troca)
            await _notificationService.CreateNotification(new NotificationDTOs.NotificationRequestDTO
            {
                UserId = requesterId,  // Usuário que fez a solicitação de troca
                Message = $"Você fez uma solicitação de troca! Aguardando a resposta.",
                TradeId = trade.TradeID  // ID da troca
            });

            // 7) Dispara notificação para o dono do livro alvo
            await _notificationService.CreateNotification(new NotificationDTOs.NotificationRequestDTO
            {
                UserId = targetBook.OwnerId,  // Dono do livro alvo
                Message = $"Você recebeu uma solicitação de troca para o livro '{targetBook.Title}'.",
                TradeId = trade.TradeID  // ID da troca
            });
            
            var fullTrade = await _context.Trades
                                .Include(t => t.OfferedBook)
                                .Include(t => t.TargetBook)
                                .Include(t => t.Requester)
                                .FirstOrDefaultAsync(t => t.TradeID == trade.TradeID)
                            ?? throw new Exception("Erro ao recarregar a trade criada.");

            return MapToDTO(fullTrade);
        }

        
        public async Task<TradeDTOs.TradeResponseDTO> Get(int id)
        {
            // Inclui as navigations antes de mapear
            var trade = await _context.Trades
                            .Include(t => t.OfferedBook)
                            .Include(t => t.TargetBook)
                            .Include(t => t.Requester)
                            .FirstOrDefaultAsync(t => t.TradeID == id)
                        ?? throw new KeyNotFoundException($"Troca com ID '{id}' não encontrada.");

            return MapToDTO(trade);
        }

        public async Task<List<TradeDTOs.TradeResponseDTO>> GetAllByRequesterId()
        {
            var requesterId = GetCurrentUserId();
            var trades = await _context.Trades
                .Include(t => t.OfferedBook)
                .Include(t => t.TargetBook)
                .Include(t => t.Requester)
                .Where(t => t.RequesterId == requesterId)
                .ToListAsync();
            
            if(!trades.Any())
                throw new KeyNotFoundException("Você não possui nenhuma troca.");

            return trades.Select(MapToDTO).ToList();
        }
        
        public async Task<List<TradeDTOs.TradeResponseDTO>> GetAllReceivedRequests()
        {
            var userId = GetCurrentUserId();

            //  filtra as trocas onde o livro alvo pertence a esse usuário
            var trades = await _context.Trades
                .Where(t => t.TargetBook.OwnerId == userId)
                .Select(t => MapToDTO(t))
                .ToListAsync();
            
            if (!trades.Any())
                throw new KeyNotFoundException("Não há solicitações de troca para você.");

            return trades;
        }

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
            
            var full = await _context.Trades
                .Include(t => t.OfferedBook)
                .Include(t => t.TargetBook)
                .Include(t => t.Requester)
                .FirstOrDefaultAsync(t => t.TradeID == trade.TradeID);

            var targetBook = await _context.Books.FindAsync(trade.TargetBookId)
                             ?? throw new InvalidOperationException(
                                 $"Livro alvo (ID {trade.TargetBookId}) não encontrado.");
            
            await _notificationService.CreateNotification(new NotificationDTOs.NotificationRequestDTO
            {
                UserId = targetBook.OwnerId,  // Dono do livro alvo
                Message = $"Você aceitou a solicitação de troca para o livro '{targetBook.Title}'.",
                TradeId = trade.TradeID  // ID da troca
            });

            return MapToDTO(full!);
        }

        public async Task<TradeDTOs.TradeResponseDTO> ChangeStatus(int id, TradeDTOs.ChangeTradeStatusDTO dto)
        {
            var trade = await _context.Trades.FindAsync(id)
                ?? throw new KeyNotFoundException($"Troca com ID '{id}' não encontrada.");

            var userId = GetCurrentUserId();

            // 1) valida quem pode aceitar/rejeitar: só dono do livro alvo
            if (dto.Status is TradeStatus.Accepted or TradeStatus.Rejected)
            {
                var targetBook = await _context.Books.FindAsync(trade.TargetBookId)
                                  ?? throw new InvalidOperationException(
                                     $"Livro alvo (ID {trade.TargetBookId}) não encontrado.");
                if (targetBook.OwnerId != userId)
                    throw new UnauthorizedAccessException(
                        "Você não pode aceitar ou recusar esta troca.");
            }
            // 2) quem pode cancelar ou concluir: só quem fez a solicitação
            else if (dto.Status is TradeStatus.Cancelled or TradeStatus.Completed)
            {
                if (trade.RequesterId != userId)
                    throw new UnauthorizedAccessException(
                        "Você não pode cancelar ou concluir esta troca.");
            }

            // 3) regras de transição de estado
            switch (trade.Status)
            {
                case TradeStatus.Pending:
                    if (dto.Status is not (TradeStatus.Accepted or TradeStatus.Rejected or TradeStatus.Cancelled))
                        throw new InvalidOperationException(
                            $"Não é possível mudar de {trade.Status} para {dto.Status}.");
                    break;
                case TradeStatus.Accepted:
                    if (dto.Status != TradeStatus.Completed)
                        throw new InvalidOperationException(
                            $"Não é possível mudar de {trade.Status} para {dto.Status}.");
                    break;
                default:
                    throw new InvalidOperationException(
                        $"Não é possível alterar o status de {trade.Status}.");
            }

            // 4) aplica a mudança
            trade.Status    = dto.Status;
            trade.UpdatedAt = DateTime.UtcNow;

            // 5) se for ACCEPTED, marca ambos os livros como indisponíveis
            if (dto.Status == TradeStatus.Accepted)
            {
                var offeredBook = await _context.Books.FindAsync(trade.OfferedBookId)
                                    ?? throw new InvalidOperationException(
                                        $"Livro ofertado (ID {trade.OfferedBookId}) não encontrado.");
                offeredBook.IsAvaiable = false;

                var targetBook = await _context.Books.FindAsync(trade.TargetBookId)
                                    ?? throw new InvalidOperationException(
                                        $"Livro alvo (ID {trade.TargetBookId}) não encontrado.");
                targetBook.IsAvaiable = false;
                
                // Criar a notificação para o dono do livro alvo
                await _notificationService.CreateNotification(new NotificationDTOs.NotificationRequestDTO
                {
                    UserId = targetBook.OwnerId,  // Dono do livro alvo
                    Message = $"Você aceitou a solicitação de troca para o livro '{targetBook.Title}'.",
                    TradeId = trade.TradeID  // ID da troca
                });
                
                await _notificationService.CreateNotification(new NotificationDTOs.NotificationRequestDTO
                {
                    UserId  = trade.RequesterId,
                    Message = $"Sua solicitação de troca para o livro '{targetBook.Title}' foi aceita!",
                    TradeId = trade.TradeID
                });
            }
            
            // 6) Se a troca for completada ou recusada, cria a notificação correspondente
            if (dto.Status == TradeStatus.Completed)
            {
                // Criar notificação para o solicitante informando que a troca foi concluída
                await _notificationService.CreateNotification(new NotificationDTOs.NotificationRequestDTO
                {
                    UserId = trade.RequesterId,
                    Message = $"A troca foi concluída com sucesso! Você agora tem o livro solicitado. Converse com o dono do livro para realizar a troca.",
                    TradeId = trade.TradeID  // ID da troca
                });
                
                var targetBook = await _context.Books.FindAsync(trade.TargetBookId)
                                 ?? throw new InvalidOperationException(
                                     $"Livro alvo (ID {trade.TargetBookId}) não encontrado.");
                
                // Criar notificação para o dono do livro informando que a troca foi concluída
                await _notificationService.CreateNotification(new NotificationDTOs.NotificationRequestDTO
                {
                    UserId = targetBook.OwnerId,
                    Message = $"A troca foi concluída com sucesso! Converse com o solicitante para realizar a troca.",
                    TradeId = trade.TradeID  // ID da troca
                });
            }
            else if (dto.Status == TradeStatus.Rejected)
            {
                // Criar notificação para o solicitante informando que a troca foi recusada
                await _notificationService.CreateNotification(new NotificationDTOs.NotificationRequestDTO
                {
                    UserId = trade.RequesterId,
                    Message = $"Sua solicitação de troca foi recusada pelo dono do livro alvo.",
                    TradeId = trade.TradeID  // ID da troca
                });
            }
            else if (dto.Status == TradeStatus.Cancelled)
            {
                // Criar notificação para o solicitante informando que a troca foi cancelada
                await _notificationService.CreateNotification(new NotificationDTOs.NotificationRequestDTO
                {
                    UserId = trade.RequesterId,
                    Message = $"Sua solicitação de troca foi cancelada.",
                    TradeId = trade.TradeID  // ID da troca
                });
            }


            await _context.SaveChangesAsync();
            var full = await _context.Trades
                .Include(t => t.OfferedBook)
                .Include(t => t.TargetBook)
                .Include(t => t.Requester)
                .FirstOrDefaultAsync(t => t.TradeID == trade.TradeID);

            return MapToDTO(full!);
        }
        
        private static TradeDTOs.TradeResponseDTO MapToDTO(Trade trade)
        {
            return new TradeDTOs.TradeResponseDTO
            {
                TradeId       = trade.TradeID,
                RequesterId   = trade.RequesterId,
                OfferedBookId = trade.OfferedBookId,
                TargetBookId  = trade.TargetBookId,
                CreatedAt     = trade.CreatedAt,
                UpdatedAt     = trade.UpdatedAt,
                Status        = trade.Status,

                // Mapeia os nested DTOs usando as entidades carregadas
                OfferedBook = new BookDTOs.BookResponseDTO
                {
                    BookId           = trade.OfferedBook.BookId,
                    OwnerId          = trade.OfferedBook.OwnerId,
                    Title            = trade.OfferedBook.Title,
                    Author           = trade.OfferedBook.Author,
                    Genre            = trade.OfferedBook.Genre,
                    Publisher        = trade.OfferedBook.Publisher,
                    Pages            = trade.OfferedBook.Pages,
                    Year             = trade.OfferedBook.Year,
                    Sinopse          = trade.OfferedBook.Sinopse,
                    RegistrationDate = trade.OfferedBook.RegistrationDate,
                    IsAvailable      = trade.OfferedBook.IsAvaiable
                },
                TargetBook = new BookDTOs.BookResponseDTO
                {
                    BookId           = trade.TargetBook.BookId,
                    OwnerId          = trade.TargetBook.OwnerId,
                    Title            = trade.TargetBook.Title,
                    Author           = trade.TargetBook.Author,
                    Genre            = trade.TargetBook.Genre,
                    Publisher        = trade.TargetBook.Publisher,
                    Pages            = trade.TargetBook.Pages,
                    Year             = trade.TargetBook.Year,
                    Sinopse          = trade.TargetBook.Sinopse,
                    RegistrationDate = trade.TargetBook.RegistrationDate,
                    IsAvailable      = trade.TargetBook.IsAvaiable
                },
                Requester = new UserDTOs.UserResponseDTO
                {
                    Id               = trade.Requester.Id,
                    Name             = trade.Requester.Name,
                    Email            = trade.Requester.Email,
                    Course           = trade.Requester.Course,
                    RegistrationDate = trade.Requester.RegistrationDate,
                    IsActive         = trade.Requester.IsActive
                }
            };
        }
    }
}
