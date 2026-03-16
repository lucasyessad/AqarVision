# CLAUDE.md — AqarVision

> Dernière mise à jour : 16 mars 2026 — basée sur un audit complet du code source.
> Ce fichier est la **source de vérité** pour Claude Code. Lire intégralement avant toute modification.

---

## 1. Identité projet

**AqarVision** — Plateforme immobilière algérienne (proptech). 4 surfaces :

- **AqarSearch** — Marketplace publique (recherche, carte, SEO, alertes, favoris)
- **AqarPro** — CRM agence (annonces, leads, messaging, analytics, IA, facturation)
- **AqarChaab** — Espace particulier (déposer annonce, favoris, messagerie, profil)
- **Marketing** — Homepage, /pro, /vendre, /estimer, /pricing, vitrines agences

Multi-tenant (RLS Supabase par agence), multilingue (FR/AR/EN/ES avec RTL), ciblant l'Algérie (58 wilayas, 1 541 communes). Monétisation via Stripe (Starter/Pro/Enterprise).

---

## 2. Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 15 App Router + Server Actions |
| Langage | TypeScript strict (pas de `any`) |
| UI | Tailwind CSS + Lucide React (icônes) |
| Backend | Supabase (Auth SSR + Postgres + RLS + Storage + Edge Functions) |
| Base de données | PostgreSQL 15+ avec PostGIS |
| Paiements | Stripe (Checkout + Customer Portal + Webhooks via Edge Functions) |
| Cartes | MapLibre GL JS + tuiles OpenStreetMap |
| IA | Backend Python (FastAPI) — voir section 9 |
| Validation | Zod |
| i18n | next-intl |
| Monorepo | Turborepo + pnpm workspaces |
| Hébergement | Vercel (web) + Supabase Cloud (DB/Auth/Storage) |
| Tests | Vitest (unit) + Playwright (E2E) |
| Polices | Geist (latin) + IBM Plex Sans Arabic (arabe) via next/font |

**Note :** shadcn/ui n'est pas utilisé dans le projet. L'UI est construite en Tailwind CSS brut avec les tokens du design system "Zinc".

---

## 3. Commandes

Toutes depuis la racine monorepo `AqarVision/` :

```bash
pnpm install              # Installer les dépendances
pnpm dev                  # Démarrer (port 3000)
pnpm build                # Build complet via Turbo
pnpm lint                 # Lint
pnpm typecheck            # Vérification TypeScript
pnpm test                 # Tests Vitest
pnpm test:e2e             # Tests Playwright (nécessite build)
```

---

## 4. Structure réelle du monorepo

```
AqarVision/
├── apps/web/                         # Next.js App Router
│   ├── src/app/
│   │   ├── layout.tsx                # Root layout (Geist fonts, theme cookie)
│   │   ├── globals.css               # Tokens CSS Zinc (light + dark)
│   │   ├── sitemap.ts
│   │   └── [locale]/
│   │       ├── page.tsx              # Homepage (hero + search + wilayas)
│   │       ├── (marketing)/          # Pricing
│   │       ├── auth/                 # Redirect login → AqarPro ou AqarChaab
│   │       ├── AqarPro/
│   │       │   ├── auth/             # Login/signup pro (layout split dark)
│   │       │   └── dashboard/        # CRM agence (8 sections + settings)
│   │       ├── AqarChaab/
│   │       │   ├── auth/             # Login/signup particulier
│   │       │   └── espace/           # Espace perso (7 sections)
│   │       ├── search/               # Marketplace (SearchPageClient)
│   │       ├── annonce/[slug]/       # Détail annonce
│   │       ├── a/[slug]/             # Vitrine agence
│   │       ├── agences/              # Annuaire agences
│   │       ├── admin/                # Super admin (agencies, verifications, users, payments, settings)
│   │       ├── deposer/              # Wizard dépôt annonce individuel (V2)
│   │       ├── comparer/             # Comparaison annonces
│   │       ├── estimer/              # Estimation de prix
│   │       ├── favorites/            # Favoris (hors AqarChaab)
│   │       ├── vendre/               # Page marketing "Vendre"
│   │       ├── pro/                  # Page marketing "AqarPro"
│   │       ├── agency/new/           # Création agence
│   │       └── invite/[token]/       # Acceptation invitation équipe
│   ├── src/features/                 # 16 modules feature-based
│   │   ├── admin/                    # Actions super-admin
│   │   ├── agencies/                 # CRUD agence, équipe, invitations
│   │   ├── agency-settings/          # Branding, thème, vérification
│   │   ├── ai/                       # Génération description, traduction (→ migrer vers Python)
│   │   ├── analytics/                # Stats dashboard, graphiques
│   │   ├── auth/                     # Login, signup, reset, signout
│   │   ├── billing/                  # Stripe, plans, abonnements
│   │   ├── favorites/                # Favoris, collections, recherches sauvegardées
│   │   ├── leads/                    # Kanban leads, notes, statuts
│   │   ├── listings/                 # CRUD annonces, wizard, publication
│   │   ├── marketplace/              # Recherche, filtres, carte, estimateur
│   │   ├── media/                    # Upload, galerie, prévisualisation
│   │   ├── messaging/                # Conversations, messages
│   │   ├── moderation/               # Queue modération (non câblé — M10)
│   │   ├── onboarding/               # Wizard d'accueil agence
│   │   └── visit-requests/           # Demandes de visite
│   ├── src/components/
│   │   ├── dashboard/DashboardSidebar.tsx
│   │   ├── brand/AqarBrandLogo.tsx
│   │   ├── marketing/                # Header, Footer, HomeSearchBar
│   │   ├── editorial/                # EditorialSplit, StatsStrip, FullBleedPhoto, WilayaScroller
│   │   ├── agency/                   # ThemeRenderer, 10 thèmes vitrines, ChatbotWidget, WhatsApp
│   │   ├── admin/AdminSidebar.tsx
│   │   ├── ui/LanguageSwitcher.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LocaleHtmlSync.tsx
│   │   └── ThemeToggle.tsx
│   ├── src/lib/
│   │   ├── auth/                     # with-agency-auth.ts, with-super-admin-auth.ts, get-cached-user.ts
│   │   ├── supabase/                 # client.ts, server.ts, middleware.ts
│   │   ├── i18n/                     # navigation.ts, request.ts, routing.ts
│   │   ├── logger/                   # Pino structured logger
│   │   ├── themes/                   # registry.ts (10 thèmes vitrines agences)
│   │   ├── sanitize.ts              # Échappement HTML, suppression null bytes, normalisation Unicode
│   │   ├── format.ts                # formatPrice et helpers
│   │   ├── agency-url.ts            # Construction URL vitrines
│   │   ├── plan-gating.ts           # Gating par plan Stripe
│   │   ├── rate-limit.ts            # Rate limiting par IP
│   │   ├── theme.ts                 # useTheme hook (light/dark toggle)
│   │   ├── seo/json-ld.ts           # JSON-LD structuré pour annonces
│   │   ├── cache/tags.ts            # Tags de cache Next.js
│   │   └── countries.ts             # Données pays
│   ├── src/hooks/
│   │   └── useAnimatedCounter.ts    # Compteur animé (utilisé par StatsStrip)
│   ├── src/types/
│   │   └── action-result.ts         # ActionResult<T>, ok(), fail()
│   ├── src/middleware.ts             # Auth + i18n middleware
│   └── messages/                     # fr.json, ar.json, en.json, es.json
├── packages/
│   └── config/                       # Validation env, constantes (seul package actif)
├── supabase/
│   ├── migrations/                   # 00000–00182 (extensions, enums, tables, RLS, triggers, géographie)
│   ├── functions/                    # stripe-webhook (Edge Function)
│   ├── seed.sql                      # Données initiales (wilayas, communes, plans)
│   └── config.toml
└── theme/                            # 10 templates HTML vitrines agences
```

---

## 5. Patterns d'architecture

### Feature Module

Chaque module dans `src/features/` suit cette structure :

```
feature-name/
  actions/      # Server Actions ("use server")
  components/   # Composants React
  hooks/        # Hooks personnalisés
  schemas/      # Validation Zod
  services/     # Logique métier (reçoit SupabaseClient en paramètre)
  types/        # Contrats TypeScript
```

### Server Action Pattern

Chaque server action suit ce flux :
1. Valider l'input via Zod (appliquer `.transform(sanitizeInput)` sur les champs texte libre)
2. Résoudre l'acteur courant via `withAgencyAuth` ou `withSuperAdminAuth`
3. Appeler le service métier
4. Retourner le résultat typé
5. Déclencher `revalidatePath` / `revalidateTag` si nécessaire

Type de retour : `ActionResult<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } }`

Helpers : `ok(data)` et `fail("CODE", "message")` depuis `@/types/action-result`.

### Auth Guards

**Un seul pattern autorisé** — `withAgencyAuth` pour les actions agence, `withSuperAdminAuth` pour les actions admin :

```typescript
// Vérifie : session active + membership agence + permission RBAC
withAgencyAuth(agencyId, resource, permission, async (ctx) => {
  // ctx.agencyId, ctx.userId, ctx.role disponibles
  return data; // wrappé dans ActionOk automatiquement
});

// Vérifie : session active + RPC is_super_admin()
withSuperAdminAuth(async (ctx) => {
  return data;
});
```

**RBAC :** 5 rôles (owner > admin > agent > editor > viewer) × 8 ressources (listing, team_member, invitation, billing, settings, analytics, media, ai_job) × 4 permissions (create, read, update, delete). Matrice complète dans `lib/auth/with-agency-auth.ts`.

---

## 6. Design System — "Zinc"

**Philosophie :** Tech premium meets real estate warmth. Inspiré de Linear (densité), Stripe (précision), Airbnb (photos immersives), Apple (fluidité), Zillow (densité fonctionnelle).

**Source de vérité :** Le skill `/mnt/skills/user/aqarvision-ux-ui/SKILL.md` et ses fichiers dans `references/`. Consulter OBLIGATOIREMENT avant toute tâche visuelle.

### Tokens essentiels

**Couleurs :** Zinc (gray blue-undertone) + Amber (warm accent) + semantic colors (success/warning/danger/info). Définis dans `globals.css` (CSS custom properties) et `tailwind.config.ts`.

**Polices :** Geist (display + body), IBM Plex Sans Arabic (arabe), Geist Mono (code). Chargées via `next/font` dans `app/layout.tsx`.

**Dark mode :** Via `data-theme="dark"` sur `<html>`, persisted en cookie + localStorage. Utiliser le prefix Tailwind `dark:` systématiquement.

### Règles absolues

- **Jamais de hex hardcodé** dans le JSX — uniquement classes Tailwind
- **Jamais de inline style** (`style={{`) — uniquement classes Tailwind
- **Jamais de bg-[#...]** — utiliser les tokens nommés
- **Jamais de `<img>`** — utiliser `next/image` avec `fill` + `sizes`
- **Jamais de `pl-4` / `mr-2`** — utiliser les propriétés logiques CSS (`ps-4`, `me-2`) pour le RTL
- **Chaque couleur DOIT avoir son équivalent dark:** (`bg-white dark:bg-zinc-900`, `text-zinc-900 dark:text-zinc-50`)

### Métriques de dette (état actuel)

| Métrique | Valeur | Objectif |
|----------|--------|----------|
| Hex hardcodés dans .tsx | 183 | 0 |
| Inline styles dans .tsx | 406 | 0 |
| Patterns bg-[#...] | 26 | 0 |
| Backward compat colors dans tailwind.config | Présents (onyx, ivoire, etc.) | Supprimés |

---

## 7. Règles strictes

- **JAMAIS** appeler la DB directement depuis un composant React
- **JAMAIS** de logique métier dans les composants UI
- **JAMAIS** de localStorage pour la session (cookies uniquement via Supabase SSR)
- **JAMAIS** enforcer les rôles côté frontend uniquement — toujours vérifier côté serveur
- **JAMAIS** de `left`/`right`/`pl`/`mr` — utiliser les propriétés logiques CSS pour le RTL
- **JAMAIS** de membership checks manuels — utiliser `withAgencyAuth`
- **JAMAIS** de admin checks manuels — utiliser `withSuperAdminAuth`
- **JAMAIS** de dates Stripe hardcodées — laisser `customer.subscription.created` les remplir
- **JAMAIS** de `defaultProps` avec texte UI hardcodé dans ErrorBoundary — passer via `useTranslations()`
- Tous les inputs validés via Zod ; champs texte libre avec `.transform(sanitizeInput)`
- Tous les outputs typés avec des DTOs explicites

---

## 8. i18n et SEO

- Toutes les routes préfixées par `[locale]`
- Chaîne de fallback : locale demandée → fr → en
- Les composants ne hardcodent jamais de texte — toujours `useTranslations()` (client) ou `getTranslations()` (server)
- Nouvelles clés ajoutées dans les 4 fichiers : `messages/fr.json`, `ar.json`, `en.json`, `es.json`
- `generateMetadata` sur chaque page dynamique
- ISR pour les pages catégorie (`revalidate: 3600`), SSR pour le détail annonce

---

## 9. Architecture IA — Migration vers Python

### Situation actuelle

Le module `features/ai/` utilise `@anthropic-ai/sdk` (SDK TypeScript Anthropic) directement dans `ai.service.ts`. Trois opérations : `generate_description`, `translate`, `enrich`. Les jobs IA sont trackés dans la table `ai_jobs` avec quotas par plan.

### Architecture cible

Remplacer `@anthropic-ai/sdk` par des appels HTTP vers un backend Python (FastAPI). Le backend Python centralisera tous les appels à l'API Claude d'Anthropic.

```
┌─────────────┐    HTTP/JSON    ┌──────────────┐    SDK Python    ┌─────────────┐
│  Next.js     │ ──────────────→│  FastAPI      │ ──────────────→│  Anthropic   │
│  (frontend)  │ ←──────────────│  (backend IA) │ ←──────────────│  Claude API  │
└─────────────┘                 └──────────────┘                 └─────────────┘
```

**Fichiers à modifier :**

`features/ai/services/ai.service.ts` — Remplacer l'import `Anthropic` et les appels directs par des `fetch()` vers le backend Python. Le reste de la logique (quotas, CRUD jobs dans Supabase) reste en TypeScript.

**Backend Python (nouveau dossier `services/ai-backend/`) :**

```
services/ai-backend/
├── main.py                 # FastAPI app, CORS, health check
├── routers/
│   ├── generate.py         # POST /generate-description
│   ├── translate.py        # POST /translate
│   └── enrich.py           # POST /enrich
├── services/
│   └── claude_client.py    # Wrapper anthropic Python SDK
├── schemas/
│   └── requests.py         # Pydantic models
├── requirements.txt        # anthropic, fastapi, uvicorn, pydantic
└── Dockerfile
```

**Supprimer de `package.json` :** La dépendance `@anthropic-ai/sdk`.

---

## 10. Plan d'exécution — Directives Claude Code

### Phase 0 — Nettoyage (PRIORITÉ CRITIQUE)

Exécuter avant toute autre modification.

#### 0.1 — Supprimer le code mort

**Fichiers à supprimer (0 imports confirmés) :**

```
src/hooks/useScrollReveal.ts
src/features/auth/hooks/use-auth.ts
src/features/auth/services/auth.service.ts
src/features/agencies/hooks/use-current-agency.ts
src/features/messaging/hooks/use-realtime-messages.ts
```

**Chaîne DeposerWizard v1 (remplacée par v2) :**

```
src/features/listings/components/DeposerWizard.tsx          (28 970 octets — MORT)
src/features/listings/actions/create-individual-listing.action.ts  (importé uniquement par DeposerWizard.tsx)
src/features/listings/schemas/individual-listing.schema.ts         (importé uniquement par les deux ci-dessus)
```

**Note :** Mettre à jour `features/listings/components/index.ts` pour retirer les exports de `DeposerWizard`. Vérifier que `__tests__/unit/features/listings/listing-schemas.test.ts` est mis à jour pour ne référencer que `individual-listing-v2.schema.ts`.

#### 0.2 — Supprimer les fichiers racine obsolètes

```
aqarsearch-refonte.jsx              (76 KB — ancien prototype)
aqarvision-zinc-design-system.md    (143 KB — doublonne avec le skill UX/UI)
AqarVision-claude-code-v4.txt       (129 KB — ancien plan)
PLAN-REFONTE-CLAUDE-CODE.md         (24 KB — remplacé par ce fichier)
```

#### 0.3 — Supprimer les packages monorepo vides

Supprimer les dossiers suivants (0 imports dans l'app web) :

```
packages/domain/
packages/database/
packages/ui/
packages/security/
packages/analytics/
packages/feature-flags/
```

**Conserver uniquement** `packages/config/` (2 imports actifs).

Mettre à jour `pnpm-workspace.yaml` pour ne référencer que `apps/*` et `packages/config`.

Mettre à jour `package.json` de `apps/web` : retirer `@aqarvision/domain` et `@aqarvision/security` des dépendances (ils sont listés mais les packages sont vides).

#### 0.4 — Consolider l'auth (supprimer la duplication)

**Supprimer :** `src/lib/actions/auth.ts` — ce fichier fournit `getAgencyForCurrentUser()` et `getAnyAgencyForCurrentUser()`, qui dupliquent la logique de `withAgencyAuth`.

**Migrer les 6 fichiers qui l'importent :**

| Fichier | Import actuel | Migration |
|---------|---------------|-----------|
| `agency-settings/actions/submit-verification.action.ts` | `getAgencyForCurrentUser, isAuthError` | Utiliser `withAgencyAuth(agencyId, "settings", "update", ...)` |
| `agency-settings/actions/upload-branding.action.ts` | `getAgencyForCurrentUser, isAuthError` | Utiliser `withAgencyAuth(agencyId, "settings", "update", ...)` |
| `agency-settings/actions/update-agency-theme.action.ts` | `getAgencyForCurrentUser, isAuthError` | Utiliser `withAgencyAuth(agencyId, "settings", "update", ...)` |
| `AqarPro/dashboard/onboarding/page.tsx` | `getAgencyForCurrentUser, isAuthError` | Résoudre l'agencyId via la query membership déjà présente dans le layout parent |
| `AqarPro/dashboard/settings/appearance/page.tsx` | `getAgencyForCurrentUser, isAuthError` | Idem |
| `AqarPro/dashboard/settings/verification/page.tsx` | `getAgencyForCurrentUser, isAuthError` | Idem |

**Stratégie pour les Server Components (pages) :** Les pages dashboard n'effectuent pas de mutations, elles lisent des données. Pour celles-ci, créer un helper léger dans `lib/auth/` :

```typescript
// lib/auth/get-agency-context.ts
export async function getAgencyContext(): Promise<{ userId: string; agencyId: string; role: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();
  if (!membership) return null;
  return { userId: user.id, agencyId: membership.agency_id, role: membership.role };
}
```

#### 0.5 — Nettoyer tailwind.config.ts

Supprimer le bloc entier "Backward compat" dans `tailwind.config.ts` (les alias `onyx`, `ivoire`, `or`, `blue-night`, `gold`, `off-white`, `charcoal`, `warm`, `coral`, `aqar`, `text-dark`, `text-body`, `text-muted`, `text-faint`).

#### 0.6 — Validation post-nettoyage

```bash
pnpm typecheck    # Doit passer sans erreur
pnpm build        # Doit compiler
pnpm test         # Les tests existants doivent passer
```

---

### Phase 1 — Migration des tokens

Éradiquer les 183 hex hardcodés, 406 inline styles, et 26 patterns bg-[#] dans les fichiers .tsx.

**Skill obligatoire :** Lire `/mnt/skills/user/aqarvision-ux-ui/SKILL.md` section "Migration from Current Design" et `references/design-tokens.md`.

**Table de correspondance :**

```
#FAFAFA → zinc-50       #F4F4F5 → zinc-100     #E4E4E7 → zinc-200
#D4D4D8 → zinc-300      #A1A1AA → zinc-400     #71717A → zinc-500
#52525B → zinc-600      #3F3F46 → zinc-700     #27272A → zinc-800
#18181B → zinc-900      #09090B → zinc-950     #FFFFFF → white
#F59E0B → amber-500     #FBBF24 → amber-400    #D97706 → amber-600
#22C55E → success       #EF4444 → danger       #3B82F6 → info
```

**Procédure :** Fichier par fichier, remplacer les valeurs hardcodées par les classes Tailwind correspondantes. Pour chaque inline style, trouver l'équivalent Tailwind. Pour chaque `bg-[#...]`, remplacer par le token nommé. Ajouter systématiquement les variantes `dark:`.

**Validation :**

```bash
grep -rn '#[0-9a-fA-F]\{6\}' apps/web/src --include="*.tsx" | grep -v tailwind.config | wc -l  # → 0
grep -rn 'style={{' apps/web/src --include="*.tsx" | wc -l                                      # → 0
grep -rn "bg-\[#" apps/web/src --include="*.tsx" | wc -l                                        # → 0
```

---

### Phase 2 — Refonte design : AqarPro (Dashboard)

**Skills obligatoires :** `references/aqarpro-ux.md` et `references/component-library.md`.

**Inspirations :** Stripe (data tables, side panel, command palette), Linear (sidebar collapsible, keyboard shortcuts, densité).

#### 2.1 — Dashboard Shell

**DashboardSidebar** (`components/dashboard/DashboardSidebar.tsx`) :
- Ajouter collapse (toggle entre 240px et 64px, raccourci `[`, persisté localStorage)
- En mode collapsed : icônes seules + tooltip
- Séparer les groupes nav avec des dividers visuels
- Ajouter badges de compteur (leads non lus, messages)
- Dark mode complet
- Responsive : drawer mobile sur écrans < lg

**DashboardTopBar** (nouveau `components/dashboard/DashboardTopBar.tsx`) :
- Barre `h-14` en haut de la zone principale
- Slots : hamburger mobile, titre page, bouton ⌘K, notifications, theme toggle, user dropdown
- Classes : `border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900`

**Dashboard layout** (`AqarPro/dashboard/layout.tsx`) : Intégrer TopBar entre sidebar et contenu.

#### 2.2 — Dashboard Overview

**Page** (`AqarPro/dashboard/page.tsx`) — enrichir avec :
- Salutation personnalisée + sélecteur de période (7j/30j/90j)
- 4 StatCards améliorés (icône, mini sparkline SVG, trend badge)
- Activity Feed (5 derniers événements, chronologie inversée)
- Quick Actions (4 boutons ghost : nouvelle annonce, inviter membre, voir stats, configurer vitrine)
- Graphique de vues par jour (bar chart CSS-only, barres zinc-800 + highlight amber pour aujourd'hui)

#### 2.3 — Command Palette (⌘K)

Nouveau composant `components/dashboard/CommandPalette.tsx` :
- Trigger : ⌘K / Ctrl+K global
- Modal centrée, backdrop blur, max-w-lg
- Input de recherche en haut, résultats groupés (Navigation, Annonces, Actions)
- Navigation clavier (flèches, Enter, Escape)
- Recherche fuzzy client-side

#### 2.4 — Side Panel (Drawer) pour les annonces

Nouveau composant `components/ui/Drawer.tsx` (réutilisable) + `features/listings/components/ListingDrawer.tsx` (spécifique). Au clic sur une ligne de la table listings, un panneau latéral s'ouvre avec photo, prix, statut, leads associés, actions rapides.

---

### Phase 3 — Refonte design : Page de connexion AqarPro

**Inspiration :** Page de connexion Stripe — formulaire centré sur carte blanche, arrière-plan dégradé dynamique animé.

**Layout** (`AqarPro/auth/layout.tsx`) : Abandonner le split layout dark. Nouveau pattern : plein écran avec fond zinc-50 + dégradé animé (blobs amber/rose/violet en animation lente) + carte formulaire centrée avec backdrop-blur.

**ProLoginForm** (`features/auth/components/ProLoginForm.tsx`) : Inputs sur fond blanc (plus zinc-900), checkbox "Se souvenir de moi", séparateur "OU", bouton Google OAuth (via `supabase.auth.signInWithOAuth({ provider: 'google' })`), messages d'erreur avec tokens danger.

---

### Phase 4 — Refonte design : AqarSearch (Marketplace)

**Skills obligatoires :** `references/aqarsearch-ux.md` et `references/editorial-immersive.md`.

**Inspirations :** Zillow (split-view search, photo gallery hero), Apple (fluidité animations), Airbnb (photos immersives).

#### 4.1 — Homepage

- Hero section full-bleed avec HomeSearchBar centré sur fond immersif
- Wilayas populaires en scroll horizontal (WilayaScroller amélioré)
- Annonces mises en avant (grille photo-first)
- Sections alternées (Editorial mode : typographie statement, parallax subtil)
- CTA sections avec fond amber accent

#### 4.2 — Page de recherche

- Split view : liste à gauche (60%) + carte MapLibre à droite (40%)
- ListingCard photo-first avec prix overlay, badges statut, hover avec shadow-card-hover
- Filtres en panel latéral ou barre horizontale sticky
- Pagination ou infinite scroll

#### 4.3 — Détail annonce

- Photo gallery hero (full-bleed, carousel)
- Sidebar sticky avec CTA (contacter, demander visite, favori)
- Sections structurées : caractéristiques, description, localisation (carte), estimation IA, annonces similaires
- JSON-LD RealEstateListing pour SEO

---

### Phase 5 — Refonte design : AqarChaab (Espace particulier)

**Skill obligatoire :** `references/aqarchaab-ux.md`.

**Inspiration :** Airbnb (espace hôte), Apple (simplicité, chaleur).

- Sidebar navigation avec ChaabSidebarNav (existant, à améliorer)
- Page d'accueil : carte de bienvenue + résumé d'activité + actions rapides
- Mes annonces : tableau avec statuts, actions inline
- Favoris/Collections : grille visuelle
- Messagerie : interface chat avec indicateurs temps réel
- Profil : formulaire propre avec avatar upload

---

### Phase 6 — Refonte design : Marketing

**Skill obligatoire :** `references/editorial-immersive.md`.

**Inspiration :** Apple (immersion, espaces blancs), Stripe (clarté pricing).

- MarketingHeader : sticky, transparent sur hero, solid au scroll
- MarketingFooter : fond dark, 4 colonnes liens, locale switcher
- Page /pricing : grille de plans Stripe avec toggle mensuel/annuel
- Page /pro : features showcase avec animations au scroll
- Page /vendre : CTA clair pour les deux parcours (agence vs particulier)
- Vitrines agences : 10 thèmes existants, améliorer la qualité visuelle

---

### Phase 7 — Backend Python IA

Créer le microservice FastAPI dans `services/ai-backend/`. Implémenter les 3 endpoints (generate-description, translate, enrich). Modifier `features/ai/services/ai.service.ts` pour appeler le backend Python via `fetch()` au lieu de `@anthropic-ai/sdk`. Supprimer `@anthropic-ai/sdk` de `package.json`.

---

## 11. Références design

| Référence | Fichier | Quand consulter |
|-----------|---------|-----------------|
| Design system complet | `/mnt/skills/user/aqarvision-ux-ui/SKILL.md` | Toujours |
| Tokens (couleurs, fonts, spacing) | `references/design-tokens.md` | Toujours |
| Bibliothèque de composants | `references/component-library.md` | Avant de créer un composant |
| UX AqarPro | `references/aqarpro-ux.md` | Dashboard, CRM |
| UX AqarSearch | `references/aqarsearch-ux.md` | Marketplace, recherche |
| UX AqarChaab | `references/aqarchaab-ux.md` | Espace particulier |
| Mode éditorial | `references/editorial-immersive.md` | Homepage, vitrines, marketing |
| Vision produit | `references/product-vision.md` | Décisions fonctionnelles majeures |

---

## 12. Schéma base de données (résumé)

Migrations dans `supabase/migrations/` (00000–00182) :

- `00000` Extensions (PostGIS, btree_gist)
- `00001` Enums (user_role, agency_role, listing_status, listing_type, property_type, listing_owner_type)
- `00010` Identités (users, profiles)
- `00020` Organisations (agencies, branches, memberships, invites)
- `00030` Annonces (listings, translations, media, documents)
- `00031` Historique (price_versions, status_versions, revisions)
- `00040` Marketplace (favorites, notes, saved_searches, view_history, leads, conversations, messages)
- `00050` Billing/AI/Analytics (plans, subscriptions, ai_jobs, entitlements, domain_events, listing_views, agency_stats_daily)
- `00060-00090` Indexes, Functions, RLS, Triggers
- `00100` Géographie (wilayas, communes)
- `00111` Annonces individuelles (owner_type, individual_owner_id, RLS)
- `00120+` Billing Stripe, AqarChaab features

---

## 13. Naming conventions

- Utilitaires : `kebab-case.ts` (ex: `create-listing.action.ts`)
- Composants : `PascalCase.tsx` (ex: `ListingCard.tsx`)
- Suffixes obligatoires : `*.service.ts`, `*.action.ts`, `*.schema.ts`, `*.types.ts`
- Server Components par défaut. `"use client"` uniquement si interactivité requise (onClick, useState, useEffect)
- Imports absolus : `@/` prefix systématique
