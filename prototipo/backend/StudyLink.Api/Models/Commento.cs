using System;

namespace StudyLink.Api.Models
{
    public class Commento
    {
        public int Id { get; set; }
        public string Testo { get; set; } = string.Empty;
        public int Valutazione { get; set; }
        public DateTime Data { get; set; }
        public TimeSpan Orario { get; set; }

        public int MittenteId { get; set; }
        public Utente Mittente { get; set; } = null!;

        public int DestinatarioId { get; set; }
        public Utente Destinatario { get; set; } = null!;
    }
}
