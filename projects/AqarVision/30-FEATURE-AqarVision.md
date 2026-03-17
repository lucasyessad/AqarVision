#Aqarvision  — Les 30 fonctionnalités qui font la différence

> Ce document mappe chaque fonctionnalité à l’architecture existante, précise la phase d’implémentation, et donne les specs techniques pour Claude Code.

-----

## Vue d’ensemble

|Catégorie               |Fonctionnalités|MVP (V1)|V1.5 |V2   |
|------------------------|---------------|--------|-----|-----|
|Recherche & découverte  |6              |3       |2    |1    |
|Fiche bien qui convertit|6              |4       |1    |1    |
|Confiance & réassurance |5              |3       |1    |1    |
|Décision utilisateur    |5              |1       |3    |1    |
|Contact & conversion    |4              |2       |1    |1    |
|Valeur côté agences     |4              |2       |1    |1    |
|**Total**               |**30**         |**15**  |**9**|**6**|

-----

## 1. Recherche & découverte

### 1.1 Recherche sauvegardée intelligente ⭐ MVP

**Pas juste “sauvegarder” — un vrai outil de suivi.**

Surface : AqarSearch + AqarChaab
Route : `/AqarChaab/espace/favoris` (onglet Recherches)
Table Supabase : `saved_searches` (existante)

Specs :

- L’utilisateur peut nommer sa recherche (“Appart famille Alger centre”)
- Retrouver toutes ses recherches dans `/espace/favoris` onglet Recherches
- Voir le compteur de nouveaux biens depuis la dernière visite
- Relancer la recherche en 1 clic (réapplique tous les filtres)
- Badge “3 nouveaux” sur la recherche sauvegardée

Composants : `SaveSearchButton` (existe déjà), `SavedSearchCard` (à créer), `SavedSearchList` (à créer)

Schema Zod :

```typescript
savedSearchSchema = z.object({
  name: z.string().min(1).max(100).transform(sanitizeInput),
  filters: z.object({
    wilayas: z.array(z.string()).optional(),
    propertyType: z.enum([...]).optional(),
    priceMin: z.number().optional(),
    priceMax: z.number().optional(),
    surfaceMin: z.number().optional(),
    surfaceMax: z.number().optional(),
    rooms: z.number().optional(),
    verifiedOnly: z.boolean().optional(),
    freshness: z.enum(['24h', '7d', '30d', 'all']).optional(),
  }),
  alertEnabled: z.boolean().default(false),
})
```

-----

### 1.2 Alertes fines par changement ⭐ MVP

**Pas juste “nouveau bien” — 5 types d’alertes.**

Surface : AqarChaab
Route : `/AqarChaab/espace/alertes`
Table Supabase : `search_alerts` (à créer)

Types d’alertes :

- `new_listing` — Nouveau bien correspondant
- `price_drop` — Baisse de prix sur un bien suivi ou matching
- `back_online` — Bien remis en ligne
- `major_update` — Modification majeure (prix, photos, description)
- `similar_added` — Bien similaire à un favori ajouté

Livraison : notification in-app (icône cloche dans TopBar) + email digest (quotidien ou hebdomadaire, configurable)

Edge Function Supabase : `process-alerts` — cron job qui compare les nouvelles annonces aux saved_searches et génère des notifications.

-----

### 1.3 Zéro résultat intelligent ⭐ MVP

**Au lieu de “aucun résultat” — un assistant de rebond.**

Surface : AqarSearch `/search`
Composant : `SmartEmptyState` (à créer)

Logique : quand `results.length === 0`, analyser les filtres actifs et proposer :

1. Élargir la zone → ajouter les communes voisines (query communes adjacentes en DB)
1. Augmenter le budget → +20% sur priceMax
1. Biens similaires → relâcher 1-2 filtres et refaire la query
1. Quartiers proches → suggestions géographiques
1. Créer une alerte → transformer la recherche en alerte

Chaque suggestion est un bouton cliquable qui modifie les filtres et relance la recherche.

UI : illustration vide + titre “Aucun bien ne correspond exactement” + 3-4 suggestions contextuelles + CTA “Créer une alerte pour être prévenu”

-----

### 1.4 Recherche par intention — V2

**“Appartement familial proche école” au lieu de filtres.**

Surface : AqarSearch `/search`
Backend : Python FastAPI endpoint `/api/intent-search`

L’utilisateur tape une phrase en langage naturel. L’IA (Claude) extrait :

- type de bien implicite
- critères spatiaux (proche école, proche tram)
- profil d’usage (famille, investissement, étudiant)
- budget si mentionné

Traduit en filtres structurés + requête PostGIS pour la proximité.

Dépendance : backend Python IA (Phase 6 du plan d’exécution).

-----

### 1.5 Multi-zones dans une même recherche — V1.5

**Chercher dans 3 communes à la fois.**

Surface : AqarSearch `/search`
Composant : `MultiSelect` wilayas/communes (déjà prévu dans l’inventaire composants)

Le filtre wilaya accepte déjà un array. Il faut :

- Permettre la sélection multiple dans le MultiSelect
- Stocker dans l’URL comme `?wilayas=16,31,25`
- Afficher les chips de chaque zone sélectionnée avec clear individuel
- La query Supabase utilise `.in('wilaya_code', selectedWilayas)`

-----

### 1.6 Dessin libre sur la carte — V2

**L’utilisateur dessine sa zone de recherche.**

Surface : AqarSearch `/search`
Outil : MapLibre GL Draw plugin

L’utilisateur trace un polygone sur la carte. Le polygone est converti en GeoJSON, puis envoyé en requête PostGIS `ST_Within(listing.location, polygon)`. Stockable comme recherche sauvegardée.

Complexité élevée — V2 uniquement.

-----

## 2. Fiche bien qui convertit

### 2.1 Résumé IA de l’annonce ⭐ MVP

**3-5 lignes qui disent l’essentiel.**

Surface : AqarSearch `/annonce/[slug]`
Composant : `AIListingSummary` (à créer)
Table : `ai_jobs` (existante) — type `summary`

Contenu généré :

- Ce qu’il a de fort (2-3 points)
- Pour quel profil il convient (famille, investisseur, étudiant)
- Ce qu’il faut retenir vite

Génération : au premier affichage de la fiche, si pas de summary en cache → appel backend Python → stockage dans `ai_jobs` avec `listing_id` + `type: 'summary'` → cache 7 jours.

UI : card bleu-light `#E4F2F8` avec icône sparkle, label “Résumé IA”, 3-4 bullet points.

-----

### 2.2 Points forts / Points d’attention ⭐ MVP

**Extraction automatique depuis les métadonnées.**

Surface : AqarSearch `/annonce/[slug]`
Composant : `ListingHighlights` (à créer)

Règles d’extraction (service TypeScript, pas IA) :

```
Points forts :
- has_parking → "Parking inclus"
- has_balcony → "Balcon / terrasse"
- floor <= 2 → "Rez-de-chaussée ou étage bas"
- has_elevator → "Ascenseur"
- distance_transport < 500m → "Proche transports"
- photos_count >= 10 → "Annonce bien documentée"
- verified === true → "Annonce vérifiée"

Points d'attention :
- !has_elevator && floor > 3 → "Pas d'ascenseur, Xe étage"
- condition === 'to_renovate' → "Travaux à prévoir"
- photos_count < 5 → "Peu de photos disponibles"
- age > 30 → "Immeuble ancien"
- !has_parking → "Pas de parking mentionné"
```

UI : deux colonnes. Gauche : icônes vert ✓ + texte. Droite : icônes amber ⚠ + texte.

-----

### 2.3 CTA contact sticky ⭐ MVP

**Le bouton de contact ne disparaît jamais.**

Surface : AqarSearch `/annonce/[slug]`
Composant : `StickyContactBar` (à créer)

Desktop : panneau fixé à droite (position sticky, 320px largeur)
Mobile : barre fixée en bas (position fixed, full-width, z-index 50)

3 boutons :

- “Appeler” → `tel:` link direct
- “Message” → ouvre modal de conversation
- “Demander visite” → formulaire avec date picker

En dessous : temps de réponse + nom agent + avatar miniature.

-----

### 2.4 Temps de réponse estimé ⭐ MVP

**“Cette agence répond en ~2h”**

Surface : AqarSearch `/annonce/[slug]` + `/a/[slug]`
Composant : `ResponseTimeIndicator` (à créer)
Donnée : calculée depuis `messages` table — average time between lead creation et first agent reply.

Affichage :

- < 1h → vert “Répond très rapidement”
- < 4h → vert “Répond en moins de 4h”
- < 24h → amber “Répond dans la journée”
- 24h → muted “Délai de réponse variable”
- Pas de données → masqué

-----

### 2.5 Historique de prix — V1.5

**Prix initial, dernière baisse, date MAJ.**

Surface : AqarSearch `/annonce/[slug]`
Table : `listing_price_history` (à créer)

Trigger SQL : à chaque UPDATE sur `listings.price`, insérer l’ancien prix dans `listing_price_history`.

UI : timeline simple sous le prix principal. Badge “Baisse de prix” si prix actuel < prix initial.

-----

### 2.6 Score de complétude de l’annonce ⭐ MVP

**Visible côté public ET côté pro.**

Composant : `CompletenessScore` (à créer)

Calcul (sur 100%) :

- Titre renseigné : 10%
- Description > 100 caractères : 15%
- Prix renseigné : 10%
- Surface renseignée : 10%
- Type de bien : 5%
- Nombre de pièces : 5%
- Photos >= 3 : 15%
- Photos >= 8 : 10% bonus
- Localisation précise (commune) : 10%
- Caractéristiques renseignées (>=5) : 10%

Côté public : petit badge discret (vert “Très complète”, amber “Complète”, muted “Partielle”)
Côté pro : progress bar + suggestions d’amélioration (“Ajoutez 3 photos pour atteindre 85%”)

-----

## 3. Confiance & réassurance

### 3.1 Badge de vérification utile ⭐ MVP

**Pas décoratif — un vrai système à niveaux.**

Composant : `VerificationBadge` (à créer)

Niveaux :

- Niveau 0 : Aucune vérification → pas de badge
- Niveau 1 : Numéro vérifié → badge gris “Numéro vérifié”
- Niveau 2 : Agence vérifiée → badge bleu “Agence vérifiée”
- Niveau 3 : Annonce vérifiée → badge bleu “Annonce vérifiée” (photos + description + cohérence prix)
- Niveau 4 (V2) : Documents vérifiés → badge vert “Documents conformes”

Table : `verifications` (à créer) — `entity_type` (agency|listing|user), `verification_type`, `status`, `verified_at`, `verified_by`

-----

### 3.2 Indicateurs de sérieux agence ⭐ MVP

**Preuves mesurables, pas marketing.**

Surface : `/a/[slug]` (vitrine agence) + `/annonce/[slug]` (section agence)
Composant : `AgencyTrustCard` (à créer)

Données affichées :

- Nombre d’annonces actives
- Ancienneté sur la plateforme (depuis [année])
- Taux de réponse (% de leads avec réponse)
- Délai moyen de réponse
- Badge de vérification

Sources : calculé depuis `listings` (count active), `agencies.created_at`, `messages` (response rate + avg time)

-----

### 3.3 Contexte de quartier ⭐ MVP

**Pas une carte vide — des infos utiles.**

Surface : `/annonce/[slug]`
Composant : `NeighborhoodContext` (à créer)

V1 (simple) : catégories avec icônes

- 🏫 Écoles : “Lycée El-Mokrani à 300m”
- 🚊 Transport : “Station tramway à 200m”
- 🛒 Commerces : “Supermarché à 150m”
- 🌳 Espaces verts : “Parc à 500m”

Source V1 : données manuelles par l’agence (champs dans le formulaire de création d’annonce)
Source V2 : OpenStreetMap Overpass API — reverse geocode → fetch POIs dans un rayon de 1km

UI : mini carte avec le pin du bien + liste des POIs avec distance à pied.

-----

### 3.4 Similar listings intelligents — V1.5

**Pas juste “même ville” — vraiment pertinents.**

Surface : `/annonce/[slug]`
Composant : `SimilarListings` (à créer)

Algorithme :

```sql
SELECT * FROM listings
WHERE commune_id = :current_commune
  OR commune_id IN (SELECT id FROM communes WHERE wilaya_id = :current_wilaya)
AND property_type = :current_type
AND price BETWEEN :current_price * 0.7 AND :current_price * 1.3
AND surface BETWEEN :current_surface * 0.7 AND :current_surface * 1.3
AND id != :current_id
AND status = 'active'
ORDER BY
  CASE WHEN commune_id = :current_commune THEN 0 ELSE 1 END,
  ABS(price - :current_price)
LIMIT 6
```

UI : scroll horizontal de 3-6 Pulse Cards.

-----

### 3.5 Preuves de fraîcheur — V1.5

**Dire clairement quand et comment.**

Surface : toutes les cards + fiche détail
Composant : `FreshnessIndicator` (à créer)

Affichage :

- “Publié il y a 2 jours” (si < 7j → badge “Nouveau”)
- “Mis à jour il y a 3 jours”
- “Disponibilité confirmée il y a 1 semaine” (si l’agence a reconfirmé)

Données : `listings.created_at`, `listings.updated_at`, `listings.availability_confirmed_at` (à ajouter)

-----

## 4. Décision utilisateur

### 4.1 Comparateur de biens — V1.5

**Side-by-side de 2-4 biens.**

Surface : AqarSearch (modal ou page dédiée)
Route : `/comparer` (existante mais vide)
Composant : `ComparisonTable` (à créer)

Flux : l’utilisateur ajoute des biens au comparateur (bouton “Comparer” sur chaque card, max 4). La barre de comparaison apparaît en bas (sticky) avec les miniatures. Clic → ouvre la vue comparaison.

Colonnes comparées : photo, prix, prix/m2, surface, pièces, chambres, étage, parking, ascenseur, balcon, localisation, agence, date publication, score complétude, statut vérification.

Différences surlignées : la meilleure valeur par ligne est en vert, la pire en rouge.

-----

### 4.2 Notes personnelles sur les favoris ⭐ MVP

**L’utilisateur annote ses biens.**

Surface : AqarChaab `/espace/favoris`
Table : colonne `note` dans `favorites` (à ajouter, TEXT nullable)

UI : sous chaque card favori, un champ texte pliable “Ajouter une note”. Sauvegarde automatique (debounce 1s). Exemples de placeholders rotatifs : “À visiter samedi”, “Prix trop élevé”, “À montrer à ma famille”.

-----

### 4.3 Collections / dossiers de favoris — V1.5

**Organiser par projet.**

Surface : AqarChaab `/espace/favoris`
Table : `favorite_collections` (à créer) — `id`, `user_id`, `name`, `created_at`
Modification `favorites` : ajouter `collection_id` (FK nullable)

Collections par défaut : “Tous les favoris” (pas de collection = vue globale)
Collections utilisateur : “Achat famille”, “Investissement”, “Location Alger”

UI : sidebar gauche avec les dossiers, drag-and-drop des cards entre dossiers. Compteur par dossier.

-----

### 4.4 Statut personnel sur un bien — V1.5

**Pipeline de décision personnel.**

Surface : AqarChaab `/espace/favoris`
Table : colonne `personal_status` dans `favorites` (à ajouter, ENUM)

Valeurs : `a_revoir` | `a_contacter` | `visite_prevue` | `visite_faite` | `refuse` | `favori_fort`

UI : dropdown sur chaque card favori. Filtre par statut dans la vue favoris. Vue kanban optionnelle (colonnes = statuts, drag-and-drop les cards).

-----

### 4.5 Partage propre d’un bien — V2

**Lien premium, aperçu propre.**

Surface : `/annonce/[slug]`

Le bouton “Partager” génère un lien avec Open Graph metadata propre :

- `og:title` = titre du bien
- `og:description` = résumé IA ou description tronquée
- `og:image` = première photo en 1200x630

Aperçu propre sur WhatsApp, Telegram, iMessage, Facebook. Copie du lien dans le clipboard avec toast de confirmation.

-----

## 5. Contact & conversion

### 5.1 Formulaire prérempli intelligent ⭐ MVP

**Le contexte est déjà là quand l’utilisateur contacte.**

Surface : `/annonce/[slug]` → modal contact
Composant : `ContactModal` (à créer)

Prérempli automatiquement :

- Référence du bien (ID + titre)
- Photo miniature du bien visible dans le formulaire
- Message par défaut : “Bonjour, je suis intéressé(e) par [titre du bien] à [localisation]. Pouvez-vous me donner plus d’informations ?”
- Nom et email si connecté

L’utilisateur peut modifier le message avant envoi. Le lead est créé avec `source: 'listing_detail'` et `listing_id` attaché.

-----

### 5.2 Choix du type de demande ⭐ MVP

**Pas juste “contacter” — qualifier l’intention.**

Surface : modal contact
Composant : chips de sélection en haut du formulaire

Options :

- “Plus d’informations” (par défaut)
- “Planifier une visite”
- “Faire une offre”
- “Être rappelé”
- “Biens similaires”

Le type de demande est stocké dans le lead (`lead_type` ENUM) et visible côté AqarPro. Un lead “Faire une offre” est automatiquement marqué comme chaud.

-----

### 5.3 Relance douce automatisée — V1.5

**Si l’utilisateur a commencé sans finir.**

Surface : AqarChaab / notifications
Logique : Edge Function Supabase `nudge-incomplete-actions`

Scénarios :

- Formulaire de contact ouvert mais pas envoyé → notification 24h après “Vous n’avez pas finalisé votre demande pour [bien]”
- Bien vu 3 fois sans contact → notification “Ce bien vous intéresse toujours ?”
- Recherche sauvegardée avec nouveaux biens non consultés → digest email

Toujours discret, jamais intrusif. Opt-out facile.

-----

### 5.4 Messagerie contextualisée — V1.5

**Le bien est toujours visible dans la conversation.**

Surface : AqarChaab `/espace/messagerie` + AqarPro `/dashboard/leads`
Composant : `ConversationPropertyContext` (à créer)

En haut du thread de messages, toujours afficher :

- Photo miniature du bien (60x60)
- Titre
- Prix
- Localisation
- Nom agence ou propriétaire

Côté AqarPro, ajouter :

- Badge statut du lead (nouveau/contacté/visite/offre/perdu)
- Notes privées de l’agent
- “Prochaine action” dropdown

Table : `conversations` a déjà `listing_id`. Le composant fait un join pour afficher le contexte.

-----

## 6. Valeur côté agences

### 6.1 Score qualité d’annonce ⭐ MVP

**Pousser les agences à mieux publier.**

Surface : AqarPro `/dashboard/listings`
Composant : `ListingQualityScore` (à créer)

Calcul (identique au score de complétude section 2.6 mais plus poussé côté pro) :

- Titre descriptif (pas juste “F3 Alger”) : 10%
- Description > 200 caractères : 15%
- Photos >= 5 : 15%
- Photos HD (> 1200px large) : 10%
- Toutes les caractéristiques renseignées : 15%
- Localisation précise (commune + quartier) : 10%
- Prix cohérent avec le marché (±30% de la moyenne) : 10%
- Traduction disponible : 5%
- Mis à jour dans les 30 derniers jours : 10%

UI dans la table listings : progress bar colorée (vert > 80%, amber 50-80%, rouge < 50%)
Modal d’amélioration : “Ajoutez 3 photos pour gagner 15 points” avec boutons d’action directe.

-----

### 6.2 Suggestions IA de publication ⭐ MVP

**L’IA aide l’agence à vendre mieux.**

Surface : AqarPro `/dashboard/ai` + dans le wizard de création
Backend : Python FastAPI

Fonctions :

- Améliorer le titre → “F3 Alger” → “Lumineux F3 avec balcon et vue mer — Hydra, Alger”
- Enrichir la description → ajouter des détails manquants, reformuler
- Extraire les points forts → générer la section “highlights” automatiquement
- Traduire → FR → AR/EN/ES automatique
- Optimiser pour la recherche → suggérer des mots-clés

UI : bouton “Améliorer avec l’IA” dans le formulaire d’édition d’annonce. Résultat affiché en diff (ancien → nouveau) avec bouton “Appliquer”.

-----

### 6.3 Qualification de leads — V1.5

**Tous les leads ne se valent pas.**

Surface : AqarPro `/dashboard/leads`
Table : enrichir `leads` avec `heat_score`, `source`, `interest_level`, `next_action`, `next_action_date`

Heat score (calculé automatiquement) :

- Lead créé il y a < 1h : +30 points
- Lead créé il y a < 24h : +20 points
- Type “Faire une offre” : +40 points
- Type “Planifier visite” : +30 points
- Utilisateur a vu le bien 3+ fois : +10 points
- Utilisateur a le bien en favori : +10 points
- Bien correspond à une recherche sauvegardée : +15 points

Affichage : badge coloré (🔴 chaud > 70, 🟠 tiède 40-70, 🔵 froid < 40)

-----

### 6.4 Recommandation d’action pour l’agence — V2

**Le dashboard dit quoi faire.**

Surface : AqarPro `/dashboard` — section “Recommandations”
Backend : logique dans un service TypeScript (pas IA au début)

Règles :

- Lead sans réponse > 12h → “Relancez [nom] — lead chaud pour [bien]”
- Annonce > 30 jours sans mise à jour → “Mettez à jour [bien] pour rester visible”
- Annonce avec score qualité < 50% → “Complétez [bien] — ajoutez des photos”
- Annonce avec 0 leads en 14 jours → “Envisagez de baisser le prix de [bien]”
- Lead avec visite prévue demain → “Rappel : visite de [bien] avec [nom] demain à [heure]”

UI : cards d’action dans le dashboard avec CTA direct (“Répondre”, “Mettre à jour”, “Ajouter des photos”, “Baisser le prix”).

-----

## 7. Ordre de build recommandé

### Sprint 1 — Fondation (2 semaines)

Les 15 fonctionnalités MVP taguées ⭐ ci-dessus :

1. CTA contact sticky (2.3)
1. Formulaire prérempli intelligent (5.1)
1. Choix du type de demande (5.2)
1. Score de complétude (2.6)
1. Badge de vérification (3.1)
1. Indicateurs sérieux agence (3.2)
1. Temps de réponse (2.4)
1. Points forts / Points d’attention (2.2)
1. Contexte de quartier V1 (3.3)
1. Zéro résultat intelligent (1.3)
1. Recherche sauvegardée (1.1)
1. Alertes par changement (1.2)
1. Notes personnelles favoris (4.2)
1. Score qualité annonce pro (6.1)
1. Résumé IA (2.1) + Suggestions IA (6.2) — dépendent du backend Python

### Sprint 2 — Décision & productivité (2 semaines)

Les 9 fonctionnalités V1.5 :
16. Collections / dossiers (4.3)
17. Statut personnel (4.4)
18. Comparateur de biens (4.1)
19. Historique de prix (2.5)
20. Preuves de fraîcheur (3.5)
21. Similar listings intelligents (3.4)
22. Messagerie contextualisée (5.4)
23. Relance douce (5.3)
24. Qualification de leads (6.3)
25. Multi-zones recherche (1.5)

### Sprint 3 — Différenciation (3-4 semaines)

Les 6 fonctionnalités V2 :
26. Recherche par intention NLP (1.4)
27. Dessin libre sur carte (1.6)
28. Partage propre OG (4.5)
29. Recommandations d’action agence (6.4)
30. Vérification documents (3.1 niveau 4)

-----

## 8. Tables Supabase à créer

```sql
-- Alertes de recherche
CREATE TABLE search_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  saved_search_id UUID REFERENCES saved_searches(id) ON DELETE CASCADE,
  alert_types TEXT[] DEFAULT ARRAY['new_listing'],
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Historique de prix
CREATE TABLE listing_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  old_price BIGINT NOT NULL,
  new_price BIGINT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Collections de favoris
CREATE TABLE favorite_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vérifications
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('agency', 'listing', 'user')),
  entity_id UUID NOT NULL,
  verification_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Modifications sur favorites existante
ALTER TABLE favorites ADD COLUMN collection_id UUID REFERENCES favorite_collections(id);
ALTER TABLE favorites ADD COLUMN note TEXT;
ALTER TABLE favorites ADD COLUMN personal_status TEXT CHECK (personal_status IN ('a_revoir', 'a_contacter', 'visite_prevue', 'visite_faite', 'refuse', 'favori_fort'));

-- Modifications sur leads existante
ALTER TABLE leads ADD COLUMN heat_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN source TEXT DEFAULT 'direct';
ALTER TABLE leads ADD COLUMN lead_type TEXT DEFAULT 'info' CHECK (lead_type IN ('info', 'visite', 'offre', 'rappel', 'similaires'));
ALTER TABLE leads ADD COLUMN next_action TEXT;
ALTER TABLE leads ADD COLUMN next_action_date TIMESTAMPTZ;

-- Modifications sur listings existante
ALTER TABLE listings ADD COLUMN availability_confirmed_at TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN quality_score INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN ai_summary TEXT;

-- Trigger historique de prix
CREATE OR REPLACE FUNCTION track_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO listing_price_history (listing_id, old_price, new_price)
    VALUES (NEW.id, OLD.price, NEW.price);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listing_price_change
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION track_price_change();
```

-----

## 9. Composants UI à créer (récapitulatif)

|Composant                    |Catégorie |Sprint|
|-----------------------------|----------|------|
|`StickyContactBar`           |Conversion|1     |
|`ContactModal`               |Conversion|1     |
|`LeadTypeChips`              |Conversion|1     |
|`CompletenessScore`          |Confiance |1     |
|`ListingQualityScore`        |Pro       |1     |
|`VerificationBadge`          |Confiance |1     |
|`AgencyTrustCard`            |Confiance |1     |
|`ResponseTimeIndicator`      |Confiance |1     |
|`ListingHighlights`          |Fiche     |1     |
|`NeighborhoodContext`        |Fiche     |1     |
|`SmartEmptyState`            |Search    |1     |
|`SavedSearchCard`            |Search    |1     |
|`AIListingSummary`           |Fiche     |1     |
|`FavoriteNoteField`          |Décision  |1     |
|`FavoriteCollections`        |Décision  |2     |
|`FavoriteStatusDropdown`     |Décision  |2     |
|`ComparisonTable`            |Décision  |2     |
|`PriceHistory`               |Fiche     |2     |
|`FreshnessIndicator`         |Confiance |2     |
|`SimilarListings`            |Fiche     |2     |
|`ConversationPropertyContext`|Messaging |2     |
|`HeatBadge`                  |Pro/Leads |2     |
|`IntentSearchInput`          |Search    |3     |
|`MapDrawTool`                |Search    |3     |
|`OGSharePreview`             |Social    |3     |
|`ActionRecommendationCard`   |Pro       |3     |