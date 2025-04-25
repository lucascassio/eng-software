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

        public TradeController(TradeService tradeService, JwtService jwtService)
        {
            _tradeService = tradeService;
            _jwtService = jwtService;
        }

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
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateTrade([FromBody] TradeDTOs.TradeRequestDTO dto)
        {
            try
            {
                var created = await _tradeService.Create(dto);
                return CreatedAtAction(nameof(Get), new { id = created.TradeId }, created);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // Lista todas as trocas que o usuário autenticado solicitou
        [HttpGet("requester")]
        [Authorize]
        public async Task<IActionResult> GetMyRequests()
        {
            try
            {
                var trades = await _tradeService.GetAllByRequesterId(default);
                return Ok(trades);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // Lista todas as solicitações recebidas para os livros do usuário autenticado
        [HttpGet("received")]
        [Authorize]
        public async Task<IActionResult> GetReceivedRequests()
        {
            try
            {
                var trades = await _tradeService.GetAllReceivedRequests();
                return Ok(trades);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // Atualiza detalhes da troca (livros ofertado/solicitado)
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
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // Altera o status da troca (aceitar, recusar, cancelar, concluir)
        [HttpPatch("{id}/status")]
        [Authorize]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] TradeDTOs.ChangeTradeStatusDTO dto)
        {
            try
            {
                var updated = await _tradeService.ChangeStatus(id, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

    }
}