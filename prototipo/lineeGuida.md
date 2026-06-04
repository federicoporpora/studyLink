# Appunti Completi di Ingegneria del Software T

Questo documento contiene la sintesi dettagliata e completa di tutte le pratiche, norme, definizioni, e casi d'uso descritti nei moduli del corso di Ingegneria del Software T (Principi di Design, Design Pattern, Progettazione per la Sicurezza, Progettazione, Diagrammi UML di Componenti e Deployment, e Progettazione Concettuale E/R).

---

## 1. Principi di Design (Design Principles)

### 1.1 Qualità della Progettazione e Cattivo Design
La qualità della progettazione è un concetto vago che dipende dalle priorità dell'organizzazione (un buon progetto può essere il più affidabile, efficiente, economico o manutenibile). I principi discussi mirano primariamente alla **manutenibilità** del progetto.

**Sintomi di un design "cattivo":**
* **Misdirection:** non soddisfa i requisiti.
* **Rigidità del software:** la tendenza ad essere difficile da modificare. Una singola modifica influisce a cascata su molte altre parti del sistema (moduli dipendenti).
* **Fragilità del software:** la tendenza a "rompersi" in molti punti ogni volta che viene modificato. Modifiche in un'area causano comportamenti inaspettati in aree concettualmente slegate. Tale software diventa impossibile da manutenere.
* **Immobilità del software:** l'impossibilità di riutilizzare il software in altri progetti o in parti dello stesso progetto a causa di troppe dipendenze intrecciate che ne rendono proibitiva la separazione.
* **Viscosità:** è facile fare la cosa sbagliata, ma difficile fare quella giusta.
    * *Viscosità del design:* i metodi che preservano il design originale sono più difficili da utilizzare rispetto agli hack.
    * *Viscosità dell'ambiente:* l'ambiente di sviluppo è lento e inefficiente (compilazione lenta, source control bloccante).

**Cause della "putrefazione" del software:**
Il degrado è lento; i requisiti cambiano in modi non previsti, si introducono dipendenze improprie e non pianificate. La gestione scorretta delle dipendenze è la causa principale dei sintomi sopra citati. È fondamentale rendere i progetti resistenti ai cambiamenti.

### 1.2 Principi di Base
* **Il Principio Zero (Rasoio di Occam):** "Entia non sunt multiplicanda praeter necessitatem". Non introdurre concetti non strettamente necessari. "Quello che non c'è non si rompe" (H. Ford). Si preferisce la soluzione che introduce meno ipotesi e concetti.
* **Semplicità e Semplicismo:** Mantenere le cose semplici richiede un forte sforzo di progettazione (è facile essere complicati). "Keep it as simple as possible but not simpler" (A. Einstein). Non aggiungere complessità arbitraria.
* **Divide et Impera:** La decomposizione è fondamentale per il controllo della complessità. Bisogna *minimizzare il grado di accoppiamento* tra i moduli (minimizzare le interazioni ed eliminare i riferimenti circolari).
* **Information Hiding (Dati privati):** Rendere privati tutti i dati. L'esposizione di dati pubblici rischia di creare un "effetto domino", rendendo il design fragile.

### 1.3 I Principi SOLID

#### Single Responsibility Principle (SRP)
* *"There should never be more than one reason for a class to change"* (R. Martin).
* Una classe deve avere una singola responsabilità: la fa tutta, la fa bene e fa solo quella (1-Responsibility Rule).
* Se una classe ha più responsabilità, queste diventano accoppiate. Esempio: una classe `Rectangle` che calcola l'area (geometria computazionale) e si occupa di disegnarsi (GUI). La soluzione (Refactoring) prevede di separare in due classi distinte: `GeometricRectangle` e una classe per la GUI.

#### Dependency Inversion Principle (DIP)
* *"Depend upon abstractions. Do not depend upon concretions."*
* Ogni dipendenza dovrebbe puntare a un'interfaccia o a una classe astratta. I moduli di alto livello (i clienti, che contengono la logica di business) non dovrebbero dipendere dai moduli di basso livello (fornitori di servizi/dettagli). Entrambi devono dipendere dalle astrazioni.
* **Perché funziona:** Le astrazioni contengono poco o zero codice, quindi cambiano raramente. I dettagli sono isolati da un muro di astrazioni stabili. Favorisce il *design for change* e il *design for reuse*.
* **Dipendenze transitive e cicliche:** I sistemi devono essere stratificati e bisogna assolutamente eliminare dipendenze transitive errate e spezzare le dipendenze cicliche (usando astrazioni/interfacce intermedie).
* Le astrazioni in uso *non* devono essere modificate, ma possono essere *estese* definendo nuove interfacce derivate.

#### Interface Segregation Principle (ISP)
* *"Clients should not be forced to depend upon interfaces that they do not use."*
* Le "Fat Interface" raggruppano metodi per clienti disparati. Questo crea un inutile accoppiamento indiretto: se si modifica una firma usata dal Client A, il Client B e il Client C potrebbero dover essere ricompilati anche se non usano quella funzionalità.
* Soluzione: Creare interfacce specifiche per ogni tipo di cliente (segregate) e farle implementare tutte alla classe concreta erogatrice del servizio.

#### Open/Closed Principle (OCP)
* *"Software entities should be open for extension, but closed for modification."*
* **Open:** estendibili aggiungendo nuovo stato o comportamenti.
* **Closed:** il codice sorgente o il modulo esistente (stabile, già testato) non deve essere alterato.
* Si attua tramite il polimorfismo e le interfacce. Si definisce un'interfaccia astratta. I moduli dipendono da questa astrazione e sono "chiusi" ai cambiamenti. Se serve un nuovo comportamento, si crea una nuova classe che implementa l'interfaccia ("aperto" per estensioni). Esempio: uno `SmartShapeManipulator` che usa un'interfaccia `ShapeInterface` con metodo `draw()`, invece di uno `switch-case` sui vari tipi di figure.

#### Liskov Substitution Principle (LSP)
* *"Subclasses should be substitutable for their base classes."* (B. Liskov)
* *"All derived classes must honor the contracts of their base classes."* (Design by Contract - B. Meyer)
* Un cliente che usa istanze di una classe base deve poter utilizzare istanze di qualsiasi classe derivata senza accorgersi della differenza e senza che il programma generi errori o comportamenti anomali.
* **Design by Contract:** Un metodo ridefinito in una sottoclasse può solo mantenere identiche o indebolire le *pre-condizioni* (cosa il chiamante deve garantire) e mantenere identiche o rafforzare le *post-condizioni* (cosa il metodo garantisce al ritorno).
* **L'esempio classico: Il Quadrato è un Rettangolo?** Anche se in geometria vale la relazione "Is-A", nel software un Quadrato che eredita da Rettangolo violerà LSP se i metodi per settare l'altezza modificano anche la larghezza. Un cliente che si aspetta un Rettangolo modificherà la larghezza credendo di lasciare inalterata l'altezza: il comportamento estrinseco viene violato, rompendo di conseguenza l'OCP. Il design è fallato. Il comportamento è ciò che conta, non solo le definizioni del mondo reale.

### 1.4 Principi di Architettura dei Package
* **Release/Reuse Equivalency Principle (REP):** L'unità di riutilizzo è l'unità di rilascio. I pacchetti raggruppano elementi riutilizzabili assieme, controllati tramite un numero di versione.
* **Common Closure Principle (CCP):** "Classes that change together, belong together." Per facilitare i manutentori, si raggruppano le classi che probabilmente modificheranno simultaneamente per la stessa ragione, limitando l'impatto dei cambiamenti a un solo package.
* **Common Reuse Principle (CRP):** "Classes that aren't reused together should not be grouped together." Per facilitare gli utenti dei package: se si dipende da un package, si dipende da tutto ciò che c'è dentro. Bisogna evitare pacchetti che contengano classi che non c'entrano nulla tra loro.
* *Nota sui tradeoff:* REP e CRP sono a favore di chi usa il codice, CCP aiuta i manutentori. L'architettura evolve nel tempo.
* **Acyclic Dependencies Principle (ADP):** Le dipendenze tra i pacchetti non devono formare cicli. Cicli rendono impossibile il testing e la compilazione indipendente. Per rompere cicli si inserisce un nuovo package intermedio o un'interfaccia (DIP).
* **Stable Dependencies Principle (SDP):** Si deve dipendere solo verso package più stabili. La stabilità è proporzionale allo sforzo richiesto per modificare il package (package con tante dipendenze in entrata sono molto stabili perché difficili da toccare senza rompere gli altri).
* **Stable Abstractions Principle (SAP):** Un package stabile dovrebbe essere massimamente astratto. Quindi le interfacce vanno nei package stabili e in fondo alla catena delle dipendenze; se sono astratti, rimangono facilmente estendibili (con OCP).

---

## 2. Design Pattern

I design pattern formalizzano l'esperienza progettuale orientata agli oggetti catturando la soluzione a un problema ricorrente.
I pattern possiedono 4 elementi: **Nome** (importante per il "chunking" e la comunicazione tra sviluppatori), **Problema**, **Soluzione**, **Conseguenze** (pro/contro).

Classificazione generale:
* **Creazionali:** Riguardano il processo di creazione di oggetti.
* **Strutturali:** Riguardano la composizione di classi e oggetti per ottenere funzionalità complesse.
* **Comportamentali:** Riguardano l'interazione e la divisione delle responsabilità tra oggetti.

### 2.1 Pattern Creazionali

#### Singleton
* **Problema/Soluzione:** Assicura che una classe abbia una sola istanza e fornisce un punto di accesso globale ad essa. Nasconde il costruttore (private/protected) e mantiene un riferimento statico a se stessa, esponendo un metodo `GetInstance()`.
* **Varianti:** Può essere usato per implementare interfacce diverse o per variare l'implementazione in fase di inizializzazione (creando istanze di sottoclassi diverse in `CreateInstance()` dipendenti dal contesto, cosa che le classi completamente statiche stile "Math" non permettono).

#### Abstract Factory
* **Problema:** Creazione di famiglie di oggetti connessi tra loro, senza costringere il client a specificare o conoscere i nomi delle classi concrete. (Es: creare Pulsanti, Scrollbar, Menu specifici per Windows o MacOS).
* **Soluzione:** Definire un'interfaccia astratta (es. `GUIFactory`) con metodi `CreateMenu()`, `CreateButton()`, etc. Le factory concrete (es. `WindowsFactory`) produrranno i prodotti concreti compatibili tra loro.
* **Conseguenze:** Isola le classi concrete, promuove la coerenza (prodotti della stessa famiglia forzati ad essere usati insieme). Tuttavia, aggiungere una nuova *tipologia* di prodotto (es. Checkbox) è difficile, in quanto costringe a modificare l'interfaccia base di tutte le factory astratte e concrete.

### 2.2 Pattern Strutturali

#### Flyweight
* **Problema/Soluzione:** Descrive come condividere oggetti a grana molto fine in modo efficiente per evitare eccessivo spreco di memoria (es. istanziare mille icone uguali, oppure singoli caratteri in un editor di testo).
* **Stato Intrinseco:** Non dipende dal contesto, è invariabile e viene salvato direttamente nel flyweight (es. il bitmap dell'icona). Condivisibile tra tutti.
* **Stato Estrinseco:** Dipende dal contesto, non condiviso, gestito dal cliente (es. coordinate X e Y). Viene passato al flyweight tramite i parametri del metodo.
* **Implementazione:** I client non possono istanziare il Flyweight con `new`, ma devono richiedere l'istanza a una `FlyweightFactory` che verifica se esiste già in memoria e la riutilizza, altrimenti la crea.

#### Adapter (Wrapper)
* **Problema/Soluzione:** Adatta l'interfaccia di una classe legacy/esistente all'interfaccia attesa da un client (perché incompatibili). Un Adapter implementa l'interfaccia `Target` richiesta dal cliente e possiede un'istanza dell'`Adaptee` (la classe legacy). Il cliente chiama `Operation()`, e l'Adapter la inoltra/traduce in `SpecificOperation()` sull'Adaptee.
* Utile anche per ragioni di sicurezza o logica, "incapsulando" sistemi esterni.

#### Decorator
* **Problema:** Estendere le responsabilità o il comportamento di un oggetto dinamicamente senza sub-classing intensivo (che creerebbe un'esplosione combinatoria di classi, es. BorderedFilledVerticalTextBox...).
* **Soluzione:** Il Decorator (che implementa e allo stesso tempo aggrega la classe `Component` di base) incapsula l'oggetto originale. Ogni decoratore estende il comportamento delegando le chiamate al componente interno prima o dopo l'esecuzione della propria logica (es. `AddedBehaviour()`). A runtime, i decoratori possono essere impilati/concatenati.

#### Composite
* **Problema/Soluzione:** Permette di comporre oggetti in strutture ad albero, trattando in modo uniforme oggetti singoli (`Leaf`) e composizioni di oggetti (`Composite`). Tutti implementano un'interfaccia unificata `Component`.
* **Conseguenze:** Il composite propaga le chiamate a tutti i suoi figli. Un problema progettuale risiede nel bilanciamento tra **Trasparenza** (mettere `Add`/`Remove` nell'interfaccia radice in modo che il client non faccia mai casting, a costo di eccezioni se chiamati su una Foglia) e **Sicurezza** (mettere `Add`/`Remove` solo nella classe `Composite`, ma costringendo il client a fare `instanceof`/cast e sapere con che tipo sta trattando).

### 2.3 Pattern Comportamentali

#### Observer
* **Problema:** Quando si modifica lo stato di un oggetto, altri oggetti dipendenti devono essere notificati. Cablare tutto a compile-time genera forte accoppiamento.
* **Soluzione:** Definire un `Subject` che espone `Attach(Observer)`, `Detach()` e `Notify()`. I `ConcreteObserver` si iscrivono alla lista interna del `Subject`. Quando cambia lo stato, `Subject` cicla la sua lista e chiama `Update()` su tutti.
* **Esempio Boss-Worker:** Il Boss osserva i Worker. Invece di far conoscere al Worker il riferimento esplicito alla classe Boss (forte accoppiamento, Class-based callback), il Worker manterrà una lista di target implementanti l'interfaccia logica `IWorkerEvents`. Quando il Worker finisce il task, chiama i metodi dell'interfaccia (publish/subscribe) notificando tutti gli interessati (Boss, ma anche eventuali Logger o moduli GUI).

#### MVC (Model-View-Controller) / MVP (Model-View-Presenter)
* **Model:** Gestisce i dati applicativi, la logica e notifica i cambiamenti (generalmente basato su pattern Observer registrando interfacce in formato anonimo).
* **View:** Presenta l'output. Intercetta gli eventi del Modello (si aggiorna di conseguenza) e intercetta input fisici per inviarli al controller.
* **Controller:** Riceve input dalla View (es. click del mouse), li converte in istruzioni/cambiamenti di stato per il Model o in cambiamenti per la View.
* **MVP:** Evoluzione di MVC in cui la View è puramente passiva. Il Model non notifica direttamente la View, ma l'evento passa attraverso il Presenter che coordina tutta la logica di business disaccoppiando completamente l'interfaccia grafica.

#### Strategy
* **Problema/Soluzione:** Permette di definire famiglie di algoritmi, incapsularli in classi separate e renderli intercambiabili a runtime senza blocchi `if-else` o `switch`.
* Il `Client` detiene un riferimento a un'interfaccia comune `Strategy` e chiama `Algorithm()`. L'implementazione reale (`ConcreteStrategy1`, `ConcreteStrategy2`...) viene iniettata nel client dall'esterno. Esempio: classe `Paragraph` che usa `AlignerBase` e gli inietta a runtime `LeftAligner`, `RightAligner`, ecc.

#### State
* **Problema/Soluzione:** Al cambiare dello stato interno, l'oggetto "sembra" cambiare classe e comportamenti (es. un Ereditarietà dinamica impossibile in molti linguaggi). Invece di grossi switch sullo stato, si crea una classe astratta `State` e un'implementazione concreta per ogni stato (`ConcreteStateA`, `ConcreteStateB`). L'oggetto di Contesto delega il lavoro all'oggetto State corrente (`_state.Handle()`), il quale può anche occuparsi autonomamente di scatenare le transizioni passandosi il nuovo stato nel Contesto.

#### Visitor
* **Problema:** Effettuare nuove operazioni eterogenee sugli elementi di una struttura complessa (es. un Abstract Syntax Tree) senza dover alterare in continuazione e ricompilare le interfacce delle classi elementari stabili (che violerebbe l'OCP).
* **Soluzione:** Usare il meccanismo del **Double Dispatch**. Ogni elemento della struttura definisce un solo metodo `Accept(Visitor v)` in cui semplicemente invoca `v.VisitElementoSpecifico(this)`. Tutte le operazioni da compiere vengono scritte all'interno della classe `ConcreteVisitor` esterna. Aggiungere un nuovo comportamento (es. Generazione Codice, Formattazione) richiede solo di creare un nuovo `Visitor`, senza intaccare i nodi. Le classi degli elementi visitati devono essere molto stabili nel tempo.

#### Anti-Pattern
Soluzioni e pratiche ricorrenti notoriamente dannose, come **l'Interface Bloat**, ovvero l'inserimento di un numero eccessivo e slegato di metodi dentro una singola interfaccia fino a renderla inusabile e violando apertamente i design principles (ISP in primis).

---

## 3. Architettura e Progettazione del Sistema

L'obiettivo della fase di Progettazione è prendere l'Architettura Logica definita in Analisi e, attraverso un raffinamento progressivo, giungere all'**Architettura del Sistema**, tenendo in debito conto requisiti vincolanti ignorati in precedenza. I risultati principali sono: Documenti architetturali, Schema di Persistenza, Piano di Collaudo e Indicazioni di Deployment.

### 3.1 Progettazione Architetturale
Risponde a domande architetturali primarie: quali stili e design? Come distribuire le componenti? Come suddividere in moduli la struttura? Le decisioni si basano sui Requisiti Non Funzionali e Trade-off.
L'architettura influenza prestazioni, robustezza, sicurezza e manutenibilità.
* **Prestazioni critiche:** localizzare le operazioni in grossi componenti minimizzando le interazioni di rete (creazione di macro-componenti).
* **Sicurezza (Security) critica:** usare architettura stratificata (layered), mettendo i beni cruciali nel cuore. Alto livello di convalida protettiva per ogni layer.
* **Safety critica:** segregare le operazioni rischiose in pochi componenti altamente testati e validati.
* **Disponibilità critica:** utilizzare componenti ridondanti in modo da effettuare patch a caldo o failover.
* **Manutenibilità critica:** usare componenti granulari atomici, separando produttori e consumatori, disaccoppiando. Si contrappone al requisito di prestazioni. Le architetture ottime derivano da un bilanciamento di questi trade-off.

**Pattern Architetturali:**
* **Blackboard:** Modello cooperativo tra sotto-sistemi non deterministici (Intelligenza Artificiale). Vari esperti (Knowledge Sources) operano indipendentemente leggendo e scrivendo soluzioni parziali su un'unica "Lavagna" gestita da un Controller.
* **MVC / BCE:** Strutturazione basata sulla separazione tra manipolazione (Model), esposizione (View) e controllo.
* **Layer:** Organizzazione in sotto-attività a livelli di astrazione successivi (Layer N chiama solo Layer N-1).
* **Client/Server:** Fornitura di servizi e utilizzo. *Thin-client:* il server gestisce dati e business logic, il client solo la presentation. *Fat-client:* il server gestisce solo i dati, il client processa le applicazioni e la UI. Modello a tre strati (3-tier) per disaccoppiamento totale.
* **Broker:** Adatto per sistemi fortemente distribuiti. Il Broker isola il Client dal Server: gestisce risoluzione dei nomi, registrazioni, inoltro delle richieste e risposte (Remote Procedure Call).
* **Pipe & Filters:** Adatto a flusso dati massivo. Processi incapsulati nei "Filtri", flussi passano nei "Pipe".

### 3.2 Progettazione di Dettaglio
Definisce le viste interne nel dettaglio: Struttura, Interazione e Comportamento. Definisce le classi in quattro layer: **Application Logic** (logica e controllo applicativo), **Presentation Logic** (UI, forms, dialogs), **Data Logic** (gestione database), **Middleware** (comunicazioni, rete, servizi esterni).
È imperativa l'indipendenza dalla tecnologia sottostante: DBMS, hardware e sistemi operativi. Si devono disaccoppiare i layer tramite DIP. 
*Se un sistema esterno non offre protezione adeguata: si usa il pattern **Adapter** per incapsularlo e garantirne la sicurezza a livello logico.*

### 3.3 Progettazione della Persistenza
Il progettista valuta tempistiche di risposta, frequenza di modifica e di ricerca dei dati, per scegliere tra file, DB NoSQL, o Relazionali (RDBMS). 
Esempio: per salvare un Log continuo, la scrittura su file testuale (append-only) risulta ottimale in termini di performance. Se il sistema richiede aggiornamenti concorrenti, gestione versioning e integrità forte, si va di DBMS.

### 3.4 Progettazione del Collaudo e Deployment
Il test system (Unit e Integration) deve essere preparato e sviluppato per poter verificare il corretto soddisfacimento delle funzionalità (TestSuite). Il Deployment sarà affrontato più specificamente nella gestione della sicurezza.

---

## 4. Security Engineering (Progettazione per la Sicurezza)

La sicurezza non si "aggiunge" alla fine: **deve essere ingegnerizzata a monte.** "È possibile ottenere un'implementazione non sicura da una progettazione sicura; non è possibile ottenere un'implementazione sicura partendo da una progettazione non sicura."

### 4.1 Problemi di Protezione vs Distribuzione (Architettura)
* Se metti tutti i beni in un solo server (Client-Server): costi minimi per la sicurezza robusta e centralizzata, ma se la protezione cade si perdono *tutti* i dati, si subiscono enormi attacchi DoS e il reset generale diventa costosissimo.
* Se distribuisci su vari nodi (con replicazione): gestire la protezione per i singoli nodi costa di più (maggiore superficie di attacco), ma un singolo attacco compromette solo perdite parziali. Il sistema "sopravvive" o opera in modo degradato.

### 4.2 Security Policies
Le decisioni di progettazione devono derivare e rispondere alle Policy, che descrivono il "Cosa" e non il "Come".
* **Identity Policies:** autenticazione e verifica credenziali.
* **Access Control Policies:** regole per richieste, autorizzazioni operative su specifiche risorse.
* **Content-specific Policies:** regole per comunicare e memorizzare specifiche info in sicurezza (es. cifratura).
* **Network & Infrastructure Policies:** regole di flusso dati, firewall, e utilizzo host/rete pubblica/privata.
* **Regulatory Policies:** aderenza a leggi e compliance normative regionali.
* **Advisor / Information Policies:** best practices consigliate internamente al personale.

### 4.3 Dieci Linee Guida per una Progettazione Sicura
1.  **Basare le decisioni di sicurezza su Policy esplicite** (specificare chi accede a cosa, le precondizioni). Spesso relegate alla *Security Authority*.
2.  **Evitare un Singolo Punto di Fallimento (Single Point of Failure):** usiamo *difesa in profondità*. Mai dipendere da una sola misura difensiva (es. accoppiare una password con Challenge-Response / 2FA).
3.  **Fallire in modo Certo (Fail Securely):** Un sistema crashato deve tornare in uno stato blindato. Qualsiasi caduta o procedura di recovery ("fall-back") non deve *mai* garantire privilegi o bypassare la cifratura.
4.  **Bilanciare Sicurezza e Usabilità:** L'aggiunta di vincoli estremi spazientisce gli utenti (e diminuisce l'usabilità). Troppa rigidità induce a scriversi le password nei post-it. Bilanciare è fondamentale.
5.  **Essere consapevoli dell'Ingegneria Sociale:** La maggior parte delle vulnerabilità avvengono perché gli utenti fidandosi del proprio interlocutore rivelano i dati di accesso. La progettazione poco può fare, servono alert, log analitics e autenticazione forte non bypassabile.
6.  **Usare Ridondanza e Diversità:** Diverse versioni o nodi software non dovrebbero impiegare gli stessi Stack tecnologici o S.O., se un exploit colpisce Linux Apache, l'altro nodo Windows IIS regge l'urto.
7.  **Validare tutti gli Input:** Attacchi celebri derivano da input non sanitizzati (Buffer Overflow, SQL Injection). Progettare moduli specifici che rifiutino input sporchi o fuori dai parametri logici attesi.
8.  **Compartimentalizzare i Beni:** Nessuno ha "accesso a tutto". Separare server per database, server web, dati. Un attacco comprometterà solo un piccolo silos invece dell'intero perimetro.
9.  **Progettazione per il Deployment:** Devono esserci utility integrate per analizzare in tempo reale la configurazione. Molti errori si evitano limitando i privilegi di sistema default ad "admin", chiedendo cambio password immediato. Localizzare le configurazioni tutte in uno stesso punto. Fornire upgrade automatici o tool di patching rapido contro vulnerabilità.
10. **Progettazione per il Ripristino (Survivability):** Prevedere a priori un piano post-incidente. Se dati e chiavi risultano compromesse, prevedere funzioni macro-reset password forzate prima che la situazione scappi dal controllo. L'analisi della sopravvivenza dei dati diventa essenziale.

### 4.4 Test di Sicurezza
I test di sicurezza sono tra i più ignorati causa scadenze strette, mancanza di conoscenze tecniche o di strumenti ad hoc. Prevedono Test Funzionali (l'applicazione rispetta le regole imposte) e test distruttivi esterni condotti da team specializzati, ad es. Penetration Testing (*Black Box*).

---

## 5. UML: Diagramma dei Componenti e di Deployment

### 5.1 Diagramma dei Componenti (UML 2.x)
In UML 2.0 un componente diventa una specializzazione vera e propria della classe; un componente definisce esplicitamente la sua struttura, ha porte e connettori e possiede Interfacce. L'interfaccia Fornita (Provided, `lollipop`) indica cosa offre all'esterno; l'Interfaccia Richiesta (Required, `socket`) indica da chi ha bisogno di supporto per operare.
* **Rappresentazione White-Box:** Mostra le proprietà interne (nested), gli artefatti (`<<artifacts>>`) e le realizzazioni (`<<realization>>`, per legare una classe fisica al contratto logico esposto dal componente).
* **Strutture Composite:** Strumento per zoomare e rappresentare componenti complessi internamente. Definisce **Parti**, collegate tramite **Connettori** (es. `Assembly Connectors` se collegano due parti interne; `Delegated Connectors` se connettono una parte interna alla porta esterna del contenitore principale, delegando i servizi all'interfaccia verso l'esterno).
* **Polimorfismo / Multiple Wiring:** Un componente "A" richiede interfaccia `Persona`. Sia il componente "Cliente" che "Organizzazione" forniscono `Persona`. Le connessioni possono avvenire dinamicamente, delegando all'infrastruttura il collegamento.
* **Subsystem:** Definisce interfacce raggruppando blocchi logici (`<<subsystem>>`). Un passo molto vicino alla realizzazione concreta del codice software e delle DLL o Jar che seguiranno.

### 5.2 Diagramma di Deployment
Mostra fisicamente i pezzi software e dove gireranno fisicamente: la distribuzione sull'Hardware.
* **Node (Nodo):** Una macchina elaborativa generica che esegue qualcosa (es. un server). Nodi interagiscono su linee di comunicazione (`CommunicationPath`).
* **Device:** Specifico nodo hardware computazionale fisico su cui posizionare eseguibili.
* **Execution Environment:** Nodo di ambiente software installato su OS (es. un Application Server come J2EE container o un DBMS). 
* **Artifact (Artefatto):** Prodotti generati dalla compilazione (file sorgenti, script, eseguibili come `.exe` o `.jar`). Vengono generati dal componente software. Questa generazione è mostrata tramite la dipendenza `<<manifest>>` dal Componente all'Artefatto.
* **Deployment Allocation:** Gli artefatti vengono poi posizionati sui Nodi tramite la dipendenza `<<deploy>>`.
* **Deployment Specification:** File XML o attributi che dettagliano la configurazione del parametro di esecuzione sul nodo fisico (es. uso dei threads, tipo transazione).

---

## 6. Progettazione Concettuale (Modello E/R)

Il primo passo della progettazione Dati si pone la domanda "Cosa" stiamo rappresentando e "Come" va modellato attraverso gli Schemi (Concettuale -> Logico -> Fisico).

### 6.1 Raccolta e Ristrutturazione Requisiti
La base si estrapola dall'interazione con gli utenti (spesso con visioni parziali), normative interne o interviste. Tali requisiti naturali sono altamente ambigui.
* **Regole Descrittive:** Si cerca il giusto livello di astrazione, standardizzando le frasi (scorporandole, ed escludendo le frasi che descrivono "funzioni/metodi" dalle frasi sui "dati e stato").
* **Sinonimi vs Omonimi:** Eliminare l'ambiguità per cui due cose si chiamano uguali (omonimo, "posto di lavoro/posto auto") o due concetti per la stessa cosa (sinonimo, "partecipante/studente").
* **Costruzione del Glossario dei Termini:** Documento vitale che reca Termine, Descrizione, eventuali Sinonimi e i Collegamenti verso le altre identità rilevanti.

### 6.2 Strategie di Progettazione dello Schema E/R
Un "concetto" dedotto dall'intervista va categorizzato. Si modella come:
* *Entità:* Se possiede proprietà, essenza autonoma.
* *Attributo:* Se è scalare, atomico e semplice.
* *Associazione:* Se stabilisce una regola di connessione logica tra entità.
* *Generalizzazione:* Se c'è rapporto "Is-A" padre-figlio.

Per arrivare allo schema reale, possiamo impiegare 4 macro-strategie:
1.  **Top-Down:** Schema generalizzato ad alto livello, via via si discesce al minimo particolare (Contro: occorre l'immagine globale già dall'inizio, dura nei casi vasti).
2.  **Bottom-Up:** Partire dai dettagli di vari reparti dell'azienda creando mini-modelli (Sottoschemi), per poi inglobarli in una gigantesca fase di integrazione (Pro: alta parallelizzazione del team. Contro: costi della fase di integrazione pazzeschi).
3.  **Inside-Out:** Si isola l'entità assolutamente centrale ("macchia d'olio") per poi muoversi per associazioni (Contro: obbliga a scansionare i requisiti ciclicamente fino alla fine).
4.  **Strategia Mista / Ibrida (La Più Utilizzata):** Si analizzano i requisiti con la costruzione del Glossario. Si definisce un *Schema Scheletro Base* con le macro entità (approccio top-down), lo si seziona per settori per affinarlo al dettaglio (bottom-up iterativo), aggiungendo specificità, attributi e chiavi. Fasi distribuite di Integrazione e analisi di Qualità finali.

### 6.3 Qualità di uno Schema Concettuale
Uno schema validato deve presentare le seguenti metriche di Qualità:
* **Correttezza:** Nessun errore sintattico o violazione semantica.
* **Completezza:** Non devono mancare entità menzionate nei requisiti; i dati utili sono tutti contemplati.
* **Leggibilità:** Schema chiaro ed esteticamente districato per la documentazione.
* **Minimalità:** Esenzione da ridondanze (anche se, in determinate scelte di trade-off per le performance finali del database e per il tempo di ricerca, talune ridondanze strategiche potranno in seguito essere intenzionalmente accettate).
