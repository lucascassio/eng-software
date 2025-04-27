using ApiTrocaLivros.Data;
using ApiTrocaLivros.DTOs;
using ApiTrocaLivros.Models;
using ApiTrocaLivros.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiTrocaLivros.Security;
using Microsoft.AspNetCore.Authorization;

namespace ApiTrocaLivros.Controllers
{
    [ApiController]
    [Route(template:"api/notifications")]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService;
        private readonly JwtService _jwtService;

        public NotificationController(NotificationService notificationService, JwtService jwtService)
        {
            _notificationService = notificationService;
            _jwtService = jwtService;
        }

        [HttpGet("get-notifications")]
        [Authorize]
        public async Task<IActionResult> GetUserNotifications()
        {
            var notifications = await _notificationService.GetUserNotifications();
            if (!notifications.Any())
            {
                return NoContent();
            }
            
            return Ok(notifications);
        }

        [HttpPut("{id}/mark-as-read")]
        [Authorize]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                await _notificationService.MarkNotificationAsRead((id));
                return Ok(new { message = "Notificação marcada como lida." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Notificação não encontrada");
            }
        }

        [HttpDelete("{id}/delete")]
        [Authorize]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                await _notificationService.DeleteNotification(id);
                return Ok(new { message = "Notificação deletada com sucesso." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Notificação não encontrada");
            }
        }
    }
}