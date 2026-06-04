using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyLink.Backend.Data;
using StudyLink.Backend.Models;

namespace StudyLink.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var user = await _context.Utenti
                .Include(u => u.CommentiRicevuti)
                    .ThenInclude(c => c.Mittente)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound("Utente non trovato.");

            var profile = new
            {
                user.Id,
                user.Nome,
                user.Cognome,
                user.Email,
                user.CorsoDiStudi,
                user.Biografia,
                user.Immagine,
                CommentiRicevuti = user.CommentiRicevuti.Select(c => new
                {
                    c.Id,
                    c.Testo,
                    c.Valutazione,
                    c.Data,
                    MittenteNome = c.Mittente.Nome + " " + c.Mittente.Cognome
                })
            };

            return Ok(profile);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserProfile(int id)
        {
            var user = await _context.Utenti
                .Include(u => u.CommentiRicevuti)
                    .ThenInclude(c => c.Mittente)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound("Utente non trovato.");

            var profile = new
            {
                user.Id,
                user.Nome,
                user.Cognome,
                user.CorsoDiStudi,
                user.Biografia,
                user.Immagine,
                CommentiRicevuti = user.CommentiRicevuti.Select(c => new
                {
                    c.Id,
                    c.Testo,
                    c.Valutazione,
                    c.Data,
                    MittenteNome = c.Mittente.Nome + " " + c.Mittente.Cognome
                })
            };

            return Ok(profile);
        }

        public class UpdateProfileDto
        {
            public string CorsoDiStudi { get; set; }
            public string Biografia { get; set; }
            public string? Immagine { get; set; }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var user = await _context.Utenti.FindAsync(userId);
            if (user == null) return NotFound("Utente non trovato.");

            user.CorsoDiStudi = dto.CorsoDiStudi;
            user.Biografia = dto.Biografia;
            if (dto.Immagine != null) user.Immagine = dto.Immagine;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Profilo aggiornato con successo." });
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteProfile()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var user = await _context.Utenti.FindAsync(userId);
            if (user == null) return NotFound("Utente non trovato.");

            _context.Utenti.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Profilo eliminato con successo." });
        }
    }
}
