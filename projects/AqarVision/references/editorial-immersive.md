# Editorial Immersive — Langage Design Marketing

> Spec du langage design pour les pages marketing, homepage, vitrines, et landing pages.
> Inspiration : Apple (cinematique), Stripe (precision), magazines immobilier de luxe.

> **MISE A JOUR MARS 2026 — Lire en priorite le CLAUDE.md (source de verite). Ce fichier est un complement.**
> Changements majeurs non refletes en detail ici :
> - Design system : **Stone** (pas Zinc) + **Teal** accent (pas Amber). Remplacer toutes les refs `zinc-*` par `stone-*` et `amber-*` accent par `teal-*`. Voir `design-tokens.md`.
> - **Homepage** : **8 sections** (pas 11). Voir CLAUDE.md "Homepage — 8 sections". Confiance implicite (pas de bloc dedie). Sections supprimees : Full Bleed Photo, Trending separee, Rent Carousel separee.
> - **Themes** : "MarocainContemporain" renomme **"MediterraneenContemporain"**. Voir `agency-themes.md` pour les 10 specs completes.
> - **Plans pricing** : Starter 2 900, Pro 6 900, Enterprise 12 900 DZD. Pas de gratuite.
> - **Vitrines** : video YouTube/Vimeo supportee (via `storefront_content.hero_video_url`). Wizard contenu vitrine 4 etapes dans ThemeStudio.
> - **Videos** : vitrines agences seulement. PAS de video sur les annonces.

---

## Principes

1. **Cinematique** — Chaque section raconte une partie de l'histoire. Transitions fluides, timing precis.
2. **Photo-immersive** — L'immobilier algerien est photogenique. Exploiter les paysages, l'architecture, la lumiere mediterraneenne.
3. **Typographie expressive** — Titres grands, contrastes forts, hierarchie marquee.
4. **Tricolore subtil** — Le sahara (or), le med (bleu), l'atlas (vert) apparaissent comme des accents, pas comme des drapeaux.
5. **Espace genereux** — Les sections respirent. Le whitespace est un outil de design.

---

## Homepage — Structure editoriale

### Hero Section
- **Hauteur** : 100vh (ou `min-h-screen`)
- **Image** : Plein ecran, photo immobiliere algerienne de qualite
- **Overlay** : Gradient du noir/65 au transparent puis noir/70
- **Contenu** :
  - Eyebrow : Texte amber avec lignes decoratives laterales
  - Headline : `text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white`
  - Mot-cle en amber (ex: "trouver" en amber dans "Votre facon de trouver un bien")
  - SearchBar centree
  - Sous-titre `text-lg text-zinc-300`
- **Animation** : Fade-in stagger (eyebrow → headline → searchbar → subtitle), 200ms delay entre chaque
- **Scroll indicator** : Chevron anime en bas

### Confidence Layer
- **Background** : `bg-sky-50 dark:bg-zinc-900`
- **Layout** : 4 colonnes (2 mobile, 4 desktop)
- **Item** : Icone + label, centre
- **Contenu** : Agences verifiees, Reponse rapide, Paiement securise, Support disponible
- **Animation** : Fade-in au scroll (IntersectionObserver)

### Editorial Split
- **Layout** : 2 colonnes inegales (texte 45%, image 55%) ou inversees
- **Cote texte** :
  - Background : `zinc-900 dark:zinc-800` (contraste fort)
  - Eyebrow amber uppercase
  - H2 `text-2xl lg:text-3xl font-display font-bold text-white`
  - Paragraphe `text-zinc-300`
  - CTA : lien avec fleche, amber au hover
- **Cote image** : Photo full-bleed, `object-cover`
- **Animation** : Slide-in lateral au scroll

### Region Cards
- **Layout** : 3 colonnes (1 mobile, 3 desktop)
- **Card** : 220px hauteur, image de fond ou gradient
  - Overlay sombre + texte blanc
  - Nom region, nombre d'annonces
  - Hover : scale image + ombre elevee
- **Regions** : Sahara, Littoral, Montagne (ou wilayas populaires)

### Wilaya Scroller
- **Layout** : Scroll horizontal, snap-x
- **Card** : Photo wilaya + nom en overlay
  - Bordure arrondie `rounded-2xl`
  - Largeur fixe `w-36 lg:w-44`
- **Navigation** : Fleches gauche/droite sur desktop, swipe sur mobile
- **Donnees** : 8 wilayas populaires (Alger, Oran, Constantine, etc.)

### Featured Grid
- **Layout** : Grid asymetrique (1.6fr / 1fr)
  - Large card a gauche (occupe 2 rows)
  - 2 petites cards a droite
- **Card** : Photo plein, overlay gradient bas, prix + titre en blanc
- **Animation** : Scale au hover, ombre elevee

### Trending Section
- **Layout** : 2 colonnes (sidebar editoriale 1fr + grid 3 colonnes 2fr)
- **Sidebar** : Texte editorial (titre, description, CTA)
- **Grid** : 6 listing cards compactes
- **Mobile** : Sidebar masquee, grid seule

### Rent Carousel
- **Layout** : Scroll horizontal avec overflow visible
- **Card** : Photo cover avec badge "Nouveau", titre, prix, localisation
- **Navigation** : Fleches + dots indicators
- **Auto-play** : Non (respect `prefers-reduced-motion`)

### Full Bleed Photo
- **Hauteur** : `60vh`
- **Image** : Photo immobiliere plein ecran
- **Overlay** : Gradient bottom (noir → transparent)
- **Contenu** : H2 + CTA en bottom-start
- **Parallax** : Subtil `translate-y` lie au scroll (si motion OK)

### Stats Strip
- **Background** : `zinc-950 dark:zinc-900`
- **Layout** : 4 colonnes centrees
- **Chiffre** : `text-4xl lg:text-5xl font-display font-bold text-amber-400`
- **Label** : `text-sm text-zinc-400`
- **Animation** : Compteur anime (0 → valeur) au scroll via IntersectionObserver
- **Donnees** : Annonces, Agences, Utilisateurs, Wilayas

### CTA Pro
- **Layout** : Centre, padding genereux (`py-20 lg:py-28`)
- **Titre** : H2 avec mot-cle en amber
- **CTA** : Bouton accent, hover `-translate-y-1`
- **Background** : Surface standard

---

## Landing Pages

### `/pro` — Landing AqarPro
- Hero avec screenshot dashboard + headline
- 3-4 feature blocks (split editorial alternant gauche/droite)
- Section social proof (logos agences, temoignages)
- Pricing teaser (3 plans, CTA vers `/pricing`)
- CTA final : "Commencer gratuitement"

### `/vendre` — Landing vendeur
- Hero empathique ("Vendez votre bien au meilleur prix")
- 3 etapes illustrees (deposer, recevoir contacts, vendre)
- Avantages (gratuit, rapide, securise)
- CTA : "Deposer mon annonce"

### `/estimer` — Landing estimateur
- Hero avec illustration estimateur
- Formulaire rapide (wilaya, type, surface)
- Resultat avec fourchette + graphique
- CTA : "Deposer une annonce a ce prix"

### `/pricing` — Page tarifs
- Header section avec toggle Mensuel/Annuel
- 3 colonnes plans (Starter, Pro, Enterprise)
- Plan recommande avec bordure amber et badge "Populaire"
- Feature comparison table en dessous
- FAQ accordeon en bas

---

## Vitrines Agences (`/a/[slug]`)

Chaque agence a sa vitrine avec un des 10 themes :

| Theme | Ambiance |
|-------|----------|
| LuxeNoir | Luxe sombre, or et noir |
| Mediterranee | Bleu mer, blanc, lumineux |
| NeoBrutalist | Brutaliste moderne, bold |
| MéditerranéenContemporain | Zellige, teal/terracotta, mosaïque |
| PastelDoux | Pastel, feminin, doux |
| CorporateNavy | Corporate, bleu marine, serieux |
| Editorial | Magazine, typographie forte |
| ArtDeco | Art deco, geometrique, dore |
| OrganiqueEco | Nature, vert, organique |
| SwissMinimal | Grille suisse, minimal, noir/blanc |

Chaque theme = composant React complet avec hero, about, listings grid, stats, CTA.
Architecture CSS variables pour la personnalisation.

---

## Motion Guidelines

### Entrees
- `fade-in` : elements texte, badges
- `slide-up` : cards, sections
- `scale-in` : modales, popovers
- Stagger : 100-200ms entre elements d'un groupe

### Hover
- Cards : `-translate-y-0.5` + `shadow-card-hover`
- Images : `scale-105` avec `duration-700`
- Liens : couleur amber avec `duration-normal`
- Boutons : `-translate-y-1` avec `duration-fast`

### Scroll-triggered
- IntersectionObserver avec `threshold: 0.2`
- Animation une seule fois (pas de re-trigger)
- Respecter `prefers-reduced-motion`

### Transitions de page
- Fade entre routes (via Next.js App Router transitions)
- Skeleton loading sur les pages dynamiques
