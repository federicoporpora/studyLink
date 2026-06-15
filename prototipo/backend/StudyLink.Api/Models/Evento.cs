using System;
using System.Collections.Generic;

namespace StudyLink.Api.Models
{
    public class Evento
    {
        public int Id { get; set; }
        public string Titolo { get; set; } = string.Empty;
        public DateTime Data { get; set; }
        public TimeSpan Orario { get; set; }
        public string Materia { get; set; } = string.Empty;
        public string TipoLuogo { get; set; } = string.Empty; // Pubblico/Privato
        public string NomeLuogo { get; set; } = string.Empty;
        public string Indirizzo { get; set; } = string.Empty;
        public int? NumeroPosti { get; set; } // Null for unlimited

        public int OrganizzatoreId { get; set; }
        public Utente Organizzatore { get; set; } = null!;

        public ICollection<Prenotazione> Prenotazioni { get; set; } = new List<Prenotazione>();
        public ICollection<Messaggio> Messaggi { get; set; } = new List<Messaggio>();
    }
}
