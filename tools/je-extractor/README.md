# JE Extractor

Deux méthodes pour capturer le design de JamesEdition.

---

## Option 3 — Playwright Stealth (local, gratuit)

```bash
# 1. Installer les dépendances
npm install

# 2. Installer le browser Chromium
npx playwright install chromium

# 3. Lancer l'extraction
node extract.js
```

Le browser s'ouvre en mode visible (headless: false) pour mieux bypasser Cloudflare.
Attend ~2 minutes. En sortie :

- `output/je-design.json` — tous les tokens (couleurs, fonts, CSS vars, HTML components)
- `output/screenshots/homepage-full.png`
- `output/screenshots/search-full.png`
- `output/screenshots/listing-detail-full.png`

---

## Option 4 — API (ScreenshotOne ou ApiFlash)

### ScreenshotOne (recommandé)
1. Crée un compte gratuit sur https://screenshotone.com
2. Copie ton `access_key`
3. Lance :

```bash
SCREENSHOTONE_KEY=ton_access_key node api-capture.js
```

### ApiFlash
1. Crée un compte gratuit sur https://apiflash.com
2. Copie ton `access_key`
3. Lance :

```bash
APIFLASH_KEY=ton_access_key node api-capture.js
```

Fichiers créés dans `output/api-captures/`.

---

Envoie ensuite les screenshots + `je-design.json` dans le chat Claude.
