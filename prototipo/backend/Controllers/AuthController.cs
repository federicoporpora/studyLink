using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudyLink.Backend.Data;
using StudyLink.Backend.DTOs;
using StudyLink.Backend.Models;

namespace StudyLink.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (!dto.Email.EndsWith(".edu") && !dto.Email.EndsWith(".it")) // basic institutional check
                return BadRequest("Solo le email universitarie sono ammesse.");

            if (await _context.Utenti.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email già in uso.");

            // Basic hashing for demo purposes. Use BCrypt in production.
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var utente = new Utente
            {
                Email = dto.Email,
                PasswordHash = passwordHash,
                Nome = dto.Nome,
                Cognome = dto.Cognome
            };

            _context.Utenti.Add(utente);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Registrazione completata con successo." });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            var utente = await _context.Utenti.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (utente == null || !BCrypt.Net.BCrypt.Verify(dto.Password, utente.PasswordHash))
                return Unauthorized("Email o password non validi.");

            var token = GenerateJwtToken(utente);

            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = utente.Id,
                Email = utente.Email,
                Nome = utente.Nome,
                Cognome = utente.Cognome
            });
        }

        private string GenerateJwtToken(Utente utente)
        {
            var jwtKey = _configuration["JWT:Key"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, utente.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, utente.Email),
                new Claim(ClaimTypes.Name, utente.Nome)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
