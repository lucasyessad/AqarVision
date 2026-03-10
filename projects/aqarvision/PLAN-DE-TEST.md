# Plan de Test Complet - AqarVision v0.1.0

> **Objectif** : Tester l'intégralité de l'application en local, en simulant le parcours d'un nouveau client (propriétaire d'agence immobilière).
>
> **Date** : 2026-03-10
> **Environnement** : Local (localhost:3000) + Supabase (projet de test)

---

## Table des matières

1. [Prérequis & Setup](#1-prérequis--setup)
2. [Phase 1 - Pages publiques (visiteur anonyme)](#phase-1---pages-publiques-visiteur-anonyme)
3. [Phase 2 - Inscription & Authentification](#phase-2---inscription--authentification)
4. [Phase 3 - Dashboard (propriétaire d'agence)](#phase-3---dashboard-propriétaire-dagence)
5. [Phase 4 - Mini-site vitrine de l'agence](#phase-4---mini-site-vitrine-de-lagence)
6. [Phase 5 - Soumission de leads (visiteur)](#phase-5---soumission-de-leads-visiteur)
7. [Phase 6 - Plans & Feature Gating](#phase-6---plans--feature-gating)
8. [Phase 7 - Internationalisation (i18n)](#phase-7---internationalisation-i18n)
9. [Phase 8 - SEO & Performance](#phase-8---seo--performance)
10. [Phase 9 - Sécurité & Edge Cases](#phase-9---sécurité--edge-cases)
11. [Phase 10 - Tests unitaires existants](#phase-10---tests-unitaires-existants)
12. [Phase 11 - Responsive & Cross-browser](#phase-11---responsive--cross-browser)
13. [Résumé des bugs potentiels à surveiller](#résumé-des-bugs-potentiels-à-surveiller)

---

## 1. Prérequis & Setup

### 1.1 Environnement local

| Étape | Commande / Action | Résultat attendu |
|-------|-------------------|------------------|
| Installer les dépendances | `cd projects/aqarvision && npm install` | Pas d'erreurs, node_modules créé |
| Copier .env | `cp .env.example .env.local` | Fichier .env.local créé |
| Configurer Supabase | Remplir `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Variables pointant vers un projet Supabase de test |
| Exécuter le schéma SQL | Coller `supabase/schema.sql` dans l'éditeur SQL Supabase | 11 tables créées sans erreur |
| Lancer le serveur | `npm run dev` | Server démarré sur http://localhost:3000 |
| Vérifier le build | `npm run build` | Build réussi sans erreur TypeScript |

### 1.2 Données de test à insérer

Insérer manuellement via Supabase Dashboard ou SQL :

```sql
-- 1. Créer un utilisateur via Supabase Auth (signup email/password)
--    Récupérer l'UUID généré (ex: 'user-uuid-here')

-- 2. Créer une agence Starter
INSERT INTO agencies (id, owner_id, name, slug, description, phone, email, wilaya, active_plan, locale)
VALUES (
  gen_random_uuid(),
  'user-uuid-here',
  'Agence Immobilière El Bahia',
  'el-bahia',
  'Votre partenaire immobilier de confiance à Oran',
  '+213 555 123 456',
  'contact@elbahia-immo.dz',
  'Oran',
  'starter',
  'fr'
);

-- 3. Créer une agence Enterprise (pour tester le rendu luxury)
INSERT INTO agencies (id, owner_id, name, slug, description, phone, email, wilaya, active_plan, locale,
  primary_color, secondary_color, hero_style, font_style, theme_mode, tagline,
  stats_years, stats_properties_sold, stats_clients,
  instagram_url, facebook_url)
VALUES (
  gen_random_uuid(),
  'user-uuid-here',
  'Prestige Immobilier Alger',
  'prestige-alger',
  'L''excellence immobilière au cœur d''Alger',
  '+213 555 789 012',
  'contact@prestige-alger.dz',
  'Alger',
  'enterprise',
  'fr',
  '#1a365d', '#c6a35a',
  'cover', 'elegant', 'light',
  'L''immobilier de prestige depuis 2010',
  15, 2500, 1800,
  'https://instagram.com/prestige_alger',
  'https://facebook.com/prestige.alger'
);

-- 4. Ajouter des propriétés de test
INSERT INTO properties (id, agency_id, created_by, title, description, price, surface, rooms, bathrooms,
  type, transaction_type, status, city, wilaya, address, currency, images, features, is_featured)
VALUES
  (gen_random_uuid(), '<agency-id-starter>', 'user-uuid-here',
   'Appartement F3 Hai Es-Salam', 'Bel appartement F3 rénové avec vue sur mer', 4500000, 85, 3, 1,
   'apartment', 'sale', 'active', 'Oran', 'Oran', 'Hai Es-Salam, Bloc 12',
   'DZD', ARRAY['https://picsum.photos/800/600?random=1','https://picsum.photos/800/600?random=2'],
   ARRAY['Parking','Ascenseur','Cuisine équipée'], true),

  (gen_random_uuid(), '<agency-id-starter>', 'user-uuid-here',
   'Villa avec jardin Bir El Djir', 'Grande villa familiale avec jardin et garage', 18000000, 250, 5, 2,
   'villa', 'sale', 'active', 'Oran', 'Oran', 'Bir El Djir, Cité 200 Logements',
   'DZD', ARRAY['https://picsum.photos/800/600?random=3','https://picsum.photos/800/600?random=4'],
   ARRAY['Jardin','Garage','Terrasse','Climatisation'], true),

  (gen_random_uuid(), '<agency-id-starter>', 'user-uuid-here',
   'Local commercial Centre-ville', 'Local commercial idéal pour commerce', 50000, 120, 2, 1,
   'commercial', 'rent', 'active', 'Oran', 'Oran', 'Rue Larbi Ben M''hidi',
   'DZD', ARRAY['https://picsum.photos/800/600?random=5'],
   ARRAY['Vitrine','Climatisation'], false),

  (gen_random_uuid(), '<agency-id-enterprise>', 'user-uuid-here',
   'Penthouse Hydra', 'Penthouse de luxe avec terrasse panoramique', 95000000, 320, 6, 3,
   'apartment', 'sale', 'active', 'Alger', 'Alger', 'Hydra, Résidence Les Jardins',
   'DZD', ARRAY['https://picsum.photos/800/600?random=6','https://picsum.photos/800/600?random=7','https://picsum.photos/800/600?random=8'],
   ARRAY['Piscine','Terrasse','Vue panoramique','Parking privé','Concierge'], true),

  (gen_random_uuid(), '<agency-id-enterprise>', 'user-uuid-here',
   'Villa Contemporaine El Biar', 'Villa d''architecte avec piscine et domotique', 150000000, 500, 7, 4,
   'villa', 'sale', 'active', 'Alger', 'Alger', 'El Biar, Quartier résidentiel',
   'DZD', ARRAY['https://picsum.photos/800/600?random=9','https://picsum.photos/800/600?random=10'],
   ARRAY['Piscine','Domotique','Jardin paysager','Triple garage','Salle de sport'], true);

-- 5. Un bien en brouillon (ne doit PAS apparaître publiquement)
INSERT INTO properties (id, agency_id, created_by, title, description, price, surface, rooms, type,
  transaction_type, status, city, wilaya, currency)
VALUES (gen_random_uuid(), '<agency-id-starter>', 'user-uuid-here',
  'Brouillon - Terrain Hassi Bounif', 'Terrain à bâtir', 8000000, 400, 0, 'land',
  'sale', 'draft', 'Oran', 'Oran', 'DZD');
```

> **Note** : Remplacer `'user-uuid-here'`, `<agency-id-starter>`, `<agency-id-enterprise>` par les vrais UUIDs.

---

## Phase 1 - Pages publiques (visiteur anonyme)

### T1.1 - Landing Page (`/`)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Chargement | Accéder à `http://localhost:3000` | Page chargée sans erreur, design cohérent | ☐ |
| 2 | Contenu | Vérifier le contenu marketing | Texte AqarVision, proposition de valeur claire | ☐ |
| 3 | Navigation | Cliquer sur les liens du header/footer | Tous les liens fonctionnent | ☐ |
| 4 | CTA Pricing | Cliquer sur "Voir les plans" ou CTA similaire | Redirige vers `/pricing` | ☐ |
| 5 | Responsive | Redimensionner en mobile (375px) | Layout adapté, pas de scroll horizontal | ☐ |

### T1.2 - Page Pricing (`/pricing`)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Affichage plans | Accéder à `/pricing` | 3 plans affichés : Starter (5 000 DA/mois), Pro (12 000 DA), Enterprise (30 000 DA) | ☐ |
| 2 | Features par plan | Vérifier les features listées | Chaque plan montre ses limites (propriétés, leads, stockage) | ☐ |
| 3 | Plan Enterprise | Vérifier les features premium | Mini-site luxury, vidéo hero, couleurs personnalisées, domaine custom | ☐ |
| 4 | CTA plans | Cliquer sur les boutons d'action | Comportement attendu (signup ou contact) | ☐ |
| 5 | Responsive | Tester sur mobile | Plans empilés verticalement, lisibles | ☐ |

### T1.3 - Page 404

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | URL invalide | Accéder à `/page-inexistante` | Page 404 personnalisée affichée | ☐ |
| 2 | Agence invalide | Accéder à `/agence/slug-inexistant` | Page not-found de l'agence | ☐ |
| 3 | Bien invalide | Accéder à `/agence/el-bahia/biens/uuid-inexistant` | Page not-found ou erreur gérée | ☐ |

---

## Phase 2 - Inscription & Authentification

### T2.1 - Création de compte

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Page login | Accéder à `/login` | Page de connexion affichée (ou redirect) | ☐ |
| 2 | Signup Supabase | Créer un compte via Supabase Auth | Compte créé, email de confirmation | ☐ |
| 3 | Confirmation email | Cliquer le lien de confirmation | Email confirmé, session active | ☐ |
| 4 | Redirect post-login | Se connecter | Redirigé vers `/dashboard` | ☐ |

> **⚠️ Note** : Les pages `/login` et `/signup` ne sont PAS encore implémentées dans le code. Le middleware les gère mais il n'y a pas d'UI. **Ce test documentera ce manque.**

### T2.2 - Protection des routes

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Dashboard sans auth | Accéder à `/dashboard/branding` sans être connecté | Redirect vers `/login?redirectTo=/dashboard/branding` | ☐ |
| 2 | Dashboard avec auth | Se connecter puis accéder à `/dashboard/branding` | Page branding affichée | ☐ |
| 3 | Token expiré | Attendre l'expiration du token / supprimer cookies | Redirect vers login | ☐ |

### T2.3 - Déconnexion

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Logout | Cliquer déconnexion (si disponible) | Session terminée, redirect vers `/` | ☐ |
| 2 | Accès post-logout | Accéder à `/dashboard` après logout | Redirect vers login | ☐ |

---

## Phase 3 - Dashboard (propriétaire d'agence)

### T3.1 - Page Branding (`/dashboard/branding`)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Chargement | Accéder à `/dashboard/branding` | Formulaire pré-rempli avec les données de l'agence | ☐ |
| 2 | Modifier nom | Changer le nom de l'agence → Sauvegarder | Nom mis à jour en base, message de succès | ☐ |
| 3 | Modifier description | Changer la description → Sauvegarder | Description mise à jour | ☐ |
| 4 | Modifier téléphone | Entrer un nouveau numéro → Sauvegarder | Téléphone mis à jour | ☐ |
| 5 | Modifier couleur primaire | Changer la couleur → Sauvegarder | Couleur appliquée sur le mini-site | ☐ |
| 6 | Modifier locale | Passer de FR à AR → Sauvegarder | Locale changée, mini-site en arabe | ☐ |
| 7 | Upload logo | Uploader une image logo | Logo affiché dans le dashboard et mini-site | ☐ |
| 8 | Upload cover (Enterprise) | Uploader une image de couverture | Image affichée dans le hero du mini-site | ☐ |
| 9 | Champs vides | Soumettre avec nom vide | Erreur de validation Zod affichée | ☐ |
| 10 | Slug invalide | Essayer de modifier le slug (si possible) | Slug validé ou champ readonly | ☐ |

### T3.2 - Feature Gating (Plan Starter)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Couleur secondaire | Essayer de modifier la couleur secondaire | Champ désactivé ou message "Pro requis" | ☐ |
| 2 | Hero vidéo | Chercher l'option vidéo hero | Option non disponible / Enterprise only | ☐ |
| 3 | Font style | Chercher les options de font | Options limitées ou bloquées | ☐ |
| 4 | Domaine custom | Chercher l'option domaine custom | Non disponible pour Starter | ☐ |

---

## Phase 4 - Mini-site vitrine de l'agence

### T4.1 - Agence Starter (`/agence/el-bahia`)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Page d'accueil | Accéder à `/agence/el-bahia` | Page vitrine simple, nom + description + biens en vedette | ☐ |
| 2 | Header | Vérifier le header | Nom agence, navigation (Accueil, Biens, À propos, Contact) | ☐ |
| 3 | Biens en vedette | Vérifier les propriétés affichées | Seuls les biens `is_featured: true` et `status: active` | ☐ |
| 4 | Bien brouillon | Vérifier l'absence du brouillon | Le bien "Brouillon - Terrain" ne doit PAS apparaître | ☐ |
| 5 | Prix formaté | Vérifier le format des prix | "4 500 000 DA" (avec séparateurs de milliers) | ☐ |
| 6 | Couleur primaire | Vérifier la couleur appliquée | Couleur par défaut (pas de custom pour Starter basique) | ☐ |
| 7 | Pas d'animations | Vérifier l'absence d'animations luxury | Pas de scroll-reveal, pas de hero animé | ☐ |

### T4.2 - Page Biens (`/agence/el-bahia/biens`)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Liste complète | Accéder à `/agence/el-bahia/biens` | Grille de propriétés actives (3 biens) | ☐ |
| 2 | Pas de brouillons | Vérifier | Seuls les biens `status: active` affichés | ☐ |
| 3 | Carte propriété | Vérifier le contenu d'une carte | Image, titre, prix, surface, chambres, type | ☐ |
| 4 | Filtre par type | Utiliser le filtre de type (si disponible) | Filtrage correct (appartement/villa/commercial) | ☐ |
| 5 | Pagination | Si > 12 biens, vérifier la pagination | Navigation entre pages fonctionnelle | ☐ |
| 6 | Clic sur un bien | Cliquer sur une propriété | Redirige vers `/agence/el-bahia/biens/[id]` | ☐ |

### T4.3 - Détail d'un bien (`/agence/el-bahia/biens/[id]`)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Chargement | Accéder à une fiche bien | Page complète avec toutes les infos | ☐ |
| 2 | Galerie d'images | Vérifier les images | Images affichées, lazy loading | ☐ |
| 3 | Informations | Vérifier les détails | Titre, prix, surface, chambres, SDB, type, adresse | ☐ |
| 4 | Features | Vérifier les caractéristiques | Liste des features (Parking, Ascenseur, etc.) | ☐ |
| 5 | Formulaire contact | Remplir le formulaire de contact | Voir Phase 5 (Leads) | ☐ |
| 6 | Bouton WhatsApp | Cliquer sur WhatsApp | Ouvre WhatsApp avec message pré-rempli | ☐ |
| 7 | Biens similaires | Vérifier la section "Biens similaires" | Autres biens de la même agence affichés | ☐ |
| 8 | Bien inexistant | Accéder avec un UUID invalide | Page 404 ou erreur gérée | ☐ |

### T4.4 - Page À propos (`/agence/el-bahia/a-propos`)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Contenu | Accéder à la page | Description de l'agence, coordonnées | ☐ |
| 2 | Pas de stats | Vérifier (plan Starter) | Pas de section statistiques (Enterprise only) | ☐ |

### T4.5 - Page Contact (`/agence/el-bahia/contact`)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Formulaire | Accéder à la page | Formulaire de contact fonctionnel | ☐ |
| 2 | Carte / Map | Vérifier la carte | Map OpenStreetMap si coordonnées renseignées | ☐ |
| 3 | Infos contact | Vérifier les coordonnées | Téléphone, email, adresse affichés | ☐ |
| 4 | Réseaux sociaux | Vérifier les liens | Liens Instagram/Facebook si renseignés | ☐ |

### T4.6 - Agence Enterprise (`/agence/prestige-alger`)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Hero Luxury | Accéder à la page | Hero section avec style "cover", tagline, animations | ☐ |
| 2 | Layout Luxury | Vérifier le header | Navigation sticky, polished, animations de scroll | ☐ |
| 3 | Couleurs custom | Vérifier les couleurs | Primaire #1a365d, secondaire #c6a35a appliquées | ☐ |
| 4 | Font elegant | Vérifier la typographie | Style "elegant" appliqué | ☐ |
| 5 | Statistiques | Vérifier la section stats | 15 ans, 2500 propriétés, 1800 clients | ☐ |
| 6 | Scroll reveal | Scroller la page | Animations au scroll (sections apparaissent) | ☐ |
| 7 | Social feed | Vérifier la section réseaux | Feed Instagram/Facebook affiché | ☐ |
| 8 | Properties section | Vérifier les biens | Layout luxury avec cards premium | ☐ |
| 9 | Dark mode | Changer le theme_mode en "dark" en base | Rendu en mode sombre | ☐ |

---

## Phase 5 - Soumission de leads (visiteur)

### T5.1 - Formulaire de contact (page agence)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Champs requis | Soumettre un formulaire vide | Erreurs de validation (nom, téléphone requis) | ☐ |
| 2 | Soumission valide | Remplir nom, téléphone, message → Envoyer | Lead créé en base, message de succès | ☐ |
| 3 | Vérifier en base | Vérifier dans Supabase `leads` table | Lead avec source "contact_form", status "new" | ☐ |
| 4 | Email optionnel | Soumettre avec email | Email enregistré dans le lead | ☐ |
| 5 | Téléphone invalide | Entrer un téléphone invalide (ex: "abc") | Erreur de validation | ☐ |

### T5.2 - Formulaire depuis un bien

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Soumission | Remplir le formulaire sur `/agence/el-bahia/biens/[id]` | Lead créé avec `property_id` renseigné | ☐ |
| 2 | Source | Vérifier en base | `source: 'property_detail'` | ☐ |
| 3 | Association | Vérifier le lead | `property_id` pointe vers le bon bien | ☐ |

### T5.3 - Rate Limiting

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Soumissions rapides | Soumettre 5+ formulaires en < 1 minute | Message d'erreur "Trop de demandes" après la limite | ☐ |
| 2 | Après attente | Attendre puis re-soumettre | Soumission acceptée à nouveau | ☐ |

### T5.4 - WhatsApp

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Bouton flottant | Vérifier la présence du bouton | Bouton WhatsApp visible en bas à droite | ☐ |
| 2 | Lien WhatsApp | Cliquer le bouton | Ouvre `wa.me/+213555123456` avec message pré-rempli | ☐ |
| 3 | Depuis un bien | Cliquer WhatsApp sur une fiche bien | Message inclut le nom du bien | ☐ |

---

## Phase 6 - Plans & Feature Gating

### T6.1 - Comparaison Starter vs Enterprise

| Fonctionnalité | Starter (`el-bahia`) | Enterprise (`prestige-alger`) | Status |
|----------------|---------------------|-------------------------------|--------|
| Hero simple | ✅ Affiché | ❌ Remplacé par LuxuryHero | ☐ |
| Hero Luxury (vidéo/cover) | ❌ Non affiché | ✅ Affiché | ☐ |
| Animations scroll | ❌ Aucune | ✅ Scroll reveal | ☐ |
| Couleurs custom | ❌ Défaut | ✅ Primary + Secondary | ☐ |
| Font custom | ❌ Défaut | ✅ Elegant/Classic/Modern | ☐ |
| Section stats | ❌ Absente | ✅ Affichée | ☐ |
| Layout luxury | ❌ Basic header | ✅ Sticky nav animé | ☐ |
| Social feed | ⚠️ Basique | ✅ Complet | ☐ |
| Bouton WhatsApp | ✅ | ✅ | ☐ |
| Contact form | ✅ | ✅ (styling premium) | ☐ |

### T6.2 - Limites par plan (vérifier `plan-gate.ts`)

| Limite | Starter | Pro | Enterprise | Status |
|--------|---------|-----|------------|--------|
| Max propriétés | 10 | 50 | Illimité | ☐ |
| Max leads/mois | 50 | 200 | Illimité | ☐ |
| Stockage | 100 MB | 1 GB | 10 GB | ☐ |
| Mini-site luxury | ❌ | ❌ | ✅ | ☐ |
| Domaine custom | ❌ | ❌ | ✅ | ☐ |

---

## Phase 7 - Internationalisation (i18n)

### T7.1 - Français (défaut)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Labels | Vérifier les textes sur le mini-site | Tous les textes en français | ☐ |
| 2 | Prix | Vérifier le format des prix | "4 500 000 DA" | ☐ |
| 3 | Dates | Vérifier les dates | Format FR (JJ/MM/AAAA) | ☐ |

### T7.2 - Arabe

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Changer locale | Mettre `locale: 'ar'` sur l'agence en base | Mini-site en arabe | ☐ |
| 2 | Direction RTL | Vérifier la direction du texte | `dir="rtl"` appliqué, layout inversé | ☐ |
| 3 | Traductions | Vérifier les clés | Pas de clés manquantes (pas de texte brut `key.missing`) | ☐ |
| 4 | Prix en arabe | Vérifier le format | Format arabe correct avec "د.ج" | ☐ |
| 5 | Formulaire RTL | Tester le formulaire de contact | Champs alignés à droite | ☐ |

### T7.3 - Anglais

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Changer locale | Mettre `locale: 'en'` sur l'agence | Mini-site en anglais | ☐ |
| 2 | Direction LTR | Vérifier la direction | `dir="ltr"`, layout normal | ☐ |
| 3 | Traductions | Vérifier les clés | Tous les textes traduits | ☐ |

---

## Phase 8 - SEO & Performance

### T8.1 - Metadata & SEO

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Title tag | Inspecter `<title>` sur chaque page | Title dynamique et pertinent | ☐ |
| 2 | Meta description | Inspecter `<meta name="description">` | Description unique par page | ☐ |
| 3 | Open Graph | Inspecter les balises OG | `og:title`, `og:description`, `og:image` présents | ☐ |
| 4 | JSON-LD | Inspecter `<script type="application/ld+json">` | Structured data (Organization, RealEstateListing) | ☐ |
| 5 | Sitemap | Accéder à `/sitemap.xml` | Sitemap généré avec les URLs | ☐ |
| 6 | Robots.txt | Accéder à `/robots.txt` | Fichier robots.txt valide | ☐ |

### T8.2 - Performance

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Lighthouse | Lancer un audit Lighthouse (Chrome DevTools) | Score > 70 sur toutes les catégories | ☐ |
| 2 | Images lazy | Inspecter le réseau lors du scroll | Images chargées uniquement au scroll | ☐ |
| 3 | Bundle size | `npm run build` et vérifier les tailles | Pas de pages > 200KB (JS) | ☐ |
| 4 | TTFB | Mesurer le Time To First Byte | < 500ms en local | ☐ |
| 5 | Console errors | Ouvrir la console JS | Aucune erreur JavaScript | ☐ |

---

## Phase 9 - Sécurité & Edge Cases

### T9.1 - Row Level Security (RLS)

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Lecture publique agences | Requête anonyme `SELECT * FROM agencies` | Seules les agences publiques retournées | ☐ |
| 2 | Lecture publique biens | `SELECT * FROM properties WHERE status = 'active'` | Biens actifs uniquement | ☐ |
| 3 | Biens brouillon | Requête anonyme pour les brouillons | Aucun brouillon retourné | ☐ |
| 4 | Insertion lead | `INSERT INTO leads` en anonyme | Autorisé (formulaire public) | ☐ |
| 5 | Modification agence | `UPDATE agencies` en anonyme | Refusé par RLS | ☐ |
| 6 | Modification lead | `UPDATE leads` en anonyme | Refusé par RLS | ☐ |

### T9.2 - Validation des entrées

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | XSS dans nom | Entrer `<script>alert('xss')</script>` dans un champ | Script échappé, pas d'exécution | ☐ |
| 2 | SQL injection | Entrer `'; DROP TABLE agencies;--` dans un champ | Requête paramétrée, pas d'injection | ☐ |
| 3 | Long texte | Entrer 10 000 caractères dans description | Troncature ou erreur de validation | ☐ |
| 4 | Caractères spéciaux | Entrer des emojis, caractères arabes | Correctement sauvegardé et affiché | ☐ |
| 5 | Slug collision | Créer deux agences avec le même slug | Erreur d'unicité gérée | ☐ |

### T9.3 - Edge Cases

| # | Test | Action | Résultat attendu | Status |
|---|------|--------|-------------------|--------|
| 1 | Agence sans biens | Accéder à une agence sans propriétés | Message "Aucun bien disponible" | ☐ |
| 2 | Agence sans images | Propriété sans images | Placeholder ou image par défaut | ☐ |
| 3 | Prix zéro | Bien avec prix = 0 | Affiche "Prix sur demande" ou 0 DA | ☐ |
| 4 | Champs null | Agence sans téléphone, sans email | Pas de crash, champs omis | ☐ |
| 5 | Très long nom | Nom d'agence de 200 caractères | Troncature CSS, pas de débordement | ☐ |
| 6 | Double soumission | Cliquer 2x rapidement sur "Envoyer" | Un seul lead créé (debounce) | ☐ |

---

## Phase 10 - Tests unitaires existants

### T10.1 - Exécution des tests

| # | Test | Commande | Résultat attendu | Status |
|---|------|----------|-------------------|--------|
| 1 | Tous les tests | `npm run test:run` | 8 fichiers, tous passent ✅ | ☐ |
| 2 | Coverage | `npm run test:coverage` | Rapport de couverture généré | ☐ |
| 3 | Validators | `validators.test.ts` | Schémas Zod validés | ☐ |
| 4 | i18n | `i18n.test.ts` | Traductions FR/AR/EN ok | ☐ |
| 5 | Format | `format.test.ts` | Prix et localisation formatés | ☐ |
| 6 | Plan gate | `plan-gate.test.ts` | Feature gating correct | ☐ |
| 7 | Config | `config.test.ts` | Configuration valide | ☐ |
| 8 | Property | `property-validator.test.ts` | Validation propriétés ok | ☐ |

---

## Phase 11 - Responsive & Cross-browser

### T11.1 - Breakpoints

| Breakpoint | Largeur | Pages à tester | Status |
|------------|---------|----------------|--------|
| Mobile S | 320px | Landing, Pricing, Agence, Biens, Contact | ☐ |
| Mobile M | 375px | Landing, Pricing, Agence, Biens, Contact | ☐ |
| Mobile L | 425px | Landing, Pricing, Agence, Biens, Contact | ☐ |
| Tablet | 768px | Toutes les pages | ☐ |
| Laptop | 1024px | Toutes les pages | ☐ |
| Desktop | 1440px | Toutes les pages | ☐ |

### T11.2 - Checklist responsive

| # | Test | Résultat attendu | Status |
|---|------|-------------------|--------|
| 1 | Pas de scroll horizontal | Aucun défilement horizontal sur aucune page | ☐ |
| 2 | Images adaptées | Images redimensionnées correctement | ☐ |
| 3 | Navigation mobile | Menu hamburger fonctionnel (si implémenté) | ☐ |
| 4 | Formulaires | Champs 100% largeur sur mobile | ☐ |
| 5 | Cartes propriétés | Grid adapté (1 col mobile, 2 tablet, 3 desktop) | ☐ |
| 6 | Texte lisible | Taille minimum 14px, contraste suffisant | ☐ |

### T11.3 - Navigateurs

| Navigateur | Version | Status |
|------------|---------|--------|
| Chrome | Dernière | ☐ |
| Firefox | Dernière | ☐ |
| Safari | Dernière | ☐ |
| Edge | Dernière | ☐ |
| Chrome Mobile (Android) | Dernière | ☐ |
| Safari Mobile (iOS) | Dernière | ☐ |

---

## Résumé des bugs potentiels à surveiller

### Bloquants (MVP)

| # | Problème identifié | Sévérité | Impact |
|---|-------------------|----------|--------|
| 1 | **Pages login/signup manquantes** - Middleware gère les redirections mais aucune UI d'auth | 🔴 Critique | Impossible de se connecter sans Supabase Dashboard |
| 2 | **Pas de CRUD propriétés** - Impossible d'ajouter/éditer des biens depuis le dashboard | 🔴 Critique | Dépendance SQL pour ajouter des biens |
| 3 | **Pas de gestion des leads** - Aucune page pour voir/gérer les leads reçus | 🟠 Majeur | Leads perdus dans la base |
| 4 | **Pas de vérification ownership dans les actions** - Server actions vérifient le plan mais pas toujours le owner | 🟠 Majeur | Un user pourrait modifier une autre agence |

### Importants

| # | Problème identifié | Sévérité | Impact |
|---|-------------------|----------|--------|
| 5 | **Images `<img>` au lieu de `<Image>`** pour Starter/Pro | 🟡 Modéré | Performance dégradée |
| 6 | **Pas de CAPTCHA** sur les formulaires de contact | 🟡 Modéré | Spam possible |
| 7 | **Rate limiter en mémoire** - Reset au redémarrage du serveur | 🟡 Modéré | Contournable |
| 8 | **Pas de headers de sécurité** (CSP, HSTS, X-Frame-Options) | 🟡 Modéré | Vulnérabilités potentielles |
| 9 | **Erreurs silencieuses** - Les queries ne loguent pas les erreurs | 🟡 Modéré | Debug difficile |
| 10 | **Pas de pagination "infinie"** ni de recherche sur les biens | 🟢 Mineur | UX limitée |

---

## Checklist finale

- [ ] Tous les tests unitaires passent (`npm run test:run`)
- [ ] Build réussit sans erreur (`npm run build`)
- [ ] Aucune erreur console sur aucune page
- [ ] Mini-site Starter fonctionne (navigation complète)
- [ ] Mini-site Enterprise fonctionne (animations, couleurs, stats)
- [ ] Formulaires de contact soumettent des leads en base
- [ ] WhatsApp links fonctionnent
- [ ] i18n FR/AR/EN fonctionne (y compris RTL)
- [ ] Pages 404 personnalisées affichées
- [ ] SEO metadata présent sur toutes les pages
- [ ] Responsive correct sur mobile/tablet/desktop
- [ ] Aucune donnée brouillon visible publiquement
- [ ] RLS Supabase empêche les accès non autorisés

---

> **Temps estimé** : 2-3 heures pour un test complet
>
> **Prochaines étapes après les tests** :
> 1. Corriger les bugs identifiés
> 2. Implémenter les pages login/signup
> 3. Ajouter le CRUD propriétés dans le dashboard
> 4. Ajouter la gestion des leads
> 5. Intégrer un système de paiement
