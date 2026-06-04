using Microsoft.EntityFrameworkCore;
using StudyLink.Backend.Models;

namespace StudyLink.Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Utente> Utenti { get; set; } = null!;
        public DbSet<Evento> Eventi { get; set; } = null!;
        public DbSet<Prenotazione> Prenotazioni { get; set; } = null!;
        public DbSet<Commento> Commenti { get; set; } = null!;
        public DbSet<Chat> Chats { get; set; } = null!;
        public DbSet<Messaggio> Messaggi { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Relationships

            // Utente -> EventiCreati
            modelBuilder.Entity<Evento>()
                .HasOne(e => e.Organizzatore)
                .WithMany(u => u.EventiCreati)
                .HasForeignKey(e => e.OrganizzatoreId)
                .OnDelete(DeleteBehavior.Restrict);

            // Utente -> Prenotazioni
            modelBuilder.Entity<Prenotazione>()
                .HasOne(p => p.Utente)
                .WithMany(u => u.Prenotazioni)
                .HasForeignKey(p => p.UtenteId)
                .OnDelete(DeleteBehavior.Cascade);

            // Evento -> Prenotazioni
            modelBuilder.Entity<Prenotazione>()
                .HasOne(p => p.Evento)
                .WithMany(e => e.Prenotazioni)
                .HasForeignKey(p => p.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Commento
            modelBuilder.Entity<Commento>()
                .HasOne(c => c.Mittente)
                .WithMany(u => u.CommentiInviati)
                .HasForeignKey(c => c.MittenteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Commento>()
                .HasOne(c => c.Destinatario)
                .WithMany(u => u.CommentiRicevuti)
                .HasForeignKey(c => c.DestinatarioId)
                .OnDelete(DeleteBehavior.Restrict);

            // Chat -> Evento
            modelBuilder.Entity<Chat>()
                .HasOne(c => c.Evento)
                .WithOne(e => e.Chat)
                .HasForeignKey<Chat>(c => c.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Messaggio -> Chat
            modelBuilder.Entity<Messaggio>()
                .HasOne(m => m.Chat)
                .WithMany(c => c.Messaggi)
                .HasForeignKey(m => m.ChatId)
                .OnDelete(DeleteBehavior.Cascade);

            // Messaggio -> Mittente
            modelBuilder.Entity<Messaggio>()
                .HasOne(m => m.Mittente)
                .WithMany(u => u.Messaggi)
                .HasForeignKey(m => m.MittenteId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
