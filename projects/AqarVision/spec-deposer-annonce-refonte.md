# Refonte complète — Système de dépôt d'annonce AqarChaab

> **Spec à passer à Claude Code pour implémentation.**
> Couvre : bug fix RLS, migration DB, nouveau wizard 7 étapes, upload photos,
> description IA, localisation carte, design system Zinc.

---

## 1. BUG CRITIQUE — RLS manquant pour les particuliers

### Problème

L'erreur visible sur le récapitulatif :
```
new row violates row-level security policy for table "listing_translations"
```

**Cause racine :** La migration `00178_individual_listings.sql` ajoute une policy RLS
pour que les particuliers puissent insérer dans `listings`, mais **oublie** les tables
enfants : `listing_translations`, `price_versions`, `status_versions`.

Le listing s'insère correctement (la policy `listings_insert_individual` fonctionne),
mais l'insertion de la traduction française échoue → le listing est ensuite soft-deleted
par le catch, et l'utilisateur voit l'erreur brute.

### Fix — Nouvelle migration `00183_individual_rls_children.sql`

```sql
-- Fix: Allow individual owners to insert/select/update translations, media, and
-- version records for their own listings.

-- ── listing_translations ──────────────────────────────────────────────

-- Individual owners can insert translations for their listings
CREATE POLICY listing_translations_insert_individual
  ON public.listing_translations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- Individual owners can update translations for their listings
CREATE POLICY listing_translations_update_individual
  ON public.listing_translations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- Individual owners can view translations for their listings (draft included)
CREATE POLICY listing_translations_select_individual
  ON public.listing_translations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- ── listing_media ─────────────────────────────────────────────────────

CREATE POLICY listing_media_insert_individual
  ON public.listing_media
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

CREATE POLICY listing_media_select_individual
  ON public.listing_media
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

CREATE POLICY listing_media_update_individual
  ON public.listing_media
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

CREATE POLICY listing_media_delete_individual
  ON public.listing_media
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- ── price_versions ────────────────────────────────────────────────────

CREATE POLICY price_versions_insert_individual
  ON public.listing_price_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- ── status_versions ───────────────────────────────────────────────────

CREATE POLICY status_versions_insert_individual
  ON public.listing_status_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- ── Individual owners can view/update their own listings (any status) ─

CREATE POLICY listings_select_own_individual
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (
    owner_type = 'individual'
    AND individual_owner_id = auth.uid()
  );

CREATE POLICY listings_update_own_individual
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (
    owner_type = 'individual'
    AND individual_owner_id = auth.uid()
  )
  WITH CHECK (
    owner_type = 'individual'
    AND individual_owner_id = auth.uid()
  );
```

---

## 2. NOUVEAU WIZARD — 7 étapes au lieu de 4

### Structure des étapes

```
Étape 1 — Type             (type d'annonce + type de bien)
Étape 2 — Localisation     (wilaya + commune + adresse + carte pin)
Étape 3 — Prix & Surface   (prix, surface, étage, année)
Étape 4 — Détails          (pièces, SDB, équipements, orientation)
Étape 5 — Description      (titre, description, IA suggest)
Étape 6 — Photos           (upload drag-drop, cover selection, ordre)
Étape 7 — Récapitulatif    (preview, contact info, publier)
```

### Pourquoi 7 étapes

Le wizard actuel à 4 étapes est trop condensé : localisation + prix dans une
seule page, pas de photos, pas de description, pas d'adresse précise.
Les benchmarks Zillow/Bayut montrent que les formulaires de dépôt performants
utilisent 6-8 étapes courtes plutôt que 3-4 étapes longues. Chaque étape doit
être complétable en <30 secondes.

---

## 3. SPEC DÉTAILLÉE PAR ÉTAPE

### Étape 1 — Type d'annonce et type de bien

**Identique à l'actuel** mais avec le design Zinc :
- Type d'annonce : 3 cards radio (Vente, Location, Vacances)
- Type de bien : grille 2×4 d'icon cards (Appartement, Villa, Terrain, Local comm., Bureau, Immeuble, Ferme, Entrepôt)
- Sélection = bordure `amber-500` + fond `amber-50`
- Card hover = `shadow-sm` + border `zinc-300`

### Étape 2 — Localisation (NOUVEAU : carte + adresse)

```
┌─────────────────────────────────────────────────┐
│ Localisation                                     │
├─────────────────────────────────────────────────┤
│                                                  │
│ Wilaya *                                         │
│ [04 – Oum El Bouaghi                        ▾]  │
│                                                  │
│ Commune                                          │
│ [Oum El Bouaghi                              ▾]  │
│                                                  │
│ Adresse (optionnel)                              │
│ [Rue des Frères Mehri, Cité 500 logements   ]   │
│                                                  │
│ ┌───────────────────────────────────────────┐   │
│ │                                           │   │
│ │           CARTE (MapLibre)                │   │
│ │     📍 Déplacez le pin pour préciser      │   │
│ │        la localisation exacte             │   │
│ │                                           │   │
│ └───────────────────────────────────────────┘   │
│ Lat: 35.8767  Lng: 7.1134  (auto-filled)        │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Comportement :**
- Sélection wilaya → center la carte sur la wilaya
- Sélection commune → zoom sur la commune
- Pin draggable sur la carte → met à jour lat/lng
- Champ adresse : texte libre (pas de geocoding requis)
- Lat/lng stockés dans le champ `location` (PostGIS POINT)
- Carte : même composant MapLibre que la recherche, mode "pin unique"
- Sur mobile : carte en hauteur réduite (200px), extensible au tap

**Champs DB à ajouter dans la migration (si pas déjà présent) :**
```sql
-- Si la colonne address_text n'existe pas sur listings :
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS address_text text;
```

### Étape 3 — Prix & Surface (séparé de la localisation)

```
┌─────────────────────────────────────────────────┐
│ Prix & Surface                                   │
├─────────────────────────────────────────────────┤
│                                                  │
│ Prix *                                           │
│ [30 000 000                              ] DZD  │
│ ≈ 300 000 DA/m² (calculé auto si surface)       │
│                                                  │
│ Surface (m²)                                     │
│ [100                                     ] m²   │
│                                                  │
│ Étage (pour appartement/bureau)                  │
│ [    3    ] / [    5    ] étages total           │
│                                                  │
│ Année de construction (optionnel)                │
│ [2015                                    ]       │
│                                                  │
│ ── Suggestion IA ──────────────────────────────  │
│ 💡 Prix moyen à Oum El Bouaghi pour un F3 :     │
│    28M - 35M DZD (basé sur 12 annonces)          │
│    Votre prix est dans la fourchette. ✅          │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Comportement :**
- Prix : input number avec formatage en temps réel (séparateurs milliers)
- Prix/m² : calculé automatiquement quand surface est renseignée
- Étage : visible seulement si property_type = apartment | office | building
- Suggestion IA : appel API qui compare avec les listings similaires dans la même zone (optionnel, affiché si disponible). Si l'API n'est pas prête, afficher uniquement le prix/m².

**Schema Zod étendu :**
```typescript
floor: z.number().int().min(0).max(50).optional(),
total_floors: z.number().int().min(1).max(50).optional(),
year_built: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
address_text: z.string().max(200).optional(),
latitude: z.number().min(19).max(38).optional(),  // Algérie bounds
longitude: z.number().min(-9).max(12).optional(),
```

### Étape 4 — Détails & Équipements (enrichi)

```
┌─────────────────────────────────────────────────┐
│ Détails                                          │
├─────────────────────────────────────────────────┤
│                                                  │
│ Pièces & Salles de bains                         │
│ Pièces        [–]  4  [+]                        │
│ Salle de bains [–]  2  [+]                       │
│                                                  │
│ Équipements                                      │
│ [✓ Ascenseur] [✓ Parking] [✓ Balcon]            │
│ [  Piscine  ] [  Jardin  ] [  Meublé ]           │
│ [  Climatisation] [  Chauffage] [  Vue mer]      │
│ [  Terrasse ] [  Cave    ] [  Interphone]        │
│ [  Gardien  ] [  Digicode]                       │
│                                                  │
│ Orientation (optionnel)                          │
│ [Nord] [Sud] [Est] [Ouest]                       │
│ (multi-select, ex: "Sud-Est")                    │
│                                                  │
│ État du bien                                     │
│ ( ) Neuf  ( ) Bon état  ( ) À rénover            │
│ ( ) En construction                              │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Nouveaux équipements vs actuel :**
L'actuel n'a que 6 options (ascenseur, parking, balcon, piscine, jardin, meublé).
Le nouveau en a 14 + orientation + état du bien. C'est ce que Bayut et Zillow montrent.

**Schema Zod étendu pour details :**
```typescript
details: z.object({
  has_elevator: z.boolean().default(false),
  has_parking: z.boolean().default(false),
  has_balcony: z.boolean().default(false),
  has_pool: z.boolean().default(false),
  has_garden: z.boolean().default(false),
  furnished: z.boolean().default(false),
  has_ac: z.boolean().default(false),
  has_heating: z.boolean().default(false),
  sea_view: z.boolean().default(false),
  has_terrace: z.boolean().default(false),
  has_cave: z.boolean().default(false),
  has_intercom: z.boolean().default(false),
  has_guardian: z.boolean().default(false),
  has_digicode: z.boolean().default(false),
  orientation: z.array(z.enum(["north", "south", "east", "west"])).default([]),
  condition: z.enum(["new", "good", "renovation", "construction"]).optional(),
}).default({}),
```

### Étape 5 — Titre & Description (NOUVEAU)

```
┌─────────────────────────────────────────────────┐
│ Description de votre bien                        │
├─────────────────────────────────────────────────┤
│                                                  │
│ Titre de l'annonce *                             │
│ [F3 Appartement standing, vue dégagée      ]    │
│                                          18/120  │
│                                                  │
│ Description *                                    │
│ ┌───────────────────────────────────────────┐   │
│ │ Bel appartement F3 situé au 3ème étage   │   │
│ │ d'une résidence calme à Oum El Bouaghi.  │   │
│ │ Comprend un salon, 2 chambres, cuisine   │   │
│ │ équipée, 2 salles de bain. Ascenseur,    │   │
│ │ parking au sous-sol. Vue dégagée...      │   │
│ │                                           │   │
│ │                                           │   │
│ └───────────────────────────────────────────┘   │
│                                        124/2000  │
│                                                  │
│ ┌───────────────────────────────────────────┐   │
│ │ ✨ Générer avec l'IA                      │   │
│ │ Claude va rédiger une description         │   │
│ │ professionnelle basée sur vos infos.      │   │
│ │ Vous pourrez la modifier ensuite.         │   │
│ │                                           │   │
│ │        [Générer la description]           │   │
│ └───────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Comportement :**
- Titre : `<input>` (pas textarea), min 10 chars, max 120 chars, compteur live
- Description : `<textarea>` avec min 50 chars, max 2000 chars, compteur live
- Bouton IA : appelle Claude API en server action, pré-remplit la description
  - Input pour l'IA : toutes les données des étapes 1-4 (type, localisation, prix, surface, détails)
  - Prompt : "Rédige une description immobilière professionnelle en français pour ce bien : [données]. 150-250 mots. Ton professionnel mais chaleureux. Ne pas inventer de caractéristiques non fournies."
  - Pendant la génération : loading spinner + "Rédaction en cours..."
  - Résultat injecté dans le textarea, l'utilisateur peut modifier
- Si l'utilisateur ne veut pas d'IA, il écrit manuellement (la description est requise, pas l'IA)
- Suggestion : si le titre est court (< 20 chars), afficher une suggestion subtile

### Étape 6 — Photos (NOUVEAU — critique)

```
┌─────────────────────────────────────────────────┐
│ Photos de votre bien                             │
├─────────────────────────────────────────────────┤
│                                                  │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│                                                  │
│   📷 Glissez vos photos ici                     │
│   ou cliquez pour sélectionner                   │
│                                                  │
│   JPG, PNG, WebP — max 10 Mo par photo          │
│   Minimum 1 photo, maximum 20                    │
│                                                  │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                  │
│ Photos ajoutées (3/20)                           │
│ ┌──────┐ ┌──────┐ ┌──────┐                     │
│ │[img1]│ │[img2]│ │[img3]│                      │
│ │ ⭐📍 │ │  📍  │ │  📍  │   ⭐ = couverture   │
│ │  ✕   │ │  ✕   │ │  ✕   │   Drag pour réordonner│
│ └──────┘ └──────┘ └──────┘                      │
│                                                  │
│ 💡 La première photo sera la couverture.         │
│    Glissez pour réordonner.                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Comportement :**
- Drop zone : drag-and-drop + click-to-select (input type="file" hidden)
- Formats acceptés : JPEG, PNG, WebP, AVIF (définis dans `ALLOWED_MIME_TYPES`)
- Taille max : 10 MB par photo (défini dans `MAX_UPLOAD_SIZE_BYTES`)
- Min 1 photo requise pour passer à l'étape suivante
- Max 20 photos
- Preview : thumbnails grid (3 colonnes desktop, 2 mobile)
- Couverture : la première photo par défaut, étoile ⭐ visible
- Réordonnancement : drag-and-drop entre les thumbnails (ou flèches sur mobile)
- Suppression : bouton ✕ sur chaque thumbnail
- Upload : **deux phases** (comme déjà implémenté)
  1. `getSignedUploadUrlAction` → obtient une URL signée Supabase Storage
  2. Upload direct du navigateur vers Storage (XHR avec progress bar)
  3. `finalizeMediaUploadAction` → crée l'entrée dans `listing_media`
- Progress bar par photo pendant l'upload
- Erreurs : "Photo trop lourde (max 10 Mo)", "Format non supporté"
- L'upload se fait à cette étape (pas au submit final) pour que le récapitulatif puisse les afficher

**Note technique :** L'action actuelle `getSignedUploadUrlAction` nécessite un `listing_id`.
Or à l'étape 6, le listing n'est pas encore créé. Deux options :
- **Option A (recommandée)** : Créer le listing en `draft` à l'étape 1 (ou au début de l'étape 6), puis uploader les photos sur ce draft. Le publish se fait à l'étape 7.
- **Option B** : Stocker les photos en local (blob URLs) jusqu'au submit, puis uploader tout d'un coup. Plus simple côté UX mais risque de timeout sur mobile.

**Recommandation : Option A.** Créer le listing en `draft` au moment où l'utilisateur entre dans l'étape 6. Les étapes 1-5 collectent les données côté client (state), l'étape 6 persiste le draft et uploade les photos, l'étape 7 publie.

### Étape 7 — Récapitulatif & Publication (amélioré)

```
┌─────────────────────────────────────────────────┐
│ Récapitulatif de votre annonce                   │
├─────────────────────────────────────────────────┤
│                                                  │
│ ┌───────────────────────────────────────────┐   │
│ │  PREVIEW CARD (comme elle apparaîtra)     │   │
│ │  ┌────────────────────────────────────┐   │   │
│ │  │        [Photo couverture]           │   │   │
│ │  │  VENTE · VILLA                      │   │   │
│ │  │  F3 Appartement standing, vue dégagée│  │   │
│ │  │  Oum El Bouaghi                     │   │   │
│ │  │  30 000 000 DZD · 100 m²           │   │   │
│ │  └────────────────────────────────────┘   │   │
│ └───────────────────────────────────────────┘   │
│                                                  │
│ Détails                                          │
│ ┌───────────────────────────────────────────┐   │
│ │ Type        Vente · Villa                 │   │
│ │ Localisation Oum El Bouaghi               │   │
│ │ Prix        30 000 000 DZD                │   │
│ │ Surface     100 m²                        │   │
│ │ Pièces      4                             │   │
│ │ SDB         2                             │   │
│ │ Étage       3/5                           │   │
│ │ État        Bon état                      │   │
│ │ Équipements Ascenseur, Parking, Balcon    │   │
│ │ Photos      3 photos                      │   │
│ └───────────────────────────────────────────┘   │
│                                                  │
│ Description                                      │
│ "Bel appartement F3 situé au 3ème étage..."     │
│                                                  │
│ Vos coordonnées (visibles sur l'annonce)         │
│ ┌───────────────────────────────────────────┐   │
│ │ Téléphone *  [0555 XX XX XX            ]  │   │
│ │ ☐ Afficher mon numéro sur l'annonce       │   │
│ │ ☐ Accepter les messages via la plateforme │   │
│ └───────────────────────────────────────────┘   │
│                                                  │
│ ┌───────────────────────────────────────────┐   │
│ │ ✅ Votre annonce sera publiée             │   │
│ │ immédiatement. Il vous restera 1          │   │
│ │ emplacement libre sur 2.                  │   │
│ └───────────────────────────────────────────┘   │
│                                                  │
│ [← Retour]                    [Publier l'annonce]│
│                                                  │
└─────────────────────────────────────────────────┘
```

**Améliorations vs actuel :**
- **Preview card** : montre le listing exactement comme il apparaîtra sur AqarSearch
- **Contact info** : téléphone requis pour un particulier (l'agence a déjà le sien)
- **Toggle message** : choix d'accepter les messages via la plateforme
- **Erreur RLS corrigée** : le listing est déjà en `draft` (créé à l'étape 6), le publish change juste le status
- **Erreurs user-friendly** : plus jamais de message RLS brut. Tout passe par `fail()` avec message français.

---

## 4. SCHEMA ZOD COMPLET

```typescript
// schemas/individual-listing-v2.schema.ts

import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";
import { LOCALES, type Locale } from "@aqarvision/config";

export const LISTING_TYPES = ["sale", "rent", "vacation"] as const;
export const PROPERTY_TYPES = [
  "apartment", "villa", "terrain", "commercial",
  "office", "building", "farm", "warehouse",
] as const;
export const CONDITIONS = ["new", "good", "renovation", "construction"] as const;
export const ORIENTATIONS = ["north", "south", "east", "west"] as const;

export const IndividualListingV2Schema = z.object({
  // Step 1
  listing_type: z.enum(LISTING_TYPES),
  property_type: z.enum(PROPERTY_TYPES),

  // Step 2
  wilaya_code: z.string().min(1),
  commune_id: z.number().int().positive().optional(),
  address_text: z.string().max(200).transform(sanitizeInput).optional(),
  latitude: z.number().min(19).max(38).optional(),
  longitude: z.number().min(-9).max(12).optional(),

  // Step 3
  current_price: z.number().positive("Le prix doit être positif"),
  surface_m2: z.number().positive("La surface doit être positive").optional(),
  floor: z.number().int().min(0).max(50).optional(),
  total_floors: z.number().int().min(1).max(50).optional(),
  year_built: z.number().int().min(1900).max(new Date().getFullYear()).optional(),

  // Step 4
  rooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  details: z.object({
    has_elevator: z.boolean().default(false),
    has_parking: z.boolean().default(false),
    has_balcony: z.boolean().default(false),
    has_pool: z.boolean().default(false),
    has_garden: z.boolean().default(false),
    furnished: z.boolean().default(false),
    has_ac: z.boolean().default(false),
    has_heating: z.boolean().default(false),
    sea_view: z.boolean().default(false),
    has_terrace: z.boolean().default(false),
    has_cave: z.boolean().default(false),
    has_intercom: z.boolean().default(false),
    has_guardian: z.boolean().default(false),
    has_digicode: z.boolean().default(false),
    orientation: z.array(z.enum(ORIENTATIONS)).default([]),
    condition: z.enum(CONDITIONS).optional(),
  }).default({}),

  // Step 5
  title: z.string().min(10, "Min 10 caractères").max(120, "Max 120 caractères").transform(sanitizeInput),
  description: z.string().min(50, "Min 50 caractères").max(2000, "Max 2000 caractères").transform(sanitizeInput),

  // Step 7
  contact_phone: z.string().min(9, "Numéro invalide").max(15).optional(),
  show_phone: z.boolean().default(true),
  accept_messages: z.boolean().default(true),
});

export type IndividualListingV2Input = z.infer<typeof IndividualListingV2Schema>;
```

---

## 5. FLOW D'ACTION SERVER-SIDE

### Nouvelle stratégie : Draft → Photos → Publish

```
Étapes 1-5 : Données collectées côté CLIENT (useState)
             Aucun appel serveur.

Étape 6 :   "Créer brouillon + uploader photos"
             1. createDraftListingAction(data steps 1-5) → listing_id
             2. Pour chaque photo :
                a. getSignedUploadUrlAction(listing_id, file_name, content_type)
                b. Upload direct browser → Supabase Storage
                c. finalizeMediaUploadAction(listing_id, storage_path, ...)
             3. Toutes les photos sont liées au listing

Étape 7 :   "Publier"
             1. publishIndividualListingAction(listing_id, contact_phone, show_phone)
                → UPDATE listings SET current_status = 'published'
                → INSERT status_versions
```

### Server Actions requises

```
1. createDraftIndividualListingAction(formData)
   → Valide via IndividualListingV2Schema
   → INSERT listings (status = 'draft')
   → INSERT listing_translations (fr: title + description)
   → INSERT price_versions
   → INSERT status_versions (draft)
   → Return { listing_id, slug }

2. getSignedUploadUrlAction(input)        ← EXISTANT, adapter pour individual
3. finalizeMediaUploadAction(input)       ← EXISTANT, adapter pour individual

4. publishIndividualListingAction(listing_id, contact_phone)
   → Vérifier que le listing a ≥ 1 photo
   → Vérifier le quota
   → UPDATE listings SET current_status = 'published', contact_phone, show_phone
   → INSERT status_versions (published)
   → Return { success, slug }

5. generateListingDescriptionAction(data)  ← EXISTANT AI action, réutiliser
```

---

## 6. DESIGN SYSTEM ZINC — Composants du Wizard

Utiliser le design system Zinc défini dans la skill `aqarvision-ux-ui`. Points clés :

### Stepper (7 étapes)

```tsx
// Horizontal sur desktop (avec labels), vertical compacte sur mobile (numéros seuls)
// Couleurs : completed = zinc-900, current = amber-500, future = zinc-300
// Check icon pour les étapes complétées
// Ligne de connexion : complétée = zinc-900, future = zinc-200
```

### Cards de sélection (type/bien)

```tsx
// Sélectionné : border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/20
// Non sélectionné : border border-zinc-200 dark:border-zinc-700
// Hover : shadow-sm border-zinc-300
// Icon : 24px, zinc-500 normal, amber-600 selected
```

### Inputs

```tsx
// h-10, rounded-md, border border-zinc-200
// Focus : border-amber-500 ring-2 ring-amber-500/20
// Suffix (DZD, m²) : bg-zinc-50 text-zinc-500 px-3, arrondi côté end
```

### Upload zone

```tsx
// Dashed border 2px, rounded-xl, zinc-200 border, zinc-50 bg
// Hover : border-amber-400 bg-amber-50/50
// Drag over : border-amber-500 bg-amber-100/50 scale-[1.01]
// Thumbnails : rounded-lg, 100px height, object-cover
// Cover badge : absolute top-1 start-1, amber-500 bg, star icon
```

### Boutons navigation

```tsx
// "Retour" : ghost button (outline zinc-200)
// "Suivant" : solid button (bg-zinc-900 text-zinc-50, dark:bg-zinc-50 dark:text-zinc-900)
// "Publier" : accent button (bg-amber-500 text-white, hover:bg-amber-600)
// Disabled : opacity-50 pointer-events-none
```

---

## 7. MIGRATIONS DB REQUISES

```
00183_individual_rls_children.sql     → Fix RLS (Section 1)
00184_listing_contact_fields.sql      → Ajouter contact_phone, show_phone, accept_messages
00185_listing_extended_details.sql    → Ajouter floor, total_floors, year_built, address_text
                                        (si pas déjà dans le schema)
```

### Migration 00184

```sql
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS show_phone boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS accept_messages boolean NOT NULL DEFAULT true;
```

### Migration 00185

```sql
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS floor integer,
  ADD COLUMN IF NOT EXISTS total_floors integer,
  ADD COLUMN IF NOT EXISTS year_built integer,
  ADD COLUMN IF NOT EXISTS address_text text;
```

---

## 8. FICHIERS À CRÉER / MODIFIER

### Créer

```
supabase/migrations/00183_individual_rls_children.sql
supabase/migrations/00184_listing_contact_fields.sql
supabase/migrations/00185_listing_extended_details.sql

src/features/listings/schemas/individual-listing-v2.schema.ts
src/features/listings/actions/create-draft-individual.action.ts
src/features/listings/actions/publish-individual.action.ts
src/features/listings/components/DeposerWizardV2.tsx
src/features/listings/components/deposer/StepType.tsx
src/features/listings/components/deposer/StepLocation.tsx
src/features/listings/components/deposer/StepPriceSurface.tsx
src/features/listings/components/deposer/StepDetails.tsx
src/features/listings/components/deposer/StepDescription.tsx
src/features/listings/components/deposer/StepPhotos.tsx
src/features/listings/components/deposer/StepRecap.tsx
src/features/listings/components/deposer/WizardStepper.tsx
src/features/listings/components/deposer/PhotoUploader.tsx
src/features/listings/components/deposer/LocationPicker.tsx
```

### Modifier

```
src/app/[locale]/deposer/page.tsx            → importer DeposerWizardV2 au lieu de DeposerWizard
src/features/media/actions/upload.action.ts  → adapter getSignedUploadUrl pour individual owner
src/features/ai/actions/ai.action.ts         → adapter generateDescription pour individual (pas agency)
```

### Supprimer (après migration)

```
src/features/listings/components/DeposerWizard.tsx  → remplacé par DeposerWizardV2
```

---

## 9. CHECKLIST DE VALIDATION

- [ ] Migration 00183 appliquée → plus d'erreur RLS sur listing_translations
- [ ] Le wizard a 7 étapes visibles dans le stepper
- [ ] Étape 2 affiche une carte MapLibre avec pin draggable
- [ ] Étape 3 calcule le prix/m² automatiquement
- [ ] Étape 4 a 14 équipements + orientation + état
- [ ] Étape 5 a un champ description (min 50 chars) + bouton IA
- [ ] Étape 6 permet d'uploader 1-20 photos avec drag-drop
- [ ] Les photos montrent une progress bar pendant l'upload
- [ ] La première photo est marquée comme couverture
- [ ] Étape 7 montre une preview card réaliste
- [ ] Étape 7 demande le numéro de téléphone
- [ ] Le bouton "Publier" fonctionne sans erreur RLS
- [ ] Le listing publié apparaît dans la recherche
- [ ] Le listing publié a ses photos visibles
- [ ] Le compteur de quota se met à jour après publication
- [ ] RTL : le wizard est correct en arabe
- [ ] Mobile : toutes les étapes sont utilisables sur petit écran
- [ ] Dark mode : le wizard respecte le thème Zinc
- [ ] Erreurs : messages user-friendly, jamais de message technique brut
