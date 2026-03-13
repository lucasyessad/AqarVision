# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

**PersoDev** is a personal development workspace that centralizes Claude Code resources (skills, subagents, workflows, generators) and hosts development projects. It serves as both a curated reference library and a foundation for project development.

## Architecture

The repository follows a **dual-structure approach**:

- **`resources/`** — Upstream git repositories (read-only, update via `git pull`). Never modify files here directly.
- **`library/`** — Curated copies organized by use case. All customizations go here.
- **`projects/`** — Independent development projects, each with its own stack and dependencies.
- **`templates/`** — Starter templates (web-app, api, mobile, data-science) + `clone-template.sh` supporting nextjs, saas, fastapi, react-native, and more.
- **`scripts/`** — Automation scripts for maintenance.
- **`docs/`** — Guides (`quick-start.md`, `maintenance.md`), best practices, and references.

## Key Commands

```bash
# Update all source repositories in resources/
./scripts/update-all.sh

# Verify project integrity (structure, broken links, counts)
./scripts/verify.sh

# Create a timestamped backup (keeps last 5)
./scripts/backup.sh

# Safely commit from dev branch to main (7-step workflow)
./scripts/commit-to-main.sh

# Clone a project template (nextjs, saas, saas-nextjs, api-node, api-fastapi, mobile, ds)
./templates/clone-template.sh <type> <project-name>
```

There is **no global build system, test runner, or linter**. Each project in `projects/` manages its own toolchain independently.

## Library Organization

Resources in `library/` are organized into four top-level categories:

### Skills (`library/skills/`) — 20+ skills, each with a `SKILL.md`

| Domain | Path | Contents |
|--------|------|----------|
| Documents | `skills/documents/` | pdf, docx, pptx, xlsx |
| Design | `skills/design/` | algorithmic-art, canvas-design, frontend-design, frontend-design-plugin, theme-factory |
| Development | `skills/development/` | mcp-builder, webapp-testing, web-artifacts-builder, claude-api, skill-creator, claude-mem, context7 |
| Communication | `skills/communication/` | brand-guidelines, doc-coauthoring, internal-comms, slack-gif-creator |

### Subagents (`library/subagents/`) — 80+ specialist agents

| Domain | Path | Examples |
|--------|------|----------|
| Languages | `subagents/languages/` | Python, JavaScript, TypeScript, Go, Rust, React, Next.js, Django, etc. (22 specialists) |
| Infrastructure | `subagents/infrastructure/` | Docker, Kubernetes, AWS/Azure/GCP, Terraform, SRE, etc. (17 specialists) |
| Testing | `subagents/testing/` | QA, Security Auditor, Penetration Tester, Code Reviewer, etc. (15 specialists) |
| Data & AI | `subagents/data-ai/` | Data Scientist, ML Engineer, NLP, LLM Architect, etc. (14 specialists) |
| Workflows | `subagents/workflows/` | Multi-Agent Coordinator, Task Distributor, Orchestrator, etc. (10 specialists) |

### Workflows (`library/workflows/`) — 10 categories

- **`planning/`** — manus-style, brainstorming, executing-plans, writing-plans
- **`git-strategies/`** — finishing-a-development-branch, using-git-worktrees
- **`code-review/`** — automated, receiving, requesting
- **`debugging/`** — systematic-debugging, test-driven-development
- **`autonomous-development/`** — Full framework with docs, examples, tests, and lib code
- **`subagent-driven-development/`** — SKILL-based workflow with prompt files
- **`dispatching-parallel-agents/`**, **`verification-before-completion/`**, **`writing-skills/`**, **`using-superpowers/`**

### Generators (`library/generators/`)

- **`prompts/intelligent-generator/`** — AI-powered prompt generation framework
- **`ui-components/ui-ux-pro/`** — Professional UI/UX generation tools
- **`templates/skill-templates/`** — Templates for creating new skills

## Source Repositories (`resources/`)

11 read-only upstream repos including:
- `skills/` — Official Anthropic skills (Apache 2.0)
- `awesome-subagents/` — 127+ subagent collection
- `planning-system/` — Manus-style planning
- `prompt-generator/`, `ui-ux-tools/`, `superpowers/`, `claude-code-plugins/`, `claude-mem/`, `context7/`, `ralph-claude-code/`

## How to Reference Resources

Always use the full path when referencing a resource:
```
Use the PDF skill from library/skills/documents/pdf
Apply the Manus-style planning workflow from library/workflows/planning/manus-style
Activate the Python specialist subagent from library/subagents/languages/python
```

## MCP Configuration

- Root `.mcp.json` configures Supabase MCP server (`nctldmovlutbwxjzbuoh`).
- `.claude/settings.local.json` enables Supabase and all project-specific MCP servers.
- Individual projects may have their own `.mcp.json`.

## Git Workflow

- **`main`** branch is the primary branch.
- **`dev`** branch is used for development work.
- `scripts/commit-to-main.sh` handles the dev-to-main merge workflow with integrity verification.
- Commits include a Claude Code co-author signature.

## Important Conventions

- **`resources/` is read-only** — always modify the `library/` copy, never the source repo directly.
- **Projects are independent** — each project in `projects/` has its own stack, dependencies, and potentially its own git repository. Reference library resources via relative paths (`../../library/...`).
- **Language** — The user works primarily in French. Documentation mixes French and English.
