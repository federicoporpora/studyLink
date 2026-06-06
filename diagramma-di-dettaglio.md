Ecco la progettazione di dettaglio per l'applicazione StudyLink, strutturata rigorosamente in base alle tue note sulla Progettazione di Dettaglio e in conformità con quanto analizzato nel file StudyLink.tex (casi d'uso, requisiti funzionali/non funzionali, tabelle di rischio e architettura logica).

Per garantire la massima indipendenza da DB, Linguaggio e OS, e per assicurare disaccoppiamento e portabilità, l'architettura è stata divisa nei quattro layer architetturali richiesti. Le interfacce (in senso OOP, da non confondere con la UI) sono ampiamente utilizzate per nascondere le implementazioni.

---
### 1. APPLICATION LOGIC LAYER

Questo layer si divide in due sotto-strutture principali: il Dominio (le entità che definiscono lo stato e la struttura dati) e la Business Logic (i gestori che operano il controllo e implementano le operazioni di sistema).

#### Package: Dominio

Contiene le strutture dati, le entità e i tipi base senza alcuna conoscenza del database o dell'interfaccia grafica.

- Enumerazioni:
  - `TipoDiLuogo`: `Pubblico`, `Privato` (per R05F).
- Tipi di dato e strutture introdotte (come da linea guida):
  - `Orario`: incapsula la logica del tempo "HH:MM" (per R05N).
  - `Credenziali`: incapsula `Email` e `Password`.
  - `Indirizzo`: incapsula `Via` e `Nome Luogo`.
  - `Filtro`: incapsula i campi di ricerca in Bacheca (Distanza, Tipo di Luogo, Numero Posti, Date, Orari).
- Classi (Entità):
  - `Utente`: gestisce le Credenziali e il conteggio dei tentativi di accesso (per la sicurezza).
  - `Profilo`: contiene i dati anagrafici (Nome, Cognome, Corso di Studi, Biografia, path dell'Immagine).
  - `Evento`: contiene Titolo, Materia, Data, Orario, Indirizzo, Tipo di Luogo, Posti (Limitati/Illimitati) e la navigabilità verso la Chat e il Profilo (Organizzatore e Partecipanti).
  - `Prenotazione`: lega un Profilo a un Evento, mantenendo traccia di Data e Ora dell'avvenuta prenotazione.
  - `Commento`: incapsula Testo, Valutazione, Data, Orario e autore (Profilo).
  - `Chat`: entità che raccoglie l'elenco dei Messaggi per uno specifico Evento.
  - `Messaggio`: contiene Testo, Data, Orario e l'autore (Profilo).
  - `Notifica` / `Avviso`: contiene Titolo, Descrizione e il Profilo destinatario per avvisi asincroni.

#### Package: Gestione (Logica Applicativa)

Contiene i controller logici/service. Per disaccoppiarli completamente, definiamo interfacce che saranno implementate dai gestori veri e propri.

- Interfacce:
  - `IRegistrazioneService`
  - `IAutenticazioneService`
  - `IProfiloService`
  - `IEventoService`
  - `IBachecaService`
  - `IChatService`
  - `ICommentoService`
- Classi (Implementazioni):
  - `GestoreRegistrazione`: convalida l'email istituzionale e la complessità della password.
  - `GestoreAutenticazione`: valida le credenziali. Interagisce col Middleware per il blocco dei 15 minuti in caso di 5 errori.
  - `GestoreProfilo`: si occupa della modifica e cancellazione del profilo e associazione di eventuali file immagine.
  - `GestoreEvento`: si occupa di validare le date di creazione, controllare la capienza dei posti, inviare Avvisi in caso di rimozione o cancellazione.
  - `GestoreBacheca`: applica il Filtro alla lista di Eventi recuperata dal Data layer.
  - `GestoreChat`: inoltra i Messaggi, istanzia le Chat contestualmente alla creazione degli Eventi.
  - `GestoreCommento`: verifica la chiusura degli eventi e salva le valutazioni.

---
### 2. PRESENTATION LOGIC LAYER

Gestisce l'interazione con l'utente (finestre, menù, componenti). È completamente disaccoppiato dall'Application Logic tramite le interfacce `IService` elencate sopra.

#### Package: ControllerUI

Fanno da collante tra le azioni fisiche dell'utente sulla maschera e il layer applicativo.

- Classi:
  - `RegistrazioneController`
  - `AutenticazioneController`
  - `ProfiloController`
  - `EventoController`
  - `BachecaController`
  - `ChatController`
  - `CommentoController`

#### Package: View (Maschere / Finestre)

Definizione formale degli "oggetti" grafici identificati nell'Analisi delle Interazioni.

- Classi:
  - `ViewRegistrazione`: maschera per Nome, Cognome, Email, Password.
  - `ViewAutenticazione`: maschera per Email, Password.
  - `HomeBacheca`: finestra globale contenente la toolbar per i Filtri e la lista Eventi.
  - `ViewDettaglioEvento`: pannello descrittivo con l'elenco dei partecipanti.
  - `ViewCreazioneEvento` / `ViewGestioneEvento`: finestre di input dati dell'evento e pulsanti di cancellazione/rimozione.
  - `ViewProfiloPersonale` / `ViewProfiloPartecipante`: schermata di dettaglio utente con l'elenco dei Commenti.
  - `ViewModificaProfilo`: finestra con campi di input per aggiornare Bio e Immagine.
  - `ViewChatEvento`: schermata formata dalla cronologia (scrollable) e la casella di input.
  - `ViewInserimentoCommento`: finestra modale per l'invio del feedback a fine evento.

---
### 3. DATA LOGIC LAYER

Per garantire la "massima indipendenza da DBMS" si utilizza il pattern DAO (Data Access Object). L'Applicazione conosce solo le interfacce e non ha idea se i dati siano in SQL, JSON o MongoDB.

#### Package: DataAccess

- Interfacce (Contratti):
  - `IUtenteDAO`
  - `IProfiloDAO`
  - `IEventoDAO`
  - `IPrenotazioneDAO`
  - `IChatDAO`
  - `IMessaggioDAO`
  - `ICommentoDAO`
- Classi (Gestione tecnica):
  - `DAOFactory`: classe astratta o Singleton che istanzia le classi concrete in base a una configurazione esterna, mantenendo totalmente all'oscuro la Business Logic dalla tecnologia di memorizzazione.
  - Nota sulla realizzazione: Durante lo sviluppo fisico si produrranno le implementazioni (es. `EventoSqlDAO` che implementa `IEventoDAO`), ma nel Design di Dettaglio è sufficiente esporre le Interfacce.

---
### 4. MIDDLEWARE LAYER

Gestisce diagnostica, sicurezza, rete, protezioni e l'interazione coi sistemi esterni in modo orizzontale e trasparente ai livelli precedenti.

#### Package: Sicurezza

- Interfacce:
  - `ICifratura`
- Classi:
  - `SecurityMiddleware`: intercetta il traffico di rete garantendo crittografia (HTTPS/TLS come da R10N) e gestisce l'hashing irreversibile delle Password per il furto credenziali.
  - `ControlloAccessiMiddleware`: componente che intercetta i tentativi di accesso del `GestoreAutenticazione`, incrementa il contatore dei fallimenti e agisce implementando il blocco da 15 minuti degli account sospetti, proteggendo contro gli attacchi DoS o brute-force.

#### Package: Diagnostica

- Interfacce:
  - `IGestoreDeiLog`
- Classi:
  - `GestoreDeiLog`: classe vitale (citata nei requisiti di rischio e integrazione). Si occupa di serializzare asincronamente in un file immutabile tutte le operazioni sensibili (modifica eventi, accessi falliti). Interagisce direttamente con il sistema esterno ("Visualizzatore Log").

#### Package: ReteEComunicazione

- Interfacce:
  - `INotificatore`
- Classi:
  - `ServizioNotifiche`: componente di rete che prende le entità `Notifica` o `Avviso` generate dall'Application Logic e le spinge attivamente (es. via Socket) in tempo reale ai device dei Partecipanti (R09N).
