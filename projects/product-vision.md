# Product Vision & Benchmark — AqarVision Differentiation

## Benchmark: Best Module from Each Platform

AqarVision ne copie pas un site entier. Il prend le **meilleur module** de chacun.

### Recherche carte intelligente ← Domain + Rightmove + Zillow

**Ce qu'ils font bien :**
- Domain (domain.com.au) : carte interactive avec **zone dessinée** (draw-to-search), clusters prix, heatmaps quartier. Le standard le plus avancé.
- Rightmove : carte UK avec filtres inline sur la carte, résultats qui se rafraîchissent en temps réel au déplacement.
- Zillow : split-view carte/liste, pins avec prix, photo carousel dans les popups carte, zoom = filtre automatique.

**Ce qu'AqarVision doit implémenter :**
- Draw-to-search : l'utilisateur dessine une zone sur la carte → les résultats se filtrent en temps réel (PostGIS `ST_Within` + polygon GeoJSON)
- Clusters prix au zoom out (agrégation par wilaya/commune)
- Pins avec prix formatés en DA, popup card avec photo + prix + surface au clic
- Sync bidirectionnelle : hover card ↔ highlight pin, click pin ↔ scroll-to-card
- Bounding box auto-filter quand l'utilisateur déplace la carte
- Heatmap optionnelle : prix au m² par zone (données `agency_stats_daily`)

### Fiche bien immersive ← Zillow + Bayut

**Ce qu'ils font bien :**
- Zillow : layout single-scroll élargi, section médias hero full-bleed, galerie magazine, sections structurées ("What's Special", "Market Value", "Monthly Cost", "Neighborhood")
- Bayut : visite 3D intégrée, plans d'étage interactifs, détails bâtiment exhaustifs (année, étages, parking, ascenseur), calculateur financement, contexte local (écoles, transport, commerces à proximité)

**Ce qu'AqarVision doit implémenter :**
- Photo gallery hero full-bleed avec compteur + lightbox
- Sections structurées avec ancres : Résumé, Caractéristiques, Description, Équipements, Localisation, Estimation, Contact
- Calculateur de financement (mensualités selon apport + taux + durée)
- Carte de proximité : POIs dans un rayon de 1km (écoles, mosquées, commerces, transport)
- Support futur : 3D tour embed (iframe Matterport/similar) et plans d'étage
- Trust score visible avec explication

### Favoris et alertes ← Zillow + realestate.com.au + Rightmove

**Ce qu'ils font bien :**
- Zillow : co-shopping (partager des favoris avec un co-acheteur), messaging intégré, organisation par listes
- realestate.com.au : suivi des variations de prix sur les favoris, notifications push, comparaison côte-à-côte
- Rightmove : alertes email précises, historique des baisses de prix, "similar properties" automatique

**Ce qu'AqarVision doit implémenter :**
- Collections de favoris (multi-dossiers : "Alger centre", "Budget < 5M", "Pour les parents")
- Comparaison côte-à-côte (jusqu'à 4 biens)
- Suivi des variations de prix sur les favoris (notification quand un prix baisse)
- Partage de favoris via lien (accessible sans compte)
- Alertes avec fréquence configurable (instantané, quotidien, hebdomadaire)
- Notes privées sur chaque bien (déjà implémenté)

### Recherche contextuelle ← Bayut + Trulia

**Ce qu'ils font bien :**
- Bayut : recherche par lifestyle (proche plage, proche école, quartier calme), données quartier détaillées (démographie, transport, services)
- Trulia : carte de criminalité, bruit, école rating, commute time — chercher "un endroit" pas juste "un bien"

**Ce qu'AqarVision doit implémenter :**
- Recherche par intention : "proche école", "quartier calme", "vue mer", "potentiel locatif"
- Score quartier par commune (données ouvertes Algérie : écoles, transports, services)
- Filtre de temps de trajet : "moins de 30 min de mon travail" (isochrone map)
- Tags lifestyle sur les listings : "calme", "animé", "vue mer", "proche campus"

### IA discrète mais partout ← realestate.com.au (ChatGPT integration)

**Ce qu'ils font bien :**
- realestate.com.au : recherche conversationnelle via ChatGPT dans l'app, suggestions contextuelles, pas de rupture avec la recherche classique

**Ce qu'AqarVision doit implémenter :**
- Barre de recherche hybride : tape un filtre classique OU une phrase naturelle
- "F3 lumineux calme Alger < 5M" → parsé en filtres structurés automatiquement
- Suggestions IA en dessous de la barre : "Essayez : proche école, vue dégagée, rez-de-jardin"
- NE PAS forcer l'IA : toujours permettre la recherche classique (filtres) en parallèle

---

## Les 4 Différenciateurs AqarVision

### 1. Recherche réellement hybride

**Concept :** Unifier recherche classique + carte + conversation IA + recherche par intention dans un seul parcours fluide.

**UX Flow :**
```
┌─────────────────────────────────────────────────────────┐
│  SearchBar                                               │
│  [🔍 F3 lumineux, calme, proche école, < 5M DA    ]    │
│                                                          │
│  IA Parse → Filtres auto-détectés:                      │
│  [F3 ✕] [< 5M DA ✕] [Calme ✕] [Proche école ✕]       │
│                                                          │
│  "Affiner avec les filtres classiques" →                 │
│  [Wilaya ▾] [Type ▾] [Prix min-max] [Surface ▾]        │
│                                                          │
│  OU "Dessiner une zone sur la carte" →                   │
│  [Carte avec outil crayon]                               │
└─────────────────────────────────────────────────────────┘
```

**Implémentation technique :**
- Input unique : si le texte contient des filtres parsables (nombre, wilaya, type), extraire en structured filters
- Si le texte est une intention ("lumineux", "calme"), passer à l'API Claude pour extraction de critères
- Afficher les filtres détectés comme des chips éditables sous la barre
- L'utilisateur peut toujours modifier/supprimer chaque filtre manuellement
- La carte s'ajuste automatiquement aux résultats
- Keyboard shortcut : `/` pour focus la barre de recherche

### 2. Fiche bien augmentée par l'IA

**Concept :** Chaque listing a un résumé IA, des points forts/faibles, et une aide contextuelle.

**UX Layout dans la fiche :**
```
┌─────────────────────────────────────────────────────┐
│  ✨ Résumé IA                                       │
│  "F3 bien situé à Hydra avec vue dégagée.          │
│   Surface correcte pour le quartier. Prix légèrement│
│   au-dessus de la médiane (+8%). Bon pour famille   │
│   avec enfants (2 écoles à <500m)."                 │
│                                                      │
│  Points forts                    Points d'attention  │
│  ✅ Vue dégagée                 ⚠️ Prix > médiane   │
│  ✅ 2 écoles à proximité       ⚠️ Pas d'ascenseur  │
│  ✅ Parking inclus              ⚠️ 4ème étage       │
│                                                      │
│  Questions à poser à l'agence                       │
│  • Charges mensuelles de copropriété ?              │
│  • Date de disponibilité ?                          │
│  • Possibilité de négociation ?                     │
│                                                      │
│  [Généré par IA · Peut contenir des approximations] │
└─────────────────────────────────────────────────────┘
```

**Implémentation :**
- Généré côté serveur au moment de la publication (AI job type: `listing_analysis`)
- Caché en DB dans `ai_jobs.output_payload` ou un champ dédié `listing_ai_summary`
- Affiché dans un panel collapsible (ouvert par défaut)
- Badge "✨ Résumé IA" avec disclaimer
- Pas de re-génération à chaque vue — cache invalidé seulement si le listing est modifié

### 3. Logique "Projet immobilier"

**Concept :** Transformer l'expérience de "browsing passif" en "cockpit de projet".

**UX — Espace projet dans AqarChaab :**
```
┌─────────────────────────────────────────────────────┐
│  Mes projets                    [+ Nouveau projet]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📁 Appartement Alger                               │
│  Budget: 3-5M DA · Type: F3/F4 · Zone: Alger centre│
│  ├── 6 favoris sauvegardés                          │
│  ├── 2 comparaisons en cours                        │
│  ├── 1 conversation agence active                   │
│  ├── Simulation financement: 35K DA/mois            │
│  └── Dernière activité: il y a 2h                   │
│                                                      │
│  📁 Terrain Tipaza                                  │
│  Budget: 8-12M DA · Type: Terrain · Zone: Tipaza   │
│  ├── 3 favoris                                      │
│  ├── 1 alerte active                                │
│  └── Dernière activité: hier                        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Fonctionnalités du projet :**
- Multi-dossiers avec critères de base (budget, type, zone)
- Favoris rattachés à un projet
- Comparaison côte-à-côte (tableau: prix, surface, pièces, wilaya, score, photos)
- Simulation de financement par projet (montant, apport, taux, durée → mensualités)
- Historique des conversations agence liées au projet
- Checklist de progression : Recherche → Visites → Négociation → Acte → Clés
- Partage du projet avec un co-acheteur (lien)

### 4. Mini-site agence natif mais branché à la recherche

**Concept :** Chaque agence est une micro-marque dans la plateforme, avec sa vitrine thématisée mais intégrée au portail.

**UX — Intégration vitrine ↔ portail :**

```
PORTAIL (AqarSearch)                    VITRINE (a/[slug])
┌──────────────────┐                    ┌──────────────────┐
│ Listing Card     │ ── clic agence ──→ │ VITRINE AGENCE   │
│ [photo]          │                    │ [theme custom]    │
│ F3 Hydra         │                    │ [logo, couleurs]  │
│ Par: Immo Plus   │                    │ [tous les biens]  │
│ ✓ Vérifiée      │                    │ [contact direct]  │
└──────────────────┘                    └──────────────────┘
       ↑                                        │
       │                                        │
       └───── clic "Retour aux résultats" ──────┘
```

**Connexions bidirectionnelles :**
- Sur la fiche bien : lien vers la vitrine agence (sidebar)
- Sur la vitrine : tous les biens de l'agence avec les mêmes cards que le portail
- Dans les résultats de recherche : badge "Agence vérifiée" + lien profil
- Vitrine personnalisable : thème (15 options), couleurs, logo, cover, description
- Analytics partagées : l'agence voit les stats de sa vitrine dans AqarPro
- SEO : chaque vitrine a son propre slug, meta, JSON-LD (déjà en place)

---

## Mapping Benchmark → Composants AqarVision

| Module benchmark | Source | Composant(s) AqarVision | Priorité |
|-----------------|--------|-------------------------|----------|
| Draw-to-search carte | Domain | `SearchMap` + PostGIS polygon | P1 |
| Split-view résultats | Zillow | `SearchPageClient` layout | P1 |
| Photo gallery hero | Zillow + Bayut | `PhotoGallery` | P1 |
| Fiche structurée par sections | Zillow | `ListingDetail` page | P1 |
| Calculateur financement | Bayut | `MortgageCalculator` | P1 (existant) |
| Collections de favoris | Zillow + realestate.com.au | `CollectionsManager` | P1 (existant) |
| Comparaison côte-à-côte | realestate.com.au | `CompareView` (à créer) | P2 |
| Suivi variations prix | Rightmove | Notification system + `price_versions` | P2 |
| Recherche hybride IA | realestate.com.au | `SearchBar` + Claude parse | P2 |
| Résumé IA fiche | Original AqarVision | `ListingAISummary` (à créer) | P2 |
| Projet immobilier | Original AqarVision | `ProjectDashboard` (à créer) | P3 |
| Score quartier | Trulia + Bayut | `NeighborhoodScore` (à créer) | P3 |
| Carte de proximité POIs | Bayut | `ProximityMap` (à créer) | P3 |
| Isochrone / temps de trajet | Domain | `CommuteFilter` (à créer) | P4 |
| Visite 3D | Bayut | Iframe Matterport embed | P4 |

---

## Principes de Différenciation UX

### 1. Ne jamais forcer l'IA
L'IA est un raccourci, pas un mur. Chaque fonctionnalité IA a **toujours** un équivalent classique visible. L'utilisateur qui tape "F3 Alger" ne doit jamais être redirigé vers un chat bot — il reçoit des résultats filtrés, point.

### 2. Le projet > le listing
Les listings sont des briques. Le vrai produit est le **projet immobilier** de l'utilisateur. Chaque feature (favoris, alertes, comparaison, financement, messagerie) doit pouvoir être rattachée à un projet.

### 3. L'agence est un partenaire, pas un fournisseur
La vitrine agence n'est pas un profil secondaire — c'est une surface first-class. L'agence doit pouvoir exprimer son identité (branding) tout en restant dans l'écosystème portail (recherche unifiée, analytics partagées).

### 4. Mobile-first, desktop-enhanced
65%+ du trafic immobilier est mobile en Algérie. Chaque feature est conçue pour mobile d'abord, puis enrichie sur desktop (carte plus large, split-view, raccourcis clavier).

### 5. Algérie-native
58 wilayas, 1541 communes, prix en DA, RTL arabe, noms de lieux locaux. Pas d'adaptation d'un template US/EU — c'est construit pour l'Algérie dès le départ.
