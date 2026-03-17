#!/bin/bash

# Script de vérification d'intégrité
# Usage: ./scripts/verify.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Vérification d'intégrité AqarVision              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Fonction de vérification
check() {
    local name=$1
    local path=$2
    local type=${3:-dir}  # dir ou file

    if [ "$type" = "dir" ]; then
        if [ -d "$path" ]; then
            echo -e "${GREEN}✓${NC} $name"
        else
            echo -e "${RED}✗${NC} $name ${YELLOW}(manquant)${NC}"
            ((ERRORS++))
        fi
    else
        if [ -f "$path" ]; then
            echo -e "${GREEN}✓${NC} $name"
        else
            echo -e "${RED}✗${NC} $name ${YELLOW}(manquant)${NC}"
            ((ERRORS++))
        fi
    fi
}

# Vérifier la structure principale
echo -e "${BLUE}📁 Structure principale${NC}"
check "resources/" "resources"
check "library/" "library"
check "projects/" "projects"
check "templates/" "templates"
check "docs/" "docs"
check ".claude/" ".claude"
echo ""

# Vérifier les fichiers de documentation
echo -e "${BLUE}📖 Documentation${NC}"
check "README.md" "README.md" "file"
check "CLAUDE.md" "CLAUDE.md" "file"
check "WELCOME.md" "WELCOME.md" "file"
check ".gitignore" ".gitignore" "file"
echo ""

# Vérifier library/
echo -e "${BLUE}📚 Library${NC}"
check "library/skills/" "library/skills"
check "library/subagents/" "library/subagents"
check "library/workflows/" "library/workflows"
check "library/generators/" "library/generators"
echo ""

# Vérifier resources/
echo -e "${BLUE}📦 Resources (dépôts sources)${NC}"
check "skills" "resources/skills"
check "awesome-subagents" "resources/awesome-subagents"
check "planning-system" "resources/planning-system"
check "prompt-generator" "resources/prompt-generator"
check "ui-ux-tools" "resources/ui-ux-tools"
check "superpowers" "resources/superpowers"
echo ""

# Vérifier templates/
echo -e "${BLUE}📋 Templates${NC}"
check "GITHUB_TEMPLATES.md" "templates/GITHUB_TEMPLATES.md" "file"
check "README.md" "templates/README.md" "file"
check "clone-template.sh" "templates/clone-template.sh" "file"
check "fetch-all-templates.sh" "templates/fetch-all-templates.sh" "file"
echo ""

# Vérifier les scripts
echo -e "${BLUE}🛠️  Scripts${NC}"
check "update-all.sh" "scripts/update-all.sh" "file"
check "backup.sh" "scripts/backup.sh" "file"
check "verify.sh" "scripts/verify.sh" "file"
echo ""

# Vérifier les dépôts Git
echo -e "${BLUE}🔍 Dépôts Git${NC}"
for repo in resources/*; do
    if [ -d "$repo" ]; then
        repo_name=$(basename "$repo")
        if [ -d "$repo/.git" ]; then
            echo -e "${GREEN}✓${NC} $repo_name ${BLUE}(Git OK)${NC}"
        else
            echo -e "${YELLOW}⚠${NC}  $repo_name ${YELLOW}(pas un dépôt Git)${NC}"
            ((WARNINGS++))
        fi
    fi
done
echo ""

# Statistiques
echo -e "${BLUE}📊 Statistiques${NC}"
SKILLS_COUNT=$(find library/skills -type d -depth 2 2>/dev/null | wc -l | tr -d ' ')
SUBAGENTS_COUNT=$(find library/subagents -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
WORKFLOWS_COUNT=$(find library/workflows -type d -depth 2 2>/dev/null | wc -l | tr -d ' ')

echo "  Skills     : $SKILLS_COUNT"
echo "  Subagents  : $SUBAGENTS_COUNT"
echo "  Workflows  : $WORKFLOWS_COUNT"
echo ""

# Résumé
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Tout est OK ! Aucun problème détecté.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s)${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erreur(s), $WARNINGS avertissement(s)${NC}"
    exit 1
fi
