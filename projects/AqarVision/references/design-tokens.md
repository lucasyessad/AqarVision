# Design Tokens — AqarVision Zinc Design System

> Source de verite : `globals.css` (CSS custom properties) + `tailwind.config.ts` (mappings Tailwind).
> Toute modification de token doit etre faite dans ces deux fichiers simultanement.

---

## Couleurs

### Neutres — Zinc

| Token | Hex light | Hex dark | Usage |
|-------|-----------|----------|-------|
| `zinc-50` | #FAFAFA | — | Backgrounds subtils, bg-app light |
| `zinc-100` | #F4F4F5 | — | Surfaces mutees, bg-muted light |
| `zinc-200` | #E4E4E7 | — | Bordures par defaut light |
| `zinc-300` | #D4D4D8 | — | Bordures fortes light |
| `zinc-400` | #A1A1AA | — | Texte tertiaire light, secondaire dark |
| `zinc-500` | #71717A | — | Texte secondaire light, tertiaire dark |
| `zinc-600` | #52525B | — | Texte dense |
| `zinc-700` | #3F3F46 | — | Bordures fortes dark |
| `zinc-800` | #27272A | — | bg-muted dark, bordures dark |
| `zinc-900` | #18181B | — | bg-surface dark |
| `zinc-950` | #09090B | — | bg-app dark, texte primaire light |

### Accent — Amber

| Token | Hex | Usage |
|-------|-----|-------|
| `amber-400` | #FBBF24 | Accent dark mode, focus border dark |
| `amber-500` | #F59E0B | Accent principal, CTA, highlights, focus border light |
| `amber-600` | #D97706 | Accent hover light |

### Semantiques (CSS var-driven)

| Classe Tailwind | Variable CSS | Light | Dark |
|-----------------|-------------|-------|------|
| `bg-surface` | `--bg-surface` | #FFFFFF | #18181B |
| `bg-surface-muted` | `--bg-muted` | #F4F4F5 | #27272A |
| `bg-surface-elevated` | `--bg-elevated` | #FFFFFF | #1F1F23 |
| `text-primary` | `--text-primary` | #09090B | #FAFAFA |
| `text-secondary` | `--text-secondary` | #71717A | #A1A1AA |
| `text-tertiary` | `--text-tertiary` | #A1A1AA | #71717A |
| `text-accent` | `--accent` | #F59E0B | #FBBF24 |
| `bg-accent-ghost` | `--accent-ghost` | rgba(245,158,11,0.08) | rgba(251,191,36,0.08) |

### Tokens CSS non encore mappes dans Tailwind (Phase 0.2)

| Variable CSS | Light | Dark | Mapping Tailwind a creer |
|-------------|-------|------|--------------------------|
| `--bg-app` | #FAFAFA | #09090B | `bg-app` |
| `--bg-overlay` | rgba(0,0,0,0.5) | rgba(0,0,0,0.7) | `bg-overlay` |
| `--text-inverse` | #FAFAFA | #09090B | `text-inverse` |
| `--border-default` | #E4E4E7 | #27272A | `border-default` |
| `--border-strong` | #D4D4D8 | #3F3F46 | `border-strong` |
| `--border-focus` | #F59E0B | #FBBF24 | `border-focus` |
| `--shadow-elevated` | (voir ci-dessous) | (voir ci-dessous) | `shadow-elevated` |

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
| `listing-sale` | #3B82F6 | Badge vente |
| `listing-rent` | #8B5CF6 | Badge location |
| `listing-vacation` | #F59E0B | Badge vacances |
| `status-draft` | #71717A | Brouillon |
| `status-pending` | #F59E0B | En attente |
| `status-published` | #22C55E | Publiee |
| `status-paused` | #A1A1AA | Pausee |
| `status-rejected` | #EF4444 | Rejetee |
| `status-sold` | #3B82F6 | Vendue |

### Statut semantique

| Token | Hex light | Hex dark | Ghost |
|-------|-----------|----------|-------|
| `success` | #22C55E | #4ADE80 | rgba(34,197,94,0.08) |
| `warning` | #F59E0B | #FBBF24 | rgba(245,158,11,0.08) |
| `danger` | #EF4444 | #F87171 | rgba(239,68,68,0.08) |
| `info` | #3B82F6 | #60A5FA | rgba(59,130,246,0.08) |

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

| Token | Taille | Line-height | Usage |
|-------|--------|-------------|-------|
| `text-2xs` | 0.6875rem (11px) | 1rem | Labels minuscules |
| `text-xs` | 0.75rem (12px) | 1rem | Badges, metadata |
| `text-sm` | 0.8125rem (13px) | 1.25rem | Texte secondaire, boutons compacts |
| `text-base` | 0.875rem (14px) | 1.25rem | Texte courant (defaut body) |
| `text-md` | 1rem (16px) | 1.5rem | Sous-titres, labels importants |
| `text-lg` | 1.125rem (18px) | 1.75rem | Headlines section |
| `text-xl` | 1.25rem (20px) | 1.75rem | H3, titres cartes |
| `text-2xl` | 1.5rem (24px) | 2rem | H2 |
| `text-3xl` | 1.875rem (30px) | 2.25rem | H1 section |
| `text-4xl` | 2.25rem (36px) | 2.5rem | H1 page |
| `text-5xl` | 3rem (48px) | 1 (tight) | Hero headlines |

---

## Spacing

### Base (systeme 4px)

Utiliser les utilitaires Tailwind standards : `0.5` (2px), `1` (4px), `2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px), `16` (64px).

### Extensions custom

| Token | Valeur | Usage |
|-------|--------|-------|
| `4.5` | 1.125rem (18px) | Espacement intermediaire |
| `13` | 3.25rem (52px) | Espacement section |
| `15` | 3.75rem (60px) | Espacement section large |
| `18` | 4.5rem (72px) | Espacement section XL |
| `88` | 22rem (352px) | Largeur sidebar max / panels |

### Container standard

```
max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8
```

Ce pattern est recurrent dans toute l'app. A standardiser via une classe utilitaire ou un composant `<Container>`.

---

## Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `rounded-sm` | 4px | Inputs, badges |
| `rounded` / `rounded-md` | 6px | Boutons, cards compactes |
| `rounded-lg` | 8px | Cards, modales |
| `rounded-xl` | 12px | Cards principales, sections |
| `rounded-2xl` | 16px | Hero cards, sections editoriales |
| `rounded-full` | 9999px | Avatars, pills, badges ronds |

---

## Shadows

| Token | Valeur | Usage |
|-------|--------|-------|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Elevation minimale |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08), ...` | Bordure subtile |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07), ...` | Cards au repos |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.08), ...` | Cards elevees, modales |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.10), ...` | Popovers, drawers |
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.04), ...` | Cards par defaut |
| `shadow-card-hover` | `0 8px 25px rgba(0,0,0,0.08), ...` | Cards au hover |
| `shadow-ring` | `0 0 0 2px var(--accent)` | Focus ring |
| `shadow-ring-offset` | `0 0 0 2px var(--bg-surface), 0 0 0 4px var(--accent)` | Focus ring avec offset |

> En dark mode, les shadows `card` et `card-hover` sont plus fortes (0.3/0.4 au lieu de 0.04/0.08).

---

## Motion & Transitions

### Timing functions

| Token | Valeur | Usage |
|-------|--------|-------|
| `ease-DEFAULT` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Transitions standard |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Rebond, micro-interactions |

### Durations

| Token | Valeur | Usage |
|-------|--------|-------|
| `duration-fast` | 100ms | Hover, focus |
| `duration-normal` | 200ms | Transitions standard |
| `duration-slow` | 300ms | Ouverture/fermeture panels |
| `duration-slower` | 500ms | Animations d'entree complexes |

### Animations predefinies

| Token | Description | Duree |
|-------|-------------|-------|
| `animate-fade-in` | Opacite 0 → 1 | 200ms ease-out |
| `animate-fade-out` | Opacite 1 → 0 | 150ms ease-in |
| `animate-slide-up` | translateY(4px) + fade-in | 200ms ease-out |
| `animate-slide-down` | translateY(-4px) + fade-in | 200ms ease-out |
| `animate-scale-in` | scale(0.97) + fade-in | 200ms ease-out |
| `animate-shimmer` | Background shimmer | 2s infinite |
| `animate-shake` | Shake horizontal | 400ms |

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Sidebar

| Token | Valeur | Usage |
|-------|--------|-------|
| `--sidebar-width` | 240px | Sidebar deployee |
| `--sidebar-collapsed` | 64px | Sidebar reduite |

---

## Breakpoints

Tailwind defaults (non modifies) :

| Token | Valeur | Usage |
|-------|--------|-------|
| `sm` | 640px | Tablette portrait |
| `md` | 768px | Tablette paysage |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop large |
| `2xl` | 1536px | Desktop XL |

Pattern responsif standard : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
