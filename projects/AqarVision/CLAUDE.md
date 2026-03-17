# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Dernière mise à jour : 17 mars 2026.
> Ce fichier est lu automatiquement par Claude Code à chaque session. C'est la **source de vérité unique** du projet. Lire intégralement avant toute modification.

-----

## État actuel vs. spécification

> **CRITIQUE** : Ce fichier décrit à la fois l'état actuel ET la cible. `apps/web/` N'EXISTE PAS ENCORE. Voici ce qui existe réellement :

### Code existant (implémenté)

- **`packages/config/`** — `env.ts` (validation Zod des variables d'env), `constants.ts` (locales, currencies, image variants)
- **`supabase/migrations/`** — 10 fichiers SQL (`001` → `010`) : extensions/enums, profiles, organisations, listings core, history, marketplace, leads/messaging, billing/analytics, geography, functions/triggers/indexes/RLS
- **`supabase/functions/stripe-webhook/`** — Edge Function webhook Stripe (index.ts)
- **`supabase/seed.sql`** — Données de démonstration
- **`apps/mobile/`** — Spike Expo non actif (13 fichiers : auth, tabs, listing detail, composants Button/ListingCard)
- **Configs** — turbo.json, pnpm-workspace.yaml, vercel.json, .mcp.json, tsconfig.json, .github/workflows/
- **`references/`** — 7 documents de design/UX (design-tokens, component-library, aqarpro-ux, aqarsearch-ux, aqarchaab-ux, editorial-immersive, product-vision)

### Pas encore implémenté (spécification ci-dessous)

- **`apps/web/`** — L'intégralité de l'app Next.js (54 pages, 15 feature modules, 38 composants, middleware, i18n, tests). Les sections "Structure du monorepo", "Routes par surface", "Patterns d'architecture", "Design System", "i18n et SEO", "Dette technique" décrivent la **cible à construire**.

Quand on te demande de construire des fonctionnalités, réfère-toi aux sections de spec ci-dessous. Quand on te demande l'état actuel, réfère-toi à cette section.

-----

## Identité projet

**AqarVision** — Plateforme immobilière algérienne (proptech) composée de quatre surfaces :

- **AqarSearch** — Marketplace publique : recherche multicritère, carte interactive, SEO, alertes, favoris, comparaison, estimation prix.
- **AqarPro** — CRM agence : gestion annonces, leads, demandes de visite, messagerie, analytics, équipe, facturation Stripe, vitrines agences thématisées.
- **AqarChaab** — Espace particulier : déposer une annonce, messagerie, alertes, collections, historique, profil, upgrade.
- **Marketing** — Homepage, pages /pro, /vendre, /estimer, /pricing, vitrines agences en sous-domaine.

Multi-tenant (RLS Supabase isolé par agence), multilingue (FR/AR/EN/ES avec RTL natif), cible l'Algérie (58 wilayas, 1 541 communes). Monétisation Stripe (plans Starter/Pro/Enterprise pour agences, packs/abonnements pour particuliers).

-----

## Stack technique

| Couche          | Technologie                                                               |
|-----------------|---------------------------------------------------------------------------|
| Frontend        | Next.js 15 App Router + Server Actions                                    |
| Langage         | TypeScript strict (pas de `any`)                                          |
| UI              | Tailwind CSS brut + Lucide React (icônes) — PAS de shadcn/ui             |
| Backend         | Supabase (Auth SSR + Postgres + RLS + Storage + Edge Functions)           |
| Base de données | PostgreSQL 15+ avec PostGIS + btree_gist                                  |
| Paiements       | Stripe (Checkout + Customer Portal + Webhooks via Edge Function Supabase) |
| Cartes          | MapLibre GL JS + Maptiler                                                 |
| Validation      | Zod                                                                       |
| i18n            | next-intl (4 locales : fr, ar, en, es)                                    |
| Monorepo        | Turborepo + pnpm workspaces                                               |
| Hébergement     | Vercel (web) + Supabase Cloud                                             |
| Tests           | Vitest (unit, 3 fichiers) + Playwright (E2E, 8 specs)                     |
| Polices         | Geist (latin) + IBM Plex Sans Arabic — chargées via next/font             |
| Observabilité   | Sentry (package installé mais non initialisé — à configurer ou retirer)   |
| Rate limiting   | Upstash Redis                                                             |
| Logging         | Pino                                                                      |
| CI/CD           | GitHub Actions (ci.yml + deploy.yml)                                      |

**Il n'y a PAS de route API dans `src/app/api/`** — les webhooks Stripe passent par `supabase/functions/stripe-webhook`. **Il n'y a PAS d'IA** — les fonctionnalités IA ont été supprimées.

-----

## Commandes

Depuis la racine monorepo `AqarVision/` :

```bash
pnpm install              # Installer les dépendances
pnpm dev                  # Dev server (port 3000)
pnpm build                # Build production via Turbo
pnpm lint                 # Lint
pnpm typecheck            # Vérification TypeScript
pnpm test                 # Tests Vitest
pnpm test:e2e             # Tests Playwright (nécessite build)
pnpm format               # Prettier (ts, tsx, md, json)
```

Supabase (nécessite Supabase CLI installé) :

```bash
supabase start            # Démarrer Supabase local (Docker)
supabase db reset          # Rejouer toutes les migrations + seed
supabase migration new <name>  # Créer une nouvelle migration
supabase functions serve   # Servir les Edge Functions localement
```

-----

## Structure du monorepo (SPEC — `apps/web/` n'existe pas encore)

```
AqarVision/
├── apps/web/src/
│   ├── app/[locale]/
│   │   ├── page.tsx                          # Homepage (editorial components)
│   │   ├── (marketing)/pricing/              # Page tarifs
│   │   ├── auth/                             # Hub auth (redirect → AqarPro ou AqarChaab)
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── AqarPro/
│   │   │   ├── auth/ (login, signup)
│   │   │   └── dashboard/                    # CRM agence
│   │   │       ├── page.tsx                  # Overview
│   │   │       ├── listings/ (table, [id], new)
│   │   │       ├── leads/
│   │   │       ├── visit-requests/
│   │   │       ├── analytics/
│   │   │       ├── team/
│   │   │       ├── billing/
│   │   │       ├── settings/ (appearance, branding, verification)
│   │   │       └── onboarding/
│   │   ├── AqarChaab/
│   │   │   ├── auth/ (login, signup)
│   │   │   └── espace/                       # Espace particulier
│   │   │       ├── mes-annonces/
│   │   │       ├── messagerie/
│   │   │       ├── alertes/
│   │   │       ├── collections/
│   │   │       ├── historique/
│   │   │       ├── profil/
│   │   │       └── upgrade/
│   │   ├── search/                           # Marketplace (SearchPageClient + carte)
│   │   ├── annonce/[slug]/                   # Détail annonce
│   │   ├── a/[slug]/                         # Vitrine agence (sous-domaine)
│   │   ├── agences/                          # Annuaire agences
│   │   ├── admin/                            # Super admin (agencies, users, payments, verifications, settings)
│   │   ├── deposer/                          # Wizard dépôt annonce individuel (V2)
│   │   ├── comparer/                         # Comparaison annonces
│   │   ├── estimer/                          # Estimation prix
│   │   ├── favorites/                        # Favoris
│   │   ├── vendre/                           # Landing marketing vente
│   │   ├── pro/                              # Landing marketing AqarPro
│   │   ├── agency/new/                       # Création agence
│   │   └── invite/[token]/                   # Acceptation invitation
│   │
│   ├── features/                             # 15 modules métier
│   │   ├── admin/                            # Gestion super-admin
│   │   ├── agencies/                         # CRUD agences, hooks, schemas
│   │   ├── agency-settings/                  # Apparence, branding, vérification
│   │   ├── analytics/                        # Stats agence
│   │   ├── auth/                             # 6 formulaires (Pro/Chaab login/signup, forgot/reset)
│   │   ├── billing/                          # Plans, subscriptions, Stripe checkout, PricingTable
│   │   ├── favorites/                        # Favoris + collections
│   │   ├── leads/                            # Pipeline prospects
│   │   ├── listings/                         # CRUD annonces, wizard deposer (7 steps), traductions
│   │   ├── marketplace/                      # Recherche, filtres, carte, alertes, estimateur, notes
│   │   ├── media/                            # Upload photos (signed URLs + Storage)
│   │   ├── messaging/                        # Conversations temps réel
│   │   ├── moderation/                       # Modération contenu
│   │   ├── onboarding/                       # Wizard première config agence
│   │   └── visit-requests/                   # Demandes de visite
│   │
│   ├── components/
│   │   ├── dashboard/                        # DashboardSidebar, DashboardTopBar, DashboardShell,
│   │   │                                     # CommandPalette, ListingDrawer, BulkActionsBar
│   │   ├── marketing/                        # MarketingHeader, MarketingFooter, HomeSearchBar
│   │   ├── editorial/                        # EditorialSplit, StatsStrip, FullBleedPhoto, WilayaScroller
│   │   ├── agency/                           # ThemeRenderer + 10 thèmes vitrines (LuxeNoir, Méditerranée,
│   │   │                                     # NeoBrutalist, MarocainContemporain, PastelDoux, CorporateNavy,
│   │   │                                     # Editorial, ArtDeco, OrganiqueEco, SwissMinimal)
│   │   ├── admin/                            # AdminSidebar
│   │   ├── brand/                            # AqarBrandLogo
│   │   ├── ui/                               # LanguageSwitcher
│   │   └── (root)                            # ErrorBoundary, LocaleHtmlSync, ThemeToggle
│   │
│   ├── lib/
│   │   ├── auth/                             # with-agency-auth.ts (RBAC), with-super-admin-auth.ts,
│   │   │                                     # get-cached-user.ts, get-agency-for-user.ts
│   │   ├── supabase/                         # client.ts, server.ts, middleware.ts
│   │   ├── i18n/                             # routing.ts, navigation.ts, request.ts
│   │   ├── geodata/                          # wilayas.json (58), communes.json (1 541), types
│   │   ├── map/                              # config.ts (MapLibre + Maptiler), wilaya-geojson, fly-to
│   │   ├── themes/                           # registry.ts (10 thèmes vitrines)
│   │   ├── logger/                           # Pino wrapper
│   │   ├── cache/                            # tags.ts (revalidation keys)
│   │   ├── seo/                              # json-ld.ts (RealEstateListing schema)
│   │   └── (root)                            # sanitize.ts, format.ts, agency-url.ts,
│   │                                         # plan-gating.ts, rate-limit.ts, theme.ts
│   │
│   ├── middleware.ts                         # Auth + i18n + sous-domaines agences + CSRF + headers sécurité (316 lignes)
│   ├── __tests__/unit/                       # 3 fichiers (sanitize, with-agency-auth, listing-schemas)
│   └── messages/                             # fr.json, ar.json, en.json, es.json (~30 KB chacun)
│
├── apps/web/__tests__/e2e/                   # 8 specs Playwright (homepage, auth, search, annonce,
│                                             # deposer, agences, listing-detail, subdomain)
├── apps/mobile/                              # Expo early-stage (13 fichiers, non actif)
├── packages/config/                          # Seul package actif : env.ts (Zod), constants.ts
├── supabase/
│   ├── migrations/                           # 10 fichiers SQL (001 → 010)
│   ├── functions/stripe-webhook/             # Edge Function webhook Stripe
│   ├── seed.sql                              # Données démo (27 KB)
│   └── config.toml
├── .github/workflows/                        # ci.yml + deploy.yml
├── vercel.json                               # Config déploiement Vercel
├── .mcp.json                                 # Config MCP Supabase
└── .env.example                              # Template variables d'environnement
```

**Statistiques cible :** 54 pages, 9 layouts, 26 loading skeletons, 15 modules features (183 fichiers), 38 composants partagés, 23 fichiers lib, 4 locales, 10 thèmes agences. **Existant :** 10 migrations SQL, 1 Edge Function, 1 package config, 1 spike mobile.

-----

## Routes par surface (54 pages)

| Surface | Routes | Description |
|---------|--------|-------------|
| **AqarSearch** | `/search`, `/annonce/[slug]`, `/a/[slug]`, `/agences`, `/comparer`, `/estimer`, `/favorites` | Marketplace publique |
| **AqarPro** | `/AqarPro/auth/*`, `/AqarPro/dashboard/*` (overview, listings, leads, visit-requests, analytics, team, billing, settings, onboarding) | CRM agence (10 sous-pages) |
| **AqarChaab** | `/AqarChaab/auth/*`, `/AqarChaab/espace/*` (mes-annonces, messagerie, alertes, collections, historique, profil, upgrade) | Espace particulier (7 sous-pages) |
| **Marketing** | `/`, `/pricing`, `/pro`, `/vendre`, `/deposer` | Homepage + landing pages |
| **Admin** | `/admin/*` (agencies, users, payments, verifications, settings) | Super-administration |
| **Auth** | `/auth`, `/auth/forgot-password`, `/auth/reset-password`, `/agency/new`, `/invite/[token]` | Authentification transversale |

-----

## Patterns d'architecture

### Feature module

Chaque module dans `src/features/` suit : `actions/` (Server Actions `"use server"`) → `schemas/` (Zod) → `services/` (logique métier, reçoit SupabaseClient) → `components/` (React) → `types/` (DTOs) → `hooks/` (si nécessaire).

### Server Action — flux obligatoire

Valider l'input via Zod (avec `.transform(sanitizeInput)` sur les champs texte libre) → résoudre l'acteur via `withAgencyAuth` ou `withSuperAdminAuth` → appeler le service → retourner `ActionResult<T>` via `ok(data)` ou `fail("CODE", "message")` → `revalidatePath`/`revalidateTag` si nécessaire.

### Auth — un seul pattern autorisé

```typescript
// Mutations agence — vérifie session + membership + RBAC
withAgencyAuth(agencyId, resource, permission, async (ctx) => {
  // ctx.userId, ctx.agencyId, ctx.role
  return data;
});

// Mutations admin — vérifie session + RPC is_super_admin()
withSuperAdminAuth(async (ctx) => { return data; });
```

### RBAC

5 rôles × 7 ressources × 4 permissions. Défini dans `lib/auth/with-agency-auth.ts`.

| Rôle | listing | team_member | invitation | billing | settings | analytics | media |
|------|---------|-------------|------------|---------|----------|-----------|-------|
| **owner** | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| **admin** | CRUD | CRU | CRUD | R | CRU | CRUD | CRUD |
| **agent** | CRU | R | — | — | R | R | CRU |
| **editor** | RU | R | — | — | R | R | CRU |
| **viewer** | R | R | — | — | — | R | R |

### Middleware (316 lignes)

Flux : intlMiddleware (i18n) → updateSession (Supabase SSR) → extractAgencySubdomain (contexte vitrine) → isPublicRoute (32 patterns) → security headers → NextResponse.

-----

## Schéma base de données

10 migrations SQL (`001` → `010`). Extensions : PostGIS, btree_gist, pg_trgm.

Fichiers : `001_extensions_and_enums`, `002_identity_and_profiles`, `003_organizations`, `004_listings_core`, `005_listings_history`, `006_marketplace`, `007_leads_messaging`, `008_billing_analytics`, `009_geography`, `010_functions_triggers_indexes_rls`.

### Enums

`user_role` (end_user, super_admin), `agency_role` (owner, admin, agent, editor, viewer), `listing_status` (draft, pending_review, published, paused, rejected, sold, rented, expired, archived), `listing_type` (sale, rent, vacation), `property_type` (apartment, villa, terrain, commercial, office, building, farm, warehouse), `listing_owner_type` (agency, individual), `document_type` (acte, livret_foncier, promesse, cc), `lead_status` (new, contacted, qualified, closed), `subscription_status` (trialing, active, past_due, canceled, incomplete), `moderation_action` (approved, rejected, hidden, restored).

### Tables principales

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (+ stripe_customer_id pour particuliers) |
| `agencies` | Agences (+ stripe_customer_id, theme, branding, verification_status) |
| `branches` | Succursales agences |
| `agency_memberships` | Liens user ↔ agence + rôle |
| `invitations` | Invitations équipe (token, email, role) |
| `listings` | Annonces (owner_type agency/individual, PostGIS geography, details JSONB: rooms, bathrooms, area_m2, floor, has_parking, has_elevator, furnished, year_built, etc.) |
| `listing_translations` | Traductions (locale, title, description, slug) |
| `listing_media` | Photos (storage_path, position, is_cover) |
| `listing_documents` | Documents légaux (acte, livret_foncier, promesse, cc) |
| `listing_price_history` | Historique prix (old_price, new_price, trigger auto) |
| `listing_views` | Compteur vues (viewer_id, session_id, referrer) |
| `listing_notes` | Notes internes agence (1 par user/listing) |
| `favorites` | Favoris utilisateurs |
| `favorite_collections` | Collections de favoris |
| `saved_searches` | Recherches sauvegardées / alertes (V1) |
| `search_alerts` | Alertes V2 (filters JSONB, frequency instant/daily/weekly) |
| `leads` | Prospects (source platform/whatsapp/phone, score 0-100, heat_score, lead_type, notes JSONB) |
| `conversations` | Fils de discussion |
| `messages` | Messages (user ↔ agence) |
| `visit_requests` | Demandes de visite |
| `plans` | Plans tarifaires agences (max_listings, stripe_price_id) |
| `subscriptions` | Abonnements agences actifs |
| `entitlements` | Droits par agence (feature_key, metadata) |
| `individual_listing_packs` | Packs annonces ponctuels AqarChaab (pack_3, pack_7, pack_15) |
| `individual_subscriptions` | Abonnements particuliers AqarChaab (chaab_plus, chaab_pro) |
| `individual_payments` | Paiements particuliers (provider: stripe, cib, dahabia, baridimob, virement) |
| `agency_stats_daily` | Stats agence agrégées par jour |
| `domain_events` | Événements métier |
| `wilayas` | 58 wilayas algériennes |
| `communes` | 1 541 communes |
| `audit_logs` | Trail d'audit admin (action, actor, target, metadata) |
| `verifications` | Badges confiance agence (level 1-4, type, status, expires_at) |
| `platform_settings` | Paramètres admin plateforme |

### RPC

`is_agency_member(uuid, uuid)`, `is_agency_admin(uuid, uuid)`, `is_super_admin()`, `handle_new_user()`, `create_listing_atomic(...)`, `search_listings_spatial(...)`.

### RLS

Deny-by-default sur toutes les tables. Politiques par rôle et ownership. Annonces individuelles : l'owner peut CRUD ses propres annonces.

### Facturation

**Agences (Stripe) :** 3 plans (Starter, Pro, Enterprise) avec `max_listings`, Stripe Checkout + Customer Portal + Webhooks via Edge Function. Table `plans` → `subscriptions` → `entitlements`.

**Particuliers (AqarChaab) :** Packs ponctuels (pack_3, pack_7, pack_15 annonces) + abonnements mensuels (chaab_plus, chaab_pro). Providers de paiement : Stripe, CIB, Dahabia, BaridiMob, virement bancaire. Tables `individual_listing_packs` → `individual_subscriptions` → `individual_payments`.

-----

## Design System — "Zinc"

**Philosophie :** Tech premium meets real estate warmth. Inspiré de Linear (densité), Stripe (précision), Apple (fluidité), Zillow (photos immersives), avec identité tricolore algérienne.

### Palette (tailwind.config.ts)

- **Neutres :** Zinc 50-950 (gray blue-undertone)
- **Accent :** Amber 400-600 (warm)
- **Sémantique :** success, warning, danger, info (+ ghost variants)
- **Tricolore :** `sahara` #E8920A (or), `med` #1A7FA8 (bleu), `atlas` #2A8A4A (vert)
- **Immobilier :** `listing-sale` (blue), `listing-rent` (purple), `listing-vacation` (amber)
- **Statut annonce :** draft, pending, published, paused, rejected, sold

### Tokens CSS

`bg-surface`, `bg-muted`, `bg-elevated`, `text-primary`, `text-secondary`, `text-tertiary`, `accent`, `accent-hover`, `accent-ghost`.

### Polices

Geist (display + body), IBM Plex Sans Arabic + Noto Sans Arabic (arabe), Geist Mono (code).

### Dark mode

Via `data-theme="dark"` sur `<html>`, persisté en cookie + localStorage. Pas le mode `class` natif de Tailwind.

### 10 thèmes vitrines agences

LuxeNoir, Méditerranée, NeoBrutalist, MarocainContemporain, PastelDoux, CorporateNavy, Editorial, ArtDeco, OrganiqueEco, SwissMinimal. Chacun est un composant React complet (200-310 lignes) dans `components/agency/themes/`, avec palette, typographie et layout propres. Configurés dans `lib/themes/registry.ts`.

-----

## i18n et SEO

Routes préfixées `[locale]`. Fallback : locale demandée → fr → en. Composants ne hardcodent jamais de texte : `useTranslations()` (client) ou `getTranslations()` (server). Nouvelles clés dans les 4 fichiers `messages/`. `generateMetadata` sur chaque page dynamique. ISR pour les pages catégorie (`revalidate: 3600`), SSR pour le détail annonce. JSON-LD `RealEstateListing` sur les fiches.

-----

## Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL          # URL Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Clé anon Supabase
SUPABASE_SERVICE_ROLE_KEY         # Clé service Supabase
STRIPE_SECRET_KEY                 # sk_...
STRIPE_WEBHOOK_SECRET             # whsec_...
NEXT_PUBLIC_MAPLIBRE_STYLE_URL    # URL tuiles MapLibre/Maptiler
UPSTASH_REDIS_REST_URL            # Rate limiting
UPSTASH_REDIS_REST_TOKEN          # Rate limiting
SENTRY_DSN                        # Observabilité (optionnel)
LOG_LEVEL                         # debug | info | warn | error (défaut: info)
```

Validation Zod dans `packages/config/src/env.ts`. Déclarées dans `turbo.json` globalEnv.

-----

## Règles absolues

- **JAMAIS** de hex hardcodé dans le JSX — uniquement classes Tailwind nommées.
- **JAMAIS** de inline style `style={{` — uniquement classes Tailwind.
- **JAMAIS** de `bg-[#...]` ou `text-[#...]` — utiliser les tokens.
- **JAMAIS** de `<img>` — utiliser `next/image` avec `fill` + `sizes`.
- **JAMAIS** de `pl-` / `pr-` / `ml-` / `mr-` — utiliser `ps-` / `pe-` / `ms-` / `me-` (RTL).
- **JAMAIS** de texte hardcodé en français — utiliser `useTranslations()` / `getTranslations()`.
- **JAMAIS** de couleur sans son équivalent `dark:` — chaque classe a sa paire.
- **JAMAIS** d'appel DB direct depuis un composant React.
- **JAMAIS** de logique métier dans les composants UI.
- **JAMAIS** de membership check manuel — utiliser `withAgencyAuth`.
- **JAMAIS** de `any` — typer strictement.

-----

## Conventions

- **Fichiers utilitaires :** `kebab-case.ts`.
- **Composants :** `PascalCase.tsx`.
- **Suffixes obligatoires :** `*.service.ts`, `*.action.ts`, `*.schema.ts`, `*.types.ts`.
- **Server Components par défaut** — `"use client"` uniquement si interactivité requise.
- **Imports absolus** avec `@/` prefix.
- **Validation input** via Zod + `sanitizeInput` sur champs texte libre.

-----

## État actuel — Ce qui reste à construire

> Les sections "Dette technique" ci-dessous s'appliqueront quand `apps/web/` existera. Pour l'instant, le travail principal est de **construire l'app web** en suivant la spec ci-dessus.

### Hex → Tailwind token mapping (à respecter dès le départ)

`#FAFAFA`→`zinc-50`, `#F4F4F5`→`zinc-100`, `#E4E4E7`→`zinc-200`, `#D4D4D8`→`zinc-300`, `#A1A1AA`→`zinc-400`, `#71717A`→`zinc-500`, `#52525B`→`zinc-600`, `#3F3F46`→`zinc-700`, `#27272A`→`zinc-800`, `#18181B`→`zinc-900`, `#09090B`→`zinc-950`, `#F59E0B`→`amber-500`, `#FBBF24`→`amber-400`, `#D97706`→`amber-600`.

-----

## Plan d'exécution séquentiel

**Phase 0 — Scaffolding `apps/web/` :** Créer l'app Next.js 15 avec App Router, Tailwind, next-intl, Supabase SSR, middleware i18n/auth. Validation : `pnpm dev` démarre sans erreur.

**Phase 1 — Fondations :** Auth (login/signup Pro + Chaab), layout dashboard, layout marketing, composants partagés (sidebar, header, footer).

**Phase 2 — AqarPro CRM :** Dashboard overview, CRUD annonces, leads, demandes de visite, analytics, team, billing Stripe, settings.

**Phase 3 — AqarSearch Marketplace :** Recherche multicritère, carte MapLibre, détail annonce, favoris, comparaison, estimation.

**Phase 4 — AqarChaab Espace particulier :** Dépôt annonce wizard, messagerie, alertes, collections, profil, upgrade.

**Phase 5 — Marketing & Polish :** Homepage éditoriale, landing pages, vitrines agences thématisées, SEO, tests E2E.

-----

## Références design

| Référence | Quand consulter |
|-----------|-----------------|
| `../../library/skills/design/frontend-design/` | Toujours |
| `references/design-tokens.md` | Couleurs, fonts, spacing, shadows, motion |
| `references/component-library.md` | Avant de créer un composant |
| `references/aqarpro-ux.md` | Dashboard, CRM |
| `references/aqarsearch-ux.md` | Marketplace, recherche |
| `references/aqarchaab-ux.md` | Espace particulier |
| `references/editorial-immersive.md` | Homepage, vitrines, marketing |
| `references/product-vision.md` | Décisions fonctionnelles majeures |

-----

## Ressources library (repo parent)

Le repo parent (`../../`) contient une bibliotheque de ressources Claude Code. Voici celles pertinentes pour AqarVision — les consulter avant de developper.

### Skills

| Skill | Chemin | Usage |
|-------|--------|-------|
| **frontend-design** | `../../library/skills/design/frontend-design/` | Design des pages et composants UI |
| **frontend-design-plugin** | `../../library/skills/design/frontend-design-plugin/` | Plugin Claude pour le design frontend |
| **theme-factory** | `../../library/skills/design/theme-factory/` | Creation et modification des 10 themes vitrines agences |
| **webapp-testing** | `../../library/skills/development/webapp-testing/` | Tests Vitest (unit) + Playwright (E2E) |
| **mcp-builder** | `../../library/skills/development/mcp-builder/` | Construction de serveurs MCP |

### Subagents

| Subagent | Chemin | Usage |
|----------|--------|-------|
| **nextjs-developer** | `../../library/subagents/languages/` | Developpement Next.js 15 App Router |
| **react-specialist** | `../../library/subagents/languages/` | Composants React, Server Components |
| **typescript-pro** | `../../library/subagents/languages/` | TypeScript strict, typage avance |
| **postgres-pro** | `../../library/subagents/data-ai/` | PostgreSQL + PostGIS, migrations, RPC, RLS |
| **security-auditor** | `../../library/subagents/testing/` | Audit securite (CSP, RLS, OWASP) |
| **code-reviewer** | `../../library/subagents/testing/` | Review de code systematique |
| **qa-expert** | `../../library/subagents/testing/` | Strategie de tests |

### Workflows

| Workflow | Chemin | Usage |
|----------|--------|-------|
| **manus-style** | `../../library/workflows/planning/manus-style/` | Planification des phases du projet |
| **systematic-debugging** | `../../library/workflows/debugging/systematic-debugging/` | Debug methodique |
| **test-driven-development** | `../../library/workflows/debugging/test-driven-development/` | TDD pour les features critiques |
| **code-review** | `../../library/workflows/code-review/` | Processus de review |
| **git-strategies** | `../../library/workflows/git-strategies/` | Gestion des branches et merges |
| **verification-before-completion** | `../../library/workflows/verification-before-completion/` | Quality gates avant merge |

### Generateurs

| Generateur | Chemin | Usage |
|------------|--------|-------|
| **ui-ux-pro** | `../../library/generators/ui-components/ui-ux-pro/` | Generation de composants UI (67 styles, 96 palettes) |

### Exemples d'utilisation

```
Utilise ../../library/skills/design/frontend-design/ pour designer la page de recherche AqarSearch
Active le subagent postgres-pro de ../../library/subagents/data-ai/ pour optimiser les requetes PostGIS
Applique le workflow TDD de ../../library/workflows/debugging/test-driven-development/ pour les Server Actions
Utilise ../../library/generators/ui-components/ui-ux-pro/ pour generer les composants du dashboard AqarPro
```

-----

## Commandes d'audit

> Ces commandes ciblent `apps/web/src` qui n'existe pas encore. À utiliser une fois l'app web créée.

```bash
# Dette design
grep -rn '#[0-9a-fA-F]\{6\}' apps/web/src --include="*.tsx" | grep -v tailwind.config | wc -l  # → 0
grep -rn 'style={{' apps/web/src --include="*.tsx" | wc -l                                      # → 0
grep -rn "bg-\[#" apps/web/src --include="*.tsx" | wc -l                                        # → 0

# Code mort
grep -rn "useScrollReveal\|use-auth\|use-current-agency\|use-realtime-messages" apps/web/src --include="*.tsx" --include="*.ts" | grep -v "hooks/" | wc -l  # → 0

# Textes hardcodés
grep -rn "Paramètres\|Retour au portail\|Voir ma vitrine" apps/web/src --include="*.tsx" | wc -l  # → 0
```
