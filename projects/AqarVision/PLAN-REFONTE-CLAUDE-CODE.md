# PLAN DE REFONTE AQARVISION — Direction B : Stripe × Real Estate
# ═══════════════════════════════════════════════════════════════
# Pour Claude Code. 55 pages. 5 sprints. ~25h de travail.
#
# Fichiers à avoir dans .claude/ :
# - aqarvision-zinc-design-system.md (design system 3000 lignes)
# - aqarsearch-refonte.jsx (prototype visuel React)
# - spec-deposer-annonce-refonte.md (spec wizard 7 étapes)
# ═══════════════════════════════════════════════════════════════

## RÈGLES ABSOLUES (à respecter sur CHAQUE fichier touché)

```
1. ZÉRO inline style={{ }}     → Tailwind classes uniquement
2. ZÉRO var(--onyx/ivoire/or)  → Tokens Zinc (zinc-950, amber-500...)
3. ZÉRO <img> tag              → next/image avec fill + sizes
4. ZÉRO hex hardcodé           → Palette Tailwind (zinc-*, amber-*)
5. CHAQUE couleur a son dark:  → bg-white dark:bg-zinc-900, etc.
6. CHAQUE page a un loading.tsx → Skeleton Zinc
7. Border radius ≥ 8px         → rounded-lg minimum (pas 2px)
8. Lucide React pour les icônes → Pas de SVG inline custom
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SPRINT 0 — FONDATIONS (avant tout le reste)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 0.1 — Nettoyer globals.css

Supprimer TOUTE variable restante de l'ancien thème si encore présente :
--onyx*, --ivoire*, --or*, --text-dark, --text-body, --text-muted,
--text-faint, --text-inverse, --font-display, --bg-deep, --bg-primary,
--bg-card, --bg-card-hover, --shadow-card.

Ne garder QUE les variables Zinc déjà définies (--bg-app, --bg-surface,
--text-primary, --accent, --border-default, etc.).

## 0.2 — Créer src/lib/theme.ts (hook useTheme)

```typescript
"use client";
import { useEffect, useState } from "react";
export function useTheme() {
  const [theme, setTheme] = useState<"light"|"dark">("light");
  useEffect(() => {
    const s = localStorage.getItem("theme") as "light"|"dark"|null;
    const t = s ?? "light";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);
  function toggle() {
    const n = theme === "light" ? "dark" : "light";
    setTheme(n);
    localStorage.setItem("theme", n);
    document.cookie = `theme=${n};path=/;max-age=31536000`;
    document.documentElement.setAttribute("data-theme", n);
  }
  return { theme, toggle };
}
```

## 0.3 — Créer src/components/ThemeToggle.tsx

```tsx
"use client";
import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label="Toggle theme"
      className="flex size-9 items-center justify-center rounded-lg text-zinc-500
        hover:bg-zinc-100 hover:text-zinc-700 transition-colors
        dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
```

## 0.4 — Modifier app/layout.tsx pour le SSR dark mode

Lire le cookie `theme` avec `cookies()` et appliquer `data-theme` sur `<html>`.

## 0.5 — Photo hero

```bash
# Télécharger la photo hero (ou la placer manuellement)
curl -o public/images/hero-bg.jpg \
  "https://images.unsplash.com/photo-1590059390104-0eaa0c381bcc?w=1600&h=1000&fit=crop&q=80"
```

## 0.6 — Créer le hook useScrollReveal

```tsx
// src/hooks/useScrollReveal.ts
"use client";
import { useEffect, useRef, useState } from "react";
export function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SPRINT 1 — Pages à impact maximum (vues par tous)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1.1 — HOMEPAGE `/[locale]/page.tsx` (537 lignes → réécrire)

Référence visuelle : `aqarsearch-refonte.jsx` → composant `HomePage`

RÉÉCRIRE ENTIÈREMENT. Structure cible :

**Section 1 — HERO (100vh)**
- next/image fill de `/images/hero-bg.jpg` + `priority`
- Gradient overlay : `bg-gradient-to-b from-black/65 via-black/25 to-black/70`
- h1 : `text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight`
- "chez-vous" en `text-amber-400`
- Pills : Acheter (amber solid) / Louer / Vacances (ghost white/10)
- HomeSearchBar (refondre en barre blanche flottante — voir 1.5)
- Sous-texte suggestions en `text-white/30 text-xs`
- ChevronDown lucide en `animate-bounce` absolute bottom-8
- Scroll reveal sur chaque bloc

**Section 2 — SPLIT ÉDITORIAL (70vh)**
- `grid lg:grid-cols-2 min-h-[70vh]`
- Gauche : eyebrow amber uppercase tracking-[0.2em] + h2 `text-4xl lg:text-5xl font-bold` + paragraphe `text-zinc-500` + lien amber avec ArrowRight
- Droite : next/image fill full-bleed (PAS de padding ni rounded)

**Section 3 — WILAYAS SCROLL**
- Scroll horizontal `overflow-x-auto snap-x` + `scrollbar-hide`
- Cards : `w-[200px] shrink-0 snap-start rounded-xl border border-zinc-200 dark:border-zinc-800`
- Photo 130px + padding nom + count
- Hover : `hover:-translate-y-1 hover:shadow-lg`

**Section 4 — FEATURED LISTINGS**
- Titre h2 + lien "Voir tout →"
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- ListingCard (composant 1.2)

**Section 5 — FULL-BLEED PHOTO (60vh)**
- next/image fill + gradient `from-transparent via-transparent to-black/80`
- Statement blanc `text-3xl lg:text-5xl font-bold` aligné bottom-start
- "caractère" en `text-amber-400`

**Section 6 — STATS STRIP**
- `bg-zinc-950 py-20`
- h2 blanc centré
- 4 colonnes : valeur `text-amber-400 text-3xl sm:text-4xl font-bold` + label `text-zinc-400`

**Section 7 — CTA PRO**
- Centré, eyebrow amber, h2, paragraphe, bouton `bg-amber-500 text-white rounded-lg`

SUPPRIMER : le ticker défilant, les sections avec fontFamily inline.
Créer : `app/[locale]/loading.tsx`

---

## 1.2 — LISTING CARD `features/listings/components/ListingCard.tsx`

Le composant le plus réutilisé. RÉÉCRIRE en Zinc :

```
Photo 16:10 (next/image fill) + zoom hover scale-[1.06] duration-500
Badge status top-end : rounded-full text-[10px] font-semibold bg-green-500/90 text-white
Heart button top-start : size-8 rounded-full bg-black/30 backdrop-blur-sm text-white
Photo count bottom-end : Camera icon + count, bg-black/50 backdrop-blur-sm
─────────────────────
Type (text-blue-500 vente / text-violet-500 loc) · Wilaya (text-zinc-400)
Titre truncate text-sm font-semibold
Prix text-lg font-bold tabular-nums
Détails row : Bed + Bath + Ruler icons (lucide) + valeurs text-zinc-400 text-xs
─────────────────────
Card : rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900
Hover : -translate-y-1 shadow-lg border-zinc-300 dark:border-zinc-700
Transition : transition-all duration-200
```

---

## 1.3 — SEARCH `/[locale]/search/` (640 lignes combinées → refactorer)

Référence visuelle : `aqarsearch-refonte.jsx` → composant `SearchPage`

**Refactorer SearchPageClient.tsx en modules :**
```
SearchPageClient.tsx       → state (view, filters, sort) + routing
├── SearchToolbar.tsx      → input + toggle [Annonces|Carte] + chips + "+Filtres" + count
├── SearchListView.tsx     → sort bar + grid 3 cols + pagination
├── SearchMapView.tsx      → carte plein écran + toolbar draw + carousel bottom
└── SearchSortBar.tsx      → pills tri (Récents, Prix↑, Prix↓, Surface↓)
```

**Mode Annonces (défaut) :**
- Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1320px] mx-auto`
- Sort pills : actif = `bg-amber-500/10 text-amber-600`, inactif = `text-zinc-400`
- Bouton "Voir sur la carte" ghost à droite
- Pagination : boutons `size-9 rounded-lg`

**Mode Carte :**
- `h-[calc(100vh-120px)]` full
- Toolbar draw top-left glassmorphism
- Bouton "Voir les annonces" top-right
- Pins prix : `bg-zinc-950 text-amber-400 rounded-lg text-xs font-bold` + flèche CSS
- Carousel bottom : cards `w-[280px] bg-white/97 dark:bg-zinc-900/97 backdrop-blur-xl rounded-xl shadow-xl`

**Toggle :** segmenté dans la toolbar `border border-zinc-200 rounded-lg overflow-hidden`
- Actif : `bg-amber-500/10 text-amber-600`
- Inactif : `text-zinc-400`

Créer : `app/[locale]/search/loading.tsx`

---

## 1.4 — LISTING DETAIL `/[locale]/l/[slug]/page.tsx` (401 lignes)

Référence visuelle : `aqarsearch-refonte.jsx` → composant `DetailPage`

**Photo Hero (55vh, full-bleed) :**
- next/image fill, PAS de rounded, PAS de padding
- Gradient bottom `from-transparent to-black/50`
- Boutons favori + share top-right : glassmorphism `bg-black/35 backdrop-blur-sm rounded-xl`
- Strip thumbnails centrée bottom : max 5 + "+N"

**Content : `grid lg:grid-cols-[1fr_360px] gap-8 max-w-[1200px] mx-auto py-8 px-6`**

Colonne principale :
1. Breadcrumb `text-xs text-zinc-400`
2. Badges : type coloré + property `bg-zinc-100 dark:bg-zinc-800`
3. h1 `text-2xl lg:text-3xl font-bold tracking-tight`
4. Localisation `text-zinc-400` + réf
5. Prix `text-3xl lg:text-4xl font-bold tabular-nums` + prix/m²
6. Grid 4 facts : `grid grid-cols-4 rounded-xl border divide-x` chaque cell texte centré
7. **Panel IA ✨** — collapsible `border border-amber-200/50 bg-amber-50/30 rounded-xl`
   - Résumé texte
   - Grid 2 cols : pros (green check) / cons (amber alert)
   - Questions à poser sur fond `bg-zinc-100 dark:bg-zinc-800 rounded-lg`
   - Disclaimer `text-[10px] text-zinc-400`
8. Description `text-zinc-600 dark:text-zinc-400 leading-relaxed`
9. Équipements : chips `bg-amber-500/8 text-amber-600 rounded-lg` avec check icon
10. Carte proximité : MapLibre 220px + pills catégories POI
11. Biens similaires : grid 3 cols

Sidebar sticky `top-[72px]` :
1. Card agence : logo gradient + nom + badge vérifiée + boutons CTA
2. Bouton "Ajouter à un projet" `border border-dashed hover:border-amber-500`
3. MortgageCalculator mini : apport + mensualité sur fond `bg-amber-500/8`

---

## 1.5 — HEADER MARKETING `components/marketing/MarketingHeader.tsx`

- Sur homepage : `bg-transparent` → au scroll `bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b`
- Sur autres pages : toujours solid
- Logo + nav links (Acheter, Louer, Agences, Estimer) + ThemeToggle + locale + avatar
- Nav active : `font-medium text-zinc-900 dark:text-zinc-100`
- Nav inactive : `text-zinc-500 hover:text-zinc-700`
- `h-14`, `max-w-[1320px] mx-auto`

## 1.6 — HomeSearchBar `components/marketing/HomeSearchBar.tsx`

Barre blanche flottante :
- `bg-white rounded-2xl shadow-xl focus-within:ring-2 focus-within:ring-amber-500/30`
- `h-14` avec selects transparent + séparateurs `w-px h-6 bg-zinc-200`
- Bouton : `bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-e-2xl h-14 px-7`

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SPRINT 2 — Pages publiques secondaires
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2.1 — AGENCES `/[locale]/agences/page.tsx` (168 lignes)

Référence : `aqarsearch-refonte.jsx` → `AgentsPage`

- h1 + sous-titre
- Barre : input search + select wilaya + toggle "Vérifiées" — filtrage client-side
- Compteur résultats live
- **Liste verticale** (pas de grille) de cards agence :
  - Logo gradient `size-14 rounded-xl` + nom + badge + spécialité + desc + stats row + note ★
  - Hover lift `hover:-translate-y-0.5 hover:shadow-lg`
- Empty state si 0 résultat
- Créer `loading.tsx`

## 2.2 — VITRINE AGENCE `/[locale]/a/[slug]/page.tsx` (248 lignes, 18 inline)

Référence : `aqarsearch-refonte.jsx` → `AgentDetailPage`

RÉÉCRIRE. Style Heatherwick :
- Hero 50vh : cover photo + logo centré + nom + statement + badges + CTA
- Stats strip (4 cols : annonces, ventes, agents, note)
- Section "À propos" `max-w-[700px] mx-auto`
- Grille biens avec filtre pills (Tous/Vente/Location)
- Supprimer les 18 inline styles
- Créer `loading.tsx` (existe déjà — vérifier le style)

## 2.3 — FAVORIS `/[locale]/favorites/page.tsx` (116 lignes)

- Tabs client-side (FavoritesTabs) : Favoris / Notes / Recherches sauvegardées
- Grid 3 cols de ListingCards
- Badge "Baisse -X%" si le prix a baissé depuis le favori
- Empty state par tab

## 2.4 — DEPOSER `/[locale]/deposer/page.tsx` (100 lignes)

Lire `spec-deposer-annonce-refonte.md` en entier. Implémenter le wizard 7 étapes :
Type → Localisation (carte) → Prix → Détails → Description (IA) → Photos → Récap

## 2.5 — COMPARER `/[locale]/comparer/page.tsx` (325 lignes)

Vérifier et appliquer le style Zinc :
- Table horizontale côte-à-côte (photo, prix, surface, pièces, wilaya)
- Max 4 biens, bouton "Ajouter"
- Supprimer tout inline style

## 2.6 — ESTIMER `/[locale]/estimer/page.tsx` (81 lignes)

- Formulaire : type, wilaya, commune, surface, pièces
- Bouton `bg-amber-500` "Estimer"
- Résultat : fourchette prix + prix/m²

## 2.7 — VENDRE `/[locale]/vendre/page.tsx` (112 lignes, 4 inline)

Landing page. Supprimer les 4 inline styles. Style éditorial Heatherwick.

## 2.8 — PRO `/[locale]/pro/page.tsx` (297 lignes)

Landing AqarPro. Hero éditorial + features grid + pricing + CTA.

## 2.9 — PRICING `/(marketing)/pricing/page.tsx` (25 lignes)

Très court — probablement placeholder. Enrichir avec une table de pricing 3 colonnes Zinc.

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SPRINT 3 — Dashboard AqarPro (le plus de travail)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3.0 — LAYOUT `AqarPro/dashboard/layout.tsx` (88 lignes)

Sidebar Stripe :
- `w-60 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950`
- Agency switcher en haut (logo + nom + dropdown)
- Nav items : `rounded-lg px-3 py-2 text-sm`
  - Actif : `bg-amber-500/10 text-amber-600 border-s-2 border-amber-500`
  - Inactif : `text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800`
- Badges : `rounded-full bg-amber-500 text-white text-[10px] px-1.5`
- Bottom : `⌘K Rechercher...` shortcut hint

## 3.1 — DASHBOARD HOME `dashboard/page.tsx` (127 lignes, 5 inline)

- Titre "Bonjour, {name} 👋" + sous-titre
- Bouton `+ Nouvelle annonce` amber
- 4 stat cards row : `rounded-xl border border-zinc-200 dark:border-zinc-800 p-5`
  - Label `text-[11px] uppercase tracking-wider text-zinc-400`
  - Valeur `text-2xl font-bold`
  - Trend `text-xs text-green-500` ou `text-red-500`
- Activity feed + quick actions
- Supprimer les 5 inline, créer `loading.tsx` (existe)

## 3.2 — LISTINGS TABLE `dashboard/listings/page.tsx` (231 lignes, 24 inline)

DataTable dense Stripe :
- `rounded-xl border overflow-hidden`
- Header : `bg-zinc-50 dark:bg-zinc-900/50 text-[11px] uppercase tracking-wider text-zinc-400`
- Rows : `h-12 hover:bg-zinc-50 dark:hover:bg-zinc-800/50`
- Thumbnail `48×36 rounded-sm`
- Status dot coloré
- Bulk actions sticky bottom
- **SUPPRIMER les 24 inline styles**

## 3.3 — LISTING DETAIL (dashboard) `dashboard/listings/[id]/page.tsx` (412 lignes, 50 inline)

**LE PIRE FICHIER DU PROJET.** RÉÉCRIRE ENTIÈREMENT.
Garder toute la logique/data fetching, remplacer 100% du JSX styling.
- Tabs : Détails / Photos / Traductions / Historique
- Formulaire avec labels + inputs Zinc
- Grid 2 cols pour les détails
- **SUPPRIMER LES 50 INLINE STYLES**

## 3.4 — SETTINGS `dashboard/settings/page.tsx` (186 lignes, 25 inline)

Tabs verticaux gauche + contenu droite :
- `grid grid-cols-[200px_1fr] gap-6`
- Tab actif : `bg-zinc-100 dark:bg-zinc-800 rounded-lg font-medium`
- Formulaires avec inputs `h-10 rounded-lg border border-zinc-200`
- **SUPPRIMER les 25 inline styles**

## 3.5 — AI `dashboard/ai/page.tsx` (116 lignes, 21 inline)

- Cards pour Generate / Translate / History
- Progress bars pour quota
- **SUPPRIMER les 21 inline styles**

## 3.6 — ANALYTICS `dashboard/analytics/page.tsx` (101 lignes, 13 inline)

- Date range pills (7j, 30j, 90j)
- Stat cards extended
- Charts (garder la logique, refondre le style)
- **SUPPRIMER les 13 inline styles**

## 3.7 — TEAM/INVITES `dashboard/team/invites/page.tsx` (122 lignes, 14 inline)

- Table d'invitations
- Status badges colorés
- Actions (annuler, renvoyer)
- **SUPPRIMER les 14 inline styles**

## 3.8 — LEADS `dashboard/leads/page.tsx` (104 lignes, 5 inline)

- Vue Kanban ou table
- Lead cards avec score coloré
- **SUPPRIMER les 5 inline styles**

## 3.9 — Autres pages dashboard (peu d'inline)

```
dashboard/billing/page.tsx          93 lignes   2 inline → fix
dashboard/team/page.tsx            118 lignes   6 inline → fix
dashboard/settings/appearance      66 lignes   2 inline → fix
dashboard/settings/verification    47 lignes   2 inline → fix
dashboard/visit-requests           52 lignes   0 inline → vérifier style
dashboard/onboarding               69 lignes   0 inline → vérifier style
dashboard/listings/new             39 lignes   0 inline → vérifier style
dashboard/listings/[id]/edit       10 lignes   0 inline → wrapper
dashboard/settings/branding        11 lignes   0 inline → wrapper
```

Pour chacun : supprimer les inline styles, appliquer les classes Zinc, ajouter `dark:` variants, créer `loading.tsx` si manquant.

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SPRINT 4 — AqarChaab + Composants critiques
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 4.0 — LAYOUT ESPACE `AqarChaab/espace/layout.tsx` (184 lignes)

Style "Stripe warm" — plus spacieux que Pro :
- Sidebar `w-60` même structure que Pro mais `rounded-xl` au lieu de `rounded-lg`
- Accents amber sur les icônes
- Bottom nav mobile : 5 items (Accueil, Annonces, Messages, Favoris, Profil)
- Internationaliser les labels hardcodés FR ("Mes annonces" → `t("nav.xxx")`)

## 4.1-4.7 — Pages Espace

```
espace/page.tsx              172 lignes  1 inline  → Welcome card + stats + derniers consultés
espace/mes-annonces          210 lignes  2 inline  → Cards listings horizontales
espace/historique            340 lignes  0 inline  → Timeline consultations (GROS — vérifier)
espace/collections            89 lignes  0 inline  → Multi-dossiers favoris
espace/alertes                56 lignes  0 inline  → Toggle on/off + résultats
espace/profil                 87 lignes  0 inline  → Formulaire + préférences
espace/messagerie             29 lignes  0 inline  → Wrapper chat
espace/upgrade                93 lignes  2 inline  → Pricing + quota bar
```

Pour chacun : style Zinc warm, `max-w-5xl`, `rounded-xl` cards, créer `loading.tsx`.

## 4.8-4.13 — Composants les plus critiques

```
VerificationForm.tsx     33 inline → RÉÉCRIRE JSX (garder logique)
ThemeStudio.tsx          30 inline → RÉÉCRIRE JSX
ThemeRenderer.tsx        24 inline → RÉÉCRIRE JSX
SubscriptionCard.tsx     21 inline → RÉÉCRIRE JSX
BrandingUpload.tsx       16 inline → RÉÉCRIRE JSX
CreateListingWizard.tsx  12 inline → RÉÉCRIRE JSX (ou remplacer par DeposerWizardV2)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SPRINT 5 — Auth + Admin + Finitions
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 5.1 — AUTH (8 pages, 3 layouts)

Design unifié : fond `bg-zinc-50 dark:bg-zinc-950`, card centrée `max-w-md mx-auto`,
ou split (illustration/photo gauche + formulaire droite sur desktop).

```
auth/login, signup, forgot-password, reset-password
AqarPro/auth/login, signup, forgot-password
AqarChaab/auth/login, signup
```

Formulaires : inputs `h-10 rounded-lg border-zinc-200`, bouton `bg-amber-500 w-full h-10`.
Layouts auth : unifier le style des 3 (générique, Pro, Chaab).

## 5.2 — ADMIN (6 pages, 1 layout)

```
admin/page.tsx              108 lignes → Dashboard stats
admin/agencies              99 lignes  → DataTable agences
admin/users                146 lignes  → DataTable users
admin/payments             131 lignes  5 inline → DataTable paiements
admin/settings             100 lignes  1 inline → Formulaire settings
admin/verifications         20 lignes  → Wrapper
```

Style fonctionnel Zinc. DataTables avec le même pattern que dashboard/listings.

## 5.3 — Pages mineures restantes

```
agency/new         26 lignes → Formulaire création agence
invite/[token]     59 lignes → Page acceptation invitation
```

## 5.4 — Footer `components/marketing/MarketingFooter.tsx`

- `border-t border-zinc-200 dark:border-zinc-800`
- 4 colonnes de liens + logo
- Locale switcher en bas
- `© 2026 AqarVision`

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# VÉRIFICATION FINALE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Après CHAQUE sprint, exécuter ces vérifications :

```bash
# Inline styles restants (objectif < 15)
grep -rn "style={{" apps/web/src --include='*.tsx' | wc -l

# Old CSS vars (objectif 0)
grep -rn "var(--onyx\|var(--ivoire\|var(--or)" apps/web/src --include='*.tsx' | wc -l

# Old hex (objectif 0)
grep -rn "bg-\[#\|text-\[#" apps/web/src --include='*.tsx' | wc -l

# Raw img tags (objectif 0)
grep -rn "<img " apps/web/src --include='*.tsx' | wc -l

# Dark mode classes (objectif > 500)
grep -rn "dark:" apps/web/src --include='*.tsx' | wc -l

# Loading files (objectif 45+)
find apps/web/src -name 'loading.tsx' | wc -l
```

**Test visuel :**
- Toggle dark mode → vérifier CHAQUE page
- Switch locale `ar` → vérifier RTL
- Réduire le viewport → vérifier mobile
- Naviguer homepage → search → listing → agences → dashboard
