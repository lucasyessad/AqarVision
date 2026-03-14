# AqarVision --- Plan de Développement Sprint par Sprint

## Contexte

AqarVision est une plateforme proptech composée de deux produits
principaux :

-   **AqarSearch** : marketplace publique immobilière.
-   **AqarPro** : CRM pour agences immobilières.

Objectif stratégique : 1. Lancer rapidement la marketplace. 2. Permettre
aux agences de publier leurs biens. 3. Ajouter progressivement les
modules avancés (IA, analytics, billing).

Durée d'un sprint : **2 semaines**.

------------------------------------------------------------------------

# Phase 1 --- Fondations techniques

## Sprint 1 --- Initialisation plateforme

### Objectif

Mettre en place l'infrastructure du projet.

### Architecture monorepo

    aqarvision/
      apps/
        web/
        mobile/
      packages/
        domain/
        database/
        api-client/
        ui-web/
        ui-mobile/
        analytics/
        security/
        config/

### Technologies

-   Next.js
-   TypeScript
-   Tailwind
-   Supabase
-   PostgreSQL + PostGIS
-   Expo mobile

### i18n

Langues supportées :

-   Français
-   Arabe (RTL)
-   Anglais
-   Espagnol

### Authentification

Supabase Auth :

-   email/password
-   PKCE mobile

### Résultat

Plateforme fonctionnelle avec :

-   login
-   signup
-   profil utilisateur
-   i18n
-   web + mobile

------------------------------------------------------------------------

## Sprint 2 --- Organisations (Agences)

### Tables

-   agencies
-   agency_branches
-   agency_memberships
-   agency_invites

### Backend

Fonctions :

-   createAgency
-   createBranch
-   inviteMember
-   acceptInvite

### UI AqarPro

Pages :

-   dashboard agence
-   gestion équipe
-   gestion branches

### Sécurité

Implémentation RLS :

-   agency_member_only
-   agency_admin_only

### Résultat

Les agences peuvent :

-   créer leur compte
-   inviter leur équipe
-   créer des branches

------------------------------------------------------------------------

# Phase 2 --- Cœur immobilier

## Sprint 3 --- Listings Core

### Tables

-   listings
-   listing_translations
-   listing_documents

### Backend

Actions :

-   createListing
-   updateListing
-   publishListing
-   archiveListing

### Traductions

Support multilingue :

-   FR
-   AR
-   EN
-   ES

### Résultat

Les agences peuvent :

-   créer des annonces
-   traduire
-   publier

------------------------------------------------------------------------

## Sprint 4 --- Media

### Tables

-   listing_media
-   listing_media_history

### Storage

Buckets :

-   listing-media
-   listing-documents

### Backend

-   createSignedUploadURL
-   finalizeUpload
-   reorderMedia
-   deleteMedia

### Résultat

Les annonces disposent :

-   galerie photo
-   image cover

------------------------------------------------------------------------

## Sprint 5 --- Marketplace (AqarSearch)

### Recherche

Filtres :

-   type transaction
-   type bien
-   prix
-   pièces
-   wilaya
-   commune
-   carte

### Pages

-   search
-   listing detail
-   agency profile

### SEO

Pages :

-   /buy
-   /rent
-   /wilaya
-   /listing slug

### Résultat

La marketplace publique est opérationnelle.

------------------------------------------------------------------------

# Phase 3 --- Conversion utilisateur

## Sprint 6 --- Leads + messagerie

### Tables

-   leads
-   conversations
-   messages

### Backend

-   createLead
-   sendMessage
-   listConversations

### Résultat

Les visiteurs peuvent contacter les agences.

------------------------------------------------------------------------

## Sprint 7 --- Favoris et alertes

### Tables

-   favorites
-   saved_searches
-   notes
-   view_history

### Features

-   sauvegarde annonces
-   sauvegarde recherches
-   notes privées
-   alertes

### Résultat

Engagement utilisateur amélioré.

------------------------------------------------------------------------

# Phase 4 --- Business model

## Sprint 8 --- Billing

### Tables

-   plans
-   subscriptions
-   agency_feature_entitlements

### Stripe

-   checkout
-   webhook
-   customer portal

### Plans

-   Starter
-   Pro
-   Enterprise

### Résultat

La plateforme devient monétisable.

------------------------------------------------------------------------

# Phase 5 --- Intelligence

## Sprint 9 --- IA

### Tables

-   ai_prompts
-   ai_jobs

### Fonctions IA

-   génération description
-   traduction automatique
-   résumé annonce

### Résultat

Gain de productivité pour les agences.

------------------------------------------------------------------------

# Phase 6 --- Qualité et supervision

## Sprint 10 --- Analytics + modération

### Tables

-   domain_events
-   listing_views
-   agency_stats_daily
-   audit_logs

### Admin

-   modération annonces
-   gestion abus
-   statistiques agences

### Résultat

Plateforme supervisée et scalable.

------------------------------------------------------------------------

# Timeline réaliste

### Développeur solo

8 à 12 mois.

### Petite équipe (3--5 personnes)

3 à 5 mois.

------------------------------------------------------------------------

# Résultat final

Après 10 sprints :

AqarVision comprend :

-   marketplace immobilière complète
-   CRM pour agences
-   mobile app
-   système IA
-   analytics
-   billing

La plateforme est prête pour une montée en charge nationale.
