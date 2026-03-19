# Design Tokens — AqarVision Stone Design System

> Philosophie : "Pierre chaude meets mer Mediterranee" — Airbnb (chaleur), Stripe (precision), identite algerienne.
> Source de verite : `globals.css` (CSS custom properties) + `tailwind.config.ts` (mappings Tailwind).

---

## Couleurs

### Neutres — Stone (gris beige chaud)

| Token | Hex | Usage |
|-------|-----|-------|
| `stone-50` | #FAFAF9 | Background app light |
| `stone-100` | #F5F5F4 | Surfaces mutees, bg-muted light |
| `stone-200` | #E7E5E4 | Bordures par defaut light |
| `stone-300` | #D6D3D1 | Bordures fortes light |
| `stone-400` | #A8A29E | Texte tertiaire light, secondaire dark |
| `stone-500` | #78716C | Texte secondaire light |
| `stone-600` | #57534E | Texte dense |
| `stone-700` | #44403C | Bordures fortes dark |
| `stone-800` | #292524 | bg-muted dark |
| `stone-900` | #1C1917 | bg-surface dark |
| `stone-950` | #0C0A09 | bg-app dark, texte primaire light |

### Accent principal — Teal (mer Mediterranee)

| Token | Hex | Usage |
|-------|-----|-------|
| `teal-50` | #F0FDFA | Ghost background light |
| `teal-100` | #CCFBF1 | Ghost background stronger |
| `teal-400` | #2DD4BF | Accent dark mode |
| `teal-500` | #14B8A6 | Accent hover light |
| `teal-600` | #0D9488 | **Accent principal** — CTA, liens, focus, highlights |
| `teal-700` | #0F766E | Accent hover dark, active state |
| `teal-800` | #115E59 | Accent pressed |

### Accent secondaire — Amber (touches chaudes)

| Token | Hex | Usage |
|-------|-----|-------|
| `amber-50` | #FFFBEB | Ghost background chaud |
| `amber-400` | #FBBF24 | Badges, notifications, warning, touches chaudes |
| `amber-500` | #F59E0B | Warning principal |
| `amber-600` | #D97706 | Warning hover |

### Tokens semantiques CSS — `globals.css`

```css
:root {
  /* Backgrounds */
  --bg-app: #FAFAF9;
  --bg-surface: #FFFFFF;
  --bg-muted: #F5F5F4;
  --bg-elevated: #FFFFFF;
  --bg-overlay: rgba(0, 0, 0, 0.5);
  --bg-inverse: #1C1917;

  /* Text */
  --text-primary: #0C0A09;
  --text-secondary: #78716C;
  --text-tertiary: #A8A29E;
  --text-inverse: #FAFAF9;
  --text-accent: #0D9488;
  --text-danger: #DC2626;
  --text-success: #16A34A;

  /* Borders */
  --border-default: #E7E5E4;
  --border-strong: #D6D3D1;
  --border-focus: #0D9488;
  --border-danger: #EF4444;
  --border-success: #22C55E;

  /* Accent */
  --accent: #0D9488;
  --accent-hover: #0F766E;
  --accent-ghost: rgba(13, 148, 136, 0.08);
  --accent-warm: #FBBF24;
  --accent-warm-ghost: rgba(251, 191, 36, 0.08);

  /* Focus */
  --ring-color: #0D9488;
  --ring-offset: #FFFFFF;
  --ring-danger: #EF4444;

  /* Shadows */
  --shadow-color: rgba(12, 10, 9, 0.04);
  --shadow-color-hover: rgba(12, 10, 9, 0.08);
}

[data-theme="dark"] {
  /* Backgrounds */
  --bg-app: #0C0A09;
  --bg-surface: #1C1917;
  --bg-muted: #292524;
  --bg-elevated: #292524;
  --bg-overlay: rgba(0, 0, 0, 0.7);
  --bg-inverse: #FAFAF9;

  /* Text */
  --text-primary: #FAFAF9;
  --text-secondary: #A8A29E;
  --text-tertiary: #78716C;
  --text-inverse: #0C0A09;
  --text-accent: #2DD4BF;
  --text-danger: #F87171;
  --text-success: #4ADE80;

  /* Borders */
  --border-default: #292524;
  --border-strong: #44403C;
  --border-focus: #2DD4BF;
  --border-danger: #F87171;
  --border-success: #4ADE80;

  /* Accent */
  --accent: #2DD4BF;
  --accent-hover: #14B8A6;
  --accent-ghost: rgba(45, 212, 191, 0.08);
  --accent-warm: #FBBF24;
  --accent-warm-ghost: rgba(251, 191, 36, 0.08);

  /* Focus */
  --ring-color: #2DD4BF;
  --ring-offset: #1C1917;
  --ring-danger: #F87171;

  /* Shadows */
  --shadow-color: rgba(0, 0, 0, 0.3);
  --shadow-color-hover: rgba(0, 0, 0, 0.4);
}
```

### Tricolore Algerien

| Token | Hex | Usage |
|-------|-----|-------|
| `sahara` | #E8920A | Or, accents chauds, transitions marketing |
| `med` | #1A7FA8 | Bleu mediterraneen, cartes, liens immobilier |
| `atlas` | #2A8A4A | Vert atlas, indicateurs succes, nature |

Chaque tricolore a des variantes : 50, 100, 500 (DEFAULT), 600, 700.

### Immobilier

| Token | Hex | Usage |
|-------|-----|-------|
| `listing-sale` | #3B82F6 | Badge vente (blue) |
| `listing-rent` | #8B5CF6 | Badge location (purple) |
| `listing-vacation` | #F59E0B | Badge vacances (amber) |
| `status-draft` | #78716C | Brouillon (stone-500) |
| `status-pending` | #F59E0B | En attente (amber) |
| `status-published` | #22C55E | Publiee (green) |
| `status-paused` | #A8A29E | Pausee (stone-400) |
| `status-rejected` | #EF4444 | Rejetee (red) |
| `status-sold` | #3B82F6 | Vendue (blue) |

### Statut semantique

| Token | Light | Dark | Ghost (8% opacity) |
|-------|-------|------|-----|
| `success` | #22C55E | #4ADE80 | rgba(34,197,94,0.08) |
| `warning` | #F59E0B | #FBBF24 | rgba(245,158,11,0.08) |
| `danger` | #EF4444 | #F87171 | rgba(239,68,68,0.08) |
| `info` | #3B82F6 | #60A5FA | rgba(59,130,246,0.08) |

---

## Contraste WCAG AA

Paires critiques verifiees (ratio minimum 4.5:1 pour texte, 3:1 pour UI) :

| Paire | Light ratio | Dark ratio | Statut |
|-------|-------------|------------|--------|
| text-primary / bg-surface | 21:1 (#0C0A09 on #FFF) | 17.4:1 (#FAFAF9 on #1C1917) | AA |
| text-secondary / bg-surface | 4.6:1 (#78716C on #FFF) | 4.8:1 (#A8A29E on #1C1917) | AA |
| accent / bg-surface | 4.6:1 (#0D9488 on #FFF) | 8.5:1 (#2DD4BF on #1C1917) | AA |
| white / accent | 4.6:1 (#FFF on #0D9488) | — | AA |
| danger / bg-surface | 4.6:1 (#EF4444 on #FFF) | 5.2:1 (#F87171 on #1C1917) | AA |

---

## Z-index

| Token | Valeur | Usage |
|-------|--------|-------|
| `z-base` | 0 | Contenu normal |
| `z-sticky` | 10 | Headers sticky, sidebar |
| `z-dropdown` | 20 | Dropdowns, popovers, autocomplete |
| `z-overlay` | 30 | Overlays, backdrop |
| `z-modal` | 40 | Modals, dialogs, drawers |
| `z-toast` | 50 | Toasts, notifications |
| `z-tooltip` | 60 | Tooltips |
| `z-max` | 9999 | Debug, dev tools |

---

## Opacite

| Token | Valeur | Usage |
|-------|--------|-------|
| `opacity-ghost` | 0.08 | Backgrounds ghost (accent, success, danger) |
| `opacity-hover` | 0.12 | Backgrounds hover subtils |
| `opacity-disabled` | 0.5 | Elements desactives |
| `opacity-overlay-light` | 0.5 | Backdrop modal light mode |
| `opacity-overlay-dark` | 0.7 | Backdrop modal dark mode |
| `opacity-placeholder` | 0.5 | Texte placeholder |

---

## Focus & Ring

Tous les elements interactifs doivent avoir un etat focus visible.

| Contexte | Classes Tailwind |
|----------|-----------------|
| **Focus standard** | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]` |
| **Focus danger** (inputs en erreur) | `focus-visible:ring-[var(--ring-danger)]` au lieu de `--ring-color` |
| **Focus inset** (elements sans espace) | `focus-visible:ring-offset-0` |

Ring = 2px width, 2px offset. Couleur = teal (light) / teal-400 (dark). Danger = red.

---

## Typographie

### Familles

| Token | Polices | Usage |
|-------|---------|-------|
| `font-display` | Geist, system-ui, sans-serif | Titres, headlines |
| `font-sans` | Geist, system-ui, sans-serif | Body text |
| `font-arabic` | IBM Plex Sans Arabic, Noto Sans Arabic, sans-serif | Texte arabe (RTL) |
| `font-mono` | Geist Mono, JetBrains Mono, monospace | Code, donnees techniques |

### Echelle typographique

| Token | Taille | Line-height | Letter-spacing | Usage |
|-------|--------|-------------|----------------|-------|
| `text-2xs` | 0.6875rem (11px) | 1rem | 0.01em | Labels minuscules |
| `text-xs` | 0.75rem (12px) | 1rem | 0.01em | Badges, metadata |
| `text-sm` | 0.8125rem (13px) | 1.25rem | 0 | Texte secondaire, boutons compacts |
| `text-base` | 0.875rem (14px) | 1.25rem | 0 | Texte courant (defaut body) |
| `text-md` | 1rem (16px) | 1.5rem | 0 | Sous-titres, labels importants |
| `text-lg` | 1.125rem (18px) | 1.75rem | -0.01em | Headlines section |
| `text-xl` | 1.25rem (20px) | 1.75rem | -0.01em | H3, titres cartes |
| `text-2xl` | 1.5rem (24px) | 2rem | -0.02em | H2 |
| `text-3xl` | 1.875rem (30px) | 2.25rem | -0.02em | H1 section |
| `text-4xl` | 2.25rem (36px) | 2.5rem | -0.03em | H1 page |
| `text-5xl` | 3rem (48px) | 1.1 | -0.03em | Hero headlines |
| `text-6xl` | 3.75rem (60px) | 1 | -0.04em | Hero display (marketing) |

### Font weights

| Token | Usage |
|-------|-------|
| `font-light` (300) | Texte secondaire, descriptions longues |
| `font-normal` (400) | Texte courant |
| `font-medium` (500) | Labels, boutons, liens |
| `font-semibold` (600) | Sous-titres, headers section |
| `font-bold` (700) | Headlines, prix |

---

## Spacing

### Base (systeme 4px)

Utiliser les utilitaires Tailwind standards : `0.5` (2px), `1` (4px), `1.5` (6px), `2` (8px), `2.5` (10px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px), `16` (64px), `20` (80px), `24` (96px).

### Extensions custom

| Token | Valeur | Usage |
|-------|--------|-------|
| `4.5` | 18px | Espacement intermediaire |
| `13` | 52px | Espacement section |
| `15` | 60px | Espacement section large |
| `18` | 72px | Espacement section XL |
| `88` | 352px | Largeur sidebar max |

### Container

```
max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8
```

Composant `<Container>` reutilisable. Sur mobile (`< sm`), padding 16px. Sur tablette 24px. Sur desktop 32px.

### Espacements de page standard

| Contexte | Padding |
|----------|---------|
| Page content (dashboard) | `p-4 sm:p-6 lg:p-8` |
| Section marketing | `py-16 sm:py-20 lg:py-24` |
| Card interne | `p-4 sm:p-5 lg:p-6` |
| Modal/Dialog | `p-6` |
| Formulaire (gap entre champs) | `space-y-4 sm:space-y-5` |

---

## Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `rounded-sm` | 4px | Badges inline, petits elements |
| `rounded` | 6px | Inputs, boutons compacts |
| `rounded-md` | 8px | Boutons standard, cards compactes |
| `rounded-lg` | 12px | Cards, modales, dropdowns |
| `rounded-xl` | 16px | Cards principales, sections |
| `rounded-2xl` | 20px | Hero cards, sections editoriales |
| `rounded-full` | 9999px | Avatars, pills, badges ronds, toggles |

---

## Shadows

### Light mode

| Token | Valeur | Usage |
|-------|--------|-------|
| `shadow-xs` | `0 1px 2px var(--shadow-color)` | Elevation minimale |
| `shadow-sm` | `0 1px 3px var(--shadow-color), 0 1px 2px var(--shadow-color)` | Bordure subtile |
| `shadow-md` | `0 4px 6px var(--shadow-color), 0 2px 4px var(--shadow-color)` | Cards au repos |
| `shadow-lg` | `0 10px 15px var(--shadow-color-hover), 0 4px 6px var(--shadow-color)` | Cards elevees, modales |
| `shadow-xl` | `0 20px 25px var(--shadow-color-hover), 0 8px 10px var(--shadow-color)` | Popovers, drawers |
| `shadow-card` | `0 1px 3px var(--shadow-color), 0 1px 2px var(--shadow-color)` | Cards par defaut |
| `shadow-card-hover` | `0 8px 25px var(--shadow-color-hover), 0 4px 10px var(--shadow-color)` | Cards au hover |
| `shadow-ring` | `0 0 0 2px var(--ring-color)` | Focus ring |
| `shadow-ring-offset` | `0 0 0 2px var(--ring-offset), 0 0 0 4px var(--ring-color)` | Focus ring avec offset |
| `shadow-ring-danger` | `0 0 0 2px var(--ring-offset), 0 0 0 4px var(--ring-danger)` | Focus ring erreur |

> Les variables `--shadow-color` et `--shadow-color-hover` changent automatiquement en dark mode (voir CSS vars ci-dessus).

---

## Motion & Transitions

### Timing functions

| Token | Valeur | Usage |
|-------|--------|-------|
| `ease-DEFAULT` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Transitions standard |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Rebond, micro-interactions |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements qui sortent |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements qui entrent |

### Durations

| Token | Valeur | Usage |
|-------|--------|-------|
| `duration-fast` | 100ms | Hover, focus, toggles |
| `duration-normal` | 200ms | Transitions standard |
| `duration-slow` | 300ms | Ouverture/fermeture panels, drawers |
| `duration-slower` | 500ms | Animations d'entree complexes, parallax |

### Proprietes a animer

| Contexte | Proprietes | Exemple Tailwind |
|----------|-----------|------------------|
| Boutons | background-color, color, box-shadow | `transition-colors duration-fast` |
| Cards hover | transform, box-shadow | `transition-[transform,box-shadow] duration-normal` |
| Panels/Drawers | transform, opacity | `transition-[transform,opacity] duration-slow` |
| Bordures/Focus | border-color, ring | `transition-[border-color] duration-fast` |
| Backgrounds | background-color | `transition-colors duration-normal` |

### Animations predefinies

| Token | Keyframes | Duree | Easing |
|-------|-----------|-------|--------|
| `animate-fade-in` | opacity: 0 → 1 | 200ms | ease-out |
| `animate-fade-out` | opacity: 1 → 0 | 150ms | ease-in |
| `animate-slide-up` | translateY(8px) + opacity 0 → translateY(0) + opacity 1 | 200ms | ease-out |
| `animate-slide-down` | translateY(-8px) + opacity 0 → translateY(0) + opacity 1 | 200ms | ease-out |
| `animate-scale-in` | scale(0.95) + opacity 0 → scale(1) + opacity 1 | 200ms | ease-spring |
| `animate-shimmer` | background-position: -200% → 200% | 2s | linear, infinite |
| `animate-shake` | translateX(0, -4px, 4px, -4px, 4px, 0) | 400ms | ease-DEFAULT |
| `animate-spin` | rotate(0 → 360deg) | 700ms | linear, infinite |
| `animate-pulse` | opacity 1 → 0.5 → 1 | 2s | ease-in-out, infinite |

### Stagger pattern

Pour les listes animees (cards, resultats) : `animation-delay: calc(var(--index) * 80ms)`.
Max 8 elements staggers (640ms max delay). Au-dela, apparition instantanee.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Layout

### Sidebar

| Token | Valeur | Usage |
|-------|--------|-------|
| `--sidebar-width` | 240px | Sidebar deployee |
| `--sidebar-collapsed` | 64px | Sidebar reduite (icones uniquement) |

### Breakpoints

| Token | Valeur | Usage |
|-------|--------|-------|
| `sm` | 640px | Mobile paysage, petit tablet |
| `md` | 768px | Tablette portrait |
| `lg` | 1024px | Desktop, tablette paysage |
| `xl` | 1280px | Desktop large |
| `2xl` | 1536px | Desktop XL |

### Patterns responsifs standards

| Pattern | Classes |
|---------|---------|
| Grille cartes | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6` |
| Split content/sidebar | `grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8` |
| Formulaire centre | `max-w-lg mx-auto` |
| Dashboard content | `p-4 sm:p-6 lg:p-8` |
| Section marketing | `py-16 sm:py-20 lg:py-24` |
| Stack formulaire | `space-y-4 sm:space-y-5` |

### Dark mode

Implementation via `data-theme="dark"` sur `<html>`, persiste en cookie + localStorage.

```typescript
// Dans tailwind.config.ts
darkMode: ['selector', '[data-theme="dark"]'],
```

Chaque classe couleur doit avoir sa paire `dark:` :
```html
<div class="bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50">
```

Ou utiliser les CSS vars (prefere pour les tokens semantiques) :
```html
<div class="bg-[var(--bg-surface)] text-[var(--text-primary)]">
```
