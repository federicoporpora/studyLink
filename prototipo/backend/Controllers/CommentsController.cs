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
    public class CommentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class CreateCommentDto
        {
            public int DestinatarioId { get; set; }
            public string Testo { get; set; }
            public int Valutazione { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CreateComment([FromBody] CreateCommentDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            if (userId == dto.DestinatarioId) return BadRequest("Non puoi commentare te stesso.");

            var destinatario = await _context.Utenti.FindAsync(dto.DestinatarioId);
            if (destinatario == null) return NotFound("Destinatario non trovato.");

            // Check if they shared a past event
            var sharedPastEvent = await _context.Prenotazioni
                .Where(p => p.UtenteId == userId)
                .Select(p => p.Evento)
                .Where(e => e.Data.Add(e.Orario) < DateTime.UtcNow)
                .AnyAsync(e => e.Prenotazioni.Any(p2 => p2.UtenteId == dto.DestinatarioId));

            if (!sharedPastEvent)
            {
                return BadRequest("Puoi commentare solo gli utenti con cui hai partecipato a un evento che si è già concluso.");
            }

            var commento = new Commento
            {
                MittenteId = userId,
                DestinatarioId = dto.DestinatarioId,
                Testo = dto.Testo,
                Valutazione = dto.Valutazione,
                Data = DateTime.UtcNow
            };

            _context.Commenti.Add(commento);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Commento aggiunto con successo." });
        }
    }
}
