using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyLink.Backend.Data;
using StudyLink.Backend.DTOs;
using StudyLink.Backend.Models;

namespace StudyLink.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventoDto>>> GetEventi()
        {
            var dbEventi = await _context.Eventi
                .Include(e => e.Organizzatore)
                .Include(e => e.Prenotazioni)
                .ToListAsync();

            var eventi = dbEventi
                .Where(e => e.Data.Add(e.Orario) >= DateTime.UtcNow)
                .Select(e => new EventoDto
                {
                    Id = e.Id,
                    Titolo = e.Titolo,
                    Materia = e.Materia,
                    Data = e.Data,
                    Orario = e.Orario,
                    IndirizzoVia = e.IndirizzoVia,
                    IndirizzoNomeLuogo = e.IndirizzoNomeLuogo,
                    TipoDiLuogo = e.TipoDiLuogo,
                    NumeroPosti = e.NumeroPosti,
                    OrganizzatoreId = e.OrganizzatoreId,
                    OrganizzatoreNome = e.Organizzatore.Nome + " " + e.Organizzatore.Cognome,
                    NumeroPrenotazioni = e.Prenotazioni.Count
                })
                .ToList();

            return Ok(eventi);
        }

        [HttpGet("past")]
        public async Task<ActionResult<IEnumerable<EventoDto>>> GetPastEvents()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var dbEventi = await _context.Eventi
                .Include(e => e.Organizzatore)
                .Include(e => e.Prenotazioni)
                .Where(e => e.Prenotazioni.Any(p => p.UtenteId == userId))
                .ToListAsync();

            var eventi = dbEventi
                .Where(e => e.Data.Add(e.Orario) < DateTime.UtcNow)
                .Select(e => new EventoDto
                {
                    Id = e.Id,
                    Titolo = e.Titolo,
                    Materia = e.Materia,
                    Data = e.Data,
                    Orario = e.Orario,
                    IndirizzoVia = e.IndirizzoVia,
                    IndirizzoNomeLuogo = e.IndirizzoNomeLuogo,
                    TipoDiLuogo = e.TipoDiLuogo,
                    NumeroPosti = e.NumeroPosti,
                    OrganizzatoreId = e.OrganizzatoreId,
                    OrganizzatoreNome = e.Organizzatore.Nome + " " + e.Organizzatore.Cognome,
                    NumeroPrenotazioni = e.Prenotazioni.Count
                })
                .ToList();

            return Ok(eventi);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetEventoDetails(int id)
        {
            var evento = await _context.Eventi
                .Include(e => e.Organizzatore)
                .Include(e => e.Prenotazioni)
                    .ThenInclude(p => p.Utente)
                .Include(e => e.Chat)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (evento == null) return NotFound("Evento non trovato.");

            var result = new
            {
                Id = evento.Id,
                Titolo = evento.Titolo,
                Materia = evento.Materia,
                Data = evento.Data,
                Orario = evento.Orario,
                IndirizzoVia = evento.IndirizzoVia,
                IndirizzoNomeLuogo = evento.IndirizzoNomeLuogo,
                TipoDiLuogo = evento.TipoDiLuogo,
                NumeroPosti = evento.NumeroPosti,
                OrganizzatoreId = evento.OrganizzatoreId,
                OrganizzatoreNome = evento.Organizzatore.Nome + " " + evento.Organizzatore.Cognome,
                NumeroPrenotazioni = evento.Prenotazioni.Count,
                ChatId = evento.Chat?.Id,
                Partecipanti = evento.Prenotazioni.Select(p => new {
                    Id = p.Utente.Id,
                    Nome = p.Utente.Nome,
                    Cognome = p.Utente.Cognome,
                    Bio = p.Utente.Biografia,
                    DataPrenotazione = p.DataPrenotazione
                })
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<EventoDto>> CreateEvento(CreateEventoDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var eventStart = dto.Data.Add(dto.Orario);
            if (eventStart < DateTime.UtcNow)
                return BadRequest("Non puoi creare un evento nel passato.");

            var evento = new Evento
            {
                Titolo = dto.Titolo,
                Materia = dto.Materia,
                Data = DateTime.SpecifyKind(dto.Data, DateTimeKind.Utc),
                Orario = dto.Orario,
                IndirizzoVia = dto.IndirizzoVia,
                IndirizzoNomeLuogo = dto.IndirizzoNomeLuogo,
                TipoDiLuogo = dto.TipoDiLuogo,
                NumeroPosti = dto.NumeroPosti,
                OrganizzatoreId = userId
            };

            _context.Eventi.Add(evento);
            await _context.SaveChangesAsync();

            // L'organizzatore è automaticamente un partecipante
            var prenotazione = new Prenotazione
            {
                EventoId = evento.Id,
                UtenteId = userId,
                DataPrenotazione = DateTime.UtcNow
            };
            _context.Prenotazioni.Add(prenotazione);

            // Viene creata una chat associata all'evento
            var chat = new Chat
            {
                EventoId = evento.Id
            };
            _context.Chats.Add(chat);
            
            await _context.SaveChangesAsync();

            return Ok(evento);
        }

        [HttpPost("{id}/prenota")]
        public async Task<IActionResult> PrenotaEvento(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var evento = await _context.Eventi.Include(e => e.Prenotazioni).FirstOrDefaultAsync(e => e.Id == id);
            if (evento == null) return NotFound("Evento non trovato.");

            if (evento.NumeroPosti > 0 && evento.Prenotazioni.Count >= evento.NumeroPosti)
                return BadRequest("Posti esauriti.");

            if (evento.Prenotazioni.Any(p => p.UtenteId == userId))
                return BadRequest("Sei già prenotato a questo evento.");

            var prenotazione = new Prenotazione
            {
                EventoId = id,
                UtenteId = userId,
                DataPrenotazione = DateTime.UtcNow
            };

            _context.Prenotazioni.Add(prenotazione);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Prenotazione completata." });
        }

        [HttpDelete("{id}/prenota")]
        public async Task<IActionResult> CancelPrenotazione(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var prenotazione = await _context.Prenotazioni
                .FirstOrDefaultAsync(p => p.EventoId == id && p.UtenteId == userId);
            
            if (prenotazione == null) return NotFound("Prenotazione non trovata.");

            var evento = await _context.Eventi.FindAsync(id);
            if (evento != null && evento.OrganizzatoreId == userId)
            {
                return BadRequest("L'organizzatore non può annullare la propria prenotazione. Devi cancellare l'evento.");
            }

            if (evento != null)
            {
                var eventStart = evento.Data.Add(evento.Orario);
                if (DateTime.UtcNow > eventStart.AddHours(-1))
                {
                    return BadRequest("Puoi disiscriverti solo fino a un'ora prima dell'inizio.");
                }
            }

            _context.Prenotazioni.Remove(prenotazione);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Prenotazione annullata con successo." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvento(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var evento = await _context.Eventi.FindAsync(id);
            if (evento == null) return NotFound("Evento non trovato.");

            if (evento.OrganizzatoreId != userId) return Forbid("Solo l'organizzatore può eliminare l'evento.");

            var eventStart = evento.Data.Add(evento.Orario);
            if (DateTime.UtcNow > eventStart.AddHours(-1))
            {
                return BadRequest("Puoi eliminare l'evento solo fino a un'ora prima dell'inizio.");
            }

            _context.Eventi.Remove(evento);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Evento eliminato con successo." });
        }

        [HttpDelete("{id}/partecipanti/{partecipanteId}")]
        public async Task<IActionResult> RemovePartecipante(int id, int partecipanteId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var evento = await _context.Eventi.FindAsync(id);
            if (evento == null) return NotFound("Evento non trovato.");

            if (evento.OrganizzatoreId != userId) return StatusCode(403, "Solo l'organizzatore può rimuovere i partecipanti.");

            if (partecipanteId == userId) return BadRequest("Non puoi rimuovere te stesso.");

            var prenotazione = await _context.Prenotazioni
                .FirstOrDefaultAsync(p => p.EventoId == id && p.UtenteId == partecipanteId);
            
            if (prenotazione == null) return NotFound("Partecipante non trovato.");

            _context.Prenotazioni.Remove(prenotazione);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Partecipante rimosso con successo." });
        }
    }
}
