using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudyLink.Backend.Models
{
    public class Messaggio
    {
        public int Id { get; set; }

        public int ChatId { get; set; }

        [ForeignKey("ChatId")]
        public Chat Chat { get; set; } = null!;

        public int MittenteId { get; set; }

        [ForeignKey("MittenteId")]
        public Utente Mittente { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string Testo { get; set; } = string.Empty;

        [Required]
        public DateTime DataInvio { get; set; } = DateTime.UtcNow;
    }
}
