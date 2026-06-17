using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyLink.Api.Data;
using StudyLink.Api.DTOs;
using System.Security.Claims;

namespace StudyLink.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfiloController : ControllerBase
    {
        private readonly StudyLinkDbContext _context;

        public ProfiloController(StudyLinkDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<ActionResult<ProfiloDto>> GetMyProfile()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var profilo = await _context.Profili.FirstOrDefaultAsync(p => p.UtenteId == userId);
            if (profilo == null) return NotFound();

            return Ok(new ProfiloDto
            {
                Nome = profilo.Nome,
                Cognome = profilo.Cognome,
                CorsoDiStudi = profilo.CorsoDiStudi,
                Biografia = profilo.Biografia,
                ImmagineProfilo = profilo.ImmagineProfilo
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UtenteProfiloDto>> GetUserProfile(int id)
        {
            var profilo = await _context.Profili.FirstOrDefaultAsync(p => p.UtenteId == id);
            if (profilo == null) return NotFound();

            var commenti = await _context.Commenti
                .Include(c => c.Mittente)
                .ThenInclude(m => m.Profilo)
                .Where(c => c.DestinatarioId == id)
                .OrderByDescending(c => c.Data)
                .Select(c => new CommentoDto
                {
                    Id = c.Id,
                    MittenteId = c.MittenteId,
                    MittenteNome = c.Mittente.Profilo != null ? (c.Mittente.Profilo.Nome + " " + c.Mittente.Profilo.Cognome).Trim() : "Sconosciuto",
                    MittenteImmagine = c.Mittente.Profilo != null ? c.Mittente.Profilo.ImmagineProfilo : null,
                    Testo = c.Testo,
                    Voto = c.Valutazione,
                    Data = c.Data.ToString("yyyy-MM-dd")
                })
                .ToListAsync();

            return Ok(new UtenteProfiloDto
            {
                UtenteId = id,
                Nome = profilo.Nome,
                Cognome = profilo.Cognome,
                CorsoDiStudi = profilo.CorsoDiStudi,
                Biografia = profilo.Biografia,
                ImmagineProfilo = profilo.ImmagineProfilo,
                Commenti = commenti
            });
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile(ProfiloDto request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var profilo = await _context.Profili.FirstOrDefaultAsync(p => p.UtenteId == userId);
            if (profilo == null) return NotFound();

            profilo.Nome = request.Nome;
            profilo.Cognome = request.Cognome;
            profilo.CorsoDiStudi = request.CorsoDiStudi;
            profilo.Biografia = request.Biografia;
            
            // If image is updated
            if (request.ImmagineProfilo != null)
            {
                profilo.ImmagineProfilo = request.ImmagineProfilo;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile image)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            if (image == null || image.Length == 0) return BadRequest("File vuoto");

            var ext = Path.GetExtension(image.FileName).ToLower();
            if (ext != ".jpg" && ext != ".png" && ext != ".jpeg") return BadRequest("Formato non supportato");

            var directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }

            var fileName = $"{userId}_{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(directoryPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            var profilo = await _context.Profili.FirstOrDefaultAsync(p => p.UtenteId == userId);
            if (profilo == null) return NotFound();

            var relativeUrl = $"/uploads/{fileName}";
            profilo.ImmagineProfilo = relativeUrl;

            await _context.SaveChangesAsync();

            return Ok(new { url = relativeUrl });
        }

        public class CreateCommentoDto
        {
            public string Testo { get; set; } = string.Empty;
            public int Valutazione { get; set; }
        }

        [HttpPost("{id}/commento")]
        public async Task<IActionResult> LasciaCommento(int id, CreateCommentoDto request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            if (userId == id) return BadRequest("Non puoi autocommentarti.");

            var destinatario = await _context.Utenti.FindAsync(id);
            if (destinatario == null) return NotFound("Utente non trovato.");

            var commento = new StudyLink.Api.Models.Commento
            {
                MittenteId = userId,
                DestinatarioId = id,
                Testo = request.Testo,
                Valutazione = request.Valutazione,
                Data = DateTime.UtcNow,
                Orario = DateTime.UtcNow.TimeOfDay
            };

            _context.Commenti.Add(commento);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
