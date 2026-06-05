# Guida e Consigli per la Progettazione di Dettaglio (StudyLink)

Avendo consolidato un'architettura **Fat Client / SPA (Single Page Application)** che comunica tramite **API REST**, ecco i progetti di riferimento da usare come modello per disegnare i successivi Diagrammi dei Package e dei Componenti.

## 1. PRApp (Il migliore per il Fat Client / Frontend)
Questo è assolutamente il progetto più allineato alla natura di un Fat Client e alle moderne applicazioni web.

*   **Perché prenderlo come spunto:** Specifica chiaramente di aver usato il pattern **MVVM (Model-View-ViewModel)** per il frontend. Tutti i framework frontend moderni (come React, Vue, Angular) si basano su varianti di questo pattern (o pattern a componenti) in cui il client ha uno "stato" interno e genera la View autonomamente.
*   **Cosa guardare nei suoi diagrammi:** Controlla come hanno strutturato il diagramma dei package. Troverai un blocco "Frontend" nettamente separato dal "Backend". All'interno del frontend ci saranno i suoi "Model" (che fungono solo da rappresentazioni locali dei dati ricevuti dal server) e i suoi "ViewModel" o "Controller di interfaccia".

## 2. DoVado e Scambici (I migliori per le API REST e le interazioni Client-Server)
Entrambi questi progetti spingono tantissimo sull'approccio **REST stateless**, che è esattamente quello che è stato definito per il server di StudyLink.

*   **Perché prenderli come spunto:** 
    *   **DoVado** parla esplicitamente di *Client basato interamente su browser* che garantisce forte reattività.
    *   **Scambici** chiarisce la separazione netta e totale tra le interfacce Client, le API (L2) e l'Hosting/DB (L3).
*   **Cosa guardare nei loro diagrammi:** Concentrati sui diagrammi dei componenti e osserva come hanno modellato l'interfaccia esposta dal Server (spesso rappresentata con la "pallina" o l'interfaccia fornita `O-`) verso il Client. Il client comunica *esclusivamente* con le interfacce REST del backend, rimanendo del tutto cieco e isolato dai dettagli della persistenza e del database.

## 3. JustBit (Il migliore per il Backend e l'ORM)
Questo progetto è quello che più si avvicinava alle scelte tecnologiche iniziali di StudyLink sul lato server.

*   **Perché prenderlo come spunto:** È eccellente per capire come strutturare i package del **Server**. Poiché usa tecnologie e logiche simili (ORM, framework web lato server, Controller, JWT per sicurezza), i loro design pattern del backend (divisione tra Controller, Entità di dominio e Contesto del database) calzano a pennello con il vostro progetto.
*   **⚠️ Attenzione però:** Evita di copiare la loro gestione del frontend nei diagrammi. In questo progetto fanno un po' di confusione definendolo "Thin client" per poi usare un framework dinamico web. Prendi spunto da loro solo per il lato L2 (Server) e L3 (Persistenza).

---

## 💡 Un consiglio d'oro per evitare errori all'esame
Poiché StudyLink usa un **Fat Client**, quando disegnerai il Diagramma dei Package o dei Componenti, assicurati di **NON far comunicare MAI il client direttamente con l'ORM o con il Database**. 

*   Il **Client** (L1) deve avere una dipendenza (freccia) che punta *solo ed esclusivamente* verso il "Controller" del **Server** (L2), chiamando l'interfaccia ad esempio `API REST` o `Interfaccia HTTP`.
*   Solo il **Server** (L2) a sua volta potrà comunicare con il livello di **Persistenza / Database** (L3). 
*   Saltare il livello L2 e collegare il Client direttamente al Database è l'errore architetturale in cui cadono più spesso gli studenti in sede d'esame!
