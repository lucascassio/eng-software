using Microsoft.EntityFrameworkCore;
using ApiTrocaLivros.Data;
using ApiTrocaLivros.DTOs;
using ApiTrocaLivros.Models;
using BCrypt.Net;

namespace ApiTrocaLivros.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserDTOs.UserResponseDTO> Create(UserDTOs.UserRequestDTO dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                throw new InvalidOperationException("Email já está em uso");

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Course = dto.Course,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                RegistrationDate = DateTime.UtcNow,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return MapToDTO(user);
        }

        public async Task<UserDTOs.UserResponseDTO?> Get(int id)
        {
            var user = await _context.Users.FindAsync(id);
            return user == null ? null : MapToDTO(user);
        }

        public async Task<List<UserDTOs.UserResponseDTO>> GetAll()
        {
            return await _context.Users.Select(u => MapToDTO(u)).ToListAsync();
        }

        public async Task Update(int id, UserDTOs.UpdateUserDTO dto)
        {
            // 1. Validação de existência
            var user = await _context.Users.FindAsync(id);
            if (user == null) 
                throw new KeyNotFoundException($"Usuário com ID {id} não encontrado");

            // 2. Validação de e-mail duplicado
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id))
                throw new InvalidOperationException($"O email {dto.Email} já está em uso por outro usuário");

            // 3. Validação de modelo
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("Nome não pode ser vazio", nameof(dto.Name));
    
            // 4. Atualização
            user.Name = dto.Name;
            user.Email = dto.Email;
            user.Course = dto.Course;

            await _context.SaveChangesAsync();
        }
        public async Task Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new KeyNotFoundException($"Usuário com ID {id} não encontrado");

            try
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new Exception("Falha ao deletar usuário no banco de dados", ex);
            }
        }

        public async Task<User> findByEmail(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            return user;
        }
        
        private bool VerifyPassword(string plainPassword, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(plainPassword, hashedPassword);
        }
        
        public async Task ResetPassword(string email, string currentPassword, string newPassword)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
            if (user == null)
                throw new KeyNotFoundException("Usuário não encontrado.");

            if (!VerifyPassword(currentPassword, user.Password))
                throw new UnauthorizedAccessException("Senha atual incorreta.");

            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }


        private static UserDTOs.UserResponseDTO MapToDTO(User user)
        {
            return new UserDTOs.UserResponseDTO
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Course = user.Course,
                RegistrationDate = user.RegistrationDate,
                IsActive = user.IsActive
            };
        }
    }
}