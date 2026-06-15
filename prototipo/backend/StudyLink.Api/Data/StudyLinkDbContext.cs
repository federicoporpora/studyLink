using Microsoft.EntityFrameworkCore;
using StudyLink.Api.Models;

namespace StudyLink.Api.Data
{
    public class StudyLinkDbContext : DbContext
    {
        public StudyLinkDbContext(DbContextOptions<StudyLinkDbContext> options) : base(options)
        {
        }

        public DbSet<Utente> Utenti { get; set; } = null!;
        public DbSet<Profilo> Profili { get; set; } = null!;
        public DbSet<Commento> Commenti { get; set; } = null!;
        public DbSet<Evento> Eventi { get; set; } = null!;
        public DbSet<Prenotazione> Prenotazioni { get; set; } = null!;
        public DbSet<Messaggio> Messaggi { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Utente (Email UNIQUE)
            modelBuilder.Entity<Utente>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Profilo (PK, FK Utente.ID)
            modelBuilder.Entity<Profilo>()
                .HasKey(p => p.UtenteId);

            modelBuilder.Entity<Profilo>()
                .HasOne(p => p.Utente)
                .WithOne(u => u.Profilo)
                .HasForeignKey<Profilo>(p => p.UtenteId);

            // Commento Relationships
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

            // Evento Relationships
            modelBuilder.Entity<Evento>()
                .HasOne(e => e.Organizzatore)
                .WithMany(u => u.EventiOrganizzati)
                .HasForeignKey(e => e.OrganizzatoreId)
                .OnDelete(DeleteBehavior.Restrict);

            // Prenotazione (Associative Entity)
            modelBuilder.Entity<Prenotazione>()
                .HasKey(p => new { p.UtenteId, p.EventoId });

            modelBuilder.Entity<Prenotazione>()
                .HasOne(p => p.Utente)
                .WithMany(u => u.Prenotazioni)
                .HasForeignKey(p => p.UtenteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Prenotazione>()
                .HasOne(p => p.Evento)
                .WithMany(e => e.Prenotazioni)
                .HasForeignKey(p => p.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Messaggio (Chat)
            modelBuilder.Entity<Messaggio>()
                .HasOne(m => m.Evento)
                .WithMany(e => e.Messaggi)
                .HasForeignKey(m => m.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Messaggio>()
                .HasOne(m => m.Utente)
                .WithMany(u => u.Messaggi)
                .HasForeignKey(m => m.UtenteId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
