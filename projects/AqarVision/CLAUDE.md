# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

**AqarVision** is an Algerian proptech ecosystem with three surfaces:
- **AqarSearch** — Public real estate marketplace (search, map, SEO, alerts, favorites)
- **AqarPro** — Agency CRM (listing publication, leads, messaging, analytics, AI)
- **Data Layer** — Price history, domain events, analytics, future estimation

Multi-tenant (RLS-isolated per agency), hybrid SaaS + marketplace, multilingual (FR/AR/EN/ES with RTL for Arabic), targeting Algeria (58 wilayas, 1541 communes). Monetization via Stripe subscriptions (Starter/Pro/Enterprise).

## Tech Stack (Final — no alternatives)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 App Router + Server Actions |
| Language | TypeScript strict (no `any`) |
| UI | shadcn/ui + Tailwind CSS |
| Backend | Supabase (Auth SSR + Postgres + RLS + Storage + Edge Functions) |
| Database | PostgreSQL 15+ with PostGIS |
| Mobile | React Native / Expo SDK 52+ |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) |
| Maps | MapLibre GL JS + OpenStreetMap tiles |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Validation | Zod |
| i18n | next-intl |
| Monorepo | Turborepo + pnpm workspaces |
| Hosting | Vercel (web) + Supabase Cloud (DB/Auth/Storage) |
| Tests | Vitest (unit) + Playwright (E2E) + pgTAP (SQL) |
| CI/CD | GitHub Actions |

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm test             # Run all Vitest tests
pnpm test:e2e         # Run Playwright E2E tests
pnpm turbo run <task> --filter=<package>  # Run task for specific package
```

## Monorepo Structure

```
aqarvision/
├── apps/
│   ├── web/                    # Next.js App Router
│   │   ├── src/app/            # Routes
│   │   │   ├── (marketing)/    # Landing, pricing, legal
│   │   │   ├── [locale]/auth/  # Login, signup, reset
│   │   │   ├── [locale]/dashboard/  # AqarPro (gated)
│   │   │   ├── [locale]/search/     # AqarSearch
│   │   │   ├── [locale]/l/[slug]/   # Listing detail
│   │   │   ├── [locale]/a/[slug]/   # Agency profile
│   │   │   └── api/webhooks/stripe/ # Stripe callback
│   │   ├── src/features/       # Feature modules (see pattern below)
│   │   ├── src/lib/supabase/   # client.ts, server.ts, middleware.ts
│   │   ├── src/lib/i18n/       # i18n config
│   │   └── messages/           # i18n JSON (fr.json, ar.json, en.json, es.json)
│   └── mobile/                 # React Native / Expo
├── packages/
│   ├── domain/                 # Pure business logic (services, policies, types)
│   ├── database/               # Generated DB types, migrations
│   ├── ui/                     # Shared shadcn/ui components
│   ├── security/               # Guards, validation, sanitization
│   ├── analytics/              # Domain events, tracking helpers
│   ├── feature-flags/          # Flag registry + resolution
│   └── config/                 # Env validation, constants
└── supabase/
    ├── migrations/             # Numbered SQL migrations (00000–00110)
    ├── functions/              # Edge Functions (stripe-webhook)
    └── config.toml
```

## Feature Module Pattern

Every feature in `src/features/` follows this structure:

```
feature-name/
  actions/      # Server Actions (orchestration)
  components/   # React UI
  hooks/        # Custom hooks
  schemas/      # Zod validation
  services/     # Business logic coordination
  types/        # TypeScript contracts
  utils/        # Pure helpers
```

## File Naming

- Utilities: `kebab-case.ts` (e.g., `create-listing.action.ts`)
- Components: `PascalCase.tsx` (e.g., `ListingCard.tsx`)
- Mandatory suffixes: `*.service.ts`, `*.action.ts`, `*.schema.ts`, `*.types.ts`, `*.mapper.ts`, `*.policy.ts`

## Server Action Pattern

Every server action must follow this exact flow:
1. Validate input via Zod
2. Resolve current actor (auth)
3. Check permissions (policy)
4. Call domain service
5. Return sanitized output
6. Trigger revalidation if needed

Return type: `ActionResult<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } }`

## Key Architectural Decisions

- **Modular monolith** — no microservices
- **Server Actions** for all mutations; **Route Handlers** only for external callbacks (Stripe webhooks)
- **Supabase Auth SSR** via `@supabase/ssr` (cookies, never localStorage)
- **RLS deny by default** — every table requires explicit policies
- **PostGIS** for all geospatial queries (bounding box, radius, proximity)
- **Signed Upload URLs** for media (browser-direct upload, private bucket)
- **ISR/SSR** for SEO marketplace pages
- **Feature flags** in DB for premium gating
- **SCD2 pattern** for price and status versioning (temporal ranges with `btree_gist` exclusion constraints)
- **Domain events** table for audit trail and analytics aggregation

## Strict Rules

- **NEVER** call DB directly from React components
- **NEVER** put business logic in UI components
- **NEVER** use localStorage for session (cookies only via Supabase SSR)
- **NEVER** enforce roles only on frontend — always verify server-side
- **NEVER** hardcode left/right margins — use CSS logical properties for RTL (`margin-inline-start`)
- All inputs validated via Zod before processing
- All outputs typed with explicit DTOs — never expose internal columns to client

## RTL Support

- CSS logical properties everywhere (`margin-inline-start`, not `margin-left`)
- `dir="rtl"` on `<html>` when locale = `ar`
- Tailwind `rtl:` and `ltr:` classes for directional overrides
- Verify icons, arrows, badges render correctly in RTL

## Design System

| Token | Hex | Usage |
|-------|-----|-------|
| blue-night | `#1a365d` | Navigation, headers, premium surfaces, dashboard |
| gold | `#d4af37` | Accents, premium badges, secondary CTAs |
| off-white | `#f7fafc` | Main backgrounds, cards |
| gray-700 | `#2d3748` | Primary text |
| gray-400 | `#a0aec0` | Secondary text |

Typography: Inter (FR/EN/ES), Noto Sans Arabic (AR). AqarSearch = spacious layout; AqarPro = moderate density. Mobile-first everywhere.

## i18n & SEO

- All routes prefixed by `[locale]`
- i18n fallback chain: requested locale → fr → en
- Components never hardcode text
- `generateMetadata` on every dynamic page
- `hreflang` link tags for all 4 locales
- Dynamic XML sitemap, JSON-LD `RealEstateListing`, canonical URLs
- ISR for category pages (`revalidate: 3600`), SSR for listing detail

## Database Schema Overview

Migrations in `supabase/migrations/` (execute in order):
- `00000` Extensions (PostGIS, btree_gist)
- `00001` Enums (user_role, agency_role, listing_status, listing_type, property_type, etc.)
- `00010` Identities (users, profiles, mobile_devices, push_tokens)
- `00020` Organizations (agencies, branches, memberships, invites)
- `00030` Listings (listings, translations, media, documents)
- `00031` Listing history (price_versions, status_versions, revisions, publication_history)
- `00040` Marketplace (favorites, notes, saved_searches, view_history, leads, conversations, messages)
- `00050` Billing/AI/Analytics (plans, subscriptions, ai_prompts, ai_jobs, entitlements, domain_events, listing_views, agency_stats_daily, audit_logs)
- `00060` Indexes
- `00070` Functions (is_agency_member, is_agency_admin, is_super_admin, handle_new_user)
- `00080` RLS policies
- `00090` Triggers (updated_at, auth user bootstrap)
- `00100` Geography (wilayas, communes + seed data)

## Module Build Order

M00 Foundations → M01 Auth → M02 Agencies → M03 Listings → M04 Media → M09 AI → M05 Search/SEO → M06 Leads → M07 Favorites → M08 Billing → M10 Moderation → M11 Analytics → M12 Deployment

## Skills & Agents Available

This project has a curated set of skills, agents, and commands installed in `.claude/`.

### Skills (`.claude/skills/`)

| Skill | Source | Usage |
|-------|--------|-------|
| **claude-api** | Anthropic | Build AI features with Claude SDK |
| **frontend-design** | Anthropic | Production-grade UI with distinctive design |
| **webapp-testing** | Anthropic | Playwright-based testing workflows |
| **pdf** | Anthropic | PDF generation/processing |
| **xlsx** | Anthropic | Spreadsheet data export/analysis |
| **doc-coauthoring** | Anthropic | Technical documentation co-authoring |
| **skill-creator** | Anthropic | Create new custom skills |
| **ui-ux-pro-max** | nextlevelbuilder | 50+ UI styles, 161 palettes, 99 UX guidelines |
| **ui-styling** | nextlevelbuilder | shadcn/ui + Tailwind implementation |
| **design-system** | nextlevelbuilder | Token architecture, component specs |
| **design** | nextlevelbuilder | Logo, CIP, slides, social media |
| **brand** | nextlevelbuilder | Brand voice & visual identity |
| **banner-design** | nextlevelbuilder | Social media & ad banners |
| **slides** | nextlevelbuilder | HTML presentations with Chart.js |
| **writing-plans** | obra/superpowers (upgraded: architecture-guidance branch) | Structured planning with file structure design, plan-document-reviewer, chunks ≤1000 lines |
| **executing-plans** | obra/superpowers | Execute plans with parallel agents |
| **subagent-driven-development** | obra/superpowers (upgraded: improve-skills-from-feedback branch) | 2-stage review (spec-compliance + code-quality), context isolation, real bug fixes |
| **brainstorming** | obra/superpowers (upgraded: architecture-guidance branch) | Spec-document-reviewer loop, file isolation principles |
| **dispatching-parallel-agents** | obra/superpowers | Launch multiple independent agents |
| **systematic-debugging** | obra/superpowers | Root-cause tracing & debugging |
| **test-driven-development** | obra/superpowers | TDD workflow |
| **requesting-code-review** | obra/superpowers | Peer code review workflow |
| **verification-before-completion** | obra/superpowers | Pre-delivery validation |
| **finishing-a-development-branch** | obra/superpowers | Branch cleanup & finalization |
| **using-git-worktrees** | obra/superpowers | Git worktree management |
| **planning-with-files** | OthmanAdi (upgraded: session-handoff branch) | Session management, handoff scripts, RESUME.md for long tasks |

### Agents (`.claude/agents/`)

| Agent | Specialty |
|-------|-----------|
| **nextjs-developer** | Next.js 15 App Router specialist |
| **typescript-pro** | TypeScript 5+ advanced patterns |
| **react-specialist** | React 18+ modern patterns |
| **fullstack-developer** | End-to-end feature development |
| **backend-developer** | Server-side, auth, DB design |
| **frontend-developer** | UI components, state, accessibility |
| **api-designer** | REST/GraphQL API architecture |
| **postgres-pro** | PostgreSQL optimization & tuning |
| **sql-pro** | SQL queries, indexes, performance |
| **security-auditor** | Security vulnerability detection |
| **code-reviewer** | Code quality review |
| **test-automator** | Automated testing frameworks |
| **qa-expert** | Quality assurance processes |
| **performance-engineer** | Frontend & backend optimization |
| **seo-specialist** | SEO strategy & implementation |
| **payment-integration** | Stripe & payment systems |
| **mobile-developer** | React Native / Expo |
| **ui-designer** | UI/UX design patterns |
| **devops-engineer** | CI/CD, deployment automation |

### Commands (`.claude/commands/`)

- `/write-plan` — Create structured implementation plan
- `/execute-plan` — Execute plan with subagents
- `/brainstorm` — Collaborative brainstorming session

### Reviewer Prompts (installed with skills)

| File | Location | Usage |
|------|----------|-------|
| **spec-document-reviewer-prompt.md** | `.claude/skills/brainstorming/` | Dispatched after spec writing to verify completeness, coverage, YAGNI |
| **plan-document-reviewer-prompt.md** | `.claude/skills/writing-plans/` | Dispatched after each plan chunk to verify decomposition, file structure, sizes |
| **code-quality-reviewer-prompt.md** | `.claude/skills/subagent-driven-development/` | Dispatched after spec-compliance review for quality check |

### Development Workflow

```
1. /brainstorm          → Design & spec (+ spec-document-reviewer loop)
2. /write-plan          → Plan structuré (+ plan-document-reviewer loop)
3. /execute-plan        → Subagent-driven execution with 2-stage review:
                           a) Spec-compliance review
                           b) Code-quality review
4. verification-before-completion → Gate function before any completion claim
5. finishing-a-development-branch → Tests → 4 options → cleanup
```

### How to Use

Reference skills in prompts:
```
Use the frontend-design skill for this component
Apply the ui-ux-pro-max skill for the search page
Use the webapp-testing skill to write E2E tests
Use the systematic-debugging skill to trace this bug
```

Agents are auto-dispatched by Claude Code based on task context.

## Reference Repos

10 repos de référence clonés dans `../../resources/` avec patterns extraits dans `ARCHITECTURE-PATTERNS.md` :
- **nextjs-subscription-payments** — Stripe + Supabase billing pattern
- **saas-starter-kit** — Multi-tenant RBAC, invitations
- **cal.com** — Monorepo production Next.js, vertical slices, DTO boundary, DI
- **microrealestate** — Domain model immobilier, calcul loyer, PDF contrats
- **sharetribe** — Marketplace patterns, custom fields, transaction lifecycle, reviews

## Parent Workspace

This project lives in `projects/AqarVision/` within a PersoDev workspace. Library resources (skills, subagents, workflows) are accessible via `../../library/`.
