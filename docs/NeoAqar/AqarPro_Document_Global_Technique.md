# AqarPro — Document Global Technique

> Traduction technique de la vision produit AqarPro en architecture fonctionnelle, modules, routes, données, permissions et logique d’implémentation

**Version** : 1.0  
**Statut** : Spécification technique consolidée  
**Produit parent** : AqarVision  
**Branche concernée** : AqarPro  
**Objectif** : définir la base technique propre de la branche professionnelle destinée aux agences immobilières

---

# Table des matières

1. [Définition de AqarPro](#1-définition-de-aqarpro)
2. [Objectif technique](#2-objectif-technique)
3. [Rôle dans l’écosystème AqarVision](#3-rôle-dans-lécosystème-aqarvision)
4. [Principes d’architecture](#4-principes-darchitecture)
5. [Périmètre fonctionnel](#5-périmètre-fonctionnel)
6. [Modules principaux](#6-modules-principaux)
7. [Nouvelles routes AqarPro](#7-nouvelles-routes-aqarpro)
8. [Structure de dashboard recommandée](#8-structure-de-dashboard-recommandée)
9. [Gestion des annonces](#9-gestion-des-annonces)
10. [Gestion des médias](#10-gestion-des-médias)
11. [Système de mini-vitrines](#11-système-de-mini-vitrines)
12. [Système de thèmes](#12-système-de-thèmes)
13. [Branding et personnalisation](#13-branding-et-personnalisation)
14. [Dashboard personnalisable](#14-dashboard-personnalisable)
15. [Leads, messages et demandes de visite](#15-leads-messages-et-demandes-de-visite)
16. [Gestion d’équipe et permissions](#16-gestion-déquipe-et-permissions)
17. [IA intégrée dans AqarPro](#17-ia-intégrée-dans-aqarpro)
18. [Analytics et pilotage](#18-analytics-et-pilotage)
19. [Intégration avec AqarSearch](#19-intégration-avec-aqarsearch)
20. [Modèle de données recommandé](#20-modèle-de-données-recommandé)
21. [Tables à créer ou enrichir](#21-tables-à-créer-ou-enrichir)
22. [Règles de visibilité et d’exposition](#22-règles-de-visibilité-et-dexposition)
23. [Validators Zod](#23-validators-zod)
24. [Server Actions](#24-server-actions)
25. [Queries](#25-queries)
26. [API routes éventuelles](#26-api-routes-éventuelles)
27. [Composants UI à créer](#27-composants-ui-à-créer)
28. [Règles de permissions](#28-règles-de-permissions)
29. [Sécurité et RLS](#29-sécurité-et-rls)
30. [Configuration centralisée](#30-configuration-centralisée)
31. [Tests à ajouter](#31-tests-à-ajouter)
32. [Arborescence recommandée](#32-arborescence-recommandée)
33. [Plan d’implémentation par phases](#33-plan-dimplémentation-par-phases)
34. [Prompt maître pour Claude Code](#34-prompt-maître-pour-claude-code)

---

# 1. Définition de AqarPro

AqarPro est la branche professionnelle de AqarVision.

Elle permet à une agence immobilière de :

- gérer ses annonces
- gérer ses médias
- gérer son branding
- publier une mini-vitrine
- centraliser ses leads
- centraliser ses messages
- suivre les demandes de visite
- gérer une petite équipe
- exploiter des aides IA intégrées
- piloter sa présence digitale depuis un espace unique

AqarPro n’est pas un simple back-office d’annonces.  
C’est un **cockpit digital professionnel**.

---

# 2. Objectif technique

Sur le plan technique, AqarPro doit fournir une base claire, modulaire et évolutive pour :

- l’administration agence
- la production d’annonces
- la gestion éditoriale
- la gestion commerciale légère
- la personnalisation de la présence digitale
- l’intégration des signaux venant de AqarSearch

Le système doit rester :

- modulaire
- propre
- typé
- compatible avec Next.js App Router
- compatible avec Supabase et RLS
- facile à faire évoluer sans casser l’existant

---

# 3. Rôle dans l’écosystème AqarVision

AqarPro est la source de vérité principale pour :

- agences
- branding
- propriétés
- statuts de publication
- leads
- membres d’agence
- demandes de visite
- conversations agence
- configuration de mini-vitrine
- thèmes appliqués
- contenus générés par IA liés à l’agence

AqarSearch dépend de AqarPro pour exposer l’offre publique.

---

# 4. Principes d’architecture

## 4.1 Source de vérité
AqarPro reste la source métier centrale pour tous les objets “agence”.

## 4.2 Monolithe modulaire
AqarPro doit vivre dans le même repo que AqarSearch et les autres briques AqarVision, mais avec une séparation claire des domaines.

## 4.3 Logique métier centralisée
Les règles métier ne doivent pas être dispersées dans les pages.
Elles doivent être isolées dans des modules dédiés :
- actions
- queries
- services
- validators

## 4.4 Interface premium mais pragmatique
Le système doit viser une expérience haut de gamme sans créer une architecture inutilement complexe.

---

# 5. Périmètre fonctionnel

AqarPro doit couvrir :

- dashboard agence
- gestion des annonces
- gestion des médias
- mini-vitrines
- thèmes vitrines
- branding
- dashboard personnalisable
- leads
- messagerie
- demandes de visite
- gestion d’équipe
- IA intégrée
- analytics utiles
- paramètres agence
- gestion du plan et de la montée en gamme

---

# 6. Modules principaux

Les grands modules de AqarPro sont :

1. **Agences**
2. **Annonces**
3. **Médias**
4. **Mini-vitrines**
5. **Thèmes**
6. **Branding**
7. **Dashboard**
8. **Leads**
9. **Messagerie**
10. **Demandes de visite**
11. **Équipe**
12. **IA**
13. **Analytics**
14. **Abonnement / plan**
15. **Paramètres**

---

# 7. Nouvelles routes AqarPro

Structure recommandée :

```txt
src/app/aqarpro/[slug]/
  dashboard/
    page.tsx
  properties/
    page.tsx
    new/page.tsx
    [id]/edit/page.tsx
    [id]/media/page.tsx
  leads/
    page.tsx
    [id]/page.tsx
    kanban/page.tsx
  messages/
    page.tsx
    [id]/page.tsx
  visit-requests/
    page.tsx
    [id]/page.tsx
  vitrine/
    page.tsx
    preview/page.tsx
    themes/page.tsx
    pages/page.tsx
  branding/
    page.tsx
  dashboard-layout/
    page.tsx
  media/
    page.tsx
  analytics/
    page.tsx
  team/
    page.tsx
  settings/
    page.tsx
    billing/page.tsx
    verification/page.tsx
    integrations/page.tsx
```

---

# 8. Structure de dashboard recommandée

Le dashboard doit être structuré autour de blocs réorganisables.

## Blocs candidats
- nouveaux leads
- messages récents
- demandes de visite
- biens publiés
- biens brouillons
- annonces à améliorer
- complétude agence
- performance des annonces
- aperçu vitrine
- actions rapides

## Principe technique
Le dashboard doit pouvoir stocker une préférence de layout par agence ou par utilisateur propriétaire.

---

# 9. Gestion des annonces

## Fonctions attendues
- créer un bien
- modifier un bien
- supprimer un bien
- publier
- dépublier
- archiver
- dupliquer
- marquer comme mis en avant
- gérer statut commercial
- gérer contenus texte
- gérer média principal
- gérer galerie

## Champs fonctionnels minimum
- titre
- description
- prix
- devise
- type de bien
- transaction
- surface
- pièces
- salles de bain
- pays
- wilaya
- commune
- ville
- adresse
- coordonnées GPS
- caractéristiques
- images
- vidéos
- statut
- date de publication

## Enrichissements
- version de texte générée par IA
- niveau de complétude
- score qualité annonce interne

---

# 10. Gestion des médias

## Objectif
Faire des médias un module fort, pas un simple champ annexe.

## Fonctions
- upload image
- upload vidéo
- conversion si nécessaire
- prévisualisation
- réordonnancement
- suppression
- définition de l’image principale
- assignation à un bien ou à la vitrine
- assignation au branding agence

## Types de médias
- propriété
- branding
- vitrine
- équipe
- document si besoin plus tard

---

# 11. Système de mini-vitrines

Chaque agence dispose d’un mini-site public.

## Fonctions
- générer une home agence
- afficher les biens
- afficher la page à propos
- afficher la page contact
- afficher éventuellement équipe, services, zones couvertes
- afficher des sections différentes selon le thème

## Principe
La mini-vitrine ne doit pas être une simple vue technique du catalogue.
Elle doit être pensée comme une vraie présence digitale.

---

# 12. Système de thèmes

## Règle produit
Les thèmes sont de vrais templates complets, pas des skins.

## Différences structurelles possibles
- hero centré image
- hero éditorial
- home orientée agence
- home orientée biens
- home orientée premium / luxe
- home orientée institutionnelle
- sections différentes
- ordre différent des blocs
- navigation différente

## Règle par plan
- Starter : 2 thèmes
- Pro : 5 thèmes
- Enterprise : tous les thèmes + personnalisation avancée

## Technique recommandée
Créer un registre de thèmes :
- métadonnées thème
- disponibilités par plan
- composants sections
- règles de mise en page

---

# 13. Branding et personnalisation

## Branding de base
- logo
- couverture
- couleurs
- slogan
- description agence
- coordonnées
- réseaux sociaux

## Branding avancé
- variations de sections
- polices ou styles encadrés
- éléments premium du thème
- choix de mise en avant de certaines sections
- personnalisation avancée réservée à Enterprise

## Objectif
Permettre à l’agence de se différencier sans casser la cohérence du système.

---

# 14. Dashboard personnalisable

## Vision
Le dashboard doit être personnalisable, mais dans un cadre maîtrisé.

## Ce que l’agence peut faire
- choisir l’ordre des blocs
- masquer certains blocs
- épingler des blocs importants
- définir ses actions rapides prioritaires

## Ce que l’agence ne doit pas faire
- construire librement une interface totalement ouverte
- casser les usages centraux du produit

## Stockage recommandé
Préférences dashboard dans une table dédiée :
- niveau agence
- éventuellement override par utilisateur

---

# 15. Leads, messages et demandes de visite

## Leads
AqarPro doit centraliser :
- formulaires de contact
- contacts depuis fiche bien
- signaux de AqarSearch
- leads directs

## Messages
AqarPro doit centraliser :
- conversations ouvertes depuis AqarSearch
- conversations liées à une agence
- conversations éventuellement liées à un bien

## Demandes de visite
AqarPro doit recevoir les demandes de visite comme objets lisibles, contextualisés, traçables.

## Données de contexte minimales
- agence
- bien éventuel
- utilisateur ou visiteur
- origine
- message
- date
- statut

---

# 16. Gestion d’équipe et permissions

## Rôles
- owner
- admin
- agent
- viewer

## Actions possibles
- invitation
- suppression
- changement de rôle

## Permissions recommandées
### Owner
- tous les droits

### Admin
- annonces
- leads
- messages
- branding
- équipe partielle selon règle
- analytics

### Agent
- annonces limitées
- leads
- messages
- demandes de visite

### Viewer
- lecture seulement ou très limitée

## Point important
Les permissions ne doivent pas se résumer à owner_id.  
Il faut une vraie logique de rôle.

---

# 17. IA intégrée dans AqarPro

## Vision
L’IA est un ensemble de micro-assistances discrètes.

## Cas d’usage
### Annonce
- générer titre
- générer description
- reformuler
- améliorer style
- proposer une version courte ou premium

### Agence
- générer description agence
- générer slogan
- reformuler page à propos

### Communication
- rédiger email
- rédiger réponse type
- rédiger message marketing
- rédiger post social

### Qualité
- suggérer ce qui manque
- suggérer des améliorations
- détecter une annonce trop faible

## Règle UX
Toujours contextuel :
- bouton discret
- action courte
- résultat éditable

---

# 18. Analytics et pilotage

## Données utiles
- nombre de biens
- nombre de leads
- messages reçus
- demandes de visite
- biens les plus consultés
- annonces incomplètes
- performance des thèmes
- performance de la vitrine
- performance des annonces

## Objectif
Aider à piloter, pas juste à afficher des chiffres.

## Affichages possibles
- cartes de synthèse
- listes actionnables
- alertes d’amélioration
- vues par période

---

# 19. Intégration avec AqarSearch

AqarPro doit recevoir depuis AqarSearch :
- vues
- clics
- messages
- favoris si utile comme signal agrégé
- demandes de visite
- leads

AqarPro doit exposer vers AqarSearch :
- biens actifs
- agences visibles
- métadonnées publiques
- branding public
- contexte de réactivité agence

---

# 20. Modèle de données recommandé

Le modèle de données AqarPro doit couvrir au minimum :

- `agencies`
- `agency_members`
- `properties`
- `media`
- `leads`
- `lead_notes`
- `conversations`
- `messages`
- `visit_requests`
- `subscriptions`
- `notifications`
- `analytics_events`

Enrichissements recommandés :
- `agency_theme_settings`
- `agency_vitrine_pages`
- `agency_dashboard_preferences`
- `agency_ai_generations`
- `agency_media_collections`
- `agency_verifications`

---

# 21. Tables à créer ou enrichir

## 21.1 `agency_theme_settings`
Stocke :
- thème sélectionné
- variantes
- réglages de sections
- options de personnalisation liées au plan

## 21.2 `agency_vitrine_pages`
Permet de gérer des contenus éditoriaux :
- accueil
- à propos
- services
- équipe
- zones couvertes

## 21.3 `agency_dashboard_preferences`
Stocke :
- ordre des widgets
- widgets masqués
- widgets épinglés

## 21.4 `agency_ai_generations`
Historise les contenus générés par IA :
- type
- contexte
- texte généré
- version retenue
- auteur

## 21.5 `visit_requests`
Si la table n’existe pas ou n’est pas suffisante, elle doit devenir un objet propre.

## 21.6 `agency_media_collections`
Permet d’organiser les médias d’agence :
- branding
- vitrines
- institutionnel
- biens

---

# 22. Règles de visibilité et d’exposition

Une annonce peut être visible publiquement si :
- elle est publiée
- elle appartient à une agence active
- les minima de qualité sont atteints
- aucun blocage n’existe

Une vitrine peut être visible si :
- l’agence est active
- le thème est valide
- la configuration publique est cohérente

Les éléments internes ne doivent jamais fuiter :
- notes internes
- préférences dashboard
- données privées équipe
- brouillons non publiés

---

# 23. Validators Zod

Créer ou renforcer :

- `agency.ts`
- `branding.ts`
- `property.ts`
- `property-media.ts`
- `theme.ts`
- `dashboard-preferences.ts`
- `lead.ts`
- `message.ts`
- `visit-request.ts`
- `team.ts`
- `ai.ts`

Chaque validator doit couvrir :
- structure
- types
- tailles maximales
- cohérence métier minimale

---

# 24. Server Actions

Créer ou structurer :

## `properties.ts`
- createProperty
- updateProperty
- deleteProperty
- publishProperty
- archiveProperty
- duplicateProperty

## `media.ts`
- uploadPropertyMedia
- deleteMedia
- reorderMedia
- setPrimaryMedia

## `branding.ts`
- updateAgencyBranding
- updateAgencyTheme
- updateThemeSettings

## `vitrine.ts`
- updateVitrinePage
- previewVitrine
- publishVitrineChanges

## `dashboard-preferences.ts`
- saveDashboardPreferences
- resetDashboardPreferences

## `leads.ts`
- updateLeadStatus
- assignLead
- addLeadNote

## `messaging.ts`
- sendAgencyMessage
- markConversationRead

## `visit-requests.ts`
- updateVisitRequestStatus

## `team.ts`
- inviteMember
- updateMemberRole
- removeMember

## `ai.ts`
- generatePropertyTitle
- generatePropertyDescription
- improveAgencyDescription
- generateMarketingText

Toutes les actions doivent retourner un contrat simple :
```ts
{
  success: boolean
  error?: string
}
```

---

# 25. Queries

Prévoir ou renforcer :

- `agency.ts`
- `agency-theme.ts`
- `agency-vitrine.ts`
- `agency-dashboard.ts`
- `properties.ts`
- `media.ts`
- `leads.ts`
- `messages.ts`
- `visit-requests.ts`
- `analytics.ts`
- `team.ts`

L’objectif est d’éviter la logique de requête directement dispersée dans les pages.

---

# 26. API routes éventuelles

À utiliser seulement si nécessaire pour :
- upload
- webhooks
- intégrations externes
- génération IA asynchrone
- endpoints REST externes

Exemples :
- `/api/upload`
- `/api/ai/generate-property-description`
- `/api/ai/generate-agency-copy`
- `/api/webhooks/stripe`
- `/api/webhooks/social`

---

# 27. Composants UI à créer

```txt
src/components/aqarpro/
```

## Dossiers recommandés
- `dashboard/`
- `properties/`
- `media/`
- `vitrine/`
- `branding/`
- `leads/`
- `messages/`
- `team/`
- `analytics/`
- `ai/`

## Composants clés
- `dashboard-widget.tsx`
- `dashboard-layout-editor.tsx`
- `property-form.tsx`
- `property-status-badge.tsx`
- `media-manager.tsx`
- `media-gallery-editor.tsx`
- `theme-picker.tsx`
- `theme-preview-card.tsx`
- `vitrine-preview.tsx`
- `branding-form.tsx`
- `lead-list.tsx`
- `lead-kanban.tsx`
- `conversation-list.tsx`
- `message-thread.tsx`
- `visit-request-list.tsx`
- `team-table.tsx`
- `ai-action-button.tsx`
- `ai-generated-panel.tsx`

---

# 28. Règles de permissions

## Sans authentification
Aucun accès AqarPro.

## Authentifié hors agence
Pas d’accès à AqarPro, sauf onboarding agence si prévu.

## Owner agence
Accès total.

## Membres agence
Accès limité selon rôle.

## Règle
Les permissions doivent être appliquées :
- dans les layouts
- dans les actions
- dans les requêtes
- dans les policies RLS

---

# 29. Sécurité et RLS

Toutes les données agence sensibles doivent être protégées.

## À restreindre strictement
- configuration interne
- dashboard preferences
- messages internes
- notes leads
- données équipe
- abonnement
- contenus IA non publics

## Vérifications côté serveur
Même avec RLS :
- vérifier session
- vérifier rôle
- vérifier agence cible
- vérifier contexte du bien ou de la conversation

---

# 30. Configuration centralisée

Le fichier de config doit inclure :

- plans
- nombre de thèmes par plan
- quotas médias
- limites équipe
- options IA par plan
- options branding par plan
- options vitrines par plan
- limites analytics par plan

---

# 31. Tests à ajouter

## Validators
- agency-branding.test.ts
- theme-settings.test.ts
- dashboard-preferences.test.ts
- media.test.ts
- ai.test.ts

## Actions
- actions-properties.test.ts
- actions-media.test.ts
- actions-branding.test.ts
- actions-dashboard-preferences.test.ts
- actions-team.test.ts
- actions-messaging.test.ts
- actions-visit-requests.test.ts
- actions-ai.test.ts

## Logique métier
- permissions par rôle
- disponibilité des thèmes par plan
- personnalisation dashboard
- publication vitrine
- gestion image principale
- visibilité publique d’une annonce

---

# 32. Arborescence recommandée

```txt
src/
├── app/
│   └── aqarpro/
│       └── [slug]/
│           ├── dashboard/page.tsx
│           ├── properties/
│           ├── leads/
│           ├── messages/
│           ├── visit-requests/
│           ├── vitrine/
│           ├── branding/
│           ├── media/
│           ├── analytics/
│           ├── team/
│           └── settings/
│
├── components/
│   └── aqarpro/
│       ├── dashboard/
│       ├── properties/
│       ├── media/
│       ├── vitrine/
│       ├── branding/
│       ├── leads/
│       ├── messages/
│       ├── team/
│       ├── analytics/
│       └── ai/
│
├── lib/
│   ├── actions/
│   │   ├── properties.ts
│   │   ├── media.ts
│   │   ├── branding.ts
│   │   ├── vitrine.ts
│   │   ├── dashboard-preferences.ts
│   │   ├── leads.ts
│   │   ├── messaging.ts
│   │   ├── visit-requests.ts
│   │   ├── team.ts
│   │   └── ai.ts
│   ├── queries/
│   │   ├── agency.ts
│   │   ├── agency-theme.ts
│   │   ├── agency-vitrine.ts
│   │   ├── agency-dashboard.ts
│   │   ├── properties.ts
│   │   ├── media.ts
│   │   ├── leads.ts
│   │   ├── messages.ts
│   │   ├── visit-requests.ts
│   │   ├── analytics.ts
│   │   └── team.ts
│   └── validators/
│       ├── agency.ts
│       ├── branding.ts
│       ├── property.ts
│       ├── property-media.ts
│       ├── theme.ts
│       ├── dashboard-preferences.ts
│       ├── lead.ts
│       ├── message.ts
│       ├── visit-request.ts
│       ├── team.ts
│       └── ai.ts
```

---

# 33. Plan d’implémentation par phases

## Phase 1 — socle agence
- structure AqarPro propre
- routes principales
- permissions
- annonces
- branding

## Phase 2 — vitrines et thèmes
- registre de thèmes
- disponibilité par plan
- mini-vitrines structurées
- preview vitrine

## Phase 3 — dashboard et médias
- dashboard personnalisable
- média manager
- image principale
- galeries

## Phase 4 — leads et relation client
- leads
- messages
- demandes de visite
- contexte bien/agence

## Phase 5 — IA et montée en gamme
- actions IA
- génération de contenus
- assistance qualité
- enrichissements premium

## Phase 6 — analytics et optimisation
- analytics utiles
- pilotage
- optimisation UX
- amélioration des workflows

---

# 34. Prompt maître pour Claude Code

```txt
Construis AqarPro comme la branche professionnelle de AqarVision.

Objectif :
Créer une plateforme professionnelle complète permettant aux agences immobilières de gérer leurs annonces, leurs vitrines, leurs contenus, leurs leads, leurs messages, leurs médias, leur équipe et une partie de leur production assistée par IA depuis un espace unique.

Contraintes :
- AqarPro doit rester simple, premium et crédible
- ce n’est pas un simple back-office d’annonces
- les mini-vitrines doivent être de vrais thèmes complets
- le nombre de thèmes dépend du plan :
  - Starter : 2
  - Pro : 5
  - Enterprise : tous + personnalisation avancée
- le dashboard doit être personnalisable
- l’IA doit être présente presque partout, mais de manière discrète
- toutes les permissions doivent être respectées selon les rôles

À structurer :
1. dashboard agence
2. gestion des annonces
3. gestion des médias
4. système de mini-vitrines
5. système de thèmes
6. branding
7. leads
8. messagerie
9. demandes de visite
10. gestion d’équipe
11. analytics
12. actions IA

À produire :
- routes propres
- modules métier
- server actions
- validators
- queries
- composants UI
- règles de permissions
- logique de plans
- tables ou enrichissements nécessaires

Le résultat attendu :
AqarPro doit devenir un cockpit digital professionnel, élégant, crédible et réellement utile pour une agence immobilière.
```
