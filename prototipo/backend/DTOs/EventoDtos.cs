using System.ComponentModel.DataAnnotations;
using StudyLink.Backend.Models;

namespace StudyLink.Backend.DTOs
{
    public class EventoDto
    {
        public int Id { get; set; }
        public string Titolo { get; set; } = string.Empty;
        public string Materia { get; set; } = string.Empty;
        public DateTime Data { get; set; }
        public TimeSpan Orario { get; set; }
        public string IndirizzoVia { get; set; } = string.Empty;
        public string IndirizzoNomeLuogo { get; set; } = string.Empty;
        public TipoDiLuogo TipoDiLuogo { get; set; }
        public int NumeroPosti { get; set; }
        public int OrganizzatoreId { get; set; }
        public string OrganizzatoreNome { get; set; } = string.Empty;
        public int NumeroPrenotazioni { get; set; }
    }

    public class CreateEventoDto
    {
        [Required]
        public string Titolo { get; set; } = string.Empty;
        public string Materia { get; set; } = string.Empty;
        [Required]
        public DateTime Data { get; set; }
        [Required]
        public TimeSpan Orario { get; set; }
        [Required]
        public string IndirizzoVia { get; set; } = string.Empty;
        [Required]
        public string IndirizzoNomeLuogo { get; set; } = string.Empty;
        [Required]
        public TipoDiLuogo TipoDiLuogo { get; set; }
        [Required]
        public int NumeroPosti { get; set; }
    }
}
