# Référence Rapide - PersoDev

## Commandes Essentielles

### Navigation

```bash
# Aller à la bibliothèque
cd library/

# Aller aux projets
cd projects/

# Aller aux ressources sources
cd resources/

# Lister tous les skills disponibles
find library/skills -type d -depth 2

# Lister tous les workflows
find library/workflows -type d -depth 2
```

### Mise à Jour des Ressources

```bash
# Mettre à jour un dépôt source
cd resources/<nom-depot> && git pull && cd ../..

# Mettre à jour tous les dépôts (attention : prend du temps)
for dir in resources/*/; do (cd "$dir" && git pull); done
```

### Création de Projet

```bash
# Nouveau projet depuis zéro
mkdir projects/<nom-projet> && cd projects/<nom-projet>

# Nouveau projet depuis template
cp -r templates/<type> projects/<nom-projet>

# Initialiser git pour le projet
cd projects/<nom-projet> && git init
```

## Chemins Importants

### Skills

| Catégorie | Chemin | Contenu |
|-----------|--------|---------|
| Documents | `library/skills/documents/` | PDF, DOCX, PPTX, XLSX |
| Design | `library/skills/design/` | Art, Canvas, Frontend, Thèmes |
| Development | `library/skills/development/` | MCP, Testing, Web, API |
| Communication | `library/skills/communication/` | Comms, Slack, Branding |

### Subagents

| Catégorie | Chemin | Contenu |
|-----------|--------|---------|
| Languages | `library/subagents/languages/` | Python, JS, TS, Go, etc. |
| Infrastructure | `library/subagents/infrastructure/` | Docker, K8s, Cloud |
| Testing | `library/subagents/testing/` | QA, Security, Tests |
| Data & AI | `library/subagents/data-ai/` | ML, Data Science |
| Workflows | `library/subagents/workflows/` | CI/CD, Orchestration |

### Workflows

| Catégorie | Chemin | Contenu |
|-----------|--------|---------|
| Planning | `library/workflows/planning/` | Manus, Brainstorming |
| Git | `library/workflows/git-strategies/` | Worktrees, Branching |
| Review | `library/workflows/code-review/` | Review processes |
| Debug | `library/workflows/debugging/` | TDD, Systematic debug |

### Générateurs

| Type | Chemin | Description |
|------|--------|-------------|
| Prompts | `library/generators/prompts/intelligent-generator/` | Génération de prompts IA |
| UI | `library/generators/ui-components/ui-ux-pro/` | Générateur UI/UX |
| Templates | `library/generators/templates/skill-templates/` | Templates de skills |

## Patterns Claude Code

### Utiliser un Skill

```
@claude Utilise library/skills/<catégorie>/<skill> pour <tâche>
```

**Exemples :**
```
@claude Utilise library/skills/documents/pdf pour extraire le texte de report.pdf

@claude Utilise library/skills/design/canvas-design pour créer une viz de données

@claude Utilise library/skills/development/mcp-builder pour créer un serveur MCP
```

### Activer un Subagent

```
@claude Active le subagent <domaine> de library/subagents/<catégorie>/ pour <tâche>
```

**Exemples :**
```
@claude Active le subagent Python pour optimiser mon script

@claude Active le subagent Docker pour containériser l'application

@claude Active le subagent Security pour auditer le code
```

### Appliquer un Workflow

```
@claude Applique le workflow <nom> de library/workflows/<catégorie>/ pour <projet>
```

**Exemples :**
```
@claude Applique le workflow Manus-style planning pour structurer le projet

@claude Applique le workflow git-worktrees pour travailler sur multiple branches

@claude Applique le workflow TDD pour développer la nouvelle feature
```

### Utiliser un Générateur

```
@claude Utilise library/generators/<type>/<générateur>/ pour <création>
```

**Exemples :**
```
@claude Utilise le générateur de prompts intelligent pour créer un skill

@claude Utilise le générateur UI/UX pour créer des composants React

@claude Utilise les templates de skills pour créer un nouveau skill custom
```

## Structure de Fichiers Skill

### SKILL.md Standard

```markdown
---
name: Nom du Skill
description: Description courte
version: 1.0.0
---

# Instructions

[Instructions détaillées pour Claude]

# Exemples

[Exemples d'usage]

# Ressources

[Fichiers et ressources additionnels]
```

### Organisation d'un Skill

```
skill-name/
├── SKILL.md          # Instructions principales
├── README.md         # Documentation
├── examples/         # Exemples
├── templates/        # Templates
└── resources/        # Ressources (images, data, etc.)
```

## Raccourcis Utiles

### Recherche

```bash
# Trouver un skill par nom
find library/skills -name "*<keyword>*"

# Chercher dans les descriptions de skills
grep -r "description" library/skills/*/SKILL.md

# Trouver un workflow
find library/workflows -name "*<keyword>*"

# Chercher dans la documentation
grep -r "<keyword>" docs/
```

### Statistiques

```bash
# Nombre total de skills
find library/skills -type d -depth 2 | wc -l

# Nombre total de workflows
find library/workflows -type d -depth 2 | wc -l

# Taille de la bibliothèque
du -sh library/

# Nombre de projets
ls -1 projects/ | wc -l
```

### Nettoyage

```bash
# Nettoyer les fichiers temporaires
find . -name ".DS_Store" -delete
find . -name "*.tmp" -delete

# Trouver les gros fichiers
find library -type f -size +10M

# Nettoyer les caches (selon vos projets)
find projects -name "node_modules" -type d -prune -exec rm -rf {} +
find projects -name "__pycache__" -type d -prune -exec rm -rf {} +
```

## Variables d'Environnement

### Recommandées

```bash
# Ajouter à votre .bashrc ou .zshrc

# Chemin base PersoDev
export PERSODEV_HOME="/path/to/PersoDev"

# Aliases utiles
alias pd="cd $PERSODEV_HOME"
alias pdl="cd $PERSODEV_HOME/library"
alias pdp="cd $PERSODEV_HOME/projects"
alias pdr="cd $PERSODEV_HOME/resources"

# Fonction pour créer un nouveau projet
pdnew() {
    mkdir -p "$PERSODEV_HOME/projects/$1"
    cd "$PERSODEV_HOME/projects/$1"
    git init
    echo "# $1" > README.md
}

# Fonction pour mettre à jour les ressources
pdupdate() {
    echo "Updating resources..."
    for dir in "$PERSODEV_HOME"/resources/*/; do
        echo "Updating $(basename $dir)..."
        (cd "$dir" && git pull)
    done
}

# Fonction pour lister les skills
pdskills() {
    find "$PERSODEV_HOME/library/skills" -type d -depth 2 -exec basename {} \;
}

# Fonction pour lister les workflows
pdworkflows() {
    find "$PERSODEV_HOME/library/workflows" -type d -depth 2 -exec basename {} \;
}
```

## Dépannage

### Problèmes Courants

#### "Command not found" lors de git pull

```bash
# Vérifier que c'est bien un dépôt git
cd resources/<depot>
ls -la .git

# Si pas de .git, re-cloner
cd ..
rm -rf <depot>
git clone <url-originale> <depot>
```

#### Espace disque insuffisant

```bash
# Trouver les gros répertoires
du -sh resources/*/* | sort -hr | head -10

# Nettoyer les caches git
cd resources/<depot>
git gc --aggressive
```

#### Ressource introuvable

```bash
# Vérifier que la ressource existe
ls -la library/<category>/<resource>

# Chercher dans resources/
find resources -name "*<resource>*"

# Re-copier depuis resources/
cp -r resources/<source>/<path> library/<category>/
```

## Liens Rapides

### Documentation

- [README Principal](../../README.md)
- [CLAUDE.md](../../CLAUDE.md)
- [Guide Quick Start](../guides/quick-start.md)
- [Best Practices](../best-practices/resource-management.md)

### Ressources Externes

- [Claude Code Docs](https://docs.claude.com/claude-code)
- [Agent Skills Spec](http://agentskills.io)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Claude Support](https://support.claude.com)

### Dépôts Sources

- [anthropics/skills](https://github.com/anthropics/skills)
- [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)
- [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files)
- [huangserva/skill-prompt-generator](https://github.com/huangserva/skill-prompt-generator)
- [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- [obra/superpowers](https://github.com/obra/superpowers)

---

**Gardez cette page en favoris pour un accès rapide !** ⚡
