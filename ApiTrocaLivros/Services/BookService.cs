using System.IdentityModel.Tokens.Jwt; // Para JwtRegisteredClaimNames
using Microsoft.EntityFrameworkCore;
using ApiTrocaLivros.Data;
using ApiTrocaLivros.DTOs;
using ApiTrocaLivros.Models;

namespace ApiTrocaLivros.Services;

public class BookService
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BookService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }
    
    // Método auxiliar que extrai o ID do usuário autenticado a partir do token JWT
    private int GetCurrentUserId()
    {
        // O claim "sub" (subject) foi usado no JwtService para armazenar o User.Id
        var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Sub);
        if (userIdClaim == null)
            throw new Exception("Usuário não autenticado");

        return int.Parse(userIdClaim.Value);
    }

    public async Task<BookDTOs.BookResponseDTO> Create(BookDTOs.BookRequestDTO dto)
    {
        var ownerId = GetCurrentUserId();
        if (await _context.Books.AnyAsync(b => b.Title == dto.Title && b.OwnerId == ownerId))
            throw new InvalidOperationException("Você já registrou esse livro!");

        var book = new Book
        {
            OwnerId = ownerId,
            Title = dto.Title,
            Author = dto.Author,
            Genre = dto.Genre,
            Publisher = dto.Publisher,
            Pages = dto.Pages,
            Year = dto.Year,
            Sinopse = dto.Sinopse,
            RegistrationDate = DateTime.UtcNow,
            IsAvaiable = true
        };
        
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        
        return MapToDTO(book);
    }

    public async Task<BookDTOs.BookResponseDTO> Get(int id)
    {
        var book = await _context.Books.FindAsync(id);
        return book == null ? null : MapToDTO(book);
    }
    
    private static BookDTOs.BookResponseDTO MapToDTO(Book book)
    {
        return new BookDTOs.BookResponseDTO
        {
            BookId = book.BookId,
            OwnerId = book.OwnerId,
            Title = book.Title,
            Author = book.Author,
            Genre = book.Genre,
            Publisher = book.Publisher,
            Pages = book.Pages,
            Year = book.Year,
            Sinopse = book.Sinopse,
            RegistrationDate = book.RegistrationDate,
            IsAvailable = book.IsAvaiable
        };
    }
}