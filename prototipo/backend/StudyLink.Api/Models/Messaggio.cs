using System;

namespace StudyLink.Api.Models
{
    public class Messaggio
    {
        public int Id { get; set; }
        public string Testo { get; set; } = string.Empty;
        public DateTime Data { get; set; }
        public TimeSpan Orario { get; set; }

        public int EventoId { get; set; }
        public Evento Evento { get; set; } = null!;

        public int UtenteId { get; set; }
        public Utente Utente { get; set; } = null!;
    }
}
