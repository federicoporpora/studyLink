using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace StudyLink.Backend.Models
{
    public class Utente
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Cognome { get; set; } = string.Empty;

        [MaxLength(50)]
        public string CorsoDiStudi { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Biografia { get; set; } = string.Empty;

        public string? Immagine { get; set; }

        [JsonIgnore]
        public ICollection<Evento> EventiCreati { get; set; } = new List<Evento>();

        [JsonIgnore]
        public ICollection<Prenotazione> Prenotazioni { get; set; } = new List<Prenotazione>();

        [JsonIgnore]
        public ICollection<Commento> CommentiRicevuti { get; set; } = new List<Commento>();

        [JsonIgnore]
        public ICollection<Commento> CommentiInviati { get; set; } = new List<Commento>();

        [JsonIgnore]
        public ICollection<Messaggio> Messaggi { get; set; } = new List<Messaggio>();
    }
}
