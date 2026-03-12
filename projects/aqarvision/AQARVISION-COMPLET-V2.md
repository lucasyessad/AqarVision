# AqarVision - Documentation Technique Complète V2

> Audit complet du projet au 12 mars 2026

**Version** : 0.1.0
**Stack** : Next.js 14, TypeScript, Supabase, Tailwind CSS, Zod, Vitest
**Statut** : En developpement actif

---

## Table des matieres

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique detaillee](#2-stack-technique-detaillee)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Systeme de routes (App Router)](#4-systeme-de-routes-app-router)
5. [Base de donnees (19 tables + 1 vue)](#5-base-de-donnees-19-tables--1-vue)
6. [Server Actions (21 fichiers)](#6-server-actions-21-fichiers)
7. [Queries (8 fichiers)](#7-queries-8-fichiers)
8. [Validators Zod (6 fichiers)](#8-validators-zod-6-fichiers)
9. [Composants (80+ fichiers)](#9-composants-80-fichiers)
10. [API Routes (23 endpoints)](#10-api-routes-23-endpoints)
11. [Systeme de plans SaaS](#11-systeme-de-plans-saas)
12. [Configuration centralisee](#12-configuration-centralisee)
13. [Tests (24 fichiers de test)](#13-tests-24-fichiers-de-test)
14. [Edge Functions Supabase (4)](#14-edge-functions-supabase-4)
15. [Integrations externes](#15-integrations-externes)
16. [Problemes identifies et dette technique](#16-problemes-identifies-et-dette-technique)
17. [Arborescence complete des fichiers](#17-arborescence-complete-des-fichiers)

---

## 1. Vue d'ensemble

AqarVision est une **plateforme SaaS B2B** pour agences immobilieres algeriennes (et internationales). Elle offre :

- **Mini-sites vitrines** personnalises par agence (branding standard + luxury Enterprise)
- **Gestion de biens** CRUD complet avec images Cloudinary
- **CRM leads** avec pipeline kanban, scoring automatique, notes internes
- **Messagerie** conversations agence-visiteur
- **Analytics** evenements (vues, clics, conversions, partages)
- **Recherche avancee (AqarSearch)** avec filtres, carte Leaflet, score de confiance, alertes
- **Espace visiteur** favoris, historique, messages, profil
- **Admin panel** gestion utilisateurs, verifications agences, stats globales
- **i18n** multi-locale (fr/ar/en)
- **SEO** pages d'atterrissage par wilaya, JSON-LD, Open Graph
- **Paiements** Stripe (checkout, portal, webhooks)
- **IA** generation de descriptions via Anthropic SDK
- **Social** integration Instagram, Facebook, TikTok (feeds + publication automatique)

**3 plans tarifaires** : Starter (5 000 DA/mois), Pro (12 000 DA/mois), Enterprise (30 000 DA/mois)
**Essai gratuit** : 60 jours

---

## 2. Stack technique detaillee

| Technologie | Version | Role |
|---|---|---|
| Next.js | 14.2.21 | Framework full-stack (App Router, SSR, ISR) |
| TypeScript | ^5.7.2 | Typage statique |
| Supabase | ^2.47.10 | PostgreSQL, Auth, Storage, RLS, Edge Functions |
| @supabase/ssr | ^0.5.2 | Integration SSR (cookies) |
| Tailwind CSS | ^3.4.16 | Styles utilitaires |
| Zod | ^3.24.1 | Validation schemas |
| Vitest | ^2.1.8 | Tests unitaires |
| Radix UI | Dialog, Label, Select, Slot, Tooltip | Composants headless accessibles |
| Stripe | ^20.4.1 | Paiements |
| @anthropic-ai/sdk | ^0.36.3 | Generation IA descriptions |
| Cloudinary | ^2.9.0 | Stockage/transformation images |
| Leaflet + React-Leaflet | ^1.9.4 / ^4.2.1 | Cartes interactives |
| Resend | ^6.9.3 | Emails transactionnels |
| Upstash Redis | ^1.36.4 | Rate limiting |
| @sentry/nextjs | ^8.0.0 | Monitoring erreurs |
| lucide-react | ^0.577.0 | Icones |
| heic2any | ^0.0.4 | Conversion HEIC → JPEG |

**Fonts** : DM Serif Display, DM Sans, JetBrains Mono

---

## 3. Architecture du projet

```
src/
├── app/                           # Next.js App Router (routes)
│   ├── (auth)/                    # Route group : login, signup legacy
│   ├── (seo)/immobilier/          # SEO landing pages par wilaya
│   ├── [locale]/[agence]/         # Mini-sites i18n (fr/ar/en)
│   ├── admin/                     # Panel admin (dashboard, users, verifications, analytics)
│   ├── agence/[slug]/             # Mini-sites agences (standard + luxury)
│   ├── aqarpro/[slug]/            # Dashboard agence v2 (properties, leads, messages, analytics, settings)
│   ├── auth/                      # Auth routes (login, register, visiteur, callback, logout)
│   ├── dashboard/                 # Dashboard agence legacy (redirige vers aqarpro)
│   ├── espace/                    # Espace visiteur (favoris, historique, messages, profil)
│   ├── api/                       # 23 API routes
│   ├── bien/[id]/                 # Detail d'un bien
│   ├── recherche/                 # Recherche avancee AqarSearch
│   ├── alertes/                   # Gestion alertes de recherche
│   ├── calculateur/               # Simulateur hypothecaire
│   ├── comparer/                  # Comparateur de biens
│   ├── estimer/                   # Estimation de prix
│   ├── favoris/                   # Favoris (legacy)
│   ├── pricing/                   # Page tarifs
│   ├── pro/                       # Landing AqarPro
│   ├── prix-immobilier/           # Donnees marche
│   ├── profil/                    # Profil utilisateur
│   └── messages/                  # Messages (legacy)
│
├── components/                    # 80+ composants React
│   ├── agency/          (9)       # Hero, layout, contact, social, WhatsApp, luxury
│   ├── analytics/       (2)       # Trackers vue et clic
│   ├── branding/        (1)       # Trust badges
│   ├── dashboard/       (6)       # Sidebar, AI desc, image upload, kanban, export, theme
│   ├── favoris/         (3)       # Boutons favori, comparer, panneau comparaison
│   ├── messaging/       (4)       # Thread, input, liste, badge non-lu
│   ├── onboarding/      (3)       # Provider, Wizard, index
│   ├── profile/         (2)       # Formulaire profil, mot de passe
│   ├── property/        (5)       # Card, gallery, contact, calculator, estimator
│   ├── recherche/       (3)       # Barre hero, filtres globaux, grille resultats
│   ├── search/          (13)      # SearchBar, FilterPanel, ResultsWithMap, Map, Cards, Alerts, Trust
│   ├── seo/             (1)       # JSON-LD schema
│   ├── shared/          (6)       # Headers, footers marketing, carte annonce, langue switcher
│   ├── ui/              (17)      # Badge, breadcrumb, button, card, dialog, input, label, modal, select, skeleton, stat-card, table, textarea, toast, tooltip, verified-badge, empty-state
│   └── vitrine/         (4)       # Chatbot, filtres avances, galerie, bouton partage
│
├── lib/                           # Logique metier
│   ├── actions/         (21)      # Server Actions
│   ├── queries/         (8)       # Requetes Supabase
│   ├── validators/      (6)       # Schemas Zod
│   ├── supabase/        (5)       # Clients Supabase (admin, browser, client, middleware, server)
│   ├── constants/       (2)       # Constantes (index, themes)
│   ├── utils/           (2)       # Format, paths
│   ├── search/          (2)       # Filtres, trust score
│   ├── social/          (1)       # Fetch social feeds
│   ├── hooks/           (1)       # use-slug
│   └── (racine)         (11)      # agency-completeness, auth-utils, cloudinary, compression-image, email, favoris, i18n, lead-scoring, plan-gate, rate-limit, ratelimit, recherche, stripe, themes, validation, wilayas
│
├── hooks/                         # Custom React hooks
├── config/                        # Configuration centralisee (plans, locales, limites, pricing)
└── types/                         # TypeScript (database.ts, index.ts)
```

---

## 4. Systeme de routes (App Router)

### 4.1 Pages publiques

| Route | Type | Auth | Description |
|---|---|---|---|
| `/` | Server | Non | Landing page (hero, villes populaires, banner AqarPro) |
| `/recherche` | Server | Optionnel | Recherche avancee avec filtres, carte, pagination |
| `/bien/[id]` | Server | Non | Detail d'un bien (galerie, specs, contact, similaires) |
| `/agences` | Server | Non | Annuaire des agences |
| `/pricing` | Server | Non | Plans tarifaires avec matrice de fonctionnalites |
| `/pro` | Server | Non | Landing page AqarPro |
| `/calculateur` | Server | Non | Simulateur hypothecaire |
| `/comparer` | Server | Non | Comparateur de biens |
| `/estimer` | Server | Non | Estimateur de prix immobilier |
| `/prix-immobilier` | Server | Non | Donnees marche immobilier |
| `/alertes` | Server | Oui | Gestion des alertes de recherche |
| `/favoris` | Server | Oui | Biens favoris |

### 4.2 SEO Landing Pages

| Route | Type | Description |
|---|---|---|
| `/(seo)/immobilier` | Server | Page SEO globale (wilayas, types de biens) |
| `/(seo)/immobilier/[wilaya]` | Server | Page SEO par wilaya |

### 4.3 Mini-sites agences

| Route | Type | Description |
|---|---|---|
| `/agence/[slug]` | Server | Accueil agence (hero, biens recents, about, social) |
| `/agence/[slug]/biens` | Server | Tous les biens de l'agence |
| `/agence/[slug]/biens/[id]` | Server | Detail d'un bien (contexte agence) |
| `/agence/[slug]/a-propos` | Server | Page a propos |
| `/agence/[slug]/contact` | Server | Formulaire de contact |

**Layout agence** : Enterprise → `LuxuryLayout` avec video hero, couleurs premium. Standard → Layout professionnel avec theming (primary_color, accent_color, font_style, border_style).

### 4.4 Mini-sites i18n

| Route | Type | Description |
|---|---|---|
| `/[locale]/[agence]` | Server | Storefront multi-locale (fr/ar/en) avec chatbot |
| `/[locale]/[agence]/a-propos` | Server | A propos localise |
| `/[locale]/[agence]/contact` | Server | Contact localise |
| `/[locale]/[agence]/[annonce]` | Server | Detail annonce localisee |
| `/[locale]/recherche` | Server | Recherche localisee |

### 4.5 Dashboard agence (AqarPro) - `/aqarpro/[slug]/`

| Route | Auth | Description |
|---|---|---|
| `/dashboard` | Owner | Vue d'ensemble (stats, actions rapides) |
| `/properties` | Owner | Grille de biens (statuts, limites plan) |
| `/properties/new` | Owner | Creer un bien |
| `/properties/[id]/edit` | Owner | Editer un bien |
| `/leads` | Owner | Liste des leads (tableau) |
| `/leads/[id]` | Owner | Detail d'un lead |
| `/leads/kanban` | Owner | Vue pipeline kanban |
| `/messages` | Owner | Inbox conversations |
| `/messages/[id]` | Owner | Thread de conversation |
| `/analytics` | Owner | Analytics avances |
| `/notifications` | Owner | Centre de notifications |
| `/settings` | Owner | Parametres generaux |
| `/settings/billing` | Owner | Abonnement et facturation Stripe |
| `/settings/branding` | Owner | Personnalisation branding |
| `/settings/team` | Owner | Gestion equipe (roles admin/agent/viewer) |
| `/settings/verification` | Owner | Soumission badge verifie |

### 4.6 Dashboard legacy - `/dashboard/`

Redirige vers `/aqarpro/[slug]/dashboard`. Routes legacy encore presentes : annonces, leads, messages, analytics, branding, profil.

### 4.7 Espace visiteur - `/espace/`

| Route | Auth | Description |
|---|---|---|
| `/espace/favoris` | Visiteur | Biens favoris |
| `/espace/historique` | Visiteur | Historique de recherche |
| `/espace/messages` | Visiteur | Conversations avec agences |
| `/espace/messages/[id]` | Visiteur | Thread de conversation |
| `/espace/profil` | Visiteur | Parametres profil |

### 4.8 Admin - `/admin/`

| Route | Auth | Description |
|---|---|---|
| `/admin/dashboard` | Admin | Stats globales (agences, annonces, contacts, verifications) |
| `/admin/users` | Admin | Gestion utilisateurs |
| `/admin/verifications` | Admin | Review demandes de verification |
| `/admin/analytics` | Admin | Analytics plateforme |

### 4.9 Auth

| Route | Type | Description |
|---|---|---|
| `/auth/login` | Client | Connexion agence (email + password) |
| `/auth/register` | Client | Inscription agence |
| `/auth/visiteur/login` | Client | Connexion visiteur |
| `/auth/visiteur/register` | Client | Inscription visiteur |
| `/auth/mot-de-passe-oublie` | Client | Mot de passe oublie |
| `/auth/nouveau-mot-de-passe` | Client | Reset du mot de passe |
| `/auth/callback` | API Route | OAuth callback Supabase |
| `/auth/logout` | API Route | POST logout |
| `/(auth)/login` | Client | Login legacy (route group) |
| `/(auth)/signup` | Client | Signup legacy |

---

## 5. Base de donnees (19 tables + 1 vue)

### 5.1 Tables principales

| Table | Colonnes | Description |
|---|---|---|
| **agencies** | 40+ cols | Agences (branding, theme, localisation, verification, social) |
| **properties** | 25 cols | Biens immobiliers (titre, prix, surface, images[], features[], GPS) |
| **leads** | 18 cols | Leads/contacts (source, statut pipeline, priorite, budget, assignation) |
| **lead_notes** | 5 cols | Notes internes sur leads |
| **agency_members** | 12 cols | Membres equipe (roles: admin/agent/viewer) |
| **agency_wilayas** | 5 cols | Multi-region par agence |
| **favorites** | 4 cols | Biens favoris (UNIQUE user+property) |
| **conversations** | 9 cols | Conversations agence-visiteur (UNIQUE agency+user+property) |
| **messages** | 7 cols | Messages dans conversations (1-2000 chars) |
| **notifications** | 10 cols | Notifications in-app (11 types) |
| **subscriptions** | 14 cols | Abonnements (plan, status, billing, paiement algerien) |
| **analytics_events** | 10 cols | Evenements analytics (11+ types, JSONB data) |
| **property_views** | 8 cols | Tracking vues de biens |
| **media** | 13 cols | Gestion assets (property/branding/avatar/document) |
| **user_profiles** | 8 cols | Profils utilisateurs (auto-cree via trigger) |
| **saved_searches** | 17 cols | Recherches sauvegardees |
| **search_alerts** | 9 cols | Alertes (channel: in_app/email/both, frequence: instant/daily/weekly) |
| **search_history** | 5 cols | Historique de recherche (JSONB filters) |

### 5.2 Vue

| Vue | Description |
|---|---|
| **search_properties_view** | Vue jointe properties + agencies avec trust_score calcule (0-125 pts) |

### 5.3 Trust Score (poids)

| Critere | Points |
|---|---|
| Logo agence | +10 |
| Telephone agence | +10 |
| Email agence | +10 |
| Description agence | +10 |
| Registre commerce | +10 |
| Agence verifiee | +25 |
| >= 1 image bien | +10 |
| >= 3 images bien | +5 |
| Description bien | +10 |
| Coordonnees GPS | +10 |
| **Total max** | **120** |

### 5.4 RLS (Row Level Security)

Toutes les tables ont RLS active :

- **Public** : voir biens actifs, agences, media. Inserer leads, analytics, property_views
- **Utilisateur authentifie** : gerer ses favoris, profil, recherches, alertes, historique, notifications, conversations
- **Owner agence** : CRUD complet agence, biens, leads, membres, abonnements, analytics
- **Membres agence** (via `get_user_agency_ids()`) : voir biens/leads/analytics, gerer media

### 5.5 Functions PostgreSQL

| Fonction | Description |
|---|---|
| `update_updated_at()` | Trigger auto-maj `updated_at` |
| `get_user_agency_ids(uid)` | Retourne (agency_id, role) — SECURITY DEFINER, evite recursion RLS |
| `handle_new_user_profile()` | Auto-creation profil sur signup |
| `update_conversation_last_message()` | MAJ `last_message_at` sur nouveau message |

### 5.6 Historique migrations (10)

1. Reset & Setup (tables principales)
2. Drop legacy triggers
3. Fix recursion RLS avec `get_user_agency_ids()`
4. Branding themes + `agency_wilayas`
5. `search_properties_view`
6. `saved_searches`, `search_alerts`, `search_history`
7. `conversations` & `messages`
8. `user_profiles` avec trigger auto-signup
9. Verification agences
10. MAJ `search_properties_view` (is_verified, trust_score revise)

---

## 6. Server Actions (21 fichiers)

| Fichier | Fonctions principales |
|---|---|
| `ai.ts` | generateDescription() — generation IA via Anthropic |
| `ai-pricing.ts` | Estimation prix IA |
| `auth.ts` | signIn(), signUp(), signOut(), resetPassword() |
| `auth-utils.ts` | isAuthError() type guard |
| `branding.ts` | updateBranding(), uploadLogo(), uploadCover() |
| `compare.ts` | addToCompare(), removeFromCompare() |
| `export.ts` | exportLeadsCSV() |
| `favorites.ts` | toggleFavorite(), getFavorites() |
| `index.ts` | Re-exports |
| `lead-management.ts` | updateLeadStatus(), assignLead(), updateLeadPriority() |
| `lead-notes.ts` | addLeadNote(), getLeadNotes() |
| `leads.ts` | createLead(), getLeads(), getLeadById() |
| `messaging.ts` | sendMessage(), getConversations(), markAsRead() |
| `notifications.ts` | getNotifications(), markNotificationRead(), markAllRead() |
| `profile.ts` | updateProfile(), updatePassword() |
| `properties.ts` | createProperty(), updateProperty(), deleteProperty(), publishProperty() |
| `search.ts` | searchProperties(), saveSearch(), createAlert() |
| `search-history.ts` | recordSearch(), getSearchHistory() |
| `subscription.ts` | createCheckout(), getSubscription(), cancelSubscription() |
| `team.ts` | inviteMember(), removeMember(), updateMemberRole() |
| `verification.ts` | submitVerification(), getVerificationStatus() |

---

## 7. Queries (8 fichiers)

| Fichier | Fonctions |
|---|---|
| `agency.ts` | getAgencyBySlug(), getAgencyByOwnerId(), getAgencies() |
| `alerts.ts` | getUserAlerts(), getAlertById() |
| `analytics.ts` | getAgencyAnalytics(), getPropertyViews(), getEventsByType() |
| `favorites.ts` | getUserFavorites(), getUserFavoritesCount(), isFavorite() |
| `notifications.ts` | getUnreadCount(), getUserNotifications() |
| `search.ts` | searchProperties(), searchPropertiesCount(), getSearchPropertyById(), getSimilarProperties() |
| `subscription.ts` | getAgencySubscription(), checkTrialStatus() |
| `team.ts` | getAgencyMembers(), getMemberById() |

---

## 8. Validators Zod (6 fichiers)

| Fichier | Schemas |
|---|---|
| `agency.ts` | AgencySchema, AgencyUpdateSchema, BrandingSchema |
| `alert.ts` | SearchAlertSchema, AlertUpdateSchema |
| `index.ts` | Re-exports |
| `lead.ts` | LeadSchema, LeadUpdateSchema, LeadNoteSchema |
| `property.ts` | PropertySchema, PropertyUpdateSchema, PropertyFilterSchema |
| `search.ts` | SearchQuerySchema, SavedSearchSchema |

---

## 9. Composants (80+ fichiers)

### 9.1 Agency (9)

| Composant | Type | Description |
|---|---|---|
| `contact-form.tsx` | Client | Formulaire de contact agence |
| `location-map.tsx` | Client | Carte Leaflet localisation agence |
| `luxury-about-section.tsx` | Server | Section a propos version luxury |
| `luxury-hero.tsx` | Client | Hero video/image premium (Enterprise) |
| `luxury-layout.tsx` | Server | Layout complet luxury Enterprise |
| `luxury-properties-section.tsx` | Server | Grille biens version luxury |
| `social-feed-section.tsx` | Server | Section feed social (Instagram/Facebook/TikTok) |
| `social-feed-widget.tsx` | Client | Widget feed social compact |
| `whatsapp-button.tsx` | Client | Bouton WhatsApp flottant |

### 9.2 Dashboard (6)

| Composant | Description |
|---|---|
| `ai-description-generator.tsx` | Generateur IA de descriptions |
| `export-leads-button.tsx` | Export CSV des leads |
| `image-upload.tsx` | Upload images (multi, drag&drop, HEIC) |
| `leads-kanban.tsx` | Vue kanban pipeline leads |
| `sidebar.tsx` | Sidebar navigation dashboard |
| `theme-selector.tsx` | Selecteur de theme agence |

### 9.3 Search/Recherche (16)

| Composant | Description |
|---|---|
| `search-bar.tsx` | Barre de recherche avec suggestions |
| `filter-panel.tsx` | Panneau filtres (type, prix, surface, chambres) |
| `results-with-map.tsx` | Resultats + carte side-by-side |
| `search-map.tsx` / `search-map-inner.tsx` | Carte Leaflet avec marqueurs |
| `result-card.tsx` | Carte resultat de recherche |
| `contact-panel.tsx` | Panneau contact sur detail bien |
| `alert-button.tsx` | Creer une alerte de recherche |
| `compare-bar.tsx` / `compare-button.tsx` | Comparaison de biens |
| `favorite-button.tsx` | Toggle favori |
| `trust-badge.tsx` | Badge score de confiance |
| `saved-search-card.tsx` | Carte recherche sauvegardee |
| `view-toggle.tsx` | Toggle vue grille/liste |
| `result-empty-state.tsx` | Etat vide resultats |

### 9.4 Messaging (4)

`conversation-list.tsx`, `message-thread.tsx`, `message-input.tsx`, `unread-badge.tsx`

### 9.5 Property (5)

`property-card.tsx`, `property-gallery.tsx`, `contact-card.tsx`, `mortgage-calculator.tsx`, `price-estimator.tsx`

### 9.6 Vitrine (4)

`chatbot-vitrine.tsx` (chatbot IA sur mini-site), `filtres-avances.tsx`, `galerie-photos.tsx`, `bouton-partage.tsx`

### 9.7 Onboarding (3)

`OnboardingProvider.tsx`, `OnboardingWizard.tsx`, `index.ts` — wizard d'onboarding agence

### 9.8 UI (17 composants shadcn/ui)

badge, breadcrumb, button, card, dialog, empty-state, input, label, modal, select, skeleton, stat-card, table, textarea, toast, tooltip, verified-badge

### 9.9 Shared (6)

`marketing-header.tsx`, `marketing-footer.tsx`, `carte-annonce.tsx`, `bouton-contacter.tsx`, `bouton-favori.tsx`, `langue-switcher.tsx`, `assistant-description.tsx`

---

## 10. API Routes (23 endpoints)

### Admin
| Endpoint | Methode | Description |
|---|---|---|
| `/api/admin/stats` | GET | Stats globales plateforme |
| `/api/admin/users` | GET/POST | Gestion utilisateurs |
| `/api/admin/verifications` | GET/PATCH | Review verifications |

### Analytics
| Endpoint | Methode | Description |
|---|---|---|
| `/api/analytics/vue` | POST | Tracker vue de page |
| `/api/analytics/clic` | POST | Tracker clic |

### Messaging
| Endpoint | Methode | Description |
|---|---|---|
| `/api/conversations/create` | POST | Creer conversation |
| `/api/messages/send` | POST | Envoyer message |

### Notifications
| Endpoint | Methode | Description |
|---|---|---|
| `/api/notifications/contact` | POST | Notification de contact |

### Stripe
| Endpoint | Methode | Description |
|---|---|---|
| `/api/stripe/create-checkout` | POST | Session checkout Stripe |
| `/api/stripe/portal` | POST | Customer portal Stripe |
| `/api/stripe/webhook` | POST | Webhook Stripe (events) |

### Upload & IA
| Endpoint | Methode | Description |
|---|---|---|
| `/api/upload` | POST | Upload images Cloudinary |
| `/api/generer-description` | POST | Generation IA description bien |
| `/api/generer-description-agence` | POST | Generation IA description agence |

### Autres
| Endpoint | Methode | Description |
|---|---|---|
| `/api/email/send` | POST | Envoi email via Resend |
| `/api/favoris` | GET/POST/DELETE | Gestion favoris |
| `/api/historique` | GET/POST | Historique recherche |
| `/api/onboarding/status` | GET | Statut onboarding |
| `/api/onboarding/complete` | POST | Completer onboarding |
| `/api/whatsapp/send` | POST | Envoi message WhatsApp |
| `/api/whatsapp/webhook` | POST | Webhook WhatsApp |
| `/api/v1/properties` | GET/POST | API REST biens (publique) |
| `/api/v1/properties/[id]` | GET | Detail bien API REST |

---

## 11. Systeme de plans SaaS

### Limites par plan

| Limite | Starter | Pro | Enterprise |
|---|---|---|---|
| Biens publies | 15 | 50 | Illimite |
| Leads/mois | 30 | 150 | Illimite |
| Membres equipe | 1 | 5 | 20 |
| Stockage | 500 MB | 2 GB | 10 GB |
| Branding luxury | Non | Non | Oui |
| Domaine personnalise | Non | Non | Oui |
| Analytics avances | Non | Oui | Oui |
| Export leads CSV | Non | Oui | Oui |
| Integration sociale | Non | Oui | Oui |
| Biens sponsorises | 0 | 3 | Illimite |

### Tarification

| Plan | Mensuel | Trimestriel (-10%) | Annuel (-20%) |
|---|---|---|---|
| Starter | 5 000 DA | 13 500 DA | 48 000 DA |
| Pro | 12 000 DA | 32 400 DA | 115 200 DA |
| Enterprise | 30 000 DA | 81 000 DA | 288 000 DA |

### Methodes de paiement supportees

CCP, Baridi Mob, Virement, Cash, Dahabia (+ Stripe pour les paiements internationaux)

---

## 12. Configuration centralisee

Fichier : `src/config/index.ts`

| Categorie | Cle | Description |
|---|---|---|
| LOCALE | COUNTRY_CODE, CURRENCY, PHONE_PREFIX | DZ, DZD, 213 |
| COUNTRIES | 9 pays | DZ, FR, ES, AE, MA, TN, TR, US, GB |
| PLANS | 3 configs | Limites + pricing detailles |
| CACHE | PAGE_REVALIDATE, SOCIAL_FEED_TTL | 300s, 3600s |
| TIMEOUTS | EXTERNAL_API_MS | 8000ms |
| RATE_LIMIT | WINDOW_MS, MAX_REQUESTS | 60s, 5 req |
| UPLOADS | MAX_COVER_SIZE, MAX_LOGO_SIZE | 10MB, 5MB |
| PAGINATION | PROPERTIES_PER_PAGE | 12 |
| SEARCH | RESULTS_PER_PAGE, MAX_SAVED_SEARCHES, MAX_ALERTS | 12, 20, 10 |
| SOCIAL_API | Instagram, Facebook, TikTok bases + versions | |
| STORAGE | Bucket 'agencies', paths helpers | |
| MESSAGES | Templates WhatsApp | |
| UI | HEADER_SCROLL_THRESHOLD, COUNTER_ANIMATION_MS | 50px, 2000ms |

---

## 13. Tests (24 fichiers de test)

### Inventaire

| Fichier test | Module teste |
|---|---|
| `actions-branding.test.ts` | Server actions branding |
| `actions-create-lead.test.ts` | Creation de leads (validation plan) |
| `actions-lead-notes.test.ts` | Notes sur leads |
| `actions-leads.test.ts` | CRUD leads |
| `actions-notifications.test.ts` | Notifications |
| `actions-properties.test.ts` | CRUD properties |
| `actions-team.test.ts` | Gestion equipe |
| `agency-completeness.test.ts` | Score completude agence |
| `agency-pages-logic.test.ts` | Logique pages agence |
| `auth.test.ts` | Authentification |
| `config-extended.test.ts` | Configuration etendue |
| `config.test.ts` | Configuration de base |
| `database-types.test.ts` | Types database |
| `format.test.ts` | Utilitaires formatage |
| `i18n.test.ts` | Internationalisation |
| `lead-scoring.test.ts` | Scoring automatique leads |
| `next-image-compliance.test.ts` | Conformite next/image (pas de `<img>`) |
| `plan-config.test.ts` | Configuration plans |
| `plan-gate.test.ts` | Plan gating (limites) |
| `property-validator.test.ts` | Validation proprietes |
| `social.test.ts` | Integration sociale |
| `v2-pages-logic.test.ts` | Logique pages V2 |
| `validators-extended.test.ts` | Validators etendus |
| `validators.test.ts` | Validators de base |

### Helpers

- `__tests__/helpers/` — Mocks Supabase et utilitaires de test

### Configuration

- `vitest.config.ts` — Configuration Vitest avec alias `@/` vers `src/`

---

## 14. Edge Functions Supabase (4)

| Fonction | Trigger | Description |
|---|---|---|
| `match-new-property` | INSERT/UPDATE properties (status → active) | Notifie les utilisateurs avec alertes correspondantes (in-app + email) |
| `notify-new-lead` | INSERT leads | Email + notification in-app au proprietaire d'agence |
| `publish-to-social` | INSERT/UPDATE properties (status → active) | Publication auto sur Facebook Pages + Instagram Business |
| `send-alert-email` | Scheduled (daily) | Envoi batch alertes quotidiennes (max 5 biens/email) |

---

## 15. Integrations externes

| Service | Usage | Config |
|---|---|---|
| **Supabase** | BDD, Auth, Storage, Edge Functions | SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY |
| **Stripe** | Paiements, abonnements | STRIPE_SECRET_KEY, WEBHOOK_SECRET |
| **Anthropic** | Generation IA descriptions | ANTHROPIC_API_KEY |
| **Cloudinary** | Stockage/transformation images | CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET |
| **Resend** | Emails transactionnels | RESEND_API_KEY |
| **Upstash Redis** | Rate limiting | UPSTASH_REDIS_REST_URL, TOKEN |
| **Sentry** | Monitoring erreurs | SENTRY_DSN, AUTH_TOKEN, ORG, PROJECT |
| **Instagram Graph API** | Feed social | Via tokens agence |
| **Facebook Graph API** | Feed social + publication | Via tokens agence |
| **TikTok API** | Feed social | Via tokens agence |
| **WhatsApp** | Envoi messages + webhook | Via API |

---

## 16. Problemes identifies et dette technique

### 16.1 Routes dupliquees / legacy

- **Dashboard** : `/dashboard/` (legacy) ET `/aqarpro/[slug]/` (v2) coexistent. Le legacy redirige mais les routes sont encore presentes
- **Auth** : `/(auth)/login` ET `/auth/login` — deux systemes de login
- **Favoris** : `/favoris` ET `/espace/favoris` — duplication
- **Messages** : `/messages/` ET `/espace/messages/` ET `/dashboard/messages/` — triple

**Recommandation** : Supprimer les routes legacy et unifier sur `/aqarpro/` (agences) et `/espace/` (visiteurs)

### 16.2 Schemas i18n

- `/[locale]/[agence]` utilise une table `profiles` (legacy) differente de la table `agencies` (actuelle)
- Le systeme i18n (`lib/i18n.ts`) et les mini-sites `/agence/[slug]` ne partagent pas la meme logique

**Recommandation** : Unifier le modele de donnees des mini-sites i18n sur la table `agencies`

### 16.3 Fichiers utilitaires en double

- `lib/rate-limit.ts` ET `lib/ratelimit.ts` — deux fichiers rate limiting
- `lib/favoris.ts` ET `lib/actions/favorites.ts` — logique favoris dupliquee
- `lib/auth-utils.ts` ET `lib/actions/auth-utils.ts` — utilitaires auth dupliques

### 16.4 Tests

- **24 fichiers de test** existants couvrent principalement la logique metier (actions, config, validators)
- **Aucun test de composant** React (pas de @testing-library/react)
- **Aucun test E2E** (Playwright/Cypress absent des deps)
- **Couverture reelle inconnue** (pas de rapport de coverage recent)

### 16.5 TypeScript

- Types bien definis dans `database.ts` mais pas de generation automatique depuis Supabase (`supabase gen types`)
- Certains composants utilisent `any` implicite

### 16.6 Points d'attention

- **Pas de middleware d'auth centralise** pour les routes protegees — chaque layout fait son propre check
- **Pas de systeme de permissions granulaire** — seul le owner_id est verifie, les roles des membres (admin/agent/viewer) ne sont pas toujours respectes
- **Variables d'environnement** necessaires mais pas documentees dans un `.env.example`
- **AqarSearch** utilise `aqarsearch/` comme sous-dossier mais son integration n'est pas claire

---

## 17. Arborescence complete des fichiers

### Server Actions (21)

```
lib/actions/
├── ai.ts                    # IA description generation
├── ai-pricing.ts            # IA pricing estimation
├── auth.ts                  # Authentication flows
├── auth-utils.ts            # Auth type guards
├── branding.ts              # Agency branding CRUD
├── compare.ts               # Property comparison
├── export.ts                # CSV export leads
├── favorites.ts             # Favorites toggle
├── index.ts                 # Re-exports
├── lead-management.ts       # Lead pipeline management
├── lead-notes.ts            # Lead internal notes
├── leads.ts                 # Lead CRUD
├── messaging.ts             # Messaging system
├── notifications.ts         # Notifications management
├── profile.ts               # User profile
├── properties.ts            # Property CRUD
├── search.ts                # Search + saved searches + alerts
├── search-history.ts        # Search history recording
├── subscription.ts          # Stripe subscription
├── team.ts                  # Team member management
└── verification.ts          # Agency verification
```

### Queries (8)

```
lib/queries/
├── agency.ts                # Agency lookups
├── alerts.ts                # Search alerts
├── analytics.ts             # Analytics data
├── favorites.ts             # User favorites
├── notifications.ts         # Notification queries
├── search.ts                # Property search (view-based)
├── subscription.ts          # Subscription status
└── team.ts                  # Team members
```

### Validators (6)

```
lib/validators/
├── agency.ts                # Agency + branding schemas
├── alert.ts                 # Search alert schemas
├── index.ts                 # Re-exports
├── lead.ts                  # Lead schemas
├── property.ts              # Property schemas
└── search.ts                # Search query schemas
```

### Lib racine (15+ fichiers)

```
lib/
├── agency-completeness.ts   # Score completude agence (% rempli)
├── auth-utils.ts            # Auth utilities
├── cloudinary.ts            # Upload Cloudinary
├── compression-image.ts     # Compression client-side
├── email.ts                 # Resend email templates
├── favoris.ts               # Favoris logic (legacy)
├── i18n.ts                  # Internationalisation
├── lead-scoring.ts          # Scoring automatique des leads
├── plan-gate.ts             # Verification limites plan SaaS
├── rate-limit.ts            # Rate limiting Upstash
├── ratelimit.ts             # Rate limiting (doublon)
├── recherche.ts             # Search helpers
├── stripe.ts                # Stripe client setup
├── themes.ts                # Theme definitions
├── utils.ts                 # cn() utility (Tailwind merge)
├── validation.ts            # Shared validation
├── wilayas.ts               # 58 wilayas d'Algerie
├── constants/index.ts       # App constants
├── constants/themes.ts      # Theme constants
├── hooks/use-slug.ts        # Hook extraction slug URL
├── search/filters.ts        # Search filter logic
├── search/trust-score.ts    # Trust score calculation
├── social/fetch-feed.ts     # Social media feed fetcher
├── supabase/admin.ts        # Admin client (service role)
├── supabase/browser.ts      # Browser client
├── supabase/client.ts       # Generic client
├── supabase/middleware.ts    # Auth middleware
├── supabase/server.ts       # Server client (cookies)
└── utils/
    ├── format.ts            # Formatage prix, dates, surfaces
    └── paths.ts             # URL path helpers
```

---

*Document genere le 12 mars 2026 — Analyse exhaustive du code source, base de donnees, et architecture.*
