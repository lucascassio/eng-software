using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ApiTrocaLivros.DTOs;
using Microsoft.IdentityModel.Tokens;
using DotNetEnv;

namespace ApiTrocaLivros.Security
{

    public class JwtService
    {
        private readonly SymmetricSecurityKey _securityKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _expiryMinutes;

        public JwtService()
        {
            var envFilePath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
            Env.Load(envFilePath);

            // Get JWT configuration - using proper null checks
            string? secretKey = Env.GetString("JWT_SECRET_KEY");
            string? issuer = Env.GetString("JWT_ISSUER");
            string? audience = Env.GetString("JWT_AUDIENCE");
            int? expiryMinutes = Env.GetInt("JWT_EXPIRY_MINUTES");

            // Validate required configuration
            if (string.IsNullOrWhiteSpace(secretKey))
                throw new ArgumentNullException("JWT_SECRET_KEY", "JWT secret key is not configured in .env file");

            _securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            _issuer = issuer ?? "ApiTrocaLivros";  // Default value if null
            _audience = audience ?? "client";      // Default value if null
            _expiryMinutes = expiryMinutes ?? 60; // Default value if null
        }

        public string GenerateToken(UserDTOs.UserResponseDTO user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(CreateClaims(user)),
                Expires = DateTime.UtcNow.AddMinutes(_expiryMinutes),
                Issuer = _issuer,
                Audience = _audience,
                SigningCredentials = new SigningCredentials(_securityKey, SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private static Claim[] CreateClaims(UserDTOs.UserResponseDTO user) => new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, user.Name),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("course", user.Course),
            new Claim("registrationDate", user.RegistrationDate.ToString("O")),
            new Claim("isActive", user.IsActive.ToString())
        };

        public UserDTOs.UserResponseDTO? ExtractUserFromToken(string token)
        {
            try
            {
                var principal = new JwtSecurityTokenHandler().ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = _securityKey,
                    ValidateIssuer = true,
                    ValidIssuer = _issuer,
                    ValidateAudience = true,
                    ValidAudience = _audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out _);

                return principal.Claims.ToUserResponseDto();
            }
            catch
            {
                return null;
            }
        }
    }

    public static class ClaimsExtensions
    {
        public static UserDTOs.UserResponseDTO ToUserResponseDto(this IEnumerable<Claim> claims)
        {
            var claimList = claims.ToList();
            return new UserDTOs.UserResponseDTO
            {
                Id = int.Parse(claimList.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value),
                Name = claimList.First(c => c.Type == JwtRegisteredClaimNames.Name).Value,
                Email = claimList.First(c => c.Type == JwtRegisteredClaimNames.Email).Value,
                Course = claimList.First(c => c.Type == "course").Value,
                RegistrationDate = DateTime.Parse(claimList.First(c => c.Type == "registrationDate").Value),
                IsActive = bool.Parse(claimList.First(c => c.Type == "isActive").Value)
            };
        }
    }
}