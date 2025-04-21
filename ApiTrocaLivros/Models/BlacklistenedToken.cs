// Models/BlacklistedToken.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiTrocaLivros.Models
{
    [Table("blacklisted_tokens")]
    public class BlacklistedToken
    {
        [Key]
        [StringLength(200)]
        public string Jti { get; set; }

        public DateTime RevokedAt { get; set; } = DateTime.UtcNow;
    }
}