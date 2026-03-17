# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

**AqarVision** is a personal development workspace that centralizes Claude Code resources (skills, subagents, workflows, generators) and hosts development projects. It serves as both a curated reference library and a foundation for project development.

## Architecture

The repository follows a **dual-structure approach**:

- **`resources/`** — 26 upstream git repositories (read-only, update via `./scripts/update-all.sh`). Never modify files here directly.
- **`library/`** — Curated copies organized by use case. All customizations go here, not in `resources/`.
- **`projects/`** — Independent development projects, each with its own stack and dependencies. Reference library resources via `../../library/...`.
- **`templates/`** — Starter templates + `clone-template.sh` (supports: nextjs, saas, saas-nextjs, api-node, api-fastapi, mobile, ds).
- **`scripts/`** — Automation scripts for maintenance.
- **`docs/`** — Guides (`quick-start.md`, `maintenance.md`), best practices, references.
- **`tools/`** — Utility tools (e.g., `je-extractor`).

## Key Commands

```bash
./scripts/update-all.sh                        # Update all 26 source repos in resources/
./scripts/verify.sh                            # Verify project integrity (structure, counts)
./scripts/backup.sh                            # Create timestamped backup (keeps last 5)
./scripts/commit-to-main.sh                    # Safely commit from dev → master (7-step workflow)
./scripts/create-branch.sh                     # Create feature branches with module scaffolding
./templates/clone-template.sh <type> <name>    # Clone a project template
```

There is **no global build system, test runner, or linter**. Each project in `projects/` manages its own toolchain independently.

## Library Organization

Resources in `library/` are organized into four categories — browse each for full contents:

- **`skills/`** — Task-specific instructions organized by domain:
  - `documents/` — PDF, DOCX, PPTX, XLSX
  - `design/` — algorithmic-art, canvas-design, frontend-design, frontend-design-plugin, theme-factory
  - `development/` — claude-api, claude-mem, context7, mcp-builder, skill-creator, web-artifacts-builder, webapp-testing
  - `communication/` — brand-guidelines, doc-coauthoring, internal-comms, slack-gif-creator

- **`subagents/`** — Specialist agent prompts: `languages/`, `infrastructure/`, `testing/`, `data-ai/`, `workflows/`.

- **`workflows/`** — Development methodologies:
  - `planning/` — manus-style, brainstorming, executing-plans, writing-plans
  - `git-strategies/` — finishing-a-development-branch, using-git-worktrees
  - `code-review/` — automated-code-review, receiving-code-review, requesting-code-review
  - `debugging/` — systematic-debugging, test-driven-development
  - `autonomous-development/` — Ralph autonomous dev system
  - `subagent-driven-development/` — Multi-agent orchestration
  - `dispatching-parallel-agents/` — Parallel execution
  - `verification-before-completion/` — Quality gates
  - `using-superpowers/` — Advanced workflows
  - `writing-skills/` — Create new skills

- **`generators/`** — Creation tools: `prompts/intelligent-generator`, `ui-components/ui-ux-pro`, `templates/skill-templates`.

Always reference resources by full path:
```
Use the PDF skill from library/skills/documents/pdf
Apply the Manus-style planning workflow from library/workflows/planning/manus-style
Activate the Python specialist subagent from library/subagents/languages/python
```

## Active Projects

- **`projects/AqarVision/`** — Algerian proptech ecosystem (marketplace + agency CRM). See `projects/AqarVision/CLAUDE.md` for full stack details, architecture, and conventions.

## MCP Configuration

- Root `.mcp.json` configures Supabase MCP server.
- Individual projects may have their own `.mcp.json` (e.g., `projects/AqarVision/.mcp.json`).

## Git Workflow

- **`master`** is the primary branch.
- `scripts/commit-to-main.sh` handles the dev-to-master merge with integrity verification.

## Important Conventions

- **`resources/` is read-only** — always modify the `library/` copy.
- **Projects are independent** — each has its own stack, deps, and potentially its own git repo.
- **Library resources are mandatory** — Before developing, always check `library/` for relevant skills, subagents, and workflows. Read their SKILL.md files for methodology. Each project's CLAUDE.md lists the specific resources to use.
- **Language** — The user works primarily in French. Documentation mixes French and English.
