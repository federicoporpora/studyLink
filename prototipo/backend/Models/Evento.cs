using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudyLink.Backend.Models
{
    public class Evento
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Titolo { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Materia { get; set; } = string.Empty;

        [Required]
        public DateTime Data { get; set; }

        [Required]
        public TimeSpan Orario { get; set; }

        [Required]
        [MaxLength(100)]
        public string IndirizzoVia { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string IndirizzoNomeLuogo { get; set; } = string.Empty;

        [Required]
        public TipoDiLuogo TipoDiLuogo { get; set; }

        [Required]
        public int NumeroPosti { get; set; } // 0 means Illimitati

        public int OrganizzatoreId { get; set; }

        [ForeignKey("OrganizzatoreId")]
        public Utente Organizzatore { get; set; } = null!;

        [JsonIgnore]
        public ICollection<Prenotazione> Prenotazioni { get; set; } = new List<Prenotazione>();

        [JsonIgnore]
        public Chat? Chat { get; set; }
    }
}
