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
