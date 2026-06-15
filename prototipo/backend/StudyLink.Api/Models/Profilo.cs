using System;

namespace StudyLink.Api.Models
{
    public class Profilo
    {
        public int UtenteId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Cognome { get; set; } = string.Empty;
        public string CorsoDiStudi { get; set; } = string.Empty;
        public string Biografia { get; set; } = string.Empty;
        public string? ImmagineProfilo { get; set; }

        public Utente Utente { get; set; } = null!;
    }
}
