# AqarSearch — Document Global Technique

> Traduction technique de la vision produit AqarSearch en architecture fonctionnelle, routes, données, permissions et logique d’implémentation

**Version** : 1.0  
**Statut** : Spécification technique consolidée  
**Produit parent** : AqarVision  
**Branche concernée** : AqarSearch  
**Objectif** : définir une base technique propre, cohérente et exploitable pour la branche particulier de la plateforme

---

# Table des matières

1. [Définition de AqarSearch](#1-définition-de-aqarsearch)
2. [Objectif technique](#2-objectif-technique)
3. [Rôle dans l’écosystème AqarVision](#3-rôle-dans-lécosystème-aqarvision)
4. [Principes d’architecture](#4-principes-darchitecture)
5. [Règle d’accès fondamentale](#5-règle-daccès-fondamentale)
6. [Périmètre fonctionnel](#6-périmètre-fonctionnel)
7. [Modules principaux](#7-modules-principaux)
8. [Routes publiques et privées](#8-routes-publiques-et-privées)
9. [Recherche immobilière](#9-recherche-immobilière)
10. [Résultats de recherche](#10-résultats-de-recherche)
11. [Fiche détaillée d’un bien](#11-fiche-détaillée-dun-bien)
12. [Compte utilisateur particulier](#12-compte-utilisateur-particulier)
13. [Biens déjà vus](#13-biens-déjà-vus)
14. [Notes personnelles](#14-notes-personnelles)
15. [Favoris](#15-favoris)
16. [Collections de favoris](#16-collections-de-favoris)
17. [Historique de recherche](#17-historique-de-recherche)
18. [Recherche reprise](#18-recherche-reprise)
19. [Alertes de recherche](#19-alertes-de-recherche)
20. [Alertes enrichies](#20-alertes-enrichies)
21. [Messagerie sécurisée](#21-messagerie-sécurisée)
22. [Historique des messages](#22-historique-des-messages)
23. [Statut de réactivité agence](#23-statut-de-réactivité-agence)
24. [Demande de visite](#24-demande-de-visite)
25. [Partage facile](#25-partage-facile)
26. [Intégration avec AqarPro](#26-intégration-avec-aqarpro)
27. [Modèle de données recommandé](#27-modèle-de-données-recommandé)
28. [Tables à créer ou enrichir](#28-tables-à-créer-ou-enrichir)
29. [Index de recherche](#29-index-de-recherche)
30. [Règles de visibilité des annonces](#30-règles-de-visibilité-des-annonces)
31. [Validators Zod](#31-validators-zod)
32. [Server Actions](#32-server-actions)
33. [Queries](#33-queries)
34. [API routes éventuelles](#34-api-routes-éventuelles)
35. [Composants UI à créer](#35-composants-ui-à-créer)
36. [Règles de permissions](#36-règles-de-permissions)
37. [Sécurité et RLS](#37-sécurité-et-rls)
38. [Analytics et événements](#38-analytics-et-événements)
39. [Performance et cache](#39-performance-et-cache)
40. [Tests à ajouter](#40-tests-à-ajouter)
41. [Arborescence recommandée](#41-arborescence-recommandée)
42. [Plan d’implémentation par phases](#42-plan-dimplémentation-par-phases)
43. [Prompt maître pour Claude Code](#43-prompt-maître-pour-claude-code)

---

# 1. Définition de AqarSearch

AqarSearch est la branche particulier de AqarVision.

Elle permet aux utilisateurs finaux de :

- rechercher des biens publiés par les agences présentes sur AqarPro
- consulter librement les annonces sans créer de compte
- créer un compte pour bénéficier de fonctionnalités avancées de suivi
- organiser leur recherche immobilière dans la durée
- échanger avec les professionnels
- demander une visite
- retrouver plus facilement ce qu’ils ont vu, aimé ou sauvegardé

AqarSearch n’est pas une marque autonome.  
C’est la partie visible de AqarVision côté particulier.

AqarSearch n’est pas non plus, dans sa première vision, un agrégateur global externe du marché.  
Il s’appuie d’abord sur l’offre produite dans AqarPro.

---

# 2. Objectif technique

Sur le plan technique, AqarSearch doit fournir une base claire, modulaire et évolutive pour :

- la recherche publique de biens
- la consultation libre des annonces
- le suivi de recherche pour les utilisateurs connectés
- la gestion des favoris et des collections
- la gestion des notes et des biens vus
- les alertes de recherche
- la messagerie sécurisée avec les agences
- les demandes de visite
- la remontée de signaux utiles vers AqarPro

Le système doit rester :

- modulaire
- propre
- typé
- compatible avec Next.js App Router
- compatible avec Supabase et RLS
- cohérent avec les règles d’accès public / connecté

---

# 3. Rôle dans l’écosystème AqarVision

AqarSearch a pour rôle de :

- rendre visibles les biens publiés dans AqarPro
- capter la demande côté particulier
- transformer la recherche libre en recherche suivie
- centraliser les interactions côté utilisateur final
- enrichir AqarPro avec des signaux de comportement et des demandes qualifiées

AqarSearch dépend donc de AqarPro pour :

- les agences
- les biens
- les statuts de publication
- les métadonnées publiques
- certains signaux de réactivité

---

# 4. Principes d’architecture

## 4.1 Recherche libre, suivi connecté
Le produit doit être utilisable sans compte pour la découverte, mais les fonctionnalités avancées doivent être réservées aux utilisateurs connectés.

## 4.2 AqarPro reste la source de vérité
Les agences, les biens et les leads métier restent gérés côté AqarPro.

## 4.3 AqarSearch gère le suivi utilisateur
Les historiques, favoris, collections, notes, alertes et conversations côté particulier relèvent de AqarSearch.

## 4.4 Monolithe modulaire
AqarSearch doit vivre dans le même repo que AqarPro, avec une séparation claire des domaines.

## 4.5 Cohérence des contextes
Les conversations et demandes de visite doivent toujours garder un contexte lisible :
- agence concernée
- bien concerné si applicable
- origine de l’action

---

# 5. Règle d’accès fondamentale

## Utilisateur public non connecté
Peut uniquement :
- rechercher
- filtrer
- consulter les résultats
- consulter les fiches biens
- consulter les agences si elles sont exposées publiquement

## Utilisateur connecté
Peut en plus :
- enregistrer des favoris
- créer des collections
- renommer ses collections
- ajouter des notes personnelles
- voir les biens déjà vus
- consulter son historique de recherche
- reprendre sa recherche
- créer des alertes
- recevoir des notifications
- utiliser la messagerie sécurisée
- consulter l’historique des messages
- envoyer une demande de visite suivie

## Règle UX
Toute tentative d’utiliser une fonctionnalité réservée doit provoquer :
- une redirection vers création de compte ou connexion
- un retour automatique vers la page d’origine après authentification

---

# 6. Périmètre fonctionnel

AqarSearch doit couvrir :

- recherche immobilière
- résultats de recherche
- fiche bien
- compte utilisateur particulier
- biens déjà vus
- notes personnelles
- favoris
- collections de favoris
- historique de recherche
- reprise de recherche
- alertes
- alertes enrichies
- messagerie
- historique des messages
- statut de réactivité agence
- demande de visite
- partage facile

---

# 7. Modules principaux

Les grands modules de AqarSearch sont :

1. **Recherche**
2. **Résultats**
3. **Fiche bien**
4. **Compte utilisateur**
5. **Biens vus**
6. **Notes**
7. **Favoris**
8. **Collections**
9. **Historique**
10. **Alertes**
11. **Messagerie**
12. **Demandes de visite**
13. **Réactivité agence**
14. **Partage**
15. **Analytics**

---

# 8. Routes publiques et privées

Structure recommandée :

```txt
src/app/
  recherche/
    page.tsx
    loading.tsx
    error.tsx
  bien/
    [id]/
      page.tsx
      loading.tsx
      error.tsx
  agence/
    [slug]/
      page.tsx
  espace/
    page.tsx
    favoris/page.tsx
    collections/page.tsx
    recherches/page.tsx
    alertes/page.tsx
    messages/page.tsx
    messages/[conversationId]/page.tsx
    profil/page.tsx
```

## Routes publiques
- `/recherche`
- `/bien/[id]`
- `/agence/[slug]` si exposée publiquement

## Routes privées
- `/espace`
- `/espace/favoris`
- `/espace/collections`
- `/espace/recherches`
- `/espace/alertes`
- `/espace/messages`
- `/espace/messages/[conversationId]`
- `/espace/profil`

---

# 9. Recherche immobilière

## Entrées de recherche
Le moteur doit accepter :
- transaction : vente / location
- pays
- wilaya
- commune
- ville
- type de bien
- budget min / max
- surface min / max
- nombre de pièces
- mots-clés éventuels
- tri

## Exigences
- recherche rapide
- filtres clairs
- URL synchronisée avec les filtres
- pagination serveur simple
- rendu mobile-first

## Objectif
Donner une expérience de recherche simple, lisible et premium.

---

# 10. Résultats de recherche

## Contenu minimum d’une carte résultat
- image principale
- prix
- type de bien
- localisation courte
- surface
- pièces
- agence source
- bouton favori si connecté
- marqueur “déjà vu” si applicable
- CTA vers détail

## Objectifs
- permettre un scan rapide
- éviter la surcharge
- différencier facilement les résultats
- maintenir un design premium

---

# 11. Fiche détaillée d’un bien

## Sections minimales
- galerie photos
- titre
- prix
- localisation
- caractéristiques
- description
- agence concernée
- actions principales
- partage
- favori
- demande de visite
- contact / messagerie

## Actions disponibles
### Sans compte
- consulter
- partager

### Avec compte
- favori
- note
- message
- demande de visite
- suivi personnel

## Objectif
Aider à comprendre, mémoriser et agir rapidement.

---

# 12. Compte utilisateur particulier

## Données minimales
- nom ou prénom/nom
- email
- mot de passe
- téléphone optionnel

## Fonctions débloquées
- favoris
- collections
- notes
- biens vus
- historique
- recherche reprise
- alertes
- messagerie
- historique des messages
- demandes de visite suivies

## Flux recommandé
- inscription simple
- connexion simple
- retour au contexte après authentification

---

# 13. Biens déjà vus

## Définition
Le système mémorise les biens déjà consultés par l’utilisateur.

## Cas sans compte
- stockage local temporaire possible
- dépend du navigateur

## Cas avec compte
- stockage persistant
- synchronisation côté profil
- affichage dans l’espace personnel

## Rendu attendu
- badge “Déjà vu” dans les résultats
- bloc “récemment consultés”
- base de la recherche reprise

---

# 14. Notes personnelles

## Définition
L’utilisateur connecté peut ajouter une note privée sur un bien.

## Exemples
- trop cher
- intéressant
- à revoir
- à montrer à la famille

## Règles
- visible uniquement par son auteur
- modifiable
- supprimable
- liée à un bien

## Objectif
Créer un vrai outil de suivi personnel, pas seulement une liste de biens.

---

# 15. Favoris

## Définition
L’utilisateur connecté peut enregistrer des biens en favoris.

## Actions
- ajouter
- retirer
- lister

## UX
- bouton sur carte résultat
- bouton sur fiche bien
- accès dédié dans l’espace personnel

---

# 16. Collections de favoris

## Définition
Les favoris doivent être organisables dans plusieurs collections.

## Actions
- créer une collection
- nommer une collection
- renommer une collection
- supprimer une collection
- ajouter un bien à une ou plusieurs collections
- retirer un bien d’une collection

## Règle structurante
Un bien peut appartenir à **plusieurs collections**.

## Exemples
- Achat
- Location
- À visiter
- Investissement
- À comparer

---

# 17. Historique de recherche

## Définition
Le système conserve les recherches exécutées par l’utilisateur connecté.

## Données à stocker
- critères
- localisation
- budget
- type de bien
- date
- dernière exécution

## Actions
- revoir une recherche
- relancer une recherche
- supprimer un élément
- vider l’historique

---

# 18. Recherche reprise

## Définition
Le produit doit proposer à l’utilisateur de reprendre sa recherche.

## Sources
- dernière recherche
- derniers biens vus
- derniers favoris
- dernières alertes

## Rendu UX
- “Reprendre votre dernière recherche”
- “Continuer là où vous vous êtes arrêté”

---

# 19. Alertes de recherche

## Définition
L’utilisateur connecté peut sauvegarder une recherche et demander une alerte.

## Paramètres
- nom libre
- critères
- fréquence
- canal

## Canaux initiaux
- email
- notification interne

## Actions
- créer
- activer / désactiver
- renommer
- supprimer

---

# 20. Alertes enrichies

## Cas retenus
- nouveau bien correspondant à une recherche
- baisse de prix sur un bien suivi
- bien similaire à un favori
- bien similaire à une recherche enregistrée

## Objectif
Rendre le produit proactif et renforcer la valeur du compte.

---

# 21. Messagerie sécurisée

## Définition
Les utilisateurs connectés peuvent échanger avec une agence via une messagerie interne.

## Règle structurante
La messagerie ne doit pas être totalement libre.  
Elle doit être initiée depuis un **contexte précis** :
- fiche bien
- fiche agence
- contexte immobilier précis dans la recherche

## Contexte d’une conversation
- agence obligatoire
- bien optionnel
- origine de l’échange
- date du dernier message

## Actions
- créer une conversation
- envoyer un message
- lire les réponses
- marquer comme lu

---

# 22. Historique des messages

## Définition
L’utilisateur doit pouvoir retrouver l’ensemble de ses conversations.

## Données utiles
- agence
- bien concerné si applicable
- dernier message
- date
- état lu / non lu

## Objectif
Ne pas perdre le fil de la relation avec les agences.

---

# 23. Statut de réactivité agence

## Définition
Le système peut afficher une indication simple de réactivité.

## Exemples de rendu
- répond généralement rapidement
- agence active récemment
- réponse habituelle rapide

## Objectif
Rassurer les particuliers et valoriser les agences sérieuses.

---

# 24. Demande de visite

## Définition
L’utilisateur peut envoyer une demande de visite depuis une fiche bien.

## Règle validée
La demande de visite est un **formulaire simple prérempli**.

## Préremplissage
- informations du bien
- référence du bien
- agence concernée
- contexte de la demande

## Champs modifiables
- nom
- téléphone
- email
- message

## Objectif
Créer une action simple, claire et exploitable côté agence.

---

# 25. Partage facile

## Actions minimales
- partager via WhatsApp
- copier le lien
- envoyer à un proche

## Objectif
Faciliter la décision à plusieurs et augmenter la diffusion naturelle des annonces.

---

# 26. Intégration avec AqarPro

AqarSearch doit consommer depuis AqarPro :
- les biens publiés
- les agences visibles
- les données publiques de branding
- certains signaux de réactivité

AqarSearch doit renvoyer vers AqarPro :
- vues
- clics utiles
- messages
- demandes de visite
- leads
- signaux d’intérêt

AqarPro reste la source de vérité pour :
- agences
- biens
- statuts
- pilotage commercial

---

# 27. Modèle de données recommandé

Le modèle AqarSearch doit couvrir au minimum :

- `favorites`
- `favorite_collections`
- `favorite_collection_items`
- `search_history`
- `saved_searches`
- `search_alerts`
- `viewed_properties`
- `property_notes`
- `conversations`
- `messages`
- `visit_requests`

Enrichissements possibles :
- `agency_responsiveness_stats`
- `user_search_preferences`
- `search_alert_deliveries`

---

# 28. Tables à créer ou enrichir

## 28.1 `favorites`
Favoris utilisateur.

## 28.2 `favorite_collections`
Collections créées par utilisateur.

## 28.3 `favorite_collection_items`
Association many-to-many entre biens favoris et collections.

## 28.4 `search_history`
Historique des recherches.

## 28.5 `saved_searches`
Recherches sauvegardées.

## 28.6 `search_alerts`
Alertes actives associées aux recherches.

## 28.7 `viewed_properties`
Biens déjà vus.

## 28.8 `property_notes`
Notes privées sur les biens.

## 28.9 `conversations`
Conversations entre particulier et agence.

## 28.10 `messages`
Messages d’une conversation.

## 28.11 `visit_requests`
Demandes de visite contextualisées.

## 28.12 `agency_responsiveness_stats`
Indicateurs simples de réactivité agence.

---

# 29. Index de recherche

## Objectif
Créer une couche dédiée à la recherche publique.

## Recommandation
Créer une vue SQL ou table indexée :

```sql
search_properties_index
```

## Colonnes minimales
- property_id
- agency_id
- agency_name
- agency_slug
- title
- description
- price
- currency
- transaction_type
- type
- surface
- rooms
- bathrooms
- country
- wilaya
- commune
- city
- images_count
- published_at
- updated_at
- search_text

## Objectif
Éviter des requêtes brutes trop complexes sur `properties` à chaque recherche.

---

# 30. Règles de visibilité des annonces

Une annonce est visible publiquement si :
- elle est active
- l’agence est active
- elle possède au minimum :
  - un titre
  - un prix
  - une localisation exploitable
  - une image ou une description suffisante

Les annonces non publiées, brouillons ou internes ne doivent jamais être exposées.

---

# 31. Validators Zod

Créer ou renforcer :

- `search.ts`
- `saved-search.ts`
- `alert.ts`
- `favorite.ts`
- `collection.ts`
- `note.ts`
- `message.ts`
- `visit-request.ts`

Chaque validator doit couvrir :
- structure
- typage
- limites de longueur
- cohérence métier minimale

---

# 32. Server Actions

Créer ou structurer :

## `favorites.ts`
- addFavorite
- removeFavorite

## `collections.ts`
- createCollection
- renameCollection
- deleteCollection
- addPropertyToCollection
- removePropertyFromCollection

## `notes.ts`
- savePropertyNote
- deletePropertyNote

## `search-history.ts`
- trackSearch
- clearSearchHistory

## `viewed-properties.ts`
- trackViewedProperty

## `alerts.ts`
- createSavedSearch
- updateSavedSearch
- deleteSavedSearch
- createSearchAlert
- toggleSearchAlert

## `messaging.ts`
- createConversation
- sendMessage
- markConversationAsRead

## `visit-requests.ts`
- createVisitRequest

Toutes les actions doivent retourner :

```ts
{
  success: boolean
  error?: string
}
```

---

# 33. Queries

Prévoir ou renforcer :

- `search.ts`
- `property-public.ts`
- `favorites.ts`
- `collections.ts`
- `alerts.ts`
- `history.ts`
- `messaging.ts`
- `visit-requests.ts`
- `agency-public.ts`

L’objectif est d’éviter la logique de requête directement dans les pages.

---

# 34. API routes éventuelles

À utiliser si nécessaire pour :
- webhooks d’alertes
- intégrations email
- endpoints de partage
- endpoints publics spécifiques
- traitement asynchrone d’envoi d’alertes

Exemples :
- `/api/alerts/dispatch`
- `/api/messages/send`
- `/api/visit-requests/create`
- `/api/historique`
- `/api/favoris`

---

# 35. Composants UI à créer

```txt
src/components/search/
```

## Composants clés
- `search-bar.tsx`
- `filter-panel.tsx`
- `result-card.tsx`
- `favorite-button.tsx`
- `viewed-badge.tsx`
- `note-editor.tsx`
- `collection-selector.tsx`
- `saved-search-card.tsx`
- `alert-button.tsx`
- `conversation-list.tsx`
- `message-thread.tsx`
- `visit-request-form.tsx`
- `share-actions.tsx`
- `result-empty-state.tsx`

---

# 36. Règles de permissions

## Visiteur non connecté
- recherche autorisée
- consultation autorisée
- partage autorisé

## Utilisateur connecté
- accès à l’espace personnel
- favoris
- collections
- notes
- historique
- alertes
- messagerie
- demandes de visite

## Règle
Les permissions doivent être appliquées :
- dans l’UI
- dans les layouts
- dans les actions
- dans les queries
- dans les policies RLS

---

# 37. Sécurité et RLS

Toutes les données personnelles de suivi doivent être protégées.

## À restreindre strictement
- favoris utilisateur
- collections
- notes
- historique
- alertes
- conversations
- messages
- demandes de visite privées

## Vérifications côté serveur
Même avec RLS :
- vérifier session
- vérifier contexte
- vérifier visibilité du bien
- vérifier agence concernée

---

# 38. Analytics et événements

Événements à tracer :
- `search_executed`
- `search_filter_changed`
- `property_viewed`
- `favorite_added`
- `favorite_removed`
- `collection_created`
- `collection_renamed`
- `note_added`
- `saved_search_created`
- `alert_created`
- `message_sent`
- `visit_requested`
- `property_shared`

Objectifs :
- comprendre l’usage
- améliorer l’expérience
- enrichir les signaux remontés vers AqarPro

---

# 39. Performance et cache

## Cache recommandé
- `/recherche` : dynamique avec cache court si nécessaire
- `/bien/[id]` : ISR ou revalidate court
- `/espace/*` : privé, pas de cache public

## Pagination
Préférer :
- pagination serveur simple
- limit / offset au départ

## Objectifs
- rapidité
- faible coût de requête
- bon comportement mobile

---

# 40. Tests à ajouter

## Validators
- `search.test.ts`
- `alert.test.ts`
- `collection.test.ts`
- `note.test.ts`
- `message.test.ts`
- `visit-request.test.ts`

## Actions
- `actions-favorites.test.ts`
- `actions-collections.test.ts`
- `actions-notes.test.ts`
- `actions-search-history.test.ts`
- `actions-alerts.test.ts`
- `actions-messaging.test.ts`
- `actions-visit-requests.test.ts`

## Logique métier
- recherche libre sans compte
- redirection sur action protégée
- biens déjà vus
- reprise de recherche
- création de conversation depuis fiche agence
- création de conversation depuis fiche bien
- demande de visite contextuelle

---

# 41. Arborescence recommandée

```txt
src/
├── app/
│   ├── recherche/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── bien/
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── espace/
│   │   ├── page.tsx
│   │   ├── favoris/page.tsx
│   │   ├── collections/page.tsx
│   │   ├── recherches/page.tsx
│   │   ├── alertes/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── messages/[conversationId]/page.tsx
│   │   └── profil/page.tsx
│
├── components/
│   └── search/
│       ├── search-bar.tsx
│       ├── filter-panel.tsx
│       ├── result-card.tsx
│       ├── favorite-button.tsx
│       ├── viewed-badge.tsx
│       ├── note-editor.tsx
│       ├── collection-selector.tsx
│       ├── saved-search-card.tsx
│       ├── alert-button.tsx
│       ├── conversation-list.tsx
│       ├── message-thread.tsx
│       ├── visit-request-form.tsx
│       ├── share-actions.tsx
│       └── result-empty-state.tsx
│
├── lib/
│   ├── actions/
│   │   ├── favorites.ts
│   │   ├── collections.ts
│   │   ├── notes.ts
│   │   ├── search-history.ts
│   │   ├── viewed-properties.ts
│   │   ├── alerts.ts
│   │   ├── messaging.ts
│   │   └── visit-requests.ts
│   ├── queries/
│   │   ├── search.ts
│   │   ├── property-public.ts
│   │   ├── favorites.ts
│   │   ├── collections.ts
│   │   ├── alerts.ts
│   │   ├── history.ts
│   │   ├── messaging.ts
│   │   ├── visit-requests.ts
│   │   └── agency-public.ts
│   └── validators/
│       ├── search.ts
│       ├── saved-search.ts
│       ├── alert.ts
│       ├── favorite.ts
│       ├── collection.ts
│       ├── note.ts
│       ├── message.ts
│       └── visit-request.ts
```

---

# 42. Plan d’implémentation par phases

## Phase 1 — socle public
- recherche
- résultats
- fiche bien
- index de recherche
- visibilité publique

## Phase 2 — compte et suivi personnel
- compte particulier
- favoris
- collections
- notes
- biens déjà vus
- historique de recherche

## Phase 3 — continuité et rétention
- recherche reprise
- saved searches
- alertes
- alertes enrichies

## Phase 4 — interaction agence
- messagerie
- historique des messages
- demande de visite
- signaux de réactivité agence

## Phase 5 — optimisation
- analytics
- amélioration UX
- optimisation des parcours protégés
- enrichissement de la qualité des résultats

---

# 43. Prompt maître pour Claude Code

```txt
Construis AqarSearch comme la branche particulier de AqarVision.

Objectif :
Créer une expérience de recherche immobilière moderne, simple et premium, qui permet de consulter librement les annonces sans compte, puis d’utiliser un compte pour organiser, suivre et approfondir sa recherche.

Contraintes :
- AqarSearch n’est pas une marque autonome
- AqarSearch dépend des biens et agences publiés dans AqarPro
- sans compte, seules la recherche, le filtrage et la consultation sont autorisés
- toute autre action doit rediriger vers création de compte ou connexion avec retour au contexte
- la messagerie doit toujours partir d’un contexte précis
- un bien peut appartenir à plusieurs collections de favoris
- la demande de visite doit être un formulaire simple prérempli
- le code doit rester propre, modulaire, typé et compatible avec Next.js 14 + Supabase

À structurer :
1. recherche publique
2. fiche bien
3. compte particulier
4. biens déjà vus
5. notes personnelles
6. favoris
7. collections
8. historique
9. recherche reprise
10. alertes
11. messagerie
12. demandes de visite
13. événements analytics

À produire :
- routes propres
- modèles de données
- server actions
- queries
- validators
- composants UI
- permissions
- logique de redirection
- logique de contexte pour messagerie et demandes de visite

Le résultat attendu :
AqarSearch doit devenir un espace personnel de recherche immobilière, simple sans compte, beaucoup plus utile avec un compte, et parfaitement relié à AqarPro.
```
