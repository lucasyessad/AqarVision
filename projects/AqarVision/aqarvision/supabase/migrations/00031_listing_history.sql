-- M03 Listings Core — History & Versioning Tables
-- SCD2 pattern for price/status, revisions, publication history, media history, moderation

-- ──────────────────────────────────────────────
-- listing_price_versions (SCD2)
-- ──────────────────────────────────────────────
create table public.listing_price_versions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  price numeric(14,2) not null,
  currency text not null default 'DZD',
  valid_during tstzrange not null,
  is_current boolean not null default true,
  changed_by uuid references public.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now(),
  constraint chk_price_versions_non_negative check (price >= 0),
  constraint excl_price_versions_no_overlap
    exclude using gist (listing_id with =, valid_during with &&)
);

comment on table public.listing_price_versions is
  'SCD2 price history. valid_during uses tstzrange with btree_gist exclusion to prevent overlapping periods.';

-- ──────────────────────────────────────────────
-- listing_status_versions (SCD2)
-- ──────────────────────────────────────────────
create table public.listing_status_versions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  status public.listing_status not null,
  valid_during tstzrange not null,
  is_current boolean not null default true,
  changed_by uuid references public.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now(),
  constraint excl_status_versions_no_overlap
    exclude using gist (listing_id with =, valid_during with &&)
);

comment on table public.listing_status_versions is
  'SCD2 status history. valid_during uses tstzrange with btree_gist exclusion to prevent overlapping periods.';

-- ──────────────────────────────────────────────
-- listing_revisions
-- Full snapshot of listing state at a point in time
-- ──────────────────────────────────────────────
create table public.listing_revisions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  changed_by uuid references public.users(id) on delete set null,
  change_summary text,
  created_at timestamptz not null default now(),
  unique(listing_id, version)
);

comment on table public.listing_revisions is
  'Complete listing snapshots for audit trail. Each version bump creates a new revision row with the full state as JSON.';

-- ──────────────────────────────────────────────
-- listing_publication_history
-- Tracks publish/unpublish events
-- ──────────────────────────────────────────────
create table public.listing_publication_history (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  action text not null check (action in ('published','unpublished','paused','expired')),
  performed_by uuid references public.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- listing_media_history
-- Tracks media additions/removals/reorders
-- ──────────────────────────────────────────────
create table public.listing_media_history (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  media_id uuid,
  action text not null check (action in ('added','removed','reordered','cover_changed')),
  storage_path text,
  performed_by uuid references public.users(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- listing_moderation_history
-- Tracks moderation decisions
-- ──────────────────────────────────────────────
create table public.listing_moderation_history (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  action public.moderation_action not null,
  moderator_id uuid references public.users(id) on delete set null,
  reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
