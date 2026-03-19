# AqarSearch UX — Marketplace Publique

> Spec UX pour la surface AqarSearch : recherche et decouverte immobiliere.
> Inspiration : Zillow (immersion), Rightmove (recherche), Airbnb (carte + filtres).

> **MISE A JOUR MARS 2026 — Lire en priorite le CLAUDE.md (source de verite). Ce fichier est un complement.**
> Changements majeurs non refletes en detail ici :
> - Design system : **Stone** + **Teal** accent. Voir `design-tokens.md`.
> - **`/comparer` supprime** : la comparaison est maintenant une feature inline dans `/search` (multi-select + bouton flottant).
> - **`/favorites` supprime** : fusionne dans `/AqarChaab/espace/favoris`. Le coeur sur search redirige vers login si non-auth.
> - **ContactCard** : ordre configurable (Appeler > WhatsApp > Message > Visite). Lead capture SANS authentification. Voir CLAUDE.md "Composants critiques".
> - **Detail annonce** : photos uniquement (pas de video). PriceHistoryChart public. Partage WhatsApp.
> - **Estimation** : appel au micro-service Python `/estimate` (ML) au lieu de templates simples.

---

## Principes UX

1. **Photo-first** — L'immobilier se vend par l'image. Les photos sont grandes, nettes, immersives.
2. **Recherche fluide** — De la homepage au resultat en 2 clics maximum.
3. **Carte integree** — Toujours visible en split view sur desktop, toggle sur mobile.
4. **Filtres progressifs** — Filtres principaux visibles, filtres avances en panel.
5. **Decouverte** — Suggestions, trending, quartiers populaires, estimation prix.

---

## Pages

### Search (`/search`)
**Objectif** : Trouver un bien correspondant a ses criteres.

**Layout Split** :
```
+--results-panel-(60%)--+--map-panel-(40%)--+
| SearchBar + Filters    | MapLibre GL       |
| Sort + Count           | Markers           |
| Results Grid (2-3 col) | Popup on hover    |
| Infinite scroll        | Cluster markers   |
+------------------------+-------------------+
```

**Toggle vue** (3 modes) :
1. **Split** (defaut desktop) : resultats + carte
2. **Liste** (defaut mobile) : resultats plein ecran
3. **Carte** : carte plein ecran avec resultats en overlay

**SearchBar** :
- Input unifie avec autocomplete (wilayas, communes, quartiers)
- Transaction type pills (Acheter, Louer, Vacances)
- Property type dropdown
- Budget min/max
- Bouton recherche accent

**Filtres avances** (panel collapsible) :
- Surface min/max
- Nombre de pieces
- Etage
- Annee construction
- Features (parking, ascenseur, meuble)
- Tri par : plus recent, prix croissant/decroissant, surface

**Resultats** :
- Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Infinite scroll avec sentinel IntersectionObserver
- Compteur resultats en haut

### SearchResultCard
**Hierarchie visuelle** (par priorite) :

1. **Photo** — Aspect 16/10, cover crop, zoom au hover
   - Overlays : badge statut (top-left), compteur photos (top-right)
   - Logo agence (bottom-left)
2. **Prix** — Grand, `font-display font-bold text-xl`
   - Prix/m2 en gris a cote
3. **Localisation** — Wilaya + commune, texte amber uppercase `text-2xs`
4. **Titre** — 2 lignes max (`line-clamp-2`), amber au hover
5. **Metriques** — Pills : nombre pieces + surface m2
6. **Footer agence** — Nom agence + bouton contact

**Etats** :
- Defaut : `shadow-card`, bordure subtile
- Hover : `shadow-card-hover`, `-translate-y-0.5`, photo zoom 1.05
- Viewed : Opacite legere ou badge "Vu"
- Highlighted (depuis carte) : Outline accent

### Listing Detail (`/annonce/[slug]`)
**Objectif** : Presenter un bien de maniere immersive et convaincante.

**Layout** :
```
+--content-(65%)-------------------+--sidebar-(35%)-----+
| Photo Gallery (hero, lightbox)   | Contact Card       |
| Prix + badges                    |  - Agent avatar    |
| Description                      |  - Nom agence      |
| Details (grille key/value)       |  - Tel, email, msg |
| Carte localisation               |  - Demande visite  |
| Annonces similaires (carousel)   | (sticky on scroll) |
+----------------------------------+--------------------+
```

**Photo Gallery** :
- Hero image large (aspect 16/9)
- Thumbnails en row sous le hero
- Lightbox en overlay au click (navigation fleches, compteur)
- Mobile : swipe horizontal

**Contact Card** (sidebar sticky) :
- Avatar agent + nom + agence
- Boutons : Appeler, Envoyer message, Demander visite
- Badge confiance agence
- Horaires d'ouverture si disponibles

**Details** :
- Grille 2 colonnes (label: valeur)
- Surface, pieces, etage, parking, ascenseur, meuble, annee
- Documents legaux disponibles (icones)

**SEO** :
- `generateMetadata` dynamique
- JSON-LD `RealEstateListing`
- ISR `revalidate: 3600` pour les pages categorie

### Agences (`/agences`)
**Objectif** : Annuaire des agences verifiees.

- Grid de cards agence (logo, nom, wilaya, nombre annonces, badge verification)
- Filtres : wilaya, specialite, verification level
- Link vers vitrine agence `/a/[slug]`

### Comparer (`/comparer`)
**Objectif** : Comparer jusqu'a 4 annonces cote a cote.

- Table comparative horizontale
- Colonnes : annonce 1, 2, 3, 4
- Lignes : photo, prix, surface, pieces, localisation, features
- CTA : contacter pour chaque

### Estimer (`/estimer`)
**Objectif** : Estimer le prix d'un bien.

- Wizard 3 etapes : localisation → type & details → resultat
- Resultat : fourchette prix estimee, prix/m2 moyen du quartier
- CTA : deposer une annonce, voir des biens similaires

### Favoris (`/favorites`)
- Grid de favoris avec collections
- Actions : retirer, ajouter a collection, comparer
- Collections draggables

---

## Carte (MapLibre GL + Maptiler)

### Markers
- Couleur par type : `med` (bleu) par defaut
- Cluster markers pour densite
- Marker actif : scale up + ombre

### Popup
- Mini-card au hover/click : photo + prix + titre
- Lien vers detail

### Interaction
- Zoom/pan fluides
- Recherche dans la zone visible ("rechercher ici")
- Geolocalisation utilisateur

---

## Patterns d'interaction

### Infinite scroll
- Sentinel div en bas de liste (200px rootMargin)
- Spinner amber pendant le chargement
- Message "X / Y annonces affichees" en fin de liste

### Filtres actifs
- Pills supprimables en haut des resultats
- Badge count sur le bouton "Filtres" si filtres actifs
- "Reinitialiser" pour tout effacer

### Responsive
- **Mobile** : Resultats en liste, carte en toggle
- **Tablette** : Split view avec carte reduite
- **Desktop** : Split view 60/40

### Alertes
- "Sauvegarder cette recherche" → cree une alerte
- Frequence : instantane, quotidien, hebdomadaire
- Notification par email
