# AqarVision — Zinc Design System
## Skill UX/UI complète — Document unifié

> **8 modules fusionnés en un seul fichier.**
> Ce document est la source unique de vérité pour toutes les décisions
> visuelles, UX et UI du projet AqarVision.
>
> **Table des matières**
> 1. Philosophie & Principes (ligne ~20)
> 2. Product Vision & Benchmarks (ligne ~120)
> 3. Design Tokens — Couleurs, Typo, Spacing (ligne ~420)
> 4. Component Library (ligne ~780)
> 5. Patterns éditoriaux immersifs — Heatherwick (ligne ~1400)
> 6. AqarSearch — Marketplace UX (ligne ~2000)
> 7. AqarPro — Dashboard UX (ligne ~2300)
> 8. AqarChaab — Espace Particulier UX (ligne ~2550)

---


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 1 — PHILOSOPHIE & PRINCIPES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# AqarVision UX/UI Design System — "Zinc"

## Philosophy

**Tech premium meets real estate warmth.** Inspired by Linear's precision, Stripe's clarity, Airbnb's immersive photos, and Zillow's functional density. The system is called **Zinc** — cold, precise, with unexpected warmth.

**Core principles:**
- **Dense but breathable** — information-rich without clutter (Linear)
- **Precision micro-interactions** — every hover, focus, transition is intentional (Stripe)
- **Photo-first for listings** — large, immersive imagery drives exploration (Airbnb/Zillow)
- **Keyboard-navigable** — power users can navigate without a mouse (Linear)
- **RTL-native** — Arabic is a first-class citizen, not an afterthought
- **Light/dark toggle** — light default, dark mode with a single toggle
- **Dual mode** — UI mode (dense, functional) for dashboards/search + Editorial mode (immersive, full-bleed, statement typography) for marketing/vitrines/homepage (Heatherwick)

## Product Vision — What Makes AqarVision Different

Read `references/product-vision.md` for the complete benchmark analysis and differentiation strategy. Summary:

**Best module from each platform:**
- **Zillow** → split-view search results, photo gallery hero, fiche single-scroll
- **Domain (domain.com.au)** → draw-to-search carte, clusters prix, heatmap
- **Bayut** → fiche immersive (3D, plans, financement, contexte local)
- **realestate.com.au** → vision produit globale, IA conversationnelle discrète
- **Idealista** → simplicité européenne, densité maîtrisée
- **Rightmove** → alertes prix, suivi variations, "similar properties"

**4 différenciateurs AqarVision:**
1. **Recherche hybride** — classique + carte + IA + intention, dans un seul parcours
2. **Fiche augmentée IA** — résumé, points forts/faibles, questions à poser, cohérence prix
3. **Logique projet immobilier** — pas du browsing passif mais un cockpit (favoris, comparaison, financement, suivi)
4. **Mini-site agence natif** — vitrine thématisée intégrée au portail, pas séparée

## Quick Reference

Before implementing ANY component, read `references/design-tokens.md` for the complete token system. Before building a specific surface, read the relevant reference:

| Surface | Reference file | When to read |
|---------|---------------|--------------|
| Product strategy | `references/product-vision.md` | Before any major feature decision — benchmarks, différenciateurs, priorités |
| All surfaces | `references/design-tokens.md` | Always — colors, fonts, spacing, shadows, motion |
| All surfaces | `references/component-library.md` | Building any reusable component |
| Editorial pages | `references/editorial-immersive.md` | Homepage, vitrines agences, listing photo hero, landing pages, pages marketing. Patterns Heatherwick: scroll storytelling, full-bleed photos, statement typography, parallax, masonry grid |
| AqarSearch | `references/aqarsearch-ux.md` | Public marketplace pages (search, listing detail, homepage) |
| AqarPro | `references/aqarpro-ux.md` | Agency dashboard, CRM, analytics, settings |
| AqarChaab | `references/aqarchaab-ux.md` | Individual user space (favorites, alerts, messaging, projects) |

## Design Tokens — Summary

Full token definitions are in `references/design-tokens.md`. Here's the critical subset:

### Color System

The palette is built on **Zinc** (neutral gray with blue undertone) + **Amber** (warm accent) + **semantic colors**.

```
LIGHT MODE                          DARK MODE
──────────                          ─────────
--bg-app:      #FAFAFA              --bg-app:      #09090B
--bg-surface:  #FFFFFF              --bg-surface:  #18181B
--bg-muted:    #F4F4F5              --bg-muted:    #27272A
--bg-elevated: #FFFFFF              --bg-elevated: #1F1F23

--text-primary:   #09090B          --text-primary:   #FAFAFA
--text-secondary: #71717A          --text-secondary: #A1A1AA
--text-tertiary:  #A1A1AA          --text-tertiary:  #71717A

--border-default: #E4E4E7          --border-default: #27272A
--border-strong:  #D4D4D8          --border-strong:  #3F3F46

--accent:       #F59E0B            --accent:       #FBBF24
--accent-hover: #D97706            --accent-hover: #F59E0B
--accent-ghost: rgba(245,158,11,0.08)  --accent-ghost: rgba(251,191,36,0.08)

--success: #22C55E    --warning: #F59E0B    --danger: #EF4444    --info: #3B82F6
```

### Typography

```
--font-display:  "Geist", system-ui, sans-serif
--font-body:     "Geist", system-ui, sans-serif
--font-arabic:   "IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif
--font-mono:     "Geist Mono", "JetBrains Mono", monospace

Scale: 11px / 12px / 13px / 14px / 16px / 18px / 20px / 24px / 30px / 36px / 48px
Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
Line heights: 1.0 (headings) / 1.4 (ui) / 1.6 (body) / 1.8 (reading)
```

### Spacing

8px base grid: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 128`

### Border Radius

```
--radius-sm:   4px    (badges, tags)
--radius-md:   6px    (buttons, inputs)
--radius-lg:   8px    (cards, panels)
--radius-xl:   12px   (modals, dialogs)
--radius-2xl:  16px   (hero sections)
--radius-full: 9999px (avatars, pills)
```

### Shadows

```
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05)
--shadow-sm:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
--shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)
--shadow-lg:  0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)
--shadow-xl:  0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04)
```

Dark mode shadows use `rgba(0,0,0,0.4)` base with a subtle `rgba(255,255,255,0.02)` inset for depth.

### Motion

```
--ease-default: cubic-bezier(0.4, 0.0, 0.2, 1)   — general transitions
--ease-in:      cubic-bezier(0.4, 0.0, 1, 1)       — elements entering
--ease-out:     cubic-bezier(0.0, 0.0, 0.2, 1)     — elements exiting
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1)  — playful bounces

--duration-fast:    100ms   (hover states, toggles)
--duration-normal:  200ms   (transitions, dropdowns)
--duration-slow:    300ms   (modals, page transitions)
--duration-slower:  500ms   (complex animations)
```

## Implementation Rules

### Tailwind CSS

All tokens MUST be defined in `tailwind.config.ts` and used via Tailwind classes. **Never hardcode hex values in JSX.** The complete Tailwind config is in `references/design-tokens.md`.

### Dark Mode

Use Tailwind's `dark:` prefix. The toggle is controlled via a `data-theme="dark"` attribute on `<html>` and persisted in localStorage + cookie (for SSR).

```tsx
// ✅ Correct
<div className="bg-surface text-primary dark:bg-surface dark:text-primary">

// ❌ Wrong — never hardcode
<div style={{ background: "#FFFFFF", color: "#09090B" }}>
```

### RTL Support

- Use **CSS logical properties** exclusively: `ps-4` (padding-start), `me-2` (margin-end), `border-s` (border-start)
- Use `rtl:` and `ltr:` Tailwind prefixes for directional overrides
- Icons with directional meaning (arrows, chevrons) must flip in RTL
- Test every component in Arabic before shipping

### next/image

All images MUST use `next/image` with `fill` + `sizes` prop. Never use `<img>` tags.

### Inline Styles

**Zero inline styles.** All styling via Tailwind classes or CSS custom properties accessed through Tailwind.

## Component Architecture

The complete component library is in `references/component-library.md`. Key components:

### Core Primitives
Button, Input, Select, Textarea, Checkbox, Radio, Switch, Badge, Tag, Avatar, Tooltip, Skeleton

### Layout
AppShell, Sidebar, Header, Footer, PageContainer, Section, Grid, Stack, Divider

### Data Display
Card, ListingCard, DataTable, StatCard, MetricRow, ProgressBar, EmptyState

### Navigation
NavLink, Breadcrumb, Tabs, Pagination, CommandPalette (⌘K)

### Feedback
Toast, Dialog, Drawer, DropdownMenu, Popover, Alert, ConfirmDialog

### Real Estate Specific
PropertyCard, PhotoCarousel, PriceTag, TrustBadge, MapView, SearchBar, FilterPanel, MortgageCalculator, AgentCard, WilayaSelector

## Surface-Specific Guidelines

### AqarSearch (Marketplace) → `references/aqarsearch-ux.md`

The public-facing search experience. Photo-first, immersive, fast. Key patterns:
- **Homepage:** Hero search with animated background, trending wilayas, featured listings
- **Search results:** Split view (list + map) like Zillow, card carousel on mobile
- **Listing detail:** Full-bleed photo gallery, sticky sidebar CTA, structured data sections
- **Agency vitrine:** Themed storefront with agency branding

### AqarPro (Dashboard) → `references/aqarpro-ux.md`

Agency workspace. Dense, keyboard-friendly, productivity-focused. Key patterns:
- **Sidebar nav:** Collapsible, icon + label, agency switcher at top
- **Dashboard:** Stat cards row + activity feed + quick actions
- **Listings table:** Dense data table with inline actions, bulk operations
- **Leads Kanban:** Drag-and-drop columns with lead scoring badges
- **Settings:** Vertical tabs with preview panes

### AqarChaab (Espace) → `references/aqarchaab-ux.md`

Individual user space. Warm, personal, encouraging. Key patterns:
- **Home:** Welcome card with activity summary + quick actions
- **Favorites:** Grid view with collections, drag-to-organize
- **Alerts:** Timeline view with push notification preferences
- **Messaging:** Chat interface with typing indicators, read receipts
- **Profile:** Clean form with avatar upload, preference toggles

## Page Layout Templates

### Marketing/Public Pages
```
[Header — sticky, transparent on hero, solid on scroll]
[Hero — full-width, 60-80vh, search bar centered]
[Content sections — max-w-7xl mx-auto, alternating bg]
[CTA section — accent bg, centered text + button]
[Footer — dark bg, 4-column links, locale switcher]
```

### Dashboard Pages (AqarPro)
```
[Sidebar — 240px, collapsible to 64px] [Main]
                                        [Page header — title + actions]
                                        [Content — max-w-6xl, cards/tables]
```

### Espace Pages (AqarChaab)
```
[Sidebar — 240px desktop, bottom nav mobile] [Main]
                                              [Page header — title]
                                              [Content — max-w-5xl, relaxed spacing]
```

## Migration from Current Design

The current codebase has 355 hardcoded hex values and 1024 inline styles. Migration steps:

1. **Replace globals.css** — swap Onyx & Ivoire variables with Zinc tokens
2. **Update tailwind.config.ts** — replace color definitions with the new Zinc palette
3. **Migrate components** — replace `bg-[#1a365d]` → `bg-zinc-950` / `dark:bg-zinc-50`, etc.
4. **Remove inline styles** — replace `style={{ color: "var(--text-body)" }}` with `className="text-secondary"`
5. **Add dark mode** — add `dark:` variants to every color class
6. **Load Geist font** — replace Cormorant Garamond + DM Sans with Geist via `next/font`

### Color Migration Map

```
OLD                    → NEW LIGHT              → NEW DARK
#1a365d (blue-night)   → zinc-900               → zinc-50
#d4af37 (gold)         → amber-500              → amber-400
#f7fafc (off-white)    → zinc-50                → zinc-950
#2d3748 (gray-700)     → zinc-800               → zinc-200
#a0aec0 (gray-400)     → zinc-400               → zinc-500
#0D0D0D (onyx)         → zinc-950               → zinc-50
#FDFBF7 (ivoire)       → zinc-50 / white        → zinc-950
#B8A88A (or)           → amber-500              → amber-400
var(--text-body)       → text-secondary         → dark:text-secondary
var(--text-muted)      → text-tertiary          → dark:text-tertiary
var(--onyx)            → bg-zinc-950            → dark:bg-zinc-50
var(--ivoire)          → bg-zinc-50             → dark:bg-zinc-950
```


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 2 — PRODUCT VISION & BENCHMARKS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Product Vision & Benchmark — AqarVision Differentiation

## Benchmark: Best Module from Each Platform

AqarVision ne copie pas un site entier. Il prend le **meilleur module** de chacun.

### Recherche carte intelligente ← Domain + Rightmove + Zillow

**Ce qu'ils font bien :**
- Domain (domain.com.au) : carte interactive avec **zone dessinée** (draw-to-search), clusters prix, heatmaps quartier. Le standard le plus avancé.
- Rightmove : carte UK avec filtres inline sur la carte, résultats qui se rafraîchissent en temps réel au déplacement.
- Zillow : split-view carte/liste, pins avec prix, photo carousel dans les popups carte, zoom = filtre automatique.

**Ce qu'AqarVision doit implémenter :**
- Draw-to-search : l'utilisateur dessine une zone sur la carte → les résultats se filtrent en temps réel (PostGIS `ST_Within` + polygon GeoJSON)
- Clusters prix au zoom out (agrégation par wilaya/commune)
- Pins avec prix formatés en DA, popup card avec photo + prix + surface au clic
- Sync bidirectionnelle : hover card ↔ highlight pin, click pin ↔ scroll-to-card
- Bounding box auto-filter quand l'utilisateur déplace la carte
- Heatmap optionnelle : prix au m² par zone (données `agency_stats_daily`)

### Fiche bien immersive ← Zillow + Bayut

**Ce qu'ils font bien :**
- Zillow : layout single-scroll élargi, section médias hero full-bleed, galerie magazine, sections structurées ("What's Special", "Market Value", "Monthly Cost", "Neighborhood")
- Bayut : visite 3D intégrée, plans d'étage interactifs, détails bâtiment exhaustifs (année, étages, parking, ascenseur), calculateur financement, contexte local (écoles, transport, commerces à proximité)

**Ce qu'AqarVision doit implémenter :**
- Photo gallery hero full-bleed avec compteur + lightbox
- Sections structurées avec ancres : Résumé, Caractéristiques, Description, Équipements, Localisation, Estimation, Contact
- Calculateur de financement (mensualités selon apport + taux + durée)
- Carte de proximité : POIs dans un rayon de 1km (écoles, mosquées, commerces, transport)
- Support futur : 3D tour embed (iframe Matterport/similar) et plans d'étage
- Trust score visible avec explication

### Favoris et alertes ← Zillow + realestate.com.au + Rightmove

**Ce qu'ils font bien :**
- Zillow : co-shopping (partager des favoris avec un co-acheteur), messaging intégré, organisation par listes
- realestate.com.au : suivi des variations de prix sur les favoris, notifications push, comparaison côte-à-côte
- Rightmove : alertes email précises, historique des baisses de prix, "similar properties" automatique

**Ce qu'AqarVision doit implémenter :**
- Collections de favoris (multi-dossiers : "Alger centre", "Budget < 5M", "Pour les parents")
- Comparaison côte-à-côte (jusqu'à 4 biens)
- Suivi des variations de prix sur les favoris (notification quand un prix baisse)
- Partage de favoris via lien (accessible sans compte)
- Alertes avec fréquence configurable (instantané, quotidien, hebdomadaire)
- Notes privées sur chaque bien (déjà implémenté)

### Recherche contextuelle ← Bayut + Trulia

**Ce qu'ils font bien :**
- Bayut : recherche par lifestyle (proche plage, proche école, quartier calme), données quartier détaillées (démographie, transport, services)
- Trulia : carte de criminalité, bruit, école rating, commute time — chercher "un endroit" pas juste "un bien"

**Ce qu'AqarVision doit implémenter :**
- Recherche par intention : "proche école", "quartier calme", "vue mer", "potentiel locatif"
- Score quartier par commune (données ouvertes Algérie : écoles, transports, services)
- Filtre de temps de trajet : "moins de 30 min de mon travail" (isochrone map)
- Tags lifestyle sur les listings : "calme", "animé", "vue mer", "proche campus"

### IA discrète mais partout ← realestate.com.au (ChatGPT integration)

**Ce qu'ils font bien :**
- realestate.com.au : recherche conversationnelle via ChatGPT dans l'app, suggestions contextuelles, pas de rupture avec la recherche classique

**Ce qu'AqarVision doit implémenter :**
- Barre de recherche hybride : tape un filtre classique OU une phrase naturelle
- "F3 lumineux calme Alger < 5M" → parsé en filtres structurés automatiquement
- Suggestions IA en dessous de la barre : "Essayez : proche école, vue dégagée, rez-de-jardin"
- NE PAS forcer l'IA : toujours permettre la recherche classique (filtres) en parallèle

---

## Les 4 Différenciateurs AqarVision

### 1. Recherche réellement hybride

**Concept :** Unifier recherche classique + carte + conversation IA + recherche par intention dans un seul parcours fluide.

**UX Flow :**
```
┌─────────────────────────────────────────────────────────┐
│  SearchBar                                               │
│  [🔍 F3 lumineux, calme, proche école, < 5M DA    ]    │
│                                                          │
│  IA Parse → Filtres auto-détectés:                      │
│  [F3 ✕] [< 5M DA ✕] [Calme ✕] [Proche école ✕]       │
│                                                          │
│  "Affiner avec les filtres classiques" →                 │
│  [Wilaya ▾] [Type ▾] [Prix min-max] [Surface ▾]        │
│                                                          │
│  OU "Dessiner une zone sur la carte" →                   │
│  [Carte avec outil crayon]                               │
└─────────────────────────────────────────────────────────┘
```

**Implémentation technique :**
- Input unique : si le texte contient des filtres parsables (nombre, wilaya, type), extraire en structured filters
- Si le texte est une intention ("lumineux", "calme"), passer à l'API Claude pour extraction de critères
- Afficher les filtres détectés comme des chips éditables sous la barre
- L'utilisateur peut toujours modifier/supprimer chaque filtre manuellement
- La carte s'ajuste automatiquement aux résultats
- Keyboard shortcut : `/` pour focus la barre de recherche

### 2. Fiche bien augmentée par l'IA

**Concept :** Chaque listing a un résumé IA, des points forts/faibles, et une aide contextuelle.

**UX Layout dans la fiche :**
```
┌─────────────────────────────────────────────────────┐
│  ✨ Résumé IA                                       │
│  "F3 bien situé à Hydra avec vue dégagée.          │
│   Surface correcte pour le quartier. Prix légèrement│
│   au-dessus de la médiane (+8%). Bon pour famille   │
│   avec enfants (2 écoles à <500m)."                 │
│                                                      │
│  Points forts                    Points d'attention  │
│  ✅ Vue dégagée                 ⚠️ Prix > médiane   │
│  ✅ 2 écoles à proximité       ⚠️ Pas d'ascenseur  │
│  ✅ Parking inclus              ⚠️ 4ème étage       │
│                                                      │
│  Questions à poser à l'agence                       │
│  • Charges mensuelles de copropriété ?              │
│  • Date de disponibilité ?                          │
│  • Possibilité de négociation ?                     │
│                                                      │
│  [Généré par IA · Peut contenir des approximations] │
└─────────────────────────────────────────────────────┘
```

**Implémentation :**
- Généré côté serveur au moment de la publication (AI job type: `listing_analysis`)
- Caché en DB dans `ai_jobs.output_payload` ou un champ dédié `listing_ai_summary`
- Affiché dans un panel collapsible (ouvert par défaut)
- Badge "✨ Résumé IA" avec disclaimer
- Pas de re-génération à chaque vue — cache invalidé seulement si le listing est modifié

### 3. Logique "Projet immobilier"

**Concept :** Transformer l'expérience de "browsing passif" en "cockpit de projet".

**UX — Espace projet dans AqarChaab :**
```
┌─────────────────────────────────────────────────────┐
│  Mes projets                    [+ Nouveau projet]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📁 Appartement Alger                               │
│  Budget: 3-5M DA · Type: F3/F4 · Zone: Alger centre│
│  ├── 6 favoris sauvegardés                          │
│  ├── 2 comparaisons en cours                        │
│  ├── 1 conversation agence active                   │
│  ├── Simulation financement: 35K DA/mois            │
│  └── Dernière activité: il y a 2h                   │
│                                                      │
│  📁 Terrain Tipaza                                  │
│  Budget: 8-12M DA · Type: Terrain · Zone: Tipaza   │
│  ├── 3 favoris                                      │
│  ├── 1 alerte active                                │
│  └── Dernière activité: hier                        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Fonctionnalités du projet :**
- Multi-dossiers avec critères de base (budget, type, zone)
- Favoris rattachés à un projet
- Comparaison côte-à-côte (tableau: prix, surface, pièces, wilaya, score, photos)
- Simulation de financement par projet (montant, apport, taux, durée → mensualités)
- Historique des conversations agence liées au projet
- Checklist de progression : Recherche → Visites → Négociation → Acte → Clés
- Partage du projet avec un co-acheteur (lien)

### 4. Mini-site agence natif mais branché à la recherche

**Concept :** Chaque agence est une micro-marque dans la plateforme, avec sa vitrine thématisée mais intégrée au portail.

**UX — Intégration vitrine ↔ portail :**

```
PORTAIL (AqarSearch)                    VITRINE (a/[slug])
┌──────────────────┐                    ┌──────────────────┐
│ Listing Card     │ ── clic agence ──→ │ VITRINE AGENCE   │
│ [photo]          │                    │ [theme custom]    │
│ F3 Hydra         │                    │ [logo, couleurs]  │
│ Par: Immo Plus   │                    │ [tous les biens]  │
│ ✓ Vérifiée      │                    │ [contact direct]  │
└──────────────────┘                    └──────────────────┘
       ↑                                        │
       │                                        │
       └───── clic "Retour aux résultats" ──────┘
```

**Connexions bidirectionnelles :**
- Sur la fiche bien : lien vers la vitrine agence (sidebar)
- Sur la vitrine : tous les biens de l'agence avec les mêmes cards que le portail
- Dans les résultats de recherche : badge "Agence vérifiée" + lien profil
- Vitrine personnalisable : thème (15 options), couleurs, logo, cover, description
- Analytics partagées : l'agence voit les stats de sa vitrine dans AqarPro
- SEO : chaque vitrine a son propre slug, meta, JSON-LD (déjà en place)

---

## Mapping Benchmark → Composants AqarVision

| Module benchmark | Source | Composant(s) AqarVision | Priorité |
|-----------------|--------|-------------------------|----------|
| Draw-to-search carte | Domain | `SearchMap` + PostGIS polygon | P1 |
| Split-view résultats | Zillow | `SearchPageClient` layout | P1 |
| Photo gallery hero | Zillow + Bayut | `PhotoGallery` | P1 |
| Fiche structurée par sections | Zillow | `ListingDetail` page | P1 |
| Calculateur financement | Bayut | `MortgageCalculator` | P1 (existant) |
| Collections de favoris | Zillow + realestate.com.au | `CollectionsManager` | P1 (existant) |
| Comparaison côte-à-côte | realestate.com.au | `CompareView` (à créer) | P2 |
| Suivi variations prix | Rightmove | Notification system + `price_versions` | P2 |
| Recherche hybride IA | realestate.com.au | `SearchBar` + Claude parse | P2 |
| Résumé IA fiche | Original AqarVision | `ListingAISummary` (à créer) | P2 |
| Projet immobilier | Original AqarVision | `ProjectDashboard` (à créer) | P3 |
| Score quartier | Trulia + Bayut | `NeighborhoodScore` (à créer) | P3 |
| Carte de proximité POIs | Bayut | `ProximityMap` (à créer) | P3 |
| Isochrone / temps de trajet | Domain | `CommuteFilter` (à créer) | P4 |
| Visite 3D | Bayut | Iframe Matterport embed | P4 |

---

## Principes de Différenciation UX

### 1. Ne jamais forcer l'IA
L'IA est un raccourci, pas un mur. Chaque fonctionnalité IA a **toujours** un équivalent classique visible. L'utilisateur qui tape "F3 Alger" ne doit jamais être redirigé vers un chat bot — il reçoit des résultats filtrés, point.

### 2. Le projet > le listing
Les listings sont des briques. Le vrai produit est le **projet immobilier** de l'utilisateur. Chaque feature (favoris, alertes, comparaison, financement, messagerie) doit pouvoir être rattachée à un projet.

### 3. L'agence est un partenaire, pas un fournisseur
La vitrine agence n'est pas un profil secondaire — c'est une surface first-class. L'agence doit pouvoir exprimer son identité (branding) tout en restant dans l'écosystème portail (recherche unifiée, analytics partagées).

### 4. Mobile-first, desktop-enhanced
65%+ du trafic immobilier est mobile en Algérie. Chaque feature est conçue pour mobile d'abord, puis enrichie sur desktop (carte plus large, split-view, raccourcis clavier).

### 5. Algérie-native
58 wilayas, 1541 communes, prix en DA, RTL arabe, noms de lieux locaux. Pas d'adaptation d'un template US/EU — c'est construit pour l'Algérie dès le départ.


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 3 — DESIGN TOKENS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Design Tokens — Zinc Design System

## Complete Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Zinc neutral ramp (core palette) ──────────────────
        zinc: {
          50:  "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
          950: "#09090B",
        },

        // ── Amber accent (warm, action-oriented) ──────────────
        amber: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          950: "#451A03",
        },

        // ── Semantic aliases ──────────────────────────────────
        surface:    "var(--bg-surface)",
        "surface-muted":  "var(--bg-muted)",
        "surface-elevated": "var(--bg-elevated)",
        primary:    "var(--text-primary)",
        secondary:  "var(--text-secondary)",
        tertiary:   "var(--text-tertiary)",
        accent:     "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-ghost": "var(--accent-ghost)",

        // ── Status colors ─────────────────────────────────────
        success:    { DEFAULT: "#22C55E", ghost: "rgba(34,197,94,0.08)" },
        warning:    { DEFAULT: "#F59E0B", ghost: "rgba(245,158,11,0.08)" },
        danger:     { DEFAULT: "#EF4444", ghost: "rgba(239,68,68,0.08)" },
        info:       { DEFAULT: "#3B82F6", ghost: "rgba(59,130,246,0.08)" },

        // ── Real estate specific ──────────────────────────────
        "listing-sale":     "#3B82F6",
        "listing-rent":     "#8B5CF6",
        "listing-vacation": "#F59E0B",
        "status-draft":     "#71717A",
        "status-pending":   "#F59E0B",
        "status-published": "#22C55E",
        "status-paused":    "#A1A1AA",
        "status-rejected":  "#EF4444",
        "status-sold":      "#3B82F6",
      },

      fontFamily: {
        display: ["Geist", "system-ui", "sans-serif"],
        body:    ["Geist", "system-ui", "sans-serif"],
        arabic:  ["IBM Plex Sans Arabic", "Noto Sans Arabic", "sans-serif"],
        mono:    ["Geist Mono", "JetBrains Mono", "monospace"],
      },

      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],      // 11px
        xs:    ["0.75rem",   { lineHeight: "1rem" }],       // 12px
        sm:    ["0.8125rem", { lineHeight: "1.25rem" }],    // 13px
        base:  ["0.875rem",  { lineHeight: "1.25rem" }],    // 14px — default body
        md:    ["1rem",      { lineHeight: "1.5rem" }],     // 16px
        lg:    ["1.125rem",  { lineHeight: "1.75rem" }],    // 18px
        xl:    ["1.25rem",   { lineHeight: "1.75rem" }],    // 20px
        "2xl": ["1.5rem",    { lineHeight: "2rem" }],       // 24px
        "3xl": ["1.875rem",  { lineHeight: "2.25rem" }],    // 30px
        "4xl": ["2.25rem",   { lineHeight: "2.5rem" }],     // 36px
        "5xl": ["3rem",      { lineHeight: "1" }],          // 48px
      },

      spacing: {
        "4.5": "1.125rem",   // 18px
        "13":  "3.25rem",    // 52px
        "15":  "3.75rem",    // 60px
        "18":  "4.5rem",     // 72px
        "88":  "22rem",      // 352px (sidebar expanded)
        "16s": "4rem",       // 64px (sidebar collapsed)
      },

      borderRadius: {
        sm:    "4px",
        DEFAULT: "6px",
        md:    "6px",
        lg:    "8px",
        xl:    "12px",
        "2xl": "16px",
      },

      boxShadow: {
        xs:  "0 1px 2px rgba(0,0,0,0.05)",
        sm:  "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        md:  "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
        lg:  "0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)",
        xl:  "0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04)",
        card:      "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "card-hover": "0 8px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)",
        ring:      "0 0 0 2px var(--accent)",
        "ring-offset": "0 0 0 2px var(--bg-surface), 0 0 0 4px var(--accent)",
      },

      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        spring:  "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      transitionDuration: {
        fast:    "100ms",
        normal:  "200ms",
        slow:    "300ms",
        slower:  "500ms",
      },

      keyframes: {
        "fade-in":      { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out":     { from: { opacity: "1" }, to: { opacity: "0" } },
        "slide-up":     { from: { transform: "translateY(4px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "slide-down":   { from: { transform: "translateY(-4px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "scale-in":     { from: { transform: "scale(0.97)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
        "shimmer":      { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "spin-slow":    { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
      },

      animation: {
        "fade-in":    "fade-in 200ms ease-out",
        "fade-out":   "fade-out 150ms ease-in",
        "slide-up":   "slide-up 200ms ease-out",
        "slide-down": "slide-down 200ms ease-out",
        "scale-in":   "scale-in 200ms ease-out",
        "shimmer":    "shimmer 2s ease-in-out infinite",
        "spin-slow":  "spin-slow 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

## CSS Custom Properties (globals.css)

```css
/* ============================================================
   AQARVISION — ZINC DESIGN SYSTEM
   Tech premium. Dense but breathable. Light + Dark.
   ============================================================ */

:root,
[data-theme="light"] {
  color-scheme: light;

  /* Backgrounds */
  --bg-app:       #FAFAFA;
  --bg-surface:   #FFFFFF;
  --bg-muted:     #F4F4F5;
  --bg-elevated:  #FFFFFF;
  --bg-overlay:   rgba(0, 0, 0, 0.5);

  /* Text */
  --text-primary:    #09090B;
  --text-secondary:  #71717A;
  --text-tertiary:   #A1A1AA;
  --text-inverse:    #FAFAFA;

  /* Borders */
  --border-default:  #E4E4E7;
  --border-strong:   #D4D4D8;
  --border-focus:    #F59E0B;

  /* Accent */
  --accent:          #F59E0B;
  --accent-hover:    #D97706;
  --accent-ghost:    rgba(245, 158, 11, 0.08);
  --accent-glow:     rgba(245, 158, 11, 0.15);

  /* Shadows */
  --shadow-color: rgba(0, 0, 0, 0.08);

  /* Typography */
  --font-display: "Geist", system-ui, sans-serif;
  --font-body:    "Geist", system-ui, sans-serif;
  --font-arabic:  "IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif;
  --font-mono:    "Geist Mono", "JetBrains Mono", monospace;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Sidebar */
  --sidebar-width: 240px;
  --sidebar-collapsed: 64px;
}

[data-theme="dark"] {
  color-scheme: dark;

  --bg-app:       #09090B;
  --bg-surface:   #18181B;
  --bg-muted:     #27272A;
  --bg-elevated:  #1F1F23;
  --bg-overlay:   rgba(0, 0, 0, 0.7);

  --text-primary:    #FAFAFA;
  --text-secondary:  #A1A1AA;
  --text-tertiary:   #71717A;
  --text-inverse:    #09090B;

  --border-default:  #27272A;
  --border-strong:   #3F3F46;
  --border-focus:    #FBBF24;

  --accent:          #FBBF24;
  --accent-hover:    #F59E0B;
  --accent-ghost:    rgba(251, 191, 36, 0.08);
  --accent-glow:     rgba(251, 191, 36, 0.12);

  --shadow-color: rgba(0, 0, 0, 0.4);
}

/* ── Base reset ─────────────────────────────────────────── */
* { box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body {
  font-family: var(--font-body);
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--bg-app);
}
html[dir="rtl"] body { font-family: var(--font-arabic); }

/* ── Focus ring ─────────────────────────────────────────── */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* ── Selection ──────────────────────────────────────────── */
::selection {
  background: var(--accent-ghost);
  color: var(--text-primary);
}

/* ── Scrollbar (Webkit) ─────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-tertiary); }
```

## Font Loading (Next.js)

```typescript
// app/layout.tsx
import localFont from "next/font/local";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

const geist = localFont({
  src: [
    { path: "./fonts/Geist-Regular.woff2", weight: "400" },
    { path: "./fonts/Geist-Medium.woff2", weight: "500" },
    { path: "./fonts/Geist-SemiBold.woff2", weight: "600" },
    { path: "./fonts/Geist-Bold.woff2", weight: "700" },
  ],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Regular.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});
```

## Dark Mode Implementation

```typescript
// lib/theme.ts
"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored ?? "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function applyTheme(t: Theme) {
    const resolved = t === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : t;
    document.documentElement.setAttribute("data-theme", resolved);
    // Set cookie for SSR hydration
    document.cookie = `theme=${resolved};path=/;max-age=31536000`;
  }

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return { theme, toggle, setTheme: (t: Theme) => { setTheme(t); localStorage.setItem("theme", t); applyTheme(t); } };
}
```

## Iconography

Use **Lucide React** exclusively. 20px default, 16px for inline/dense contexts. Stroke width 1.5px default, 2px for emphasis.

```tsx
import { Search, Home, Heart, Bell, Settings, ChevronRight } from "lucide-react";
<Search className="size-5 text-secondary" strokeWidth={1.5} />
```

## Responsive Breakpoints

```
sm:  640px   — Mobile landscape
md:  768px   — Tablet portrait
lg:  1024px  — Tablet landscape / small desktop
xl:  1280px  — Desktop
2xl: 1536px  — Wide desktop
```

Mobile-first: default styles = mobile, add `md:` / `lg:` for larger.


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 4 — COMPONENT LIBRARY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Component Library — Zinc Design System

## Design Principles for All Components

1. **Consistent height scale:** Buttons, inputs, selects share heights: `sm=32px`, `md=36px`, `lg=40px`, `xl=44px`
2. **Border by default:** Components have `1px border-default` border, not box-shadow for definition
3. **Hover = border-strong + shadow-xs:** Subtle lift, never dramatic
4. **Focus = accent ring:** 2px accent outline with 2px offset
5. **Disabled = 50% opacity + pointer-events-none:** Never gray out text (unreadable in dark mode)
6. **Transitions on everything:** `transition-all duration-fast` minimum

## Button

```tsx
// Variants: solid (default), outline, ghost, danger
// Sizes: sm (32px), md (36px), lg (40px)

// Solid (primary action)
<button className="h-9 px-4 rounded-md bg-zinc-900 text-zinc-50 text-sm font-medium
  hover:bg-zinc-800 active:bg-zinc-950 transition-colors duration-fast
  dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
  Publier l'annonce
</button>

// Accent (CTA)
<button className="h-9 px-4 rounded-md bg-amber-500 text-white text-sm font-medium
  hover:bg-amber-600 active:bg-amber-700 transition-colors duration-fast">
  Rechercher
</button>

// Outline
<button className="h-9 px-4 rounded-md border border-zinc-200 text-zinc-700 text-sm font-medium
  hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-fast
  dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
  Annuler
</button>

// Ghost
<button className="h-9 px-4 rounded-md text-zinc-600 text-sm font-medium
  hover:bg-zinc-100 transition-colors duration-fast
  dark:text-zinc-400 dark:hover:bg-zinc-800">
  Voir plus
</button>

// Icon button
<button className="size-9 flex items-center justify-center rounded-md
  text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-all duration-fast
  dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
  <Settings className="size-4" strokeWidth={1.5} />
</button>
```

## Input

```tsx
// States: default, focus, error, disabled
<div className="space-y-1.5">
  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
    Titre de l'annonce
  </label>
  <input
    className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900
      placeholder:text-zinc-400
      focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none
      disabled:opacity-50 disabled:cursor-not-allowed
      dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500
      dark:focus:border-amber-400 dark:focus:ring-amber-400/20
      transition-all duration-fast"
    placeholder="Ex: Appartement F3 Hydra"
  />
  {/* Error state */}
  <p className="text-xs text-danger">Ce champ est requis</p>
</div>
```

## Card

```tsx
// Base card — use for listings, stats, content blocks
<div className="rounded-lg border border-zinc-200 bg-white p-4
  shadow-card hover:shadow-card-hover hover:border-zinc-300
  transition-all duration-normal
  dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
  {children}
</div>

// Interactive card (clickable) — add group + cursor
<Link className="group block rounded-lg border border-zinc-200 bg-white
  shadow-card hover:shadow-card-hover hover:border-zinc-300
  transition-all duration-normal cursor-pointer
  dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
  {children}
</Link>
```

## ListingCard (Real Estate)

```tsx
// The most important component — used on search, dashboard, favorites
<Link href={`/l/${slug}`} className="group block overflow-hidden rounded-lg border border-zinc-200
  bg-white shadow-card hover:shadow-card-hover transition-all duration-normal
  dark:border-zinc-800 dark:bg-zinc-900">

  {/* Photo — 16:10 ratio, zoom on hover */}
  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
    <Image src={coverUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw"
      className="object-cover transition-transform duration-slow group-hover:scale-105" />
    {/* Status badge — top-end */}
    <div className="absolute top-2 end-2">
      <span className="rounded-full bg-success/90 px-2 py-0.5 text-2xs font-semibold text-white backdrop-blur-sm">
        Publié
      </span>
    </div>
    {/* Favorite button — top-start */}
    <button className="absolute top-2 start-2 size-8 flex items-center justify-center rounded-full
      bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors">
      <Heart className="size-4" strokeWidth={2} />
    </button>
    {/* Photo count — bottom-end */}
    <span className="absolute bottom-2 end-2 flex items-center gap-1 rounded-full
      bg-black/50 px-2 py-0.5 text-2xs font-medium text-white backdrop-blur-sm">
      <Camera className="size-3" /> 12
    </span>
  </div>

  {/* Content */}
  <div className="p-3.5">
    {/* Type + Wilaya */}
    <div className="mb-1.5 flex items-center gap-2 text-2xs">
      <span className="font-medium text-listing-sale">Vente</span>
      <span className="text-zinc-300 dark:text-zinc-600">·</span>
      <span className="text-zinc-500">Alger, Hydra</span>
    </div>
    {/* Title */}
    <h3 className="mb-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      Appartement F3 standing, vue mer
    </h3>
    {/* Price */}
    <p className="mb-2 text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
      4 500 000 DA
    </p>
    {/* Details row */}
    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
      <span className="flex items-center gap-1"><BedDouble className="size-3.5" /> 3</span>
      <span className="flex items-center gap-1"><Bath className="size-3.5" /> 2</span>
      <span className="flex items-center gap-1"><Maximize2 className="size-3.5" /> 120 m²</span>
    </div>
  </div>
</Link>
```

## StatCard (Dashboard)

```tsx
<div className="rounded-lg border border-zinc-200 bg-white p-5
  dark:border-zinc-800 dark:bg-zinc-900">
  <div className="flex items-center justify-between">
    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
      Annonces actives
    </p>
    <div className="rounded-md bg-amber-500/10 p-1.5">
      <LayoutList className="size-4 text-amber-600 dark:text-amber-400" />
    </div>
  </div>
  <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
    247
  </p>
  <div className="mt-1 flex items-center gap-1 text-xs">
    <TrendingUp className="size-3 text-success" />
    <span className="font-medium text-success">+12%</span>
    <span className="text-zinc-400">vs mois dernier</span>
  </div>
</div>
```

## Sidebar Navigation

```tsx
// Collapsible: 240px expanded, 64px collapsed
// Active state: accent-ghost bg + accent text + start border
<nav className="flex flex-col gap-0.5 px-2">
  {/* Active item */}
  <Link className="flex items-center gap-3 rounded-md px-3 py-2
    bg-amber-500/10 text-amber-700 border-s-2 border-amber-500
    dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400">
    <LayoutDashboard className="size-4" />
    <span className="text-sm font-medium">Tableau de bord</span>
  </Link>

  {/* Inactive item */}
  <Link className="flex items-center gap-3 rounded-md px-3 py-2
    text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900
    dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
    transition-colors duration-fast">
    <Home className="size-4" />
    <span className="text-sm">Annonces</span>
  </Link>
</nav>
```

## SearchBar (Marketplace Hero)

```tsx
// Full-width on mobile, max-w-2xl centered on desktop
<div className="w-full max-w-2xl mx-auto">
  <div className="flex items-center rounded-xl border-2 border-zinc-200 bg-white
    shadow-lg focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10
    transition-all duration-normal
    dark:border-zinc-700 dark:bg-zinc-900
    dark:focus-within:border-amber-400 dark:focus-within:ring-amber-400/10">

    {/* Type selector */}
    <select className="h-12 rounded-s-xl border-e border-zinc-200 bg-transparent
      ps-4 pe-8 text-sm font-medium text-zinc-700 focus:outline-none
      dark:border-zinc-700 dark:text-zinc-300">
      <option>Acheter</option>
      <option>Louer</option>
      <option>Vacances</option>
    </select>

    {/* Search input */}
    <div className="relative flex-1">
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
      <input className="h-12 w-full bg-transparent ps-10 pe-4 text-sm
        placeholder:text-zinc-400 focus:outline-none
        dark:text-zinc-100 dark:placeholder:text-zinc-500"
        placeholder="Wilaya, commune, ou mot-clé..."
      />
    </div>

    {/* Submit */}
    <button className="h-12 rounded-e-xl bg-amber-500 px-6 text-sm font-semibold text-white
      hover:bg-amber-600 transition-colors duration-fast">
      Rechercher
    </button>
  </div>
</div>
```

## DataTable (Dense, Linear-style)

```tsx
// For listings management, leads, admin views
<div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <th className="px-4 py-2.5 text-start text-xs font-medium uppercase tracking-wider
          text-zinc-500 dark:text-zinc-400">
          Titre
        </th>
        {/* ... */}
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
      <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors duration-fast">
        <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 font-medium">
          Appartement F3 Hydra
        </td>
        {/* ... */}
      </tr>
    </tbody>
  </table>
</div>
```

## Toast / Notification

```tsx
// Position: bottom-end, stacked
// Types: success, error, warning, info
<div className="fixed bottom-4 end-4 z-50 flex flex-col gap-2">
  <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white
    px-4 py-3 shadow-lg animate-slide-up
    dark:border-zinc-700 dark:bg-zinc-900">
    <CheckCircle2 className="size-5 text-success shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Annonce publiée</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Visible sur AqarSearch</p>
    </div>
    <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
      <X className="size-4" />
    </button>
  </div>
</div>
```

## EmptyState

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="mb-4 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
    <Inbox className="size-8 text-zinc-400" />
  </div>
  <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
    Aucune annonce
  </h3>
  <p className="mb-4 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
    Vous n'avez pas encore créé d'annonce. Commencez par ajouter votre premier bien.
  </p>
  <Button variant="solid">Créer une annonce</Button>
</div>
```

## Command Palette (⌘K)

Linear-style command palette for power users (AqarPro only):
- Trigger: `Cmd+K` / `Ctrl+K`
- Fuzzy search across listings, leads, pages, actions
- Sections: Recent, Listings, Leads, Navigation, Actions
- Keyboard nav: arrow keys, Enter to select, Esc to close
- Implementation: `cmdk` library (https://cmdk.paco.me)

## Loading Skeletons

```tsx
// Use zinc-200/zinc-800 with shimmer animation
<div className="space-y-3">
  <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 animate-shimmer
    bg-[length:200%_100%] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200
    dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800" />
  <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800 animate-shimmer" />
</div>
```

## Accessibility Checklist

- All interactive elements: `focus-visible` with accent ring
- Color contrast: WCAG AA minimum (4.5:1 for text, 3:1 for large text)
- Aria labels on icon buttons
- Keyboard navigation: Tab order, Enter/Space to activate, Escape to close
- Screen reader: Live regions for toasts, aria-busy for loading
- Reduced motion: `motion-reduce:transition-none motion-reduce:animate-none`

---

## Benchmark-Driven Components (New)

### AI Summary Panel (Fiche augmentée)

```tsx
// Collapsible panel for AI-generated listing analysis
<div className="rounded-xl border border-amber-200/50 bg-amber-50/30
  dark:border-amber-800/30 dark:bg-amber-950/20">
  <button
    onClick={toggle}
    className="flex w-full items-center justify-between px-5 py-4
      text-sm font-semibold text-zinc-900 dark:text-zinc-100"
  >
    <span className="flex items-center gap-2">
      <Sparkles className="size-4 text-amber-500" />
      Résumé IA
    </span>
    <ChevronDown className={`size-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
  </button>

  {open && (
    <div className="border-t border-amber-200/50 px-5 py-4 dark:border-amber-800/30">
      {/* Summary text */}
      <p className="mb-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {summary}
      </p>

      {/* Pros / Cons grid */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-success">
            Points forts
          </h4>
          {pros.map(p => (
            <div key={p} className="flex items-start gap-2 py-1">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{p}</span>
            </div>
          ))}
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-warning">
            Points d'attention
          </h4>
          {cons.map(c => (
            <div key={c} className="flex items-start gap-2 py-1">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-2xs text-zinc-400 dark:text-zinc-500">
        Généré par IA · Peut contenir des approximations
      </p>
    </div>
  )}
</div>
```

### CompareTable (Comparaison côte-à-côte)

```tsx
// Up to 4 listings side-by-side
<div className="overflow-x-auto">
  <table className="w-full min-w-[600px] text-sm">
    <thead>
      <tr>
        <th className="w-28 p-3 text-start text-xs font-medium text-zinc-500" />
        {listings.map(l => (
          <th key={l.id} className="p-3 text-center">
            <div className="relative mx-auto aspect-[16/10] w-full max-w-[180px] overflow-hidden rounded-lg">
              <Image src={l.cover} alt={l.title} fill className="object-cover" />
            </div>
            <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {l.title}
            </p>
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {/* Each row: label + values */}
      <CompareRow label="Prix" values={listings.map(l => formatPrice(l.price))} />
      <CompareRow label="Surface" values={listings.map(l => `${l.surface} m²`)} />
      <CompareRow label="Pièces" values={listings.map(l => String(l.rooms))} />
      <CompareRow label="Wilaya" values={listings.map(l => l.wilaya)} />
      <CompareRow label="Score" values={listings.map(l => `${l.score}/100`)} highlight />
      <CompareRow label="Prix/m²" values={listings.map(l => formatPrice(l.pricePerM2))} />
    </tbody>
  </table>
</div>

// Row component — highlight best value in green
function CompareRow({ label, values, highlight }: { label: string; values: string[]; highlight?: boolean }) {
  return (
    <tr>
      <td className="p-3 text-xs font-medium text-zinc-500">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`p-3 text-center text-sm font-medium
          ${highlight ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-zinc-100"}`}>
          {v}
        </td>
      ))}
    </tr>
  );
}
```

### ProjectCard (Cockpit immobilier)

```tsx
<Link href={`/AqarChaab/espace/projets/${project.id}`}
  className="group block rounded-xl border border-zinc-200 bg-white p-5
    hover:border-zinc-300 hover:shadow-card-hover transition-all duration-normal
    dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">

  {/* Header */}
  <div className="mb-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <FolderOpen className="size-5 text-amber-500" />
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {project.name}
      </h3>
    </div>
    <button className="text-zinc-400 hover:text-zinc-600">
      <MoreHorizontal className="size-4" />
    </button>
  </div>

  {/* Criteria */}
  <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
    {project.budget} · {project.type} · {project.zone}
  </p>

  {/* Stats row */}
  <div className="mb-3 grid grid-cols-4 gap-2">
    {[
      { icon: Heart, value: project.favCount, label: "favoris" },
      { icon: Scale, value: project.compareCount, label: "compar." },
      { icon: MessageSquare, value: project.convCount, label: "conv." },
      { icon: Calculator, value: project.monthlyPayment, label: "DA/mois" },
    ].map(s => (
      <div key={s.label} className="rounded-lg bg-zinc-50 p-2 text-center
        dark:bg-zinc-800">
        <s.icon className="mx-auto mb-1 size-3.5 text-zinc-400" />
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
        <p className="text-2xs text-zinc-400">{s.label}</p>
      </div>
    ))}
  </div>

  {/* Progress */}
  <div className="mb-2">
    <div className="flex items-center justify-between text-2xs text-zinc-400 mb-1">
      <span>Progression</span>
      <span>{project.stage}</span>
    </div>
    <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div className="h-1.5 rounded-full bg-amber-500 transition-all"
        style={{ width: `${project.progress}%` }} />
    </div>
  </div>

  {/* Last activity */}
  <p className="text-2xs text-zinc-400">
    Dernière activité : {project.lastActivity}
  </p>
</Link>
```

### DrawToolbar (Carte — draw-to-search)

```tsx
// Floating toolbar on the map
<div className="absolute top-3 start-3 z-10 flex rounded-lg border border-zinc-200
  bg-white/95 backdrop-blur-sm shadow-sm
  dark:border-zinc-700 dark:bg-zinc-900/95">
  {[
    { icon: Hand, label: "Déplacer", mode: "pan" },
    { icon: PenTool, label: "Dessiner", mode: "draw" },
    { icon: Layers, label: "Heatmap", mode: "heatmap" },
    { icon: RotateCcw, label: "Reset", mode: "reset" },
  ].map(tool => (
    <button key={tool.mode}
      onClick={() => setMode(tool.mode)}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 text-2xs transition-colors
        ${activeMode === tool.mode
          ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
      title={tool.label}
    >
      <tool.icon className="size-4" strokeWidth={1.5} />
      <span>{tool.label}</span>
    </button>
  ))}
</div>
```

### HybridSearchBar (Recherche classique + IA)

```tsx
// Enhanced SearchBar with AI intent detection
<div className="w-full max-w-2xl mx-auto space-y-2">
  {/* Main input */}
  <div className="flex items-center rounded-xl border-2 border-zinc-200 bg-white
    shadow-lg focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10
    dark:border-zinc-700 dark:bg-zinc-900">
    <Search className="ms-4 size-5 shrink-0 text-zinc-400" />
    <input className="h-12 w-full bg-transparent px-3 text-sm
      placeholder:text-zinc-400 focus:outline-none"
      placeholder="Rechercher par wilaya, type, prix... ou décrivez ce que vous cherchez"
      value={query}
      onChange={handleInputChange}
    />
    {isParsingAI && <Loader2 className="me-3 size-4 animate-spin text-amber-500" />}
    <button className="h-12 rounded-e-xl bg-amber-500 px-6 text-sm font-semibold text-white
      hover:bg-amber-600 transition-colors">
      Rechercher
    </button>
  </div>

  {/* AI-detected filter chips */}
  {detectedFilters.length > 0 && (
    <div className="flex flex-wrap gap-1.5">
      {detectedFilters.map(f => (
        <span key={f.key} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium
          ${f.isAI
            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
          {f.isAI && <Sparkles className="size-3" />}
          {f.label}
          <button onClick={() => removeFilter(f.key)}
            className="ms-1 hover:text-danger">
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  )}
</div>
```


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 5 — PATTERNS ÉDITORIAUX IMMERSIFS (Heatherwick)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Patterns éditoriaux immersifs — Référence Heatherwick

> Applicable aux pages marketing, homepage, vitrines agences, et listing detail.
> Inspiré de heatherwick.com — adapté au contexte proptech AqarVision.

---

## Principes fondamentaux

### 1. Une pensée par viewport

Chaque section de scroll occupe **80-100vh**. Une phrase forte + une image, jamais plus.
L'utilisateur scrolle pour découvrir, pas pour chercher. C'est du rythme éditorial.

```
Viewport 1 : Statement + photo hero (100vh)
Viewport 2 : Statement + photo immersive (80vh)
Viewport 3 : Statement + photo immersive (80vh)
Viewport 4 : Contenu fonctionnel (SearchBar, listings, etc.)
```

### 2. La typographie EST le design

Les statements ne sont pas des titres décoratifs. C'est le message. Grand, noir, centré ou aligné start, avec des retours à la ligne intentionnels. Chaque ligne est composée comme un vers.

```
MAUVAIS :
"Bienvenue sur AqarVision, la plateforme de recherche immobilière en Algérie"

BON :
"Trouvez votre
chez-vous
en Algérie"
```

### 3. Les photos dominent, le texte accompagne

Ratio photo/texte sur les pages éditoriales : **70% image, 30% texte**.
Les photos sont full-bleed (bord à bord), jamais dans des cartes avec padding.
Elles créent l'émotion. Le texte donne la direction.

### 4. Le blanc est un matériau

L'espace vide n'est pas du gaspillage. C'est ce qui donne à chaque élément sa gravité.
Pas de bg-zinc-100 partout — le fond est **blanc pur** (#FFFFFF en light) ou **noir pur** (#09090B en dark). Rien entre les deux pour les sections éditoriales.

### 5. Navigation invisible

Sur les pages éditoriales, la navigation est transparente sur le hero, puis apparaît
au scroll avec un fond `bg-white/80 backdrop-blur-lg`. Le menu est minimal : logo + 2-3 liens + burger pour le reste.

---

## Application par surface

### Homepage AqarSearch

La homepage actuelle est fonctionnelle mais pas mémorable. L'approche Heatherwick
la transforme en expérience de marque.

```
SECTION 1 — Hero éditorial (100vh)
┌─────────────────────────────────────────────────────┐
│                                                      │
│  [Logo AqarVision — top-start, white]               │
│  [Header transparent — 2-3 liens + locale + avatar]  │
│                                                      │
│                                                      │
│                                                      │
│         "Trouvez votre                               │
│          chez-vous                                   │
│          en Algérie"                                 │
│                                                      │
│     ┌──────────────────────────────────────┐        │
│     │ 🔍  Wilaya, commune, ou décrivez... │        │
│     └──────────────────────────────────────┘        │
│                                                      │
│     [Acheter]  [Louer]  [Vacances]                  │
│                                                      │
│                                        scroll ↓      │
│                                                      │
│  BACKGROUND: Photo full-bleed d'architecture         │
│  algérienne (Casbah, Maqam Echahid, immeubles       │
│  modernes Alger) avec gradient overlay sombre        │
│  (from-black/60 via-black/30 to-transparent)         │
│                                                      │
└─────────────────────────────────────────────────────┘

SECTION 2 — Statement + photo (80vh)
┌─────────────────────────────────────────────────────┐
│                                                      │
│   ┌──────────────────────┬──────────────────────┐   │
│   │                      │                      │   │
│   │  "Plus de 15 000     │    [PHOTO]           │   │
│   │   biens à découvrir  │    Architecture      │   │
│   │   dans 58 wilayas"   │    intérieur         │   │
│   │                      │    lumineux,         │   │
│   │  [Explorer →]        │    algérien          │   │
│   │                      │                      │   │
│   └──────────────────────┴──────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘

SECTION 3 — Photo pleine largeur + statement overlay
┌─────────────────────────────────────────────────────┐
│                                                      │
│  PHOTO: Vue aérienne d'une ville algérienne          │
│  (full-bleed, 70vh, object-cover)                    │
│                                                      │
│  Overlay bottom gradient (from-transparent to-black) │
│                                                      │
│     "Chaque quartier                                 │
│      a son caractère"                                │
│                                                      │
│     [Rechercher par wilaya →]                        │
│                                                      │
└─────────────────────────────────────────────────────┘

SECTION 4 — Wilayas tendances (scroll horizontal)
┌─────────────────────────────────────────────────────┐
│                                                      │
│  "Explorez par région"                               │
│                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │ALGER │ │ ORAN │ │CONST.│ │ANNABA│ │ TIZI │ →   │
│  │[photo]│ │[photo]│ │[photo]│ │[photo]│ │[photo]│    │
│  │ 3,200 │ │ 2,100 │ │ 1,800 │ │  900  │ │  750  │    │
│  │annonces│ │annonces│ │annonces│ │annonces│ │annonces│   │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│                                                      │
└─────────────────────────────────────────────────────┘

SECTION 5 — Listings mis en avant
┌─────────────────────────────────────────────────────┐
│                                                      │
│  "Les plus consultés cette semaine"                  │
│                                                      │
│  [ListingCard] [ListingCard] [ListingCard]           │
│  [ListingCard] [ListingCard] [ListingCard]           │
│                                                      │
│  [Voir toutes les annonces →]                        │
│                                                      │
└─────────────────────────────────────────────────────┘

SECTION 6 — Trust + CTA pro (80vh, fond zinc-950)
┌─────────────────────────────────────────────────────┐
│  ████████████████████████████████████ (fond sombre)  │
│                                                      │
│     "2 500+ agences vérifiées                        │
│      font confiance à AqarVision"                    │
│                                                      │
│     [15,000+]    [58]       [2,500+]                │
│     annonces    wilayas    agences                   │
│                                                      │
│     ──────────────────────────────                   │
│                                                      │
│     "Vous êtes professionnel ?"                      │
│                                                      │
│     [Découvrir AqarPro →]                            │
│                                                      │
└─────────────────────────────────────────────────────┘

SECTION 7 — Footer minimal
```

### Vitrine Agence (`/a/[slug]`)

C'est ICI que le pattern Heatherwick est le plus puissant. Chaque agence
devient une micro-marque avec une page éditoriale immersive.

```
SECTION 1 — Hero agence (80vh)
┌─────────────────────────────────────────────────────┐
│                                                      │
│  BACKGROUND: Photo cover de l'agence (full-bleed)    │
│  ou gradient mesh si pas de cover                    │
│                                                      │
│  Overlay gradient                                    │
│                                                      │
│     [LOGO agence — centré, grand]                    │
│                                                      │
│     "Votre partenaire immobilier                     │
│      à Alger depuis 2015"                            │
│                                                      │
│     ✓ Agence vérifiée · 124 annonces               │
│                                                      │
│     [Voir nos biens]  [Nous contacter]               │
│                                                      │
└─────────────────────────────────────────────────────┘

SECTION 2 — Statement + chiffres
┌─────────────────────────────────────────────────────┐
│                                                      │
│  "Nous accompagnons nos clients                      │
│   dans chaque étape de leur                          │
│   projet immobilier"                                 │
│                                                      │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │  124   │  │  58    │  │  12    │  │  98%   │   │
│  │annonces│  │ ventes │  │ agents │  │ satisf.│   │
│  └────────┘  └────────┘  └────────┘  └────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘

SECTION 3 — Biens de l'agence (grille Heatherwick)
┌─────────────────────────────────────────────────────┐
│                                                      │
│  "Nos biens"                    [Tous] [Vente] [Loc]│
│                                                      │
│  Grille MASONRY (pas une grille uniforme) :          │
│  ┌────────────────┐ ┌──────────┐                    │
│  │    [GRANDE]     │ │ [PETITE] │                    │
│  │    Photo 16:10  │ │ Photo    │                    │
│  │    F3 Hydra     │ │ 1:1     │                    │
│  │    4.5M DA      │ │ Villa    │                    │
│  └────────────────┘ │ 12M DA   │                    │
│  ┌──────────┐       └──────────┘                    │
│  │ [PETITE] │ ┌────────────────┐                    │
│  │ 1:1     │ │    [GRANDE]     │                    │
│  │ Terrain  │ │    Photo 16:10  │                    │
│  │ 8M DA    │ │    Local comm.  │                    │
│  └──────────┘ │    120K/mois    │                    │
│               └────────────────┘                    │
│                                                      │
│  [Voir tous nos biens →]                             │
│                                                      │
└─────────────────────────────────────────────────────┘

SECTION 4 — Équipe (optionnel)

SECTION 5 — Contact + carte
┌─────────────────────────────────────────────────────┐
│                                                      │
│  "Contactez-nous"                                    │
│                                                      │
│  ┌──────────────────┬──────────────────────────┐    │
│  │                  │                          │    │
│  │  Adresse         │      [CARTE MapLibre]    │    │
│  │  Rue des Frères..│      Pin sur l'agence    │    │
│  │                  │                          │    │
│  │  📞 0555 XX XX   │                          │    │
│  │  📧 contact@...  │                          │    │
│  │                  │                          │    │
│  │  [Envoyer un     │                          │    │
│  │   message]       │                          │    │
│  └──────────────────┴──────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Listing Detail — Photo hero immersive

Le haut de la fiche listing reprend le pattern Heatherwick :
photo full-bleed, pas de chrome autour.

```
┌─────────────────────────────────────────────────────┐
│  [Header — compact, semi-transparent]                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  PHOTO HERO (60vh, full-bleed)                       │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │         [Photo principale — full-bleed]        │  │
│  │                                               │  │
│  │                                               │  │
│  │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │  │
│  │   │thumb│ │thumb│ │thumb│ │+8   │  bottom    │  │
│  │   └─────┘ └─────┘ └─────┘ └─────┘  strip    │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  Pas de padding, pas de rounded — bord à bord        │
│  Thumbnails strip : semi-transparent overlay bottom  │
│  Click n'importe quelle photo → lightbox fullscreen  │
│                                                      │
├─────────────────────────────────────────────────────┤
│  Suite : contenu structuré avec sidebar sticky       │
│  (comme déjà spécifié dans aqarsearch-ux.md)        │
└─────────────────────────────────────────────────────┘
```

---

## Composants éditoriaux

### HeroStatement

```tsx
// Section plein écran avec statement typographique + background
<section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
  {/* Background image */}
  <Image src={bgUrl} alt="" fill className="object-cover" priority />
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />

  {/* Content */}
  <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
    <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white
      sm:text-5xl md:text-6xl lg:text-7xl">
      Trouvez votre{"\n"}
      <span className="text-amber-400">chez-vous</span>{"\n"}
      en Algérie
    </h1>
    {children} {/* SearchBar, CTA buttons, etc. */}
  </div>

  {/* Scroll indicator */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
    <ChevronDown className="size-6 text-white/60" />
  </div>
</section>
```

### EditorialSplit

```tsx
// Texte à gauche (ou start en RTL), photo à droite (ou end)
// Alterne : pair = texte start, impair = texte end
<section className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-2">
  {/* Text side */}
  <div className={`flex flex-col justify-center px-8 py-16 lg:px-16
    ${reversed ? "lg:order-2" : "lg:order-1"}`}>
    <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-zinc-950
      dark:text-zinc-50 sm:text-4xl lg:text-5xl">
      {statement}
    </h2>
    {subtitle && (
      <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">{subtitle}</p>
    )}
    {cta && (
      <Link href={cta.href} className="mt-6 inline-flex items-center gap-2
        text-sm font-semibold text-amber-600 hover:text-amber-700
        dark:text-amber-400 dark:hover:text-amber-300 transition-colors">
        {cta.label} <ArrowRight className="size-4" />
      </Link>
    )}
  </div>

  {/* Image side — full-bleed, no padding */}
  <div className={`relative min-h-[50vh] lg:min-h-0
    ${reversed ? "lg:order-1" : "lg:order-2"}`}>
    <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
  </div>
</section>
```

### FullBleedPhoto

```tsx
// Photo pleine largeur avec statement overlay optionnel
<section className="relative h-[70vh] overflow-hidden">
  <Image src={url} alt={alt} fill className="object-cover" />

  {statement && (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 start-0 p-8 lg:p-16">
        <h2 className="max-w-2xl text-3xl font-bold leading-[1.15] text-white
          sm:text-4xl lg:text-5xl">
          {statement}
        </h2>
        {cta && (
          <Link href={cta.href} className="mt-4 inline-flex items-center gap-2
            text-sm font-semibold text-amber-400 hover:text-amber-300">
            {cta.label} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </>
  )}
</section>
```

### StatsStrip

```tsx
// Bande de chiffres, fond zinc-950, texte blanc, chiffres amber
<section className="bg-zinc-950 py-16 dark:bg-zinc-900">
  <div className="mx-auto max-w-5xl px-6">
    {statement && (
      <h2 className="mb-12 text-center text-3xl font-bold text-white sm:text-4xl">
        {statement}
      </h2>
    )}
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
      {stats.map(s => (
        <div key={s.label} className="text-center">
          <p className="text-3xl font-bold tabular-nums text-amber-400 sm:text-4xl">
            {s.value}
          </p>
          <p className="mt-1 text-sm text-zinc-400">{s.label}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### MasonryGrid (Grille Heatherwick pour vitrines)

```tsx
// Grille avec cartes de tailles variées (grande + petites)
// Pattern : [large 2col] [small] / [small] [large 2col]
<div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
  {listings.map((listing, i) => {
    // Alternating: every 3rd item spans 2 columns
    const isLarge = i % 3 === 0;
    return (
      <Link
        key={listing.id}
        href={`/l/${listing.slug}`}
        className={`group relative overflow-hidden rounded-lg
          ${isLarge ? "col-span-2 aspect-[16/10]" : "col-span-1 aspect-square"}`}
      >
        <Image src={listing.cover} alt={listing.title} fill
          className="object-cover transition-transform duration-slow group-hover:scale-105" />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-normal" />
        {/* Info — always visible at bottom */}
        <div className="absolute bottom-0 start-0 end-0 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-white/80">
            {listing.type} · {listing.wilaya}
          </p>
          <h3 className="mt-1 text-sm font-bold text-white truncate">
            {listing.title}
          </h3>
          <p className="mt-0.5 text-lg font-bold text-amber-400">
            {formatPrice(listing.price)}
          </p>
        </div>
      </Link>
    );
  })}
</div>
```

---

## Animations éditoriales

### Scroll reveal (IntersectionObserver)

Chaque section éditoriale entre avec un fade-in + slide-up subtil quand elle
entre dans le viewport. Pas de bibliothèque externe — CSS + IntersectionObserver.

```tsx
// hook: useScrollReveal
"use client";
import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
```

```tsx
// Usage
function Section({ children }) {
  const ref = useScrollReveal<HTMLElement>();
  return <section ref={ref}>{children}</section>;
}
```

### Parallax léger sur les photos hero

```css
/* CSS-only parallax — performant, no JS */
.parallax-container {
  overflow: hidden;
}
.parallax-image {
  height: 120%;
  object-fit: cover;
  transform: translateY(0);
  will-change: transform;
}

/* Activated via scroll-driven animations (CSS only, modern browsers) */
@supports (animation-timeline: scroll()) {
  .parallax-image {
    animation: parallax linear;
    animation-timeline: view();
    animation-range: entry 0% exit 100%;
  }

  @keyframes parallax {
    from { transform: translateY(-10%); }
    to   { transform: translateY(10%); }
  }
}
```

### Counter animation (chiffres stats)

```tsx
// Les chiffres du StatsStrip s'animent de 0 à la valeur finale
// quand la section entre dans le viewport
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const duration = 1500;
        const step = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setCount(Math.floor(eased * value));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    }, { threshold: 0.5 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count.toLocaleString("fr-DZ")}{suffix}</span>;
}
```

---

## Typographie éditoriale

Pour les pages marketing et vitrines, la typo sort du mode "UI" (Geist 14px)
et passe en mode "éditorial" :

```
Hero statement :     text-5xl → text-7xl, font-bold, leading-[1.1], tracking-tight
Section statement :  text-3xl → text-5xl, font-bold, leading-[1.15]
Section subtitle :   text-lg → text-xl, font-normal, text-zinc-500
Caption photo :      text-xs, uppercase, tracking-wider, text-white/80
CTA éditorial :      text-sm, font-semibold, text-amber-600, avec ArrowRight icon
```

En arabe (RTL), les statements utilisent `font-arabic` avec des tailles
légèrement plus petites (-1 step) car l'arabe est visuellement plus dense.

---

## Règles d'application

### Pages qui UTILISENT le mode éditorial

- Homepage (`/[locale]`) — sections 1-3 éditoriales, sections 4+ fonctionnelles
- Vitrine agence (`/[locale]/a/[slug]`) — entièrement éditoriale
- Page marketing AqarPro (`/[locale]/pro`) — éditoriale
- Listing detail — photo hero seulement (60vh), le reste est fonctionnel
- Landing pages marketing (pricing, about, etc.)

### Pages qui NE DOIVENT PAS utiliser le mode éditorial

- Search results — fonctionnel, dense
- Dashboard AqarPro — fonctionnel, dense
- Espace AqarChaab — fonctionnel, chaleureux
- Wizard dépôt d'annonce — fonctionnel, guidé
- Pages admin — fonctionnel, utilitaire

Le design system Zinc supporte les deux modes : **UI mode** (dense, 14px base,
composants compacts) et **Editorial mode** (immersif, grands titres, full-bleed).
Les deux coexistent dans la même app via les composants ci-dessus.


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 6 — AQARSEARCH (Marketplace UX)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# AqarSearch — Marketplace UX Specification

## Overview

AqarSearch is the public-facing marketplace. It must be fast, photo-immersive, and conversion-optimized. Primary user: Algerian home seeker (buyer or renter), 25-45 years old, mobile-first.

## Key Pages

### 1. Homepage (`/[locale]`)

**Layout: Editorial immersif (Heatherwick) + fonctionnel**

The homepage uses the **Editorial mode** from `references/editorial-immersive.md`.
Sections 1-3 are full-viewport statement+photo experiences. Sections 4+ switch
to functional UI (listings grid, wilayas, CTA).

See `references/editorial-immersive.md` → "Homepage AqarSearch" for the complete
section-by-section layout with wireframes.

Key components used:
- `HeroStatement` — 100vh hero with photo bg + search bar + quick filters
- `EditorialSplit` — alternating text/photo sections
- `FullBleedPhoto` — photo pleine largeur avec statement overlay
- `StatsStrip` — chiffres sur fond zinc-950
- `WilayaScroller` — scroll horizontal de wilayas avec photos + count

**Hero interactions:**
- Background: photo architecture algérienne full-bleed + gradient overlay `from-black/60 via-black/30 to-black/60`
- SearchBar: elevated with shadow-xl, slight scale animation on focus, centered in the viewport
- Quick filter pills: active = amber-500 solid, inactive = white/20 ghost (on dark bg)
- Typing in search: show autocomplete dropdown with wilayas + communes (debounce 300ms)
- Scroll indicator: subtle bouncing chevron at bottom
- Parallax: CSS scroll-driven animation on the background image (subtle, 10% range)
- Scroll reveal: each subsequent section fades in + slides up via IntersectionObserver

### 2. Search Results (`/[locale]/search`)

**Layout: Zillow-style split view + Domain draw-to-search**

```
┌──────────────────────────┬──────────────────────┐
│ Header + HybridSearchBar │                      │
├──────────────────────────┤                      │
│ AI-detected filter chips │                      │
│ [F3 ✕] [< 5M ✕] [Alger]│        MAP           │
├──────────────────────────┤   (MapLibre GL)      │
│ Sort: Plus récents ▾     │                      │
│                          │  Pins with prices    │
│  ListingCard grid        │  Draw-to-search tool │
│  (2-col desktop,         │  Cluster on zoom out │
│   1-col mobile)          │  Card popup on click │
│                          │  Heatmap toggle      │
│  Pagination              │                      │
└──────────────────────────┴──────────────────────┘
```

**Search: Hybrid mode (classique + IA + carte)**

The search bar accepts BOTH structured filters AND natural language:
- "F3 Alger < 5M" → parsed into structured filters automatically
- "Appartement lumineux calme proche école" → sent to Claude API for intent extraction → converted to filter chips
- Each detected filter appears as an editable chip below the bar
- User can remove any chip → filter updates
- User can switch to classic filter panel at any time (never forced into IA)

```
┌─────────────────────────────────────────────────────────┐
│  [🔍 F3 lumineux, calme, proche école, < 5M DA    ]    │
│                                                          │
│  Filtres détectés:                                       │
│  [F3 ✕] [< 5M DA ✕] [💡 Lumineux ✕] [🏫 Proche école ✕]│
│                                                          │
│  [+ Filtres classiques]  [🗺 Dessiner une zone]          │
└─────────────────────────────────────────────────────────┘
```

**Map: Domain-style draw-to-search**

Inspired by Domain + Rightmove. The map has a drawing tool:
- Toolbar on map: [Move] [Draw zone] [Heatmap] [Reset]
- Draw mode: user traces a polygon on the map → PostGIS `ST_Within` filters results
- The drawn zone persists until reset
- Cluster pins: zoom out → pins aggregate into circles with count + avg price
- Price pins: zoom in → each pin shows the formatted price (ex: "4.5M")
- Pin hover → highlight corresponding card in list (scroll into view)
- Card hover → highlight corresponding pin on map (scale + z-index)
- Map drag → auto-filter by new bounding box (debounce 500ms)
- Heatmap toggle: overlay showing price per m² by zone (amber gradient)

**UX details:**
- Split: 55% list / 45% map on desktop. Toggle on mobile (list/map tabs)
- Active filter chips: amber-500 bg, X to remove
- Intent-based chips (from IA): have a ✨ sparkle icon to indicate AI-detected
- Sort: "Plus récents" default, dropdown for price asc/desc, surface
- ListingCard hover: subtle shadow-card-hover + slight scale(1.01)
- Infinite scroll OR pagination (pagination preferred for SEO)
- "Aucun résultat" EmptyState with suggestion to broaden filters
- Mobile: sticky SearchBar at top, filter sheet (bottom drawer), full-screen map option

**Filter panel (desktop = horizontal chips, mobile = bottom drawer):**
- Type de bien: dropdown multi-select
- Type de transaction: pill toggle (Acheter/Louer/Vacances)
- Prix: dual range slider with min/max inputs
- Surface: min input
- Pièces: counter buttons (1, 2, 3, 4, 5+)
- Wilaya: searchable dropdown with 58 wilayas
- Commune: conditional on wilaya selection
- "Plus de filtres" → expand: étage, parking, ascenseur, meublé, vue mer, calme...
- Intent filters (AI): "Proche école", "Quartier calme", "Vue dégagée", "Potentiel locatif"
- "Réinitialiser" ghost button

### 3. Listing Detail (`/[locale]/l/[slug]`)

**Layout: Zillow-style single scroll, photo hero**

```
┌─────────────────────────────────────────────────────┐
│ Header (compact)                                     │
├─────────────────────────────────────────────────────┤
│ Breadcrumb: Annonces > Alger > Hydra > [Title]      │
├─────────────────────────────────────────────────────┤
│                                                      │
│         PHOTO GALLERY (full-width, 60vh)             │
│    Main photo + 4 thumbnails grid, click = lightbox  │
│    Photo count badge, fullscreen button              │
│                                                      │
├────────────────────────────────────┬────────────────┤
│                                    │                │
│  [Type badge] [Property badge]     │  AGENCY CARD   │
│                                    │  Logo + Name   │
│  Title (display font, large)       │  Verified ✓    │
│  Reference: AQR-00123              │                │
│                                    │  [📞 Appeler]  │
│  PRICE BLOCK                       │  [💬 Message]  │
│  4 500 000 DA                      │  [Voir vitrine]│
│  37 500 DA/m²                      │                │
│                                    │  NOTE WIDGET   │
│  KEY FACTS GRID (2x4)             │  [Add note]    │
│  Surface | Pièces | SDB | Wilaya   │                │
│                                    │  MORTGAGE CALC │
│  DESCRIPTION (collapsible)         │  [Calculator]  │
│                                    │                │
│  ÉQUIPEMENTS (chip grid)          │                │
│  [Parking] [Ascenseur] [Balcon]   │  ── sticky ──  │
│                                    │                │
│  MAP (small, location pin)         │                │
│                                    │                │
│  SIMILAR LISTINGS (carousel)       │                │
│                                    │                │
├────────────────────────────────────┴────────────────┤
│ Footer                                               │
└─────────────────────────────────────────────────────┘
```

**UX details:**
- Photo gallery: click any photo → fullscreen lightbox with swipe
- Sidebar: `position: sticky; top: 80px` — follows scroll
- Agency card: verified badge (amber) if is_verified
- Price: large (text-3xl font-bold), price per m² below in text-secondary
- Key facts: icon + label + value, 2-column grid
- Description: show first 200 chars, "Lire la suite" to expand
- Equipment chips: amber-ghost bg with check icon
- Map: small MapLibre embed (200px height), pin on exact location
- Similar listings: horizontal carousel of 4 ListingCards, auto-scroll
- Mobile: sidebar becomes sticky bottom bar with [Appeler] [Message] buttons
- JSON-LD + Open Graph + hreflang already in place

### AI Summary Panel (Fiche augmentée — différenciateur #2)

Positioned between the key facts grid and the description. Collapsible, open by default.

```
┌─────────────────────────────────────────────────────┐
│  ✨ Résumé IA                          [Réduire ▴] │
├─────────────────────────────────────────────────────┤
│  "F3 bien situé à Hydra avec vue dégagée.           │
│   Surface correcte pour le quartier. Prix légèrement│
│   au-dessus de la médiane (+8%). Bon pour famille   │
│   avec enfants (2 écoles à <500m)."                 │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │ ✅ Points forts  │  │ ⚠️ Points d'attention    │ │
│  │ · Vue dégagée    │  │ · Prix > médiane (+8%)   │ │
│  │ · 2 écoles <500m │  │ · Pas d'ascenseur        │ │
│  │ · Parking inclus │  │ · 4ème étage             │ │
│  └──────────────────┘  └──────────────────────────┘ │
│                                                      │
│  💬 Questions à poser                               │
│  · Charges mensuelles de copropriété ?              │
│  · Date de disponibilité ?                          │
│  · Possibilité de négociation ?                     │
│                                                      │
│  ── Généré par IA · Peut contenir des approximations│
└─────────────────────────────────────────────────────┘
```

**Implementation:**
- Generated server-side at publish time (AI job type: `listing_analysis`)
- Stored in `ai_jobs.output_payload` or dedicated `listing_ai_summaries` table
- Displayed in a collapsible panel (`<details>` or state-controlled)
- Badge: `✨ Résumé IA` with sparkle icon
- Disclaimer: small text-tertiary at bottom
- Points forts: green check icon, Points d'attention: amber warning icon
- Questions: bullet list, clickable → copies to clipboard or pre-fills contact form

### Proximity Map (Bayut-inspired — contexte local)

Below the main location map, an expanded view showing POIs:

```
┌─────────────────────────────────────────────────────┐
│  📍 Autour de ce bien                [1km ▾] [2km] │
├─────────────────────────────────────────────────────┤
│  [MAP with POI pins by category]                     │
│  🏫 Écoles (3)  🕌 Mosquées (2)  🛒 Commerces (5)  │
│  🏥 Santé (1)   🚌 Transport (2)                    │
│                                                      │
│  Click category → show/hide pins on map              │
└─────────────────────────────────────────────────────┘
```

**Implementation:** Uses OpenStreetMap Overpass API or local POI data for the commune. Pins color-coded by category. Toggle each category on/off. Radius selector: 500m, 1km, 2km.

### 4. Agency Vitrine (`/[locale]/a/[slug]`)

Themed storefront — colors and layout defined by the agency's chosen theme (registry.ts). The Zinc system provides the base; agency themes override `--agency-primary`, `--agency-accent`, `--agency-secondary`.

## Navigation

### Header (Marketing/Public)
```
┌─────────────────────────────────────────────────────┐
│ [Logo]  Acheter  Louer  Agences  Estimer     [🌙] [FR▾] [Avatar/Login] │
└─────────────────────────────────────────────────────┘
```
- Transparent on hero, `bg-white/80 backdrop-blur-lg` on scroll
- Dark mode toggle (moon/sun icon)
- Locale switcher: dropdown with flag icons
- Logged in: avatar + dropdown (Mon espace / Dashboard / Déconnexion)

### Mobile Navigation
- Bottom tab bar: Accueil, Recherche, Favoris, Alertes, Profil
- Hamburger for secondary pages
- Search: floating action button or top bar

## Animations & Micro-interactions

- **Page transitions:** fade-in 200ms on route change (Next.js App Router)
- **ListingCard:** scale(1.01) + shadow lift on hover (300ms ease)
- **Photo gallery:** crossfade between photos, lightbox slide
- **Filter chips:** pill-to-X animation when active
- **Search autocomplete:** slide-down 200ms, results stagger 30ms each
- **Favorite heart:** scale(1.3) + fill animation on click (spring ease)
- **Map pins:** bounce-in on load, scale on hover
- **Scroll:** smooth scroll to anchors, parallax on hero (reduced-motion safe)
- **Price update:** counter animation (number rolls up)
- **Skeleton → content:** fade-in with slide-up (200ms stagger per card)

## Mobile-Specific Patterns

- Search: full-screen search overlay on tap (like Airbnb mobile)
- Filters: bottom sheet (drawer), swipe to dismiss
- Map: full-screen with floating cards at bottom (Zillow mobile)
- Photo gallery: swipe left/right, pinch to zoom
- Listing detail: floating bottom bar with CTA buttons
- Share: native share sheet (Web Share API)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 7 — AQARPRO (Dashboard UX)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# AqarPro — Agency Dashboard UX Specification

## Overview

AqarPro is the agency workspace. It must be dense, fast, keyboard-navigable, and data-rich. Inspired by Linear (dense sidebar, keyboard shortcuts, command palette) and Stripe (precision, clean data tables). Primary user: real estate agent or agency owner, 30-55 years old, desktop-first.

## App Shell

```
┌────────────────────────────────────────────────────────────┐
│ [≡] AqarPro    Agency Name ▾    [⌘K]  [🔔]  [🌙]  [👤] │ ← Top bar (h-14)
├──────────┬─────────────────────────────────────────────────┤
│          │                                                  │
│ SIDEBAR  │              MAIN CONTENT                        │
│ (240px)  │                                                  │
│          │  Page Title              [+ Nouvelle annonce]    │
│ Overview │                                                  │
│ Annonces │  [Content area — scrollable]                     │
│ Leads    │                                                  │
│ Messages │                                                  │
│ Visites  │                                                  │
│ Analytics│                                                  │
│ ─────── │                                                  │
│ AI       │                                                  │
│ Équipe  │                                                  │
│ Factures │                                                  │
│ Réglages│                                                  │
│          │                                                  │
│ ─────── │                                                  │
│ [Vitrine]│                                                  │
│ [Aide]   │                                                  │
├──────────┴─────────────────────────────────────────────────┤
│ (no footer in dashboard)                                    │
└────────────────────────────────────────────────────────────┘
```

**App shell behavior:**
- Sidebar: collapsible to 64px (icon-only) via toggle or `[` key
- Top bar: always visible, agency name = switcher dropdown (for multi-agency)
- Command palette: `⌘K` opens fuzzy search across all entities
- Notifications bell: unread count badge, dropdown panel
- Theme toggle: moon/sun icon
- User avatar: dropdown with profil, déconnexion

## Sidebar Navigation

**Structure:**
```
── Overview (LayoutDashboard icon)
── Annonces (Building2 icon) → badge: count
── Leads (Users icon) → badge: new count
── Messages (MessageSquare icon) → badge: unread
── Demandes de visite (Calendar icon)
── Analytics (BarChart3 icon)
── separator ──
── IA (Sparkles icon) → "Pro" badge
── Équipe (UserPlus icon)
── Facturation (CreditCard icon)
── Réglages (Settings icon)
── separator ──
── Ma vitrine (ExternalLink icon) → opens in new tab
── Aide (HelpCircle icon)
```

**Active state:** `bg-amber-500/10 text-amber-700 border-s-2 border-amber-500`
**Hover:** `bg-zinc-100 dark:bg-zinc-800`
**Badge:** rounded-full, text-2xs, positioned end

**Collapsed mode:** Only icons visible, tooltip on hover for label

## Key Pages

### 1. Dashboard Overview

```
┌──────────────────────────────────────────────────┐
│ Bonjour, Lounis 👋            Derniers 30 jours ▾│
├──────────────────────────────────────────────────┤
│ [Stat] [Stat] [Stat] [Stat]                      │
│ Actives  Leads   Vues   Conversion               │
│  24      18     1,240    2.3%                     │
│  +12%    +5%    +8%     -0.5%                     │
├──────────────────────────────────────────────────┤
│ ┌────────────────────┐ ┌────────────────────────┐│
│ │ Activité récente   │ │ Actions rapides        ││
│ │ Timeline feed      │ │ [+ Annonce]            ││
│ │ • Lead reçu        │ │ [Inviter un membre]    ││
│ │ • Annonce publiée  │ │ [Voir les stats]       ││
│ │ • Message lu       │ │ [Configurer la vitrine]││
│ │ • Visite demandée  │ │                        ││
│ └────────────────────┘ └────────────────────────┘│
├──────────────────────────────────────────────────┤
│ Vues par jour (chart — bar chart, 30 days)        │
└──────────────────────────────────────────────────┘
```

**UX details:**
- Stat cards: 4-column row, each with icon, value, label, trend badge
- Activity feed: reverse chronological, icon + text + relative time
- Quick actions: ghost buttons with icons, most common tasks
- Chart: simple bar chart (CSS only or lightweight lib), zinc-800 bars + amber highlight for today

### 2. Listings Management

```
┌──────────────────────────────────────────────────┐
│ Annonces (247)        [Filtres ▾] [+ Nouvelle]   │
├──────────────────────────────────────────────────┤
│ Tabs: Toutes | Publiées | Brouillons | En attente│
├──────────────────────────────────────────────────┤
│ ☐ │ Photo │ Titre        │ Type │ Prix    │ Stat │
│───│───────│──────────────│──────│─────────│──────│
│ ☐ │ [img] │ F3 Hydra     │ Vente│ 4.5M DA │ ● Pub│
│ ☐ │ [img] │ Villa Chéraga│ Vente│ 12M DA  │ ○ Brl│
│ ☐ │ [img] │ Local Bab... │ Loc  │ 80K/mois│ ● Pub│
├──────────────────────────────────────────────────┤
│ Sélectionné: 2  [Publier] [Archiver] [Supprimer] │
└──────────────────────────────────────────────────┘
```

**UX details:**
- Dense table (DataTable component): 36px row height, compact padding
- Thumbnail: 48×36px, rounded-sm
- Inline status badge: colored dot + abbreviated text
- Bulk actions bar: sticky bottom, appears when items selected
- Row click: navigate to listing detail/edit
- Row hover: subtle bg change + action icons appear (edit, duplicate, archive)
- Sort: click column header, arrow indicator
- Search: inline text input above table, filters listings client-side
- Empty state: illustration + "Créez votre première annonce"

### 3. Leads (Kanban)

```
┌──────────────────────────────────────────────────┐
│ Leads (42)              [+ Ajouter] [Vue: Kanban]│
├──────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│ │Nouveau│ │Contact│ │Visite│ │Négo  │ │Fermé │   │
│ │  (12) │ │  (8)  │ │  (5)  │ │  (3) │ │  (14)│   │
│ │       │ │       │ │       │ │       │ │       │   │
│ │ Card  │ │ Card  │ │ Card  │ │ Card  │ │ Card  │   │
│ │ Card  │ │ Card  │ │       │ │       │ │ Card  │   │
│ │ Card  │ │       │ │       │ │       │ │ Card  │   │
│ │ ...   │ │       │ │       │ │       │ │ ...   │   │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │
└──────────────────────────────────────────────────┘
```

**Lead card:**
- Compact: name, listing title, date, score badge
- Color-coded score: green (hot), amber (warm), zinc (cold)
- Drag-and-drop between columns
- Click: expand to show conversation history, notes, actions
- View toggle: Kanban / Table / Timeline

### 4. Analytics

```
┌──────────────────────────────────────────────────┐
│ Analytics              [7j] [30j] [90j] [Custom] │
├──────────────────────────────────────────────────┤
│ Stat cards row (same as dashboard but with more)  │
│ Vues | Leads | Messages | Favoris | Taux conv.   │
├──────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐│
│ │ Vues par jour (area chart, gradient fill)      ││
│ └────────────────────────────────────────────────┘│
│ ┌──────────────────┐ ┌──────────────────────────┐│
│ │ Top annonces     │ │ Sources des leads        ││
│ │ (table: title,   │ │ (donut chart)            ││
│ │  vues, leads)    │ │ Platform / WhatsApp /    ││
│ │                  │ │ Direct / Chatbot         ││
│ └──────────────────┘ └──────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### 5. Settings

**Layout: vertical tabs left, form content right**

```
┌──────────┬───────────────────────────────────────┐
│ Général  │                                        │
│ Apparence│  Thème de la vitrine                   │
│ Branding │  [Theme picker grid]                   │
│ Équipe  │                                        │
│ Vérif.  │  Couleurs personnalisées               │
│ Facturat.│  Primary [■] Accent [■] Secondary [■] │
│          │                                        │
│          │  Aperçu en direct →                    │
│          │                                        │
└──────────┴───────────────────────────────────────┘
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Command palette |
| `N` | New listing |
| `S` | Search / focus search |
| `[` | Toggle sidebar |
| `1-9` | Navigate to sidebar items |
| `Esc` | Close modal/drawer/palette |
| `?` | Show keyboard shortcuts |

## Onboarding Flow

First-time agency owner sees a step-by-step wizard:
1. **Bienvenue** — Agency name, slug, description
2. **Branding** — Logo upload, couleur primaire
3. **Équipe** — Inviter les premiers membres
4. **Première annonce** — Guided listing creation
5. **Vitrine** — Choose a theme, preview

Progress bar at top, skip button available. Can be re-accessed from settings.

## Responsive Behavior

- **Desktop (>1024px):** Full sidebar + main content
- **Tablet (768-1024px):** Collapsed sidebar (icons only) + main
- **Mobile (<768px):** No sidebar, bottom tab nav (5 items), hamburger for rest
  - Bottom tabs: Accueil, Annonces, Leads, Messages, Plus
  - "Plus" opens a grid of remaining items (Visites, Analytics, AI, etc.)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 8 — AQARCHAAB (Espace Particulier UX)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# AqarChaab — Espace Particulier UX Specification

## Overview

AqarChaab is the personal space for individual users (buyers, renters, sellers). It must feel warm, personal, and encouraging — less dense than AqarPro, more spacious and friendly. Inspired by Notion's personal workspace warmth and Airbnb's trip management. Primary user: Algerian individual (25-45), mobile-heavy usage.

## App Shell

```
┌────────────────────────────────────────────────────┐
│ [AqarChaab logo]           [🌙] [FR▾] [Avatar ▾] │ ← Top bar (mobile)
├──────────┬─────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │           MAIN CONTENT                   │
│ (240px)  │                                          │
│          │  Page Title                              │
│ Accueil  │                                          │
│ Annonces │  [Content — max-w-5xl, relaxed]          │
│ Messages │                                          │
│ Favoris  │                                          │
│ Alertes  │                                          │
│ Collect. │                                          │
│ Historique│                                         │
│ Upgrade  │                                          │
│ ─────── │                                          │
│ Profil   │                                          │
│          │                                          │
├──────────┴─────────────────────────────────────────┤
│ (mobile: bottom nav — 5 items)                      │
└────────────────────────────────────────────────────┘
```

**Differences from AqarPro:**
- Sidebar: slightly narrower feel, warmer colors, no command palette
- Content area: `max-w-5xl` (vs 6xl for Pro), more generous padding
- Spacing: `py-8 px-4 md:px-8` — more breathing room
- No bulk actions, no data tables — card-based layouts
- Tone: friendly copy, encouraging empty states, progress indicators

## Key Pages

### 1. Home (`/[locale]/AqarChaab/espace`)

```
┌──────────────────────────────────────────────────┐
│ Bienvenue, Lounis 👋                              │
│ Voici un résumé de votre activité                │
├──────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐            │
│ │ 🏠 3 favoris   │ │ 🔔 2 alertes   │            │
│ │ Voir →          │ │ actives         │            │
│ └────────────────┘ └────────────────┘            │
│ ┌────────────────┐ ┌────────────────┐            │
│ │ 💬 1 message   │ │ 📋 1 annonce   │            │
│ │ non lu          │ │ en ligne        │            │
│ └────────────────┘ └────────────────┘            │
├──────────────────────────────────────────────────┤
│ Derniers biens consultés                          │
│ [ListingCard] [ListingCard] [ListingCard]         │
│ (horizontal scroll on mobile)                     │
├──────────────────────────────────────────────────┤
│ Suggestions pour vous                             │
│ Basé sur vos recherches et favoris                │
│ [ListingCard] [ListingCard] [ListingCard]         │
├──────────────────────────────────────────────────┤
│ Actions rapides                                   │
│ [Déposer une annonce] [Estimer un bien]           │
│ [Créer une alerte]   [Comparer des biens]         │
└──────────────────────────────────────────────────┘
```

**UX details:**
- Welcome card: user name + avatar initial, warm greeting based on time of day
- Summary cards: 2x2 grid, each with icon + count + label + link
- Cards use `rounded-xl` (not lg) for warmer feel
- Colors: subtle amber accents on icons and badges
- Recent listings: horizontal scroll with snap points on mobile
- Quick actions: ghost buttons with icons, 2x2 grid

### 2. Mes annonces (`/[locale]/AqarChaab/espace/mes-annonces`)

Individual users can post listings (not just agencies). Show their own listings.

```
┌──────────────────────────────────────────────────┐
│ Mes annonces (2)         [+ Déposer une annonce] │
├──────────────────────────────────────────────────┤
│                                                    │
│ [ListingCard — full width, horizontal layout]      │
│ Photo | Title, price, status, date | Actions       │
│                                                    │
│ [ListingCard — full width, horizontal layout]      │
│                                                    │
├──────────────────────────────────────────────────┤
│ Quota: 2/3 annonces utilisées                      │
│ [████████░░] Augmenter mon quota →                │
└──────────────────────────────────────────────────┘
```

**UX details:**
- Card: horizontal layout (photo left, content right) on desktop
- Vertical (stacked) on mobile
- Status indicator: colored dot + text
- Actions: edit, pause/unpublish, delete (with confirmation)
- Quota bar: progress bar showing usage vs limit
- "Augmenter mon quota" links to upgrade page

### 3. Favoris (`/[locale]/favorites`)

```
┌──────────────────────────────────────────────────┐
│ Mes favoris                                        │
├──────────────────────────────────────────────────┤
│ [Favoris] [Notes] [Recherches sauvegardées]        │ ← Client-side tabs
├──────────────────────────────────────────────────┤
│                                                    │
│ Tab: Favoris                                       │
│ [ListingCard] [ListingCard] [ListingCard]          │
│ (3-col grid, 2-col tablet, 1-col mobile)           │
│                                                    │
│ Tab: Notes                                         │
│ List of note cards with listing title + note text  │
│                                                    │
│ Tab: Recherches                                    │
│ List of saved search cards with filters + delete   │
└──────────────────────────────────────────────────┘
```

**UX details:**
- Tabs: client-side toggle (no page reload) — FavoritesTabs component
- ListingCards: standard grid, with "Retirer" overlay on hover
- Notes: card list with truncated text, click to expand
- Empty state per tab: illustration + encouraging text + CTA
- Collection grouping: future feature — drag-to-organize

### 4. Messagerie (`/[locale]/AqarChaab/espace/messagerie`)

```
┌────────────────────┬─────────────────────────────┐
│ Conversations       │ Chat                        │
│                    │                             │
│ [Agency 1] unread  │ [AgencyName] — [ListingTitle]│
│ [Agency 2]         │                             │
│ [Agency 3]         │ ┌─────────────────────────┐ │
│                    │ │ Bubble: Bonjour, le F3  │ │
│                    │ │ est-il toujours dispo ? │ │
│                    │ └─────────────────────────┘ │
│                    │         ┌───────────────────┐│
│                    │         │ Oui, disponible ! ││
│                    │         └───────────────────┘│
│                    │                             │
│                    │ ┌──────────────────────┐    │
│                    │ │ Type your message... │ [→]│
│                    │ └──────────────────────┘    │
└────────────────────┴─────────────────────────────┘
```

**UX details:**
- Split view: conversation list (left) + chat (right) on desktop
- Mobile: conversation list → tap → full chat view (back button)
- Conversation list: avatar, name, last message preview, unread badge, timestamp
- Chat bubbles: user = amber-50 bg (end-aligned), other = zinc-100 bg (start-aligned)
- Dark mode: user = amber-900/20, other = zinc-800
- Input: auto-grow textarea, send button, enter to send
- Real-time: Supabase realtime, typing indicator dots
- Unread separator: "2 nouveaux messages" divider line
- Click on listing reference in chat → opens listing in new tab

### 5. Alertes (`/[locale]/AqarChaab/espace/alertes`)

```
┌──────────────────────────────────────────────────┐
│ Mes alertes (3 actives)      [+ Créer une alerte]│
├──────────────────────────────────────────────────┤
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 🔔 F3 à Alger, < 5M DA          [On] [✕]   │  │
│ │ Dernière notification: il y a 2 jours        │  │
│ │ 3 nouveaux résultats                          │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 🔔 Villa Oran                     [On] [✕]   │  │
│ │ Dernière notification: il y a 1 semaine      │  │
│ │ Aucun nouveau résultat                        │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
└──────────────────────────────────────────────────┘
```

**UX details:**
- Alert card: name + filters summary + toggle switch + delete
- Toggle: on/off for notifications
- "X nouveaux résultats" link → opens search with those filters
- Create alert: modal/drawer with filter form (reuse SearchFilters)
- Empty state: "Créez votre première alerte pour ne rien manquer"

### 6. Profil (`/[locale]/AqarChaab/espace/profil`)

```
┌──────────────────────────────────────────────────┐
│ Mon profil                                         │
├──────────────────────────────────────────────────┤
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ [Avatar circle]                               │  │
│ │ Lounis Nom                                    │  │
│ │ lounis@email.com                              │  │
│ │ Membre depuis mars 2026                       │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ Informations personnelles                          │
│ ┌──────────────────────────────────────────────┐  │
│ │ Nom complet  [_________________] [Modifier]   │  │
│ │ Téléphone    [_________________]              │  │
│ │ Langue       [FR ▾]                           │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ Préférences                                       │
│ ┌──────────────────────────────────────────────┐  │
│ │ Notifications email    [On]                   │  │
│ │ Notifications push     [Off]                  │  │
│ │ Thème                  [Clair ▾]              │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ Sécurité                                          │
│ [Changer le mot de passe]                          │
│ [Supprimer mon compte] ← danger zone               │
└──────────────────────────────────────────────────┘
```

### 7. Mes projets — Cockpit immobilier (différenciateur #3)

**Concept :** Transformer l'expérience de browsing passif en cockpit de projet structuré. C'est la feature signature d'AqarChaab.

**Page liste des projets (`/[locale]/AqarChaab/espace/projets`) :**

```
┌──────────────────────────────────────────────────┐
│ Mes projets (2)              [+ Nouveau projet]   │
├──────────────────────────────────────────────────┤
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 📁 Appartement Alger                    [···]│  │
│ │ Budget: 3-5M DA · F3/F4 · Alger centre      │  │
│ │                                               │  │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │  │
│ │ │🏠 6  │ │⚖ 2  │ │💬 1  │ │💰 35K│        │  │
│ │ │favoris│ │compar│ │conv. │ │DA/mois│        │  │
│ │ └──────┘ └──────┘ └──────┘ └──────┘        │  │
│ │                                               │  │
│ │ Progression: ████████░░░░ Visites             │  │
│ │ Recherche → Visites → Négo → Acte → Clés    │  │
│ │                                               │  │
│ │ Dernière activité: il y a 2h                 │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 📁 Terrain Tipaza                       [···]│  │
│ │ Budget: 8-12M DA · Terrain · Tipaza          │  │
│ │ 3 favoris · 1 alerte active                  │  │
│ │ Dernière activité: hier                      │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│   + Créer un nouveau projet                       │
│   Définissez vos critères et suivez votre         │
│   recherche de A à Z.                             │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
└──────────────────────────────────────────────────┘
```

**Page détail d'un projet (`/[locale]/AqarChaab/espace/projets/[id]`) :**

```
┌──────────────────────────────────────────────────┐
│ ← Mes projets   Appartement Alger        [⚙] [🔗]│
├──────────────────────────────────────────────────┤
│ Tabs: [Favoris] [Comparaison] [Financement]       │
│       [Conversations] [Notes] [Checklist]         │
├──────────────────────────────────────────────────┤
│                                                    │
│ Tab: Favoris (6 biens)                             │
│ Grid de ListingCards rattachées à ce projet        │
│ [+ Ajouter un favori] (ouvre la recherche avec     │
│  les critères du projet pré-remplis)               │
│                                                    │
│ Tab: Comparaison                                   │
│ ┌──────┬──────┬──────┬──────┐                     │
│ │      │Bien 1│Bien 2│Bien 3│                     │
│ │Photo │[img] │[img] │[img] │                     │
│ │Prix  │4.5M  │3.8M  │5.2M  │                     │
│ │m²    │120   │95    │140   │                     │
│ │Pièces│3     │3     │4     │                     │
│ │Score │85    │72    │91    │                     │
│ │Wilaya│Hydra │Kouba │B.M.  │                     │
│ └──────┴──────┴──────┴──────┘                     │
│ [+ Ajouter à la comparaison] (max 4)              │
│                                                    │
│ Tab: Financement                                   │
│ Simulateur (montant, apport, taux, durée)          │
│ → Mensualités estimées: 35 000 DA/mois             │
│ → Coût total: 6 300 000 DA                         │
│                                                    │
│ Tab: Conversations                                 │
│ Liste des échanges avec les agences pour les       │
│ biens de ce projet                                 │
│                                                    │
│ Tab: Checklist                                     │
│ ☑ Recherche initiale                              │
│ ☑ Présélection (≥3 biens)                        │
│ ☐ Visites programmées                             │
│ ☐ Négociation                                     │
│ ☐ Offre / promesse                                │
│ ☐ Acte notarié                                    │
│ ☐ Remise des clés                                 │
│                                                    │
└──────────────────────────────────────────────────┘
```

**Création de projet (modal) :**
- Nom du projet (ex: "Appartement Alger")
- Budget min / max
- Type de bien (F2, F3, F4, Villa, Terrain...)
- Zone (wilaya + commune optionnel)
- Notes libres
- → Crée le projet + propose de lancer une recherche avec ces critères

**Connexions :**
- Depuis la fiche listing : bouton "Ajouter à un projet" → dropdown des projets
- Depuis les favoris : drag or button "Déplacer dans un projet"
- Depuis la messagerie : conversations auto-liées au projet via le listing
- Partage : lien partageable (co-acheteur peut voir les favoris + comparaison)

## Visual Differentiation from AqarPro

| Aspect | AqarPro | AqarChaab |
|--------|---------|-----------|
| Density | High (14px base, tight spacing) | Relaxed (16px body, generous spacing) |
| Border radius | `rounded-lg` (8px) | `rounded-xl` (12px) for cards |
| Sidebar | Dark (zinc-950) | Dark (zinc-950) but with amber accents |
| Cards | Sharp borders, compact | Softer shadows, more padding |
| Empty states | Functional, minimal | Illustrated, encouraging copy |
| Tables | Dense DataTable | No tables — card lists only |
| Tone | Professional, efficient | Warm, personal, supportive |
| Max width | `max-w-6xl` | `max-w-5xl` |
| Icon style | 16px, strokeWidth 1.5 | 20px, strokeWidth 1.5 |

## Mobile-First Patterns

- Bottom navigation: [Accueil] [Favoris] [Messages] [Alertes] [Profil]
- No sidebar on mobile — fully replaced by bottom nav
- Top bar: logo + theme toggle + avatar
- Cards: full-width, stacked vertically
- Pull-to-refresh on listing pages
- Swipe gestures: swipe left on favorite card → remove
- Native-feeling transitions between pages

## Animations

- **Page enter:** slide-up + fade-in (200ms)
- **Cards:** stagger animation on load (30ms delay per card)
- **Tab switch:** crossfade content (150ms)
- **Alert toggle:** switch slides with spring ease
- **Message bubble:** slide-in from bottom (150ms)
- **Typing indicator:** 3 dots pulsing (opacity animation)
- **Empty state:** gentle bounce-in of illustration (300ms, spring)
- **Quota bar:** width animates on mount (500ms, ease-out)
