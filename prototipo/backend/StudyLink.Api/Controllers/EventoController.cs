using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyLink.Api.Data;
using StudyLink.Api.DTOs;
using StudyLink.Api.Models;
using System.Security.Claims;

namespace StudyLink.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EventoController : ControllerBase
    {
        private readonly StudyLinkDbContext _context;

        public EventoController(StudyLinkDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<EventoDto>> CreateEvento(CreaEventoDto request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            if (!DateTime.TryParse(request.Data, out var parsedDate))
            {
                return BadRequest("Formato data non valido");
            }
            var date = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);

            if (!TimeSpan.TryParse(request.Orario, out var time))
            {
                return BadRequest("Formato orario non valido");
            }

            var evento = new Evento
            {
                Titolo = request.Titolo,
                Data = date,
                Orario = time,
                Materia = string.Empty,
                Indirizzo = request.Indirizzo,
                TipoLuogo = request.TipoLuogo,
                NumeroPosti = request.NumeroPosti,
                OrganizzatoreId = userId
            };

            _context.Eventi.Add(evento);
            await _context.SaveChangesAsync();

            return Ok(new EventoDto
            {
                Id = evento.Id,
                Titolo = evento.Titolo,
                Data = evento.Data.ToString("yyyy-MM-dd"),
                Orario = evento.Orario.ToString(@"hh\:mm"),
                Indirizzo = evento.Indirizzo,
                TipoLuogo = evento.TipoLuogo,
                NumeroPosti = evento.NumeroPosti,
                OrganizzatoreId = evento.OrganizzatoreId,
                PartecipantiAttuali = 0
            });
        }

        [HttpGet]
        [AllowAnonymous] // Anyone can see the list
        public async Task<ActionResult<IEnumerable<EventoDto>>> GetEventi()
        {
            int userId = 0;
            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                int.TryParse(userIdStr, out userId);
            }

            var eventi = await _context.Eventi
                .Include(e => e.Organizzatore)
                    .ThenInclude(u => u.Profilo)
                .Include(e => e.Prenotazioni)
                .OrderBy(e => e.Data).ThenBy(e => e.Orario)
                .Select(e => new EventoDto
                {
                    Id = e.Id,
                    Titolo = e.Titolo,
                    Data = e.Data.ToString("yyyy-MM-dd"),
                    Orario = e.Orario.ToString(@"hh\:mm"),
                    Indirizzo = e.Indirizzo,
                    TipoLuogo = e.TipoLuogo,
                    NumeroPosti = e.NumeroPosti,
                    OrganizzatoreId = e.OrganizzatoreId,
                    OrganizzatoreNome = e.Organizzatore.Profilo != null ? e.Organizzatore.Profilo.Nome + " " + e.Organizzatore.Profilo.Cognome : "Sconosciuto",
                    OrganizzatoreImmagineProfilo = e.Organizzatore.Profilo != null ? e.Organizzatore.Profilo.ImmagineProfilo ?? "" : "",
                    PartecipantiAttuali = e.Prenotazioni.Count,
                    IsIscritto = userId > 0 && e.Prenotazioni.Any(p => p.UtenteId == userId)
                })
                .ToListAsync();

            return Ok(eventi);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DettaglioEventoDto>> GetEvento(int id)
        {
            int userId = 0;
            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                int.TryParse(userIdStr, out userId);
            }

            var e = await _context.Eventi
                .Include(ev => ev.Organizzatore).ThenInclude(u => u.Profilo)
                .Include(ev => ev.Prenotazioni).ThenInclude(p => p.Utente).ThenInclude(u => u.Profilo)
                .FirstOrDefaultAsync(ev => ev.Id == id);

            if (e == null) return NotFound();

            return Ok(new DettaglioEventoDto
            {
                Id = e.Id,
                Titolo = e.Titolo,
                Data = e.Data.ToString("yyyy-MM-dd"),
                Orario = e.Orario.ToString(@"hh\:mm"),
                Indirizzo = e.Indirizzo,
                TipoLuogo = e.TipoLuogo,
                NumeroPosti = e.NumeroPosti,
                OrganizzatoreId = e.OrganizzatoreId,
                OrganizzatoreNome = e.Organizzatore.Profilo != null ? e.Organizzatore.Profilo.Nome + " " + e.Organizzatore.Profilo.Cognome : "Sconosciuto",
                OrganizzatoreImmagineProfilo = e.Organizzatore.Profilo != null ? e.Organizzatore.Profilo.ImmagineProfilo ?? "" : "",
                PartecipantiAttuali = e.Prenotazioni.Count,
                IsIscritto = userId > 0 && e.Prenotazioni.Any(p => p.UtenteId == userId),
                Partecipanti = e.Prenotazioni.Select(p => new PartecipanteDto
                {
                    UtenteId = p.UtenteId,
                    Nome = p.Utente.Profilo != null ? p.Utente.Profilo.Nome + " " + p.Utente.Profilo.Cognome : "Sconosciuto",
                    ImmagineProfilo = p.Utente.Profilo != null && p.Utente.Profilo.ImmagineProfilo != null ? p.Utente.Profilo.ImmagineProfilo : ""
                }).ToList()
            });
        }

        [HttpPost("{id}/partecipa")]
        public async Task<IActionResult> Partecipa(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var evento = await _context.Eventi
                .Include(e => e.Prenotazioni)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (evento == null) return NotFound();

            if (evento.NumeroPosti.HasValue && evento.Prenotazioni.Count >= (evento.NumeroPosti.Value - 1))
            {
                return BadRequest("Evento pieno");
            }

            if (evento.Prenotazioni.Any(p => p.UtenteId == userId))
            {
                return BadRequest("Sei già prenotato a questo evento");
            }
            
            if (evento.OrganizzatoreId == userId)
            {
                return BadRequest("L'organizzatore non ha bisogno di prenotarsi");
            }

            evento.Prenotazioni.Add(new Prenotazione
            {
                UtenteId = userId,
                EventoId = id,
                Data = DateTime.UtcNow.Date,
                Orario = DateTime.UtcNow.TimeOfDay
            });

            await _context.SaveChangesAsync();
            return Ok();
        }
        [HttpGet("{id}/messaggi")]
        public async Task<ActionResult<IEnumerable<object>>> GetMessages(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var evento = await _context.Eventi
                .Include(e => e.Prenotazioni)
                .FirstOrDefaultAsync(e => e.Id == id);
                
            if (evento == null) return NotFound();

            // Optionally, check if user is participant or organizer
            if (evento.OrganizzatoreId != userId && !evento.Prenotazioni.Any(p => p.UtenteId == userId))
            {
                return Forbid();
            }

            var messaggi = await _context.Messaggi
                .Where(m => m.EventoId == id)
                .OrderBy(m => m.Data).ThenBy(m => m.Orario)
                .Select(m => new {
                    id = m.Id,
                    testo = m.Testo,
                    data = m.Data.ToString("yyyy-MM-dd"),
                    orario = m.Orario.ToString(@"hh\:mm"),
                    utenteId = m.UtenteId,
                    utenteNome = m.Utente.Profilo != null ? (m.Utente.Profilo.Nome + " " + m.Utente.Profilo.Cognome).Trim() : "Sconosciuto",
                    immagineProfilo = m.Utente.Profilo != null ? m.Utente.Profilo.ImmagineProfilo : null
                })
                .ToListAsync();

            return Ok(messaggi);
        }
    }
}
