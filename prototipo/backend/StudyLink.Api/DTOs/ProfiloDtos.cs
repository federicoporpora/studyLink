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
}
