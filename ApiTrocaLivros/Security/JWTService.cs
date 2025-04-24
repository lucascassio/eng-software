using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ApiTrocaLivros.DTOs;
using ApiTrocaLivros.Data;
using ApiTrocaLivros.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
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
            // Carrega variáveis de ambiente do .env
            var envFilePath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
            Env.Load(envFilePath);

            // Lê configuração
            string? secretKey   = Env.GetString("JWT_SECRET_KEY");
            string? issuer      = Env.GetString("JWT_ISSUER");
            string? audience    = Env.GetString("JWT_AUDIENCE");
            int?    expiryMins  = Env.GetInt("JWT_EXPIRY_MINUTES");

            if (string.IsNullOrWhiteSpace(secretKey))
                throw new ArgumentNullException("JWT_SECRET_KEY não configurada no .env");

            _securityKey   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            _issuer        = issuer      ?? "ApiTrocaLivros";
            _audience      = audience    ?? "client";
            _expiryMinutes = expiryMins  ?? 60;
        }

        public string GenerateToken(UserDTOs.UserResponseDTO user)
        {
            var handler = new JwtSecurityTokenHandler();
            
            // Cria claims, incluindo um JTI (Token ID) único para revogação
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),  // <— adicionado
                new Claim(JwtRegisteredClaimNames.Name, user.Name),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("course", user.Course),
                new Claim("registrationDate", user.RegistrationDate.ToString("O")),
                new Claim("isActive", user.IsActive.ToString())
            };

            var descriptor = new SecurityTokenDescriptor
            {
                Subject            = new ClaimsIdentity(claims),
                Expires            = DateTime.UtcNow.AddMinutes(_expiryMinutes),
                Issuer             = _issuer,
                Audience           = _audience,
                SigningCredentials = new SigningCredentials(_securityKey, SecurityAlgorithms.HmacSha256)
            };

            var token = handler.CreateToken(descriptor);
            return handler.WriteToken(token);
        }

        public void ConfigureJwtAuthentication(IServiceCollection services)
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                // Evita mapeamento automático de claims
                options.MapInboundClaims = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey         = _securityKey,
                    ValidateIssuer           = true,
                    ValidIssuer              = _issuer,
                    ValidateAudience         = true,
                    ValidAudience            = _audience,
                    ValidateLifetime         = true,
                    ClockSkew                = TimeSpan.Zero
                };

                // <-- Novo: verifica se o JTI está na blacklist
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async ctx =>
                    {
                        // Resgata o DbContext a partir dos serviços
                        var db  = ctx.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                        // Extrai o JTI do token
                        var jti = ctx.Principal?.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;

                        // Se não há JTI ou ele está revogado, falha na validação
                        if (string.IsNullOrEmpty(jti) ||
                            await db.BlacklistedTokens.AnyAsync(b => b.Jti == jti))
                        {
                            ctx.Fail("Token revogado");
                        }
                    }
                };
            });
        }
        
        public int GetUserIdFromToken(ClaimsPrincipal userPrincipal)
        {
            var userIdClaim = userPrincipal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
    
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Token inválido ou sem ID de usuário.");
            }
    
            return userId;
        }

        public UserDTOs.UserResponseDTO? ExtractUserFromToken(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var principal = handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey         = _securityKey,
                    ValidateIssuer           = true,
                    ValidIssuer              = _issuer,
                    ValidateAudience         = true,
                    ValidAudience            = _audience,
                    ValidateLifetime         = true,
                    ClockSkew                = TimeSpan.Zero
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
            var list = claims.ToList();
            return new UserDTOs.UserResponseDTO
            {
                Id               = int.Parse(list.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value),
                Name             = list.First(c => c.Type == JwtRegisteredClaimNames.Name).Value,
                Email            = list.First(c => c.Type == JwtRegisteredClaimNames.Email).Value,
                Course           = list.First(c => c.Type == "course").Value,
                RegistrationDate = DateTime.Parse(list.First(c => c.Type == "registrationDate").Value),
                IsActive         = bool.Parse(list.First(c => c.Type == "isActive").Value)
            };
        }
        
        
    }
}
