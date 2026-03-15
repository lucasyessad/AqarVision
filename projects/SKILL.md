---
name: aqarvision-ux-ui
description: "Complete UX/UI design system and refonte guidelines for the AqarVision proptech platform. Use this skill whenever working on ANY visual, layout, component, page, or styling task in the AqarVision project — including creating new pages, modifying existing components, building dashboards, styling forms, designing cards, implementing navigation, or adding animations. Also trigger when the user mentions 'design system', 'theme', 'tokens', 'colors', 'typography', 'dark mode', 'light mode', 'responsive', 'mobile', 'RTL', 'layout', 'component', 'card', 'sidebar', 'header', 'search UI', 'listing card', 'dashboard UI', or anything visual/aesthetic related to AqarVision. This skill defines the SINGLE SOURCE OF TRUTH for all visual decisions in the project."
---

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
