using System;

namespace StudyLink.Api.Models
{
    public class Prenotazione
    {
        public int EventoId { get; set; }
        public Evento Evento { get; set; } = null!;

        public int UtenteId { get; set; }
        public Utente Utente { get; set; } = null!;

        public DateTime Data { get; set; }
        public TimeSpan Orario { get; set; }
    }
}
