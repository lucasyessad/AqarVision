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
pnpm dev              # Start all workspaces (web on port 3000)
pnpm build            # Build all workspaces via Turbo
pnpm lint             # Lint all workspaces
pnpm typecheck        # TypeScript check all workspaces
pnpm format           # Prettier on all TS/TSX/MD/JSON files
pnpm test             # Run all Vitest tests
pnpm test:e2e         # Run Playwright E2E tests (requires build first)
cd apps/web && pnpm vitest run path/to/file.test.ts  # Single test file
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
│   │   │   ├── [locale]/AqarPro/dashboard/  # Agency CRM (gated)
│   │   │   ├── [locale]/AqarChaab/         # Consumer space
│   │   │   ├── [locale]/search/            # AqarSearch marketplace
│   │   │   ├── [locale]/l/[slug]/          # Listing detail
│   │   │   ├── [locale]/a/[slug]/          # Agency profile vitrine
│   │   │   ├── [locale]/admin/             # Admin interface
│   │   │   └── api/webhooks/stripe/        # Stripe callback
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
    ├── migrations/             # Numbered SQL migrations (00000–00135)
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

## Parent Workspace

This project lives in `projects/AqarVision/` within a PersoDev workspace. Library resources (skills, subagents, workflows) in `../../library/` can be referenced in prompts.
