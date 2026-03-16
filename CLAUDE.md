# CLAUDE.md

> Last updated: 16 March 2026.
> This file is read automatically by Claude Code at every session. It is the **single source of truth** for the workspace. Read it entirely before making any changes.

---

## Repository Purpose

**PersoDev** is a personal development workspace that centralizes Claude Code resources (skills, subagents, workflows, generators) and hosts development projects. It serves as both a curated reference library and a foundation for project development.

---

## Architecture

The repository follows a **dual-structure approach** — upstream sources are kept separate from curated working copies:

```
PersoDev/
├── resources/          # 28 upstream git repos (READ-ONLY — update via git pull)
├── library/            # Curated copies organized by use case (all edits go here)
├── projects/           # Independent dev projects, each with own stack & deps
├── templates/          # Starter templates + clone-template.sh
├── scripts/            # 4 automation scripts for maintenance
├── docs/               # Guides, best practices, references, NeoAqar product docs
├── tools/              # Utility tools (je-extractor)
├── CLAUDE.md           # This file — workspace-level instructions
├── README.md           # Public-facing documentation
├── SECURITY.md         # Security policy (template)
└── .mcp.json           # Root MCP config (Supabase)
```

### Key rules

- **`resources/` is read-only** — never modify files there. Update via `git pull` or `scripts/update-all.sh`.
- **`library/` is the working copy** — all customizations, edits, and additions go here.
- **Projects are independent** — each project in `projects/` manages its own stack, dependencies, and potentially its own git repo. Reference library resources via `../../library/...`.

---

## Key Commands

```bash
./scripts/update-all.sh                        # Update all 28 upstream repos in resources/
./scripts/verify.sh                            # Verify workspace integrity (structure, counts)
./scripts/backup.sh                            # Create timestamped backup (keeps last 5)
./scripts/commit-to-main.sh                    # Safely commit from dev → main (7-step workflow)
./templates/clone-template.sh <type> <name>    # Clone a project template
```

There is **no global build system, test runner, or linter**. Each project in `projects/` manages its own toolchain independently.

### Template types (via `clone-template.sh`)

| Type | Source |
|------|--------|
| `nextjs` | Next.js Boilerplate (ixartz) |
| `saas` | Open SaaS (Wasp) |
| `saas-nextjs` | SaaS Boilerplate Next.js |
| `api-node` | Node.js Express Boilerplate |
| `api-fastapi` | FastAPI Full-Stack Template |
| `mobile` | React Native Template (Obytes) |
| `ds` | Data Science (Cookiecutter) |

---

## Library Organization

Resources in `library/` are organized into four categories with **80+ curated resources**:

### Skills (`library/skills/`) — 28 skills across 4 domains

| Domain | Path | Contents |
|--------|------|----------|
| Documents | `skills/documents/` | PDF, DOCX, PPTX, XLSX processing |
| Design | `skills/design/` | algorithmic-art, canvas-design, frontend-design, frontend-design-plugin, theme-factory |
| Development | `skills/development/` | web-artifacts-builder, mcp-builder, context7, skill-creator, webapp-testing, claude-api, claude-mem |
| Communication | `skills/communication/` | brand-guidelines, doc-coauthoring, internal-comms, slack-gif-creator |

Each skill has a `SKILL.md` — read it before using.

### Subagents (`library/subagents/`) — 80+ specialist agents across 5 domains

| Domain | Path | Count | Examples |
|--------|------|-------|----------|
| Languages | `subagents/languages/` | 27 | python, typescript, react, nextjs, django, rails, rust, golang |
| Infrastructure | `subagents/infrastructure/` | 17 | docker, kubernetes, terraform, cloud-architect, sre-engineer |
| Data & AI | `subagents/data-ai/` | 13 | data-scientist, ai-engineer, llm-architect, postgres-pro |
| Testing | `subagents/testing/` | 15 | qa-expert, code-reviewer, penetration-tester, chaos-engineer |
| Workflows | `subagents/workflows/` | 8 | multi-agent-coordinator, workflow-orchestrator, knowledge-synthesizer |

### Workflows (`library/workflows/`) — 10 methodology categories

| Category | Path | Contents |
|----------|------|----------|
| Planning | `workflows/planning/` | brainstorming, executing-plans, writing-plans |
| Git Strategies | `workflows/git-strategies/` | using-git-worktrees, finishing-a-development-branch |
| Code Review | `workflows/code-review/` | automated, requesting-code-review, receiving-code-review |
| Debugging | `workflows/debugging/` | systematic-debugging, test-driven-development |
| Autonomous Dev | `workflows/autonomous-development/` | Ralph framework with examples |
| SDD | `workflows/subagent-driven-development/` | Spec/implementation/quality prompts |
| Parallel Agents | `workflows/dispatching-parallel-agents/` | Agent orchestration patterns |
| Superpowers | `workflows/using-superpowers/` | Advanced workflow skill |
| Verification | `workflows/verification-before-completion/` | Completion verification |
| Writing Skills | `workflows/writing-skills/` | Skill authoring best practices |

### Generators (`library/generators/`) — 3 categories

- **`generators/prompts/intelligent-generator`** — AI-powered prompt generation framework
- **`generators/ui-components/ui-ux-pro`** — Professional UI/UX generation tools + `STANDARDIZATION.md`
- **`generators/templates/skill-templates`** — Templates for creating new skills (SKILL.md + references + examples)

### How to reference resources

Always use full paths:
```
Use the PDF skill from library/skills/documents/pdf
Apply the Manus-style planning workflow from library/workflows/planning/
Activate the Python specialist subagent from library/subagents/languages/python
```

---

## Upstream Resources (`resources/`)

28 read-only git repositories, updated via `./scripts/update-all.sh`:

**Core Claude Code resources:** anthropics-skills, skills, awesome-subagents, voltagent-subagents, awesome-claude-code, claude-code-plugins, prompt-generator, skill-prompt-generator, planning-system, planning-with-files, superpowers, obra-superpowers, ralph-claude-code, context7, claude-mem, ui-ux-pro-max-skill, ui-ux-tools.

**Framework & template repos:** vercel-nextjs, nextjs-subscription-payments, saas-starter-kit, shadcn-ui, calcom, sharetribe, supabase-repo.

**Domain-specific:** microrealestate, postgis-repo.

---

## Active Projects

### AqarVision (`projects/AqarVision/`)

Algerian proptech ecosystem — marketplace (AqarSearch) + agency CRM (AqarPro) + individual space (AqarChaab) + marketing pages.

**Full details in `projects/AqarVision/CLAUDE.md`** (313 lines — the definitive project reference).

Quick summary:

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 App Router + Server Actions |
| Language | TypeScript strict (no `any`) |
| UI | Tailwind CSS (raw, no shadcn/ui) + Lucide React |
| Backend | Supabase (Auth SSR + Postgres + RLS + Storage + Edge Functions) |
| Database | PostgreSQL 15+ with PostGIS, 44 migrations |
| Payments | Stripe (Checkout + Portal + Webhooks via Edge Function) |
| Maps | MapLibre GL JS + OpenStreetMap |
| Validation | Zod |
| i18n | next-intl (fr, ar, en, es) with RTL |
| Monorepo | Turborepo + pnpm workspaces |
| Hosting | Vercel (web) + Supabase Cloud |
| Tests | Vitest (unit) + Playwright (E2E) |

**Project commands** (run from `projects/AqarVision/`):
```bash
pnpm install        # Install deps
pnpm dev            # Dev server (port 3000)
pnpm build          # Production build via Turbo
pnpm lint           # Lint
pnpm typecheck      # TypeScript check
pnpm test           # Vitest
pnpm test:e2e       # Playwright (needs build)
```

**Key project docs:**
- `projects/AqarVision/CLAUDE.md` — Architecture, patterns, rules, debt, execution plan
- `projects/AqarVision/aqarvision-zinc-design-system.md` — Full design system spec (2981 lines)
- `projects/AqarVision/ARCHITECTURE-PATTERNS.md` — Architecture patterns reference
- `projects/AqarVision/AUDIT-COMPLET-AQARVISION.md` — Complete audit report

---

## Documentation (`docs/`)

| Path | Purpose |
|------|---------|
| `docs/guides/quick-start.md` | 5-minute getting started |
| `docs/guides/maintenance.md` | Maintenance procedures |
| `docs/best-practices/resource-management.md` | Resource management guide |
| `docs/references/quick-reference.md` | Quick reference card |
| `docs/NeoAqar/` | 30+ product strategy & vision documents (roadmaps, architecture, blueprints) |

---

## MCP Configuration

- **Root** `.mcp.json` — Supabase MCP server (project ref: `nctldmovlutbwxjzbuoh`)
- **Project** `projects/AqarVision/.mcp.json` — Supabase MCP server (project ref: `tntiakqdvetdhdfzbzsn`)
- `.claude/settings.local.json` enables Supabase and all project-specific MCP servers.

---

## Git Workflow

- **`master`** is the primary branch; **`dev`** is for development.
- `scripts/commit-to-main.sh` handles the dev-to-main merge with integrity verification (7-step workflow with signed commits).
- Feature branches use the pattern `claude/<description>-<id>`.

---

## Tools (`tools/`)

- **`je-extractor/`** — Node.js utility for extracting JavaScript/JSON data from APIs. Contains `extract.js`, `api-capture.js`, and an `output/` results directory.

---

## Important Conventions

1. **`resources/` is read-only** — always modify the `library/` copy.
2. **Projects are independent** — each has its own stack, deps, and potentially its own git repo.
3. **Library resources are mandatory** — before developing, always check `library/` for relevant skills, subagents, and workflows. Read their SKILL.md files for methodology. Each project's CLAUDE.md lists the specific resources to use.
4. **Language** — the user works primarily in French. Documentation mixes French and English.
5. **No global toolchain** — there is no root-level build, test, or lint command. Each project manages its own.
6. **Reference by full path** — when citing library resources, always use the full relative path from the workspace root.
