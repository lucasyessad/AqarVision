# Guide de Démarrage Rapide - PersoDev

## Introduction

Bienvenue dans **PersoDev** ! Ce guide vous aidera à commencer rapidement avec votre nouvel espace de développement organisé.

## 🎯 En 5 Minutes

### 1. Explorer la Structure

```bash
# Voir les ressources sources
ls resources/

# Voir la bibliothèque organisée
ls library/

# Voir les catégories de skills
ls library/skills/

# Voir les catégories de subagents
ls library/subagents/
```

### 2. Premier Projet

```bash
# Créer un nouveau projet
mkdir projects/mon-premier-projet
cd projects/mon-premier-projet

# Initialiser git (optionnel)
git init

# Créer un fichier README
echo "# Mon Premier Projet" > README.md
```

### 3. Utiliser un Skill avec Claude Code

Ouvrez Claude Code et essayez :

```
@claude Utilise le skill canvas-design de library/skills/design/canvas-design
pour créer une visualisation de données
```

## 📚 Ressources Clés

### Skills Disponibles

**Documents** (`library/skills/documents/`)
- PDF, DOCX, PPTX, XLSX

**Design** (`library/skills/design/`)
- Art algorithmique, Canvas, Frontend, Thèmes

**Développement** (`library/skills/development/`)
- MCP Builder, Testing, Web Artifacts, API Claude

**Communication** (`library/skills/communication/`)
- Comms internes, Slack, Branding

### Workflows Essentiels

**Planning** (`library/workflows/planning/`)
- Manus-style planning - Pour projets complexes
- Brainstorming - Génération d'idées
- Writing plans - Rédaction de plans

**Git** (`library/workflows/git-strategies/`)
- Git worktrees - Travailler sur plusieurs branches
- Finishing branches - Finaliser des branches

**Code Review** (`library/workflows/code-review/`)
- Processus de review de code

## 🚀 Cas d'Usage Courants

### Créer un Document

```
@claude Utilise library/skills/documents/docx pour créer un rapport
professionnel avec les données de data.json
```

### Optimiser du Code

```
@claude Active le subagent Python de library/subagents/languages/
pour optimiser le script analysis.py
```

### Planifier un Projet

```
@claude Applique le workflow Manus-style de library/workflows/planning/manus-style
pour structurer mon projet de marketplace
```

### Générer un Prompt

```
@claude Utilise library/generators/prompts/intelligent-generator
pour créer un skill de génération de documentation API
```

## 💡 Bonnes Pratiques

### Organisation

1. **Projets dans `projects/`** - Gardez vos projets séparés
2. **Templates dans `templates/`** - Créez des templates réutilisables
3. **Documentation dans `docs/`** - Documentez vos workflows

### Mise à Jour

```bash
# Mettre à jour une ressource source
cd resources/skills
git pull origin main
cd ../..

# Copier les mises à jour pertinentes vers library/ si nécessaire
```

### Customisation

- Modifiez les ressources dans `library/` selon vos besoins
- Gardez `resources/` en lecture seule
- Documentez vos modifications

## 🔍 Explorer Plus

- [README.md](../../README.md) - Documentation complète
- [CLAUDE.md](../../CLAUDE.md) - Guide pour Claude Code
- [Best Practices](../best-practices/) - Meilleures pratiques

## 📞 Support

- Documentation Claude Code : https://docs.claude.com/claude-code
- Agent Skills Spec : http://agentskills.io
- Support Claude : https://support.claude.com

---

**Prêt à créer ? Lancez-vous !** 🚀
