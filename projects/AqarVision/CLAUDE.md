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
- **`services/python-api/`** — Micro-service FastAPI (7 endpoints : estimation ML, scraping marché, analyse images, analytics/export, géocodage batch, NLP arabe, génération PDF). Communique avec Next.js via REST. Déployé séparément (Railway/Docker)
- **Configs** — turbo.json, pnpm-workspace.yaml, vercel.json, .mcp.json, tsconfig.json, .github/workflows/
- **`references/`** — 7 documents de design/UX (design-tokens, component-library, aqarpro-ux, aqarsearch-ux, aqarchaab-ux, editorial-immersive, product-vision)

### Pas encore implémenté (spécification ci-dessous)

- **`apps/web/`** — L'intégralité de l'app Next.js 16 (56 pages, 15 feature modules, 50+ composants, proxy.ts, i18n, tests). Les sections "Structure du monorepo", "Routes par surface", "Patterns d'architecture", "Design System", "i18n et SEO", "Dette technique" décrivent la **cible à construire**.

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
| Frontend        | Next.js 16 App Router + Server Actions + React 19.2                       |
| Langage         | TypeScript strict (pas de `any`)                                          |
| UI              | Tailwind CSS + Lucide React (icônes) + class-variance-authority (cva) — PAS de shadcn/ui |
| Design System   | Stone (neutres) + Teal (accent) + Amber (secondaire) — voir `references/design-tokens.md` |
| Backend         | Supabase (Auth SSR + Postgres + RLS + Storage + Edge Functions)           |
| Base de données | PostgreSQL 15+ avec PostGIS + btree_gist                                  |
| Paiements       | Stripe (Checkout + Customer Portal + Webhooks via Edge Function Supabase) |
| Cartes          | MapLibre GL JS + Maptiler                                                 |
| Médias          | Sharp (compression images upload) + Supabase Image Transformations (variantes on-the-fly) |
| Vidéos          | YouTube/Vimeo embed (vitrines agences uniquement, pas sur les annonces)   |
| Python API      | FastAPI micro-service (estimation ML, scraping, analyse images, analytics, géocodage, NLP arabe, PDF) |
| Validation      | Zod                                                                       |
| i18n            | next-intl (4 locales : fr, ar, en, es)                                    |
| Monorepo        | Turborepo + pnpm workspaces                                               |
| Hébergement     | Vercel (web) + Supabase Cloud                                             |
| Tests           | Vitest (unit, 3 fichiers) + Playwright (E2E, 8 specs)                     |
| Polices         | Geist (latin) + IBM Plex Sans Arabic — chargées via next/font             |
| Observabilité   | Sentry (package installé mais non initialisé — à configurer ou retirer)   |
| Rate limiting   | Upstash Redis                                                             |
| Logging         | Pino                                                                      |
| Emails          | Resend (templates React JSX)                                              |
| Charts          | Recharts (Line, Donut, Bar)                                               |
| Drag-drop       | @hello-pangea/dnd (Kanban leads)                                          |
| CI/CD           | GitHub Actions (ci.yml + deploy.yml)                                      |

**Il n'y a PAS de route API dans `src/app/api/`** — les webhooks Stripe passent par `supabase/functions/stripe-webhook`. **Il n'y a PAS d'IA** — les fonctionnalités IA ont été supprimées. **Les emails transactionnels** passent par Resend (lib/email/).

-----

## Pipeline média

### Images — Sharp (upload) + Supabase Transformations (lecture)

**À l'upload** (Server Action dans `features/media/`) :
1. Réception du fichier (max 10MB, jpg/png/webp)
2. **Sharp** (Node.js, déjà inclus dans Next.js) traite l'image :
   - Redimensionner : max 2400px côté long (préserve ratio)
   - Convertir en **WebP** quality 85 (quasi sans perte, -60% taille vs JPEG)
   - Corriger l'orientation EXIF (photos smartphone pivotées)
   - Supprimer les métadonnées EXIF/GPS (vie privée)
   - Générer une **thumbnail** 400×300 WebP quality 75
3. Upload vers Supabase Storage (signed URL) : original + thumbnail
4. Stockage dans `listing_media` : `storage_path`, `content_type`, `width`, `height`, `file_size_bytes`

**À la lecture** (on-the-fly, zéro stockage supplémentaire) :
- Supabase Image Transformations via URL params :
  ```
  ?width=800&height=600&resize=cover&quality=80
  ```
- Utilisé pour : grille résultats (600×400), card dashboard (300×200), hero (1200×800)
- CDN cache automatique

**Résultat type :** Photo smartphone 5MB → ~200KB WebP. Zéro coût supplémentaire.

### Vidéos — Vitrines agences uniquement (pas sur les annonces)

**Les annonces n'ont PAS de vidéo.** Les vidéos sont réservées aux vitrines agences (thèmes).

**Flow (wizard vitrine, étape Médias) :**
1. L'agence colle une URL YouTube ou Vimeo dans le wizard vitrine (Settings > Apparence)
2. Server Action `extractVideoMetadata` appelle l'API **oEmbed** (gratuite) :
   - `https://www.youtube.com/oembed?url={url}&format=json`
   - `https://vimeo.com/api/oembed.json?url={url}`
3. Extraction : `thumbnail_url`, `title`
4. Stockage dans `agencies.storefront_content.hero_video_url`
5. Affichage : iframe embed responsive (`aspect-video`) dans la section Hero de la vitrine

**Validation URL :** Regex pour YouTube (`youtube.com/watch`, `youtu.be/`) et Vimeo (`vimeo.com/`). Rejet de tout autre domaine.

**Coût :** $0.

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
│   │   ├── auth/                             # Auth unique (routing intelligent post-login)
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── AqarPro/
│   │   │   └── dashboard/                    # CRM agence
│   │   │       ├── page.tsx                  # Overview + checklist onboarding
│   │   │       ├── listings/ (table, [id], new)
│   │   │       ├── leads/                    # KanbanBoard (desktop) / liste filtrable (mobile)
│   │   │       ├── visit-requests/           # Toggle liste/calendrier
│   │   │       ├── analytics/
│   │   │       ├── team/
│   │   │       ├── billing/
│   │   │       ├── messaging/                # Messagerie agence (conversations leads)
│   │   │       ├── notifications/            # Centre de notifications
│   │   │       ├── profil/                   # Profil personnel membre
│   │   │       ├── settings/                 # 4 tabs: Général, Apparence, Vérification, Notifications
│   │   │       └── branches/                 # Gestion succursales agence
│   │   ├── AqarChaab/
│   │   │   └── espace/                       # Espace particulier
│   │   │       ├── mes-annonces/
│   │   │       ├── deposer/                  # WizardListing mode individual (4 étapes)
│   │   │       ├── messagerie/
│   │   │       ├── alertes/
│   │   │       ├── favoris/                  # Favoris + collections (fusionnés)
│   │   │       ├── notifications/            # Centre de notifications
│   │   │       ├── historique/
│   │   │       ├── profil/
│   │   │       └── upgrade/
│   │   ├── search/                           # Marketplace (résultats + carte + comparaison inline)
│   │   ├── annonce/[slug]/                   # Détail annonce (ContactCard configurable + WhatsApp)
│   │   ├── a/[slug]/                         # Vitrine agence (route ou sous-domaine)
│   │   ├── agences/                          # Annuaire agences
│   │   ├── admin/                            # Super admin
│   │   │   ├── agencies/
│   │   │   ├── users/
│   │   │   ├── payments/
│   │   │   ├── verifications/
│   │   │   ├── moderation/                   # File d'attente modération annonces
│   │   │   ├── audit-logs/                   # Viewer audit trail
│   │   │   ├── platform-settings/            # Éditeur paramètres plateforme
│   │   │   ├── entitlements/                 # Feature flags par agence
│   │   │   └── profil/                       # Profil super admin
│   │   ├── deposer/                          # Wizard dépôt avec auth différée (étape 3)
│   │   ├── estimer/                          # Estimation prix (wizard 3 étapes)
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
│   │   ├── media/                            # Upload photos (Sharp + signed URLs + Storage) + vidéos (YouTube/Vimeo oEmbed)
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
│   │   │                                     # NeoBrutalist, MéditerranéenContemporain, PastelDoux, CorporateNavy,
│   │   │                                     # Editorial, ArtDeco, OrganiqueEco, SwissMinimal)
│   │   ├── marketplace/                      # ContactCard, SimilarListingsCarousel
│   │   ├── admin/                            # AdminSidebar
│   │   ├── brand/                            # AqarBrandLogo
│   │   ├── ui/                               # LanguageSwitcher, PhotoGallery, Lightbox,
│   │   │                                     # WilayaCommuneAutocomplete, DateRangePicker,
│   │   │                                     # BottomNav, DocumentUpload, VerificationBadge,
│   │   │                                     # ChartLine, ChartDonut, ChartBar
│   │   └── (root)                            # ErrorBoundary, LocaleHtmlSync, ThemeToggle
│   │
│   ├── lib/
│   │   ├── auth/                             # with-agency-auth.ts (RBAC), with-super-admin-auth.ts,
│   │   │                                     # get-cached-user.ts, get-agency-for-user.ts
│   │   ├── supabase/                         # client.ts, server.ts
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
│   ├── proxy.ts                              # Auth + i18n + sous-domaines agences + CSRF + headers sécurité (Next.js 16 : proxy remplace middleware)
│   ├── __tests__/unit/                       # 3 fichiers (sanitize, with-agency-auth, listing-schemas)
│   └── messages/                             # fr.json, ar.json, en.json, es.json (~30 KB chacun)
│
├── apps/web/__tests__/e2e/                   # 8 specs Playwright (homepage, auth, search, annonce,
│                                             # deposer, agences, listing-detail, subdomain)
├── apps/mobile/                              # Expo early-stage (13 fichiers, non actif)
├── services/python-api/                      # Micro-service FastAPI (estimation ML, scraping, analyse images, analytics, géocodage, NLP arabe, PDF)
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

**Statistiques cible :** 56 pages, 6 layouts (Marketing, Dashboard, Chaab, Admin, Auth Card, Vitrine), 28 loading skeletons, 15 modules features (~200 fichiers), 50+ composants partagés, 25 fichiers lib, 4 locales, 10 thèmes agences. **Existant :** 10 migrations SQL, 1 Edge Function, 1 package config, 1 spike mobile.

-----

## Routes par surface (56 pages)

| Surface | Routes | Description |
|---------|--------|-------------|
| **AqarSearch** | `/search` (+ comparaison inline + filtre `?agency=`), `/annonce/[slug]`, `/a/[slug]`, `/agences`, `/estimer` | Marketplace publique (5 pages) |
| **AqarPro** | `/AqarPro/dashboard/*` (overview, listings, leads, visit-requests, analytics, team, billing, messaging, notifications, profil, settings, branches) | CRM agence (16 sous-pages incluant sous-routes listings) |
| **AqarChaab** | `/AqarChaab/espace/*` (mes-annonces, deposer, messagerie, alertes, favoris, notifications, historique, profil, upgrade) | Espace particulier (9 sous-pages) |
| **Marketing** | `/` (8 sections), `/pricing`, `/pro`, `/vendre`, `/deposer` (wizard avec auth différée) | Homepage + landing pages (5 pages) |
| **Admin** | `/admin/*` (agencies, users, payments, verifications, moderation, audit-logs, platform-settings, entitlements, profil) | Super-administration (9 sous-pages) |
| **Auth** | `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/agency/new`, `/invite/[token]` | Auth unique avec routing intelligent (6 pages) |

> **Auth unique :** Plus de login/signup séparés Pro/Chaab. Un seul flux → routing post-login : membership agence → AqarPro, end_user → AqarChaab, les deux → sélecteur de surface. Switcher Pro/Chaab dans le header.

-----

## Homepage — 8 sections

La homepage doit **inspirer** et donner envie d'explorer. La confiance est **implicite** (design premium, badges sur les annonces, qualité des photos) — pas de bloc "Faites-nous confiance" dédié.

1. **Hero + SearchBar** (100vh) — Photo immersive Algérie (côte méditerranéenne, architecture), gradient overlay, headline audacieuse, barre de recherche intégrée (autocomplete wilayas), subtitle. Animation staggered fade-in.

2. **Annonces en vedette** (8 cards) — Tabs : Vente | Location | Vacances. Chaque carte : photo 16/10, prix large, localisation (pill amber), titre, badge `VerificationBadge` si agence vérifiée = confiance implicite. Lien vers `/annonce/[slug]`.

3. **Editorial Split** (texte + photo) — Layout 45/55 asymétrique. Côté texte : fond sombre, eyebrow + H2 + paragraphe inspirant + lien amber avec flèche. Côté image : photo plein cadre (architecture algérienne, lumière méditerranéenne). Pas de pitch commercial.

4. **Wilaya Scroller** — Scroll horizontal, snap-x, cartes fixes (36w lg:44w), border-radius 2xl. 8 wilayas populaires avec photo + overlay nom + count annonces. Flèches navigation desktop, swipe mobile.

5. **Region Cards** (3 colonnes) — Sahara, Littoral, Montagne. Hauteur 220px, photo fond + gradient overlay, texte overlay. Hover : scale + shadow. Lien vers `/search?region=...`.

6. **Comment ça marche** (3 étapes) — Icônes + texte court : Cherchez → Contactez → Visitez. Illustrations simples, animation fade-in au scroll.

7. **Stats Strip** (fond sombre) — 4 colonnes centrées, nombres larges bold (amber), labels. Compteurs animés via IntersectionObserver. Exemples : "X annonces", "X agences vérifiées", "X wilayas", "X utilisateurs". La mention "vérifiées" = confiance implicite.

8. **CTA Pro** (centré) — Padding py-20 lg:py-28. H2 avec mot-clé amber. "Vous êtes agence ? Digitalisez votre activité avec AqarPro". Bouton → `/pro`.

-----

## Patterns d'architecture

### Feature module

Chaque module dans `src/features/` suit : `actions/` (Server Actions `"use server"`) → `schemas/` (Zod) → `services/` (logique métier, reçoit SupabaseClient) → `components/` (React) → `types/` (DTOs) → `hooks/` (si nécessaire).

### Server Action — flux obligatoire

Valider l'input via Zod (avec `.transform(sanitizeInput)` sur les champs texte libre) → résoudre l'acteur via `withAgencyAuth` ou `withSuperAdminAuth` → appeler le service → retourner `ActionResult<T>` via `ok(data)` ou `fail("CODE", "message")` → `revalidatePath`/`revalidateTag` si nécessaire. Utiliser `"use cache"` (Next.js 16) pour le cache explicite des pages et composants.

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
| **admin** | CRUD | CRU | — | R | CRU | CRUD | CRUD |
| **agent** | CRU | R | — | — | R | R | CRU |
| **editor** | RU | R | — | — | R | R | CRU |
| **viewer** | R | R | — | — | — | R | R |

### Proxy (ex-middleware, renommé en Next.js 16)

Fichier : `proxy.ts` (Next.js 16 renomme `middleware.ts` → `proxy.ts` pour clarifier le rôle réseau/routing).

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
| `profiles` | Profils utilisateurs (first_name, last_name, phone, avatar_url, role, preferred_locale, stripe_customer_id) |
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

## Design System — "Stone"

**Philosophie :** "Pierre chaude meets mer Méditerranée" — Airbnb (chaleur du foyer), Stripe (précision), identité algérienne (terre, soleil, mer). Voir `references/design-tokens.md` pour les specs complètes.

### Palette (tailwind.config.ts)

- **Neutres :** Stone 50-950 (gris beige chaud, sous-ton terre)
- **Accent principal :** Teal 600 (#0D9488) — CTA, liens, focus, éléments actifs
- **Accent secondaire :** Amber 400 (#FBBF24) — touches chaudes ponctuelles, badges, notifications
- **Sémantique :** success (green), warning (amber), danger (red), info (blue) — chacun avec ghost variant (8% opacity)
- **Tricolore :** `sahara` #E8920A (or), `med` #1A7FA8 (bleu), `atlas` #2A8A4A (vert)
- **Immobilier :** `listing-sale` (blue), `listing-rent` (purple), `listing-vacation` (amber)
- **Statut annonce :** draft (stone-500), pending (amber), published (green), paused (stone-400), rejected (red), sold (blue)

### Tokens CSS

~60 CSS custom properties dans `globals.css`, toutes avec valeurs light ET dark. Voir `references/design-tokens.md` section "Tokens semantiques CSS".

### Composants UI (30+)

25 primitives documentées dans `references/component-library.md` avec matrice d'états (7 états), dark mode, accessibilité ARIA, keyboard nav. Voir la liste complète dans ce fichier.

### Polices

Geist (display + body), IBM Plex Sans Arabic + Noto Sans Arabic (arabe), Geist Mono (code).

### Dark mode

Via `data-theme="dark"` sur `<html>`, persisté en cookie + localStorage. Configuration Tailwind : `darkMode: ['selector', '[data-theme="dark"]']`. Chaque token CSS a sa valeur dark. Chaque classe Tailwind a sa paire `dark:`.

### 10 thèmes vitrines agences

LuxeNoir, Méditerranée, NeoBrutalist, MéditerranéenContemporain, PastelDoux, CorporateNavy, Editorial, ArtDeco, OrganiqueEco, SwissMinimal. Chacun est un composant React complet (200-310 lignes) dans `components/agency/themes/`, avec palette, typographie, layout et dark mode propres. Configurés dans `lib/themes/registry.ts`. Specs détaillées dans `references/agency-themes.md`.

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
RESEND_API_KEY                    # re_... (emails transactionnels)
PYTHON_API_URL                    # URL micro-service Python FastAPI
PYTHON_API_SECRET                 # Token auth pour endpoints admin Python
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

## Spécificités Next.js 16

- **`proxy.ts`** remplace `middleware.ts` — même fonctionnalité, nom clarifié
- **Turbopack** est le bundler par défaut (dev + prod) — pas besoin de `--turbopack`
- **React Compiler** stable — memoization automatique, NE PAS utiliser `useMemo`/`useCallback` manuellement (le compilateur le fait)
- **`"use cache"`** directive — pour le cache explicite de pages, composants et fonctions. Remplace l'usage extensif de `revalidatePath`/`revalidateTag`
- **View Transitions** — utiliser `<ViewTransition>` pour les animations de navigation entre pages
- **Activity** — utiliser `<Activity mode="hidden">` pour pré-rendre du contenu en arrière-plan sans impact perf
- **React 19.2** — `useEffectEvent` pour extraire la logique non-réactive des Effects
- **Layout deduplication** — les layouts partagés entre liens sont téléchargés 1× (perf réseau, critique pour 3G/4G algérien)
- **Async Request APIs** — tout accès aux headers/cookies/params est async (pas de sync fallback)

-----

## Conventions

- **Fichiers utilitaires :** `kebab-case.ts`.
- **Composants :** `PascalCase.tsx`.
- **Suffixes obligatoires :** `*.service.ts`, `*.action.ts`, `*.schema.ts`, `*.types.ts`.
- **Server Components par défaut** — `"use client"` uniquement si interactivité requise.
- **Imports absolus** avec `@/` prefix.
- **Validation input** via Zod + `sanitizeInput` sur champs texte libre.
- **Pas de `useMemo`/`useCallback` manuels** — le React Compiler s'en charge (Next.js 16).

-----

## Composants critiques (specs détaillées)

Ces composants ne sont pas de simples primitives — ils nécessitent une spec car leur logique est complexe.

### PhotoGallery + Lightbox (`components/ui/`)

- **PhotoGallery** : grille hero (image principale 16/9 + 4 thumbnails), clic ouvre Lightbox
- **Lightbox** : overlay plein écran, navigation flèches ← →, compteur "3/12", swipe mobile, fermeture Escape/clic overlay, lazy-load images, `prefers-reduced-motion` respecté
- Props : `images: { src: string; alt: string; width: number; height: number }[]`
- Utilise `next/image` avec `fill` + `sizes`, pas de `<img>`

### WilayaCommuneAutocomplete (`components/ui/`)

- Combobox accessible (aria-combobox) pour sélectionner wilaya (58) puis commune (1 541)
- Recherche locale (pas d'API) — filtre sur `wilayas.json` et `communes.json` de `lib/geodata/`
- Props : `onSelect: (wilayaCode: string, communeId: number) => void`, `defaultValue?`
- Supporte FR/AR (noms bilingues), keyboard nav (↑↓ Enter Escape)
- Utilisé dans : wizard dépôt, recherche, listing detail form, estimation

### KanbanBoard (`features/leads/components/`)

- **Desktop :** 4 colonnes : new → contacted → qualified → closed (enum `lead_status`)
- Drag-drop entre colonnes (bibliothèque : `@hello-pangea/dnd`)
- Carte lead : nom, source (badge), listing lié, `heat_score` (jauge visuelle 0-100), date
- Clic carte → drawer latéral avec timeline, notes JSONB, actions (changer statut, assigner, noter)
- Server Action `updateLeadStatus` au drop
- **Mobile :** fallback liste filtrable avec tabs (New | Contacted | Qualified | Closed). Changement de statut via dropdown/action sheet, pas drag-drop (inutilisable sur tactile)

### CalendarView (`features/visit-requests/components/`)

- Toggle list/calendrier sur la page visit-requests
- Vue semaine (desktop) / jour (mobile)
- Créneaux colorés par statut : pending (amber), confirmed (green), completed (stone), cancelled (red)
- Clic créneau → drawer avec détails + actions (confirmer, reprogrammer, annuler)
- Pas de lib externe lourde — grille CSS custom (7 colonnes × 12 lignes horaires)

### ContactCard (`components/marketplace/`)

- Sidebar sticky sur le détail annonce (côté droit, 35% largeur desktop). Mobile : sous le contenu
- Contenu : avatar agent, nom agence, `VerificationBadge`, lien "Voir toutes les annonces de cette agence" (`/search?agency=[slug]`)
- **Ordre des boutons configurable par l'agence** (champ `agencies.contact_button_order` JSONB). Défaut :
  1. **Appeler** (primaire, large, amber) : `tel:` protocol pour appel direct mobile. `show_phone = true` par défaut
  2. **WhatsApp** (secondaire) : `wa.me/213XXXXXXXXX?text=Bonjour, je suis intéressé par [titre annonce]`
  3. **Message** (tertiaire) : formulaire inline (nom, téléphone, message) → Server Action `createLead`
  4. **Demander visite** : modal avec DatePicker → Server Action `createVisitRequest`
- **Lead sans authentification** : le formulaire Message et Visite fonctionnent SANS compte. Champs : nom + téléphone + message. Lead créé en DB, lié au profil si l'utilisateur s'inscrit plus tard
- Bouton partage WhatsApp sur le détail annonce (en plus du ContactCard)

### SimilarListingsCarousel (`components/marketplace/`)

- Carousel horizontal (scroll snap) de 4-6 annonces similaires
- Critères similarité : même wilaya + même property_type + fourchette prix ±30%
- Query via Supabase RPC ou service `getSimilarListings`
- Chaque carte : photo, prix, surface, localisation, lien vers `/annonce/[slug]`

### Charts : ChartLine, ChartDonut, ChartBar (`components/ui/`)

- Bibliothèque : **Recharts** (léger, React natif, SSR-compatible)
- `ChartLine` : analytics (vues/leads/contacts dans le temps), axe X dates, tooltip
- `ChartDonut` : répartition (sources leads, types annonces), légende
- `ChartBar` : comparaison (listings par statut, revenus par mois)
- Responsive, dark mode (couleurs adaptées via tokens), `prefers-reduced-motion`

### DateRangePicker (`components/ui/`)

- Sélection période (7j, 30j, 90j, 12m, personnalisé)
- Deux inputs date (début/fin) avec calendrier dropdown
- Utilisé dans : analytics, audit logs admin, billing history
- Props : `onChange: (range: { from: Date; to: Date }) => void`, `presets?: string[]`

### BottomNav (`components/ui/`)

Barre de navigation fixe en bas pour mobile. Caché sur desktop (`md:hidden`). **Deux variantes :**

**AqarChaab (4 items) :**
- Annonces | **Déposer** (CTA central surélevé, bg-amber, icône +) | Messages | Profil
- Badge compteur sur Messages (non-lus)
- Alertes, Collections, Historique accessibles depuis Profil ou drawer "Plus"

**AqarPro (5 items) :**
- Dashboard | Annonces | Leads | Messages | Plus (drawer avec : Visites, Analytics, Team, Billing, Settings)
- Badge compteur sur Messages et Leads (nouveaux)

### DocumentUpload (`components/ui/`)

- Upload de documents légaux (acte, livret_foncier, promesse, cc)
- Drag-drop zone + bouton parcourir, validation type (PDF, JPG, PNG), max 10 MB
- Upload vers Supabase Storage via signed URL (même pattern que `features/media/`)
- Affichage liste avec icône type, nom fichier, taille, bouton supprimer
- Toggle `is_public` par document

### ThemeStudio (`features/agency-settings/components/`)

Composant en 2 parties : **choix du thème** (tab Apparence dans Settings) + **wizard contenu vitrine**.

**Partie 1 — Choix thème (Settings > Apparence) :**
- Sélection parmi 10 thèmes prédéfinis (aperçu miniature cliquable)
- Personnalisation couleurs : `primary_color`, `accent_color`, `secondary_color` via color pickers
- Upload logo + cover image (vers Supabase Storage)
- Preview live du thème avec les couleurs personnalisées
- Sauvegarde vers `agencies` table

**Partie 2 — Wizard contenu vitrine (4 étapes) :**

Le wizard est accessible depuis Settings > Apparence via un bouton "Personnaliser ma vitrine". Maximum d'automatisation — 80% des données viennent de ce que l'agence a déjà rempli.

**Données auto-remplies (pas demandées) :**
- Nom agence → Hero titre (depuis `agencies.name`)
- Description → About texte (depuis `agencies.description`)
- Téléphone, WhatsApp, email → CTA (depuis `agencies`)
- Logo → Nav/Hero (depuis `agencies.logo_url`)
- Annonces publiées → Grille listings (query `listings` auto)
- Stats → compteurs auto (depuis `agency_stats_daily`)
- Badge vérification → Hero/Nav (depuis `verifications.level`)
- Horaires, réseaux sociaux → CTA/Footer (depuis `agencies`)

**Étape 1 — Médias :**
- Photo hero (upload, min 1920×800, obligatoire)
- Photos supplémentaires (2-4 photos pour mosaïque/galerie, optionnel)
- Vidéo de présentation (URL YouTube/Vimeo, optionnel)

**Étape 2 — Textes :**
- Slogan/tagline (max 80 chars, pré-rempli depuis `description` tronquée)
- Texte About (max 500 chars, pré-rempli depuis `description`)
- Services/valeurs : 3-4 items (titre + icône Lucide + texte court), optionnel

**Étape 3 — Stats personnalisées + Extras thème :**
- Années d'expérience (number, optionnel)
- Clients satisfaits (number, optionnel)
- Les stats auto (annonces, vues, leads) sont toujours affichées
- **Champs supplémentaires par thème** (affichés dynamiquement selon le thème choisi) :
  - LuxeNoir : tagline dorée secondaire
  - NeoBrutalist : manifesto (texte court bold XXL)
  - CorporateNavy : horaires topbar (pré-rempli)
  - Editorial : eyebrow text ("Depuis 2010")
  - OrganiqueEco : certifications éco (badges texte)
  - Autres thèmes : pas d'extras

**Étape 4 — Preview :**
- Preview live complète de la vitrine avec toutes les données
- Bouton "Publier ma vitrine"

**Stockage :** `agencies.storefront_content` JSONB :
```json
{
  "hero_image_url": "...",
  "hero_video_url": "https://youtube.com/...",
  "extra_photos": ["url1", "url2"],
  "tagline": "Votre partenaire immobilier de confiance",
  "about_text": "...",
  "services": [
    { "title": "Vente", "icon": "home", "text": "..." },
    { "title": "Location", "icon": "key", "text": "..." }
  ],
  "custom_stats": { "years_experience": 15, "satisfied_clients": 500 },
  "theme_extras": { "eyebrow": "Depuis 2010" }
}
```

### VerificationBadge (`components/ui/`)

- Badge de confiance agence, affiché sur : cartes annonces, détail annonce ContactCard, vitrine agence, annuaire agences
- 4 niveaux visuels : niveau 1 (basique, stone), niveau 2 (vérifié, blue), niveau 3 (certifié, green), niveau 4 (premium, amber/gold)
- Props : `level: 1 | 2 | 3 | 4`, `size?: 'sm' | 'md'`
- Tooltip au hover avec label du niveau

### PriceHistoryChart (`features/analytics/components/`)

- Graphique ligne montrant l'évolution du prix d'une annonce dans le temps
- Données : table `listing_price_versions` (SCD2, valid_during tstzrange)
- Affiché dans : détail annonce **public** (`/annonce/[slug]`), détail annonce (dashboard agence), analytics agence
- Marqueurs pour chaque changement avec raison
- Les baisses de prix visibles publiquement augmentent la confiance des acheteurs

### WizardListing (`features/listings/components/`)

Composant unique pour le dépôt d'annonce, utilisé par AqarPro ET AqarChaab.

```typescript
type WizardMode =
  | { type: 'agency'; agencyId: string }
  | { type: 'individual'; userId: string }

interface WizardListingProps {
  mode: WizardMode
  listingId?: string  // mode édition
}
```

**Mode agency (7 étapes) :** Type → Catégorie → Localisation → Détails → Description multi-locale (tabs FR/AR/EN/ES) → Photos + Documents légaux → Prix & Récap

**Mode individual (4 étapes) :** (1) Quoi & Où (type + catégorie + wilaya + commune) → (2) Détails & Description → (3) Photos → (4) Prix & Récap

**Comportements communs :**
- Auto-save debounce 3s → Server Action `saveDraft` (upsert listing status=draft)
- **localStorage backup** à chaque étape (réseau algérien instable — si la connexion coupe, rien n'est perdu)
- Gestion conflit : optimistic locking via `listings.version`
- Indicateur visuel "Sauvegardé ✓" / "Sauvegarde..."
- Progress bar en haut
- Previous/Next navigation
- Récapitulatif final avant publication

### MessagingView (`features/messaging/components/`)

Composant partagé entre AqarPro et AqarChaab.

- **Desktop :** Split view — liste conversations (gauche, 35%) + thread actif (droite, 65%)
- **Mobile :** Full-width liste, clic → full-width thread avec bouton retour
- Real-time : Supabase Realtime subscription sur table `messages`
- AqarPro : filtres supplémentaires par agent assigné et par listing
- Badge non-lus, indicateur "en ligne", timestamps
- Input message en bas avec bouton envoyer

### ProfileForm (`features/auth/components/`)

Composant partagé entre AqarPro (`/dashboard/profil`) et AqarChaab (`/espace/profil`).

- Sections : Infos personnelles (nom, email, téléphone, avatar upload, wilaya) → Mot de passe (ancien + nouveau + confirmation) → Préférences notifications (toggles) → Langue préférée
- AqarChaab : section supplémentaire "Supprimer mon compte" (zone danger)
- Server Action `updateProfile` + `updatePassword` (via Supabase Auth)

-----

## Flux utilisateur détaillés

### 1. Paiements individuels (non-Stripe)

Providers : CIB (carte bancaire algérienne), Dahabia (carte postale), BaridiMob (mobile), virement bancaire.

**Flow :**
1. Particulier choisit pack/abonnement sur `/AqarChaab/espace/upgrade`
2. Sélection provider → redirection vers page de paiement externe (CIB/Dahabia gateway) ou instructions virement
3. Pour CIB/Dahabia : callback URL de retour avec transaction_id → Server Action `verifyExternalPayment`
4. Pour virement : upload preuve de paiement (reçu bancaire) → statut `pending_verification`
5. Admin vérifie manuellement sur `/admin/payments` → approuve/rejette → mise à jour `individual_payments.payment_status`
6. Notification email au particulier (résultat)

**Tables :** `individual_listing_packs`, `individual_subscriptions`, `individual_payments`
**Provider config :** `platform_settings` (clés : `cib_merchant_id`, `dahabia_api_key`, `baridimob_api_key`)

### 2. Modération annonces

**Flow :**
1. Annonce soumise → `listing_status = pending_review` (si `platform_settings.agency_listing_moderation = true`)
2. File d'attente sur `/admin/moderation` : liste triée par date, filtres (type, wilaya, owner_type)
3. Admin ouvre l'annonce → preview complète (photos, description, documents, prix)
4. Actions : Approuver (`published`) | Rejeter (raison obligatoire) | Cacher (temporaire)
5. Résultat enregistré dans `listing_moderation_history` + `listing_status_versions`
6. Email notification à l'agence/particulier avec raison si rejeté
7. Compteur annonces en attente dans `AdminSidebar`

### 3. Vérification agence (4 niveaux)

| Niveau | Conditions | Badge |
|--------|-----------|-------|
| 1 — Basique | Inscription complète, email vérifié | Gris |
| 2 — Vérifié | RC (registre commerce) uploadé et validé | Bleu |
| 3 — Certifié | RC + NIF + adresse physique vérifiée | Vert |
| 4 — Premium | Niveau 3 + ancienneté > 1 an + 0 plainte | Or |

**Flow upload :**
1. Agence va dans `/AqarPro/dashboard/settings/verification`
2. Upload documents (RC, NIF, preuve adresse) via `DocumentUpload`
3. Soumission → `verifications.status = pending`
4. Admin review sur `/admin/verifications` → approve/reject (raison)
5. Badge mis à jour, affiché partout via `VerificationBadge`
6. Expiration annuelle → notification de renouvellement

### 4. Invitation équipe

**Flow :**
1. Admin/Owner sur `/AqarPro/dashboard/team` → bouton "Inviter"
2. Formulaire : email + rôle (owner, admin, agent, editor, viewer)
3. Server Action `createInvitation` → token UUID généré, stocké dans `agency_invites`, expire 7 jours
4. Email envoyé via Resend avec lien `/invite/[token]`
5. Destinataire clique → page d'acceptation → `acceptInvitation` Server Action
6. Si pas de compte → redirigé vers signup avec token pré-rempli
7. Si déjà membre → erreur "Vous êtes déjà membre de cette agence"

### 5. Alertes recherche (V2 uniquement)

> **Décision :** `saved_searches` (V1) est déprécié. Seule `search_alerts` (V2) est utilisée.

**Flow :**
1. Sur `/search`, bouton "Sauver cette recherche" (visible si authentifié)
2. Modal : nom de l'alerte + fréquence (instant, daily, weekly)
3. Filtres actuels sérialisés en JSONB → `search_alerts.filters`
4. Gestion sur `/AqarChaab/espace/alertes` : toggle actif/inactif, modifier fréquence, supprimer
5. Déclenchement : Supabase Edge Function CRON ou webhook on new listing → match filters → email via Resend
6. Email contient les N nouvelles annonces matchant + lien vers la recherche

### 6. Auto-save brouillon

**Pattern :**
- Debounce 3 secondes après dernière modification d'un champ
- Server Action `saveDraft` : upsert listing avec `status = draft`
- Indicateur visuel dans le wizard : "Brouillon sauvegardé ✓" / "Sauvegarde..." (spinner)
- Données persistées : tous les champs remplis, même partiels
- Au retour (refresh, navigation retour) : pré-remplissage automatique depuis le brouillon
- Gestion conflit : optimistic locking via `listings.version` (incrémenté à chaque save)

### 7. Auth unique et routing intelligent

> **Décision :** Plus de login/signup séparés Pro/Chaab. Un seul flux d'auth.

**Inscription (`/auth/signup`) :**
- Formulaire (6 champs) :
  - Prénom (`first_name`) — obligatoire
  - Nom (`last_name`) — obligatoire
  - Email — obligatoire
  - Téléphone — obligatoire
  - Mot de passe — obligatoire (min 8 caractères)
  - Confirmation mot de passe — obligatoire (validation Zod `refine` match)
- Les métadonnées `first_name`, `last_name`, `phone` sont passées via `auth.signUp({ options: { data: { first_name, last_name, phone } } })` puis récupérées par le trigger `handle_new_user`
- Optionnel (step 2 après signup) : "Vous êtes une agence ?" → lien vers `/agency/new`
- Redirect post-signup : `/AqarChaab/espace/mes-annonces` par défaut

**Login (`/auth/login`) :**
- Formulaire : email + mot de passe + "Se souvenir de moi" + lien "Mot de passe oublié"
- Redirect post-login (middleware) :
  1. Si `agency_memberships` existe → `/AqarPro/dashboard`
  2. Si end_user seulement → `/AqarChaab/espace/mes-annonces`
  3. Si les deux → sélecteur de surface ("Continuer en tant que [Agence] ou [Nom personnel]")
- **Switcher Pro/Chaab** persistant dans le header pour les utilisateurs ayant les deux rôles

### 8. `/deposer` avec auth différée

**Flow :**
1. Utilisateur arrive sur `/deposer` (depuis `/vendre`, homepage, ou directement)
2. L'étape 1 du wizard s'affiche IMMÉDIATEMENT (choix type + catégorie + localisation) — pas de login requis
3. Les données sont sauvées en **localStorage** (pas de Server Action, pas de DB)
4. À l'étape 3 (détails) : prompt d'authentification → modal login/signup inline
5. Après auth : les données localStorage sont restaurées dans le wizard
6. Si auth → membership agence : redirect vers `/AqarPro/dashboard/listings/new` avec pré-remplissage
7. Si auth → end_user : continue sur `/AqarChaab/espace/deposer` avec pré-remplissage
- **Objectif :** maximiser l'engagement avant de demander l'auth (pattern LeBonCoin/Vinted)

### 9. Lead sans authentification

**Flow contact (depuis ContactCard sur `/annonce/[slug]`) :**
1. Visiteur non-authentifié remplit le formulaire inline : nom + téléphone + message
2. Server Action `createAnonymousLead` → crée un `lead` en DB avec `sender_user_id = null`
3. Si le visiteur crée un compte plus tard avec le même email/téléphone, le lead est lié automatiquement
4. L'agence reçoit le lead normalement dans son Kanban (source = "platform")
5. Idem pour les demandes de visite

**Avantage :** chaque friction supprimée = plus de leads = plus de valeur pour les agences = plus de raisons de payer un abonnement

### 10. Onboarding agence (checklist progressive)

> **Décision :** Pas de wizard bloquant. L'agence accède directement au dashboard.

**Inscription agence (`/agency/new`) :**
- Formulaire minimal : nom agence + email + mot de passe + wilaya
- Auto-enroll sur plan Starter (trial gratuit 14 jours)
- Redirect → `/AqarPro/dashboard`

**Dashboard overview :**
- Banner persistent "Complétez votre profil" avec progress bar (N/5 étapes)
- Checklist items (chaque item = lien vers la page concernée) :
  1. ☐ Ajouter un logo et une description → `/dashboard/settings` (tab Apparence)
  2. ☐ Publier votre première annonce → `/dashboard/listings/new`
  3. ☐ Inviter un membre de l'équipe → `/dashboard/team`
  4. ☐ Personnaliser votre vitrine → `/dashboard/settings` (tab Apparence)
  5. ☐ Choisir votre plan → `/dashboard/billing`
- **Tracking :** `agencies.onboarding_progress` JSONB `{ logo: true, first_listing: false, ... completed_at: null }`
- Banner disparaît quand `completed_at != null` ou manuellement fermé

### 8. Lead scoring (heat_score)

**Algorithme (calculé par Server Action ou RPC à chaque interaction) :**

| Signal | Points |
|--------|--------|
| Contact créé < 24h | +30 |
| Contact créé < 7j | +15 |
| ≥ 3 messages échangés | +20 |
| Demande de visite | +25 |
| Budget ≥ prix listing | +10 |
| Source = platform (vs whatsapp/phone) | +5 |
| Lead qualifié manuellement | +20 |

Score max = 100, capé. Recalculé à chaque nouveau message, visite, ou changement de statut.
Affiché dans le Kanban (jauge colorée : 0-30 froid/bleu, 31-60 tiède/amber, 61-100 chaud/red).

### 9. Traductions annonces

**Flow dans le wizard listing (étape "Description") :**
- Tabs par locale : FR (obligatoire), AR, EN, ES (optionnels)
- Champs par tab : titre (input), description (textarea), slug (auto-généré, éditable)
- Slug auto : `slugify(title)` + suffixe locale si non-FR (ex: `villa-alger`, `villa-alger-ar`)
- Validation : slug unique par locale dans `listing_translations` (contrainte UNIQUE `listing_id + locale`)
- Sauvegarde : une entrée `listing_translations` par locale remplie
- Affichage : la locale du visiteur détermine quelle traduction afficher, fallback FR → EN

### 10. Emails transactionnels

**Provider :** Resend (API simple, bon DX, pricing correct).
**Env var :** `RESEND_API_KEY`

| Template | Déclencheur | Contenu |
|----------|------------|---------|
| `welcome` | Inscription (handle_new_user trigger) | Bienvenue + lien dashboard |
| `team-invite` | Server Action createInvitation | Lien `/invite/[token]`, nom agence, rôle |
| `alert-match` | CRON/webhook new listing | N annonces matchant, lien recherche |
| `visit-confirmed` | Admin confirme visite | Date, adresse, contact agence |
| `moderation-result` | Admin approuve/rejette | Statut + raison si rejeté |
| `password-reset` | Supabase Auth (configuré via dashboard) | Lien reset |
| `payment-receipt` | Webhook Stripe / vérification admin | Montant, plan, date |

**Implémentation :** `lib/email/send.ts` wrapper Resend, templates React (JSX) dans `lib/email/templates/`.

-----

## Décisions architecturales

| Question | Décision | Justification |
|----------|----------|---------------|
| `saved_searches` (V1) vs `search_alerts` (V2) | **V2 uniquement** — `saved_searches` déprécié | V2 a frequency + is_active + last_sent_at, strictement supérieur |
| `chatbot_leads` — garder ? | **Oui** — widget formulaire basique (pas d'IA) | La table existe, un formulaire de capture de lead sur les vitrines agences est utile |
| `domain_events` — usage ? | **Audit interne** — alimenté par triggers, pas de UI | Sert de journal d'événements pour debug/compliance, pas besoin d'interface |
| Branche CI/CD | **`master`** partout | Aligner ci.yml et deploy.yml sur la branche primaire du repo |
| Sentry | **Initialiser** | Package déjà installé, configurer dans `instrumentation.ts` (Next.js 16) |
| Pino logging | **Initialiser** dans `lib/logger/` | Wrapper existant mentionné, créer l'instance + usage dans Server Actions |
| Rich text descriptions | **Non** — textarea simple | Pas de Tiptap/markdown, éviter la complexité. Texte brut suffit pour le marché algérien |
| Provider emails | **Resend** | API simple, templates React, pricing tier gratuit suffisant pour le lancement |
| Bibliothèque charts | **Recharts** | Léger, React natif, SSR-compatible, large communauté |
| Bibliothèque drag-drop | **@hello-pangea/dnd** | Fork maintenu de react-beautiful-dnd, léger |
| Auth Pro/Chaab | **Auth unique** — `/auth/login` + `/auth/signup` avec routing intelligent | Anti-pattern d'avoir 5 pages auth. Un utilisateur peut être agent ET particulier |
| CTA contact principal | **Appeler** (configurable par agence) | Culture algérienne : l'appel téléphonique est le réflexe #1 pour l'immobilier |
| WhatsApp | **Intégré** — contact + partage | Canal dominant en Algérie, `wa.me/` API simple |
| Lead sans auth | **Oui** — formulaire contact sans compte | Chaque friction = lead perdu = moins de revenus agences |
| Confiance | **Implicite** — via design premium + badges, pas de bloc dédié | Plus élégant et efficace qu'un bloc "Faites-nous confiance" |
| `/comparer` | **Feature inline** dans `/search` | Page morte sans entry point naturel |
| `/favorites` | **Fusionné** dans `/espace/favoris` (AqarChaab) | Même feature, même mental model utilisateur |
| Onboarding agence | **Checklist progressive** sur dashboard | Wizard bloquant empêche l'exploration du produit |
| Wizard particuliers | **4 étapes** (vs 7 pour agences) | Mobile + réseau algérien + cible < 5 min |
| Homepage | **8 sections** inspirationnelles, confiance implicite | Ni trop court (pas assez attrayant) ni trop long (scroll fatigue) |
| BottomNav | **AqarPro ET AqarChaab** ont chacun un BottomNav mobile | Agents sur le terrain, particuliers mobile-first |
| Settings agence | **4 tabs** : Général, Apparence (branding fusionné), Vérification, Notifications | Branding = sous-ensemble d'Apparence |
| `/admin/settings` | **Renommé** `/admin/profil` | Évite confusion avec `/admin/platform-settings` |

-----

## Spécification des formulaires

> Chaque formulaire liste ses champs exacts, types, validations Zod, et colonnes DB correspondantes. Regex téléphone algérien : `^(\+213|0)[5-7][0-9]{8}$`. Tous les champs texte libre passent par `sanitizeInput`. Erreurs affichées inline sous chaque champ.

### Inscription (`/auth/signup`)
Prénom (`first_name`, min 2) — Nom (`last_name`, min 2) — Email (`.email()`) — Téléphone (regex algérien) — Mot de passe (min 8, 1 majuscule, 1 chiffre) — Confirmation MDP (`.refine(match)`). Toggle visibilité MDP, indicateur force MDP. Metadata passée via `auth.signUp({ options: { data: { first_name, last_name, phone } } })`.

### Connexion (`/auth/login`)
Email — Mot de passe — Se souvenir de moi (checkbox). Erreur globale "Email ou mot de passe incorrect" (ne jamais préciser lequel). Lien "Mot de passe oublié ?".

### Mot de passe oublié (`/auth/forgot-password`)
Email. Message identique que l'email existe ou non. Rate limiting 3/10min.

### Reset MDP (`/auth/reset-password`)
Nouveau MDP (min 8) — Confirmation.

### Création agence (`/agency/new`)
Nom agence (min 3) — Slug (auto-généré, vérification async unique) — Email agence — Téléphone agence — Wilaya (autocomplete) — Commune. Si pas de compte : combiné avec inscription (12 champs total). Crée agence + branche siège + membership owner.

### Settings agence — Général
Nom — Description (textarea max 1000) — Email — Téléphone — Adresse (via branche siège) — Wilaya — Commune — WhatsApp (`agencies.whatsapp_phone`) — Horaires (`agencies.opening_hours`) — Facebook URL — Instagram URL. Auto-save debounce 3s.

### Settings agence — Apparence
Thème (radio cards 10 options) — Couleur principale (color picker) — Couleur accent — Couleur secondaire — Logo (upload max 2MB) — Cover (upload max 5MB, min 1200×400). Preview live. Bouton "Personnaliser ma vitrine" → ouvre le wizard contenu vitrine.

### Wizard contenu vitrine (4 étapes, depuis Settings > Apparence)
**É1 Médias :** Photo hero (upload min 1920×800, obligatoire) — Photos supplémentaires (2-4, optionnel) — Vidéo présentation (URL YouTube/Vimeo OU upload mp4 max 50MB, optionnel). **É2 Textes :** Slogan (max 80 chars, pré-rempli depuis description) — Texte About (max 500, pré-rempli) — Services/valeurs (3-4 items : titre + icône Lucide + texte, optionnel). **É3 Stats + Extras :** Années expérience (number) — Clients satisfaits (number) — Stats auto toujours affichées — Extras dynamiques par thème (LuxeNoir: tagline dorée, NeoBrutalist: manifesto, CorporateNavy: horaires topbar, Editorial: eyebrow, OrganiqueEco: certifications éco). **É4 Preview :** Preview live complète + bouton "Publier ma vitrine". Stocké dans `agencies.storefront_content` JSONB.

### Settings agence — Vérification
Raison sociale (`verifications.legal_name`) — N° RC (`verifications.rc_number`) — Document RC (upload max 10MB) — NIF (`verifications.nif_number`, niveau 3) — Preuve adresse (`verifications.address_proof_url`, upload max 10MB, niveau 3).

### Settings agence — Notifications
6 toggles : nouveau lead (email+in-app), demande visite (email+in-app), nouveau message (in-app), annonce modérée (email+in-app), alertes billing (email), digest analytique hebdo (email). Stocké dans `agencies.notification_prefs` JSONB.

### Profil utilisateur (`/dashboard/profil`, `/espace/profil`)
Prénom — Nom — Email (readonly) — Téléphone — Photo (upload max 2MB) — Langue (select FR/AR/EN/ES). Section MDP : ancien + nouveau + confirmation. AqarChaab seulement : suppression compte (confirmation modale + saisie "SUPPRIMER").

### Branche (`/dashboard/branches`)
Nom (min 2) — Wilaya (autocomplete) — Commune — Adresse (max 200) — Position GPS (map pin optionnel).

### Invitation (`/dashboard/team` → modal)
Email — Rôle (select : admin/agent/editor/viewer — PAS owner). Preview "Un email sera envoyé avec un lien valide 7 jours". Erreur si déjà membre.

### Wizard listing — Agence (7 étapes)
**É1 Type :** listing_type (radio 3). **É2 Catégorie :** property_type (radio 8). **É3 Localisation :** wilaya + commune (autocomplete) + adresse + map pin + branche. **É4 Détails :** surface + pièces + SDB + étage + étages total + année + features checkboxes (parking, ascenseur, balcon, piscine, jardin, meublé, vue mer, eau, électricité) + tel contact + show_phone + accept_messages. Features varient selon property_type. **É5 Description :** tabs FR (obligatoire) / AR / EN / ES : titre (min 10, max 120) + description (min 50, max 5000) + slug (auto). **Bouton "Générer automatiquement"** : génère titre + description depuis les données structurées des étapes précédentes via templates (`features/listings/utils/generate-listing-text.ts`, côté client, zéro coût). Texte éditable après génération. **É6 Photos+Docs :** photos (min 1, max selon plan, max 10MB/photo, jpg/png/webp, traitées par Sharp) + cover + reorder + documents légaux (acte, livret_foncier, promesse, cc, max 10MB, toggle is_public). Limites affichées dynamiquement selon le plan de l'agence. **É7 Prix :** prix (min 1) + devise (DZD/EUR) + récapitulatif + boutons Publier/Brouillon.

### Wizard listing — Particulier (4 étapes)
**É1 Quoi & Où :** listing_type + property_type + wilaya + commune + adresse. **É2 Détails & Description :** surface + pièces + SDB + étage + features + titre + description (avec bouton "Générer automatiquement" via templates) + tel contact + show_phone. **É3 Photos :** photos (min 1, max selon plan, max 10MB, traitées par Sharp) + cover. Limites affichées selon le plan du particulier. **É4 Prix & Récap :** prix + devise + récapitulatif.

### Limites médias par plan

**Agences (tous les chiffres modifiables par l'admin depuis `/admin/platform-settings`) :**

| Plan | Prix/mois | Photos/annonce | Annonces max | Équipe max |
|------|-----------|---------------|-------------|-----------|
| Starter | 2 900 DZD | 3 | 10 | 2 |
| Pro | 6 900 DZD | 10 | 30 | 10 |
| Enterprise | 12 900 DZD | 20 | illimité | illimité |

**Particuliers :**

| Plan | Photos/annonce | Annonces max |
|------|---------------|-------------|
| Gratuit | 3 | 2 |
| chaab_plus | 10 | 4 |
| chaab_pro | 15 | 6 |

> Les vidéos ne sont PAS disponibles sur les annonces. Elles sont réservées aux vitrines agences (thèmes) via URL YouTube/Vimeo dans le wizard vitrine (storefront_content).

> Toutes ces valeurs sont stockées dans `platform_settings` et modifiables en temps réel par le super admin sans toucher au code.

### Contact / Lead (ContactCard → sans auth)
Nom (min 2) — Téléphone (regex algérien) — Email (optionnel) — Message (min 10, max 1000) — Type demande (select info/visit/offer/urgent, défaut info). Pré-rempli si connecté. Crée lead (`sender_user_id` nullable) + conversation + premier message. Colonnes anonymes : `leads.sender_name`, `leads.sender_phone`, `leads.sender_email`.

### Demande visite (ContactCard → modal, sans auth)
Nom — Téléphone — Email (optionnel) — Date souhaitée (date picker, min demain) — Créneau (select matin/après-midi/soir, `visit_requests.preferred_time_slot`) — Message (max 500).

### Alerte recherche (`/search` → modal)
Nom alerte (min 2) — Fréquence (radio instant/daily/weekly) — Filtres pré-remplis depuis recherche : listing_type, property_types[], wilaya, price_min, price_max, surface_min, rooms_min. Stocké dans `search_alerts.filters` JSONB.

### Collection (`/espace/favoris` → modal)
Nom (min 1, max 100).

### Filtres recherche (`/search`)
**Principaux :** recherche texte (autocomplete wilayas) `q` — type transaction (pills) `type` — type bien (dropdown multi) `propertyType` — budget min/max `priceMin`/`priceMax`. **Avancés :** surface min/max — pièces min — étage min — année min — parking/ascenseur/meublé (checkboxes) — agence (hidden `?agency=slug`). **Tri :** newest (défaut), price_asc, price_desc, surface_desc.

### Admin — Platform Settings
**Plans agences :** Prix Starter/Pro/Enterprise (DZD/mois) — Max annonces — Max photos/annonce — Max membres équipe. **Limites particuliers :** Max annonces/photos pour gratuit, chaab_plus, chaab_pro. **Paiement :** Provider, banque, RIB, CCP, IBAN. **Tarifs packs DZD :** 3/7/15 annonces. **Tarifs abonnements DZD :** chaab_plus/chaab_pro. **Modération :** Toggles agence/individuel. **Système :** Maintenance toggle, email contact, taux EUR/DZD. Toutes ces valeurs sont dans `platform_settings` et modifiables en temps réel.

### Admin — Modération
Action (radio approve/reject/hide) — Raison (textarea min 10, obligatoire si reject/hide).

### Admin — Vérification agence
Action (radio approve/reject) — Niveau accordé (select 1-4, si approve) — Raison rejet (textarea min 10, si reject).

-----

## État actuel — Ce qui reste à construire

> Les sections "Dette technique" ci-dessous s'appliqueront quand `apps/web/` existera. Pour l'instant, le travail principal est de **construire l'app web** en suivant la spec ci-dessus.

### Hex → Tailwind token mapping (à respecter dès le départ)

`#FAFAF9`→`stone-50`, `#F5F5F4`→`stone-100`, `#E7E5E4`→`stone-200`, `#D6D3D1`→`stone-300`, `#A8A29E`→`stone-400`, `#78716C`→`stone-500`, `#57534E`→`stone-600`, `#44403C`→`stone-700`, `#292524`→`stone-800`, `#1C1917`→`stone-900`, `#0C0A09`→`stone-950`, `#0D9488`→`teal-600`, `#0F766E`→`teal-700`, `#2DD4BF`→`teal-400`, `#FBBF24`→`amber-400`, `#F59E0B`→`amber-500`.

-----

## Plan d'exécution séquentiel (8 phases)

**Phase 0 — Scaffolding :** (a) `apps/web/` — Next.js 16, App Router, Tailwind, next-intl, Supabase SSR, middleware (i18n + auth + sous-domaines). Installer Recharts, @hello-pangea/dnd, Resend, Sharp. Initialiser Sentry (`instrumentation.ts`) et Pino (`lib/logger/`). `lib/python-api.ts` (client HTTP vers le micro-service Python). (b) `services/python-api/` — FastAPI + Uvicorn + Docker. 7 routers : estimation, scraper, media, analytics, geocoding, nlp, pdf. Validation : `pnpm dev` + `uvicorn app.main:app` démarrent sans erreur.

**Phase 1 — Fondations :** Auth unique (login/signup + routing intelligent post-login + switcher Pro/Chaab), 6 layouts (Marketing, Dashboard, Chaab, Admin, Auth Card, Vitrine), composants UI partagés (Button, Input, Select, Badge, Card, Dialog, Tooltip, Skeleton, EmptyState, PhotoGallery, Lightbox, WilayaCommuneAutocomplete, DateRangePicker, BottomNav ×2 variantes, DocumentUpload, VerificationBadge, ChartLine, ChartDonut, ChartBar). `lib/email/send.ts` + templates.

**Phase 2 — AqarPro CRM :** Dashboard overview + checklist onboarding progressive, CRUD annonces (WizardListing mode agency 7 étapes + auto-save + localStorage + traductions multi-locale + documents légaux), leads (KanbanBoard desktop + liste filtrable mobile + heat_score), visites (CalendarView), analytics (charts + PriceHistoryChart), team (invitation flow + emails Resend), billing Stripe, messaging (MessagingView partagé), notifications, profil (ProfileForm partagé), settings (4 tabs : Général, Apparence/ThemeStudio, Vérification, Notifications), branches agences.

**Phase 3 — AqarSearch Marketplace :** Recherche multicritère (filtres Zod + URL query mapping + filtre `?agency=` + comparaison inline multi-select), carte MapLibre (markers, clusters, popup, pill flottant mobile), détail annonce (PhotoGallery + ContactCard configurable Appeler/WhatsApp/Message + SimilarListingsCarousel + PriceHistoryChart public + partage WhatsApp + JSON-LD + lead sans auth), vitrine `/a/[slug]` (10 thèmes), annuaire `/agences`, estimation `/estimer` (wizard 3 étapes), alertes V2.

**Phase 4 — AqarChaab Espace particulier :** WizardListing mode individual (4 étapes + auto-save + localStorage), `/deposer` avec auth différée (étape 3), messagerie realtime (MessagingView partagé + Supabase Realtime), alertes, favoris (fusionné favorites+collections), notifications, historique, profil (ProfileForm partagé + suppression compte), upgrade (multi-paiement : Stripe + CIB + Dahabia + BaridiMob + virement).

**Phase 5 — Admin :** Modération file d'attente, audit logs viewer, platform settings éditeur, entitlements (feature flags par agence), vérifications reviewer, gestion paiements (approbation virements), profil admin.

**Phase 6 — Marketing & Polish :** Homepage (8 sections inspirationnelles), landing pages (/pro, /vendre, /pricing), 10 thèmes vitrines agences, widget chatbot formulaire, SEO (sitemap, JSON-LD, OpenGraph).

**Phase 7 — Tests & Déploiement :** Tests Vitest (unit : sanitize, auth, schemas), tests Playwright (E2E : 8+ specs), CI/CD (master branch), DNS Cloudflare wildcard, migrations prod.

-----

## Références design

| Référence | Quand consulter |
|-----------|-----------------|
| `../../library/skills/design/frontend-design/` | Toujours |
| `references/design-tokens.md` | Couleurs, fonts, spacing, shadows, motion |
| `references/component-library.md` | Avant de créer un composant (30+ primitives, matrice d'états, a11y) |
| `references/agency-themes.md` | Specs des 10 thèmes vitrines agences (palette, fonts, layout, dark mode) |
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
| **nextjs-developer** | `../../library/subagents/languages/` | Developpement Next.js 16 App Router |
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
