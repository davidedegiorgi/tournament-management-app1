tournament-management-app1/

# Tournament Management App (React)

Applicazione frontend per la gestione di tornei e squadre, costruita con **React 18**, **TypeScript** e **Vite**. Interfaccia progettata tramite **@base-ui/react**, **Tailwind CSS** e componenti custom.

---

##  Librerie principali

- **React 18** + **Vite 6**
- **TypeScript 5.7**
- **UI**: @base-ui/react, Tailwind CSS, lucide-react, react-day-picker
- **Form e validazione**: react-hook-form, @hookform/resolvers, zod
- **Gestione dati**: @tanstack/react-query
- **Routing**: react-router v7
- **Altre**: class-variance-authority, clsx

---

##  Struttura del progetto

```
tournament-management-app1/
├─ public/                  # assets statici gestiti da Vite
├─ src/
│  ├─ components/           # UI (button, input, dialog, ecc.)
│  ├─ features/
│  │   ├─ team/             # CRUD squadre (form + servizi dedicati)
│  │   └─ tournament/       # CRUD tornei, bracket, servizi
│  ├─ layouts/              # layout delle pagine (MainLayout)
│  ├─ lib/                  # utilità, fetch, tipi globali
│  ├─ pages/                # pagine principali (Dashboard, Tournaments, Teams)
│  └─ context/              # ThemeContext, provider vari
├─ tsconfig*.json           # configurazione TypeScript
├─ postcss.config.mjs       # configurazione Tailwind
├─ package.json             # dipendenze e script
└─ .env                     # variabili ambiente
```

---

##  Funzionamento del frontend

### Stato e API

- Le chiamate API sono centralizzate in `src/lib/backend.ts` e servizi statici per feature (`team-service.ts`, `tournament-service.ts`).
- **React Query** mantiene in cache le risposte e aggiorna i dati in modo reattivo.
- I dati vengono caricati solo quando necessario (es. apertura dialog), evitando fetch inutili.

### Gestione dei form

- Tutti i form usano **react-hook-form** per la gestione dello stato.
- La validazione è centralizzata con **Zod**.
- Gli schemi Zod sono risolti tramite `zodResolver`, garantendo coerenza tra tipi TypeScript e validazione runtime.

### UI e Routing

- Componenti UI modulari, riusabili e tipizzati (@base-ui/react, Tailwind CSS, custom).
- **React Router v7** per la navigazione multipagina (`/`, `/tournaments`, `/teams`).
- Tema light/dark gestito via ThemeContext e toggle persistente.

---

##  Installazione

1. **Clona il repository**  
  ```bash
  git clone <repo-url>
  cd tournament-management-app1
  ```

2. **Imposta l'URL del backend**  
  Crea un file `.env` nella root del progetto:
  ```
  VITE_BACKEND_URL=http://localhost:8000/api
  ```

3. **Installa le dipendenze**  
  ```bash
  npm install
  ```

4. **Avvia il server di sviluppo**  
  ```bash
  npm run dev
  ```

5. **Apri il progetto nel browser**  
  Di default su [http://localhost:5173](http://localhost:5173)

---

## 🌐 Variabili d'ambiente

- `VITE_BACKEND_URL`: endpoint base dell'API PHP (es: http://localhost:8000/api)
- `BASE_URL`: basename del router (utile se deployi l'app in una sottocartella)

---

##  Note tecniche

- **React Query**: caching, refetch, stato loading/error automatico.
- **Validazione**: tutti i dati utente sono validati sia lato client (Zod) che lato server.
- **UI**:responsive, accessibile, dark mode.
- **Routing**: URL dedicati per ogni pagina, stato bracket gestito in-page.


---

##  Dipendenze principali

- react, react-dom, react-router, @tanstack/react-query
- react-hook-form, zod, @hookform/resolvers
- tailwindcss, class-variance-authority, lucide-react
- @base-ui/react

Per dettagli su ogni file e architettura consulta anche il file `DOCUMENTAZIONE.md` incluso nel progetto.
- BASE_URL: basename del router (utile se l'app è servita da un sotto-path)

## Note rapide
- Centralizzare chiamate API in src/lib consente caching/invalidations coerenti.  
- Usare schemi Zod per mantenere sincronizzati tipi statici e runtime.  
- Integrare componenti shadcn/ui per coerenza visiva e accessibilità.
