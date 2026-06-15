using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudyLink.Api.Data;
using StudyLink.Api.DTOs;
using StudyLink.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StudyLink.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly StudyLinkDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(StudyLinkDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto request)
        {
            if (await _context.Utenti.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Email già registrata.");
            }

            // Simplified password hashing for prototype
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var utente = new Utente
            {
                Email = request.Email,
                Password = passwordHash,
                Profilo = new Profilo
                {
                    Nome = request.Nome,
                    Cognome = request.Cognome
                }
            };

            _context.Utenti.Add(utente);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(utente);
            return Ok(new AuthResponseDto { Token = token, UserId = utente.Id });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto request)
        {
            var utente = await _context.Utenti.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (utente == null || !BCrypt.Net.BCrypt.Verify(request.Password, utente.Password))
            {
                return Unauthorized("Email o password errati.");
            }

            var token = GenerateJwtToken(utente);
            return Ok(new AuthResponseDto { Token = token, UserId = utente.Id });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var utente = await _context.Utenti.FindAsync(userId);
            if (utente == null || !BCrypt.Net.BCrypt.Verify(request.OldPassword, utente.Password))
            {
                return BadRequest("La vecchia password non è corretta.");
            }

            utente.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password aggiornata" });
        }

        [HttpDelete("delete-account")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var utente = await _context.Utenti
                .Include(u => u.Profilo)
                .Include(u => u.EventiOrganizzati)
                .Include(u => u.Prenotazioni)
                .Include(u => u.Messaggi)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (utente == null) return NotFound();

            // Handle manual deletions due to Restrict behavior
            _context.Prenotazioni.RemoveRange(utente.Prenotazioni);
            _context.Messaggi.RemoveRange(utente.Messaggi);
            
            // Per eventi organizzati da me, eliminiamo anche le loro prenotazioni e messaggi
            foreach(var evt in utente.EventiOrganizzati) {
                var evtFull = await _context.Eventi.Include(e => e.Prenotazioni).Include(e => e.Messaggi).FirstOrDefaultAsync(e => e.Id == evt.Id);
                if(evtFull != null) {
                    _context.Prenotazioni.RemoveRange(evtFull.Prenotazioni);
                    _context.Messaggi.RemoveRange(evtFull.Messaggi);
                    _context.Eventi.Remove(evtFull);
                }
            }

            if (utente.Profilo != null) _context.Profili.Remove(utente.Profilo);
            
            _context.Utenti.Remove(utente);
            
            await _context.SaveChangesAsync();

            return Ok();
        }

        private string GenerateJwtToken(Utente utente)
        {
            var keyStr = _configuration["Jwt:Key"] ?? "fallback_secret_key_needs_to_be_long_enough!";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, utente.Id.ToString()),
                new Claim(ClaimTypes.Email, utente.Email)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
