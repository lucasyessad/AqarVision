# Guide de Demarrage Rapide - AqarVision

## Introduction

Bienvenue dans **AqarVision** ! Ce guide vous aidera a commencer rapidement avec votre espace de developpement organise.

## En 5 Minutes

### 1. Explorer la Structure

```bash
# Voir les ressources sources (26 depots)
ls resources/

# Voir la bibliotheque organisee
ls library/

# Voir les categories de skills
ls library/skills/

# Voir les categories de subagents
ls library/subagents/
```

### 2. Premier Projet

```bash
# Creer un projet depuis un template
./templates/clone-template.sh nextjs mon-premier-projet

# Ou manuellement
mkdir projects/mon-premier-projet
cd projects/mon-premier-projet
git init
```

### 3. Utiliser un Skill avec Claude Code

Ouvrez Claude Code et essayez :

```
Utilise le skill canvas-design de library/skills/design/canvas-design
pour creer une visualisation de donnees
```

> Pour la liste complete des skills, subagents et workflows disponibles, voir le [README principal](../../README.md#-bibliotheque).

## Cas d'Usage Courants

### Creer un Document

```
Utilise library/skills/documents/docx pour creer un rapport
professionnel avec les donnees de data.json
```

### Optimiser du Code

```
Active le subagent Python de library/subagents/languages/
pour optimiser le script analysis.py
```

### Planifier un Projet

```
Applique le workflow Manus-style de library/workflows/planning/manus-style
pour structurer mon projet de marketplace
```

### Generer un Prompt

```
Utilise library/generators/prompts/intelligent-generator
pour creer un skill de generation de documentation API
```

## Bonnes Pratiques

1. **Projets dans `projects/`** - Gardez vos projets separes
2. **Ne jamais modifier `resources/`** - Utilisez `library/` pour les customisations
3. **Mises a jour regulieres** - Lancez `./scripts/update-all.sh` chaque semaine

## Explorer Plus

- [README.md](../../README.md) - Documentation complete
- [CLAUDE.md](../../CLAUDE.md) - Guide pour Claude Code
- [Best Practices](../best-practices/) - Meilleures pratiques
- [Maintenance](./maintenance.md) - Guide de maintenance
