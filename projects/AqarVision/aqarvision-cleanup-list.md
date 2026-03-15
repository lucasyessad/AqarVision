# AqarVision — Liste de nettoyage complète
# Chaque élément a une action : SUPPRIMER, REMPLACER, ou CORRIGER
# Classé par priorité : 🔴 Urgent → 🟠 Important → 🟡 Nettoyage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔴 URGENT — Secrets exposés (à faire IMMÉDIATEMENT)

### 1. SUPPRIMER — Clé SERVICE_ROLE Supabase hardcodée dans 3 fichiers

La clé service_role Supabase est en dur dans 3 scripts. Cette clé donne
un accès ADMIN COMPLET à toute la base de données (bypass RLS, accès
auth.users, suppression de données). Si le repo est poussé sur GitHub
(même privé), la clé est compromise.

FICHIERS :
  supabase/fix-rls.mjs        → ligne 11 : JWT hardcodé
  supabase/link-user.mjs      → ligne 10 : JWT hardcodé
  supabase/run-seed.mjs       → ligne 11 : JWT hardcodé

ACTION :
  1. Supprimer le fallback JWT de chaque fichier
  2. Garder uniquement : process.env.SUPABASE_SERVICE_ROLE_KEY (sans ||)
  3. Si ces scripts ne sont plus nécessaires (fix-rls déjà appliqué via
     migrations 00110/00120), les supprimer complètement (voir point 2)
  4. APRÈS : régénérer la clé service_role dans le dashboard Supabase
     (Settings → API → Regenerate service_role key)
  5. Vérifier que le JWT n'est pas dans l'historique Git :
     git log -p --all -S "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
     Si trouvé : utiliser git-filter-repo pour purger l'historique

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔴 URGENT — Fichiers à supprimer

### 2. SUPPRIMER — Scripts one-shot obsolètes (fix-rls déjà appliqué)

  supabase/fix-rls.mjs         28 KB  → Remplacé par migrations 00110 + 00120
  supabase/link-user.mjs        2 KB  → Script de debug dev, contient des secrets
  supabase/full-migration.sql  85 KB  → Dump concaténé, redondant avec migrations/

RAISON : fix-rls.mjs a été créé pour corriger les RLS avant que les
migrations 00110_fix_rls_args et 00120_fix_all_rls_arg_order ne soient
écrites. Ces migrations sont maintenant le moyen officiel. Le script est
obsolète ET contient des secrets. full-migration.sql est un dump
généré — il sera périmé dès qu'une nouvelle migration est ajoutée.

### 3. SUPPRIMER — Fichiers junk macOS

  .DS_Store (racine)
  __MACOSX/ (tout le dossier — 624 fichiers si dans le repo)

ACTION : Ajouter dans .gitignore (s'il n'y est pas déjà) :
  .DS_Store
  __MACOSX/
  ._*

### 4. SUPPRIMER — Fichier .gitkeep vide à la racine

  projects/.gitkeep              0 B   → Inutile si le dossier contient des fichiers

### 5. SUPPRIMER — Ancien fichier Claude Code (remplacé par v4)

  AqarVision-claude-code.txt    78 KB  → Remplacé par AqarVision-claude-code-v4.txt

RAISON : Les deux fichiers sont des prompts/instructions pour Claude Code.
La v4 (131 KB) est la version courante. L'ancienne est obsolète.

### 6. SUPPRIMER — Fichier HTML de thème à la racine

  theme-genera-aqarvision.html  47 KB  → Export/brouillon de générateur de thème

RAISON : Ce fichier HTML est à la racine du projet (hors de apps/web).
C'est probablement un prototype ou un export de ThemeStudio. S'il est
encore nécessaire, le déplacer dans docs/ ou tools/.

### 7. SUPPRIMER — Test placeholder inutile

  apps/web/__tests__/unit/example.test.ts

CONTENU : test("1 + 1 = 2", () => { expect(1 + 1).toBe(2); });
RAISON : Ce test ne vérifie rien d'utile. Le garder donne une fausse
impression que la suite de tests passe. Soit le remplacer par de vrais
tests, soit le supprimer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🟠 IMPORTANT — Code dupliqué à supprimer / remplacer

### 8. SUPPRIMER — 13x ActionResult<T> locaux (remplacer par import domain)

SUPPRIMER ces lignes dans chacun des 13 fichiers :

  export type ActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string } };

FICHIERS (supprimer le bloc de 3 lignes dans chacun) :
  features/agencies/types/agency.types.ts        → lignes 45-47
  features/ai/types/ai.types.ts                  → lignes 18-20
  features/analytics/types/analytics.types.ts    → lignes 30-32
  features/billing/types/billing.types.ts        → lignes 28-30
  features/favorites/types/collections.types.ts  → lignes 16-18
  features/favorites/types/favorites.types.ts    → lignes 1-3
  features/leads/types/leads.types.ts            → lignes 35-37
  features/listings/types/listing.types.ts       → lignes 59-61
  features/marketplace/types/search.types.ts     → lignes 129-131
  features/media/types/media.types.ts            → lignes 20-22
  features/messaging/types/messaging.types.ts    → lignes 1-3
  features/moderation/types/moderation.types.ts  → lignes 21-23
  features/visit-requests/types/visit-requests.types.ts → lignes 20-22

REMPLACER PAR (ajouter en haut de chaque fichier) :
  import type { ActionResult } from "@aqarvision/domain";
  // ou : export type { ActionResult } from "@aqarvision/domain";

### 9. SUPPRIMER — ListingStatus dupliqué dans web

FICHIER : features/listings/types/listing.types.ts → lignes 3-10
SUPPRIMER :
  export type ListingStatus =
    | "draft"
    | "pending_review"
    | "published"
    | "paused"
    | "rejected"
    | "sold"
    | "archived";

REMPLACER PAR :
  export type { ListingStatus } from "@aqarvision/domain";

### 10. SUPPRIMER — Locale et LOCALES dupliqués

FICHIER 1 : features/listings/schemas/listing.schema.ts → lignes 18-19
SUPPRIMER :
  export const LOCALES = ["fr", "ar", "en", "es"] as const;
  export type Locale = (typeof LOCALES)[number];
REMPLACER PAR :
  import { LOCALES, type Locale } from "@aqarvision/config";

FICHIER 2 : middleware.ts → lignes 38-41
SUPPRIMER :
  const SUPPORTED_LOCALES = ["fr", "ar", "en", "es"] as const;
  type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
  const DEFAULT_LOCALE: SupportedLocale = "fr";
REMPLACER PAR :
  import { LOCALES, DEFAULT_LOCALE, type Locale } from "@aqarvision/config";
  // + remplacer SUPPORTED_LOCALES par LOCALES et SupportedLocale par Locale

### 11. SUPPRIMER — Schemas Zod inline dans les actions admin

Les schemas doivent être dans features/admin/schemas/admin.schema.ts

FICHIER : features/admin/actions/approve-agency.action.ts
SUPPRIMER (lignes 8-10) :
  const ApproveAgencySchema = z.object({
    agencyId: z.string().uuid("ID agence invalide"),
  });

FICHIER : features/admin/actions/reject-agency.action.ts
SUPPRIMER (lignes 8-11) :
  const RejectAgencySchema = z.object({
    agencyId: z.string().uuid("ID agence invalide"),
    comment: z.string().max(500).optional(),
  });

FICHIER : features/admin/actions/suspend-agency.action.ts
SUPPRIMER (lignes 8-10) :
  const SuspendAgencySchema = z.object({
    agencyId: z.string().uuid("ID agence invalide"),
  });

CRÉER : features/admin/schemas/admin.schema.ts avec les 3 schemas
IMPORTER depuis les actions

### 12. SUPPRIMER — THEME_PLAN_MAP hardcodé (dupliqué avec registry)

FICHIER : lib/plan-gating.ts → lignes ~60-80
SUPPRIMER tout le bloc :
  const THEME_PLAN_MAP: Record<string, PlanCode | null> = {
    minimal: null,
    "corporate-navy": null,
    ... (15 entrées)
  };

REMPLACER PAR :
  import { THEME_REGISTRY } from "./themes/registry";
  const THEME_PLAN_MAP = Object.fromEntries(
    THEME_REGISTRY.map(t => [t.id, t.plan])
  );

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🟠 IMPORTANT — Code mort (dead code)

### 13. SUPPRIMER — SearchPageSkeleton (défini, jamais utilisé)

FICHIER : app/[locale]/search/page.tsx → lignes 93-108
SUPPRIMER tout le composant :
  function SearchPageSkeleton() { ... }

OU : L'utiliser dans un <Suspense> autour de <SearchPageClient>

### 14. SUPPRIMER — Paramètre _userId inutilisé dans createAgency

FICHIER : features/agencies/services/agency.service.ts → ligne 69
REMPLACER :
  export async function createAgency(
    supabase: SupabaseClient,
    _userId: string,           ← SUPPRIMER CE PARAMÈTRE
    data: CreateAgencyInput
  )
PAR :
  export async function createAgency(
    supabase: SupabaseClient,
    data: CreateAgencyInput
  )

PUIS : mettre à jour l'appel dans create-agency.action.ts :
  AVANT : await createAgency(supabase, user.id, parsed.data);
  APRÈS : await createAgency(supabase, parsed.data);

### 15. SUPPRIMER — isVitrineRoute() (défini, jamais appelé)

FICHIER : middleware.ts → lignes 117-122
SUPPRIMER :
  function isVitrineRoute(pathname: string): boolean {
    return /^\/[a-z]{2}\/(?:a|l)(\/|$)/.test(pathname);
  }

RAISON : Seul isUnprefixedVitrineRoute() est appelé dans le middleware.
isVitrineRoute() (avec locale) a un commentaire TÂCHE #37 mais n'est
jamais invoqué. Le commentaire à la ligne 204 le mentionne mais le code
qui l'utiliserait n'existe pas.

### 16. SUPPRIMER — Composants exportés mais jamais importés

Les composants suivants sont dans les barrel exports (index.ts) mais
ne sont importés nulle part dans l'app :

  features/auth/components/UserMenu.tsx          → 0 imports
  features/marketplace/components/CompareButton.tsx → 0 imports
  features/messaging/components/ContactButton.tsx  → 0 imports
  features/moderation/components/ModerationQueue.tsx → 0 imports
  features/moderation/components/ReportButton.tsx    → 0 imports
  features/listings/components/ListingForm.tsx       → 0 imports

ACTION :
  - Si ces composants sont prévus pour une future feature → les garder
    mais les retirer des barrel exports (index.ts) pour réduire le bundle
  - Si ce sont des brouillons jamais terminés → les supprimer
  - ListingForm est probablement remplacé par CreateListingWizard/
    DeposerWizard — à confirmer

  NB : SearchFilters, TrustBadge et MediaPreview ont 2 imports chacun
  (depuis d'autres features, pas les pages) — les garder.

### 17. SUPPRIMER — useCompare hook + CompareButton (feature non câblée)

  features/marketplace/hooks/useCompare.ts      → utilisé uniquement par CompareButton
  features/marketplace/components/CompareButton.tsx → jamais importé dans les pages

C'est un ensemble hook+composant pour une feature "comparer des biens"
qui n'est jamais montée dans l'UI. Si la feature est prévue, garder.
Sinon, supprimer les 2 fichiers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🟠 IMPORTANT — Bugs à corriger (code à modifier)

### 18. CORRIGER — user_email mappé depuis phone

FICHIER : features/agencies/services/agency.service.ts → ligne 50
AVANT :  user_email: (profile?.phone as string) ?? null,
APRÈS :  user_email: null,   // email dans auth.users, pas profiles

### 19. CORRIGER — Nom de table incorrect

FICHIER : features/agencies/services/agency.service.ts
LIGNE 174 :  .from("branches")  →  .from("agency_branches")
LIGNE 197 :  .from("branches")  →  .from("agency_branches")

### 20. CORRIGER — ListingCard navigation sans locale

FICHIER : features/listings/components/ListingCard.tsx → ligne 31
AVANT :  onClick={() => router.push(`/AqarPro/dashboard/listings/${listing.id}/edit`)}
APRÈS :  Remplacer le <button onClick={router.push}> par un <Link> de next-intl :

  import { Link } from "@/lib/i18n/navigation";
  <Link href={`/AqarPro/dashboard/listings/${listing.id}/edit`} className="...">

### 21. CORRIGER — console.warn/error → remplacer par logger

FICHIER : features/marketplace/components/SearchMap.tsx → ligne 127
AVANT :  console.warn("MapLibre: WebGL context creation failed", err);
APRÈS :  // Garder console.warn ici (client-side, pas de Pino)

FICHIER : components/ErrorBoundary.tsx → ligne 29
AVANT :  console.error("ErrorBoundary caught an error:", error, errorInfo);
APRÈS :  // Garder (client-side) mais ajouter un report Sentry :
         // Sentry.captureException(error, { extra: errorInfo });

FICHIER : supabase/functions/stripe-webhook/index.ts → ligne 403
AVANT :  console.error("Webhook handler error:", err);
APRÈS :  console.error({ event_id: event.id, event_type: event.type, error: err });

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🟡 NETTOYAGE — Commentaires et style

### 22. SUPPRIMER — Commentaires TÂCHE #N dans le middleware

FICHIER : middleware.ts
Ces commentaires (TÂCHE #35, #36, #37) référencent un système de tickets
interne. Ils sont utiles en développement mais polluent le code en
production. Les convertir en commentaires JSDoc normaux ou les supprimer.

  Ligne 82  : /** TÂCHE #37 — Détecte la locale... */
  Ligne 109 : /** TÂCHE #37 — Vérifie si le pathname... */
  Ligne 117 : /** TÂCHE #37 — Vérifie si le pathname... */
  Ligne 142 : // TÂCHE #35 — Protection CSRF
  Ligne 168 : // TÂCHE #37 — Détection de locale...
  Ligne 204 : // TÂCHE #37 — Pour les routes vitrines...
  Ligne 251 : // TÂCHE #36 — Security Headers

### 23. CORRIGER — Guillemets inconsistants

FICHIER : features/leads/actions/create-lead-chatbot.action.ts → ligne 1
AVANT :  'use server'      (single quotes)
APRÈS :  "use server"       (double quotes, comme les 41 autres actions)

### 24. SUPPRIMER — Texte français hardcodé dans ErrorBoundary

FICHIER : components/ErrorBoundary.tsx → lignes 37, 42, 45
SUPPRIMER les strings françaises et les passer en props :
  "Une erreur est survenue"  → props.title ou clé i18n
  "Erreur inattendue"        → props.fallbackMessage
  "Réessayer"                → props.retryLabel

### 25. SUPPRIMER — Texte français hardcodé dans le banner onboarding

FICHIER : app/[locale]/AqarPro/dashboard/layout.tsx → lignes 66-75
Strings à internationaliser :
  "Terminez la configuration de votre agence"
  "ajoutez votre logo, publiez votre première annonce..."
  "Commencer →"

### 26. SUPPRIMER — Labels français hardcodés dans ChaabSidebarNav

FICHIER : app/[locale]/AqarChaab/espace/layout.tsx
  Ligne 55 :  label: "Mes annonces"        → t("nav.mes_annonces")
  Ligne 82 :  label: "Augmenter mon quota" → t("nav.upgrade")
  Ligne 107:  "Retour au portail"          → t("nav.back_to_portal")
  Ligne 134:  "Se déconnecter" (title)     → t("nav.sign_out")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🟡 NETTOYAGE — Inline styles à convertir en Tailwind

### 27. REMPLACER — 370+ couleurs hex hardcodées

Voici le mapping de remplacement. Utiliser find-and-replace global :

  bg-[#1a365d]  (169 occ.)  →  bg-onyx
  text-[#1a365d]            →  text-onyx
  text-[#d4af37] (72 occ.)  →  text-or
  bg-[#d4af37]              →  bg-or
  bg-[#f7fafc]  (16 occ.)   →  bg-ivoire
  text-[#2d3748]            →  text-text-dark    (défini dans tailwind.config.ts)
  text-[#a0aec0]            →  text-text-faint

  ATTENTION : #1a365d ≠ la valeur de blue-night dans tailwind.config.ts
  (#0D0D0D). Le mapping ci-dessus est vers le NOUVEAU design system.
  Vérifier visuellement après remplacement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## RÉSUMÉ QUANTITATIF

Catégorie                              | Fichiers | Lignes estimées
---------------------------------------|----------|----------------
Secrets à supprimer (JWT hardcodé)     |    3     | ~10 lignes
Fichiers entiers à supprimer           |    7     | ~2400 lignes + 85KB SQL
Types dupliqués à supprimer            |   15     | ~60 lignes
Code mort (fonctions/composants)       |    9     | ~600 lignes
Schemas inline à déplacer              |    3     | ~15 lignes
Bugs à corriger                        |    4     | ~5 lignes
Texte FR hardcodé à internationaliser  |    3     | ~20 lignes
Hex hardcodés à remplacer              |  ~80     | ~370 occurrences
Commentaires TÂCHE à nettoyer          |    1     | ~7 lignes
                                       |          |
TOTAL estimé                           | ~125     | ~3100 lignes nettoyées

Taille libérée (fichiers supprimés) : ~240 KB
  - full-migration.sql : 85 KB
  - fix-rls.mjs : 28 KB
  - run-seed.mjs : 27 KB (garder seed.sql)
  - link-user.mjs : 2 KB
  - AqarVision-claude-code.txt : 78 KB
  - theme-genera-aqarvision.html : 47 KB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ORDRE D'EXÉCUTION RECOMMANDÉ

1. 🔴 SECRETS : Supprimer les JWT hardcodés (points 1-2) + régénérer la clé
2. 🔴 FICHIERS : Supprimer les 7 fichiers obsolètes (points 2-7)
3. 🟠 BUGS : Corriger les 4 bugs (points 18-21)
4. 🟠 TYPES : Supprimer les 13 ActionResult + ListingStatus + Locale (points 8-10)
5. 🟠 DEAD CODE : Supprimer les fonctions/composants morts (points 13-17)
6. 🟠 SCHEMAS : Déplacer les schemas inline (point 11)
7. 🟠 DUPLICATION : Supprimer THEME_PLAN_MAP (point 12)
8. 🟡 i18n : Internationaliser les strings FR (points 24-26)
9. 🟡 STYLE : Nettoyer commentaires et guillemets (points 22-23)
10. 🟡 COULEURS : Migrer les hex vers Tailwind (point 27)
