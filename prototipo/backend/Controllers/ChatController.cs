using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyLink.Backend.Data;
using System.Security.Claims;

namespace StudyLink.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChatController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{eventId}/messages")]
        public async Task<IActionResult> GetMessages(int eventId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var isParticipant = await _context.Prenotazioni.AnyAsync(p => p.EventoId == eventId && p.UtenteId == userId);
            if (!isParticipant) return Forbid();

            var chat = await _context.Chats.FirstOrDefaultAsync(c => c.EventoId == eventId);
            if (chat == null) return NotFound("Chat non trovata");

            var messages = await _context.Messaggi
                .Include(m => m.Mittente)
                .Where(m => m.ChatId == chat.Id)
                .OrderBy(m => m.DataInvio)
                .Select(m => new {
                    id = m.Id,
                    testo = m.Testo,
                    dataInvio = m.DataInvio,
                    mittenteId = m.MittenteId,
                    mittenteNome = m.Mittente.Nome + " " + m.Mittente.Cognome,
                    mittenteImmagine = m.Mittente.Immagine
                })
                .ToListAsync();

            return Ok(messages);
        }
    }
}
