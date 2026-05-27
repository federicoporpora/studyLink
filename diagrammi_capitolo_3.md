# Diagrammi per il Capitolo 3: Progettazione

In questo documento trovi tutti i diagrammi necessari per completare il Capitolo 3, ispirati alla struttura del progetto JustBit. 

**💡 Come importarli in draw.io:**
Draw.io supporta l'inserimento diretto di codice Mermaid. Invece di disegnare tutto a mano, puoi fare così:
1. Apri draw.io
2. Clicca su **Arrange (Disponi) -> Insert (Inserisci) -> Advanced (Avanzate) -> Mermaid...**
3. Incolla il codice che trovi qui sotto e clicca "Insert".
4. Draw.io genererà i blocchi e le frecce in automatico. Potrai poi ricolorarli, spostarli e sistemarli visivamente come preferisci!

---

## 3.1.4 Diagramma dei Package
Questo diagramma mostra i grandi "blocchi logici" (package) del vostro sistema e le dipendenze tra di essi, riflettendo l'architettura a 3 livelli (Client, Server, Persistenza).

```mermaid
classDiagram
    namespace Client_React {
        class ViewProfilo
        class ViewEvento
        class ViewChat
        class ViewBacheca
    }
    
    namespace Server_AspNetCore {
        class ControllerAutenticazione
        class ControllerEvento
        class ControllerProfilo
        class HubChatSignalR
        class Dominio
    }
    
    namespace Persistenza_EFCore {
        class StudyLinkContext
        class GestoreLog
    }

    ViewProfilo --> ControllerProfilo : API REST
    ViewEvento --> ControllerEvento : API REST
    ViewChat --> HubChatSignalR : WebSocket
    ViewBacheca --> ControllerEvento : API REST
    
    ControllerAutenticazione --> Dominio
    ControllerEvento --> Dominio
    ControllerProfilo --> Dominio
    HubChatSignalR --> Dominio
    
    ControllerAutenticazione --> StudyLinkContext
    ControllerEvento --> StudyLinkContext
    ControllerProfilo --> StudyLinkContext
    
    StudyLinkContext --> GestoreLog : Scrive Log
```
*Spiegazione per il testo del LaTeX:* Il diagramma dei package separa nettamente il client (che si occupa solo della presentazione tramite le View) dal server. Il server contiene i Controller che smistano le richieste REST e il dominio. Il livello di persistenza è stato separato per astrarre la comunicazione con il database tramite l'ORM.

---

## 3.1.5 Diagramma dei Componenti
Mostra i moduli fisici/eseguibili dell'applicazione e le loro interfacce.

```mermaid
componentDiagram
    component "Web Browser (React Client)" as Client
    component "ASP.NET Core Server" as Server {
        port "API REST (HTTP/HTTPS)" as API
        port "WebSocket (SignalR)" as WS
    }
    database "PostgreSQL DB" as DB
    component "File System Locale" as FS

    Client ..> API : Richieste HTTP
    Client ..> WS : Connessione Real-time
    Server ..> DB : Entity Framework (TCP)
    Server ..> FS : Scrittura file di Log
```
*(Nota: Draw.io supporta la sintassi componentDiagram limitatamente. Se non la renderizza bene, puoi usare il formato flowchart standard per i componenti)*:
```mermaid
flowchart TD
    Client["📱 Web Browser (React Client)"]
    Server["⚙️ ASP.NET Core Server"]
    DB[("🗄️ PostgreSQL Database")]
    Log["📄 File di Log"]

    Client -- API REST (HTTPS) --> Server
    Client -- WebSocket (SignalR) --> Server
    Server -- Entity Framework --> DB
    Server -- Scrittura asincrona --> Log
```
*Spiegazione:* Il diagramma evidenzia che il Client comunica con il Server tramite due canali: chiamate REST classiche per i dati (Eventi, Profili) e WebSocket tramite SignalR per i messaggi istantanei della chat. Il server a sua volta è l'unico componente autorizzato a comunicare con il Database e con il File System per i Log.

---

## 3.2.1.1 Dettaglio del Modello (Classi)
Nel capitolo dell'analisi hai già disegnato il dominio. Nella *Progettazione*, i diagrammi delle classi diventano più tecnici. Per non fare diagrammi enormi, creiamo diagrammi separati, proprio come JustBit.

### Dettaglio: Utente e Profilo
Qui mostriamo come l'Utente si lega alle credenziali e al profilo.
```mermaid
classDiagram
    class Utente {
        -String email
        -String passwordHash
        +effettuaLogin()
        +modificaPassword()
    }
    
    class Profilo {
        -String nome
        -String cognome
        -String corsoDiStudi
        -String biografia
        -String immagineUrl
        +aggiornaDati()
    }
    
    class Credenziali {
        <<ValueObject>>
        -String email
        -String password
    }

    Utente "1" --> "1" Profilo : ha
    Utente ..> Credenziali : usa per auth
```

### Dettaglio: Evento
```mermaid
classDiagram
    class Evento {
        -int id
        -String titolo
        -String materia
        -DateTime data
        -TimeSpan orario
        -int numeroPosti
        -TipoDiLuogo tipoLuogo
        +aggiungiPartecipante(Profilo p)
        +rimuoviPartecipante(Profilo p)
        +getPostiDisponibili() int
    }
    
    class Indirizzo {
        <<ValueObject>>
        -String via
        -String nomeLuogo
    }
    
    class TipoDiLuogo {
        <<Enumeration>>
        PUBBLICO
        PRIVATO
    }

    Evento "1" *-- "1" Indirizzo : avviene in
    Evento "1" --> "1" TipoDiLuogo : classificato come
    Evento "1" --> "1" Profilo : organizzato da
    Evento "1" --> "*" Profilo : partecipato da
```

---

## 3.2.1.4 Dettaglio Controller (Interfacce e Implementazioni)
Questo è cruciale per dimostrare l'uso del pattern MVC e del principio di inversione delle dipendenze (come ha fatto JustBit).

```mermaid
classDiagram
    class IControllerEvento {
        <<Interface>>
        +CreaEvento(EventoDTO dto)
        +ModificaEvento(int id, EventoDTO dto)
        +CancellaEvento(int id)
        +GetEventiBacheca(FiltroDTO filtro)
    }
    
    class ControllerEvento {
        -StudyLinkContext _context
        +CreaEvento(EventoDTO dto)
        +ModificaEvento(int id, EventoDTO dto)
        +CancellaEvento(int id)
        +GetEventiBacheca(FiltroDTO filtro)
    }
    
    class IControllerAutenticazione {
        <<Interface>>
        +Login(CredenzialiDTO cred) String
        +Registrazione(RegistrazioneDTO dto)
    }

    class ControllerAutenticazione {
        -StudyLinkContext _context
        -TokenService _jwtService
        +Login(CredenzialiDTO cred) String
        +Registrazione(RegistrazioneDTO dto)
    }

    IControllerEvento <|.. ControllerEvento : implementa
    IControllerAutenticazione <|.. ControllerAutenticazione : implementa
```
*Spiegazione:* L'uso delle interfacce (`IController...`) permette di disaccoppiare il codice e facilita il collaudo (Dependency Injection). I metodi non prendono in input gli oggetti di Dominio, ma i `DTO` (Data Transfer Object), per non esporre la struttura interna del database al client.

---

## 3.2.1.6 Dettaglio: Persistenza (DbContext)
Come comunicano le classi C# con PostgreSQL? Tramite la classe Contesto.

```mermaid
classDiagram
    class DbContext {
        <<Entity Framework Core>>
    }
    
    class StudyLinkContext {
        +DbSet~Utente~ Utenti
        +DbSet~Profilo~ Profili
        +DbSet~Evento~ Eventi
        +DbSet~Commento~ Commenti
        +DbSet~MessaggioChat~ Messaggi
        +SaveChanges() int
        #OnModelCreating(ModelBuilder builder)
    }
    
    DbContext <|-- StudyLinkContext : eredita
```

---

## 3.2.2 Interazione (Diagrammi di Sequenza Implementativi)
Rispetto all'analisi, qui si vede il JWT e l'ORM.

### Diagramma di Sequenza: Autenticazione (Login)
```mermaid
sequenceDiagram
    actor U as Utente (React)
    participant C as ControllerAutenticazione
    participant DB as StudyLinkContext
    participant JWT as TokenService
    
    U->>C: POST /api/login (CredenzialiDTO)
    activate C
    C->>DB: Cerca utente per Email
    activate DB
    DB-->>C: Ritorna Utente (con Hash Password)
    deactivate DB
    
    alt Password corretta (Hash match)
        C->>JWT: GeneraToken(Utente)
        activate JWT
        JWT-->>C: Ritorna Token JWT
        deactivate JWT
        C-->>U: 200 OK + Token JWT
    else Password errata
        C-->>U: 401 Unauthorized
    end
    deactivate C
```

### Diagramma di Sequenza: Prenotazione Evento
```mermaid
sequenceDiagram
    actor U as Partecipante
    participant C as ControllerEvento
    participant DB as StudyLinkContext
    
    U->>C: POST /api/evento/1/prenota (Token JWT)
    activate C
    C->>C: Valida Token JWT (Verifica identità)
    
    C->>DB: GetEvento(1)
    activate DB
    DB-->>C: Dati Evento
    deactivate DB
    
    alt Posti disponibili > 0
        C->>DB: Aggiungi Utente a Partecipanti
        C->>DB: SaveChanges()
        activate DB
        DB-->>C: Operazione confermata
        deactivate DB
        C-->>U: 200 OK (Prenotazione effettuata)
    else Evento Pieno
        C-->>U: 400 Bad Request (Posti esauriti)
    end
    deactivate C
```
