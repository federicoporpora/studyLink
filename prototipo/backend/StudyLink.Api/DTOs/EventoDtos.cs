namespace StudyLink.Api.DTOs
{
    public class CreaEventoDto
    {
        public string Titolo { get; set; } = string.Empty;
        public string Data { get; set; } = string.Empty; // format YYYY-MM-DD
        public string Orario { get; set; } = string.Empty; // format HH:MM
        public string Indirizzo { get; set; } = string.Empty;
        public string TipoLuogo { get; set; } = "PUBBLICO";
        public int? NumeroPosti { get; set; }
    }

    public class EventoDto
    {
        public int Id { get; set; }
        public string Titolo { get; set; } = string.Empty;
        public string Data { get; set; } = string.Empty;
        public string Orario { get; set; } = string.Empty;
        public string Indirizzo { get; set; } = string.Empty;
        public string TipoLuogo { get; set; } = string.Empty;
        public int? NumeroPosti { get; set; }
        public int OrganizzatoreId { get; set; }
        public string OrganizzatoreNome { get; set; } = string.Empty;
        public string OrganizzatoreImmagineProfilo { get; set; } = string.Empty;
        public int PartecipantiAttuali { get; set; }
        public bool IsIscritto { get; set; }
    }

    public class PartecipanteDto
    {
        public int UtenteId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string ImmagineProfilo { get; set; } = string.Empty;
    }

    public class DettaglioEventoDto : EventoDto
    {
        public List<PartecipanteDto> Partecipanti { get; set; } = new List<PartecipanteDto>();
    }
}
