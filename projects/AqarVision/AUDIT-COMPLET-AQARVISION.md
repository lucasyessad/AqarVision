# AqarVision — Audit complet & Plan d’action

> Basé sur une revue de code fichier par fichier des 377 fichiers source du projet.
> Date : 16 mars 2026

-----

## 0. Résumé exécutif

Le projet AqarVision possède une architecture solide (Server Actions + auth guards RBAC + RLS Supabase + rate limiting + sanitization) mais souffre de trois problèmes structurants qui freinent sa progression : un volume significatif de code mort et de duplication architecturale, une dette design massive non traitée (615+ violations de tokens), et un écart fonctionnel important entre l’état actuel du dashboard AqarPro et le standard attendu d’un SaaS productivité (pas de TopBar, pas de ⌘K, pas de sidebar collapsible, pas de side panel). Ce document quantifie chaque problème et fournit un plan d’action exécutable phase par phase.

-----

## 1. Code mort et poids superflu

### 1.1 Fichiers à 0 imports (vérifiés par grep exhaustif)

Ces fichiers ne sont importés nulle part dans les 377 fichiers source du projet. Ils peuvent être supprimés sans aucun impact.

|Fichier                                                |Taille                                             |Raison                                                           |
|-------------------------------------------------------|---------------------------------------------------|-----------------------------------------------------------------|
|`src/hooks/useScrollReveal.ts`                         |hook                                               |Jamais importé                                                   |
|`src/features/auth/hooks/use-auth.ts`                  |hook                                               |Jamais importé                                                   |
|`src/features/auth/services/auth.service.ts`           |service (getCurrentUser, getProfile, updateProfile)|Jamais importé — toute l’auth passe par les actions et les guards|
|`src/features/agencies/hooks/use-current-agency.ts`    |hook                                               |Jamais importé                                                   |
|`src/features/messaging/hooks/use-realtime-messages.ts`|hook                                               |Jamais importé                                                   |

### 1.2 Chaîne DeposerWizard v1 (remplacée par v2)

L’ancien wizard de dépôt d’annonce individuel a été remplacé par `DeposerWizardV2.tsx` mais n’a pas été nettoyé. Seul V2 est importé par `/deposer/page.tsx`.

|Fichier                                                        |Taille       |Statut                                              |
|---------------------------------------------------------------|-------------|----------------------------------------------------|
|`features/listings/components/DeposerWizard.tsx`               |28 970 octets|MORT — remplacé par V2                              |
|`features/listings/actions/create-individual-listing.action.ts`|~4 Ko        |Importé uniquement par le wizard mort               |
|`features/listings/schemas/individual-listing.schema.ts`       |~3 Ko        |Importé par l’action morte + un test à mettre à jour|

Le test `__tests__/unit/features/listings/listing-schemas.test.ts` importe encore l’ancien schema et doit être migré vers `individual-listing-v2.schema.ts`.

### 1.3 Packages monorepo vides

Six des sept packages du monorepo ont exactement 0 imports dans l’application web. Ce sont des dossiers scaffoldés mais jamais implémentés.

|Package                 |Imports dans apps/web      |Verdict  |
|------------------------|---------------------------|---------|
|`packages/config`       |2 (middleware.ts + 1 autre)|GARDER   |
|`packages/domain`       |0                          |SUPPRIMER|
|`packages/database`     |0                          |SUPPRIMER|
|`packages/ui`           |0                          |SUPPRIMER|
|`packages/security`     |0                          |SUPPRIMER|
|`packages/analytics`    |0                          |SUPPRIMER|
|`packages/feature-flags`|0                          |SUPPRIMER|

**Impact collatéral :** `next.config.ts` liste `@aqarvision/domain` et `@aqarvision/security` dans `transpilePackages`, et `package.json` les liste dans les dépendances. Ces références doivent être nettoyées en même temps.

### 1.4 Fichiers racine obsolètes

Trois fichiers volumineux à la racine du monorepo ne sont référencés par aucun code et doublonnent avec des ressources plus récentes (le skill UX/UI et le CLAUDE.md).

|Fichier                           |Taille               |Contenu                                                |
|----------------------------------|---------------------|-------------------------------------------------------|
|`aqarsearch-refonte.jsx`          |76 Ko (995 lignes)   |Ancien prototype JSX monofichier                       |
|`aqarvision-zinc-design-system.md`|143 Ko (2 981 lignes)|Doublonne le skill `/mnt/skills/user/aqarvision-ux-ui/`|
|`AqarVision-claude-code-v4.txt`   |129 Ko (3 439 lignes)|Ancien document de planification                       |

### 1.5 Incohérence documentation (CLAUDE.md vs réalité)

|Ce que dit CLAUDE.md                         |Réalité dans le code                                                           |
|---------------------------------------------|-------------------------------------------------------------------------------|
|Route `/l/[slug]/` pour le détail annonce    |La route réelle est `/annonce/[slug]`                                          |
|Route `/api/webhooks/stripe/`                |N’existe pas — le webhook est dans `supabase/functions/stripe-webhook`         |
|Tech stack inclut `shadcn/ui`                |0 imports de shadcn/ui dans tout le projet — l’UI est du Tailwind brut + Lucide|
|7 packages monorepo actifs                   |6 sont vides, seul `config` est utilisé                                        |
|Middleware mentionne `/l/` comme route legacy|Correct mais non documenté comme deprecated                                    |

-----

## 2. Duplication architecturale

### 2.1 Double système d’authentification agence

Deux fichiers coexistent pour résoudre le contexte agence de l’utilisateur courant :

**Fichier A — `lib/actions/auth.ts`** fournit `getAgencyForCurrentUser()` et `getAnyAgencyForCurrentUser()`. Utilisé par 6 fichiers (3 actions agency-settings + 3 pages dashboard). Pattern : résoudre manuellement le contexte puis passer l’agencyId aux fonctions suivantes.

**Fichier B — `lib/auth/with-agency-auth.ts`** fournit `withAgencyAuth(agencyId, resource, permission, handler)`. C’est le pattern documenté dans CLAUDE.md avec la matrice RBAC complète (5 rôles × 8 ressources × 4 permissions). Utilisé par toutes les autres actions du projet.

Ces deux fichiers font essentiellement la même chose (vérifier session + chercher membership + résoudre le rôle) mais avec des APIs incompatibles. Le résultat : un développeur ne sait pas lequel utiliser, et la moitié des actions contournent le système RBAC.

**Action requise :** Supprimer `lib/actions/auth.ts`, créer un helper léger `lib/auth/get-agency-context.ts` pour les Server Components en lecture seule, et migrer les 6 fichiers impactés.

-----

## 3. Dette design (quantifiée)

### 3.1 Violations de tokens

|Violation                                             |Nombre |Objectif|
|------------------------------------------------------|-------|--------|
|Hex hardcodés `#XXXXXX` dans les .tsx                 |183    |0       |
|Inline styles `style={{` dans les .tsx                |406    |0       |
|Patterns `bg-[#...]` arbitraires                      |26     |0       |
|Lignes avec couleur light-mode sans équivalent `dark:`|331    |0       |
|**Total violations**                                  |**946**|**0**   |

### 3.2 Backward compat colors dans tailwind.config.ts

Le fichier `tailwind.config.ts` contient un bloc de 45 lignes d’alias obsolètes qui mappent les anciens noms de couleurs (onyx, ivoire, or, charcoal, warm, coral, aqar, text-dark, text-body, text-muted, text-faint) vers les tokens Zinc/Amber. Ces alias ne devraient plus exister — ils entretiennent la possibilité d’utiliser les anciens noms et empêchent un grep propre des violations.

### 3.3 Textes hardcodés en français (violation i18n)

Le projet utilise `next-intl` avec 4 locales (fr/ar/en/es), mais de nombreux textes UI sont hardcodés en français au lieu de passer par les fichiers de traduction.

**DashboardSidebar.tsx** — 8 chaînes en dur : “Paramètres”, “Apparence”, “Branding”, “Vérification”, “Retour au portail”, “Voir ma vitrine”, “Se déconnecter” (title), “Paramètres” (section label).

**Dashboard layout.tsx** — 2 chaînes : “Terminez la configuration de votre agence”, “Commencer →”.

**ProLoginForm.tsx** — 3 chaînes : “Accéder à AqarPro”, “Pas encore d’agence ?”, “Créer un compte agence”.

**Homepage page.tsx** — Noms de wilayas et compteurs hardcodés dans un tableau constant au lieu de venir de la base de données.

-----

## 4. Problèmes techniques confirmés

### 4.1 Mismatch Sentry (critique en production)

`package.json` déclare `@sentry/core` en v10.43 et `@sentry/nextjs` en v8.0. Ce sont des versions majeures incompatibles. Le `next.config.ts` contient un workaround explicite avec try/catch + require conditionnel qui avale silencieusement l’erreur. En production, si le DSN est configuré mais que les versions ne s’alignent pas, Sentry peut être partiellement ou totalement désactivé sans alerte.

**Action requise :** Aligner sur `@sentry/nextjs` v8.x avec `@sentry/core` v8.x (ou migrer tout vers v10), supprimer le try/catch et le require conditionnel.

### 4.2 CSP permissive (`unsafe-inline` + `unsafe-eval`)

Le middleware applique une Content Security Policy avec `unsafe-inline` et `unsafe-eval` sur les scripts. C’est acceptable en développement mais constitue un risque XSS élevé en production. La CSP autorise aussi `unsafe-inline` pour les styles, ce qui est moins critique mais devrait être durci avec des nonces.

**Action requise :** Implémenter une CSP par environnement (dev permissive, prod avec nonces). Commencer par un mode `report-only` en production avant enforcement.

### 4.3 Types `any` dans SearchMap

Le composant `SearchMap.tsx` déclare 3 alias de type `any` explicites (lignes 12-16) avec un commentaire eslint-disable. Les types `Map`, `Marker` et `Popup` de `maplibre-gl` sont disponibles et devraient être utilisés directement.

### 4.4 Images placeholder en production config

`next.config.ts` autorise `picsum.photos`, `fastly.picsum.photos` et `images.unsplash.com` dans `remotePatterns`. Les deux premiers sont des services de placeholder qui ne devraient pas être en production. Unsplash peut rester si des photos stock sont utilisées, mais les picsum doivent être retirés.

### 4.5 Pas de `.env.example`

Le projet n’a pas de `.env.example` malgré le fait que le middleware et de nombreux services dépendent de variables d’environnement (Supabase URL/key, Stripe keys, Sentry DSN, MapTiler key, Anthropic API key). Cela rend l’onboarding d’un nouveau développeur opaque.

### 4.6 Référence à une route API inexistante dans le middleware

Le middleware déclare `/api/webhooks/stripe` et `/api/whatsapp/webhook` dans `CSRF_EXEMPT_PREFIXES`, mais aucune route API n’existe dans `src/app/api/`. Les webhooks Stripe passent par les Edge Functions Supabase. Ces exemptions CSRF sont du code mort dans le middleware.

-----

## 5. Écarts fonctionnels (UX/UI produit)

### 5.1 Dashboard AqarPro — composants manquants

Le dashboard actuel est fonctionnel mais incomplet par rapport au standard d’un SaaS de productivité (Stripe, Linear, HubSpot). L’analyse compare l’existant avec les spécifications du design system Zinc (`references/aqarpro-ux.md`).

|Composant                                                    |Spécifié dans le design system           |État actuel                       |
|-------------------------------------------------------------|-----------------------------------------|----------------------------------|
|TopBar (h-14, ⌘K, notifications, theme toggle, user dropdown)|Oui — détaillé dans aqarpro-ux.md        |**Absent**                        |
|Sidebar collapsible (240px → 64px, shortcut `[`)             |Oui                                      |**Non implémenté** — fixe à 240px |
|Sidebar badges compteurs (leads non lus, messages)           |Oui                                      |**Absent**                        |
|Sidebar responsive mobile (drawer)                           |Oui                                      |**Absent**                        |
|Command Palette ⌘K                                           |Oui — mentionné dans component-library.md|**Absent**                        |
|Dashboard Overview : Activity Feed                           |Oui — 5 derniers événements              |**Absent** — seulement 4 StatCards|
|Dashboard Overview : Quick Actions                           |Oui — 4 boutons ghost                    |**Absent**                        |
|Dashboard Overview : Bar chart vues/jour                     |Oui                                      |**Absent**                        |
|Dashboard Overview : Date range selector                     |Oui                                      |**Absent**                        |
|Listings : Side Panel (Drawer)                               |Oui — au clic sur une ligne              |**Absent**                        |
|Listings : Bulk actions bar                                  |Oui — sticky bottom                      |**Absent**                        |
|Dark mode complet                                            |Oui — 331 lignes sans `dark:`            |**Partiel**                       |

### 5.2 Homepage — design obsolète

La homepage utilise encore l’ancien thème “Onyx + Gold” (hero photo plein écran avec overlay noir, accent doré, typographie lourde) au lieu du design system Zinc. C’est la page la plus visible du produit et elle ne reflète pas l’identité visuelle cible.

### 5.3 Couverture de tests

|Catégorie               |Fichiers                                                                       |Verdict                                      |
|------------------------|-------------------------------------------------------------------------------|---------------------------------------------|
|Tests unitaires (Vitest)|3 fichiers dans `src/__tests__/unit/`                                          |Très insuffisant pour 377 fichiers source    |
|Tests E2E (Playwright)  |8 specs (homepage, auth, search, listing, deposer, agences, annonce, subdomain)|Couverture correcte des parcours critiques   |
|Tests pgTAP (SQL)       |0                                                                              |Non implémentés malgré mention dans CLAUDE.md|

-----

## 6. Plan d’action hiérarchisé

### Phase 0 — Nettoyage (1-2 jours)

**Objectif :** Retirer tout le code mort pour partir sur une base propre. Aucune fonctionnalité nouvelle, seulement de la suppression.

**0.1** Supprimer les 5 fichiers à 0 imports (section 1.1).

**0.2** Supprimer la chaîne DeposerWizard v1 (3 fichiers, section 1.2). Mettre à jour le test et l’index.ts.

**0.3** Supprimer les 6 packages monorepo vides. Mettre à jour `pnpm-workspace.yaml`, `package.json` de apps/web (retirer `@aqarvision/domain` et `@aqarvision/security`), et `next.config.ts` (retirer ces deux packages de `transpilePackages`).

**0.4** Supprimer les 3 fichiers racine obsolètes (section 1.4).

**0.5** Supprimer `lib/actions/auth.ts`. Créer `lib/auth/get-agency-context.ts` (helper léger pour les Server Components). Migrer les 6 fichiers importateurs vers `withAgencyAuth` ou le nouveau helper.

**0.6** Supprimer le bloc backward compat colors dans `tailwind.config.ts`.

**0.7** Retirer les exemptions CSRF pour les routes API inexistantes dans le middleware. Retirer `picsum.photos` et `fastly.picsum.photos` de `remotePatterns`.

**0.8** Créer un `.env.example` documentant toutes les variables requises.

**Validation :** `pnpm typecheck && pnpm build && pnpm test` doivent passer.

### Phase 1 — Stabilisation technique (1 semaine)

**1.1** Aligner les versions Sentry (`@sentry/nextjs` + `@sentry/core` sur la même majeure). Supprimer le try/catch dans next.config.ts.

**1.2** Remplacer les 3 types `any` de SearchMap par les types MapLibre natifs.

**1.3** Externaliser les textes hardcodés français dans `next-intl` (DashboardSidebar : 8 chaînes, dashboard layout : 2, ProLoginForm : 3, wilayas homepage : passer par la DB ou les messages).

**1.4** Ajouter 10 tests unitaires critiques : auth guards (withAgencyAuth, withSuperAdminAuth), schemas Zod (listing, auth, billing), services (analytics, search, billing), rate-limit.

**1.5** Corriger le CLAUDE.md avec l’état réel du code (routes, tech stack, packages, patterns).

### Phase 2 — Éradication dette design (2-3 semaines)

**2.1** Éliminer les 183 hex hardcodés → classes Tailwind.

**2.2** Éliminer les 406 inline styles → classes Tailwind.

**2.3** Éliminer les 26 patterns `bg-[#...]`.

**2.4** Ajouter les variantes `dark:` aux 331 lignes manquantes.

Table de correspondance : `#FAFAFA`→`zinc-50`, `#F4F4F5`→`zinc-100`, `#E4E4E7`→`zinc-200`, `#D4D4D8`→`zinc-300`, `#A1A1AA`→`zinc-400`, `#71717A`→`zinc-500`, `#52525B`→`zinc-600`, `#3F3F46`→`zinc-700`, `#27272A`→`zinc-800`, `#18181B`→`zinc-900`, `#09090B`→`zinc-950`, `#F59E0B`→`amber-500`, `#FBBF24`→`amber-400`, `#D97706`→`amber-600`.

**Validation :** Les 4 compteurs grep doivent retourner 0.

### Phase 3 — Dashboard AqarPro complet (3-4 semaines)

**3.1** Créer `DashboardTopBar.tsx` (h-14, titre page, ⌘K search trigger, notifications, theme toggle, user dropdown).

**3.2** Refactorer `DashboardSidebar.tsx` (collapse 240→64px, shortcut `[`, groupes avec séparateurs, badges compteurs, responsive mobile drawer).

**3.3** Créer `CommandPalette.tsx` (⌘K/Ctrl+K, modal centrée, recherche fuzzy, navigation clavier).

**3.4** Enrichir la page Overview (activity feed, quick actions, bar chart CSS vues/jour, date range selector).

**3.5** Créer `Drawer.tsx` (composant réutilisable) + `ListingDrawer.tsx` (détails annonce au clic dans la table).

### Phase 4 — Refonte homepage + surfaces publiques (2-3 semaines)

Basculer la homepage du paradigme dark-hero-overlay vers un design lumineux, tech, centré sur la recherche, avec les photos dans les cards et la mosaïque, pas en background. Identité visuelle tricolore algérienne (or saharien, bleu méditerranéen, vert montagne). Animations GSAP au scroll. S’applique à la homepage, /search, /annonce/[slug], /pro, /vendre, /estimer, /pricing.

### Phase 5 — Sécurité et qualité (continu)

**5.1** CSP durcie par environnement (nonces en prod, report-only puis enforcement).

**5.2** CI pipeline : bloquer sur `no-explicit-any`, couverture minimale 40%, audit a11y axe-core sur homepage/search/listing.

**5.3** Ajouter tests E2E pour AqarPro dashboard (auth flow pro, création listing, gestion leads).

### Phase 6 — Backend Python IA (2-3 semaines)

Créer le microservice FastAPI dans `services/ai-backend/`. Implémenter les 3 endpoints (generate-description, translate, enrich). Modifier `features/ai/services/ai.service.ts` pour appeler le backend Python via fetch() au lieu de `@anthropic-ai/sdk`. Supprimer la dépendance npm `@anthropic-ai/sdk`.

-----

## 7. Métriques de suivi

|KPI                           |Valeur actuelle         |Cible Phase 0|Cible Phase 2|Cible finale|
|------------------------------|------------------------|-------------|-------------|------------|
|Fichiers code mort            |11 fichiers + 6 packages|0            |0            |0           |
|Hex hardcodés .tsx            |183                     |183          |0            |0           |
|Inline styles .tsx            |406                     |406          |0            |0           |
|bg-[#…] .tsx                  |26                      |26           |0            |0           |
|Lignes sans dark:             |331                     |331          |0            |0           |
|Tests unitaires               |3                       |3            |13+          |40+         |
|Textes FR hardcodés           |13+ chaînes             |13+          |0            |0           |
|Types any explicites          |3+                      |3+           |0            |0           |
|Composants dashboard manquants|11                      |11           |11           |0           |

-----

## Annexe A — Commandes de validation

```bash
# Vérifications post-nettoyage
pnpm typecheck
pnpm build
pnpm test

# Audit dette design
grep -rn '#[0-9a-fA-F]\{6\}' apps/web/src --include="*.tsx" | grep -v tailwind.config | wc -l
grep -rn 'style={{' apps/web/src --include="*.tsx" | wc -l
grep -rn "bg-\[#" apps/web/src --include="*.tsx" | wc -l
grep -rn "bg-white\|bg-zinc-50\|text-zinc-900\|border-zinc-200" apps/web/src --include="*.tsx" | grep -v "dark:" | wc -l

# Code mort
grep -rn "useScrollReveal\|use-auth\|use-current-agency\|use-realtime-messages" apps/web/src --include="*.tsx" --include="*.ts" | grep -v "hooks/" | wc -l

# Textes hardcodés
grep -rn "Paramètres\|Apparence\|Retour au portail\|Voir ma vitrine\|Accéder à AqarPro\|Terminez la config\|Commencer →" apps/web/src --include="*.tsx" | wc -l
```

## Annexe B — Arborescence nettoyée cible (post Phase 0)

```
AqarVision/
├── apps/web/                    # Next.js 15 App Router (377 → ~365 fichiers)
├── packages/config/             # Seul package actif
├── supabase/                    # Migrations, Edge Functions, seed
├── theme/                       # 10 templates vitrines agences
├── CLAUDE.md                    # Mis à jour — source de vérité
├── package.json
├── pnpm-workspace.yaml          # Mis à jour — référence seulement apps/* et packages/config
├── tsconfig.json
├── turbo.json
└── vercel.json
```