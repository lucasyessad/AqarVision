# AqarVision — Rapport de comparaison V1 → V2
## Vérification des 27 points de nettoyage + nouvelles découvertes

**Date :** 15 mars 2026
**Fichiers analysés :** V2 complète du monorepo

---

## RÉSUMÉ GLOBAL

| Statut | Points |
|--------|--------|
| ✅ Corrigé | 21 / 27 |
| ⚠️ Partiellement corrigé | 3 / 27 |
| ❌ Non corrigé | 3 / 27 |
| 🆕 Nouvelles améliorations détectées | 12 |
| 🔶 Nouveaux problèmes détectés | 8 |

---

## PARTIE 1 — VÉRIFICATION DES 27 POINTS

### ✅ CORRIGÉS (21/27)

| # | Point | Statut | Détail |
|---|-------|--------|--------|
| 1 | Secrets JWT hardcodés | ✅ | Les 3 fichiers supprimés (fix-rls.mjs, link-user.mjs, run-seed.mjs) |
| 2 | Scripts one-shot + full-migration.sql | ✅ | Tous supprimés, seed.sql conservé (correct) |
| 5 | AqarVision-claude-code.txt ancien | ✅ | Supprimé, v4 conservée |
| 7 | example.test.ts placeholder | ✅ | Supprimé, remplacé par 3 vrais tests unitaires + 4 tests E2E |
| 8 | ActionResult dupliqué 13× | ✅ | Centralisé dans `src/types/action-result.ts` avec ok()/fail(). Plus aucun export local dans les features |
| 10 | Locale/LOCALES dupliqués | ✅ | Importé depuis `@aqarvision/config` dans listing.schema.ts et middleware.ts |
| 11 | Schemas inline dans actions admin | ✅ | Déplacés dans `features/admin/schemas/admin.schema.ts` |
| 12 | THEME_PLAN_MAP hardcodé | ✅ | Calculé dynamiquement depuis `THEME_REGISTRY` avec une Map |
| 13 | SearchPageSkeleton dead code | ✅ | Supprimé |
| 14 | _userId inutilisé dans createAgency | ✅ | Paramètre supprimé |
| 15 | isVitrineRoute() dead function | ✅ | Supprimée du middleware |
| 17 | useCompare + CompareButton | ✅ | Les 2 fichiers supprimés |
| 18 | user_email mappé depuis phone | ✅ | Corrigé : `user_email: null` avec commentaire explicatif |
| 19 | Table 'branches' → 'agency_branches' | ✅ | Les 2 occurrences corrigées |
| 20 | ListingCard sans locale | ✅ | Migré vers `<Link>` de next-intl |
| 22 | Commentaires TÂCHE #N | ✅ | Tous supprimés du middleware |
| 23 | Guillemets inconsistants | ✅ | `create-lead-chatbot.action.ts` utilise maintenant `"use server"` |

### ⚠️ PARTIELLEMENT CORRIGÉS (3/27)

#### Point 16 — Composants exportés jamais importés
**Statut : ⚠️ 4/6 supprimés**

| Composant | V1 | V2 |
|-----------|----|----|
| UserMenu | 0 imports | ✅ Supprimé |
| CompareButton | 0 imports | ✅ Supprimé |
| ContactButton | 0 imports | ✅ Supprimé |
| ListingForm | 0 imports | ✅ Supprimé |
| ModerationQueue | 0 imports | ❌ Encore présent, 0 imports |
| ReportButton | 0 imports | ❌ Encore présent, 0 imports |

**Action restante :** `ModerationQueue.tsx` et `ReportButton.tsx` sont toujours exportés dans `moderation/components/index.ts` mais jamais importés dans aucune page. Soit les supprimer, soit les retirer du barrel export en attendant que la feature modération soit câblée.

#### Point 24 — ErrorBoundary texte FR hardcodé
**Statut : ⚠️ Structuré mais pas internationalisé**

Le texte FR est maintenant passé en props avec des valeurs par défaut :
```
title: "Une erreur est survenue"
message: "Erreur inattendue"
retryLabel: "Réessayer"
```
C'est mieux structuré (les props permettent de passer des traductions), mais les **valeurs par défaut** sont toujours en français. Si l'ErrorBoundary est utilisé sans props (ce qui est probable dans les layouts), les utilisateurs AR/EN/ES verront du français.

**Action restante :** Les parents qui rendent `<ErrorBoundary>` doivent passer les traductions via les props. Vérifier chaque usage d'ErrorBoundary dans le code.

#### Point 27 — Couleurs hex hardcodées
**Statut : ⚠️ Quasi inchangé**

| Hex | V1 | V2 | Changement |
|-----|----|----|------------|
| #1a365d | 169 | 164 | -5 (-3%) |
| #d4af37 | 72 | 72 | 0 |
| #f7fafc | 16 | 15 | -1 |
| #2d3748 | ~84 | 84 | 0 |
| #a0aec0 | ~56 | 56 | 0 |
| **Total** | **~397** | **355** | **-42 (-11%)** |
| Tokens Tailwind (onyx/or/ivoire) | 93 | 2 | -91 (régression ?) |

La migration des hex vers les tokens Tailwind n'a pas été faite. Le compteur de tokens Tailwind a même baissé (de 93 à 2), probablement parce que certains composants ont été réécrits avec des CSS variables inline au lieu des classes Tailwind.

**Action restante :** Migration complète des 355 hex restants — c'est un chantier de ~4h.

### ❌ NON CORRIGÉS (3/27)

#### Point 3 — .DS_Store et __MACOSX
**Statut : ❌**
- `.DS_Store` est toujours à la racine de `projects/`
- Le dossier `__MACOSX/` est toujours dans le zip

**Action :** Ajouter `.DS_Store` et `__MACOSX/` dans `.gitignore`. Supprimer les fichiers existants avec `git rm --cached`.

#### Point 4 — .gitkeep vide à la racine
**Statut : ❌** — Toujours présent.

**Action :** Supprimer `projects/.gitkeep` (le dossier contient des fichiers, le .gitkeep est inutile).

#### Point 6 — theme-genera-aqarvision.html
**Statut : ❌** — Toujours à la racine (47 KB).

**Action :** Supprimer ou déplacer dans `docs/` ou `tools/`.

---

## PARTIE 2 — NOUVELLES AMÉLIORATIONS DÉTECTÉES (au-delà des 27 points)

### 🆕 Améliorations de l'audit de sécurité et architecture

| # | Amélioration | Détail |
|---|-------------|--------|
| A1 | **withAgencyAuth créé et déployé** | Helper complet avec RBAC intégré (`PERMISSION_MAP`), utilisé dans **11 actions**. Inclut le logger. |
| A2 | **Packages workspace câblés** | `@aqarvision/config`, `@aqarvision/domain`, `@aqarvision/security` ajoutés dans `apps/web/package.json` |
| A3 | **sanitizeInput intégré dans les schemas** | Nouveau fichier `lib/sanitize.ts`, utilisé dans `listing.schema.ts` et `individual-listing.schema.ts` via `.transform(sanitizeInput)` |
| A4 | **JSON.parse protégé** | `createListingAction` utilise maintenant un try/catch inline |
| A5 | **React.cache() implémenté** | `getCachedListing` sur `/l/[slug]` et `getCachedAgency` sur `/a/[slug]` — double fetch éliminé |
| A6 | **10 loading.tsx** (était 4) | Nouveaux skeletons pour : `/l/[slug]`, `/a/[slug]`, `/mes-annonces`, `/leads`, `/listings`, `/team` |
| A7 | **ISR ajouté sur 3 pages SEO** | `/l/[slug]`: 3600s, `/search`: 60s, `/`: 3600s (+ `/a/[slug]`: 300s déjà existant) |
| A8 | **next/image migré** | `ListingCard.tsx` et `SearchResults.tsx` utilisent maintenant `next/image` |
| A9 | **Noto Sans Arabic chargée** | Importée dans le root layout via `next/font/google` |
| A10 | **SearchMap en dynamic import** | `next/dynamic` avec `{ ssr: false }` dans `SearchPageClient` |
| A11 | **Dashboard layout parallélisé** | `Promise.all()` pour profiles + memberships |
| A12 | **Tests ajoutés** | 3 tests unitaires (schemas, sanitize, withAgencyAuth) + 4 tests E2E (auth, deposer, listing-detail, search) |

### 🆕 Améliorations de l'audit de performance

| # | Amélioration | Détail |
|---|-------------|--------|
| A13 | **Middleware getUser réduit** | 1 seul appel `getUser` dans le middleware (était 2) |
| A14 | **FavoritesTabs composant client** | Onglets favoris gérés côté client via un nouveau composant (plus de full-page reload) |
| A15 | **Deploy conditionné au CI** | `deploy.yml` utilise `workflow_run` + `if: conclusion == 'success'` |
| A16 | **env.ts lazy** | `getEnv()` avec Proxy pour compatibilité — ne crashe plus au build time |
| A17 | **admin getAllAgencies optimisé** | Utilise un `countMap` au lieu de requêtes N+1 par agence |
| A18 | **useRealtimeMessages cache profil** | `profileCache` via `useRef<Map>` pour éviter les requêtes dupliquées |

---

## PARTIE 3 — PROBLÈMES RESTANTS ET NOUVELLES DÉCOUVERTES

### 🔶 P1 — CRITIQUE : ok()/fail() définis mais jamais utilisés

Le fichier centralisé `src/types/action-result.ts` exporte `ok()` et `fail()`, mais :
- **0 appels** à `ok()` dans les features
- **0 appels** à `fail()` dans les features
- **59 occurrences** de `{ success: true, data: ... }` manuelles
- **213 occurrences** de `{ success: false, error: ... }` manuelles

Les 28 actions qui n'utilisent pas `withAgencyAuth` construisent toujours le résultat manuellement.

**Impact :** ~270 lignes de boilerplate qui pourraient être réduites à `ok(data)` / `fail(code, msg)`.

**Action :** Migrer les 28 actions restantes pour utiliser `ok()` et `fail()` importés de `@/types/action-result`.

---

### 🔶 P2 — IMPORTANT : 28 actions sans withAgencyAuth ni RBAC

Sur 43 actions totales, **28 utilisent encore le pattern brut** `getUser()` + membership check sans vérification de rôle :

**Actions agency/settings (devraient utiliser withAgencyAuth) :**
- `ai/actions/ai.action.ts` — génération/traduction AI
- `analytics/actions/analytics.action.ts` — stats
- `billing/actions/billing.action.ts` — checkout/portal
- `leads/actions/add-lead-note.action.ts`
- `leads/actions/update-lead-status.action.ts`
- `listings/actions/price.action.ts` — changement prix
- `listings/actions/publish.action.ts` — publication
- `listings/actions/translation.action.ts` — traductions
- `media/actions/upload.action.ts` — upload media
- `visit-requests/actions/update-visit-request-status.action.ts`

**Actions admin (devraient utiliser withSuperAdminAuth) :**
- `admin/actions/approve-agency.action.ts`
- `admin/actions/reject-agency.action.ts`
- `admin/actions/suspend-agency.action.ts`
- `admin/actions/platform-settings.action.ts`

**Actions user/public (pattern acceptable mais pourraient utiliser ok/fail) :**
- `favorites/actions/collections.action.ts`
- `favorites/actions/favorites.action.ts`
- `marketplace/actions/create-search-alert.action.ts`
- `marketplace/actions/search.action.ts`
- `marketplace/actions/view-history.action.ts`
- `marketplace/actions/listing-notes.action.ts`
- `messaging/actions/get-messages.action.ts`
- `messaging/actions/messaging.action.ts`
- `agencies/actions/accept-invite.action.ts`
- `agencies/actions/create-agency.action.ts`

**Action :** 
1. Priorité haute : migrer les 10 actions agency/settings vers `withAgencyAuth` (elles manipulent des données d'agence sans vérification RBAC)
2. Priorité haute : créer `withSuperAdminAuth` et migrer les 4 actions admin
3. Priorité moyenne : adopter `ok()`/`fail()` dans les 14 actions user/public

---

### 🔶 P3 — IMPORTANT : sanitizeInput utilisé seulement dans 2 schemas

`sanitizeInput()` est intégré dans :
- `listing.schema.ts` → champs `title` et `description` de UpsertTranslationSchema
- `individual-listing.schema.ts` → champ `title`

Mais les champs texte libre suivants ne sont **pas sanitizés** :
- Noms d'agences (`agency.schema.ts` → `name`, `description`)
- Messages de chat (`messaging.schema.ts` → `body`)
- Notes de leads (`leads.schema.ts` → `content`/`note`)
- Notes privées sur listings (`listing-notes.action.ts`)
- Alertes de recherche (`search-alert.action.ts` → `name`)
- Commentaires de rejet agence (`admin.schema.ts` → `comment`)

**Action :** Ajouter `.transform(sanitizeInput)` sur tous les champs de type texte libre dans les schemas Zod.

---

### 🔶 P4 — IMPORTANT : Stripe webhook — current_period_end toujours hardcodé à 30 jours

Dans `handleCheckoutCompleted`, les insertions de `subscriptions` et `individual_subscriptions` utilisent encore :
```
current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
```

Seul `handleSubscriptionUpdated` utilise correctement la valeur Stripe (`subscription.current_period_end * 1000`).

**Impact :** Les abonnements annuels ou avec période d'essai auront une `current_period_end` incorrecte lors du premier checkout.

**Action :** Dans `handleCheckoutCompleted`, après l'insertion du subscription record, récupérer les dates depuis l'objet Stripe `subscription` via l'API (ou attendre que `subscription.created` arrive et mette à jour via `handleSubscriptionUpdated`). La méthode la plus fiable : supprimer les champs `current_period_start/end` du `handleCheckoutCompleted` et laisser `handleSubscriptionUpdated` les remplir (il est toujours appelé après).

---

### 🔶 P5 — IMPORTANT : listConversations N+1 non corrigé

`messaging.service.ts` → `listConversations()` utilise toujours une boucle `for...of` avec 3 requêtes par conversation (lastMsg, unreadCount, profil). Aucun RPC n'a été créé.

**Action :** Créer un RPC PostgreSQL `get_user_conversations(p_user_id)` avec des sous-requêtes latérales, comme détaillé dans l'audit PERF-06.

---

### 🔶 P6 — IMPORTANT : Logger utilisé seulement dans withAgencyAuth

`logger` de `lib/logger/index.ts` est importé uniquement dans `with-agency-auth.ts`. Les 28 actions qui n'utilisent pas ce helper n'ont aucun logging. Les services (listing, messaging, billing, AI) n'ont aucun logging non plus.

**Action :** Ajouter `logger.error()` dans les catch blocs des services critiques : `ai.service.ts`, `billing.service.ts`, `messaging.service.ts`, `listing.service.ts`.

---

### 🔶 P7 — MOYEN : 5 actions sans validation Zod

Ces actions n'ont aucun `safeParse`, `Schema`, ou `z.` :

| Action | Risque |
|--------|--------|
| `admin/actions/platform-settings.action.ts` | Input non validé |
| `agency-settings/actions/upload-branding.action.ts` | Input non validé (mais utilise withAgencyAuth) |
| `listings/actions/upsert-translation.action.ts` | Input non validé (mais utilise withAgencyAuth) |
| `marketplace/actions/get-communes.action.ts` | Input non validé (requête publique) |
| `messaging/actions/get-messages.action.ts` | Input non validé (conversationId) |

**Action :** Ajouter une validation Zod minimale (au moins `z.string().uuid()` pour les IDs) dans chaque action.

---

### 🔶 P8 — MOYEN : Types DB toujours non générés (30 casts `as unknown as Record`)

Le compteur est passé de 29 à 30 (un cast ajouté). Les types Supabase ne sont toujours pas générés via `supabase gen types`.

**Action :** Exécuter `supabase gen types typescript --local > packages/database/types/supabase.ts` et utiliser `SupabaseClient<Database>` dans les services.

---

### 🔶 P9 — MOYEN : Domain ListingDto diverge du web ListingDto

Le package `domain` utilise `camelCase` :
```
agencyId, listingType, propertyType, isCover
```
Le web utilise `snake_case` (comme la DB) :
```
agency_id, listing_type, property_type, is_cover
```

Ce sont deux types **incompatibles** avec le même nom. Si on importe `ListingDto` de `@aqarvision/domain`, ça va casser les mappers web.

**Action :** Deux options :
1. Aligner le domain sur snake_case (plus simple, match la DB)
2. Garder le domain en camelCase et créer un mapper DTO explicite (plus propre mais plus de code)

**Recommandation :** Option 1 — aligner sur snake_case car tout le reste du code (Supabase, RLS, migrations, services) est en snake_case.

---

### 🔶 P10 — FAIBLE : ListingStatus toujours défini localement

Le point 9 de la checklist (ListingStatus dupliqué) n'a **pas été corrigé**. Le type est toujours défini dans `features/listings/types/listing.types.ts` au lieu d'être importé de `@aqarvision/domain`. Cela est lié au P9 (naming divergent) — tant que le domain utilise `camelCase`, on ne peut pas importer ses types directement.

**Action :** Résoudre P9 d'abord, puis importer ListingStatus depuis le domain.

---

### 🔶 P11 — FAIBLE : 1024 inline styles (quasi inchangé)

| Métrique | V1 | V2 |
|----------|----|----|
| `style={{` count | 1032 | 1024 |

La migration CSS variables → classes Tailwind n'a pas été faite. Le HTML SSR reste surchargé.

**Action :** Créer des classes utilitaires dans `globals.css` ou utiliser les tokens Tailwind définis dans `tailwind.config.ts`.

---

## PARTIE 4 — PLAN D'ACTION V2

### Priorité 1 — Sécurité restante (~3h)

| # | Action | Effort |
|---|--------|--------|
| P2 | Migrer 10 actions agency vers withAgencyAuth | 2h |
| P2 | Créer withSuperAdminAuth + migrer 4 actions admin | 30min |
| P3 | Ajouter sanitizeInput dans les 6 schemas restants | 30min |
| P7 | Ajouter validation Zod dans 5 actions sans validation | 30min |

### Priorité 2 — Performance restante (~3h)

| # | Action | Effort |
|---|--------|--------|
| P5 | RPC listConversations pour éliminer le N+1 | 2h |
| P4 | Corriger current_period_end dans webhook Stripe | 30min |
| 27 | Migrer 355 hex hardcodés vers tokens Tailwind | 4h |

### Priorité 3 — Propreté code (~2h)

| # | Action | Effort |
|---|--------|--------|
| P1 | Adopter ok()/fail() dans les 28 actions restantes | 1h |
| P6 | Ajouter logger dans les services critiques | 1h |
| P8 | Générer types Supabase | 30min |
| P9 | Aligner domain ListingDto sur snake_case | 1h |
| 16 | Supprimer ou retirer ModerationQueue/ReportButton du barrel | 5min |

### Priorité 4 — Nettoyage final (~30min)

| # | Action | Effort |
|---|--------|--------|
| 3 | Ajouter .DS_Store et __MACOSX au .gitignore | 2min |
| 4 | Supprimer .gitkeep | 1min |
| 6 | Supprimer ou déplacer theme-genera-aqarvision.html | 2min |
| 24 | Internationaliser les valeurs par défaut de l'ErrorBoundary | 15min |
| 25 | Internationaliser le banner onboarding | 15min |
| 26 | Internationaliser les labels hardcodés dans ChaabSidebarNav | 15min |

---

## BILAN FINAL

### Score d'avancement

| Domaine | V1 | V2 | Progression |
|---------|----|----|-------------|
| Sécurité (RBAC) | 0% appliqué | 26% (11/43 actions) | 🟡 En cours |
| Secrets exposés | 3 fichiers | 0 fichiers | ✅ Résolu |
| Types dupliqués | 13 copies | 0 copies (centralisé) | ✅ Résolu |
| Dead code | 9 blocs | 2 restants | 🟢 Quasi résolu |
| Tests | 1 placeholder | 7 vrais tests | 🟡 Bon début |
| Performances nav | 4 loading.tsx | 10 loading.tsx | 🟢 Bon progrès |
| ISR / Cache | 1 page | 4 pages + React.cache | 🟢 Bon progrès |
| next/image | 0 usages | 2 composants | 🟡 En cours |
| Fonts | Arabic manquant | Arabic chargée | ✅ Résolu |
| CI/CD | Deploy non conditionné | Deploy conditionné | ✅ Résolu |
| Hex hardcodés | 397 | 355 | 🔴 Non traité |
| Inline styles | 1032 | 1024 | 🔴 Non traité |
| Logger | 0 imports | 1 import | 🟡 Début |

### Estimation effort restant : ~13-16 heures

La V2 a corrigé les problèmes les plus critiques (secrets, types dupliqués, RBAC partiel, performances SEO). Les chantiers restants sont principalement de la migration systématique (withAgencyAuth sur les 28 actions restantes, hex → Tailwind, ok/fail adoption) et un RPC pour le messaging.
