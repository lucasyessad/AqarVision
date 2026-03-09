# PersoDev - Personal Development Workspace

> 🚀 Espace de développement personnel optimisé avec Claude Code - Collection complète de skills, subagents et workflows pour maximiser votre productivité.

[![Claude Code](https://img.shields.io/badge/Claude-Code-blue)](https://claude.ai/code)
[![Resources](https://img.shields.io/badge/Resources-6_repos-green)](#ressources-sources)
[![Skills](https://img.shields.io/badge/Skills-17+-orange)](#skills)
[![Subagents](https://img.shields.io/badge/Subagents-127+-purple)](#subagents)

---

## 📋 Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Structure du Projet](#-structure-du-projet)
- [Démarrage Rapide](#-démarrage-rapide)
- [Bibliothèque](#-bibliothèque)
  - [Skills](#skills)
  - [Subagents](#subagents)
  - [Workflows](#workflows)
  - [Générateurs](#générateurs)
- [Ressources Sources](#-ressources-sources)
- [Guide d'Utilisation](#-guide-dutilisation)
- [Contribution](#-contribution)

---

## 🎯 Vue d'ensemble

**PersoDev** est un workspace structuré qui centralise et organise les meilleures ressources pour le développement avec Claude Code :

- **Skills** : Instructions spécialisées pour des tâches répétables
- **Subagents** : Assistants IA spécialisés par domaine technique
- **Workflows** : Méthodologies de développement éprouvées
- **Générateurs** : Outils pour créer prompts, UI et templates

### Objectifs

✅ Centraliser toutes les ressources Claude Code
✅ Organisation logique par type d'usage
✅ Séparation sources (git) / bibliothèque (usage)
✅ Prêt pour vos futurs projets
✅ Maintenance simplifiée

---

## 📁 Structure du Projet

```
PersoDev/
├── 📚 resources/              # Dépôts sources (lecture seule - git pull pour màj)
│   ├── skills/               # Anthropic skills officiels
│   ├── awesome-subagents/    # Collection 127+ subagents
│   ├── planning-system/      # Planning façon Manus
│   ├── prompt-generator/     # Générateur intelligent de prompts
│   ├── ui-ux-tools/         # Outils UI/UX professionnels
│   └── superpowers/         # Workflows avancés
│
├── 🎯 library/               # Bibliothèque organisée pour usage quotidien
│   ├── skills/              # Skills par catégorie
│   │   ├── documents/       # PDF, DOCX, PPTX, XLSX
│   │   ├── design/          # Art algorithmique, Canvas, Frontend
│   │   ├── development/     # MCP, Testing, Web artifacts
│   │   └── communication/   # Comms internes, Slack, Branding
│   │
│   ├── subagents/           # Subagents par domaine
│   │   ├── languages/       # Python, JavaScript, TypeScript, etc.
│   │   ├── infrastructure/  # Docker, Kubernetes, Cloud
│   │   ├── testing/         # QA, Security, Testing
│   │   ├── data-ai/         # Data Science, ML, AI
│   │   └── workflows/       # Orchestration, CI/CD
│   │
│   ├── workflows/           # Workflows de développement
│   │   ├── planning/        # Planification (Manus, brainstorming)
│   │   ├── git-strategies/  # Git worktrees, branching
│   │   ├── code-review/     # Processus de review
│   │   └── debugging/       # TDD, debugging systématique
│   │
│   └── generators/          # Outils de génération
│       ├── prompts/         # Générateur de prompts intelligents
│       ├── ui-components/   # Générateurs UI/UX
│       └── templates/       # Templates de skills
│
├── 🚀 projects/              # Vos projets de développement
├── 🔧 templates/             # Templates de démarrage projet
│   ├── web-app/
│   ├── api/
│   ├── mobile/
│   └── data-science/
│
├── 📖 docs/                  # Documentation
│   ├── guides/              # Guides d'utilisation
│   ├── best-practices/      # Meilleures pratiques
│   └── references/          # Références techniques
│
├── 🛠️ .claude/               # Configuration Claude Code
│   ├── settings.local.json
│   ├── commands/            # Slash commands personnalisés
│   └── hooks/               # Hooks personnalisés
│
├── CLAUDE.md                # Guide pour Claude Code
├── README.md                # Ce fichier
└── lien.md                  # Liens sources originaux
```

---

## ⚡ Démarrage Rapide

### 1. Cloner le Repository

```bash
git clone <votre-repo-url> PersoDev
cd PersoDev
```

### 2. Mettre à Jour les Ressources Sources

```bash
cd resources/skills && git pull && cd ../..
cd resources/awesome-subagents && git pull && cd ../..
cd resources/planning-system && git pull && cd ../..
cd resources/prompt-generator && git pull && cd ../..
cd resources/ui-ux-tools && git pull && cd ../..
cd resources/superpowers && git pull && cd ../..
```

### 3. Utiliser avec Claude Code

Ouvrez ce répertoire dans Claude Code et référencez les ressources dans vos prompts :

```
Utilise le skill PDF de library/skills/documents/pdf pour extraire
les champs de formulaire de mon document.
```

---

## 📚 Bibliothèque

### Skills

#### 📄 Documents (`library/skills/documents/`)
- **docx** - Création et édition de documents Word
- **pdf** - Manipulation et extraction de PDFs
- **pptx** - Génération de présentations PowerPoint
- **xlsx** - Création et analyse de fichiers Excel

#### 🎨 Design (`library/skills/design/`)
- **algorithmic-art** - Art génératif et algorithmes créatifs
- **canvas-design** - Design de canvas et visualisations
- **frontend-design** - Design d'interfaces frontend
- **theme-factory** - Création de thèmes et systèmes de design

#### 💻 Development (`library/skills/development/`)
- **mcp-builder** - Construction de serveurs MCP
- **webapp-testing** - Testing d'applications web
- **web-artifacts-builder** - Construction d'artifacts web
- **claude-api** - Intégration API Claude
- **skill-creator** - Création de nouveaux skills

#### 💬 Communication (`library/skills/communication/`)
- **internal-comms** - Communications internes
- **slack-gif-creator** - Création de GIFs pour Slack
- **brand-guidelines** - Application de guidelines de marque
- **doc-coauthoring** - Co-rédaction de documents

### Subagents

#### 🔤 Languages (`library/subagents/languages/`)
Spécialistes par langage : Python, JavaScript, TypeScript, Go, Rust, etc.

#### 🏗️ Infrastructure (`library/subagents/infrastructure/`)
DevOps, Docker, Kubernetes, Cloud (AWS, GCP, Azure), Terraform, etc.

#### ✅ Testing & Quality (`library/subagents/testing/`)
QA, Security, Testing automatisé, Audit de code, etc.

#### 📊 Data & AI (`library/subagents/data-ai/`)
Data Science, Machine Learning, AI, Analytics, etc.

#### 🔄 Workflows (`library/subagents/workflows/`)
Orchestration, CI/CD, Automation, etc.

### Workflows

#### 📋 Planning (`library/workflows/planning/`)
- **manus-style** - Système de planification Manus (Meta, $2B)
- **brainstorming** - Techniques de brainstorming
- **executing-plans** - Exécution de plans
- **writing-plans** - Rédaction de plans

#### 🌿 Git Strategies (`library/workflows/git-strategies/`)
- **finishing-a-development-branch** - Finalisation de branches
- **using-git-worktrees** - Utilisation de git worktrees

#### 👀 Code Review (`library/workflows/code-review/`)
- **receiving-code-review** - Recevoir des reviews
- **requesting-code-review** - Demander des reviews

#### 🐛 Debugging (`library/workflows/debugging/`)
- **systematic-debugging** - Debugging systématique
- **test-driven-development** - TDD

### Générateurs

#### 🤖 Prompts (`library/generators/prompts/`)
- **intelligent-generator** - Générateur intelligent de prompts avec framework YAML

#### 🎨 UI Components (`library/generators/ui-components/`)
- **ui-ux-pro** - Outils professionnels UI/UX avec CLI

#### 📝 Templates (`library/generators/templates/`)
- **skill-templates** - Templates pour créer des skills

---

## 🔗 Ressources Sources

Les 6 dépôts sources dans [`resources/`](resources/) :

| Dépôt | Description | Stars |
|-------|-------------|-------|
| [anthropics/skills](https://github.com/anthropics/skills) | Skills officiels Anthropic pour Claude | ⭐ Official |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | Collection de 127+ subagents | ⭐ 127+ agents |
| [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files) | Système planning Manus-style | ⭐ 96.7% pass rate |
| [huangserva/skill-prompt-generator](https://github.com/huangserva/skill-prompt-generator) | Générateur intelligent de prompts | ⭐ AI-powered |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Skills UI/UX professionnels | ⭐ Pro tools |
| [obra/superpowers](https://github.com/obra/superpowers) | Workflows de développement avancés | ⭐ Advanced |

### Mise à Jour des Sources

Pour mettre à jour une ressource source :

```bash
cd resources/<nom-du-depot>
git pull origin main
cd ../..
```

Ensuite, re-copiez le contenu pertinent vers `library/` si nécessaire.

---

## 📖 Guide d'Utilisation

### Avec Claude Code

#### 1. Utiliser un Skill

```
@claude Utilise le skill DOCX pour créer un rapport avec les données
de mon fichier data.json
```

#### 2. Utiliser un Subagent

```
@claude Active le subagent Python expert pour optimiser mon code
dans analysis.py
```

#### 3. Appliquer un Workflow

```
@claude Applique le workflow de planning Manus pour structurer
mon projet de marketplace
```

#### 4. Utiliser un Générateur

```
@claude Utilise le générateur de prompts intelligent pour créer
un skill de génération de documentation API
```

### Structure de Vos Projets

Créez vos projets dans [`projects/`](projects/) :

```bash
mkdir projects/mon-app-web
cd projects/mon-app-web
# Développez votre projet ici
```

Avantages :
- Accès facile aux skills et workflows depuis `../../library/`
- Séparation claire entre ressources et projets
- Git indépendant pour chaque projet

### Créer un Nouveau Projet depuis un Template

```bash
cp -r templates/web-app projects/mon-nouveau-projet
cd projects/mon-nouveau-projet
```

---

## 🤝 Contribution

### Ajouter une Nouvelle Ressource

1. Clonez le nouveau dépôt dans `resources/`
2. Organisez le contenu pertinent dans `library/`
3. Mettez à jour ce README
4. Mettez à jour [CLAUDE.md](CLAUDE.md)

### Créer un Template de Projet

1. Créez la structure dans `templates/`
2. Documentez l'utilisation
3. Ajoutez un README dans le template

### Améliorer la Documentation

Les contributions à la documentation sont toujours bienvenues dans [`docs/`](docs/) !

---

## 📄 Licence

Ce projet agrège plusieurs ressources open source. Voir les licences individuelles dans chaque dépôt source :

- **skills** : Apache 2.0 / Source-available
- **awesome-claude-code-subagents** : Vérifier le dépôt
- **planning-with-files** : Vérifier le dépôt
- **prompt-generator** : Vérifier le dépôt
- **ui-ux-tools** : Vérifier le dépôt
- **superpowers** : Vérifier le dépôt

---

## 🔗 Liens Utiles

- [Documentation Claude Code](https://docs.claude.com/claude-code)
- [Agent Skills Spec](http://agentskills.io)
- [Claude API](https://docs.anthropic.com/claude/reference)
- [Support Claude](https://support.claude.com)

---

**Fait avec ❤️ pour maximiser la productivité avec Claude Code**
