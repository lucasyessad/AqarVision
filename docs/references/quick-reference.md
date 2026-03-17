# Reference Rapide - AqarVision

## Commandes Essentielles

### Navigation

```bash
cd library/          # Aller a la bibliotheque
cd projects/         # Aller aux projets
cd resources/        # Aller aux ressources sources

# Lister tous les skills disponibles
find library/skills -type d -depth 2

# Lister tous les workflows
find library/workflows -type d -depth 2
```

### Scripts

```bash
./scripts/update-all.sh                      # Mettre a jour les 26 depots
./scripts/verify.sh                          # Verifier l'integrite
./scripts/backup.sh                          # Backup complet
./scripts/commit-to-main.sh                  # Merge dev vers master
./scripts/create-branch.sh                   # Creer une branche feature
./templates/clone-template.sh <type> <nom>   # Cloner un template
```

### Creation de Projet

```bash
# Depuis un template
./templates/clone-template.sh saas mon-saas

# Manuellement
mkdir projects/<nom-projet> && cd projects/<nom-projet>
git init
```

> Pour la liste complete des skills, subagents, workflows et generateurs, voir le [README principal](../../README.md#-bibliotheque).

## Patterns Claude Code

### Utiliser un Skill

```
Utilise library/skills/<categorie>/<skill> pour <tache>
```

**Exemples :**
```
Utilise library/skills/documents/pdf pour extraire le texte de report.pdf
Utilise library/skills/design/canvas-design pour creer une viz de donnees
Utilise library/skills/development/mcp-builder pour creer un serveur MCP
```

### Activer un Subagent

```
Active le subagent <domaine> de library/subagents/<categorie>/ pour <tache>
```

**Exemples :**
```
Active le subagent Python pour optimiser mon script
Active le subagent Docker pour containeriser l'application
Active le subagent Security pour auditer le code
```

### Appliquer un Workflow

```
Applique le workflow <nom> de library/workflows/<categorie>/ pour <projet>
```

**Exemples :**
```
Applique le workflow Manus-style planning pour structurer le projet
Applique le workflow git-worktrees pour travailler sur multiple branches
Applique le workflow TDD pour developper la nouvelle feature
```

### Utiliser un Generateur

```
Utilise library/generators/<type>/<generateur>/ pour <creation>
```

**Exemples :**
```
Utilise le generateur de prompts intelligent pour creer un skill
Utilise le generateur UI/UX pour creer des composants React
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
[Instructions detaillees pour Claude]

# Exemples
[Exemples d'usage]

# Ressources
[Fichiers et ressources additionnels]
```

## Raccourcis Utiles

### Recherche

```bash
# Trouver un skill par nom
find library/skills -name "*<keyword>*"

# Chercher dans les descriptions de skills
grep -r "description" library/skills/*/SKILL.md

# Chercher dans la documentation
grep -r "<keyword>" docs/
```

### Statistiques

```bash
# Nombre total de skills
find library/skills -type d -depth 2 | wc -l

# Taille de la bibliotheque
du -sh library/

# Nombre de projets
ls -1 projects/ | wc -l
```

### Nettoyage

```bash
find . -name ".DS_Store" -delete
find . -name "*.tmp" -delete
find projects -name "node_modules" -type d -prune -exec rm -rf {} +
find projects -name "__pycache__" -type d -prune -exec rm -rf {} +
```

## Liens Rapides

- [README Principal](../../README.md)
- [CLAUDE.md](../../CLAUDE.md)
- [Guide Quick Start](../guides/quick-start.md)
- [Best Practices](../best-practices/resource-management.md)
- [Guide Maintenance](../guides/maintenance.md)
