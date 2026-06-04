using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudyLink.Backend.Models
{
    public class Chat
    {
        public int Id { get; set; }

        public int EventoId { get; set; }

        [ForeignKey("EventoId")]
        public Evento Evento { get; set; } = null!;

        [JsonIgnore]
        public ICollection<Messaggio> Messaggi { get; set; } = new List<Messaggio>();
    }
}
