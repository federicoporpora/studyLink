# StudyLink 🎓

StudyLink è una piattaforma web pensata per gli studenti universitari che vogliono organizzare gruppi di studio, partecipare a sessioni di ripasso collettivo, chattare in tempo reale e recensirsi a vicenda.

## ✨ Funzionalità Principali
- **Registrazione e Autenticazione:** Accesso riservato agli studenti tramite email universitarie.
- **Creazione Eventi:** Organizza eventi specificando la materia, la data, l'orario, il numero di posti disponibili e il luogo (Biblioteca, Aule Studio, Casa, Online).
- **Prenotazione:** Unisciti agli eventi creati da altri colleghi fino all'esaurimento dei posti.
- **Chat in Tempo Reale:** Ogni evento dispone di una chat live integrata per coordinarsi tra i partecipanti.
- **Profilo Utente:** Personalizza il tuo profilo con foto, corso di studi e biografia.
- **Sistema di Recensioni:** Lascia feedback e valutazioni agli altri partecipanti una volta concluso un evento.

## 🛠️ Stack Tecnologico
- **Frontend:** React (Vite), CSS Custom
- **Backend:** ASP.NET Core 8 (C#)
- **Comunicazione Real-Time:** SignalR
- **Database:** PostgreSQL
- **ORM:** Entity Framework Core
- **Infrastruttura:** Docker & Docker Compose

---

## 🚀 Come Avviare l'Applicazione da 0

L'intero progetto è stato configurato per essere avviato in modo semplicissimo grazie a Docker Compose. Non avrai bisogno di installare Node.js, .NET o PostgreSQL sulla tua macchina host.

### 1. Prerequisiti
Assicurati di avere installato sul tuo computer:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Avvio dei Servizi
Apri il terminale, naviga nella cartella principale del progetto (dove si trova il file `docker-compose.yml`) ed esegui:

```bash
docker compose up -d --build
```

Questo comando si occuperà di:
1. Scaricare l'immagine di PostgreSQL e avviare il database.
2. Compilare il backend (ASP.NET Core) e avviare il server. Il backend applicherà automaticamente le migrazioni (creazione delle tabelle) al database all'avvio.
3. Scaricare le dipendenze npm, fare la build del frontend (React) e servirlo.

### 3. Accesso all'Applicazione
Una volta che tutti i container sono in stato "Running", puoi accedere alla piattaforma dal tuo browser ai seguenti indirizzi:

- **Frontend (Interfaccia Utente):** [http://localhost:5173](http://localhost:5173)
- **Backend (API Base URL):** [http://localhost:5000](http://localhost:5000)

### 4. Visualizzare i log (Opzionale)
Se desideri vedere cosa sta succedendo sotto il cofano (log del server, errori, messaggi SignalR), puoi usare:

```bash
# Log di tutti i container
docker compose logs -f

# Log specifici del backend
docker logs provastudylink-backend-1 -f
```

### 5. Spegnere l'applicazione
Quando hai finito, puoi arrestare e rimuovere i container eseguendo:

```bash
docker compose down
```

*(Nota: I dati del database e le immagini caricate rimarranno salvati grazie ai volumi persistenti definiti nel file docker-compose).*

---

## 💡 Note di Sviluppo
- Le password salvate nel database sono protette tramite Hashing (BCrypt).
- La comunicazione frontend-backend è gestita interamente tramite token JWT (JSON Web Tokens).
- Le immagini del profilo vengono salvate internamente e convertite in un formato Data-URL sicuro.
