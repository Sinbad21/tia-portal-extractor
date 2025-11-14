# TIA Portal DB Extractor

Applicazione web per estrarre automaticamente dati da PDF di dichiarazione DB di TIA Portal.

## 🚀 Funzionalità

- ✅ Upload PDF tramite drag & drop o click
- ✅ Estrazione automatica di Address, Name, Type, Initial Value e Comment
- ✅ Anteprima dati estratti
- ✅ Download in formato Excel (.xlsx)
- ✅ Download in formato CSV (separato da ;)
- ✅ Interfaccia moderna e responsive
- ✅ Elaborazione 100% lato client (nessun upload su server)

## 📦 Deploy su Cloudflare Pages

### Metodo 1: Deploy Diretto (Consigliato)

1. Vai su [Cloudflare Pages](https://pages.cloudflare.com/)
2. Clicca "Create a project"
3. Seleziona "Upload assets"
4. Carica questi file:
   - `index.html`
   - `app.js`
5. Clicca "Deploy site"

### Metodo 2: Deploy tramite Git

1. Crea un nuovo repository GitHub
2. Carica i file `index.html` e `app.js`
3. Vai su Cloudflare Pages
4. Clicca "Connect to Git"
5. Seleziona il repository
6. Configura build:
   - Build command: (lascia vuoto)
   - Build output directory: `/`
7. Clicca "Save and Deploy"

## 📁 Struttura File

```
tia-portal-extractor/
├── index.html          # Frontend HTML
├── app.js             # Logica JavaScript
└── README.md          # Questo file
```

## 🛠️ Tecnologie Utilizzate

- **PDF.js** - Parsing PDF lato client
- **SheetJS (XLSX)** - Generazione file Excel
- **HTML5/CSS3** - Interfaccia utente moderna
- **JavaScript ES6+** - Logica applicazione

## 💡 Come Usare

1. Apri l'applicazione nel browser
2. Clicca sull'area di upload o trascina un PDF
3. Clicca "Estrai Dati"
4. Attendi l'elaborazione
5. Scarica i risultati in Excel o CSV

## 📊 Formati Supportati

L'applicazione supporta PDF di dichiarazione DB di TIA Portal con formato:

```
Address | Name | Type | Initial value | Comment
+0.0    | var1 | BOOL | FALSE        | Descrizione
```

## 🔒 Privacy

- Tutti i dati vengono elaborati localmente nel browser
- Nessun file viene caricato su server esterni
- Nessun dato viene salvato o tracciato

## 📝 Limitazioni

- Dimensione massima file: 50MB
- Supporta solo file PDF
- Richiede browser moderno (Chrome, Firefox, Edge, Safari)

## 🐛 Troubleshooting

### Il PDF non viene estratto correttamente
- Verifica che il PDF sia nel formato standard di TIA Portal
- Prova a esportare nuovamente il DB da TIA Portal

### L'applicazione è lenta
- File PDF molto grandi richiedono più tempo
- Chiudi altre schede del browser per liberare memoria

## 🔄 Aggiornamenti

Versione 1.0.0 (Novembre 2024)
- Release iniziale
- Supporto per formati DB35 e DB47
- Export Excel e CSV

## 👨‍💻 Sviluppato da

Gabriele - Automazione Industriale

## 📄 Licenza

MIT License - Uso libero per progetti personali e commerciali
