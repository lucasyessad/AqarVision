# PROMPT CLAUDE CODE — Refonte complète AqarVision

> **Instructions :** Copie ce fichier dans ton projet, puis lance Claude Code avec :
> ```
> claude "Lis le fichier REFONTE-PROMPT.md et exécute les instructions étape par étape"
> ```
> Les fichiers référencés (design system, specs, prototype) doivent être dans le même dossier
> ou dans `.claude/` pour que Claude Code les trouve.

---

## CONTEXTE

AqarVision est une plateforme proptech algérienne (Next.js 15 + Supabase + Turborepo).
3 surfaces : AqarSearch (marketplace), AqarPro (dashboard agences), AqarChaab (espace particuliers).

Tu vas implémenter une refonte UX/UI complète basée sur le **Zinc Design System**.
Le prototype React de référence est dans `aqarsearch-refonte.jsx` — c'est la cible visuelle.
Le design system complet est dans `aqarvision-zinc-design-system.md` — c'est la source de vérité.

**Fichiers à lire OBLIGATOIREMENT avant de commencer :**
1. `aqarvision-zinc-design-system.md` — Design system complet (2981 lignes)
2. `spec-deposer-annonce-refonte.md` — Spec du wizard dépôt d'annonce
3. `aqarsearch-refonte.jsx` — Prototype visuel de référence (JSX React)

---

## PHASE 0 — Installation du Design System Zinc (30 min)

### 0.1 — Remplacer globals.css

Remplace entièrement `apps/web/src/app/globals.css` par le CSS du Zinc Design System
défini dans la PARTIE 3 du fichier `aqarvision-zinc-design-system.md`, section
"CSS Custom Properties (globals.css)".

Le nouveau CSS doit contenir :
- Variables `:root` / `[data-theme="light"]` avec la palette Zinc (bg-app, bg-surface, text-primary, etc.)
- Variables `[data-theme="dark"]` avec la palette dark
- Reset box-sizing, font-smoothing
- Focus ring avec accent (amber)
- Selection avec accent-ghost
- Scrollbar custom (6px, zinc)

**Supprimer** toutes les anciennes variables Onyx & Ivoire.

### 0.2 — Remplacer tailwind.config.ts

Remplace entièrement `apps/web/tailwind.config.ts` par la config Tailwind du Zinc Design System
définie dans la PARTIE 3, section "Complete Tailwind Configuration".

Points critiques :
- `darkMode: ["class", '[data-theme="dark"]']`
- Palette `zinc` (50-950) + `amber` (50-950) + semantic aliases (surface, primary, secondary, accent...)
- Couleurs real estate : `listing-sale`, `listing-rent`, `status-draft`, `status-published`...
- Font family : Geist (display+body), IBM Plex Sans Arabic, Geist Mono
- Font sizes : 2xs(11px) à 5xl(48px) avec line-heights
- Shadows : xs, sm, md, lg, xl, card, card-hover, ring
- Animations : fade-in, fade-out, slide-up, slide-down, scale-in, shimmer
- Timing : fast(100ms), normal(200ms), slow(300ms), slower(500ms)

### 0.3 — Remplacer les fonts dans app/layout.tsx

Remplacer Cormorant Garamond + DM Sans par :
- **Geist** (local font ou `next/font/local` avec fichiers woff2)
- **Geist Mono** (local font)
- **IBM Plex Sans Arabic** (via `next/font/google`, subsets: ["arabic"])

Si les fichiers Geist woff2 ne sont pas disponibles, utiliser `next/font/google` avec
`Inter` comme fallback temporaire en attendant les fichiers Geist, mais configurer
les variables CSS `--font-geist` et `--font-geist-mono`.

Ajouter les variables CSS sur `<html>` : `${geist.variable} ${geistMono.variable} ${ibmPlexArabic.variable}`

### 0.4 — Créer le hook useTheme + ThemeToggle

Créer `apps/web/src/lib/theme.ts` :
```typescript
"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored ?? "light";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  function applyTheme(t: Theme) {
    const resolved = t === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : t;
    document.documentElement.setAttribute("data-theme", resolved);
    document.cookie = `theme=${resolved};path=/;max-age=31536000`;
  }

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setThemeState(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return { theme, toggle };
}
```

Créer `apps/web/src/components/ThemeToggle.tsx` :
```tsx
"use client";
import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} className="size-9 flex items-center justify-center rounded-md
      text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-all duration-fast
      dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      aria-label={theme === "dark" ? "Mode clair" : "Mode sombre"}>
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
```

### 0.5 — Lire le cookie theme côté serveur pour le SSR

Dans `apps/web/src/app/layout.tsx`, lire le cookie `theme` et l'appliquer sur `<html>` :
```tsx
import { cookies } from "next/headers";

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value ?? "light";

  return (
    <html lang={locale} dir={dir} data-theme={theme}
      className={`${geist.variable} ${geistMono.variable} ${ibmPlexArabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

---

## PHASE 1 — Migrations DB + Fix RLS (15 min)

### 1.1 — Créer `supabase/migrations/00183_individual_rls_children.sql`

Copier le SQL complet de la section 1 du fichier `spec-deposer-annonce-refonte.md`.
Ce fichier ajoute les policies RLS manquantes pour `listing_translations`,
`listing_media`, `price_versions`, `status_versions` pour les particuliers.

### 1.2 — Créer `supabase/migrations/00184_listing_contact_fields.sql`

```sql
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS show_phone boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS accept_messages boolean NOT NULL DEFAULT true;
```

### 1.3 — Créer `supabase/migrations/00185_listing_extended_details.sql`

```sql
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS floor integer,
  ADD COLUMN IF NOT EXISTS total_floors integer,
  ADD COLUMN IF NOT EXISTS year_built integer,
  ADD COLUMN IF NOT EXISTS address_text text;
```

### 1.4 — Appliquer les migrations

```bash
supabase db push
# ou si en local :
supabase migration up
```

---

## PHASE 2 — Migration des couleurs hex (1-2h)

### 2.1 — Remplacement global des anciennes couleurs

Exécuter ces remplacements dans TOUS les fichiers `.tsx` et `.ts` de `apps/web/src/` :

```
FIND                           → REPLACE
bg-[#1a365d]                   → bg-zinc-950 dark:bg-zinc-50
text-[#1a365d]                 → text-zinc-950 dark:text-zinc-50
bg-[#d4af37]                   → bg-amber-500
text-[#d4af37]                 → text-amber-500
bg-[#f7fafc]                   → bg-zinc-50 dark:bg-zinc-950
text-[#2d3748]                 → text-zinc-800 dark:text-zinc-200
text-[#a0aec0]                 → text-zinc-400 dark:text-zinc-500
```

### 2.2 — Remplacement des CSS variables inline

```
FIND                                          → REPLACE
style={{ color: "var(--text-body)" }}         → className="text-zinc-500 dark:text-zinc-400"
style={{ color: "var(--text-dark)" }}         → className="text-zinc-950 dark:text-zinc-50"
style={{ color: "var(--text-muted)" }}        → className="text-zinc-400 dark:text-zinc-500"
style={{ color: "var(--onyx)" }}              → className="text-zinc-950 dark:text-zinc-50"
style={{ background: "var(--ivoire)" }}       → className="bg-zinc-50 dark:bg-zinc-950"
style={{ background: "var(--onyx)" }}         → className="bg-zinc-950 dark:bg-zinc-50"
style={{ borderColor: "var(--ivoire-border)" }} → className="border-zinc-200 dark:border-zinc-700"
```

### 2.3 — Supprimer les inline styles restants

Chercher tous les `style={{` dans les fichiers `.tsx` et les remplacer par des classes Tailwind.
Objectif : 0 inline styles dans les composants (sauf cas exceptionnel comme le positionnement map).

---

## PHASE 3 — Refonte Homepage AqarSearch (2-3h)

### Référence visuelle : `aqarsearch-refonte.jsx` → composant `HomePage`

Refaire `apps/web/src/app/[locale]/page.tsx` avec ces sections :

**Section 1 — Hero éditorial (100vh)**
- Photo background full-bleed d'Alger avec gradient overlay
- Statement typographique : "Trouvez votre chez-vous en Algérie" (text-7xl, font-bold)
- Mot "chez-vous" en amber-400
- SearchBar centré avec shadow-xl, focus = ring amber
- Pills Acheter/Louer/Vacances
- Scroll indicator bouncing en bas
- Header transparent qui devient solid au scroll (backdrop-blur-lg)

**Section 2 — Split éditorial**
- Grid 2 colonnes : texte start + photo end (full-bleed, pas de padding)
- Statement : "Plus de 15 000 biens dans 58 wilayas"
- CTA : "Explorer les annonces →" en amber

**Section 3 — Wilayas scroll horizontal**
- Cards wilaya : photo + nom + count annonces
- Scroll horizontal avec snap
- Hover : translateY(-4px) + shadow

**Section 4 — Listings mis en avant**
- Titre : "Les plus consultés"
- Grid 3 colonnes de ListingCards (composant existant refondu)

**Section 5 — Photo full-bleed + statement overlay**
- 60vh, gradient bottom
- Statement : "Chaque quartier a son caractère"

**Section 6 — Stats strip**
- Fond zinc-950, chiffres amber animés (counter 0→valeur)
- 4 stats : annonces, wilayas, agences, satisfaction

**Section 7 — CTA AqarPro**
- Texte centré + bouton amber

### Composants à créer :

```
src/components/editorial/HeroStatement.tsx
src/components/editorial/EditorialSplit.tsx
src/components/editorial/FullBleedPhoto.tsx
src/components/editorial/StatsStrip.tsx
src/components/editorial/WilayaScroller.tsx
src/hooks/useScrollReveal.ts       (IntersectionObserver fade-in)
src/hooks/useAnimatedCounter.ts    (counter 0→N animation)
```

Utiliser le code TSX défini dans `aqarvision-zinc-design-system.md` → PARTIE 5
"Patterns éditoriaux immersifs", section "Composants éditoriaux".

---

## PHASE 4 — Refonte page Recherche (2-3h)

### Référence visuelle : `aqarsearch-refonte.jsx` → composant `SearchPage`

Refaire `apps/web/src/app/[locale]/search/page.tsx` et `SearchPageClient.tsx` :

**Layout : Annonces d'abord, carte en option**

Deux modes avec toggle :
- **Mode "Annonces"** (défaut) : grille 3 colonnes pleine largeur
- **Mode "Carte"** : carte plein écran avec carousel flottant en bas

**Barre de recherche (haut de page, sticky) :**
- Input avec icône search + sparkle IA
- Toggle segmenté [Annonces | Carte]
- Chips de filtres actifs (amber ghost, X pour supprimer)
- Bouton "+ Filtres"
- Compteur résultats à droite

**Mode Annonces :**
- Barre de tri : Plus récents / Prix ↑ / Prix ↓ / Surface ↓ (pills actives amber)
- Bouton "Voir sur la carte" discret à droite
- Grid 3 colonnes de ListingCards avec stagger animation
- Pagination

**Mode Carte :**
- Carte MapLibre plein écran
- Toolbar draw-to-search (Déplacer/Dessiner/Heatmap/Reset)
- Bouton "Voir les annonces" en haut à droite
- Pins de prix (fond noir, texte amber, flèche)
- Carousel horizontal flottant en bas (cards compactes glassmorphism)
- Zoom controls

### Composants à modifier :

```
src/app/[locale]/search/SearchPageClient.tsx  → refonte layout
src/features/marketplace/components/SearchBar.tsx → HybridSearchBar
src/features/marketplace/components/SearchResults.tsx → ListingGrid (3 col)
src/features/marketplace/components/SearchMap.tsx → garder, adapter le style
src/features/listings/components/ListingCard.tsx → refonte Zinc complète
```

---

## PHASE 5 — Refonte ListingCard (1h)

### Référence visuelle : `aqarsearch-refonte.jsx` → composant `ListingCard`

Le composant le plus réutilisé du projet. Le refaire complètement.

```tsx
// src/features/listings/components/ListingCard.tsx
// Voir le code dans aqarvision-zinc-design-system.md → PARTIE 4 → "ListingCard (Real Estate)"
```

Points clés :
- Photo aspect-ratio 16/10, zoom au hover (scale 1.06, transition 500ms)
- Badge status top-end (arrondi full, 10px, fond colored/90)
- Bouton favori heart top-start (rond, bg-black/30, backdrop-blur)
- Compteur photos bottom-end (camera icon + count)
- Type coloré (Vente = blue-500, Location = violet-500)
- Wilaya en text-zinc-400
- Titre tronqué (truncate)
- Prix en text-lg font-bold tabular-nums
- Row détails : icônes Lucide (Bed, Bath, Ruler) + valeurs
- Card hover : translateY(-3px) + shadow-card-hover + border-zinc-300
- Utiliser `next/image` avec `fill` + `sizes`
- Support dark mode complet

---

## PHASE 6 — Refonte fiche Listing Detail (2-3h)

### Référence visuelle : `aqarsearch-refonte.jsx` → composant `DetailPage`

Refaire `apps/web/src/app/[locale]/l/[slug]/page.tsx` :

**Photo hero full-bleed (55vh) :**
- Image sans padding, bord à bord
- Gradient overlay bottom (transparent → noir 50%)
- Boutons favori + partage top-right (glassmorphism)
- Strip thumbnails centrée en bas (5 max + "+N")
- Click thumbnail → change photo active (crossfade)
- Click "+N" → ouvre lightbox

**Contenu : grid 2 colonnes (main + sidebar 360px)**

Main :
- Breadcrumb
- Badges type (colored) + property
- Titre (text-3xl font-bold)
- Localisation + ref
- Prix grand format + prix/m²
- Grid 4 facts clés (surface, pièces, SDB, étage) dans des cases bordered
- **Panel IA ✨** (collapsible) — voir `aqarvision-zinc-design-system.md` → PARTIE 4 → "AI Summary Panel"
  - Résumé texte
  - Grid 2 cols : points forts (vert) / points d'attention (amber)
  - Questions à poser
  - Disclaimer
- Description (texte)
- Équipements (chips amber-ghost avec check)
- Carte de proximité (MapLibre petit + pills catégories POI)
- Biens similaires (grid 3 cols)

Sidebar sticky (top: 72px) :
- Card agence (logo, nom, badge vérifiée, boutons Appeler/Message, lien vitrine)
- Bouton "Ajouter à un projet" (border dashed, hover amber)
- Mini-calculateur financement (apport 20%, mensualité estimée)

### Composants à créer :

```
src/features/listings/components/ListingPhotoHero.tsx
src/features/listings/components/ListingAISummary.tsx
src/features/listings/components/ListingKeyFacts.tsx
src/features/listings/components/ListingEquipments.tsx
src/features/listings/components/ProximityMap.tsx
src/features/listings/components/MortgageCalculator.tsx
src/features/listings/components/AgencySidebarCard.tsx
```

---

## PHASE 7 — Page Agences (2h)

### Référence visuelle : `aqarsearch-refonte.jsx` → composant `AgentsPage`

Créer `apps/web/src/app/[locale]/agences/page.tsx` :

**Layout simple et efficace :**
- Titre + sous-titre
- Barre de recherche (filtre par nom, spécialité, ville) — filtrage client-side instantané
- Dropdown wilaya
- Toggle "Vérifiées uniquement"
- Compteur résultats live
- Liste de cards agence horizontales (pas une grille — une liste scannable) :
  - Logo coloré (gradient) à gauche
  - Nom + badge vérifiée + spécialité + wilaya + description courte
  - Stats inline : N annonces · N ventes · N agents
  - Note + étoile + (N avis) à droite
  - Flèche → au clic
- Empty state si aucun résultat

### Vitrine agence (déjà existante dans `/a/[slug]`)

Refaire avec le style Heatherwick :
- Hero 50vh (cover photo agence + logo centré + statement + badges + boutons CTA)
- Bande stats
- Section "À propos"
- Grille biens avec filtre Tous/Vente/Location
- Bouton retour "← Toutes les agences"

---

## PHASE 8 — Refonte Wizard dépôt d'annonce (3-4h)

### Référence : `spec-deposer-annonce-refonte.md` (document complet)

Lire le fichier `spec-deposer-annonce-refonte.md` en entier. Il contient :
- Le fix RLS (déjà fait en Phase 1)
- Le nouveau wizard 7 étapes
- La spec détaillée de chaque étape avec wireframes
- Le schema Zod complet
- Le flow d'actions server-side (Draft → Photos → Publish)
- Les composants à créer (18 fichiers)
- La checklist de validation (19 points)

Implémenter dans l'ordre :
1. `IndividualListingV2Schema` (schema Zod étendu)
2. `createDraftIndividualListingAction` (crée le listing en draft)
3. `publishIndividualListingAction` (change status → published)
4. `DeposerWizardV2.tsx` (orchestrateur 7 étapes)
5. Les 7 composants d'étape (StepType → StepRecap)
6. `PhotoUploader.tsx` (drag-drop + upload Supabase Storage)
7. `LocationPicker.tsx` (MapLibre + pin draggable)
8. Modifier `apps/web/src/app/[locale]/deposer/page.tsx` pour utiliser le nouveau wizard

---

## PHASE 9 — Header & Navigation (1h)

### Header public (AqarSearch)

```
[Logo AqarVision] [Acheter] [Louer] [Agences] [Estimer]     [ThemeToggle] [FR▾] [Avatar/Login]
```

- Transparent sur le hero de la homepage, `bg-white/88 backdrop-blur-[16px]` sur scroll et autres pages
- Les liens nav sont des boutons ghost, le lien actif a `bg-accent-ghost text-accent`
- ThemeToggle : composant créé en Phase 0
- Locale switcher : dropdown simple
- Avatar : rond 32px avec initiale, dropdown au clic

### Header mobile

- Logo + burger à droite
- Bottom tab bar : Accueil, Recherche, Favoris, Alertes, Profil (5 items max)

---

## PHASE 10 — Cleanup final (30 min)

### 10.1 — Supprimer les fichiers obsolètes

```bash
rm -f projects/.gitkeep
rm -f projects/theme-genera-aqarvision.html
rm -f apps/web/src/features/listings/components/DeposerWizard.tsx  # remplacé par V2
```

### 10.2 — Vérifier qu'il n'y a plus d'inline styles

```bash
grep -rn "style={{" apps/web/src --include='*.tsx' | wc -l
# Objectif : < 20 (seulement pour les cas dynamiques comme map positioning)
```

### 10.3 — Vérifier qu'il n'y a plus d'anciens hex

```bash
grep -rn "#1a365d\|#d4af37\|#f7fafc\|#2d3748\|#a0aec0" apps/web/src --include='*.tsx' | wc -l
# Objectif : 0
```

### 10.4 — Vérifier le dark mode

Ouvrir l'app, toggle dark mode, naviguer sur :
- Homepage → vérifier hero, stats, cards
- Search → vérifier cards, filters, map
- Listing detail → vérifier photo hero, AI panel, sidebar
- Agences → vérifier cards, filters
- Déposer → vérifier wizard, inputs, buttons

### 10.5 — Vérifier le RTL

Switcher en locale `ar` et vérifier :
- Le texte est bien aligné à droite
- Les icônes directionnelles (flèches, chevrons) sont inversées
- Les paddings start/end sont corrects
- La sidebar est à droite en arabe

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
Phase 0  — Design System Zinc         (30 min)   ← FAIRE EN PREMIER
Phase 1  — Migrations DB + Fix RLS    (15 min)
Phase 2  — Migration couleurs hex     (1-2h)
Phase 3  — Homepage                   (2-3h)
Phase 4  — Page Recherche             (2-3h)
Phase 5  — ListingCard                (1h)
Phase 6  — Fiche Listing Detail       (2-3h)
Phase 7  — Page Agences               (2h)
Phase 8  — Wizard dépôt d'annonce     (3-4h)
Phase 9  — Header & Navigation        (1h)
Phase 10 — Cleanup final              (30 min)
                                      ──────────
                                      ~15-20h total
```

Tu peux faire les phases dans l'ordre, ou paralléliser (Phase 3-7 sont indépendantes).
Phase 0 et 1 DOIVENT être faites en premier car tout le reste en dépend.

---

## FICHIERS DE RÉFÉRENCE JOINTS

| Fichier | Contenu | Usage |
|---------|---------|-------|
| `aqarvision-zinc-design-system.md` | Design system complet (2981 lignes) | Source de vérité pour TOUTES les décisions visuelles |
| `spec-deposer-annonce-refonte.md` | Spec wizard dépôt (7 étapes) | Phase 8 uniquement |
| `aqarsearch-refonte.jsx` | Prototype React interactif | Référence visuelle pour toutes les pages |
| `aqarvision-v1-vs-v2-comparison.md` | Audit V1→V2 (problèmes restants) | Contexte sur les bugs à corriger |
| `aqarvision-cleanup-list.md` | Liste de nettoyage 27 points | Phase 10 cleanup |
