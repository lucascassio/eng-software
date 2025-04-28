using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ApiTrocaLivros.Data;
using ApiTrocaLivros.DTOs;
using ApiTrocaLivros.Models;
using ApiTrocaLivros.Functions;
using System.IdentityModel.Tokens.Jwt;

namespace ApiTrocaLivros.Services
{
    public class NotificationService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public NotificationService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
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

        public async Task<NotificationDTOs.NotificationResponseDTO> CreateNotification(NotificationDTOs.NotificationRequestDTO dto)
        {
            var notification = new Notification
            {
                UserId = dto.UserId,
                Message = dto.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                TradeId = dto.TradeId,
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            
            return MapToDTO(notification);
        }

        public async Task<List<NotificationDTOs.NotificationResponseDTO>> GetUserNotifications(int pageNumber = 1, int pageSize = 10)
        {
            var userId = GetCurrentUserId();
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)  // Skip para paginação
                .Take(pageSize)  // Limita o número de registros
                .ToListAsync();
            
            if (!notifications.Any())
                throw new KeyNotFoundException("Você não possui notificações.");

            return notifications.Select(n => new NotificationDTOs.NotificationResponseDTO
            {
                NotificationId = n.NotificationId,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                TradeId = n.TradeId,
            }).ToList();
        }
        
        public async Task MarkNotificationAsRead(int notificationId)
        {
            var userId = GetCurrentUserId();
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

            if (notification == null)
                throw new KeyNotFoundException("Notificação não encontrada.");
            
            if (notification.IsRead)
                throw new InvalidOperationException("A notificação já foi marcada como lida.");

            notification.IsRead = true;
            await _context.SaveChangesAsync();
        }

        
        public async Task DeleteNotification(int notificationId)
        {
            var userId = GetCurrentUserId();
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

            if (notification == null)
                throw new KeyNotFoundException("Notificação não encontrada.");

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
        }

        
        private static NotificationDTOs.NotificationResponseDTO MapToDTO(Notification notification)
        {
            return new NotificationDTOs.NotificationResponseDTO
            {
                NotificationId = notification.NotificationId,
                Message = notification.Message,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                TradeId = notification.TradeId,
            };
        }
    }
}