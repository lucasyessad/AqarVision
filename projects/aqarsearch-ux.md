# AqarSearch — Marketplace UX Specification

## Overview

AqarSearch is the public-facing marketplace. It must be fast, photo-immersive, and conversion-optimized. Primary user: Algerian home seeker (buyer or renter), 25-45 years old, mobile-first.

## Key Pages

### 1. Homepage (`/[locale]`)

**Layout: Hero + discovery sections**

```
┌─────────────────────────────────────────────────────┐
│ Header (transparent, becomes solid on scroll)        │
├─────────────────────────────────────────────────────┤
│                                                      │
│              HERO SECTION (80vh)                      │
│     Dark gradient overlay on photo background        │
│                                                      │
│     "Trouvez votre bien en Algérie"                 │
│     [SearchBar — full-width, prominent]               │
│                                                      │
│     Quick filters: Acheter · Louer · Vacances        │
│                                                      │
├─────────────────────────────────────────────────────┤
│ Trending Wilayas — horizontal scroll chips           │
│ [Alger] [Oran] [Constantine] [Annaba] [Tizi] ...    │
├─────────────────────────────────────────────────────┤
│ Featured Listings — 3-column grid of ListingCards    │
│ "Les plus consultés cette semaine"                   │
├─────────────────────────────────────────────────────┤
│ By Property Type — icon grid                         │
│ 🏢 Appartements  🏠 Villas  🏗 Terrains  ...       │
├─────────────────────────────────────────────────────┤
│ Trust Section — stats strip                          │
│ "2,500+ agences vérifiées · 15,000+ annonces"      │
├─────────────────────────────────────────────────────┤
│ CTA — "Vous êtes professionnel ?"                   │
│ [Découvrir AqarPro →]                                │
├─────────────────────────────────────────────────────┤
│ Footer                                               │
└─────────────────────────────────────────────────────┘
```

**Hero interactions:**
- Background: subtle parallax photo or animated gradient mesh (dark zinc-950 base)
- SearchBar: elevated with shadow-xl, slight scale animation on focus
- Quick filter pills: active state = amber-500 solid, inactive = zinc-800/20 ghost
- Typing in search: show autocomplete dropdown with wilayas + communes (debounce 300ms)

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
