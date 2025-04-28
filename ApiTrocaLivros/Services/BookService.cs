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
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null || !user.Identity.IsAuthenticated)
                throw new Exception("Usuário não autenticado");

            var idClaim = user.FindFirst(JwtRegisteredClaimNames.Sub)
                          ?? user.FindFirst(ClaimTypes.NameIdentifier);

            if (idClaim == null)
                throw new Exception("Usuário não autenticado");

            return int.Parse(idClaim.Value);
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
            if (book == null)
            {
                throw new KeyNotFoundException("Nenhum livro com esse id foi encontrado.");
            }
            return MapToDTO(book);
        }

        public async Task<List<BookDTOs.BookResponseDTO>> GetAllBooks()
        {
            var books = await _context.Books
                .Select(b => MapToDTO(b))
                .ToListAsync();

            if (!books.Any())
                throw new KeyNotFoundException("Nenhum livro cadastrado no sistema.");

            return books;
        }

        public async Task<List<BookDTOs.BookResponseDTO>> GetAllBooksByGenre(string genre)
        {
            var normalized = genre.Standardize();
            var all = await _context.Books.ToListAsync();

            var books = all
                .Where(b => b.Genre.Standardize() == normalized)
                .Select(b => MapToDTO(b))
                .ToList();

            if (!books.Any())
                throw new KeyNotFoundException($"Nenhum livro encontrado com o gênero '{genre}'.");

            return books;
        }
        
        public async Task<List<BookDTOs.BookResponseDTO>> GetAllBooksByAuthor(string author)
        {
            var normalized = author.Standardize();
            var all = await _context.Books.ToListAsync();

            var books = all
                .Where(b => b.Author.Standardize() == normalized)
                .Select(b => MapToDTO(b))
                .ToList();

            if (!books.Any())
                throw new KeyNotFoundException($"Nenhum livro encontrado com o autor '{author}'.");

            return books;
        }
        
        public async Task<List<BookDTOs.BookResponseDTO>> GetAllBooksByPublisher(string publisher)
        {
            var normalized = publisher.Standardize();
            var all = await _context.Books.ToListAsync();

            var books = all
                .Where(b => b.Publisher.Standardize() == normalized)
                .Select(b => MapToDTO(b))
                .ToList();

            if (!books.Any())
                throw new KeyNotFoundException($"Nenhum livro encontrado com a editora '{publisher}'.");

            return books;
        }
        
        public async Task<List<BookDTOs.BookResponseDTO>> GetByUserId(int userId)
        {
            var books = await _context.Books
                .Where(b => b.OwnerId == userId)
                .Select(b => MapToDTO(b))
                .ToListAsync();

            if (!books.Any())
                throw new KeyNotFoundException($"Nenhum livro encontrado para o usuário com ID '{userId}'.");

            return books;
        }

        public async Task<List<BookDTOs.BookResponseDTO>> GetAllBooksByYear(int year)
        {
            var all = await _context.Books.ToListAsync();

            var books = all
                .Where(b => b.Year == year)
                .Select(b => MapToDTO(b))
                .ToList();

            if (!books.Any())
                throw new KeyNotFoundException($"Nenhum livro encontrado para o ano '{year}'.");

            return books;
        }
        
        public async Task<List<BookDTOs.BookResponseDTO>> GetBookByTitle(string title)
        {
            var normalized = title.Standardize();
            var all = await _context.Books.ToListAsync();

            var books = all
                .Where(b => b.Title.Standardize() == normalized)
                .Select(b => MapToDTO(b))
                .ToList();

            if (!books.Any())
                throw new KeyNotFoundException($"Nenhum livro encontrado com o título '{title}'.");

            return books;
        }

        public async Task<BookDTOs.BookResponseDTO> Update(int id, BookDTOs.BookUpdateRequestDTO dto)
        {
            // 1) encontra o livro (já em SQL puro)
            var book = await _context.Books.FindAsync(id)
                       ?? throw new KeyNotFoundException($"Livro com ID '{id}' não encontrado.");

            // 2) carrega TODOS os livros do mesmo dono (ou apenas os demais) para validação de duplicados
            var ownerId = GetCurrentUserId();
            var otherBooks = await _context.Books
                .Where(b => b.OwnerId == ownerId && b.BookId != id)
                .ToListAsync();  // <-- aqui executa no banco

            // 3) para cada campo alterável, se vier não-nulo, padroniza e valida em memória
            if (dto.Title is not null)
            {
                var newTitleNorm = dto.Title.Standardize();
                if (otherBooks.Any(b => b.Title.Standardize() == newTitleNorm))
                    throw new InvalidOperationException($"Você já registrou outro livro com o título '{dto.Title}'.");
                book.Title = dto.Title;
            }

            if (dto.Author is not null)
                book.Author = dto.Author;
            
            if (dto.Genre is not null)
                book.Genre = dto.Genre;
            
            if (dto.Publisher is not null)
                book.Publisher = dto.Publisher;
            
            if (dto.Pages.HasValue)
                book.Pages = dto.Pages.Value;

            if (dto.Year.HasValue)
                book.Year = dto.Year.Value;

            if (dto.Sinopse is not null)
                book.Sinopse = dto.Sinopse;

            if (dto.IsAvailable.HasValue)
                book.IsAvaiable = dto.IsAvailable.Value;

            // 4) persiste as alterações
            await _context.SaveChangesAsync();

            return MapToDTO(book);
        }

        public async Task Delete(int id)
        {
            var book = await _context.Books.FindAsync(id)
                       ?? throw new KeyNotFoundException($"Livro com ID '{id}' não encontrado.");
            
            try
            {
                _context.Books.Remove(book);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new Exception("Falha ao deletar livro no banco de dados", ex);
            }
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
}