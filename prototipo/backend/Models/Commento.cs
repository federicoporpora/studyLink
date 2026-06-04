using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudyLink.Backend.Models
{
    public class Commento
    {
        public int Id { get; set; }

        public int MittenteId { get; set; }

        [ForeignKey("MittenteId")]
        public Utente Mittente { get; set; } = null!;

        public int DestinatarioId { get; set; }

        [ForeignKey("DestinatarioId")]
        public Utente Destinatario { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string Testo { get; set; } = string.Empty;

        [Required]
        [Range(1, 5)]
        public int Valutazione { get; set; }

        [Required]
        public DateTime Data { get; set; } = DateTime.UtcNow;
    }
}
