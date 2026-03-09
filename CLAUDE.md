# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

**PersoDev** is a comprehensive personal development workspace that centralizes and organizes the best Claude Code resources including skills, subagents, workflows, and generators. This repository serves as both a reference library and a foundation for future development projects.

## Architecture Overview

The repository follows a **dual-structure approach**:

1. **`resources/`** - Source repositories (git-managed, read-only)
2. **`library/`** - Organized resources for daily development use

This separation allows easy updates from upstream sources while maintaining a stable, curated library for development.

## Directory Structure

```
PersoDev/
├── resources/              # Source repositories (update via git pull)
│   ├── skills/            # Anthropic official skills
│   ├── awesome-subagents/ # 127+ community subagents
│   ├── planning-system/   # Manus-style planning system
│   ├── prompt-generator/  # Intelligent prompt generator
│   ├── ui-ux-tools/      # Professional UI/UX tools
│   └── superpowers/      # Advanced development workflows
│
├── library/               # Curated resources organized by use case
│   ├── skills/           # Specialized task instructions
│   ├── subagents/        # Domain-specific AI assistants
│   ├── workflows/        # Development methodologies
│   └── generators/       # Creation tools
│
├── projects/             # User development projects
├── templates/            # Project starter templates
├── docs/                 # Consolidated documentation
└── .claude/              # Claude Code configuration
```

## Working with Resources

### Skills (`library/skills/`)

Skills are organized by category:

- **documents/** - Document manipulation (PDF, DOCX, PPTX, XLSX)
- **design/** - Creative and design tasks (algorithmic-art, canvas-design, frontend-design, theme-factory)
- **development/** - Technical development (mcp-builder, webapp-testing, web-artifacts-builder, claude-api, skill-creator)
- **communication/** - Communication tools (internal-comms, slack-gif-creator, brand-guidelines, doc-coauthoring)

**Usage example:**
```
Use the PDF skill from library/skills/documents/pdf to extract form fields
```

### Subagents (`library/subagents/`)

Specialized AI assistants organized by domain:

- **languages/** - Language-specific specialists (Python, JavaScript, TypeScript, etc.)
- **infrastructure/** - DevOps, Cloud, Docker, Kubernetes
- **testing/** - QA, Security, Testing automation
- **data-ai/** - Data Science, ML, AI
- **workflows/** - Orchestration, CI/CD

**Usage example:**
```
Activate the Python specialist subagent to optimize the data processing pipeline
```

### Workflows (`library/workflows/`)

Proven development methodologies:

- **planning/** - Planning systems (manus-style, brainstorming, executing-plans, writing-plans)
- **git-strategies/** - Git workflows (finishing-a-development-branch, using-git-worktrees)
- **code-review/** - Review processes (receiving-code-review, requesting-code-review)
- **debugging/** - Debug methodologies (systematic-debugging, test-driven-development)

**Usage example:**
```
Apply the Manus-style planning workflow from library/workflows/planning/manus-style
to structure the new marketplace project
```

### Generators (`library/generators/`)

Tools for creating prompts, UI, and templates:

- **prompts/intelligent-generator** - AI-powered prompt generation with YAML framework
- **ui-components/ui-ux-pro** - Professional UI/UX generation with CLI
- **templates/skill-templates** - Templates for creating new skills

**Usage example:**
```
Use the intelligent prompt generator to create a skill for API documentation generation
```

## Development Workflow

### Starting a New Project

1. **Choose a template** from `templates/` or start fresh
2. **Create project directory** in `projects/`
3. **Reference library resources** as needed (../../library/...)
4. **Apply workflows** from library/workflows/

### Active Projects

Current projects in development:

- **aqarvision/** - Plateforme SaaS immobilière multi-agences pour le marché algérien
  - Stack: Next.js 14, TypeScript, Supabase, Tailwind CSS, shadcn/ui
  - Features: Dashboard agence, mini-sites vitrines, gestion leads, analytics
  - Status: En développement actif (v0.1.0)
  - Docs: [projects/aqarvision/README.md](projects/aqarvision/README.md)

- **tabibpro/** - Logiciel de gestion médicale avec IA diagnostique (Édition Algérie)
  - Stack: NestJS 11, Next.js 15, Prisma, PostgreSQL, Electron, Expo
  - Features: Dossiers patients, IA médicale (diagnostic, darija), mode offline, multilingue (FR/AR/BER/EN)
  - Architecture: Monorepo Turborepo (5 apps: API, Web, Desktop, Mobile, Patient Portal)
  - Status: En développement (v1.0.0)
  - Docs: [projects/tabibpro/README.md](projects/tabibpro/README.md)

- **thermoai/** - Plateforme d'audit énergétique et conformité RE2020/DPE
  - Stack: FastAPI (Python), Next.js, SQLAlchemy, PostgreSQL, scikit-learn
  - Features: Audit énergétique automatisé, ML prédictions, simulation rénovation, rapports PDF
  - Architecture: Backend Python + Frontend Next.js
  - Status: En développement (v1.0.0)
  - Docs: [projects/thermoai/README.md](projects/thermoai/README.md)

- **patrimoine-360/** - Plateforme de gestion patrimoniale personnelle avec IA (Web + Mobile)
  - Stack: Next.js 14 + Expo 55, TypeScript, Supabase, Anthropic Claude
  - Features: 7 modules patrimoniaux, calcul scores, copilote IA, exports PDF/Excel
  - Architecture: Mono-repo (web Next.js + mobile React Native)
  - Status: En développement (v1.0.0)
  - Docs: [projects/patrimoine-360/README.md](projects/patrimoine-360/README.md) | [Mobile](projects/patrimoine-360/mobile/README.md)

### Updating Resources

To update source repositories:

```bash
cd resources/<repo-name>
git pull origin main
cd ../..
# Copy relevant updates to library/ if needed
```

### Project Organization

- Keep individual projects in `projects/` with independent git repositories
- Reference skills and workflows from `library/` using relative paths
- Document project-specific configurations in project README

## Key Resources

### Source Repositories

All source repositories are maintained in `resources/`:

1. **skills** - [anthropics/skills](https://github.com/anthropics/skills) - Official Anthropic skills (Apache 2.0 / Source-available)
2. **awesome-subagents** - [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) - 127+ community subagents
3. **planning-system** - [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files) - Manus-style planning (96.7% pass rate)
4. **prompt-generator** - [huangserva/skill-prompt-generator](https://github.com/huangserva/skill-prompt-generator) - Intelligent prompt generation
5. **ui-ux-tools** - [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) - Professional UI/UX tools
6. **superpowers** - [obra/superpowers](https://github.com/obra/superpowers) - Advanced development workflows

### Documentation

- **README.md** - Comprehensive project documentation with usage guides
- **lien.md** - Original source links
- **docs/** - Extended documentation, guides, and best practices

## Best Practices

### When Using Skills

- Always specify the full path to the skill (e.g., `library/skills/documents/pdf`)
- Review skill documentation before use (most have SKILL.md files)
- Combine multiple skills for complex tasks

### When Using Subagents

- Activate domain-specific subagents for specialized tasks
- Use language specialists for code optimization in specific languages
- Leverage infrastructure subagents for DevOps tasks

### When Applying Workflows

- Read workflow documentation in the respective directories
- Adapt workflows to project needs
- Document customizations in project README

### Resource Management

- Keep `resources/` as read-only git repositories
- Make customizations in `library/` or project-specific directories
- Update sources regularly but test before deploying to projects
- Document any modifications to library resources

## Common Tasks

### Create a New Skill

```
Use the skill-creator from library/skills/development/skill-creator
or use templates from library/generators/templates/skill-templates
```

### Generate Intelligent Prompts

```
Use library/generators/prompts/intelligent-generator with the YAML framework
```

### Set Up Planning System

```
Apply library/workflows/planning/manus-style for enterprise-grade planning
```

### Build MCP Server

```
Use library/skills/development/mcp-builder
```

## Maintenance

### Regular Updates

1. Pull latest changes from source repositories in `resources/`
2. Review changelogs and release notes
3. Test updates in isolated environment
4. Copy stable updates to `library/` as needed
5. Update project documentation

### Cleanup

- Remove unused resources from `library/` to reduce clutter
- Archive old projects in `projects/`
- Keep documentation synchronized with current structure

## Additional Notes

- This workspace has no global build system - each project in `projects/` manages its own dependencies
- Claude Code configuration is in `.claude/` - customize commands and hooks as needed
- Templates in `templates/` provide quick starts for common project types
- All source repositories maintain their own licenses - check individual repos for details
