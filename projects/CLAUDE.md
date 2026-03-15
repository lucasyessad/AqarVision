# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

**AqarVision** is an Algerian proptech ecosystem with four surfaces:
- **AqarSearch** — Public real estate marketplace (search, map, SEO, alerts, favorites)
- **AqarPro** — Agency CRM (listing publication, leads, messaging, analytics, AI)
- **AqarChaab** — Individual user space (deposit listings, favorites, messaging, projects)
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
│   │   │   ├── [locale]/AqarChaab/
│   │   │   │   ├── espace/     # Individual user space (mes-annonces, favoris, messages, profil)
│   │   │   │   └── deposer/    # 4-step wizard to post a listing
│   │   │   ├── [locale]/search/            # AqarSearch marketplace (split map/list)
│   │   │   ├── [locale]/l/[slug]/          # Listing detail
│   │   │   ├── [locale]/a/[slug]/          # Agency vitrine
│   │   │   ├── [locale]/admin/             # Super admin (agencies, verifications, platform settings)
│   │   │   └── api/webhooks/stripe/        # Stripe callback
│   │   ├── src/features/       # Feature modules (see pattern below)
│   │   ├── src/lib/supabase/   # client.ts, server.ts, middleware.ts
│   │   ├── src/lib/auth/       # with-agency-auth.ts, with-super-admin-auth.ts
│   │   ├── src/lib/logger/     # Pino structured logger
│   │   ├── src/lib/sanitize/   # sanitizeInput utility
│   │   ├── src/types/          # action-result.ts (ActionResult<T>, ok(), fail())
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
    ├── migrations/             # Numbered SQL migrations (00000–00182)
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
1. Validate input via Zod (apply `.transform(sanitizeInput)` on free-text fields)
2. Resolve current actor (auth) via `withAgencyAuth` or `withSuperAdminAuth`
3. Check permissions (handled by the auth guard)
4. Call domain service
5. Return sanitized output
6. Trigger revalidation if needed

Return type: `ActionResult<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } }`

Use `ok(data)` and `fail("CODE", "message")` helpers from `@/types/action-result`.

## Auth Guards

Always use these guards — never perform manual membership checks.

```typescript
// src/lib/auth/with-agency-auth.ts
// Verifies: active session + is_agency_member(agencyId) + RBAC permission
withAgencyAuth(agencyId, resource, permission, async (ctx) => {
  // ctx.agencyId, ctx.userId, ctx.role available
  return data; // wrapped in ActionOk automatically
});

// src/lib/auth/with-super-admin-auth.ts
// Verifies: active session + is_super_admin() RPC
withSuperAdminAuth(async (ctx) => {
  // ctx.userId available
  return data;
});
```

Both return `ActionOk<T> | ActionError` — propagate directly from the server action.

## Shared Utilities

```typescript
// Structured logger (Pino)
import { logger } from "@/lib/logger";
logger.error({ err, listingId }, "changePrice RPC failed");
logger.warn({ userId }, "Access denied");

// Input sanitization — apply in Zod schemas on text fields
import { sanitizeInput } from "@/lib/sanitize";
// Performs: HTML escape, null-byte removal, Unicode normalize, trim
// Usage in schema: z.string().min(1).transform(sanitizeInput)

// ActionResult helpers
import { ok, fail } from "@/types/action-result";
ok({ listing_id })          // → { success: true, data: { listing_id } }
fail("NOT_FOUND", "msg")    // → { success: false, error: { code, message } }
```

## Individual Listings Pattern

Individuals (non-agency) can post listings via `/AqarChaab/deposer`.

```typescript
// DB: owner_type enum = 'agency' | 'individual'
// Schema: src/features/listings/schemas/individual-listing.schema.ts
// Action:  src/features/listings/actions/create-individual-listing.action.ts

// Key differences from agency listings:
//   agency_id: null
//   individual_owner_id: auth.uid()
//   owner_type: 'individual'
//   current_status: 'published'  ← live immediately, no moderation

// DB constraint (enforced via CHECK):
// (owner_type = 'agency' AND agency_id IS NOT NULL) OR
// (owner_type = 'individual' AND individual_owner_id IS NOT NULL AND agency_id IS NULL)
```

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
- **withAgencyAuth / withSuperAdminAuth** — all server-side authorization goes through these guards
- **Stripe event ordering** — `customer.subscription.created` always follows `checkout.session.completed`; period dates must never be hardcoded, let the subscription event fill them

## Strict Rules

- **NEVER** call DB directly from React components
- **NEVER** put business logic in UI components
- **NEVER** use localStorage for session (cookies only via Supabase SSR)
- **NEVER** enforce roles only on frontend — always verify server-side
- **NEVER** hardcode left/right margins — use CSS logical properties for RTL (`margin-inline-start`)
- **NEVER** use manual membership checks in actions — always use `withAgencyAuth`
- **NEVER** use manual super-admin checks in actions — always use `withSuperAdminAuth`
- **NEVER** hardcode Stripe period dates — let `customer.subscription.created` fill them
- **NEVER** use `defaultProps` with hardcoded UI text in `ErrorBoundary` — pass via `useTranslations()` from the parent
- All inputs validated via Zod before processing; free-text fields use `.transform(sanitizeInput)`
- All outputs typed with explicit DTOs — never expose internal columns to client

## RTL Support

- CSS logical properties everywhere (`margin-inline-start`, not `margin-left`)
- `dir="rtl"` on `<html>` when locale = `ar`
- Tailwind `rtl:` and `ltr:` classes for directional overrides
- Verify icons, arrows, badges render correctly in RTL

## Design System

Design system: **"Zinc"** — see `projects/SKILL.md` for the complete token system and component library.

- **Palette:** Zinc (neutral gray) + Amber (warm accent). Dark mode via Tailwind `dark:` prefix.
- **Font:** Geist (FR/EN/ES), IBM Plex Sans Arabic (AR) — loaded via `next/font`.
- **Tokens:** CSS custom properties in `globals.css`, mapped in `tailwind.config.ts`.
- **Rule:** NEVER hardcode hex values or inline styles. Tailwind classes only.
- **Surfaces:** AqarSearch = spacious layout; AqarPro = dense, keyboard-first; AqarChaab = warm, personal. See `references/` in SKILL.md for per-surface specs.

## i18n & SEO

- All routes prefixed by `[locale]`
- i18n fallback chain: requested locale → fr → en
- Components never hardcode text
- `generateMetadata` on every dynamic page
- `hreflang` link tags for all 4 locales
- Dynamic XML sitemap, JSON-LD `RealEstateListing`, canonical URLs
- ISR for category pages (`revalidate: 3600`), SSR for listing detail

## Database Schema Overview

Migrations in `supabase/migrations/` (execute in order, 00000–00182):
- `00000` Extensions (PostGIS, btree_gist)
- `00001` Enums (user_role, agency_role, listing_status, listing_type, property_type, listing_owner_type, etc.)
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
- `00111` Individual listings (owner_type enum, individual_owner_id, RLS for individuals)
- `00120+` Billing (Stripe plans, individual subscriptions, webhooks)
- `00150+` AqarChaab (espace features, projects, collections)

## Module Build Order

M00 Foundations → M01 Auth → M02 Agencies → M03 Listings → M04 Media → M09 AI → M05 Search/SEO → M06 Leads → M07 Favorites → M08 Billing → M10 Moderation → M11 Analytics → M12 Deployment

## Parent Workspace

This project lives in `projects/AqarVision/` within a PersoDev workspace. Library resources (skills, subagents, workflows) in `../../library/` can be referenced in prompts.
