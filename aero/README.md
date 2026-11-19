# Aero

Sito a scorrimento pubblicato su GitHub Pages: https://lucam185.github.io/Aero/

```
├── assets/        immagini + fonts/ (woff2, latin)
├── cad/           STL del case prototipo + prepare_cad.py -> case_edges.js
├── shared/        motore (base_engine.html), hudkit.js, scene_shared.js, fonts.css
├── horizontal/    16:9 1920x1080 — parts/, build.py, render.py
├── vertical/      9:16 1080x1920 — idem
├── site/          quello che pubblica GitHub Pages (solo file statici)
└── tools/         confronto HUD JS vs Python originale
```

I video di render (`*.mp4`) restano in locale e non vanno nel repo: superano il limite di GitHub.

Rigenerare: `cd horizontal && python3 build.py && python3 render.py` (idem `vertical/`).
Cambiato il CAD: `python3 cad/prepare_cad.py`, poi rifare build+render.

Aggiunti da noi sul CAD (non presenti nell'STL): pannello laterale -x (estrusione 3 mm della sagoma della testata +x, senza foro)
e vetro 153 x 86,7 mm incernierato sull'asse reale delle cerniere (y = 48,2 mm, z = 12,0 mm dal centro).

## Sito

`python3 site/build_site.py && cd site && python3 -m http.server 8000` → http://localhost:8000

Lo scroll pilota la timeline. La pagina carica solo l'orientamento che serve (orizzontale o verticale).
Il workflow in `.github/workflows/static.yml` pubblica la cartella `site/` su GitHub Pages a ogni push su `main`.
Nessuna build lato server: i font sono woff2 sullo stesso dominio, così il primo frame non aspetta fonts.googleapis.com.
