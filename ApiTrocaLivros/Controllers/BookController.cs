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
    [Route(template:"api/books")]
    public class BookController : ControllerBase
    {
        private readonly BookService _bookService;
        private readonly JwtService _jwtService;

        public BookController(BookService bookService, JwtService jwtService)
        {
            _bookService = bookService;
            _jwtService = jwtService;
        }
        
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetBookById(int id)
        {
            var book = await _bookService.Get(id);
            return Ok(book);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult> CreateBook(BookDTOs.BookRequestDTO dto)
        {
            try
            {
                var createdBook = await _bookService.Create(dto);

                return CreatedAtAction(
                    nameof(GetBookById),
                    routeValues: new { id = createdBook.BookId },
                    createdBook);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocorreu um erro interno");
            }
        }
    }
}
