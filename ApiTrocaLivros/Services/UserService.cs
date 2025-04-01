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

        public async Task<UserDTOs.UserResponseDTO> Create(UserDTOs.CreateUserDTO dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                throw new Exception("Email já está em uso");

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
            var user = await _context.Users.FindAsync(id);
            if (user == null) throw new Exception("Usuário não encontrado");

            if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id))
                throw new Exception("Email já está em uso");

            user.Name = dto.Name;
            user.Email = dto.Email;
            user.Course = dto.Course;

            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) throw new Exception("Usuário não encontrado");

            _context.Users.Remove(user);
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