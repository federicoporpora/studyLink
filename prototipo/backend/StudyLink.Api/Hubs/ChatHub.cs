using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyLink.Api.Data;
using StudyLink.Api.Models;
using System.Security.Claims;

namespace StudyLink.Api.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly StudyLinkDbContext _context;

        public ChatHub(StudyLinkDbContext context)
        {
            _context = context;
        }

        public async Task JoinEventGroup(int eventoId)
        {
            var userIdStr = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return;

            // Optional: verify if user is part of the event
            var eventExists = await _context.Eventi.AnyAsync(e => e.Id == eventoId);
            if (!eventExists) return;

            await Groups.AddToGroupAsync(Context.ConnectionId, eventoId.ToString());
        }

        public async Task LeaveEventGroup(int eventoId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, eventoId.ToString());
        }

        public async Task SendMessage(int eventoId, string testo)
        {
            var userIdStr = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return;

            var evento = await _context.Eventi.FindAsync(eventoId);
            var utente = await _context.Utenti.Include(u => u.Profilo).FirstOrDefaultAsync(u => u.Id == userId);
            
            if (evento == null || utente == null) return;

            var messaggio = new Messaggio
            {
                EventoId = eventoId,
                UtenteId = userId,
                Testo = testo,
                Data = DateTime.UtcNow.Date,
                Orario = DateTime.UtcNow.TimeOfDay
            };

            _context.Messaggi.Add(messaggio);
            await _context.SaveChangesAsync();

            var messageObj = new
            {
                id = messaggio.Id,
                testo = messaggio.Testo,
                data = messaggio.Data.ToString("yyyy-MM-dd"),
                orario = messaggio.Orario.ToString(@"hh\:mm"),
                utenteId = userId,
                utenteNome = (utente.Profilo?.Nome + " " + utente.Profilo?.Cognome).Trim(),
                immagineProfilo = utente.Profilo?.ImmagineProfilo
            };

            await Clients.Group(eventoId.ToString()).SendAsync("ReceiveMessage", messageObj);
        }
    }
}
