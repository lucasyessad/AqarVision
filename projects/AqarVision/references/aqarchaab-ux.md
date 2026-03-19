# AqarChaab UX — Espace Particulier

> Spec UX pour la surface AqarChaab : espace de gestion pour les proprietaires individuels.
> Inspiration : LeBonCoin (simplicite), Vinted (accessibilite), Notion (clarte).

> **MISE A JOUR MARS 2026 — Lire en priorite le CLAUDE.md (source de verite). Ce fichier est un complement.**
> Changements majeurs non refletes en detail ici :
> - Design system : **Stone** + **Teal** accent. Voir `design-tokens.md`.
> - **Auth unique** : plus de `/AqarChaab/auth/login|signup`. Un seul flux `/auth/login|signup`.
> - **BottomNav** : 4 items avec CTA central (Annonces | **Deposer** [amber surreleve] | Messages | Profil). Alertes/Collections dans Profil ou "Plus".
> - **Wizard listing** : **4 etapes** pour les particuliers (pas 7). (1) Quoi & Ou, (2) Details & Description + bouton generer auto, (3) Photos, (4) Prix & Recap.
> - **`/deposer`** : auth differee (etape 3). L'utilisateur commence sans compte, auth demandee quand il est engage.
> - **`/espace/collections`** renomme **`/espace/favoris`** (merge favorites + collections).
> - **`/espace/notifications`** ajoute (centre de notifications).
> - Photos uniquement sur les annonces (pas de video). Video = vitrines agences seulement.
> - Plans : Gratuit 3 photos/2 ann, chaab_plus 10 photos/4 ann, chaab_pro 15 photos/6 ann.

---

## Principes UX

1. **Simplicite absolue** — Pas de jargon, pas de complexite. Un particulier doit tout comprendre en 30 secondes.
2. **Guidage** — Chaque ecran explique quoi faire. Etats vides avec CTAs clairs.
3. **Confiance** — Transparence sur les couts, les delais, les etapes.
4. **Differenciation visuelle** — AqarChaab est visuellement distinct d'AqarPro : plus clair, plus aerien, plus chaleureux.
5. **Mobile-optimized** — La majorite des particuliers utilisent leur smartphone.

---

## Layout

### Differenciation avec AqarPro
- **AqarPro** : Sidebar sombre (`zinc-100 dark:zinc-800`), dense, icones pro
- **AqarChaab** : Sidebar plus claire, espacement genereux, icones amicales

### Desktop
```
+--sidebar--+--content-area----------------------------+
|  Logo      |  TopBar (titre page, notifications)     |
|  Nav items |  +-content-----------------------------+ |
|  Upgrade   |  | Page content (max-w-4xl centered)   | |
|  User      |  +------------------------------------+ |
+------------+------------------------------------------+
```

### Mobile
```
+--top-bar------------------------------------------+
| Logo | Titre page | Avatar | Notifications        |
+---------------------------------------------------+
| Content area (full width, p-4)                    |
+---------------------------------------------------+
| Bottom Nav: Annonces | Messages | Alertes | Plus  |
+---------------------------------------------------+
```

Le menu "Plus" ouvre un drawer avec : collections, historique, profil, upgrade.

---

## Pages

### Mes Annonces (`/espace/mes-annonces`)
**Objectif** : Voir et gerer ses annonces deposees.

**Etat vide** :
- Illustration centree
- "Vous n'avez pas encore d'annonce"
- CTA accent : "Deposer ma premiere annonce"

**Avec annonces** :
- Grid `grid-cols-1 sm:grid-cols-2` de cards
- Card : photo cover, titre, prix, statut (badge colore), date publication
- Actions quick : modifier, pause/reprendre, supprimer
- Indicateurs : nombre de vues, nombre de contacts recus
- CTA flottant : "Deposer une annonce"

### Deposer (`/deposer`)
**Objectif** : Creer une annonce en 7 etapes simples.

**Wizard DeposerV2** :
1. **Type** — Vente, Location, Vacances
2. **Categorie** — Appartement, Villa, Terrain, etc.
3. **Localisation** — Wilaya → Commune (autocomplete)
4. **Details** — Surface, pieces, etage, features (checkboxes visuelles)
5. **Description** — Titre + description (avec aide a la redaction)
6. **Photos** — Upload drag & drop, reorder, photo couverture
7. **Prix** — Prix + modalites + recapitulatif

**UX** :
- Progress bar en haut (etape X/7)
- Navigation : precedent/suivant
- Sauvegarde automatique (brouillon)
- Validation inline a chaque etape
- Recapitulatif final avant publication

### Messagerie (`/espace/messagerie`)
**Objectif** : Communiquer avec les interesses.

**Layout Split** (desktop) :
- Liste conversations a gauche (photo bien, nom interlocuteur, dernier message, date)
- Thread a droite (bulles message, input en bas)
- Badge non-lu sur les conversations

**Mobile** :
- Liste conversations full-width
- Click → thread full-width avec back button

### Alertes (`/espace/alertes`)
**Objectif** : Etre notifie des nouveaux biens correspondant a ses criteres.

- Liste d'alertes avec criteres resumes (type, wilaya, budget)
- Toggle actif/inactif
- Frequence : instantane, quotidien, hebdomadaire
- CTA : "Creer une alerte" → formulaire simple

### Collections (`/espace/collections`)
**Objectif** : Organiser ses favoris en collections thematiques.

- Grid de collections (nom, nombre de biens, cover photo)
- Click → liste des biens dans la collection
- Actions : renommer, supprimer, partager
- CTA : "Nouvelle collection"

### Historique (`/espace/historique`)
**Objectif** : Retrouver les biens consultes recemment.

- Liste chronologique des biens vus
- Card compacte : photo, titre, prix, date de visite
- Action : "Re-rechercher" (ouvre la recherche avec les memes criteres)

### Profil (`/espace/profil`)
**Objectif** : Gerer ses informations personnelles.

- Formulaire : nom, email, telephone, wilaya, photo
- Changement mot de passe
- Preferences de notification
- Suppression de compte

### Upgrade (`/espace/upgrade`)
**Objectif** : Passer a un plan payant pour plus de fonctionnalites.

**Presentation** :
- 2 sections : Packs ponctuels + Abonnements mensuels
- Cards prix avec features listees
- Plan recommande mis en avant (accent amber)

**Packs ponctuels** :
| Pack | Annonces | Prix |
|------|----------|------|
| pack_3 | 3 annonces | — |
| pack_7 | 7 annonces | — |
| pack_15 | 15 annonces | — |

**Abonnements** :
| Plan | Features | Prix/mois |
|------|----------|-----------|
| chaab_plus | X annonces, priorite recherche | — |
| chaab_pro | Illimite, analytics, badge pro | — |

**Methodes de paiement** :
- Stripe (carte internationale)
- CIB (carte bancaire algerienne)
- Dahabia (carte postale)
- BaridiMob (paiement mobile)
- Virement bancaire

---

## Patterns d'interaction

### Etats vides
Chaque page sans contenu affiche :
- Icone/illustration centree
- Titre explicatif
- Description courte
- CTA principal (bouton accent)

### Notifications
- Badge rouge sur l'icone cloche (nombre non-lus)
- Dropdown : liste des notifications recentes
- Types : nouveau message, nouvelle vue sur annonce, alerte matching

### Feedback
- Toast de confirmation apres chaque action (publish, save, delete)
- Animation de succes (checkmark) apres depot d'annonce
- Skeleton loading sur chaque page

### Responsive
- **Mobile** : Bottom nav 4 items + drawer "Plus"
- **Tablette** : Sidebar reduite + contenu
- **Desktop** : Sidebar complete + contenu centre (max-w-4xl)
