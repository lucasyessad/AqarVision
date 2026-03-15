# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is This

AqarVision is an Algerian proptech platform (marketplace + agency CRM) built as a **pnpm monorepo** with Turborepo. The main app is a Next.js 15 application using the App Router, Server Actions, React 19, and Supabase for database/auth.

## Commands

```bash
# Development (from repo root)
pnpm dev              # Start all workspaces (web on port 3000)
pnpm build            # Build all workspaces via Turbo
pnpm lint             # Lint all workspaces
pnpm typecheck        # TypeScript check all workspaces
pnpm format           # Prettier on all TS/TSX/MD/JSON files

# Testing
pnpm test             # Run all vitest tests
pnpm test:e2e         # Run Playwright e2e tests (requires build first)
cd apps/web && pnpm test:watch          # Watch mode for unit tests
cd apps/web && pnpm vitest run path/to/file.test.ts  # Single test file

# Supabase (local)
supabase start        # Start local Supabase (API: 54321, DB: 54322)
supabase test db      # Run database tests
supabase db push      # Push migrations to linked project
supabase functions deploy stripe-webhook
```

## Monorepo Structure

- **`apps/web`** — Next.js 15 app (the only app). Package: `@aqarvision/web`
- **`packages/config`** — Zod-validated env schemas, locales, currencies, image variants, constants
- **`packages/domain`** — ActionResult type, ErrorWithCode class, business policies
- **`packages/security`** — RBAC permission matrix, input sanitization (DOMPurify)
- **`packages/database`** — Generated Supabase types (`Database`, `Tables`, `Enums`)
- **`packages/analytics`**, **`packages/feature-flags`**, **`packages/ui`** — Supporting packages

## Architecture

### Feature Modules (`apps/web/src/features/`)

Every feature follows the same structure — **actions → services → database**:

```
features/<name>/
├── actions/    # "use server" Server Actions — public API, validates with Zod, calls withAgencyAuth
├── services/   # Pure functions for DB queries/mutations (receive supabase client)
├── schemas/    # Zod schemas (types inferred via z.infer)
├── types/      # DTOs and TypeScript types
├── components/ # React components (barrel-exported via index.ts)
└── hooks/      # Client-side React hooks (some features)
```

Features: admin, agencies, agency-settings, ai, analytics, auth, billing, favorites, leads, listings, marketplace, media, messaging, moderation, onboarding, visit-requests.

### Server Action Pattern

All server actions follow this flow:
1. Parse FormData → validate with Zod schema
2. Auth check via `withAgencyAuth(agencyId, resource, permission, callback)` (RBAC)
3. Call service function with Supabase client
4. Return `ActionResult<T>` — `{ success: true, data }` or `{ success: false, error: { code, message } }`

### Auth & RBAC

- Supabase Auth via `@supabase/ssr` (cookie-based sessions)
- `lib/supabase/server.ts` — server-side client, `lib/supabase/client.ts` — browser client
- `lib/auth/with-agency-auth.ts` — guards server actions with role-based permissions
- Roles: `owner > admin > agent > editor > viewer`
- Resources: listing, team_member, invitation, billing, settings, analytics, media, ai_job

### Routing & i18n

- All routes are under `app/[locale]/` — locales: **fr** (default), ar, en, es
- `next-intl` with `localePrefix: "always"` — every URL has a locale prefix
- Two user spaces: **AqarPro** (agency CRM) and **AqarChaab** (consumer)
- Vitrine routes: `/a/[slug]` (agency page), `/l/[slug]` (listing page)
- Translation files: `messages/{locale}.json`

### Middleware (`src/middleware.ts`)

Executes in order: CSRF check → locale detection → Supabase session refresh → next-intl routing → protected route redirect → security headers. Stripe and WhatsApp webhook endpoints are CSRF-exempt.

### Key Lib Modules

- `lib/supabase/` — Client creation (server, client, middleware)
- `lib/i18n/` — Routing config, request config, locale-aware navigation
- `lib/cache/tags.ts` — Cache invalidation tags
- `lib/seo/json-ld.ts` — Schema.org structured data
- `lib/plan-gating.ts` — Feature access by subscription plan
- `lib/sanitize.ts` — Input sanitization

## Conventions

- **Server Components by default** — only add `"use client"` when interactivity is needed
- **Zod schemas are the source of truth** for types — use `z.infer<typeof Schema>` rather than duplicating types
- **ActionResult** is the standard return type for all server actions (from `@aqarvision/domain`)
- **ErrorWithCode** for typed errors with static constructors (Unauthorized, NotFound, Forbidden, etc.)
- **Barrel exports** — features expose components via `components/index.ts`
- **Colocation** — keep feature logic together; shared utilities go in `lib/`
- **Currency**: DZD, EUR, USD. **Max upload**: 10MB. **Image types**: jpeg, png, webp, avif, pdf

## Stack Summary

Next.js 15 · React 19 · TypeScript 5.7 · Supabase (DB + Auth + Storage + Edge Functions) · Stripe · next-intl · TailwindCSS 3 · Zod · MapLibre GL · Anthropic SDK · Pino logging · Sentry · Vitest · Playwright · Vercel (deploy)
