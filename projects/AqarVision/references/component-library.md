# Component Library — AqarVision Stone Design System

> Catalogue complet des composants UI dans `components/ui/`.
> Regles : tokens Tailwind uniquement (pas de hex), dark mode complet, RTL-safe (`ps-`/`pe-`/`ms-`/`me-`), prop `className` pour composition, `clsx` pour merge.
> Chaque composant = Server Component par defaut. `"use client"` uniquement si interactivite requise.

---

## Matrice d'etats — Reference globale

Chaque composant interactif doit implementer ces 7 etats :

| Etat | Visuel | Cursor | Opacity | Transition |
|------|--------|--------|---------|------------|
| **default** | Couleurs de base | `cursor-pointer` | 1 | — |
| **hover** | Background plus sombre/clair, shadow | `cursor-pointer` | 1 | `duration-fast` |
| **focus** | Ring 2px teal (ou danger si erreur) | — | 1 | `duration-fast` |
| **active/pressed** | Background encore plus sombre, scale(0.98) | `cursor-pointer` | 1 | `duration-fast` |
| **disabled** | Couleurs attenuees | `cursor-not-allowed` | 0.5 | — |
| **loading** | Spinner visible, texte masque ou attenue | `cursor-wait` | 1 | — |
| **error** | Bordure danger, ring danger au focus | — | 1 | — |

---

## 1. PRIMITIVES — Formulaires

### Button

| Prop | Type | Default |
|------|------|---------|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger" \| "accent"` | `"primary"` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |
| `loading` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `icon` | `ReactNode` | — |
| `iconEnd` | `ReactNode` | — |
| `as` | `"button" \| "a" \| typeof Link` | `"button"` |
| `className` | `string` | — |

**Variantes :**

| Variant | Default | Hover | Active | Disabled |
|---------|---------|-------|--------|----------|
| `primary` | `bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900` | `bg-stone-800 dark:bg-stone-200` | `bg-stone-950 dark:bg-stone-300 scale-[0.98]` | `opacity-50` |
| `secondary` | `border border-stone-200 dark:border-stone-700 bg-transparent` | `bg-stone-100 dark:bg-stone-800` | `bg-stone-200 dark:bg-stone-700` | `opacity-50` |
| `ghost` | `bg-transparent` | `bg-stone-100 dark:bg-stone-800` | `bg-stone-200 dark:bg-stone-700` | `opacity-50` |
| `danger` | `bg-red-600 text-white` | `bg-red-700` | `bg-red-800` | `opacity-50` |
| `accent` | `bg-teal-600 text-white` | `bg-teal-700` | `bg-teal-800` | `opacity-50` |

**Tailles :** `sm` = `h-8 px-3 text-sm rounded-md gap-1.5` | `md` = `h-9 px-4 text-sm rounded-md gap-2` | `lg` = `h-11 px-6 text-base rounded-lg gap-2`

**Loading :** Remplacer le contenu par `<Spinner size={14} />` (animate-spin). Bouton `disabled` + `cursor-wait`.

**Focus :** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-color)] focus-visible:ring-offset-2`

**A11y :** `aria-disabled` si disabled, `aria-busy` si loading. Si `icon` sans texte → `aria-label` obligatoire.

**Keyboard :** Enter/Space declenche onClick.

---

### Input

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | — |
| `error` | `string` | — |
| `hint` | `string` | — |
| `icon` | `ReactNode` | — |
| `size` | `"sm" \| "md"` | `"md"` |
| `type` | `"text" \| "email" \| "password" \| "tel" \| "number" \| "url"` | `"text"` |
| `required` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |

**Layout :** Label au-dessus, input en-dessous, hint/error en-dessous de l'input.

**Etats :**

| Etat | Border | Background | Ring |
|------|--------|------------|------|
| default | `border-stone-200 dark:border-stone-700` | `bg-white dark:bg-stone-900` | — |
| hover | `border-stone-300 dark:border-stone-600` | idem | — |
| focus | `border-teal-600 dark:border-teal-400` | idem | `ring-2 ring-teal-600/20` |
| disabled | `border-stone-200 dark:border-stone-800` | `bg-stone-50 dark:bg-stone-800` | — |
| error | `border-red-500 dark:border-red-400` | idem default | — |
| error + focus | `border-red-500` | idem | `ring-2 ring-red-500/20` |

**Tailles :** `sm` = `h-8 px-3 text-sm` | `md` = `h-10 px-3 text-base`

**Label :** `text-sm font-medium text-stone-700 dark:text-stone-300`. Si required : `*` en `text-red-500` apres le label.

**Error :** `text-sm text-red-600 dark:text-red-400 mt-1.5`. Icone `AlertCircle` 14px a gauche du message.

**Hint :** `text-sm text-stone-500 dark:text-stone-400 mt-1.5`

**Placeholder :** `text-stone-400 dark:text-stone-500`

**Icon :** Position gauche (ps-10 sur l'input, icone absolute ps-3). Couleur `text-stone-400`.

**Password toggle :** Si `type="password"`, bouton oeil a droite pour toggle visibility.

**A11y :** `aria-invalid="true"` si error. `aria-describedby` pointant vers l'id du message error/hint. `id` auto-genere pour lier label/input.

---

### Textarea

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | — |
| `error` | `string` | — |
| `hint` | `string` | — |
| `rows` | `number` | `4` |
| `maxLength` | `number` | — |
| `required` | `boolean` | `false` |

Memes etats visuels que Input. Si `maxLength` : compteur `"123/500"` en `text-xs text-stone-400` en bas a droite.

---

### Select

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | — |
| `error` | `string` | — |
| `options` | `{ value: string; label: string; disabled?: boolean }[]` | — |
| `placeholder` | `string` | `"Selectionner..."` |
| `required` | `boolean` | `false` |

Select natif style (pas de custom dropdown). Memes etats que Input. Chevron a droite (pe-10).

---

### Checkbox

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | — |
| `description` | `string` | — |
| `checked` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |

**Visuel :** Carre 18px, `rounded-[4px]`. Non-coche : `border-2 border-stone-300 dark:border-stone-600`. Coche : `bg-teal-600 border-teal-600` + checkmark SVG blanc. Focus : ring teal.

**A11y :** `role="checkbox"`, `aria-checked`, keyboard Space pour toggle.

---

### Radio

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | — |
| `description` | `string` | — |
| `value` | `string` | — |
| `checked` | `boolean` | `false` |

**Visuel :** Cercle 18px, `rounded-full`. Non-selectionne : `border-2 border-stone-300`. Selectionne : `border-teal-600` + dot interieur `bg-teal-600` (8px). Focus : ring teal.

---

### Switch

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | — |
| `checked` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |

**Visuel :** Track 40px × 22px, `rounded-full`. Off : `bg-stone-200 dark:bg-stone-700`. On : `bg-teal-600`. Thumb 18px cercle blanc, transition translateX. Focus : ring teal.

**A11y :** `role="switch"`, `aria-checked`.

---

### FileInput

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | — |
| `accept` | `string` | — |
| `maxSize` | `number` (bytes) | — |
| `multiple` | `boolean` | `false` |
| `error` | `string` | — |

**Visuel :** Zone drag-drop en pointille (`border-2 border-dashed border-stone-300`). Hover : `border-teal-600 bg-teal-50/50`. Icone Upload au centre + texte "Glissez ou cliquez". Fichiers selectionnes : liste avec nom + taille + bouton supprimer.

---

### Label

`text-sm font-medium text-stone-700 dark:text-stone-300`. Props : `htmlFor`, `required` (ajoute `*`), `className`.

---

## 2. PRIMITIVES — Affichage

### Badge

| Prop | Type | Default |
|------|------|---------|
| `variant` | `"default" \| "success" \| "warning" \| "danger" \| "info" \| "accent" \| "outline"` | `"default"` |
| `size` | `"sm" \| "md"` | `"sm"` |
| `dot` | `boolean` | `false` |
| `icon` | `ReactNode` | — |

**Variantes :**

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| `default` | `bg-stone-100 dark:bg-stone-800` | `text-stone-700 dark:text-stone-300` | — |
| `success` | `bg-green-50 dark:bg-green-500/10` | `text-green-700 dark:text-green-400` | — |
| `warning` | `bg-amber-50 dark:bg-amber-500/10` | `text-amber-700 dark:text-amber-400` | — |
| `danger` | `bg-red-50 dark:bg-red-500/10` | `text-red-700 dark:text-red-400` | — |
| `info` | `bg-blue-50 dark:bg-blue-500/10` | `text-blue-700 dark:text-blue-400` | — |
| `accent` | `bg-teal-50 dark:bg-teal-500/10` | `text-teal-700 dark:text-teal-400` | — |
| `outline` | `bg-transparent` | `text-stone-600` | `border border-stone-200 dark:border-stone-700` |

**Tailles :** `sm` = `px-2 py-0.5 text-xs rounded-md` | `md` = `px-2.5 py-1 text-sm rounded-md`

**Dot :** Cercle 6px de la couleur du variant, avant le texte.

---

### Card

| Prop | Type | Default |
|------|------|---------|
| `variant` | `"default" \| "elevated" \| "interactive" \| "bordered"` | `"default"` |
| `padding` | `"none" \| "sm" \| "md" \| "lg"` | `"md"` |

| Variant | Styles |
|---------|--------|
| `default` | `bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-card` |
| `elevated` | idem + `shadow-md` |
| `interactive` | idem + `hover:shadow-card-hover hover:-translate-y-0.5 transition-[transform,box-shadow] duration-normal cursor-pointer` |
| `bordered` | `bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl` (pas de shadow) |

**Padding :** `none` = 0 | `sm` = `p-3 sm:p-4` | `md` = `p-4 sm:p-5` | `lg` = `p-5 sm:p-6`

---

### Avatar

| Prop | Type | Default |
|------|------|---------|
| `src` | `string \| null` | — |
| `alt` | `string` | — |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` |
| `fallback` | `string` (initiales) | — |

**Tailles :** `sm` = `w-8 h-8` | `md` = `w-10 h-10` | `lg` = `w-12 h-12` | `xl` = `w-16 h-16`

**Fallback (pas d'image) :** Cercle `bg-stone-200 dark:bg-stone-700` + initiales centrees `text-stone-600 dark:text-stone-400 font-medium`. Toujours `rounded-full`.

---

### Separator

Ligne horizontale. `border-t border-stone-200 dark:border-stone-800`. Props : `className`, `orientation` (`"horizontal" | "vertical"`).

---

### Skeleton

| Prop | Type | Default |
|------|------|---------|
| `width` | `string` | `"100%"` |
| `height` | `string` | `"1rem"` |
| `rounded` | `string` | `"rounded-md"` |

Style : `bg-stone-200 dark:bg-stone-700 animate-shimmer`. Animation gradient (pas pulse).

---

### EmptyState

| Prop | Type |
|------|------|
| `icon` | `ReactNode` (Lucide icon, 48px, `text-stone-300 dark:text-stone-600`) |
| `title` | `string` (`text-lg font-semibold text-stone-900 dark:text-stone-100`) |
| `description` | `string` (`text-sm text-stone-500 dark:text-stone-400 max-w-sm`) |
| `action` | `ReactNode` (bouton accent) |

Layout centre vertical, `py-16`, `text-center`.

---

## 3. PRIMITIVES — Overlay & Navigation

### Dialog

| Prop | Type | Default |
|------|------|---------|
| `open` | `boolean` | — |
| `onClose` | `() => void` | — |
| `title` | `string` | — |
| `description` | `string` | — |
| `size` | `"sm" \| "md" \| "lg" \| "fullscreen"` | `"md"` |

**Overlay :** `bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[var(--z-overlay)]`

**Panel :** `bg-white dark:bg-stone-900 rounded-xl shadow-xl z-[var(--z-modal)] animate-scale-in p-6`

**Tailles :** `sm` = `max-w-sm` | `md` = `max-w-lg` | `lg` = `max-w-2xl` | `fullscreen` = `w-full h-full rounded-none`

**Header :** Titre `text-lg font-semibold` + bouton X (`IconButton ghost`) en haut a droite.

**A11y :** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (titre), focus trap, Escape ferme, focus restore au close.

**Keyboard :** Escape = close. Tab = cycle dans le dialog (focus trap).

---

### Popover

| Prop | Type | Default |
|------|------|---------|
| `trigger` | `ReactNode` | — |
| `content` | `ReactNode` | — |
| `side` | `"top" \| "bottom" \| "start" \| "end"` | `"bottom"` |
| `align` | `"start" \| "center" \| "end"` | `"center"` |

Style : `bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-lg z-[var(--z-dropdown)] animate-fade-in p-2`

**A11y :** `aria-expanded` sur trigger, `aria-haspopup`. Escape ferme. Click outside ferme.

---

### DropdownMenu

| Prop | Type |
|------|------|
| `trigger` | `ReactNode` |
| `items` | `{ label: string; icon?: ReactNode; onClick: () => void; variant?: "default" \| "danger"; disabled?: boolean }[]` |

Style container : meme que Popover. Items : `px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800`. Danger items : `text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10`.

**Keyboard :** Arrow up/down navigate. Enter select. Escape close.

---

### Tooltip

| Prop | Type | Default |
|------|------|---------|
| `content` | `string` | — |
| `side` | `"top" \| "bottom" \| "start" \| "end"` | `"top"` |
| `delay` | `number` (ms) | `300` |

Style : `bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs px-2.5 py-1.5 rounded-md shadow-lg z-[var(--z-tooltip)] animate-fade-in`

**A11y :** `role="tooltip"`, trigger a `aria-describedby`. Keyboard : visible sur focus du trigger.

---

### Toast

| Prop | Type |
|------|------|
| `variant` | `"success" \| "error" \| "warning" \| "info"` |
| `title` | `string` |
| `description` | `string` |
| `duration` | `number` (ms, defaut 5000) |

Position : `bottom-end` (RTL: `bottom-start`), `z-[var(--z-toast)]`, stack vertical (max 3 visibles).

Style : `bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xl p-4 animate-slide-up`. Icone coloree a gauche (CheckCircle, XCircle, AlertTriangle, Info). Bouton X pour dismiss.

Auto-dismiss apres `duration`. Hover pause le timer.

---

## 4. PRIMITIVES — Navigation

### Tabs

| Prop | Type |
|------|------|
| `items` | `{ label: string; value: string; icon?: ReactNode; badge?: string }[]` |
| `value` | `string` |
| `onChange` | `(value: string) => void` |
| `variant` | `"underline" \| "pills"` |

**Underline :** Items en ligne, actif = `border-b-2 border-teal-600 text-teal-600`. Inactif = `text-stone-500 hover:text-stone-700`.

**Pills :** Items en ligne, actif = `bg-teal-600 text-white rounded-md`. Inactif = `text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md`.

**A11y :** `role="tablist"`, `role="tab"`, `aria-selected`. Arrow left/right navigate.

---

### Breadcrumb

| Prop | Type |
|------|------|
| `items` | `{ label: string; href?: string }[]` |

Style : `text-sm text-stone-500`. Separateur : `/` ou `ChevronRight` 14px. Dernier item : `text-stone-900 dark:text-stone-100 font-medium` (pas de lien).

---

### Pagination

| Prop | Type |
|------|------|
| `page` | `number` |
| `totalPages` | `number` |
| `onChange` | `(page: number) => void` |

Boutons Previous/Next + numeros de page. Max 7 boutons visibles (1 ... 4 5 6 ... 20). Actif : `bg-teal-600 text-white`. Inactif : `hover:bg-stone-100`.

---

### Progress

| Prop | Type |
|------|------|
| `value` | `number` (0-100) |
| `variant` | `"default" \| "success" \| "warning" \| "danger"` |
| `size` | `"sm" \| "md"` |

Track : `bg-stone-200 dark:bg-stone-700 rounded-full`. Bar : `bg-teal-600 rounded-full transition-[width] duration-slow`. Tailles : `sm` = `h-1.5` | `md` = `h-2.5`.

---

### Alert

| Prop | Type |
|------|------|
| `variant` | `"info" \| "success" \| "warning" \| "danger"` |
| `title` | `string` |
| `description` | `string` |
| `dismissible` | `boolean` |

Style : `p-4 rounded-lg border-s-4`. Couleurs par variant (border-s + bg ghost + text + icone). Bouton X si dismissible.

| Variant | Border | Background | Icon |
|---------|--------|------------|------|
| `info` | `border-s-blue-500` | `bg-blue-50 dark:bg-blue-500/10` | Info |
| `success` | `border-s-green-500` | `bg-green-50 dark:bg-green-500/10` | CheckCircle |
| `warning` | `border-s-amber-500` | `bg-amber-50 dark:bg-amber-500/10` | AlertTriangle |
| `danger` | `border-s-red-500` | `bg-red-50 dark:bg-red-500/10` | XCircle |

---

## 5. COMPOSITES — References

> Les composants composites complexes sont specifies dans le CLAUDE.md (section "Composants critiques"). Voici un index avec les points cles.

| Composant | Fichier | Points cles |
|-----------|---------|-------------|
| `PhotoGallery` | `components/ui/` | Hero 16/9 + 4 thumbnails. Click → Lightbox. next/image avec fill+sizes. |
| `Lightbox` | `components/ui/` | Overlay plein ecran, fleches, compteur, swipe mobile, Escape, lazy-load. |
| `WilayaCommuneAutocomplete` | `components/ui/` | Combobox aria, recherche locale (JSON), FR/AR, keyboard nav. |
| `KanbanBoard` | `features/leads/` | 4 colonnes drag-drop (@hello-pangea/dnd). Mobile → liste filtrable avec tabs. |
| `CalendarView` | `features/visit-requests/` | Grille CSS 7×12, toggle liste/calendrier, couleurs par statut. |
| `ContactCard` | `components/marketplace/` | Sidebar sticky 35%, boutons configurables (Appeler>WhatsApp>Message>Visite), lead sans auth. |
| `SimilarListingsCarousel` | `components/marketplace/` | Scroll snap horizontal, 4-6 cards, meme wilaya + property_type + prix ±30%. |
| `Charts` | `components/ui/` | Recharts. ChartLine (time series), ChartDonut (repartition), ChartBar (comparaison). |
| `DateRangePicker` | `components/ui/` | Presets (7j/30j/90j/12m) + custom range, 2 inputs date, calendrier dropdown. |
| `BottomNav` | `components/ui/` | Fixe en bas mobile (md:hidden). AqarPro: 5 items. AqarChaab: 4 items + CTA central amber. |
| `DocumentUpload` | `components/ui/` | Drag-drop zone, validation type/taille, upload Supabase Storage signed URL. |
| `ThemeStudio` | `features/agency-settings/` | Selection 10 themes + color pickers + logo/cover upload + preview live. |
| `VerificationBadge` | `components/ui/` | 4 niveaux (gris/bleu/vert/or), tooltip au hover, sizes sm/md. |
| `PriceHistoryChart` | `features/analytics/` | Recharts line, donnees listing_price_versions SCD2, marqueurs changements. |
| `WizardListing` | `features/listings/` | Mode agency (7 etapes) / individual (4 etapes), auto-save, localStorage backup. |
| `MessagingView` | `features/messaging/` | Split conversations/thread, Supabase Realtime, filtres (Pro), badges non-lus. |
| `ProfileForm` | `features/auth/` | Partage Pro/Chaab. Infos perso + mot de passe + notifications + langue. |
| `DashboardShell` | `components/dashboard/` | Layout sidebar 240px/64px + topbar + content scroll independant. |
| `DashboardSidebar` | `components/dashboard/` | Collapse toggle `[`, tooltip en collapsed, BottomNav mobile (Pro). |
| `DashboardTopBar` | `components/dashboard/` | Sticky, breadcrumbs, search, notifications bell, avatar. |
| `CommandPalette` | `components/dashboard/` | Cmd+K, input + liste resultats filtree, keyboard nav up/down. |
| `MarketingHeader` | `components/marketing/` | Sticky, transparent→solide au scroll, nav links, CTA login/signup, language switcher. |
| `MarketingFooter` | `components/marketing/` | Liens (about, terms, privacy, contact), social, language. |
| `HomeSearchBar` | `components/marketing/` | Autocomplete wilayas, pills transaction type, submit → /search. |

---

## 6. Regles de creation

1. **Server Component par defaut** — `"use client"` uniquement si interactivite (useState, useEffect, onClick, onChange)
2. **Tokens uniquement** — jamais de hex (`#xxx`), jamais d'inline style (`style={{}}`)
3. **Dark mode obligatoire** — chaque classe bg/text/border a son pendant `dark:` ou utilise une CSS var
4. **RTL-safe** — `ps-`/`pe-`/`ms-`/`me-` au lieu de `pl-`/`pr-`/`ml-`/`mr-`. `start`/`end` au lieu de `left`/`right`
5. **Composition** — accepter `className` et merger via `clsx`
6. **Accessibilite** — ARIA sur chaque composant interactif, `focus-visible` ring, keyboard nav, `prefers-reduced-motion`
7. **Lucide icons** — Toutes les icones viennent de `lucide-react`. Taille par defaut : 16px (sm), 18px (md), 20px (lg)
8. **Variants via `cva`** — Utiliser `class-variance-authority` pour gerer les variantes de composants proprement
9. **Forwarded ref** — Tous les composants interactifs utilisent `forwardRef` pour le focus management
10. **Error boundary** — Chaque page a un `ErrorBoundary` wrapping ses composants
