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
    [Route(template: "api/trades")]
    public class TradeController : ControllerBase
    {
        private readonly TradeService _tradeService;
        private readonly JwtService _jwtService;
        private readonly ILogger<TradeController> _logger;

        public TradeController(TradeService tradeService, JwtService jwtService, ILogger<TradeController> logger)
        {
            _tradeService = tradeService;
            _jwtService = jwtService;
            _logger = logger;
        }

        /// <summary>
        /// Obtém os detalhes de uma troca específica.
        /// </summary>
        /// <param name="id">ID da troca.</param>
        /// <returns>Detalhes da troca.</returns>
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var trade = await _tradeService.Get(id);
                return Ok(trade);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Troca com ID {Id} não encontrada.", id);
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter troca com ID {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Erro interno no servidor." });
            }
        }

        /// <summary>
        /// Cria uma nova troca.
        /// </summary>
        /// <param name="dto">Dados da troca a ser criada.</param>
        /// <returns>Troca criada.</returns>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateTrade([FromBody] TradeDTOs.TradeRequestDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { Message = "Dados inválidos.", Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)) });
                }

                var created = await _tradeService.Create(dto);
                return CreatedAtAction(nameof(Get), new { id = created.TradeId }, created);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Erro ao criar troca: {Message}", ex.Message);
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Erro de autorização ao criar troca: {Message}", ex.Message);
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Erro de validação ao criar troca: {Message}", ex.Message);
                return BadRequest(new { Message = ex.Message });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Erro ao salvar troca no banco de dados.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Erro ao salvar no banco de dados." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao criar troca.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Erro interno no servidor." });
            }
        }

        /// <summary>
        /// Lista todas as trocas solicitadas pelo usuário autenticado.
        /// </summary>
        [HttpGet("requester")]
        [Authorize]
        public async Task<IActionResult> GetMyRequests()
        {
            try
            {
                var trades = await _tradeService.GetAllByRequesterId();
                return Ok(trades);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Nenhuma troca solicitada encontrada para o usuário.");
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao listar trocas solicitadas.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Erro interno no servidor." });
            }
        }

        /// <summary>
        /// Lista todas as solicitações de troca recebidas para os livros do usuário autenticado.
        /// </summary>
        [HttpGet("received")]
        [Authorize]
        public async Task<IActionResult> GetReceivedRequests()
        {
            try
            {
                var trades = await _tradeService.GetAllReceivedRequests();
                return Ok(trades); // Sempre retorna 200, mesmo com lista vazia
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao listar solicitações de troca recebidas.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Erro interno no servidor." });
            }
        }
        /// <summary>
        /// Atualiza os detalhes de uma troca.
        /// </summary>
        /// <param name="id">ID da troca a ser atualizada.</param>
        /// <param name="dto">Dados da atualização.</param>
        /// <returns>Troca atualizada.</returns>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateTrade(int id, [FromBody] TradeDTOs.TradeUpdateDTO dto)
        {
            try
            {
                var updated = await _tradeService.Update(id, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Troca com ID {Id} não encontrada para atualização.", id);
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                _logger.LogWarning("Usuário não autorizado a atualizar troca com ID {Id}.", id);
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Erro de validação ao atualizar troca com ID {Id}: {Message}", id, ex.Message);
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar troca com ID {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Erro interno no servidor." });
            }
        }
        
        // Adicione esta classe no namespace ApiTrocaLivros.DTOs
        public class StatusUpdateDTO
        {
            public string Status { get; set; }
        }

        [HttpPatch("{id}/status")]
        [Authorize]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] StatusUpdateDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { Message = "Dados inválidos. O corpo da requisição não pode ser nulo." });
                }

                if (string.IsNullOrWhiteSpace(dto.Status))
                {
                    return BadRequest(new { Message = "O novo status é obrigatório." });
                }

                _logger.LogInformation("Recebida solicitação para alterar status da troca {TradeId} para {Status}", id, dto.Status);

                var updated = await _tradeService.ChangeStatus(id, dto.Status);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Troca com ID {Id} não encontrada para alteração de status.", id);
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Usuário não autorizado a alterar o status da troca com ID {Id}: {Message}", id, ex.Message);
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Status inválido fornecido para troca com ID {Id}: {Status}", id, dto?.Status);
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Erro ao alterar status da troca com ID {Id}: {Message}", id, ex.Message);
                return Conflict(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao alterar status da troca com ID {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Erro interno no servidor." });
            }
        }

        
    }
}