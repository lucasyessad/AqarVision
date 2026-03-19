# AqarVision - Personal Development Workspace

> Espace de developpement personnel optimise avec Claude Code - Collection complete de skills, subagents et workflows pour maximiser la productivite.

[![Claude Code](https://img.shields.io/badge/Claude-Code-blue)](https://claude.ai/code)
[![Resources](https://img.shields.io/badge/Resources-26_repos-green)](#-ressources-sources)
[![Skills](https://img.shields.io/badge/Skills-20+-orange)](#skills)
[![Subagents](https://img.shields.io/badge/Subagents-127+-purple)](#subagents)

---

## Table des Matieres

- [Vue d'ensemble](#-vue-densemble)
- [Structure du Projet](#-structure-du-projet)
- [Demarrage Rapide](#-demarrage-rapide)
- [Bibliotheque](#-bibliotheque)
- [Ressources Sources](#-ressources-sources)
- [Guide d'Utilisation](#-guide-dutilisation)
- [Contribution](#-contribution)

---

## Vue d'ensemble

**AqarVision** est un workspace structure qui centralise et organise les meilleures ressources pour le developpement avec Claude Code :

- **Skills** : Instructions specialisees pour des taches repetables
- **Subagents** : Assistants IA specialises par domaine technique
- **Workflows** : Methodologies de developpement eprouvees
- **Generateurs** : Outils pour creer prompts, UI et templates

---

## Structure du Projet

```
AqarVision/
├── resources/              # 26 depots sources (lecture seule - git pull pour maj)
├── library/                # Bibliotheque organisee pour usage quotidien
│   ├── skills/             # Skills par categorie
│   │   ├── documents/      # PDF, DOCX, PPTX, XLSX
│   │   ├── design/         # Art algorithmique, Canvas, Frontend, Themes
│   │   ├── development/    # Claude API, MCP, Testing, Web artifacts, etc.
│   │   └── communication/  # Comms internes, Slack, Branding
│   ├── subagents/          # Subagents par domaine
│   │   ├── languages/      # Python, JavaScript, TypeScript, etc.
│   │   ├── infrastructure/ # Docker, Kubernetes, Cloud
│   │   ├── testing/        # QA, Security, Testing
│   │   ├── data-ai/        # Data Science, ML, AI
│   │   └── workflows/      # Orchestration, CI/CD
│   ├── workflows/          # Workflows de developpement
│   │   ├── planning/       # Planification (Manus, brainstorming)
│   │   ├── git-strategies/ # Git worktrees, branching
│   │   ├── code-review/    # Processus de review
│   │   ├── debugging/      # TDD, debugging systematique
│   │   └── ...             # autonomous-dev, parallel-agents, etc.
│   └── generators/         # Outils de generation
│       ├── prompts/        # Generateur de prompts intelligents
│       ├── ui-components/  # Generateurs UI/UX
│       └── templates/      # Templates de skills
├── projects/               # Projets de developpement
│   └── AqarVision/         # Proptech algerienne (marketplace + CRM agence)
├── templates/              # Templates de demarrage projet
├── scripts/                # Scripts d'automatisation
├── docs/                   # Documentation
├── tools/                  # Outils utilitaires
├── CLAUDE.md               # Guide pour Claude Code
├── README.md               # Ce fichier
└── SECURITY.md             # Politique de securite
```

---

## Demarrage Rapide

### 1. Cloner le Repository

```bash
git clone <votre-repo-url> AqarVision
cd AqarVision
```

### 2. Mettre a Jour les Ressources Sources

```bash
./scripts/update-all.sh
```

### 3. Utiliser avec Claude Code

Ouvrez ce repertoire dans Claude Code et referencez les ressources dans vos prompts :

```
Utilise le skill PDF de library/skills/documents/pdf pour extraire
les champs de formulaire de mon document.
```

> Pour la liste complete des commandes disponibles, voir [CLAUDE.md](CLAUDE.md).

---

## Bibliotheque

### Skills

#### Documents (`library/skills/documents/`)
- **docx** - Creation et edition de documents Word
- **pdf** - Manipulation et extraction de PDFs
- **pptx** - Generation de presentations PowerPoint
- **xlsx** - Creation et analyse de fichiers Excel

#### Design (`library/skills/design/`)
- **algorithmic-art** - Art generatif et algorithmes creatifs
- **canvas-design** - Design de canvas et visualisations
- **frontend-design** - Design d'interfaces frontend
- **frontend-design-plugin** - Plugin Claude pour frontend design
- **theme-factory** - Creation de themes et systemes de design

#### Development (`library/skills/development/`)
- **claude-api** - Integration API Claude (multi-langages)
- **claude-mem** - Systeme de gestion memoire Claude
- **context7** - Framework de gestion de contexte
- **mcp-builder** - Construction de serveurs MCP
- **skill-creator** - Creation de nouveaux skills
- **web-artifacts-builder** - Construction d'artifacts web
- **webapp-testing** - Testing d'applications web

#### Communication (`library/skills/communication/`)
- **brand-guidelines** - Application de guidelines de marque
- **doc-coauthoring** - Co-redaction de documents
- **internal-comms** - Communications internes
- **slack-gif-creator** - Creation de GIFs pour Slack

### Subagents

#### Languages (`library/subagents/languages/`)
Specialistes par langage : Python, JavaScript, TypeScript, Go, Rust, etc.

#### Infrastructure (`library/subagents/infrastructure/`)
DevOps, Docker, Kubernetes, Cloud (AWS, GCP, Azure), Terraform, etc.

#### Testing & Quality (`library/subagents/testing/`)
QA, Security, Testing automatise, Audit de code, etc.

#### Data & AI (`library/subagents/data-ai/`)
Data Science, Machine Learning, AI, Analytics, etc.

#### Workflows (`library/subagents/workflows/`)
Orchestration, CI/CD, Automation, etc.

### Workflows

#### Planning (`library/workflows/planning/`)
- **manus-style** - Systeme de planification Manus
- **brainstorming** - Techniques de brainstorming
- **executing-plans** - Execution de plans
- **writing-plans** - Redaction de plans

#### Git Strategies (`library/workflows/git-strategies/`)
- **finishing-a-development-branch** - Finalisation de branches
- **using-git-worktrees** - Utilisation de git worktrees

#### Code Review (`library/workflows/code-review/`)
- **automated-code-review** - Review automatisee
- **receiving-code-review** - Recevoir des reviews
- **requesting-code-review** - Demander des reviews

#### Debugging (`library/workflows/debugging/`)
- **systematic-debugging** - Debugging systematique
- **test-driven-development** - TDD

#### Autres workflows
- **autonomous-development/** - Systeme de dev autonome Ralph
- **subagent-driven-development/** - Orchestration multi-agents
- **dispatching-parallel-agents/** - Execution parallele
- **verification-before-completion/** - Quality gates
- **using-superpowers/** - Workflows avances
- **writing-skills/** - Creation de nouveaux skills

### Generateurs

#### Prompts (`library/generators/prompts/`)
- **intelligent-generator** - Generateur intelligent de prompts avec framework YAML

#### UI Components (`library/generators/ui-components/`)
- **ui-ux-pro** - Outils professionnels UI/UX avec CLI

#### Templates (`library/generators/templates/`)
- **skill-templates** - Templates pour creer des skills

---

## Ressources Sources

Les 26 depots sources dans [`resources/`](resources/) :

| Depot | Description |
|-------|-------------|
| [anthropics-skills](resources/anthropics-skills) | Skills officiels Anthropic pour Claude |
| [awesome-claude-code](resources/awesome-claude-code) | Collection d'outils Claude Code |
| [awesome-subagents](resources/awesome-subagents) | Collection de 127+ subagents |
| [calcom](resources/calcom) | Integration calendrier Cal.com |
| [claude-code-plugins](resources/claude-code-plugins) | Plugins Claude Code |
| [claude-mem](resources/claude-mem) | Outil de gestion memoire Claude |
| [context7](resources/context7) | Framework de gestion de contexte |
| [microrealestate](resources/microrealestate) | Projet immobilier de reference |
| [nextjs-subscription-payments](resources/nextjs-subscription-payments) | Template Next.js + Stripe |
| [obra-superpowers](resources/obra-superpowers) | Superpowers de developpement Obra |
| [planning-system](resources/planning-system) | Systeme de planning Manus-style |
| [planning-with-files](resources/planning-with-files) | Planning avec contexte fichiers |
| [postgis-repo](resources/postgis-repo) | Documentation PostGIS |
| [prompt-generator](resources/prompt-generator) | Generation de prompts |
| [ralph-claude-code](resources/ralph-claude-code) | Developpement autonome Ralph |
| [saas-starter-kit](resources/saas-starter-kit) | Boilerplate SaaS |
| [shadcn-ui](resources/shadcn-ui) | Librairie de composants Shadcn UI |
| [sharetribe](resources/sharetribe) | Plateforme marketplace de reference |
| [skill-prompt-generator](resources/skill-prompt-generator) | Generateur de skills |
| [skills](resources/skills) | Repo core skills Anthropic |
| [supabase-repo](resources/supabase-repo) | Documentation Supabase |
| [superpowers](resources/superpowers) | Workflows de developpement avances |
| [ui-ux-pro-max-skill](resources/ui-ux-pro-max-skill) | Skills UI/UX professionnels |
| [ui-ux-tools](resources/ui-ux-tools) | Outils de design UI/UX |
| [vercel-nextjs](resources/vercel-nextjs) | Deploiement Vercel Next.js |
| [voltagent-subagents](resources/voltagent-subagents) | Collection subagents VoltAgent |

---

## Guide d'Utilisation

### Avec Claude Code

#### 1. Utiliser un Skill

```
Utilise le skill DOCX pour creer un rapport avec les donnees
de mon fichier data.json
```

#### 2. Utiliser un Subagent

```
Active le subagent Python expert pour optimiser mon code
dans analysis.py
```

#### 3. Appliquer un Workflow

```
Applique le workflow de planning Manus pour structurer
mon projet de marketplace
```

#### 4. Utiliser un Generateur

```
Utilise le generateur de prompts intelligent pour creer
un skill de generation de documentation API
```

### Creer un Nouveau Projet

```bash
# Depuis un template
./templates/clone-template.sh <type> <nom-projet>

# Types disponibles : nextjs, saas, saas-nextjs, api-node, api-fastapi, mobile, ds

# Ou manuellement
mkdir projects/mon-app && cd projects/mon-app
```

---

## Contribution

### Ajouter une Nouvelle Ressource

1. Clonez le nouveau depot dans `resources/`
2. Organisez le contenu pertinent dans `library/`
3. Mettez a jour ce README et [CLAUDE.md](CLAUDE.md)

### Ameliorer la Documentation

Les contributions a la documentation sont bienvenues dans [`docs/`](docs/).

---

## Licence

Ce projet agrege plusieurs ressources open source. Voir les licences individuelles dans chaque depot source dans `resources/`.

---

## Liens Utiles

- [Documentation Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [Claude API](https://docs.anthropic.com/claude/reference)
