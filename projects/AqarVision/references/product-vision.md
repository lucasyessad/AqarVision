# Product Vision — AqarVision

> Document de reference pour les decisions fonctionnelles majeures.

---

## Mission

Devenir la plateforme immobiliere de reference en Algerie en offrant une experience digitale premium qui modernise le marche immobilier algerien — pour les agences (AqarPro), les particuliers (AqarChaab), et les acheteurs/locataires (AqarSearch).

---

## Surfaces et positionnement

### AqarSearch — Marketplace publique
**Pour** : Acheteurs, locataires, curieux du marche.
**Proposition de valeur** : Recherche immobiliere intuitive avec carte interactive, filtres avances (58 wilayas, 1541 communes), estimation prix, comparaison, et alertes.
**Ambiance** : Photo-forward, editorial-magazine. Inspirer le desir de decouvrir des biens.
**References** : Zillow (immersion photos), Rightmove (recherche), LeBonCoin (simplicite).

### AqarPro — CRM Agence
**Pour** : Agences immobilieres algeriennes (owner, admin, agent, editor, viewer).
**Proposition de valeur** : CRM complet avec gestion annonces, leads, visites, equipe, analytics, facturation, et vitrine agence personnalisee.
**Ambiance** : Dense et efficace. Linear pour la densite, Stripe pour la precision.
**Monetisation** : 3 plans Stripe (Starter, Pro, Enterprise) avec max_listings et features gates via entitlements.

### AqarChaab — Espace Particulier
**Pour** : Proprietaires individuels souhaitant vendre/louer directement.
**Proposition de valeur** : Deposer une annonce simplement, gerer ses conversations, suivre ses favoris et alertes.
**Ambiance** : Accessible, claire, accueillante. Plus leger que le dashboard pro.
**Monetisation** : Packs ponctuels (3/7/15 annonces) + abonnements mensuels (chaab_plus, chaab_pro). Paiement via Stripe, CIB, Dahabia, BaridiMob, virement.

### Marketing — Pages publiques
**Pour** : Visiteurs, prospects.
**Proposition de valeur** : Decouvrir AqarVision, comprendre l'offre, s'inscrire.
**Ambiance** : Editorial immersif, cinematique. Hero bold, stats impressionnantes, CTAs clairs.

---

## Identite visuelle

### Philosophie
**"Tech premium meets real estate warmth."**

Inspirations croisees :
- **Linear** : Densite informationnelle, UI dense mais lisible
- **Stripe** : Precision typographique, hierarchie claire
- **Apple** : Fluidite des transitions, attention au detail
- **Zillow** : Photos immersives, cartes interactives
- **Identite algerienne** : Tricolore (sahara or, med bleu, atlas vert)

### Palette
- **Neutres** : Zinc (blue-undertone gray) — pas du gris pur
- **Accent** : Amber — chaleur, immobilier, or du Sahara
- **Tricolore** : sahara (#E8920A), med (#1A7FA8), atlas (#2A8A4A)

### Typographie
- **Geist** : Display + body, precision tech
- **IBM Plex Sans Arabic** : Texte arabe, qualite typographique
- **Geist Mono** : Donnees techniques, code

---

## Marche cible

### Geographie
- Algerie : 58 wilayas, 1541 communes
- PostGIS pour les coordonnees et la recherche spatiale
- Multilingue : FR (principal), AR (natif), EN, ES

### Segments
- **Agences immobilieres** : ~3000 agences en Algerie, transition vers le digital
- **Particuliers** : Proprietaires souhaitant vendre/louer sans intermediaire
- **Acheteurs/locataires** : Chercheurs actifs et passifs (alertes)

---

## Principes produit

1. **Mobile-first** — La majorite des utilisateurs algeriens sont sur mobile
2. **Photo-centric** — L'immobilier se vend par l'image
3. **Confiance** — Badges verification agence (4 niveaux), avis, transparence
4. **Performance** — SSR/ISR Next.js, pas de client-side data fetching inutile
5. **Accessibilite** — RTL natif, 4 langues, navigation clavier, contraste WCAG AA
6. **Simplicite** — Pas de features inutiles, chaque element a une raison d'etre

---

## Decisions architecturales cles

| Decision | Choix | Raison |
|----------|-------|--------|
| Pas d'API REST | Server Actions + Supabase RPC | Moins de surface d'attaque, colocalisation logique |
| Pas d'IA | Retiree | Complexite non justifiee a ce stade |
| RLS Supabase | Deny-by-default | Securite multi-tenant au niveau DB |
| Monorepo Turborepo | web + mobile + config | Partage de types et config |
| Stripe uniquement | Pour les agences | Provider de confiance international |
| Multi-paiement | Pour les particuliers | CIB, Dahabia, BaridiMob sont les standards algeriens |
| 10 themes vitrines | HTML/CSS genere | Differenciateur competitif pour les agences |

---

## KPIs produit cibles

| Metrique | Cible |
|----------|-------|
| Agences inscrites | 100 en 6 mois |
| Annonces publiees | 5 000 en 6 mois |
| Recherches/jour | 1 000 |
| Taux conversion visitor→signup | 5% |
| NPS agences | > 40 |
| Temps depot annonce | < 5 min |
| Lighthouse performance | > 85 |
