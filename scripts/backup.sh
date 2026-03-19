#!/bin/bash

# Script de backup automatique
# Usage: ./scripts/backup.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_NAME="aqarvision-backup-$TIMESTAMP"

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Backup AqarVision                            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Créer le dossier backups
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📦 Création du backup...${NC}"
echo ""

# Créer le backup (exclure resources et templates GitHub lourds)
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    --exclude='resources' \
    --exclude='templates/github-*' \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='*.log' \
    library/ \
    projects/ \
    templates/clone-template.sh \
    templates/fetch-all-templates.sh \
    templates/GITHUB_TEMPLATES.md \
    templates/README.md \
    templates/skills/ \
    templates/planning/ \
    docs/ \
    .claude/ \
    README.md \
    CLAUDE.md \
    WELCOME.md \
    STRUCTURE.txt \
    lien.md \
    .gitignore \
    2>/dev/null

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)

    echo -e "${GREEN}✅ Backup créé avec succès !${NC}"
    echo ""
    echo -e "${BLUE}📍 Fichier : ${NC}$BACKUP_DIR/$BACKUP_NAME.tar.gz"
    echo -e "${BLUE}📊 Taille  : ${NC}$BACKUP_SIZE"
    echo ""

    # Nettoyer les vieux backups (garder les 5 derniers)
    echo -e "${YELLOW}🧹 Nettoyage des anciens backups...${NC}"
    cd "$BACKUP_DIR"
    ls -t aqarvision-backup-*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    BACKUP_COUNT=$(ls -1 aqarvision-backup-*.tar.gz 2>/dev/null | wc -l)
    echo -e "${GREEN}✓ $BACKUP_COUNT backups conservés${NC}"
    cd - > /dev/null

    echo ""
    echo -e "${BLUE}💡 Restauration :${NC}"
    echo "  tar -xzf $BACKUP_DIR/$BACKUP_NAME.tar.gz"
else
    echo -e "${RED}❌ Erreur lors de la création du backup${NC}"
    exit 1
fi
