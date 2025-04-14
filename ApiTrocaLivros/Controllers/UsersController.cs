using ApiTrocaLivros.Data;
using ApiTrocaLivros.DTOs;
using ApiTrocaLivros.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiTrocaLivros.Security;
using Microsoft.AspNetCore.Authorization;

namespace ApiTrocaLivros.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly JwtService _jwtService;

        public UsersController(UserService userService, JwtService jwtService)
        {
            _userService = userService;
            _jwtService = jwtService;
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] UserDTOs.LoginRequest request)
        {
            var user = await _userService.Authenticate(request.Email, request.Password);
            return user == null ? 
                Unauthorized("Username or password is incorrect.") : 
                Ok(_jwtService.GenerateToken(user));
        }
            
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Getall()
        {
            var users = await _userService.GetAll();
            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userService.Get(id);
            return Ok(user);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateUser(UserDTOs.UserRequestDTO dto)
        {
            try
            {
                var createdUser = await _userService.Create(dto);
        
                return CreatedAtAction(
                    nameof(GetUserById), 
                    new { id = createdUser.Id }, 
                    createdUser);
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
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocorreu um erro interno");
            }
        }
        
        [HttpPatch("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] UserDTOs.ResetPasswordWithOldDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (dto.NewPassword != dto.ConfirmNewPassword)
                    return BadRequest("As senhas não coincidem.");

                await _userService.ResetPassword(dto.Email, dto.CurrentPassword, dto.NewPassword);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro interno no servidor");
            }
        }
        
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(int id, UserDTOs.UpdateUserDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await _userService.Update(id, dto);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (DbUpdateException ex)
            {
                // Log the error if needed
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao atualizar no banco de dados");
            }
            catch (Exception ex)
            {
                // Log the unexpected error
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro interno no servidor");
            }
        }   
        
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                await _userService.Delete(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao deletar usuário");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro interno no servidor");
            }
        }
        
    }
    
}