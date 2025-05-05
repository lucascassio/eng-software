using ApiTrocaLivros.DTOs;
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
            try
            {
                var book = await _bookService.Get(id);
                return Ok(book);
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

        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetBooksByUserId(int userId)
        {
            try
            {
                var book = await _bookService.GetByUserId(userId);
                return Ok(book);
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

        
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllBooks()
        {
            try
            {
                var books = await _bookService.GetAllBooks();
                return Ok(books);
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

        [HttpGet("genre/{genre}")]
        [Authorize]
        public async Task<IActionResult> GetBooksByGenre(string genre)
        {
            try
            {
                var books = await _bookService.GetAllBooksByGenre(genre);
                return Ok(books);
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
        
        [HttpGet("author/{author}")]
        [Authorize]
        public async Task<IActionResult> GetBooksByAuthor(string author)
        {
            try
            {
                var books = await _bookService.GetAllBooksByAuthor(author);
                return Ok(books);
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
        
        [HttpGet("publisher/{publisher}")]
        [Authorize]
        public async Task<IActionResult> GetBooksByPublisher(string publisher)
        {
            try
            {
                var books = await _bookService.GetAllBooksByPublisher(publisher);
                return Ok(books);
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
        
        [HttpGet("year/{year}")]
        [Authorize]
        public async Task<IActionResult> GetBooksByYear(int year)
        {
            try
            {
                var books = await _bookService.GetAllBooksByYear(year);
                return Ok(books);
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

        [HttpGet("title/{title}")]
        [Authorize]
        public async Task<IActionResult> GetBookByTitle(string title)
        {
            try
            {
                var books = await _bookService.GetBookByTitle(title);
                return Ok(books);
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
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> CreateBook([FromForm] BookDTOs.BookRequestDTO dto)
        {
            try
            {
                var createdBook = await _bookService.Create(dto);
                
                if (dto.CoverImage is not null)
                {
                    await _bookService.UploadCoverImageAsync(createdBook.BookId, dto.CoverImage);
                }

                var full = await _bookService.Get(createdBook.BookId);
                        return CreatedAtAction(
                                nameof(GetBookById),
                                new { id = full.BookId },
                                full);
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
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateBook(
            int id,
            [FromForm] BookDTOs.BookUpdateRequestDTO dto)
        {
            try
            {
                // Atualiza campos + capa se houver
                var updated = await _bookService.Update(id, dto);

                // Retorna o DTO completo (já inclui CoverImageUrl)
                return Ok(updated);
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
            catch
            {
                return StatusCode(500, "Erro ao atualizar livro.");
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteBook(int id)
        {
            try
            {
                await _bookService.Delete(id);
                return Ok(new { message = "Livro deletado com sucesso." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao deletar livro.");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro interno no servidor");
            }
        }
        
    }
    
    
}