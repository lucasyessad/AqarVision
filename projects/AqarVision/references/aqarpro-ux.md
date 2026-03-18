# AqarPro UX — Dashboard CRM Agence

> Spec UX pour la surface AqarPro : dashboard de gestion d'agence immobiliere.
> Inspiration : Linear (densite), Stripe (precision), Notion (clarte).

> **MISE A JOUR MARS 2026 — Lire en priorite le CLAUDE.md (source de verite). Ce fichier est un complement.**
> Changements majeurs non refletes en detail ici :
> - Design system : **Stone** (pas Zinc) + **Teal** accent (pas Amber). Voir `design-tokens.md`.
> - **BottomNav mobile AqarPro** : 5 items (Dashboard | Annonces | Leads | Messages | Plus). Le Kanban leads devient liste filtrable avec tabs sur mobile.
> - **Auth unique** : plus de `/AqarPro/auth/login|signup`. Un seul flux `/auth/login|signup` avec routing intelligent post-login.
> - **Settings** : 4 tabs (General, Apparence + ThemeStudio + wizard vitrine, Verification, Notifications). Branding fusionne dans Apparence.
> - **Onboarding** : checklist progressive sur le dashboard (pas de wizard bloquant). Banner "Completez votre profil" + items liens.
> - **Plans** : Starter 2 900, Pro 6 900, Enterprise 12 900 DZD/mois. Pas de gratuite.
> - Proxy : `proxy.ts` remplace `middleware.ts` (Next.js 16).
> - **RBAC** : seul le owner peut inviter (pas l'admin).

---

## Principes UX

1. **Densite informationnelle** — Maximiser les donnees visibles sans surcharger. Chaque pixel compte.
2. **Actions rapides** — Raccourcis clavier, commande palette (Cmd+K), actions bulk.
3. **Hierarchie claire** — L'information la plus importante est toujours visible en premier.
4. **Feedback immediat** — Toute action produit un retour visuel instantane (toast, animation, changement d'etat).
5. **Zero configuration** — L'onboarding guide, les defaults sont intelligents.

---

## Layout

### Shell
```
+--sidebar--+--content-area--------------------------------+
|  Logo/Pro  |  TopBar (breadcrumbs, search, notifications) |
|  Nav items |  +-content---------------------------------+ |
|  Settings  |  | Page content                            | |
|  Storefront|  |                                         | |
|  User      |  +-----------------------------------------+ |
+------------+----------------------------------------------+
```

- **Sidebar** : 240px deployee, 64px collapsed. Toggle via `[` key.
- **TopBar** : Sticky, breadcrumbs, nom agence, actions rapides, notifications.
- **Content** : Scroll independant, padding `p-6 lg:p-8`.

### Responsive
- **Desktop** (lg+) : Sidebar visible, contenu a cote
- **Tablette** (md) : Sidebar en drawer overlay
- **Mobile** (sm) : Bottom nav simplifiee + drawer sidebar

---

## Pages

### Overview (Dashboard home)
**Objectif** : Vue d'ensemble rapide de l'activite agence.

**Layout** :
1. **KPI Strip** — 4 cards horizontales : annonces actives, leads cette semaine, visites planifiees, revenus mois
2. **Graphiques** — 2 colonnes : evolution annonces (line chart), sources leads (donut chart)
3. **Activite recente** — Feed chronologique : nouveaux leads, visites, annonces publiees
4. **Actions rapides** — Grille 2x2 : nouvelle annonce, inviter membre, voir vitrine, voir analytics

### Listings (Gestion annonces)
**Objectif** : CRUD complet des annonces avec vue efficace.

**Composants** :
- **Table** : Colonnes triables (titre, statut, type, prix, vues, date). Checkbox pour selection bulk.
- **BulkActionsBar** : Apparait quand selection > 0. Actions : publier, pauser, archiver, supprimer.
- **Filtres** : Tabs status (all, draft, published, paused) + search texte.
- **ListingDrawer** : Panel lateral droit, preview annonce sans quitter la liste.
- **CTA** : Bouton "Nouvelle annonce" → wizard `/AqarPro/dashboard/listings/new`.

### Listing Detail (`/listings/[id]`)
**Objectif** : Edition complete d'une annonce.

**Layout** : Formulaire multi-section (pas de wizard, affichage lineaire) :
1. Informations generales (type, categorie, wilaya, commune)
2. Details (surface, pieces, etage, parking, ascenseur, meuble, annee)
3. Description multilingue (FR, AR, EN, ES)
4. Photos (drag & drop, reorder, cover photo selection)
5. Documents legaux (acte, livret foncier, promesse, CC)
6. Prix et modalites
7. Actions : sauvegarder brouillon, soumettre pour review, publier

### Leads (Pipeline prospects)
**Objectif** : Suivre et qualifier les prospects.

**Vue Kanban** : 4 colonnes (new, contacted, qualified, closed).
- Drag & drop entre colonnes
- Card lead : nom, source (platform/whatsapp/phone), annonce liee, heat score
- Click → drawer detail avec timeline, notes, actions

### Visit Requests (Demandes de visite)
**Objectif** : Gerer les rendez-vous terrain.

**Layout** : Liste + calendrier (toggle vue).
- Card visite : visiteur, annonce, date/heure proposee, statut (pending, confirmed, completed, cancelled)
- Actions : confirmer, reporter, annuler

### Analytics
**Objectif** : Comprendre la performance.

**Sections** :
1. Resume (KPIs principaux, periode configurable)
2. Annonces : vues, favoris, contacts par annonce (table + chart)
3. Leads : sources, conversion, temps de reponse
4. Revenus : historique paiements, plan actuel

### Team (Equipe)
**Objectif** : Gerer les membres et permissions.

**Table** : Membres avec role, date ajout, derniere activite.
- Actions : modifier role, revoquer acces
- CTA : "Inviter un membre" → formulaire email + role

### Billing (Facturation)
**Objectif** : Gerer l'abonnement Stripe.

**Sections** :
1. Plan actuel (nom, features, max_listings, prix)
2. Utilisation (listings utilises / max)
3. Historique paiements
4. CTA : "Changer de plan" → Stripe Customer Portal

### Settings
- **General** : Nom agence, description, contact, adresse
- **Appearance** : ThemeStudio (selection + personnalisation theme vitrine)
- **Branding** : Logo, couleurs personnalisees, favicon
- **Verification** : Statut verification, upload documents, niveaux (1-4)

---

## Patterns d'interaction

### Navigation sidebar
- Items avec icone + label
- Active : bordure amber gauche (RTL: droite) + fond `amber-500/10` + texte amber
- Hover : fond `zinc-100 dark:zinc-800`
- Collapsed : icones seules, tooltip au hover
- Section settings avec label uppercase "Parametres"

### Tables
- Headers sticky, triables
- Rows avec hover highlight
- Checkbox colonne gauche pour selection bulk
- Pagination ou infinite scroll selon le volume

### Drawers
- Slide-in depuis la droite (RTL: gauche)
- Overlay sur le contenu principal
- Fermeture : click overlay, Escape, bouton X
- Largeur : `max-w-lg` (32rem)

### Formulaires
- Labels au-dessus des inputs
- Erreurs inline sous chaque champ (rouge)
- Boutons d'action en bas (sticky si formulaire long)
- Auto-save pour les brouillons

### Toasts / Notifications
- Position : bottom-right (RTL: bottom-left)
- Variantes : success (vert), error (rouge), info (bleu), warning (amber)
- Auto-dismiss apres 5s, dismissable manuellement

---

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `[` | Toggle sidebar |
| `Cmd+K` | Ouvrir Command Palette |
| `n` | Nouvelle annonce (quand pas dans un input) |
| `Escape` | Fermer drawer/modal |
