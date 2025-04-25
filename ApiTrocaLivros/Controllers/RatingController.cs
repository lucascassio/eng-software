using ApiTrocaLivros.DTOs;
using ApiTrocaLivros.Services;
using ApiTrocaLivros.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ApiTrocaLivros.Controllers
{
    [ApiController]
    [Route("api/ratings")]
    [Authorize]
    public class RatingController : ControllerBase
    {
        private readonly RatingService _ratingService;
        private readonly JwtService _jwtService;

        public RatingController(RatingService ratingService, JwtService jwtService)
        {
            _ratingService = ratingService;
            _jwtService = jwtService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RatingDTOs.RatingRequestDTO dto)
        {
            try
            {
                var evaluatorUserId = _jwtService.GetUserIdFromToken(User);
                
                var createdRating = await _ratingService.Create(dto, evaluatorUserId);
                return CreatedAtAction(nameof(GetById), new { id = createdRating.RatingId }, createdRating);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Ocorreu um erro interno");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var rating = await _ratingService.Get(id);
                return Ok(rating);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "Ocorreu um erro interno");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            try
            {
                var ratings = await _ratingService.GetUserRatings(userId);
                return Ok(ratings);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "Ocorreu um erro interno");
            }
        }

        [HttpGet("my-ratings")]
        public async Task<IActionResult> GetMyRatings()
        {
            try
            {
                var userId = _jwtService.GetUserIdFromToken(User);
                var ratings = await _ratingService.GetUserRatings(userId);
                return Ok(ratings);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "Ocorreu um erro interno");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] RatingDTOs.RatingUpdateDTO dto)
        {
            try
            {
                var userId = _jwtService.GetUserIdFromToken(User);
                var updatedRating = await _ratingService.Update(id, dto, userId);
                return Ok(updatedRating);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "Ocorreu um erro interno");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userId = _jwtService.GetUserIdFromToken(User);
                await _ratingService.Delete(id, userId);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "Ocorreu um erro interno");
            }
        }
    }
}