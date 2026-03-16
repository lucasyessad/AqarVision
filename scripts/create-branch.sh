#!/bin/bash

# Script de création de branche AqarVision avec scaffold de module feature
# Usage: ./scripts/create-branch.sh <type> <name> [--module <module-name>]

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

FEATURES_DIR="projects/AqarVision/apps/web/src/features"

# ── Helpers ──────────────────────────────────────────────────────────

to_pascal_case() {
  echo "$1" | sed -r 's/(^|-)([a-z])/\U\2/g'
}

to_camel_case() {
  local pascal
  pascal=$(to_pascal_case "$1")
  echo "${pascal,}"
}

print_usage() {
  echo -e "${RED}Usage: ./scripts/create-branch.sh <type> <name> [--module <module-name>]${NC}"
  echo ""
  echo "Types:"
  echo "  phase-0    Nettoyage (code mort, configs)"
  echo "  phase-1    Stabilisation technique"
  echo "  phase-2    Dette design (hex, inline styles, dark mode)"
  echo "  phase-3    Dashboard AqarPro"
  echo "  phase-4    Homepage + surfaces publiques"
  echo "  phase-5    Securite et qualite"
  echo "  phase-6    Backend Python IA"
  echo "  feature    Nouvelle fonctionnalite"
  echo "  fix        Correction de bug"
  echo "  refactor   Refactoring"
  echo ""
  echo "Options:"
  echo "  --module <name>   Scaffold un module feature complet"
  echo ""
  echo "Exemples:"
  echo "  ./scripts/create-branch.sh phase-0 cleanup-dead-code"
  echo "  ./scripts/create-branch.sh feature leads-v2 --module leads-v2"
  echo "  ./scripts/create-branch.sh fix search-map-types"
  exit 1
}

get_phase_description() {
  case "$1" in
    "phase-0") echo "Phase 0 — Nettoyage : supprimer le code mort, consolider l'auth, nettoyer les configs." ;;
    "phase-1") echo "Phase 1 — Stabilisation technique : Sentry, types SearchMap, i18n, tests unitaires." ;;
    "phase-2") echo "Phase 2 — Eradication dette design : 946 violations (hex, inline styles, dark mode)." ;;
    "phase-3") echo "Phase 3 — Dashboard AqarPro complet : TopBar, sidebar, CommandPalette, Overview, ListingDrawer." ;;
    "phase-4") echo "Phase 4 — Refonte homepage + surfaces publiques : design tricolore lumineux avec GSAP." ;;
    "phase-5") echo "Phase 5 — Securite et qualite : CSP durcie, CI gates, tests E2E dashboard." ;;
    "phase-6") echo "Phase 6 — Backend Python IA : microservice FastAPI, migration des 3 endpoints." ;;
    "feature") echo "Nouvelle fonctionnalite." ;;
    "fix")     echo "Correction de bug." ;;
    "refactor") echo "Refactoring." ;;
  esac
}

# ── Parse arguments ──────────────────────────────────────────────────

BRANCH_TYPE=$1
BRANCH_NAME=$2
MODULE_NAME=""

shift 2 2>/dev/null || true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --module)
      MODULE_NAME="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Option inconnue: $1${NC}"
      print_usage
      ;;
  esac
done

# ── Header ───────────────────────────────────────────────────────────

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Branch Creator — AqarVision                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: Validation ───────────────────────────────────────────────

TOTAL_STEPS=4
if [ -n "$MODULE_NAME" ]; then
  TOTAL_STEPS=5
fi

echo -e "${YELLOW}📋 Etape 1/${TOTAL_STEPS} : Validation des arguments${NC}"

if [ -z "$BRANCH_TYPE" ] || [ -z "$BRANCH_NAME" ]; then
  print_usage
fi

VALID_TYPES="phase-0 phase-1 phase-2 phase-3 phase-4 phase-5 phase-6 feature fix refactor"
if ! echo "$VALID_TYPES" | grep -qw "$BRANCH_TYPE"; then
  echo -e "${RED}Type invalide: $BRANCH_TYPE${NC}"
  print_usage
fi

if ! echo "$BRANCH_NAME" | grep -qE '^[a-z0-9]+(-[a-z0-9]+)*$'; then
  echo -e "${RED}Nom invalide: $BRANCH_NAME (kebab-case requis)${NC}"
  exit 1
fi

if [ -n "$MODULE_NAME" ]; then
  if ! echo "$MODULE_NAME" | grep -qE '^[a-z0-9]+(-[a-z0-9]+)*$'; then
    echo -e "${RED}Nom de module invalide: $MODULE_NAME (kebab-case requis)${NC}"
    exit 1
  fi
  if [ "$BRANCH_TYPE" != "feature" ]; then
    echo -e "${YELLOW}⚠️  --module est concu pour les branches feature, mais on continue${NC}"
  fi
fi

FULL_BRANCH="${BRANCH_TYPE}/${BRANCH_NAME}"
echo "  Type: $BRANCH_TYPE"
echo "  Nom: $BRANCH_NAME"
echo "  Branche: $FULL_BRANCH"
if [ -n "$MODULE_NAME" ]; then
  echo "  Module: $MODULE_NAME"
fi
echo -e "${GREEN}✓ Arguments valides${NC}"
echo ""

# ── Step 2: Git state ───────────────────────────────────────────────

echo -e "${YELLOW}📋 Etape 2/${TOTAL_STEPS} : Verification de l'etat git${NC}"

if [ ! -d ".git" ]; then
  echo -e "${RED}Pas un depot Git${NC}"
  exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)
echo "  Branche actuelle: $CURRENT_BRANCH"

if git branch --list "$FULL_BRANCH" | grep -q .; then
  echo -e "${RED}La branche $FULL_BRANCH existe deja${NC}"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠️  Working tree dirty — les changements non commites seront conserves${NC}"
fi

echo -e "${GREEN}✓ Etat git OK${NC}"
echo ""

# ── Step 3: Create branch ───────────────────────────────────────────

STEP=3
echo -e "${YELLOW}📋 Etape ${STEP}/${TOTAL_STEPS} : Creation de la branche${NC}"
git checkout -b "$FULL_BRANCH"
echo -e "${GREEN}✓ Branche $FULL_BRANCH creee${NC}"
echo ""

# ── Step 4: Scaffold module (if --module) ────────────────────────────

if [ -n "$MODULE_NAME" ]; then
  STEP=4
  echo -e "${YELLOW}📋 Etape ${STEP}/${TOTAL_STEPS} : Scaffold du module feature${NC}"

  MODULE_DIR="${FEATURES_DIR}/${MODULE_NAME}"
  PASCAL=$(to_pascal_case "$MODULE_NAME")
  CAMEL=$(to_camel_case "$MODULE_NAME")

  if [ -d "$MODULE_DIR" ]; then
    echo -e "${YELLOW}⚠️  Le module $MODULE_NAME existe deja, scaffold ignore${NC}"
  else
    # Create directories
    mkdir -p "$MODULE_DIR/actions"
    mkdir -p "$MODULE_DIR/schemas"
    mkdir -p "$MODULE_DIR/services"
    mkdir -p "$MODULE_DIR/components"
    mkdir -p "$MODULE_DIR/types"
    mkdir -p "$MODULE_DIR/hooks"
    touch "$MODULE_DIR/hooks/.gitkeep"

    # actions/<module>.action.ts
    cat > "$MODULE_DIR/actions/${MODULE_NAME}.action.ts" << ACTIONEOF
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { Create${PASCAL}Schema } from "../schemas/${MODULE_NAME}.schema";
import { create } from "../services/${MODULE_NAME}.service";
import type { ActionResult, Create${PASCAL}Result } from "../types/${MODULE_NAME}.types";

export async function create${PASCAL}Action(
  _prevState: ActionResult<Create${PASCAL}Result> | null,
  formData: FormData
): Promise<ActionResult<Create${PASCAL}Result>> {
  const agencyId = formData.get("agency_id") as string;
  if (!agencyId) {
    return { success: false, error: { code: "VALIDATION_ERROR", message: "agency_id requis" } };
  }

  const raw = {
    agency_id: agencyId,
    // TODO: extract form fields
  };

  const parsed = Create${PASCAL}Schema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: parsed.error.errors.map((e) => e.message).join(", ") },
    };
  }

  return withAgencyAuth(agencyId, "listing", "create", async ({ userId }) => {
    const supabase = await createClient();
    const result = await create(supabase, userId, parsed.data);
    // TODO: revalidatePath
    return result;
  });
}
ACTIONEOF
    echo -e "  ${GREEN}✓${NC} actions/${MODULE_NAME}.action.ts"

    # schemas/<module>.schema.ts
    cat > "$MODULE_DIR/schemas/${MODULE_NAME}.schema.ts" << SCHEMAEOF
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

export const Create${PASCAL}Schema = z.object({
  agency_id: z.string().uuid(),
  // TODO: add fields
});

export type Create${PASCAL}Input = z.infer<typeof Create${PASCAL}Schema>;
SCHEMAEOF
    echo -e "  ${GREEN}✓${NC} schemas/${MODULE_NAME}.schema.ts"

    # services/<module>.service.ts
    cat > "$MODULE_DIR/services/${MODULE_NAME}.service.ts" << SERVICEEOF
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import type { ${PASCAL}Dto, Create${PASCAL}Result } from "../types/${MODULE_NAME}.types";
import type { Create${PASCAL}Input } from "../schemas/${MODULE_NAME}.schema";

export async function create(
  supabase: SupabaseClient,
  userId: string,
  data: Create${PASCAL}Input
): Promise<Create${PASCAL}Result> {
  // TODO: implement
  throw new Error("Not implemented");
}

export async function getById(
  supabase: SupabaseClient,
  id: string
): Promise<${PASCAL}Dto | null> {
  // TODO: implement
  throw new Error("Not implemented");
}
SERVICEEOF
    echo -e "  ${GREEN}✓${NC} services/${MODULE_NAME}.service.ts"

    # components/<PascalName>List.tsx
    cat > "$MODULE_DIR/components/${PASCAL}List.tsx" << COMPONENTEOF
import { getTranslations } from "next-intl/server";

interface ${PASCAL}ListProps {
  agencyId: string;
}

export async function ${PASCAL}List({ agencyId }: ${PASCAL}ListProps) {
  const t = await getTranslations("${CAMEL}");

  return (
    <div className="space-y-4">
      {/* TODO: implement */}
      <p className="text-zinc-500 dark:text-zinc-400">{t("empty")}</p>
    </div>
  );
}
COMPONENTEOF
    echo -e "  ${GREEN}✓${NC} components/${PASCAL}List.tsx"

    # types/<module>.types.ts
    cat > "$MODULE_DIR/types/${MODULE_NAME}.types.ts" << TYPESEOF
export interface ${PASCAL}Dto {
  id: string;
  agency_id: string;
  created_at: string;
  // TODO: add fields
}

export interface Create${PASCAL}Result {
  id: string;
}

export type { ActionResult } from "@/types/action-result";
TYPESEOF
    echo -e "  ${GREEN}✓${NC} types/${MODULE_NAME}.types.ts"

    echo -e "  ${GREEN}✓${NC} hooks/.gitkeep"
    echo -e "${GREEN}✓ Module $MODULE_NAME scaffold dans $MODULE_DIR${NC}"
  fi
  echo ""
fi

# ── Step N: BRANCH.md ────────────────────────────────────────────────

STEP=$TOTAL_STEPS
echo -e "${YELLOW}📋 Etape ${STEP}/${TOTAL_STEPS} : Creation de BRANCH.md${NC}"

if [ -f "BRANCH.md" ]; then
  mv BRANCH.md BRANCH.md.bak
  echo -e "${YELLOW}⚠️  BRANCH.md existant sauvegarde en BRANCH.md.bak${NC}"
fi

DESCRIPTION=$(get_phase_description "$BRANCH_TYPE")
TODAY=$(date +%Y-%m-%d)

{
  echo "# Branch: ${FULL_BRANCH}"
  echo ""
  echo "> Created: ${TODAY}"
  echo ""
  echo "## Objectif"
  echo ""
  echo "${DESCRIPTION}"
  echo ""
  echo "## Scope"
  echo ""
  echo "- [ ] TODO: definir le scope"
  echo ""

  if [ -n "$MODULE_NAME" ] && [ -d "$MODULE_DIR" ]; then
    echo "## Module"
    echo ""
    echo "Feature module scaffold dans \`${MODULE_DIR}/\`"
    echo ""
    echo "Structure :"
    echo "- \`actions/${MODULE_NAME}.action.ts\`"
    echo "- \`schemas/${MODULE_NAME}.schema.ts\`"
    echo "- \`services/${MODULE_NAME}.service.ts\`"
    echo "- \`components/${PASCAL}List.tsx\`"
    echo "- \`types/${MODULE_NAME}.types.ts\`"
    echo "- \`hooks/\`"
    echo ""
  fi

  echo "## Validation"
  echo ""
  echo '```bash'
  echo "pnpm typecheck && pnpm build && pnpm test"
  echo '```'
  echo ""
  echo "## Notes"
  echo ""
  echo "---"
} > BRANCH.md

echo -e "${GREEN}✓ BRANCH.md cree${NC}"
echo ""

# ── Summary ──────────────────────────────────────────────────────────

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Branche creee avec succes !${NC}"
echo ""
echo -e "${BLUE}📊 Resume:${NC}"
echo "  • Branche: ${FULL_BRANCH}"
echo "  • BRANCH.md: ✓"
if [ -n "$MODULE_NAME" ]; then
  echo "  • Module ${MODULE_NAME}: ✓"
fi
echo ""
echo -e "${BLUE}💡 Prochaines etapes:${NC}"
echo "  • Editez BRANCH.md pour preciser le scope"
if [ -n "$MODULE_NAME" ]; then
  echo "  • Completez les fichiers TODO dans ${MODULE_DIR}/"
fi
echo "  • Commencez l'implementation"
echo ""
