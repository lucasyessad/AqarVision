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
