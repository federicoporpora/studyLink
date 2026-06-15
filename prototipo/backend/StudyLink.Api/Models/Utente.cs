using System;
using System.Collections.Generic;

namespace StudyLink.Api.Models
{
    public class Utente
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        // Navigation properties
        public Profilo? Profilo { get; set; }
        
        public ICollection<Commento> CommentiInviati { get; set; } = new List<Commento>();
        public ICollection<Commento> CommentiRicevuti { get; set; } = new List<Commento>();
        
        public ICollection<Evento> EventiOrganizzati { get; set; } = new List<Evento>();
        
        public ICollection<Prenotazione> Prenotazioni { get; set; } = new List<Prenotazione>();
        
        public ICollection<Messaggio> Messaggi { get; set; } = new List<Messaggio>();
    }
}
