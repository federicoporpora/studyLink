using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudyLink.Backend.Models
{
    public class Prenotazione
    {
        public int Id { get; set; }

        public int UtenteId { get; set; }

        [ForeignKey("UtenteId")]
        public Utente Utente { get; set; } = null!;

        public int EventoId { get; set; }

        [ForeignKey("EventoId")]
        public Evento Evento { get; set; } = null!;

        [Required]
        public DateTime DataPrenotazione { get; set; } = DateTime.UtcNow;
    }
}
