# Component Library — AqarVision

> Catalogue des primitives UI partagees dans `components/ui/`.
> Chaque composant respecte : tokens Tailwind uniquement (pas de hex), dark mode complet, RTL-safe (`ps-`/`pe-`/`ms-`/`me-`), prop `className` pour composition.

---

## Primitives

### Button

**Fichier** : `components/ui/Button.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger" \| "accent"` | `"primary"` | Style visuel |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Taille |
| `loading` | `boolean` | `false` | Affiche spinner, desactive le bouton |
| `icon` | `ReactNode` | — | Icone a gauche du label |
| `iconEnd` | `ReactNode` | — | Icone a droite |
| `as` | `"button" \| "a" \| typeof Link` | `"button"` | Element HTML rendu |
| `className` | `string` | — | Classes additionnelles |

**Variantes :**
- `primary` : `bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900` hover inverse
- `secondary` : `border border-zinc-200 dark:border-zinc-700` fond transparent
- `ghost` : Fond transparent, hover `bg-zinc-100 dark:bg-zinc-800`
- `danger` : `bg-danger text-white` hover plus sombre
- `accent` : `bg-amber-500 text-white` hover `bg-amber-600`

**Tailles :**
- `sm` : `h-8 px-3 text-sm rounded`
- `md` : `h-9 px-4 text-sm rounded-md`
- `lg` : `h-11 px-6 text-base rounded-lg`

---

### Input

**Fichier** : `components/ui/Input.tsx`

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | — |
| `error` | `string` | — |
| `hint` | `string` | — |
| `icon` | `ReactNode` | — |
| `size` | `"sm" \| "md"` | `"md"` |

**Style** : `border border-[var(--border-default)] bg-surface rounded-md focus:ring-2 focus:ring-accent`

---

### Select

**Fichier** : `components/ui/Select.tsx`

Select natif style. Memes props que Input + `options: { value: string; label: string }[]`.

---

### Badge

**Fichier** : `components/ui/Badge.tsx`

| Prop | Type | Default |
|------|------|---------|
| `variant` | `"default" \| "success" \| "warning" \| "danger" \| "info" \| "accent"` | `"default"` |
| `size` | `"sm" \| "md"` | `"sm"` |
| `dot` | `boolean` | `false` |

**Usage** : Status annonces, types, badges confiance.

---

### Card

**Fichier** : `components/ui/Card.tsx`

| Prop | Type | Default |
|------|------|---------|
| `variant` | `"default" \| "elevated" \| "interactive"` | `"default"` |
| `padding` | `"none" \| "sm" \| "md" \| "lg"` | `"md"` |

- `default` : `bg-surface border border-[var(--border-default)] rounded-xl shadow-card`
- `elevated` : Ajoute `shadow-md`
- `interactive` : Ajoute `hover:shadow-card-hover hover:-translate-y-0.5 transition-all`

---

### IconButton

**Fichier** : `components/ui/IconButton.tsx`

Bouton carre avec icone seule. Tailles : `sm` (h-8 w-8), `md` (h-9 w-9), `lg` (h-10 w-10).
Inclut `aria-label` obligatoire.

---

### Dialog

**Fichier** : `components/ui/Dialog.tsx`

Modal accessible avec :
- Overlay `bg-overlay` + `backdrop-blur-sm`
- Animation `animate-scale-in`
- Focus trap, fermeture Escape
- Props : `open`, `onClose`, `title`, `description`, `children`

---

### Tooltip

**Fichier** : `components/ui/Tooltip.tsx`

Tooltip legere positionnee dynamiquement.
Props : `content: string`, `side: "top" | "bottom" | "start" | "end"`, `children`.

---

### Skeleton

**Fichier** : `components/ui/Skeleton.tsx`

| Prop | Type | Default |
|------|------|---------|
| `width` | `string \| number` | `"100%"` |
| `height` | `string \| number` | `"1rem"` |
| `rounded` | `string` | `"rounded-md"` |
| `className` | `string` | — |

Style : `bg-zinc-200 dark:bg-zinc-700 animate-shimmer`

---

### EmptyState

**Fichier** : `components/ui/EmptyState.tsx`

| Prop | Type | Default |
|------|------|---------|
| `icon` | `ReactNode` | — |
| `title` | `string` | — |
| `description` | `string` | — |
| `action` | `ReactNode` | — |

Layout centre avec icone en cercle, titre, description, et bouton d'action optionnel.

---

## Composants existants (non primitives)

### Dashboard

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `DashboardShell` | `components/dashboard/DashboardShell.tsx` | Layout principal dashboard (sidebar + content) |
| `DashboardSidebar` | `components/dashboard/DashboardSidebar.tsx` | Navigation laterale collapsible |
| `DashboardTopBar` | `components/dashboard/DashboardTopBar.tsx` | Barre superieure dashboard |
| `CommandPalette` | `components/dashboard/CommandPalette.tsx` | Palette de commandes (Cmd+K) |
| `ListingDrawer` | `components/dashboard/ListingDrawer.tsx` | Panneau lateral detail annonce |
| `BulkActionsBar` | `components/dashboard/BulkActionsBar.tsx` | Barre actions multi-selection |

### Marketing

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `MarketingHeader` | `components/marketing/MarketingHeader.tsx` | Header sticky transparent → solide |
| `MarketingFooter` | `components/marketing/MarketingFooter.tsx` | Footer marketing |
| `HomeSearchBar` | `components/marketing/HomeSearchBar.tsx` | Barre de recherche homepage |

### Editorial

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `EditorialSplit` | `components/editorial/EditorialSplit.tsx` | Layout split texte/image |
| `FullBleedPhoto` | `components/editorial/FullBleedPhoto.tsx` | Photo plein ecran avec overlay |
| `StatsStrip` | `components/editorial/StatsStrip.tsx` | Bande statistiques |
| `WilayaScroller` | `components/editorial/WilayaScroller.tsx` | Scroll horizontal wilayas |

---

## Regles de creation

1. **Server Component par defaut** — ajouter `"use client"` uniquement si interactivite requise
2. **Tokens uniquement** — jamais de hex, jamais d'inline style
3. **Dark mode obligatoire** — chaque classe bg/text/border a son pendant `dark:`
4. **RTL-safe** — `ps-`/`pe-`/`ms-`/`me-` au lieu de `pl-`/`pr-`/`ml-`/`mr-`
5. **Composition** — accepter `className` et merger via `clsx` ou template literals
6. **Accessibilite** — `aria-label` sur boutons sans texte, focus-visible, navigation clavier
