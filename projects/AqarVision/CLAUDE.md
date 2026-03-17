# CLAUDE.md

> Dernière mise à jour : 17 mars 2026.
> Ce fichier est lu automatiquement par Claude Code à chaque session. C'est la **source de vérité unique** du projet. Lire intégralement avant toute modification.

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
| Observabilité   | Sentry (version mismatch à corriger)                                      |
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
```

-----

## Structure du monorepo

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
│   ├── migrations/                           # 47 fichiers SQL (00000 → 00210)
│   ├── functions/stripe-webhook/             # Edge Function webhook Stripe
│   ├── seed.sql                              # Données démo (27 KB)
│   └── config.toml
├── .github/workflows/                        # ci.yml + deploy.yml
├── vercel.json                               # Config déploiement Vercel
├── .mcp.json                                 # Config MCP Supabase
└── .env.example                              # Template variables d'environnement
```

**Statistiques :** 54 pages, 9 layouts, 26 loading skeletons, 15 modules features (183 fichiers), 38 composants partagés, 23 fichiers lib, 47 migrations SQL, 4 locales, 10 thèmes agences.

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

47 migrations SQL (`00000` → `00210`). Extensions : PostGIS, btree_gist.

> **Attention :** Deux migrations portent le même numéro `00200` (`00200_sprint1_features.sql` et `00200_search_spatial_rpc.sql`). À résoudre en renommant l'une d'elles.

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

## État actuel — Dette technique connue

### Code mort à supprimer

- 5 hooks inutilisés : `hooks/useScrollReveal.ts`, `features/auth/hooks/use-auth.ts`, `features/auth/services/auth.service.ts`, `features/agencies/hooks/use-current-agency.ts`, `features/messaging/hooks/use-realtime-messages.ts`.
- DeposerWizard v1 (remplacé par V2) : `features/listings/components/DeposerWizard.tsx` (29 Ko) + `features/listings/actions/create-individual-listing.action.ts` + `features/listings/schemas/individual-listing.schema.ts`.
- 6 packages monorepo vides : domain, database, ui, security, analytics, feature-flags.
- `lib/actions/auth.ts` (duplique `withAgencyAuth`) + 6 fichiers importateurs à migrer.
- Bloc backward-compat colors dans `tailwind.config.ts` (onyx, ivoire, or, charcoal, warm, coral, aqar, text-dark, text-body, text-muted, text-faint).
- Références mortes dans `next.config.ts` : `@aqarvision/domain` et `@aqarvision/security` dans `transpilePackages`, `picsum.photos` dans `remotePatterns`.

### Dette design

183 hex hardcodés, 406 inline styles, 26 patterns `bg-[#...]`, 331 lignes sans variante `dark:`. Correspondances : `#FAFAFA`→`zinc-50`, `#F4F4F5`→`zinc-100`, `#E4E4E7`→`zinc-200`, `#D4D4D8`→`zinc-300`, `#A1A1AA`→`zinc-400`, `#71717A`→`zinc-500`, `#52525B`→`zinc-600`, `#3F3F46`→`zinc-700`, `#27272A`→`zinc-800`, `#18181B`→`zinc-900`, `#09090B`→`zinc-950`, `#F59E0B`→`amber-500`, `#FBBF24`→`amber-400`, `#D97706`→`amber-600`.

### Textes i18n hardcodés

DashboardSidebar (8 chaînes), Dashboard layout (2), ProLoginForm (3), Homepage wilayas (tableau hardcodé).

### Autres dettes

- **Sentry :** `@sentry/core` v10.43 vs `@sentry/nextjs` v8.0 — versions incompatibles. `next.config.ts` try/catch silencieux.
- **CSP :** `unsafe-inline` + `unsafe-eval` dans le middleware. Implémenter CSP par environnement avec nonces.
- **SearchMap :** 3 types `any` (MapLibreMap, MapLibreMarker, MapLibrePopup).
- **Mobile :** `apps/mobile/` est un spike Expo non actif (13 fichiers).

-----

## Plan d'exécution séquentiel

**Phase 0 — Nettoyage (1-2 jours) :** Supprimer le code mort, consolider l'auth, nettoyer les configs. Validation : `pnpm typecheck && pnpm build && pnpm test`.

**Phase 1 — Stabilisation technique (1 semaine) :** Corriger Sentry, typer SearchMap, externaliser les textes FR hardcodés, ajouter 10 tests unitaires critiques.

**Phase 2 — Éradication dette design (2-3 semaines) :** Éliminer les violations (183 hex + 406 inline + 26 bg-[#] + 331 sans dark:).

**Phase 3 — Dashboard AqarPro complet (3-4 semaines) :** TopBar enrichie, sidebar collapsible, CommandPalette, Overview enrichi, ListingDrawer.

**Phase 4 — Refonte homepage + surfaces publiques (2-3 semaines) :** Design tricolore lumineux avec GSAP.

**Phase 5 — Sécurité et qualité (continu) :** CSP durcie, CI gates, tests E2E dashboard.

-----

## Références design

| Référence | Quand consulter |
|-----------|-----------------|
| `/mnt/skills/user/aqarvision-ux-ui/SKILL.md` | Toujours |
| `references/design-tokens.md` | Couleurs, fonts, spacing, shadows, motion |
| `references/component-library.md` | Avant de créer un composant |
| `references/aqarpro-ux.md` | Dashboard, CRM |
| `references/aqarsearch-ux.md` | Marketplace, recherche |
| `references/aqarchaab-ux.md` | Espace particulier |
| `references/editorial-immersive.md` | Homepage, vitrines, marketing |
| `references/product-vision.md` | Décisions fonctionnelles majeures |

-----

## Commandes d'audit

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
