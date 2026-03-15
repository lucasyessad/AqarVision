/**
 * JamesEdition — API Capture (Option 4)
 *
 * Utilise ScreenshotOne ou ApiFlash pour bypasser Cloudflare.
 * Ces services utilisent de vrais browsers managés.
 *
 * ScreenshotOne : https://screenshotone.com  (100 captures/mois gratuit)
 * ApiFlash      : https://apiflash.com       (100 captures/mois gratuit)
 *
 * Usage:
 *   SCREENSHOTONE_KEY=xxx node api-capture.js
 *   ou
 *   APIFLASH_KEY=xxx node api-capture.js
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "output", "api-captures");
mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { name: "homepage",       url: "https://www.jamesedition.com/fr" },
  { name: "search",         url: "https://www.jamesedition.com/fr/real_estate/" },
  { name: "listing-detail", url: "https://www.jamesedition.com/fr/real_estate/france/paris/apartment/27-rue-de-miromesnil-13978569/" },
];

// ── ScreenshotOne ──────────────────────────────────────────────────────────────
async function captureWithScreenshotOne(apiKey, page) {
  const params = new URLSearchParams({
    access_key:        apiKey,
    url:               page.url,
    full_page:         "true",
    viewport_width:    "1440",
    viewport_height:   "900",
    delay:             "5",              // wait 5s for JS
    block_ads:         "true",
    block_cookie_banners: "true",
    format:            "png",
    response_type:     "by_format",
  });

  const endpoint = `https://api.screenshotone.com/take?${params}`;
  console.log(`  📡 ScreenshotOne → ${page.name}`);

  const res = await fetch(endpoint);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ScreenshotOne error: ${res.status} — ${err}`);
  }

  const buffer = await res.arrayBuffer();
  const outPath = join(OUT_DIR, `screenshotone-${page.name}.png`);
  writeFileSync(outPath, Buffer.from(buffer));
  console.log(`  ✅ Saved → ${outPath}`);
  return outPath;
}

// ── ApiFlash ───────────────────────────────────────────────────────────────────
async function captureWithApiFlash(apiKey, page) {
  const params = new URLSearchParams({
    access_key:  apiKey,
    url:         page.url,
    full_page:   "true",
    width:       "1440",
    height:      "900",
    delay:       "5000",     // 5s for JS
    format:      "png",
    fresh:       "true",     // bypass cache
    no_cookie_banners: "true",
    no_ads:      "true",
  });

  const endpoint = `https://api.apiflash.com/v1/urltoimage?${params}`;
  console.log(`  📡 ApiFlash → ${page.name}`);

  const res = await fetch(endpoint);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ApiFlash error: ${res.status} — ${err}`);
  }

  const buffer = await res.arrayBuffer();
  const outPath = join(OUT_DIR, `apiflash-${page.name}.png`);
  writeFileSync(outPath, Buffer.from(buffer));
  console.log(`  ✅ Saved → ${outPath}`);
  return outPath;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const soKey = process.env.SCREENSHOTONE_KEY;
  const afKey  = process.env.APIFLASH_KEY;

  if (!soKey && !afKey) {
    console.log(`
❌ Aucune clé API trouvée.

Ajoute une variable d'environnement :

  # ScreenshotOne (100 caps/mois gratuit — https://screenshotone.com)
  export SCREENSHOTONE_KEY=ton_access_key

  # ou ApiFlash (100 caps/mois gratuit — https://apiflash.com)
  export APIFLASH_KEY=ton_access_key

Puis relance :
  node api-capture.js
`);
    process.exit(1);
  }

  console.log("🚀 Démarrage des captures API...\n");

  for (const page of PAGES) {
    try {
      if (soKey) {
        await captureWithScreenshotOne(soKey, page);
      } else if (afKey) {
        await captureWithApiFlash(afKey, page);
      }
    } catch (err) {
      console.error(`  ❌ Erreur sur ${page.name}:`, err.message);
    }
  }

  console.log(`
✅ Captures terminées !
📁 Fichiers → ${OUT_DIR}/

Envoie ces screenshots dans le chat Claude pour l'analyse.
`);
}

main().catch(console.error);
