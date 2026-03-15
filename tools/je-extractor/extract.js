/**
 * JamesEdition Design Extractor — Mode Manuel
 *
 * Le browser s'ouvre en visible. Tu navigues, résous le CAPTCHA si besoin,
 * puis appuies sur ENTRÉE dans le terminal pour lancer l'extraction.
 *
 * Usage:
 *   node extract.js
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync, createReadStream } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as readline from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "output");
const SS_DIR = join(OUT_DIR, "screenshots");
mkdirSync(SS_DIR, { recursive: true });

// ── Attendre que l'utilisateur appuie sur ENTRÉE ──────────────────────────────
function waitForEnter(msg) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(msg, () => { rl.close(); resolve(); });
  });
}

// ── Extractions ───────────────────────────────────────────────────────────────
async function extractCSSVars(page) {
  return page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const vars = {};
    for (const prop of styles) {
      if (prop.startsWith("--")) vars[prop] = styles.getPropertyValue(prop).trim();
    }
    return vars;
  });
}

async function extractColors(page) {
  return page.evaluate(() => {
    const seen = new Map();
    for (const el of document.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      for (const prop of ["color", "backgroundColor", "borderColor", "borderTopColor", "outlineColor"]) {
        const val = cs[prop];
        if (val && val !== "rgba(0, 0, 0, 0)" && val !== "transparent") {
          seen.set(val, (seen.get(val) ?? 0) + 1);
        }
      }
    }
    return [...seen.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([color, count]) => ({ color, count }));
  });
}

async function extractFonts(page) {
  return page.evaluate(() => {
    const families = new Set();
    for (const el of document.querySelectorAll("*")) {
      const f = getComputedStyle(el).fontFamily;
      if (f) families.add(f);
    }
    const fontFaces = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules ?? []) {
          if (rule.constructor.name === "CSSFontFaceRule") fontFaces.push(rule.cssText.slice(0, 400));
        }
      } catch {}
    }
    return { families: [...families], fontFaces };
  });
}

async function extractComponents(page) {
  return page.evaluate(() => {
    const get = (sel) => document.querySelector(sel)?.outerHTML?.slice(0, 4000) ?? null;
    const getAll = (sel, n = 2) => [...document.querySelectorAll(sel)].slice(0, n).map(e => e.outerHTML.slice(0, 4000));
    return {
      header:  get("header") ?? get("[class*='header']") ?? get("[class*='Header']"),
      cards:   getAll("[class*='card'], [class*='Card'], [class*='listing'], [class*='Listing'], [class*='property'], article"),
      filters: get("[class*='filter'], [class*='Filter'], aside, [class*='sidebar']"),
      hero:    get("[class*='hero'], [class*='Hero'], [class*='search'], [class*='Search']"),
      footer:  get("footer"),
    };
  });
}

async function extractSpacing(page) {
  return page.evaluate(() => {
    const radii = new Map(), shadows = new Map();
    for (const el of document.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      if (cs.borderRadius && cs.borderRadius !== "0px") radii.set(cs.borderRadius, (radii.get(cs.borderRadius) ?? 0) + 1);
      if (cs.boxShadow && cs.boxShadow !== "none") shadows.set(cs.boxShadow, (shadows.get(cs.boxShadow) ?? 0) + 1);
    }
    return {
      borderRadius: [...radii.entries()].sort((a,b) => b[1]-a[1]).slice(0,10).map(([v,c]) => ({ value: v, count: c })),
      shadows:      [...shadows.entries()].sort((a,b) => b[1]-a[1]).slice(0,5).map(([v,c]) => ({ value: v, count: c })),
    };
  });
}

async function extractStylesheets(page) {
  return page.evaluate(() => {
    const out = [];
    for (const sheet of document.styleSheets) {
      try {
        const rules = [...(sheet.cssRules ?? [])].map(r => r.cssText).join("\n");
        if (rules.length > 200) out.push({ href: sheet.href ?? "inline", size: rules.length, css: rules.slice(0, 8000) });
      } catch {
        out.push({ href: sheet.href, blocked: true });
      }
    }
    return out;
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Ouverture du browser...\n");

  const browser = await chromium.launch({
    headless: false,
    args: ["--window-size=1440,900", "--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "languages", { get: () => ["fr-FR", "fr", "en-US"] });
    window.chrome = { runtime: {} };
  });

  const results = {};

  // ── 1. Homepage ──────────────────────────────────────────────────────────────
  {
    const page = await context.newPage();
    await page.goto("https://www.jamesedition.com/fr", { waitUntil: "domcontentloaded", timeout: 30000 });

    await waitForEnter(
      "\n👉 [HOMEPAGE] Le browser est ouvert.\n" +
      "   → Résous le CAPTCHA si présent\n" +
      "   → Attends que la page soit fully loaded\n" +
      "   → Appuie sur ENTRÉE ici pour lancer l'extraction...\n"
    );

    console.log("  📸 Screenshot homepage...");
    await page.screenshot({ path: join(SS_DIR, "homepage-full.png"), fullPage: true });
    await page.screenshot({ path: join(SS_DIR, "homepage-viewport.png"), fullPage: false });

    console.log("  🎨 Extraction tokens homepage...");
    results.homepage = {
      url: "https://www.jamesedition.com/fr",
      cssVars:     await extractCSSVars(page),
      colors:      await extractColors(page),
      fonts:       await extractFonts(page),
      components:  await extractComponents(page),
      spacing:     await extractSpacing(page),
      stylesheets: await extractStylesheets(page),
    };
    console.log(`  ✅ Homepage done — ${Object.keys(results.homepage.cssVars).length} CSS vars, ${results.homepage.colors.length} couleurs`);
    await page.close();
  }

  // ── 2. Search ────────────────────────────────────────────────────────────────
  {
    const page = await context.newPage();
    await page.goto("https://www.jamesedition.com/fr/real_estate/", { waitUntil: "domcontentloaded", timeout: 30000 });

    await waitForEnter(
      "\n👉 [SEARCH] Page de recherche ouverte.\n" +
      "   → Attends que les annonces soient chargées\n" +
      "   → Appuie sur ENTRÉE pour extraire...\n"
    );

    // Scroll pour charger les cards lazy-load
    await page.evaluate(async () => {
      for (let i = 0; i < 4; i++) {
        window.scrollBy(0, window.innerHeight * 0.8);
        await new Promise(r => setTimeout(r, 800));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);

    console.log("  📸 Screenshot search...");
    await page.screenshot({ path: join(SS_DIR, "search-full.png"), fullPage: true });
    await page.screenshot({ path: join(SS_DIR, "search-viewport.png"), fullPage: false });

    // Screenshot d'une seule card en gros plan
    const cardEl = await page.$("[class*='card'], [class*='Card'], [class*='listing'], article");
    if (cardEl) {
      await cardEl.screenshot({ path: join(SS_DIR, "search-card-zoom.png") });
      console.log("  ✅ Card screenshot capturée");
    }

    console.log("  🎨 Extraction tokens search...");
    results.search = {
      url: "https://www.jamesedition.com/fr/real_estate/",
      cssVars:     await extractCSSVars(page),
      colors:      await extractColors(page),
      fonts:       await extractFonts(page),
      components:  await extractComponents(page),
      spacing:     await extractSpacing(page),
      stylesheets: await extractStylesheets(page),
    };

    // Récupère une URL de listing pour l'étape suivante
    results._listingUrl = await page.evaluate(() => {
      const links = [...document.querySelectorAll("a[href]")];
      return links.find(a => a.href.match(/jamesedition\.com\/fr\/.+\/.+\/.+\/\d+/))?.href ?? null;
    });

    console.log(`  ✅ Search done — ${results.search.colors.length} couleurs`);
    await page.close();
  }

  // ── 3. Listing detail ────────────────────────────────────────────────────────
  const listingUrl = results._listingUrl;
  if (listingUrl) {
    console.log(`\n  → Listing trouvé : ${listingUrl}`);
    const page = await context.newPage();
    await page.goto(listingUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    await waitForEnter(
      "\n👉 [LISTING DETAIL] Page de détail ouverte.\n" +
      "   → Attends que les photos et le contenu soient chargés\n" +
      "   → Appuie sur ENTRÉE pour extraire...\n"
    );

    await page.evaluate(async () => {
      for (let i = 0; i < 5; i++) {
        window.scrollBy(0, window.innerHeight * 0.7);
        await new Promise(r => setTimeout(r, 700));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    console.log("  📸 Screenshot listing detail...");
    await page.screenshot({ path: join(SS_DIR, "listing-detail-full.png"), fullPage: true });
    await page.screenshot({ path: join(SS_DIR, "listing-detail-viewport.png"), fullPage: false });

    results["listing-detail"] = {
      url: listingUrl,
      components: await page.evaluate(() => {
        const get = (sel) => document.querySelector(sel)?.outerHTML?.slice(0, 5000) ?? null;
        return {
          title:   get("h1"),
          price:   get("[class*='price'], [class*='Price']"),
          gallery: get("[class*='gallery'], [class*='Gallery'], [class*='photo'], [class*='Photo']"),
          contact: get("[class*='contact'], [class*='Contact'], [class*='agent'], [class*='Agent']"),
          details: get("[class*='detail'], [class*='Detail'], [class*='feature'], [class*='Feature']"),
          breadcrumb: get("[class*='breadcrumb'], [class*='Breadcrumb'], nav[aria-label]"),
        };
      }),
      colors:  await extractColors(page),
      spacing: await extractSpacing(page),
    };

    console.log("  ✅ Listing detail done");
    await page.close();
  }

  await browser.close();

  // Nettoie l'URL interne avant de sauvegarder
  delete results._listingUrl;

  const outFile = join(OUT_DIR, "je-design.json");
  writeFileSync(outFile, JSON.stringify(results, null, 2));

  console.log(`
✅ Extraction complète !
📁 JSON        → ${outFile}
📸 Screenshots → ${SS_DIR}/

  homepage-full.png
  homepage-viewport.png
  search-full.png
  search-viewport.png
  search-card-zoom.png
  listing-detail-full.png
  listing-detail-viewport.png

Envoie ces fichiers dans le chat Claude pour l'analyse.
`);
}

main().catch(console.error);
