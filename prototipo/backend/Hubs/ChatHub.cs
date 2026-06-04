using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyLink.Backend.Data;
using StudyLink.Backend.Models;
using System.Security.Claims;

namespace StudyLink.Backend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task JoinChat(string eventId)
        {
            // Verify if user is participant
            var userIdStr = Context.UserIdentifier;
            if (int.TryParse(userIdStr, out int userId) && int.TryParse(eventId, out int eId))
            {
                var isParticipant = await _context.Prenotazioni.AnyAsync(p => p.EventoId == eId && p.UtenteId == userId);
                if (isParticipant)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, eventId);
                }
            }
        }

        public async Task LeaveChat(string eventId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, eventId);
        }

        public async Task SendMessage(string eventId, string testo)
        {
            var userIdStr = Context.UserIdentifier;
            if (int.TryParse(userIdStr, out int userId) && int.TryParse(eventId, out int eId))
            {
                var isParticipant = await _context.Prenotazioni.AnyAsync(p => p.EventoId == eId && p.UtenteId == userId);
                if (!isParticipant) return;

                var chat = await _context.Chats.FirstOrDefaultAsync(c => c.EventoId == eId);
                if (chat == null) return;

                var mittente = await _context.Utenti.FindAsync(userId);
                
                var messaggio = new Messaggio
                {
                    ChatId = chat.Id,
                    MittenteId = userId,
                    Testo = testo,
                    DataInvio = DateTime.UtcNow
                };

                _context.Messaggi.Add(messaggio);
                await _context.SaveChangesAsync();

                var response = new
                {
                    id = messaggio.Id,
                    testo = messaggio.Testo,
                    dataInvio = messaggio.DataInvio,
                    mittenteId = userId,
                    mittenteNome = mittente?.Nome + " " + mittente?.Cognome,
                    mittenteImmagine = mittente?.Immagine
                };

                await Clients.Group(eventId).SendAsync("ReceiveMessage", response);
            }
        }
    }
}
