# AqarVision — Documentation Complète de l'Application

> Plateforme SaaS immobilière multi-agences pour le marché algérien (et international)

**Version** : 0.1.0
**Stack** : Next.js 14, TypeScript, Supabase, Tailwind CSS, Zod, Vitest
**Statut** : En développement actif

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Base de données (11 tables)](#4-base-de-données-11-tables)
5. [Système d'authentification](#5-système-dauthentification)
6. [Middleware & protection des routes](#6-middleware--protection-des-routes)
7. [Configuration centralisée](#7-configuration-centralisée)
8. [Système de plans (SaaS)](#8-système-de-plans-saas)
9. [Plan Gating (contrôle des limites)](#9-plan-gating-contrôle-des-limites)
10. [Internationalisation (i18n)](#10-internationalisation-i18n)
11. [Pages publiques](#11-pages-publiques)
12. [Mini-sites agences (vitrine publique)](#12-mini-sites-agences-vitrine-publique)
13. [Dashboard agence (espace privé)](#13-dashboard-agence-espace-privé)
14. [Server Actions](#14-server-actions)
15. [Validators (Zod)](#15-validators-zod)
16. [Composants UI](#16-composants-ui)
17. [Utilitaires](#17-utilitaires)
18. [Système social (réseaux sociaux)](#18-système-social-réseaux-sociaux)
19. [SEO & Structured Data](#19-seo--structured-data)
20. [Supabase (client/serveur)](#20-supabase-clientserveur)
21. [Tests (Vitest)](#21-tests-vitest)
22. [Variables d'environnement](#22-variables-denvironnement)
23. [Scripts npm](#23-scripts-npm)
24. [Arborescence complète des fichiers](#24-arborescence-complète-des-fichiers)

---

## 1. Vue d'ensemble

AqarVision est une **plateforme SaaS B2B** permettant aux agences immobilières algériennes (et internationales) de :

- **Créer un mini-site vitrine** personnalisé avec leur branding
- **Gérer leurs biens immobiliers** (CRUD complet)
- **Recevoir et gérer des leads** (formulaire de contact, WhatsApp)
- **Personnaliser leur image** (branding standard ou luxury pour Enterprise)
- **Suivre leurs analytics** (vues, clics, événements)
- **Gérer leur équipe** (membres avec rôles admin/agent/viewer)
- **Intégrer les réseaux sociaux** (Instagram, Facebook, TikTok)

L'application supporte **3 plans tarifaires** (Starter, Pro, Enterprise) avec des limites différenciées et un **essai gratuit de 60 jours**.

---

## 2. Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| **Next.js** | 14.2.21 | Framework React full-stack (App Router, SSR, ISR) |
| **TypeScript** | ^5.7.2 | Typage statique |
| **Supabase** | ^2.47.10 | Base de données PostgreSQL, Auth, Storage, RLS |
| **@supabase/ssr** | ^0.5.2 | Intégration SSR avec cookies |
| **Tailwind CSS** | ^3.4.16 | Styles utilitaires |
| **Zod** | ^3.24.1 | Validation des données |
| **Vitest** | ^2.1.8 | Tests unitaires |
| **lucide-react** | ^0.577.0 | Icônes |
| **ESLint** | ^8.57.1 | Linting |

---

## 3. Architecture du projet

```
src/
├── app/                          # Routes Next.js (App Router)
│   ├── layout.tsx                # Layout racine (fonts, metadata)
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Styles globaux Tailwind
│   ├── error.tsx                 # Page erreur globale
│   ├── not-found.tsx             # Page 404 globale
│   ├── robots.ts                 # robots.txt dynamique
│   ├── sitemap.ts                # sitemap.xml dynamique
│   ├── pricing/page.tsx          # Page tarifs
│   │
│   ├── (auth)/                   # Groupe de routes auth
│   │   ├── login/page.tsx        # Page connexion
│   │   ├── signup/page.tsx       # Page inscription
│   │   └── callback/route.ts     # Callback confirmation email
│   │
│   ├── (dashboard)/dashboard/    # Groupe de routes dashboard (protégé)
│   │   ├── layout.tsx            # Layout sidebar + nav
│   │   ├── page.tsx              # Vue d'ensemble (stats, derniers leads)
│   │   ├── logout/route.ts       # Route de déconnexion
│   │   ├── branding/             # Page branding agence
│   │   │   ├── page.tsx
│   │   │   └── form.tsx
│   │   ├── properties/           # CRUD biens immobiliers
│   │   │   ├── page.tsx          # Liste des biens
│   │   │   ├── property-actions.tsx
│   │   │   ├── new/page.tsx      # Créer un bien
│   │   │   └── [id]/edit/        # Modifier un bien
│   │   │       ├── page.tsx
│   │   │       └── form.tsx
│   │   └── leads/                # Gestion des leads
│   │       ├── page.tsx          # Liste + stats
│   │       └── lead-row.tsx      # Composant ligne (actions inline)
│   │
│   └── agence/[slug]/            # Mini-site vitrine (public)
│       ├── layout.tsx            # Layout avec metadata + SEO
│       ├── page.tsx              # Accueil agence
│       ├── loading.tsx           # Skeleton loading
│       ├── error.tsx             # Error boundary
│       ├── not-found.tsx         # 404 agence
│       ├── biens/
│       │   ├── page.tsx          # Liste paginée des biens
│       │   └── [id]/page.tsx     # Détail d'un bien
│       ├── contact/page.tsx      # Page contact + formulaire
│       └── a-propos/page.tsx     # Page à propos
│
├── components/                   # Composants réutilisables
│   ├── agency/                   # Composants mini-site
│   │   ├── luxury-layout.tsx     # Layout Enterprise (luxury)
│   │   ├── luxury-hero.tsx       # Hero section Enterprise
│   │   ├── luxury-properties-section.tsx
│   │   ├── luxury-about-section.tsx
│   │   ├── social-feed-section.tsx
│   │   ├── social-feed-widget.tsx
│   │   ├── contact-form.tsx      # Formulaire de contact
│   │   ├── whatsapp-button.tsx   # Bouton WhatsApp flottant
│   │   └── location-map.tsx      # Carte OpenStreetMap
│   └── seo/
│       └── json-ld.tsx           # Données structurées JSON-LD
│
├── lib/                          # Logique métier
│   ├── actions/                  # Server Actions
│   │   ├── index.ts              # Re-exports
│   │   ├── branding.ts           # Mise à jour branding + upload images
│   │   ├── leads.ts              # Création de lead (public, rate-limited)
│   │   ├── lead-management.ts    # Gestion leads (statut, priorité, suppression)
│   │   └── properties.ts         # CRUD propriétés
│   ├── supabase/
│   │   ├── server.ts             # Client Supabase côté serveur (cookies)
│   │   └── browser.ts            # Client Supabase côté client
│   ├── queries/
│   │   └── agency.ts             # Requêtes cachées (React cache())
│   ├── validators/               # Schémas Zod
│   │   ├── index.ts              # Re-exports
│   │   ├── agency.ts             # Validation branding
│   │   ├── lead.ts               # Validation formulaire lead
│   │   └── property.ts           # Validation propriété
│   ├── utils/
│   │   └── format.ts             # Formatage prix, localisation
│   ├── social/
│   │   └── fetch-feed.ts         # Récupération flux réseaux sociaux
│   ├── i18n.ts                   # Internationalisation (FR/AR/EN)
│   └── plan-gate.ts              # Contrôle d'accès par plan
│
├── config/
│   └── index.ts                  # Configuration centralisée
├── types/
│   └── database.ts               # Types TypeScript pour toutes les tables
├── hooks/
│   └── use-scroll-reveal.ts      # Hook animation scroll
├── middleware.ts                  # Middleware auth Next.js
└── __tests__/                    # Tests unitaires (15 fichiers)
```

---

## 4. Base de données (11 tables)

Le schéma PostgreSQL complet est dans `supabase/schema.sql`. Toutes les tables utilisent **Row Level Security (RLS)**.

### 4.1. `agencies` — Agences immobilières

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Identifiant unique |
| `owner_id` | UUID (FK → auth.users) | Propriétaire du compte |
| `name` | TEXT | Nom de l'agence |
| `slug` | TEXT (UNIQUE) | URL slug unique |
| `description` | TEXT | Description |
| `logo_url` | TEXT | URL du logo |
| `cover_image_url` | TEXT | URL image de couverture |
| `primary_color` | TEXT | Couleur principale (#hex) |
| `phone`, `email`, `website`, `address` | TEXT | Coordonnées |
| `wilaya` | TEXT | Wilaya (subdivision algérienne) |
| `slogan` | TEXT | Slogan de l'agence |
| `registre_commerce` | TEXT | N° registre de commerce |
| `active_plan` | TEXT | Plan actif (`starter` / `pro` / `enterprise`) |
| `locale` | TEXT | Langue (`fr` / `ar`) |
| `custom_domain` | TEXT (UNIQUE) | Domaine personnalisé (Enterprise) |
| `latitude`, `longitude` | NUMERIC | Géolocalisation |
| `instagram_url`, `facebook_url`, `tiktok_url` | TEXT | Réseaux sociaux |
| `secondary_color` | TEXT | Couleur secondaire (Enterprise) |
| `hero_video_url` | TEXT | URL vidéo hero (Enterprise) |
| `hero_style` | TEXT | Style hero : `color` / `cover` / `video` |
| `font_style` | TEXT | Police : `modern` / `classic` / `elegant` |
| `theme_mode` | TEXT | Thème : `light` / `dark` |
| `tagline` | TEXT | Tagline (Enterprise) |
| `stats_years`, `stats_properties_sold`, `stats_clients` | INTEGER | Statistiques affichées |
| `created_at`, `updated_at` | TIMESTAMPTZ | Horodatage |

**Policies RLS** :
- Lecture publique (SELECT pour tous)
- Création par utilisateur authentifié (owner_id = auth.uid())
- Modification/suppression par le propriétaire uniquement

### 4.2. `agency_members` — Membres d'agence

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID (PK) | |
| `agency_id` | UUID (FK) | Agence |
| `user_id` | UUID (FK) | Utilisateur |
| `role` | TEXT | `admin` / `agent` / `viewer` |
| `full_name`, `phone`, `email`, `avatar_url` | TEXT | Infos membre |
| `is_active` | BOOLEAN | Membre actif |
| `invited_at`, `joined_at` | TIMESTAMPTZ | Dates |

**Contrainte** : UNIQUE (agency_id, user_id)

### 4.3. `properties` — Biens immobiliers

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID (PK) | |
| `agency_id` | UUID (FK) | Agence propriétaire |
| `created_by` | UUID (FK) | Créateur |
| `title` | TEXT | Titre du bien |
| `description` | TEXT | Description |
| `price` | NUMERIC | Prix (≥ 0) |
| `surface` | NUMERIC | Surface en m² |
| `rooms`, `bathrooms` | INTEGER | Nombre de pièces/SdB |
| `type` | TEXT | Type de bien (appartement, villa, etc.) |
| `transaction_type` | TEXT | `sale` / `rent` |
| `status` | TEXT | `draft` / `active` / `sold` / `rented` / `archived` |
| `country` | TEXT | Code pays ISO 2 lettres (défaut : `DZ`) |
| `city`, `wilaya`, `commune`, `address` | TEXT | Localisation |
| `currency` | TEXT | Code devise ISO 3 lettres (défaut : `DZD`) |
| `images` | TEXT[] | URLs des images |
| `features` | TEXT[] | Caractéristiques |
| `latitude`, `longitude` | NUMERIC | Coordonnées GPS |
| `is_featured` | BOOLEAN | Bien sponsorisé |
| `views_count` | INTEGER | Compteur de vues |
| `published_at` | TIMESTAMPTZ | Date de publication |

**Index** : agency_id, transaction_type, status, country, city, wilaya, type, price, is_featured, created_at

### 4.4. `leads` — Contacts/demandes

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID (PK) | |
| `agency_id` | UUID (FK) | Agence destinataire |
| `property_id` | UUID (FK, nullable) | Bien associé |
| `assigned_to` | UUID (FK, nullable) | Agent assigné |
| `name` | TEXT | Nom (min 2 car.) |
| `phone` | TEXT | Téléphone (min 9 car.) |
| `email` | TEXT | Email (optionnel) |
| `message` | TEXT | Message (optionnel) |
| `source` | TEXT | `contact_form` / `property_detail` / `whatsapp` / `phone` / `walk_in` / `referral` |
| `status` | TEXT | `new` / `contacted` / `qualified` / `negotiation` / `converted` / `lost` |
| `priority` | TEXT | `low` / `normal` / `high` / `urgent` |
| `budget_min`, `budget_max` | NUMERIC | Budget recherché |
| `desired_country`, `desired_wilaya`, `desired_type` | TEXT | Critères recherche |
| `contacted_at` | TIMESTAMPTZ | Date de premier contact |

**RLS** : Insertion publique (formulaires), lecture/gestion par membres de l'agence

### 4.5. `lead_notes` — Notes internes sur leads

Historique de suivi des leads : `lead_id`, `author_id`, `content`, `created_at`.

### 4.6. `favorites` — Biens favoris

Sauvegarde de biens par les visiteurs connectés. UNIQUE (user_id, property_id).

### 4.7. `property_views` — Statistiques de vues

Tracking des vues par bien avec `ip_hash`, `user_agent`, `referrer`, `viewed_at`. Insertion publique, lecture par l'agence.

### 4.8. `analytics_events` — Événements analytics

Événements génériques avec payload JSONB (limité à 4 Ko) :
- Types : `page_view`, `property_click`, `contact_click`, `phone_click`, `whatsapp_click`, `share_click`, `map_click`, `gallery_view`, `search`, `filter_change`, `lead_submit`

### 4.9. `subscriptions` — Abonnements

Gestion de la facturation :
- Plans : `starter` / `pro` / `enterprise`
- Statuts : `trial` / `active` / `past_due` / `cancelled` / `expired`
- Cycles : `monthly` / `quarterly` / `yearly`
- Méthodes de paiement : `ccp` / `baridi_mob` / `virement` / `cash` / `dahabia`

**RLS** : Seul le propriétaire peut voir. INSERT/UPDATE réservé au service_role (backend).

### 4.10. `notifications` — Notifications internes

Types : `new_lead`, `lead_assigned`, `lead_status_change`, `subscription_expiring`, `subscription_expired`, `subscription_renewed`, `property_published`, `property_view_milestone`, `member_invited`, `member_joined`, `system`.

### 4.11. `media` — Gestion centralisée des fichiers

Métadonnées fichiers uploadés : `file_name`, `file_path`, `file_size`, `mime_type`, `width`, `height`, `alt_text`, `category` (`property` / `branding` / `avatar` / `document`), `public_url`.

### Fonctions & Triggers SQL

- `update_updated_at()` : Trigger BEFORE UPDATE sur `agencies`, `properties`, `leads`, `subscriptions`, `agency_members` pour auto-mettre à jour `updated_at`.

### Storage Supabase

Bucket `public` avec structure :
```
agencies/{agency_id}/branding/cover.{ext}
agencies/{agency_id}/branding/logo.{ext}
agencies/{agency_id}/properties/{prop_id}/
agencies/{agency_id}/avatars/{user_id}.{ext}
agencies/{agency_id}/documents/
```

---

## 5. Système d'authentification

### 5.1. Inscription (`/signup`)

**Fichier** : `src/app/(auth)/signup/page.tsx` (Client Component)

Flux :
1. L'utilisateur saisit : **nom d'agence**, **email**, **mot de passe**, **confirmation mot de passe**
2. Vérification côté client que les mots de passe correspondent
3. Appel `supabase.auth.signUp()` avec `user_metadata.agency_name`
4. **Si confirmation email requise** : affichage message "Vérifiez votre email"
5. **Si session immédiate** : création automatique de l'agence dans la table `agencies` avec :
   - `slug` généré automatiquement (nom normalisé + suffixe unique)
   - `active_plan: 'starter'`
   - `locale: 'fr'`
   - `primary_color: '#2563eb'`
6. Redirection vers `/dashboard`

### 5.2. Connexion (`/login`)

**Fichier** : `src/app/(auth)/login/page.tsx` (Client Component)

- Formulaire email/mot de passe
- Appel `supabase.auth.signInWithPassword()`
- Support du paramètre `redirectTo` (query param)
- Messages d'erreur traduits en français
- Skeleton de chargement (Suspense)

### 5.3. Callback email (`/callback`)

**Fichier** : `src/app/(auth)/callback/route.ts` (Route Handler)

- Échange du code d'autorisation contre une session
- Si l'utilisateur n'a pas encore d'agence et a un `agency_name` en metadata → création automatique de l'agence
- Redirection vers `/dashboard` ou l'URL de retour

### 5.4. Déconnexion (`/dashboard/logout`)

**Fichier** : `src/app/(dashboard)/dashboard/logout/route.ts`

Route POST simple qui déconnecte via le middleware Supabase et redirige vers `/login`.

---

## 6. Middleware & protection des routes

**Fichier** : `src/middleware.ts`

Le middleware Next.js :
1. **Rafraîchit la session Supabase** (gestion des cookies SSR)
2. **Protège `/dashboard/*`** : redirige vers `/login?redirectTo=...` si non authentifié
3. **Redirige `/login` et `/signup`** vers `/dashboard` si déjà connecté

**Matcher** : Toutes les routes sauf `_next/static`, `_next/image`, `favicon.ico`, fichiers statiques (svg, png, jpg, etc.).

---

## 7. Configuration centralisée

**Fichier** : `src/config/index.ts`

Toute la configuration est regroupée dans un seul fichier :

### 7.1. Localisation

```typescript
LOCALE = {
  COUNTRY_CODE: 'DZ',
  CURRENCY: 'DZD',
  PHONE_PREFIX: '213',
  LOCALE_AR: 'ar-DZ',
  LOCALE_FR: 'fr-DZ',
}
```

### 7.2. Pays supportés (9 pays)

| Code | Pays | Devise | Préfixe |
|---|---|---|---|
| DZ | Algérie | DZD (DA) | +213 |
| FR | France | EUR (€) | +33 |
| ES | Espagne | EUR (€) | +34 |
| AE | Émirats Arabes Unis | AED | +971 |
| MA | Maroc | MAD | +212 |
| TN | Tunisie | TND | +216 |
| TR | Turquie | TRY (₺) | +90 |
| US | États-Unis | USD ($) | +1 |
| GB | Royaume-Uni | GBP (£) | +44 |

Chaque pays a un `regionLabel` (Wilaya, Département, Province, Émirat, etc.)

### 7.3. Cache & performances

| Constante | Valeur | Description |
|---|---|---|
| `PAGE_REVALIDATE` | 300s (5 min) | ISR pour les pages agence |
| `SOCIAL_FEED_TTL` | 3600s (1h) | Cache des flux sociaux |
| `EXTERNAL_API_MS` | 8000ms | Timeout API externes |

### 7.4. Rate limiting

| Constante | Valeur |
|---|---|
| `WINDOW_MS` | 60 000ms (1 min) |
| `MAX_REQUESTS` | 5 requêtes/fenêtre |

### 7.5. Uploads

| Constante | Valeur |
|---|---|
| `MAX_COVER_SIZE` | 10 Mo |
| `MAX_LOGO_SIZE` | 5 Mo |
| `ALLOWED_EXTENSIONS` | jpg, jpeg, png, webp, svg |

### 7.6. Pagination

| Constante | Valeur |
|---|---|
| `PROPERTIES_PER_PAGE` | 12 |
| `PROPERTIES_DEFAULT_LIMIT` | 6 |
| `SIMILAR_PROPERTIES_LIMIT` | 3 |
| `SOCIAL_FEED_LIMIT` | 6 |
| `SOCIAL_FEED_SMALL` | 3 |

### 7.7. APIs sociales

- Instagram Graph API
- Facebook Graph API (v19.0)
- TikTok API (v2)
- URLs d'embed pour chaque plateforme

### 7.8. Storage Supabase

Helpers pour les chemins de fichiers :
- `coverPath(agencyId, ext)` → `{id}/branding/cover.{ext}`
- `logoPath(agencyId, ext)` → `{id}/branding/logo.{ext}`
- `brandingDir(agencyId)` → `{id}/branding`

### 7.9. Messages WhatsApp

Templates de messages pré-remplis :
- `whatsappGeneric(agencyName)` → message d'intérêt général
- `whatsappProperty(agencyName, title, price)` → message pour un bien précis

### 7.10. UI & Animations

| Constante | Valeur |
|---|---|
| `HEADER_SCROLL_THRESHOLD` | 50px |
| `COUNTER_ANIMATION_MS` | 2000ms |
| `OBSERVER_THRESHOLD` | 0.1 |

---

## 8. Système de plans (SaaS)

### Plans et tarifs

| | Starter | Pro | Enterprise |
|---|---|---|---|
| **Prix mensuel** | 5 000 DA | 12 000 DA | 30 000 DA |
| **Prix trimestriel** | 13 500 DA (-10%) | 32 400 DA (-10%) | 81 000 DA (-10%) |
| **Prix annuel** | 48 000 DA (-20%) | 115 200 DA (-20%) | 288 000 DA (-20%) |
| **Biens max** | 15 | 50 | Illimité |
| **Leads/mois** | 30 | 150 | Illimité |
| **Membres** | 1 | 5 | 20 |
| **Stockage** | 500 Mo | 2 Go | 10 Go |
| **Branding luxury** | Non | Non | Oui |
| **Domaine personnalisé** | Non | Non | Oui |
| **Analytics avancés** | Non | Oui | Oui |
| **Export leads CSV** | Non | Oui | Oui |
| **Réseaux sociaux** | Non | Oui | Oui |
| **Biens sponsorisés** | 0 | 3 | Illimité |
| **Badge** | — | Populaire | Premium |

**Essai gratuit** : 60 jours sur tous les plans, sans engagement.

**Moyens de paiement** : CCP, BaridiMob, Dahabia, virement bancaire, espèces.

---

## 9. Plan Gating (contrôle des limites)

**Fichier** : `src/lib/plan-gate.ts`

Le système `PlanGate` vérifie les droits d'une agence selon son plan :

```typescript
const gate = createPlanGate(agency.active_plan);

gate.hasFeature('luxuryBranding');          // true/false
gate.canPublishProperty(currentCount);       // vérifie maxProperties
gate.canReceiveLead(currentMonthCount);      // vérifie maxLeadsPerMonth
gate.canAddMember(currentCount);             // vérifie maxMembers
gate.canFeatureProperty(currentFeaturedCount); // vérifie featuredProperties
gate.canUpload(usedBytes, fileSize);         // vérifie maxStorageBytes
gate.remainingStorage(usedBytes);            // octets restants
```

Fonctions utilitaires :
- `planHasFeature(plan, feature)` — vérification inline rapide
- `isPlanAtLeast(currentPlan, requiredPlan)` — comparaison de plans (starter < pro < enterprise)

---

## 10. Internationalisation (i18n)

**Fichier** : `src/lib/i18n.ts`

### Langues supportées

| Code | Langue | Direction |
|---|---|---|
| `fr` | Français | LTR |
| `ar` | Arabe | RTL |
| `en` | Anglais | LTR |

### Utilisation

```typescript
const t = getTranslations('fr');
t('nav.home')                    // → "Accueil"
t('pricing.trialDays', { count: 60 }) // → "60 jours d'essai gratuit"
```

### Catégories de traductions (~120 clés)

- `nav.*` — Navigation
- `hero.*` — Section hero
- `properties.*` — Biens immobiliers
- `about.*` — Page à propos
- `contact.*` — Page contact
- `form.*` — Formulaires
- `pagination.*` — Pagination
- `detail.*` — Détail d'un bien
- `pricing.*` — Page tarifs + FAQ
- `footer.*` — Pied de page
- `a11y.*` — Accessibilité
- `error.*` — Messages d'erreur
- `home.*` — Landing page

### Fonctions utilitaires

- `isRtlLocale(locale)` — retourne true pour l'arabe
- `getLocaleAttrs(locale)` — retourne `{ dir: 'ltr'|'rtl', lang: string }`

---

## 11. Pages publiques

### 11.1. Landing page (`/`)

**Fichier** : `src/app/page.tsx`

Page d'accueil minimaliste avec :
- Logo AqarVision en gros
- Sous-titre traduit
- CTA vers la démo (`/agence/demo`)
- CTA vers les tarifs (`/pricing`)

### 11.2. Page tarifs (`/pricing`)

**Fichier** : `src/app/pricing/page.tsx`

Page complète avec :
- Header avec navigation
- Section hero avec essai gratuit (60 jours)
- Badge "Paiement local" (CCP, BaridiMob, Dahabia)
- 3 cartes de plans avec prix mensuel/annuel et features
- Tableau de comparaison détaillé
- FAQ (4 questions)
- CTA final avec fond bleu

### 11.3. SEO

- `robots.ts` — robots.txt dynamique
- `sitemap.ts` — sitemap.xml dynamique

---

## 12. Mini-sites agences (vitrine publique)

Chaque agence dispose d'un mini-site accessible via `/agence/{slug}`. L'apparence change selon le plan :

### 12.1. Layout agence (`/agence/[slug]/layout.tsx`)

- **Metadata dynamique** : titre, description, OpenGraph, Twitter Card
- **ISR** : revalidation toutes les 5 minutes
- **JSON-LD** : données structurées pour le SEO
- **Enterprise** → `LuxuryLayout` (composant dédié)
- **Starter/Pro** → Layout basique avec header, navigation, footer

### 12.2. Page d'accueil agence (`/agence/[slug]`)

- Chargement parallèle des propriétés et du flux social
- **Enterprise** : Hero luxury + sections propriétés/about/social
- **Starter/Pro** : Titre, slogan, grille de propriétés, widget social

### 12.3. Liste des biens (`/agence/[slug]/biens`)

- Pagination côté serveur (12 biens/page)
- Cartes avec image, prix formaté, localisation, surface, nombre de pièces
- **Enterprise** : style luxury avec badges colorés, gradient sur images
- **Starter/Pro** : cartes basiques avec bordures

### 12.4. Détail d'un bien (`/agence/[slug]/biens/[id]`)

- Vérification que le bien appartient à l'agence (`agency_id` check)
- Galerie d'images (1 grande + 4 petites)
- Caractéristiques (type, surface, pièces, SdB, localisation)
- Description complète
- Carte OpenStreetMap (si coordonnées GPS)
- Sidebar contact avec bouton WhatsApp pré-rempli + formulaire
- Widget réseaux sociaux
- Biens similaires (même type, même agence)
- Breadcrumb navigation
- JSON-LD PropertyJsonLd + BreadcrumbJsonLd

### 12.5. Page contact (`/agence/[slug]/contact`)

- Coordonnées de l'agence (téléphone, email, site web, adresse)
- Formulaire de contact (nom, téléphone, email, message)
- Carte OpenStreetMap
- Widget réseaux sociaux

### 12.6. Page à propos (`/agence/[slug]/a-propos`)

- Description de l'agence
- Infos : wilaya, adresse, registre de commerce
- **Enterprise** : Section luxury avec statistiques (années, biens vendus, clients)

### 12.7. Pages utilitaires

- `loading.tsx` — Skeleton de chargement
- `error.tsx` — Error boundary
- `not-found.tsx` — 404 agence

---

## 13. Dashboard agence (espace privé)

Accessible uniquement aux utilisateurs authentifiés via `/dashboard`.

### 13.1. Layout dashboard

**Fichier** : `src/app/(dashboard)/dashboard/layout.tsx`

- Sidebar fixe (64px de large) avec :
  - Logo AqarVision
  - Nom de l'agence + lien vers le mini-site
  - Navigation : Vue d'ensemble, Branding, Biens, Leads
  - Email utilisateur + bouton déconnexion (en bas)
- Zone de contenu principal (margin-left: 64px)
- Protection serveur : redirection vers `/login` si non authentifié

### 13.2. Vue d'ensemble (`/dashboard`)

**Fichier** : `src/app/(dashboard)/dashboard/page.tsx`

- 3 cartes statistiques cliquables : Biens, Leads, Plan
- Tableau des 5 derniers leads avec nom, téléphone, source, statut, date
- Badges colorés par statut de lead

### 13.3. Gestion des biens (`/dashboard/properties`)

#### Liste des biens (`page.tsx`)

- Bouton "Ajouter un bien" en haut à droite
- Tableau avec : titre, localisation, type, prix, statut, vues, actions
- Statuts traduits en français avec badges colorés
- État vide avec CTA

#### Création d'un bien (`/dashboard/properties/new`)

Formulaire complet avec champs :
- Titre, description, prix, surface, pièces, SdB
- Type de bien, type de transaction (vente/location)
- Statut (brouillon/actif/vendu/loué/archivé)
- Pays (dropdown 9 pays), ville, wilaya, commune, adresse, devise
- Coordonnées GPS (latitude/longitude)
- Images (URLs), caractéristiques (features)
- Bien sponsorisé (checkbox)

#### Modification d'un bien (`/dashboard/properties/[id]/edit`)

- Chargement des données existantes
- Même formulaire que la création, pré-rempli
- Vérification que le bien appartient à l'agence de l'utilisateur

#### Actions sur un bien (`property-actions.tsx`)

- Lien "Modifier" vers la page d'édition
- Bouton "Supprimer" avec confirmation par `window.confirm()`

### 13.4. Gestion des leads (`/dashboard/leads`)

#### Liste des leads (`page.tsx`)

- 4 cartes statistiques : Total, Nouveaux, En cours, Convertis
- Tableau complet avec : contact (nom, téléphone, email), source, bien associé, statut, priorité, date, actions
- Jointure avec `properties` pour afficher le titre du bien associé

#### Composant LeadRow (`lead-row.tsx`)

- **Changement de statut inline** : dropdown avec 6 statuts
- **Changement de priorité inline** : dropdown avec 4 priorités
- **Affichage message** : toggle pour voir/cacher le message du lead
- **Suppression** : bouton avec confirmation
- Feedback visuel (optimistic UI avec états pending)

### 13.5. Branding (`/dashboard/branding`)

- Formulaire de personnalisation de l'agence
- Champs différents selon le plan (Enterprise = champs luxury en plus)
- Upload logo et cover image (Enterprise)

---

## 14. Server Actions

**Fichier** : `src/lib/actions/`

Toutes les actions serveur utilisent `'use server'` et retournent `{ success: boolean; error?: string }`.

### 14.1. Branding (`branding.ts`)

| Action | Description | Sécurité |
|---|---|---|
| `updateAgencyBranding(agencyId, formData)` | Met à jour le branding | Auth + ownership/admin |
| `updateAgencyCoverImage(agencyId, formData)` | Upload cover (Enterprise) | Auth + ownership + plan Enterprise |
| `updateAgencyLogo(agencyId, formData)` | Upload logo | Auth + ownership |

- Détection automatique du schéma de validation (standard vs luxury selon le plan)
- Nettoyage des anciens fichiers lors du changement d'extension
- Validation du type MIME et de la taille

### 14.2. Propriétés (`properties.ts`)

| Action | Description | Sécurité |
|---|---|---|
| `createProperty(formData)` | Crée un bien | Auth + agence requise |
| `updateProperty(propertyId, formData)` | Modifie un bien | Auth + ownership agency_id |
| `deleteProperty(propertyId)` | Supprime un bien | Auth + ownership agency_id |

- Validation Zod (`propertySchema`)
- `revalidatePath('/dashboard/properties')` après chaque opération
- Retourne l'`id` du bien créé

### 14.3. Leads publics (`leads.ts`)

| Action | Description | Sécurité |
|---|---|---|
| `createLead(formData)` | Crée un lead depuis un formulaire public | Rate limiting par IP |

- **Rate limiting** : 5 requêtes/minute par IP (Map en mémoire avec nettoyage automatique)
- Validation Zod (`leadSchema`)
- Accessible sans authentification

### 14.4. Gestion des leads (`lead-management.ts`)

| Action | Description | Sécurité |
|---|---|---|
| `updateLeadStatus(leadId, status)` | Change le statut d'un lead | Auth + agence requise |
| `updateLeadPriority(leadId, priority)` | Change la priorité | Auth + agence requise |
| `deleteLead(leadId)` | Supprime un lead | Auth + agence requise |

- Validation des valeurs autorisées
- Si statut → `contacted` : mise à jour automatique de `contacted_at`
- `revalidatePath('/dashboard/leads')` après chaque opération

---

## 15. Validators (Zod)

**Fichier** : `src/lib/validators/`

### 15.1. Agence — Branding standard (`agency.ts`)

```typescript
agencyBrandingSchema = {
  name: string (min 2),
  slogan: string (max 120, optionnel),
  description: string (max 2000, optionnel),
  primary_color: string (regex #hex6),
  locale: enum ['fr', 'ar', 'en'] (défaut 'fr'),
  phone, email, website, address, wilaya: optionnels
}
```

### 15.2. Agence — Branding luxury (`agency.ts`)

Étend le schéma standard avec :
```typescript
agencyLuxuryBrandingSchema = agencyBrandingSchema.extend({
  secondary_color: string (#hex6, optionnel),
  hero_style: enum ['color', 'cover', 'video'] (défaut 'cover'),
  hero_video_url: string (URL, optionnel),
  font_style: enum ['modern', 'classic', 'elegant'] (défaut 'elegant'),
  theme_mode: enum ['light', 'dark'] (défaut 'dark'),
  tagline: string (max 200, optionnel),
  stats_years, stats_properties_sold, stats_clients: number (int, min 0, optionnels),
  instagram_url, facebook_url, tiktok_url: string (URL, optionnels),
})
```

### 15.3. Lead (`lead.ts`)

```typescript
leadSchema = {
  agency_id: string (UUID),
  property_id: string (UUID, optionnel),
  name: string (min 2),
  phone: string (min 9),
  email: string (email, optionnel),
  message: string (max 2000, optionnel),
  source: enum ['contact_form', 'property_detail', 'whatsapp', 'phone', 'walk_in', 'referral'] (défaut 'contact_form'),
}
```

### 15.4. Propriété (`property.ts`)

```typescript
propertySchema = {
  title: string (min 3, max 200),
  description: string (max 5000, optionnel),
  price: number (min 0),
  surface: number (min 0, optionnel),
  rooms, bathrooms: number (int, min 0, optionnels),
  type: string (min 1),
  transaction_type: enum ['sale', 'rent'] (défaut 'sale'),
  status: enum ['draft', 'active', 'sold', 'rented', 'archived'] (défaut 'draft'),
  country: string (2 lettres, uppercase, validé contre COUNTRIES) (défaut 'DZ'),
  city, wilaya, commune: string (max 100, optionnels),
  address: string (max 500, optionnel),
  currency: string (3 lettres, uppercase, validé contre devises supportées) (défaut 'DZD'),
  latitude: number (-90..90, optionnel),
  longitude: number (-180..180, optionnel),
  images: array de string (URL) (défaut []),
  features: array de string (défaut []),
  is_featured: boolean (défaut false),
}
```

---

## 16. Composants UI

### 16.1. Composants mini-site (`components/agency/`)

| Composant | Description |
|---|---|
| `LuxuryLayout` | Layout Enterprise avec header sticky, navigation, footer luxury |
| `LuxuryHero` | Section hero avec image/vidéo de couverture, tagline animée |
| `LuxuryPropertiesSection` | Grille de propriétés style luxury |
| `LuxuryAboutSection` | Section à propos avec compteurs animés (années, ventes, clients) |
| `SocialFeedSection` | Section flux réseaux sociaux (posts API ou embeds iframe) |
| `SocialFeedWidget` | Widget compact réseaux sociaux (sidebar) |
| `ContactForm` | Formulaire de contact avec validation + rate limiting |
| `WhatsAppButton` | Bouton flottant WhatsApp |
| `LocationMap` / `ConditionalMap` | Carte OpenStreetMap (affichée seulement si lat/lng disponibles) |

### 16.2. Composants SEO (`components/seo/`)

| Composant | Description |
|---|---|
| `AgencyJsonLd` | Données structurées JSON-LD pour l'agence (RealEstateAgent) |
| `PropertyJsonLd` | Données structurées JSON-LD pour un bien (Product/Offer) |
| `BreadcrumbJsonLd` | Fil d'Ariane structuré (BreadcrumbList) |

---

## 17. Utilitaires

### 17.1. Formatage (`lib/utils/format.ts`)

| Fonction | Description |
|---|---|
| `formatPrice(price, currency)` | Formate un prix avec Intl.NumberFormat selon la devise |
| `getLocationLabel(property)` | Construit le label de localisation (ex: "Alger, Algérie") |
| `getCountryFlag(countryCode)` | Retourne le drapeau emoji du pays |

### 17.2. Queries cachées (`lib/queries/agency.ts`)

Fonctions React `cache()` pour dédupliquer les requêtes Supabase dans une même request :

| Fonction | Description |
|---|---|
| `getAgencyBySlug(slug)` | Récupère une agence par son slug |
| `getAgencyProperties(agencyId, limit, offset)` | Propriétés actives paginées |
| `getAgencyPropertiesCount(agencyId)` | Compte total des propriétés actives |

### 17.3. Hook scroll (`hooks/use-scroll-reveal.ts`)

Hook pour animations au scroll (IntersectionObserver).

---

## 18. Système social (réseaux sociaux)

**Fichier** : `src/lib/social/fetch-feed.ts`

Récupération des flux sociaux avec deux approches :
1. **API** (si tokens disponibles) : Instagram Graph API, Facebook Graph API, TikTok API
2. **Embeds iframe** (fallback) : URLs d'embed générées à partir des profils

Les posts sont normalisés en type `SocialPost` avec : `id`, `platform`, `permalink`, `caption`, `media_url`, `media_type`, `thumbnail_url`, `timestamp`, `likes_count`, `comments_count`.

---

## 19. SEO & Structured Data

### Données structurées JSON-LD

- **AgencyJsonLd** : type `RealEstateAgent` avec nom, description, adresse, téléphone, URL, logo, image
- **PropertyJsonLd** : type `Product` avec offre, prix, devise, description, images
- **BreadcrumbJsonLd** : type `BreadcrumbList` pour la navigation

### Metadata Next.js

- Metadata dynamique par page (titre, description, OpenGraph, Twitter Card)
- Template de titre : `%s | NomAgence`
- robots.txt et sitemap.xml dynamiques

### ISR (Incremental Static Regeneration)

- Pages agence revalidées toutes les 5 minutes (`revalidate = 300`)

---

## 20. Supabase (client/serveur)

### Client serveur (`lib/supabase/server.ts`)

Utilise `@supabase/ssr` avec `createServerClient` et gestion des cookies Next.js pour :
- Server Actions (`'use server'`)
- Server Components
- Route Handlers
- Middleware

### Client navigateur (`lib/supabase/browser.ts`)

Utilise `createBrowserClient` pour :
- Client Components (login, signup)
- Interactions côté client

---

## 21. Tests (Vitest)

**Configuration** : `vitest.config.ts`

### Fichiers de test (15 fichiers, 322+ tests)

| Fichier | Description |
|---|---|
| `config.test.ts` | Configuration de base (LOCALE, PLANS, CACHE, etc.) |
| `config-extended.test.ts` | Tests étendus config (getCountryConfig, getPlanConfig, getPlanPrice, etc.) |
| `validators.test.ts` | Schémas Zod de base |
| `validators-extended.test.ts` | Edge cases validators (452 lignes) |
| `property-validator.test.ts` | Validation propriétés |
| `database-types.test.ts` | Vérification types TypeScript (445 lignes) |
| `plan-gate.test.ts` | Plan gating (createPlanGate, planHasFeature, isPlanAtLeast) |
| `i18n.test.ts` | Internationalisation (3 langues, paramètres, RTL) |
| `format.test.ts` | Formatage prix et localisation |
| `social.test.ts` | Flux réseaux sociaux |
| `actions-branding.test.ts` | Server actions branding (166 lignes) |
| `actions-create-lead.test.ts` | Server actions création lead |
| `actions-leads.test.ts` | Server actions gestion leads (172 lignes) |
| `actions-properties.test.ts` | Server actions propriétés (193 lignes) |
| `helpers/mock-supabase.ts` | Helper mock Supabase pour les tests |

### Mock Supabase

Un helper dédié (`__tests__/helpers/mock-supabase.ts`) fournit un mock complet du client Supabase avec :
- Chaînage de méthodes (`.from().select().eq().single()`)
- Simulation auth (`.auth.getUser()`)
- Simulation storage (`.storage.from().upload()`)

---

## 22. Variables d'environnement

**Fichier** : `.env.example`

```env
# Supabase (obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App
NEXT_PUBLIC_BASE_URL=https://aqarvision.dz

# Social Media APIs (optionnel - les embeds iframe fonctionnent sans)
INSTAGRAM_ACCESS_TOKEN=
FACEBOOK_ACCESS_TOKEN=
TIKTOK_ACCESS_TOKEN=
```

---

## 23. Scripts npm

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement Next.js |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Linting ESLint |
| `npm run test` | Tests Vitest (mode watch) |
| `npm run test:run` | Tests Vitest (exécution unique) |
| `npm run test:coverage` | Tests avec couverture de code |

---

## 24. Arborescence complète des fichiers

```
aqarvision/
├── .env.example
├── .gitignore
├── next.config.js
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── ANALYSIS.md
├── PLAN-DE-TEST.md
├── SESSION_LUXURY_BRANDING.md
│
├── supabase/
│   ├── config.toml
│   ├── schema.sql                              # Schéma complet (11 tables)
│   ├── reset.sql
│   ├── .gitignore
│   └── migrations/
│       └── 001_add_international_support.sql
│
└── src/
    ├── middleware.ts
    │
    ├── config/
    │   └── index.ts                            # Configuration centralisée
    │
    ├── types/
    │   └── database.ts                         # Types TypeScript DB
    │
    ├── hooks/
    │   └── use-scroll-reveal.ts
    │
    ├── components/
    │   ├── agency/
    │   │   ├── luxury-layout.tsx
    │   │   ├── luxury-hero.tsx
    │   │   ├── luxury-properties-section.tsx
    │   │   ├── luxury-about-section.tsx
    │   │   ├── social-feed-section.tsx
    │   │   ├── social-feed-widget.tsx
    │   │   ├── contact-form.tsx
    │   │   ├── whatsapp-button.tsx
    │   │   └── location-map.tsx
    │   └── seo/
    │       └── json-ld.tsx
    │
    ├── lib/
    │   ├── i18n.ts                             # Internationalisation (FR/AR/EN)
    │   ├── plan-gate.ts                        # Contrôle d'accès par plan
    │   ├── supabase/
    │   │   ├── server.ts
    │   │   └── browser.ts
    │   ├── queries/
    │   │   └── agency.ts
    │   ├── actions/
    │   │   ├── index.ts
    │   │   ├── branding.ts
    │   │   ├── leads.ts
    │   │   ├── lead-management.ts
    │   │   └── properties.ts
    │   ├── validators/
    │   │   ├── index.ts
    │   │   ├── agency.ts
    │   │   ├── lead.ts
    │   │   └── property.ts
    │   ├── utils/
    │   │   └── format.ts
    │   └── social/
    │       └── fetch-feed.ts
    │
    ├── app/
    │   ├── layout.tsx                          # Root layout
    │   ├── page.tsx                            # Landing page
    │   ├── globals.css
    │   ├── error.tsx
    │   ├── not-found.tsx
    │   ├── robots.ts
    │   ├── sitemap.ts
    │   │
    │   ├── pricing/
    │   │   └── page.tsx                        # Page tarifs
    │   │
    │   ├── (auth)/
    │   │   ├── login/page.tsx                  # Connexion
    │   │   ├── signup/page.tsx                 # Inscription
    │   │   └── callback/route.ts               # Callback email
    │   │
    │   ├── (dashboard)/dashboard/
    │   │   ├── layout.tsx                      # Sidebar + nav
    │   │   ├── page.tsx                        # Vue d'ensemble
    │   │   ├── logout/route.ts                 # Déconnexion
    │   │   ├── branding/
    │   │   │   ├── page.tsx
    │   │   │   └── form.tsx
    │   │   ├── properties/
    │   │   │   ├── page.tsx                    # Liste biens
    │   │   │   ├── property-actions.tsx
    │   │   │   ├── new/page.tsx                # Créer bien
    │   │   │   └── [id]/edit/
    │   │   │       ├── page.tsx
    │   │   │       └── form.tsx
    │   │   └── leads/
    │   │       ├── page.tsx                    # Liste leads
    │   │       └── lead-row.tsx                # Actions inline
    │   │
    │   └── agence/[slug]/                      # Mini-site public
    │       ├── layout.tsx
    │       ├── page.tsx                         # Accueil agence
    │       ├── loading.tsx
    │       ├── error.tsx
    │       ├── not-found.tsx
    │       ├── biens/
    │       │   ├── page.tsx                     # Liste biens
    │       │   └── [id]/page.tsx                # Détail bien
    │       ├── contact/page.tsx
    │       └── a-propos/page.tsx
    │
    └── __tests__/
        ├── helpers/mock-supabase.ts
        ├── config.test.ts
        ├── config-extended.test.ts
        ├── validators.test.ts
        ├── validators-extended.test.ts
        ├── property-validator.test.ts
        ├── database-types.test.ts
        ├── plan-gate.test.ts
        ├── i18n.test.ts
        ├── format.test.ts
        ├── social.test.ts
        ├── actions-branding.test.ts
        ├── actions-create-lead.test.ts
        ├── actions-leads.test.ts
        └── actions-properties.test.ts
```

---

## Résumé des fonctionnalités par statut

| Fonctionnalité | Statut | Notes |
|---|---|---|
| Auth (login/signup/callback) | Implémenté | Supabase Auth email/password |
| Middleware protection routes | Implémenté | /dashboard protégé |
| Dashboard - Vue d'ensemble | Implémenté | Stats + derniers leads |
| Dashboard - CRUD Propriétés | Implémenté | Créer, modifier, supprimer, lister |
| Dashboard - Gestion Leads | Implémenté | Statut, priorité, suppression inline |
| Dashboard - Branding | Implémenté | Standard + luxury (Enterprise) |
| Mini-site - Accueil | Implémenté | Standard + luxury |
| Mini-site - Liste biens | Implémenté | Paginé, standard + luxury |
| Mini-site - Détail bien | Implémenté | Galerie, contact, WhatsApp, similaires |
| Mini-site - Contact | Implémenté | Formulaire + carte + social |
| Mini-site - À propos | Implémenté | Standard + luxury avec stats |
| Page tarifs | Implémenté | 3 plans, FAQ, comparaison |
| i18n (FR/AR/EN) | Implémenté | ~120 clés par langue |
| Plan gating | Implémenté | Vérification limites par plan |
| Rate limiting leads | Implémenté | 5 req/min en mémoire |
| SEO (JSON-LD, metadata) | Implémenté | Agency, Property, Breadcrumb |
| Réseaux sociaux | Implémenté | API + embeds fallback |
| Tests (322+) | Implémenté | 15 fichiers Vitest |
| Gestion équipe (membres) | Schema DB uniquement | Table + RLS, pas d'UI |
| Analytics dashboard | Schema DB uniquement | Table + RLS, pas d'UI |
| Notifications | Schema DB uniquement | Table + RLS, pas d'UI |
| Abonnements/Facturation | Schema DB uniquement | Table + RLS, pas d'UI |
| Upload images biens | Partiel | Schema prêt, pas d'UI upload |
| Favoris visiteurs | Schema DB uniquement | Table + RLS, pas d'UI |
