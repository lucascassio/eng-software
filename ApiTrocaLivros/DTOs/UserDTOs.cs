using System.ComponentModel.DataAnnotations;

namespace ApiTrocaLivros.DTOs;
public class UserDTOs
{
    public class UserRequestDTO
    {
        [Required]
        public string Name { get; set; }
        
        [Required, EmailAddress]
        public string Email { get; set; }
        
        [Required]
        public string Course { get; set; }
        
        [Required, MinLength(6)]
        public string Password { get; set; }
    }

    public class UpdateUserDTO
    {
        [Required]
        public string Name { get; set; }
        
        [Required, EmailAddress]
        public string Email { get; set; }
        
        [Required]
        public string Course { get; set; }
    }

    public class UserResponseDTO {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Course { get; set; }
        public DateTime RegistrationDate { get; set; }
        public bool IsActive { get; set; }
    }
}