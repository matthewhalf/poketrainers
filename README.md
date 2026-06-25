# Poketrainers Champions - VGC Meta Browser

Una web app minimalista, premium e funzionale progettata per aiutare i giocatori che hanno appena iniziato a navigare il formato competitivo **Pokémon Champions VGC**.

L'applicazione integra i dati di utilizzo competitivo in tempo reale estratti da **Pikalytics** con l'enciclopedia statica di **PokeAPI v2**, offrendo una panoramica pulita e spiegazioni intuitive per i principianti.

---

## 🌟 Caratteristiche Principali

- **Metagame Dashboard**:
  - Classifica in tempo reale dei **Top 50 Pokémon** più usati nel formato Regulation Set M-B.
  - Ricerca istantanea e filtri per trovare rapidamente qualsiasi Pokémon.
  - Indicazione colorata del Winrate e del record (Vittorie/Sconfitte/Pareggi) per valutare l'efficacia reale delle scelte.

- **Sinergie e Core**:
  - Tab per visualizzare le **Core più comuni** composte da 2, 3 o 4 Pokémon usati insieme in tornei reali.
  - Spiegazione intuitiva dell'importanza delle Core per imparare ad assemblare team sinergici.

- **Schede Pokémon Dettagliate**:
  - **Identikit**: Artwork ufficiale, tipi e descrizione descrittiva (da PokeAPI).
  - **Statistiche Base**: Indicatori visivi delle statistiche di ciascun Pokémon con barra di progresso.
  - **Mosse, Strumenti e Abilità**: Elenco delle scelte più popolari con percentuali di utilizzo reali e **tooltips descrittivi a comparsa** (dati e descrizioni degli effetti recuperati direttamente da PokeAPI).
  - **Nature & EV Spreads**: Le distribuzioni EV di Pikalytics vengono automaticamente convertite nel formato standard di **Pokémon Showdown** (es. `252 Atk / 252 Spe / 4 HP`) per semplificare la comprensione ai principianti.
  - **Team d'Esempio Reali**: Visualizzazione delle squadre usate dai migliori giocatori nei tornei, con la composizione dei 6 Pokémon e i set esatti di mosse, strumento e abilità per il Pokémon selezionato.

- **Guida per Principianti**:
  - Pannello educativo integrato nella Dashboard che spiega come interpretare le statistiche, cos'è il metagame e come scegliere il primo team.

---

## 🛠️ Tecnologie Utilizzate

- **Next.js 16** (con App Router & React Server Components).
- **CSS3 Vanilla** per un design completamente personalizzato (vetromorfismo, layout responsive e animazioni fluide).
- **PokeAPI v2** per immagini, descrizioni ed enciclopedia di mosse/strumenti/abilità (con caching integrato lato server per 24 ore).
- **Pikalytics Scraping** tramite chiamate ai relativi endpoint e parsing strutturato della pagina HTML/Markdown.
- **Lucide React** per le icone.

---

## 🚀 Come Iniziare

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Avvia il server di sviluppo
```bash
npm run dev
```

### 3. Visualizza l'applicazione
Apri [http://localhost:3000](http://localhost:3000) sul tuo browser.
