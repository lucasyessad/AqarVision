# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

**PersoDev** is a personal development workspace that centralizes Claude Code resources (skills, subagents, workflows, generators) and hosts development projects. It serves as both a curated reference library and a foundation for project development.

## Architecture

The repository follows a **dual-structure approach**:

- **`resources/`** — Upstream git repositories (read-only, update via `git pull`). Never modify files here directly.
- **`library/`** — Curated copies organized by use case. Customizations go here, not in `resources/`.
- **`projects/`** — Independent development projects, each with its own dependencies and git repo.
- **`templates/`** — Starter templates (web-app, api, mobile, data-science).
- **`scripts/`** — Automation scripts for maintenance.

## Key Commands

```bash
# Update all source repositories at once
./scripts/update-all.sh

# Verify project integrity (checks structure, broken links, etc.)
./scripts/verify.sh

# Create a backup of library, projects, templates, docs
./scripts/backup.sh

# Safely commit changes to main
./scripts/commit-to-main.sh

# Clone a project template
./templates/clone-template.sh
```

There is **no global build system, test runner, or linter**. Each project in `projects/` manages its own toolchain independently.

## Library Organization

Resources in `library/` are organized into four top-level categories:

- **`skills/`** — Task-specific instructions, organized by domain: `documents/`, `design/`, `development/`, `communication/`. Most skills have a `SKILL.md` file with usage docs.
- **`subagents/`** — Domain-specific AI assistant prompts: `languages/`, `infrastructure/`, `testing/`, `data-ai/`, `workflows/`.
- **`workflows/`** — Development methodologies: `planning/`, `git-strategies/`, `code-review/`, `debugging/`, `autonomous-development/`, `subagent-driven-development/`, `dispatching-parallel-agents/`, `verification-before-completion/`, `writing-skills/`, `using-superpowers/`.
- **`generators/`** — Creation tools: `prompts/intelligent-generator`, `ui-components/ui-ux-pro`, `templates/skill-templates`.

## How to Reference Resources

Always use the full path when referencing a resource:
```
Use the PDF skill from library/skills/documents/pdf
Apply the Manus-style planning workflow from library/workflows/planning/manus-style
Activate the Python specialist subagent from library/subagents/languages/python
```

## MCP Configuration

The `.mcp.json` at the repo root configures MCP server integrations (currently Supabase). Project-specific MCP configs may exist in individual projects.

## Important Conventions

- **`resources/` is read-only** — always modify the `library/` copy, never the source repo directly.
- **Projects are independent** — each project in `projects/` has its own stack, dependencies, and potentially its own git repository. Reference library resources via relative paths (`../../library/...`).
- **Language** — The user works primarily in French. Documentation mixes French and English.
