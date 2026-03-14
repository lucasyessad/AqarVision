# AqarVision — Roadmap Globale Produit

> Roadmap consolidée de l’écosystème AqarVision  
> Objectif : organiser le développement de AqarVision, AqarPro et AqarSearch par étapes claires, réalistes et dépendantes les unes des autres

**Version** : 1.0  
**Statut** : Roadmap produit consolidée  
**Périmètre** :
- **AqarVision** → écosystème global
- **AqarPro** → branche professionnelle pour agences
- **AqarSearch** → branche particulier pour recherche et suivi

---

# Table des matières

1. [Vision de la roadmap](#1-vision-de-la-roadmap)
2. [Principes de priorisation](#2-principes-de-priorisation)
3. [Lecture globale des phases](#3-lecture-globale-des-phases)
4. [MVP — Fondations commercialisables](#4-mvp--fondations-commercialisables)
5. [V1 — Produit structuré et cohérent](#5-v1--produit-structuré-et-cohérent)
6. [V2 — Montée en gamme et différenciation](#6-v2--montée-en-gamme-et-différenciation)
7. [Dépendances entre modules](#7-dépendances-entre-modules)
8. [Roadmap détaillée AqarPro](#8-roadmap-détaillée-aqarpro)
9. [Roadmap détaillée AqarSearch](#9-roadmap-détaillée-aqarsearch)
10. [Roadmap IA](#10-roadmap-ia)
11. [Roadmap design et expérience](#11-roadmap-design-et-expérience)
12. [Roadmap technique et architecture](#12-roadmap-technique-et-architecture)
13. [Indicateurs de succès par phase](#13-indicateurs-de-succès-par-phase)
14. [Points de vigilance](#14-points-de-vigilance)
15. [Résumé stratégique](#15-résumé-stratégique)

---

# 1. Vision de la roadmap

La roadmap de AqarVision doit respecter une logique simple :

- construire d’abord ce qui rend le produit **utile**
- ensuite ce qui le rend **cohérent**
- ensuite ce qui le rend **premium**
- enfin ce qui le rend **différenciant à grande échelle**

Le produit ne doit pas être pensé comme une accumulation de modules.
Il doit être pensé comme un écosystème dont la valeur repose sur :

- la qualité de **AqarPro** pour les agences
- la qualité de **AqarSearch** pour les particuliers
- la qualité de la **relation entre les deux**

---

# 2. Principes de priorisation

## 2.1 Priorité à la valeur métier
Ce qui aide une agence à publier, paraître crédible et recevoir des leads passe avant le reste.

## 2.2 Priorité à l’usage réel
Ce qui aide un particulier à chercher, suivre et contacter passe avant les fonctions plus “impressionnantes”.

## 2.3 Priorité à la cohérence
Mieux vaut peu de fonctionnalités bien reliées entre elles qu’un grand nombre de briques isolées.

## 2.4 Priorité à la finition des blocs cœur
Les blocs centraux doivent être soignés avant les blocs périphériques :
- annonce
- vitrine
- recherche
- lead
- message
- demande de visite

## 2.5 Priorité à la maintenabilité
La roadmap doit aussi tenir compte des refactors nécessaires pour éviter d’empiler du legacy.

---

# 3. Lecture globale des phases

## MVP
Construire un produit lançable, vendable et compréhensible.

## V1
Construire un produit structuré, cohérent et agréable à utiliser au quotidien.

## V2
Construire un produit différenciant, plus premium, plus puissant et plus difficile à copier.

---

# 4. MVP — Fondations commercialisables

Le MVP doit permettre de répondre à une question simple :

> Est-ce qu’une agence immobilière accepte de payer pour publier ses biens, disposer d’une mini-vitrine professionnelle et recevoir des leads dans un outil centralisé ?

## 4.1 MVP — AqarPro

### Identité agence
- création compte agence
- onboarding simple
- création profil agence
- branding de base
- logo
- couverture
- coordonnées

### Annonces
- CRUD annonces
- publication / dépublication
- statut brouillon / actif / archivé
- champs essentiels d’un bien
- upload image simple
- image principale
- galerie de base

### Mini-vitrine
- mini-site public agence
- 2 thèmes minimum pour Starter
- pages essentielles :
  - accueil
  - biens
  - fiche bien
  - à propos
  - contact

### Leads
- formulaire de contact
- réception des leads
- liste des leads
- statut simple lead
- contexte du bien concerné

### Dashboard
- tableau de bord simple
- statistiques principales :
  - nombre de biens
  - nombre de leads
  - plan actuel
  - complétude de base

### IA
- génération de titre
- génération de description d’annonce
- reformulation simple

---

## 4.2 MVP — AqarSearch

### Public non connecté
- recherche libre
- filtres de base
- consultation des résultats
- consultation des fiches biens

### Compte particulier
- inscription
- connexion
- redirection retour contexte

### Suivi utilisateur
- favoris
- collections de favoris
- historique de recherche
- biens déjà vus

### Contact
- message à agence depuis fiche bien ou fiche agence
- demande de visite simple préremplie
- remontée vers AqarPro

### Alertes
- création de recherche sauvegardée
- alerte simple sur nouvelle annonce correspondante

---

## 4.3 MVP — Technique minimale nécessaire

- permissions propres agence / particulier
- séparation claire des routes
- RLS correctes
- index de recherche
- tracking minimal analytics
- suppression des incohérences les plus dangereuses du legacy

---

# 5. V1 — Produit structuré et cohérent

La V1 doit transformer le MVP en produit réellement stable, cohérent et plus crédible.

## 5.1 V1 — AqarPro

### Mini-vitrines
- 5 thèmes pour Pro
- thèmes réellement différenciés
- meilleure preview vitrine
- contenus plus riches
- pages éditoriales supplémentaires

### Dashboard
- dashboard personnalisable
- widgets réorganisables
- actions rapides personnalisables
- aperçu de vitrine
- annonces à améliorer

### Médias
- gestion média plus propre
- réorganisation galerie
- vidéos
- collections média agence
- meilleure expérience de gestion visuelle

### Leads et messages
- pipeline leads plus riche
- notes internes
- meilleure lecture du contexte de contact
- historique de messages plus clair
- meilleure gestion des demandes de visite

### IA
- description agence
- slogan
- amélioration de texte
- aide rédactionnelle sur plusieurs écrans
- suggestions de complétude

### Équipe
- rôles propres
- invitation membre
- suppression membre
- permissions plus respectées

### Analytics
- biens les plus consultés
- leads par source
- performance des annonces
- performance vitrine
- bloc d’aide à la décision

---

## 5.2 V1 — AqarSearch

### Recherche
- expérience de recherche plus propre
- meilleure qualité des cartes résultats
- meilleure continuité d’usage mobile

### Suivi personnel
- notes personnelles sur les biens
- reprise de recherche plus intelligente
- meilleure gestion des biens déjà vus
- collections plus abouties

### Alertes
- gestion complète des alertes
- activation / désactivation
- historisation des alertes déclenchées si besoin

### Messagerie
- historique complet
- conversations mieux classées
- lecture / non lu
- meilleur contexte agence / bien

### Réactivité agence
- premiers badges simples
- logique d’affichage plus claire

### Partage
- partage plus soigné
- meilleure expérience multi-supports

---

## 5.3 V1 — Produit global

- cohérence marque AqarVision
- cohérence design AqarPro / AqarSearch
- meilleure stabilité
- meilleure qualité de données
- documentation plus propre
- réduction du legacy

---

# 6. V2 — Montée en gamme et différenciation

La V2 doit faire de AqarVision un produit plus premium, plus difficile à copier et plus fort face au marché.

## 6.1 V2 — AqarPro

### Thèmes et vitrines
- catalogue complet de thèmes
- personnalisation avancée Enterprise
- sections plus riches
- pages supplémentaires :
  - équipe
  - services
  - zones couvertes
  - témoignages
- variations premium plus fortes

### IA partout de manière discrète
- assistance sur plus d’écrans
- messages commerciaux
- contenus sociaux
- emails
- optimisation des annonces
- suggestions éditoriales contextuelles

### Médias premium
- meilleure gestion vidéo
- meilleure optimisation visuelle
- pipeline média plus riche
- rendu plus haut de gamme

### Pilotage avancé
- analytics plus poussés
- qualité d’annonce
- suivi de performance par thème
- vue plus business

---

## 6.2 V2 — AqarSearch

### Alertes enrichies
- baisse de prix
- biens similaires
- détection plus intelligente de proximité avec les recherches sauvegardées

### Suivi personnel plus fort
- espace utilisateur plus riche
- meilleure orchestration entre historique, favoris, alertes et messages

### Réactivité agence
- système d’évaluation comportementale plus robuste
- labels plus fiables

### Qualité de recherche
- résultats mieux hiérarchisés
- ranking amélioré
- enrichissement des signaux de qualité

---

## 6.3 V2 — Produit global

- expérience plus premium
- meilleure rétention particulier
- meilleure valeur perçue côté agence
- meilleur levier de conversion commerciale

---

# 7. Dépendances entre modules

## 7.1 Dépendances cœur AqarPro
- branding dépend du profil agence
- mini-vitrine dépend du branding + thèmes + annonces publiées
- dashboard dépend des annonces + leads + messages + préférences
- leads dépendent des formulaires / messages / demandes de visite
- IA dépend du contexte de contenu

## 7.2 Dépendances cœur AqarSearch
- recherche dépend de l’index des biens publiés
- favoris dépendent du compte utilisateur
- collections dépendent des favoris
- biens déjà vus dépendent de la consultation
- recherche reprise dépend de l’historique + biens vus
- alertes dépendent des recherches sauvegardées
- messagerie dépend d’un contexte agence ou bien
- demande de visite dépend du bien + agence

## 7.3 Dépendances transverses
- AqarSearch dépend de la qualité de publication côté AqarPro
- la qualité de lead dépend de la qualité de la fiche bien
- la valeur d’un thème dépend de la qualité du branding et des contenus
- la valeur de l’IA dépend de la qualité des champs de saisie et des workflows

---

# 8. Roadmap détaillée AqarPro

## MVP
- onboarding agence
- branding de base
- CRUD biens
- upload image simple
- mini-vitrine simple
- leads simples
- dashboard simple
- IA annonce minimale

## V1
- thèmes enrichis
- dashboard personnalisable
- médias avancés
- leads plus propres
- messagerie plus claire
- équipe
- IA étendue
- analytics utiles

## V2
- thèmes premium avancés
- personnalisation Enterprise forte
- IA transverse
- analytics avancés
- pilotage plus business
- expérience média premium

---

# 9. Roadmap détaillée AqarSearch

## MVP
- recherche libre
- fiche bien
- compte particulier
- favoris
- collections
- historique
- biens vus
- message contextuel
- demande de visite simple
- alertes simples

## V1
- notes personnelles
- recherche reprise
- meilleure messagerie
- meilleure gestion des alertes
- badges simples de réactivité
- meilleure UX de suivi

## V2
- alertes enrichies
- ranking amélioré
- signaux de qualité renforcés
- espace personnel plus intelligent
- meilleure orchestration entre tous les blocs

---

# 10. Roadmap IA

## MVP
- titre annonce
- description annonce
- reformulation simple

## V1
- description agence
- slogan
- amélioration de textes
- assistance rédactionnelle sur plusieurs écrans

## V2
- assistance partout de manière discrète
- messages commerciaux
- emails
- contenus sociaux
- suggestions qualité
- optimisation de complétude

---

# 11. Roadmap design et expérience

## MVP
- interface propre
- cohérence minimale
- recherche lisible
- mini-vitrine crédible

## V1
- cohérence forte AqarVision / AqarPro / AqarSearch
- meilleures cartes
- meilleures pages agence
- dashboard plus premium

## V2
- expérience vraiment haut de gamme
- thèmes plus puissants
- qualité visuelle supérieure
- meilleure sensation de produit “grand groupe”

---

# 12. Roadmap technique et architecture

## MVP
- structuration propre des routes
- base permissions
- RLS propres
- index de recherche
- nettoyage des plus gros doublons

## V1
- unification plus forte des modules
- réduction du legacy
- meilleure séparation des domaines
- meilleures queries / actions / validators

## V2
- optimisation performance
- raffinement architecture
- observabilité
- qualité technique renforcée

---

# 13. Indicateurs de succès par phase

## MVP
- agences onboardées
- biens publiés
- premières mini-vitrines actives
- premiers leads générés

## V1
- usage récurrent des agences
- usage réel de AqarSearch avec compte
- taux d’activation des favoris / alertes / messages
- rétention meilleure

## V2
- montée en gamme des plans
- valeur perçue plus forte
- plus de leads qualifiés
- meilleure différenciation marché

---

# 14. Points de vigilance

## 14.1 Risque de dispersion
Trop de modules en parallèle peut affaiblir la qualité des blocs cœur.

## 14.2 Risque de produit trop large
AqarPro et AqarSearch ensemble représentent déjà beaucoup.
Il faut séquencer proprement.

## 14.3 Risque de dette technique
Le legacy et les doublons doivent être traités progressivement pour ne pas polluer la suite.

## 14.4 Risque de design incohérent
Les thèmes, dashboards et espaces particuliers doivent tous rester dans la même famille de marque.

## 14.5 Risque de sur-IA
L’IA doit rester utile et discrète, pas devenir une surcouche confuse.

---

# 15. Résumé stratégique

La roadmap globale de AqarVision doit suivre cette logique :

## D’abord
Construire un **MVP commercialisable** :
- agences
- annonces
- mini-vitrines
- leads
- recherche
- compte particulier
- suivi simple

## Ensuite
Construire une **V1 cohérente et structurée** :
- thèmes enrichis
- dashboard personnalisable
- médias plus forts
- messagerie plus claire
- IA plus présente
- suivi particulier plus solide

## Enfin
Construire une **V2 premium et différenciante** :
- montée en gamme visuelle
- IA transverse
- analytics plus puissants
- alertes enrichies
- meilleure rétention
- meilleure valeur perçue

AqarVision doit donc être développé comme un produit complet, mais en séquençant clairement ce qui :
- crée la valeur
- crée la cohérence
- crée la différenciation
