# CLAUDE.md

> Dernière mise à jour : 17 mars 2026.
> Ce fichier est lu automatiquement par Claude Code à chaque session. C’est la **source de vérité unique** du projet. Lire intégralement avant toute modification.

-----

## Identité projet

**AqarVision** — Plateforme immobilière algérienne (proptech) composée de quatre surfaces :

**AqarSearch** est la marketplace publique : recherche, carte, SEO, alertes, favoris. **AqarPro** est le CRM agence : annonces, leads, messaging, analytics, facturation. **AqarChaab** est l’espace particulier : déposer une annonce, favoris, messagerie, profil. **Marketing** regroupe la homepage, les pages /pro, /vendre, /estimer, /pricing, et les vitrines agences.

Le projet est multi-tenant (RLS Supabase isolé par agence), multilingue (FR/AR/EN/ES avec RTL natif pour l’arabe), et cible l’Algérie (58 wilayas, 1 541 communes). La monétisation se fait via Stripe (plans Starter/Pro/Enterprise).

-----

## Stack technique

|Couche         |Technologie                                                              |
|---------------|-------------------------------------------------------------------------|
|Frontend       |Next.js 15 App Router + Server Actions                                   |
|Langage        |TypeScript strict (pas de `any`)                                         |
|UI             |Tailwind CSS brut + Lucide React (icônes)                                |
|Backend        |Supabase (Auth SSR + Postgres + RLS + Storage + Edge Functions)          |
|Base de données|PostgreSQL 15+ avec PostGIS                                              |
|Paiements      |Stripe (Checkout + Customer Portal + Webhooks via Edge Function Supabase)|
|Cartes         |MapLibre GL JS + tuiles OpenStreetMap                                    |
|Validation     |Zod                                                                      |
|i18n           |next-intl (4 locales : fr, ar, en, es)                                   |
|Monorepo       |Turborepo + pnpm workspaces                                              |
|Hébergement    |Vercel (web) + Supabase Cloud                                            |
|Tests          |Vitest (unit, 3 fichiers) + Playwright (E2E, 8 specs)                    |
|Polices        |Geist (latin) + IBM Plex Sans Arabic — chargées via next/font            |
|Observabilité  |Sentry (version mismatch à corriger — voir section dette)                |

**Précisions importantes :** shadcn/ui n’est PAS utilisé dans le projet malgré des mentions antérieures — l’UI est 100% Tailwind CSS brut. Il n’y a PAS de route API dans `src/app/api/` — les webhooks Stripe passent par `supabase/functions/stripe-webhook`.

-----

## Commandes

Toutes les commandes s’exécutent depuis la racine monorepo `AqarVision/` :

```bash
pnpm install              # Installer les dépendances
pnpm dev                  # Démarrer le dev server (port 3000)
pnpm build                # Build production via Turbo
pnpm lint                 # Lint
pnpm typecheck            # Vérification TypeScript
pnpm test                 # Tests Vitest
pnpm test:e2e             # Tests Playwright (nécessite build)
```

-----

## Structure du monorepo

```
AqarVision/
├── apps/web/src/
│   ├── app/[locale]/
│   │   ├── page.tsx                          # Homepage
│   │   ├── (marketing)/pricing/              # Page tarifs
│   │   ├── auth/                             # Redirect login → AqarPro ou AqarChaab
│   │   ├── AqarPro/auth/                     # Login/signup pro
│   │   ├── AqarPro/dashboard/                # CRM agence (overview, listings, leads,
│   │   │                                     #   visit-requests, analytics, team,
│   │   │                                     #   billing, settings, onboarding)
│   │   ├── AqarChaab/auth/                   # Login/signup particulier
│   │   ├── AqarChaab/espace/                 # Espace perso (mes-annonces, messagerie,
│   │   │                                     #   alertes, collections, historique, profil, upgrade)
│   │   ├── search/                           # Marketplace (SearchPageClient)
│   │   ├── annonce/[slug]/                   # Détail annonce (PAS /l/[slug])
│   │   ├── a/[slug]/                         # Vitrine agence
│   │   ├── agences/                          # Annuaire agences
│   │   ├── admin/                            # Super admin
│   │   ├── deposer/                          # Wizard dépôt annonce individuel (V2)
│   │   ├── comparer/                         # Comparaison
│   │   ├── estimer/                          # Estimation prix
│   │   ├── favorites/                        # Favoris
│   │   ├── vendre/                           # Page marketing vente
│   │   ├── pro/                              # Page marketing AqarPro
│   │   ├── agency/new/                       # Création agence
│   │   └── invite/[token]/                   # Acceptation invitation
│   ├── features/                             # 15 modules (admin, agencies, agency-settings,
│   │                                         #   analytics, auth, billing, favorites,
│   │                                         #   leads, listings, marketplace, media,
│   │                                         #   messaging, moderation, onboarding, visit-requests)
│   ├── components/
│   │   ├── dashboard/DashboardSidebar.tsx     # Sidebar dashboard actuelle
│   │   ├── brand/AqarBrandLogo.tsx
│   │   ├── marketing/                        # Header, Footer, HomeSearchBar
│   │   ├── editorial/                        # EditorialSplit, StatsStrip, FullBleedPhoto, WilayaScroller
│   │   ├── agency/                           # ThemeRenderer + 10 thèmes vitrines
│   │   ├── admin/AdminSidebar.tsx
│   │   ├── ui/LanguageSwitcher.tsx
│   │   ├── ErrorBoundary.tsx, LocaleHtmlSync.tsx, ThemeToggle.tsx
│   ├── lib/
│   │   ├── auth/with-agency-auth.ts          # Guard RBAC — LE SEUL PATTERN AUTH AUTORISÉ
│   │   ├── auth/with-super-admin-auth.ts     # Guard super-admin
│   │   ├── auth/get-cached-user.ts
│   │   ├── supabase/ (client.ts, server.ts, middleware.ts)
│   │   ├── i18n/ (navigation.ts, request.ts, routing.ts)
│   │   ├── logger/ (Pino)
│   │   ├── themes/ (registry.ts — 10 thèmes vitrines)
│   │   ├── sanitize.ts, format.ts, agency-url.ts, plan-gating.ts, rate-limit.ts, theme.ts
│   │   ├── seo/json-ld.ts, cache/tags.ts, countries.ts
│   ├── hooks/useAnimatedCounter.ts           # Seul hook actif
│   ├── types/action-result.ts                # ActionResult<T>, ok(), fail()
│   ├── middleware.ts                         # Auth + i18n + CSRF + security headers
│   └── messages/ (fr.json, ar.json, en.json, es.json)
├── packages/config/                          # Seul package actif (env validation, constantes)
├── supabase/
│   ├── migrations/                           # 44 fichiers de migration
│   ├── functions/stripe-webhook/             # Edge Function webhook Stripe
│   ├── seed.sql
│   └── config.toml
└── theme/                                    # 10 templates HTML vitrines agences
```

-----

## Patterns d’architecture

### Feature module

Chaque module dans `src/features/` suit cette structure :
`actions/` (Server Actions “use server”) → `schemas/` (Zod) → `services/` (logique métier, reçoit SupabaseClient) → `components/` (React) → `types/` (DTOs) → `hooks/` (si nécessaire).

### Server Action — flux obligatoire

Valider l’input via Zod (avec `.transform(sanitizeInput)` sur les champs texte libre) → résoudre l’acteur via `withAgencyAuth` ou `withSuperAdminAuth` → appeler le service → retourner `ActionResult<T>` via `ok(data)` ou `fail("CODE", "message")` → déclencher `revalidatePath`/`revalidateTag` si nécessaire.

### Auth — un seul pattern autorisé

```typescript
// Pour les mutations agence — vérifie session + membership + RBAC
withAgencyAuth(agencyId, resource, permission, async (ctx) => {
  // ctx.userId, ctx.agencyId, ctx.role disponibles
  return data;
});

// Pour les mutations admin — vérifie session + RPC is_super_admin()
withSuperAdminAuth(async (ctx) => { return data; });
```

La matrice RBAC couvre 5 rôles (owner > admin > agent > editor > viewer) × 7 ressources (listing, team_member, invitation, billing, settings, analytics, media) × 4 permissions (create, read, update, delete). Définie dans `lib/auth/with-agency-auth.ts`.

-----

## Design System — “Zinc”

**Philosophie :** Tech premium meets real estate warmth. Inspiré de Linear (densité, keyboard-first), Stripe (précision, data tables), Apple (fluidité), Zillow (photos immersives), avec une identité visuelle tricolore algérienne (or saharien, bleu méditerranéen, vert montagne).

**Source de vérité design :** Le skill `/mnt/skills/user/aqarvision-ux-ui/SKILL.md` et ses fichiers `references/` (design-tokens.md, component-library.md, aqarpro-ux.md, aqarsearch-ux.md, aqarchaab-ux.md, editorial-immersive.md, product-vision.md). Consulter OBLIGATOIREMENT avant toute tâche visuelle.

**Palette :** Zinc (neutral gray blue-undertone) + Amber (warm accent) + semantic (success, warning, danger, info) + tricolore régional (or `#e8920a` Sahara, bleu `#1a8aaa` Méditerranée, vert `#2a8a4a` Montagnes). Tokens dans `globals.css` et `tailwind.config.ts`.

**Polices :** Geist (display + body), IBM Plex Sans Arabic (arabe), Geist Mono (code). Chargées dans `app/layout.tsx`.

**Dark mode :** Via `data-theme="dark"` sur `<html>`, persisté en cookie + localStorage.

-----

## Règles absolues

**JAMAIS** de hex hardcodé dans le JSX — uniquement classes Tailwind.
**JAMAIS** de inline style `style={{` — uniquement classes Tailwind.
**JAMAIS** de `bg-[#...]` ou `text-[#...]` — utiliser les tokens nommés.
**JAMAIS** de `<img>` — utiliser `next/image` avec `fill` + `sizes`.
**JAMAIS** de `pl-` / `pr-` / `ml-` / `mr-` — utiliser `ps-` / `pe-` / `ms-` / `me-` pour le RTL.
**JAMAIS** de texte hardcodé en français — utiliser `useTranslations()` (client) ou `getTranslations()` (server).
**JAMAIS** de couleur sans son équivalent `dark:` — chaque classe a sa paire.
**JAMAIS** d’appel DB direct depuis un composant React.
**JAMAIS** de logique métier dans les composants UI.
**JAMAIS** de membership check manuel — utiliser `withAgencyAuth`.
**JAMAIS** de `any` — typer strictement (MapLibre, erreurs, retours API).

-----

## État actuel — Dette technique connue

### Code mort à supprimer (Phase 0)

5 fichiers à 0 imports : `hooks/useScrollReveal.ts`, `features/auth/hooks/use-auth.ts`, `features/auth/services/auth.service.ts`, `features/agencies/hooks/use-current-agency.ts`, `features/messaging/hooks/use-realtime-messages.ts`.

Chaîne DeposerWizard v1 (remplacée par V2) : `features/listings/components/DeposerWizard.tsx` (29 Ko) + `features/listings/actions/create-individual-listing.action.ts` + `features/listings/schemas/individual-listing.schema.ts`.

6 packages monorepo vides à supprimer : domain, database, ui, security, analytics, feature-flags. Seul `packages/config` est actif.

Fichier `lib/actions/auth.ts` à supprimer (duplique `withAgencyAuth`). Migrer les 6 fichiers importateurs.

Bloc backward compat colors dans `tailwind.config.ts` à supprimer (onyx, ivoire, or, charcoal, warm, coral, aqar, text-dark, text-body, text-muted, text-faint).

Références mortes dans `next.config.ts` : `@aqarvision/domain` et `@aqarvision/security` dans `transpilePackages`. Images `picsum.photos` dans `remotePatterns`. Routes CSRF inexistantes dans middleware.

### Dette design (946 violations)

183 hex hardcodés, 406 inline styles, 26 patterns `bg-[#...]`, 331 lignes sans variante `dark:`. Table de correspondance : `#FAFAFA`→`zinc-50`, `#F4F4F5`→`zinc-100`, `#E4E4E7`→`zinc-200`, `#D4D4D8`→`zinc-300`, `#A1A1AA`→`zinc-400`, `#71717A`→`zinc-500`, `#52525B`→`zinc-600`, `#3F3F46`→`zinc-700`, `#27272A`→`zinc-800`, `#18181B`→`zinc-900`, `#09090B`→`zinc-950`, `#F59E0B`→`amber-500`, `#FBBF24`→`amber-400`, `#D97706`→`amber-600`.

### Textes i18n hardcodés

DashboardSidebar : 8 chaînes (“Paramètres”, “Apparence”, “Branding”, “Vérification”, “Retour au portail”, “Voir ma vitrine”, “Se déconnecter”, section label). Dashboard layout : 2 chaînes. ProLoginForm : 3 chaînes. Homepage wilayas : tableau hardcodé.

### Sentry mismatch

`@sentry/core` v10.43 vs `@sentry/nextjs` v8.0 — versions incompatibles. `next.config.ts` contient un try/catch qui avale silencieusement l’erreur. Aligner les versions et supprimer le workaround.

### CSP permissive

`unsafe-inline` + `unsafe-eval` dans la CSP scripts du middleware. Acceptable en dev, risque XSS en prod. Implémenter CSP par environnement avec nonces.

### SearchMap types any

3 types `any` explicites (MapLibreMap, MapLibreMarker, MapLibrePopup). Remplacer par les types natifs de `maplibre-gl`.

-----

## Composants dashboard manquants

Le dashboard AqarPro est fonctionnel mais incomplet par rapport aux spécifications du design system (`references/aqarpro-ux.md`). Il manque : **DashboardTopBar** (h-14, ⌘K, notifications, theme toggle, user dropdown), **sidebar collapsible** (240→64px, raccourci `[`, badges compteurs, drawer mobile), **CommandPalette** (⌘K/Ctrl+K, recherche fuzzy), **Overview enrichi** (activity feed, quick actions, bar chart, date range), **ListingDrawer** (side panel au clic sur une annonce), **bulk actions bar** (sticky bottom dans la table listings).

-----

## Direction design — Homepage

La homepage doit basculer de l’ancien thème dark-hero-overlay vers un design lumineux, tech, avec une identité tricolore algérienne. Fond clair (#fafafa), barre de recherche structurée, photos dans les cards et la mosaïque (pas en background), animations GSAP au scroll, trois régions visuellement distinctes (Sahara or, Méditerranée bleu, Montagnes vert), métriques avec compteurs animés. Les inspirations sont Stripe (précision, data), Linear (densité), Apple (fluidité, espaces), Zillow (photos immersives) — sans copier le template générique de portail immobilier.

-----

## Plan d’exécution séquentiel

**Phase 0 — Nettoyage (1-2 jours) :** Supprimer tout le code mort listé ci-dessus, consolider l’auth, nettoyer les configs. Validation : `pnpm typecheck && pnpm build && pnpm test`.

**Phase 1 — Stabilisation technique (1 semaine) :** Corriger Sentry, typer SearchMap, externaliser les textes FR hardcodés dans next-intl, ajouter 10 tests unitaires critiques, créer `.env.example`.

**Phase 2 — Éradication dette design (2-3 semaines) :** Éliminer les 946 violations (183 hex + 406 inline + 26 bg-[#] + 331 sans dark:). Validation : les 4 compteurs grep retournent 0.

**Phase 3 — Dashboard AqarPro complet (3-4 semaines) :** TopBar, sidebar collapsible, CommandPalette, Overview enrichi, ListingDrawer.

**Phase 4 — Refonte homepage + surfaces publiques (2-3 semaines) :** Nouveau design tricolore lumineux avec GSAP.

**Phase 5 — Sécurité et qualité (continu) :** CSP durcie, CI gates, tests E2E dashboard.

-----

## i18n et SEO

Toutes les routes sont préfixées par `[locale]`. Chaîne de fallback : locale demandée → fr → en. Les composants ne hardcodent jamais de texte (utiliser `useTranslations()` client ou `getTranslations()` server). Les nouvelles clés doivent être ajoutées dans les 4 fichiers `messages/`. Chaque page dynamique a `generateMetadata`. ISR pour les pages catégorie (`revalidate: 3600`), SSR pour le détail annonce. JSON-LD `RealEstateListing` sur les fiches.

-----

## Schéma base de données

44 fichiers de migration dans `supabase/migrations/`. Extensions PostGIS et btree_gist. Enums (user_role, agency_role, listing_status, listing_type, property_type, listing_owner_type). Tables principales : profiles, agencies, branches, memberships, invites, listings, translations, media, favorites, notes, saved_searches, leads, conversations, messages, plans, subscriptions, entitlements, domain_events, listing_views, agency_stats_daily, wilayas, communes. RLS deny-by-default sur toutes les tables. Fonctions RPC : is_agency_member, is_agency_admin, is_super_admin, handle_new_user.

-----

## Conventions

Utilitaires : `kebab-case.ts`. Composants : `PascalCase.tsx`. Suffixes obligatoires : `*.service.ts`, `*.action.ts`, `*.schema.ts`, `*.types.ts`. Server Components par défaut — `"use client"` uniquement si interactivité requise. Imports absolus avec `@/` prefix. Toute validation input passe par Zod avec `sanitizeInput` sur les champs texte libre.

-----

## Références design

|Référence                                   |Quand consulter                          |
|--------------------------------------------|-----------------------------------------|
|`/mnt/skills/user/aqarvision-ux-ui/SKILL.md`|Toujours                                 |
|`references/design-tokens.md`               |Couleurs, fonts, spacing, shadows, motion|
|`references/component-library.md`           |Avant de créer un composant              |
|`references/aqarpro-ux.md`                  |Dashboard, CRM                           |
|`references/aqarsearch-ux.md`               |Marketplace, recherche                   |
|`references/aqarchaab-ux.md`                |Espace particulier                       |
|`references/editorial-immersive.md`         |Homepage, vitrines, marketing            |
|`references/product-vision.md`              |Décisions fonctionnelles majeures        |

-----

## Commandes d’audit

```bash
# Dette design
grep -rn '#[0-9a-fA-F]\{6\}' apps/web/src --include="*.tsx" | grep -v tailwind.config | wc -l  # → 0
grep -rn 'style={{' apps/web/src --include="*.tsx" | wc -l                                      # → 0
grep -rn "bg-\[#" apps/web/src --include="*.tsx" | wc -l                                        # → 0
grep -rn "bg-white\|bg-zinc-50\|text-zinc-900" apps/web/src --include="*.tsx" | grep -v "dark:" | wc -l  # → 0

# Code mort
grep -rn "useScrollReveal\|use-auth\|use-current-agency\|use-realtime-messages" apps/web/src --include="*.tsx" --include="*.ts" | grep -v "hooks/" | wc -l  # → 0

# Textes hardcodés
grep -rn "Paramètres\|Retour au portail\|Voir ma vitrine\|Accéder à AqarPro\|Terminez la config" apps/web/src --include="*.tsx" | wc -l  # → 0
```