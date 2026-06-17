namespace StudyLink.Api.DTOs
{
    public class ProfiloDto
    {
        public string Nome { get; set; } = string.Empty;
        public string Cognome { get; set; } = string.Empty;
        public string CorsoDiStudi { get; set; } = string.Empty;
        public string Biografia { get; set; } = string.Empty;
        public string? ImmagineProfilo { get; set; }
    }

    public class CommentoDto
    {
        public int Id { get; set; }
        public int MittenteId { get; set; }
        public string MittenteNome { get; set; } = string.Empty;
        public string? MittenteImmagine { get; set; }
        public string Testo { get; set; } = string.Empty;
        public int Voto { get; set; }
        public string Data { get; set; } = string.Empty;
    }

    public class UtenteProfiloDto
    {
        public int UtenteId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Cognome { get; set; } = string.Empty;
        public string CorsoDiStudi { get; set; } = string.Empty;
        public string Biografia { get; set; } = string.Empty;
        public string? ImmagineProfilo { get; set; }
        public List<CommentoDto> Commenti { get; set; } = new List<CommentoDto>();
    }
}
