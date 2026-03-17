-- ============================================================================
-- 006 — Marketplace
-- favorites, favorite_collections, listing_notes, saved_searches,
-- search_alerts, view_history, visit_requests
-- Note: old `notes` table removed (superseded by listing_notes with unique constraint)
-- Note: saved_searches kept for backward compat, search_alerts is the V2
-- ============================================================================

-- ── favorite_collections ────────────────────────────────────────────────────

create table public.favorite_collections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

-- ── favorites ───────────────────────────────────────────────────────────────

create table public.favorites (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  listing_id      uuid not null references public.listings(id) on delete cascade,
  collection_id   uuid references public.favorite_collections(id) on delete set null,
  note            text,
  personal_status text default 'none'
    check (personal_status in ('none', 'interested', 'visited', 'negotiating', 'rejected')),
  created_at      timestamptz not null default now(),
  unique(user_id, listing_id)
);

-- ── listing_notes ───────────────────────────────────────────────────────────

create table public.listing_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

-- ── saved_searches ──────────────────────────────────────────────────────────

create table public.saved_searches (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  name       text not null,
  filters    jsonb not null default '{}'::jsonb,
  notify     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── search_alerts (V2 — fine-grained alerts) ────────────────────────────────

create table public.search_alerts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null default '',
  filters      jsonb not null default '{}',
  frequency    text not null default 'daily'
    check (frequency in ('instant', 'daily', 'weekly')),
  is_active    boolean not null default true,
  last_sent_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── view_history ────────────────────────────────────────────────────────────

create table public.view_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewed_at  timestamptz not null default now()
);

-- NOTE: visit_requests is in 007_leads_messaging.sql (depends on leads table)
