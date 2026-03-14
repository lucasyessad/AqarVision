-- M01 Auth & Identity — Extensions
-- Required extensions for AqarVision

create extension if not exists "postgis";       -- geographic data types & spatial queries
create extension if not exists "btree_gist";    -- GiST index operator classes for exclusion constraints
create extension if not exists "pg_trgm";       -- trigram matching for fuzzy text search
-- M01 Auth & Identity — Enums
-- All domain enums for AqarVision V4

create type public.user_role as enum (
  'end_user',
  'super_admin'
);

create type public.agency_role as enum (
  'owner',
  'admin',
  'agent',
  'editor',
  'viewer'
);

create type public.listing_status as enum (
  'draft',
  'pending_review',
  'published',
  'paused',
  'rejected',
  'sold',
  'rented',
  'expired',
  'archived'
);

create type public.listing_type as enum (
  'sale',
  'rent',
  'vacation'
);

create type public.property_type as enum (
  'apartment',
  'villa',
  'terrain',
  'commercial',
  'office',
  'building',
  'farm',
  'warehouse'
);

create type public.document_type as enum (
  'acte',
  'livret_foncier',
  'promesse',
  'cc'
);

create type public.lead_status as enum (
  'new',
  'contacted',
  'qualified',
  'closed'
);

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete'
);

create type public.moderation_action as enum (
  'approved',
  'rejected',
  'hidden',
  'restored'
);
-- M01 Auth & Identity — Identity tables
-- users, profiles, mobile_devices, push_tokens

-- ──────────────────────────────────────────────
-- users: shadow table linked to auth.users
-- ──────────────────────────────────────────────
create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.users is 'Shadow table for auth.users, allows FK references from other tables.';

-- ──────────────────────────────────────────────
-- profiles: public-facing user profile data
-- ──────────────────────────────────────────────
create table public.profiles (
  user_id          uuid primary key references public.users (id) on delete cascade,
  full_name        text,
  avatar_url       text,
  phone            text,
  role             public.user_role not null default 'end_user',
  preferred_locale text not null default 'fr'
    check (preferred_locale in ('fr', 'ar', 'en', 'es')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.profiles is 'User profile information. One row per user.';

-- ──────────────────────────────────────────────
-- profiles_public: read-only view exposing safe fields
-- ──────────────────────────────────────────────
create view public.profiles_public as
  select
    user_id,
    full_name,
    avatar_url
  from public.profiles;

comment on view public.profiles_public is 'Public-safe subset of profile data.';

-- ──────────────────────────────────────────────
-- mobile_devices: registered mobile devices
-- ──────────────────────────────────────────────
create table public.mobile_devices (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  platform     text,
  app_version  text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

comment on table public.mobile_devices is 'Registered mobile devices per user.';

-- ──────────────────────────────────────────────
-- push_tokens: FCM / APNs tokens
-- ──────────────────────────────────────────────
create table public.push_tokens (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users (id) on delete cascade,
  mobile_device_id uuid not null references public.mobile_devices (id) on delete cascade,
  token            text not null unique,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

comment on table public.push_tokens is 'Push notification tokens tied to a device.';
-- M02 Agencies, Branches & Team — Tables

-- ──────────────────────────────────────────────
-- agencies
-- ──────────────────────────────────────────────
create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  cover_url text,
  phone text,
  email text,
  is_verified boolean not null default false,
  deleted_at timestamptz,  -- soft-delete
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- agency_branches
-- ──────────────────────────────────────────────
create table public.agency_branches (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  name text not null,
  wilaya_code text not null,
  commune_id bigint,
  address_text text,
  location geography(point,4326),
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- agency_memberships
-- ──────────────────────────────────────────────
create table public.agency_memberships (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role agency_role not null,
  is_active boolean not null default true,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique(agency_id, user_id)
);

-- ──────────────────────────────────────────────
-- agency_invites
-- ──────────────────────────────────────────────
create table public.agency_invites (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  email text not null,
  role agency_role not null,
  token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
-- M03 Listings Core — Tables
-- listings, listing_translations, listing_media, listing_documents

-- ──────────────────────────────────────────────
-- listings
-- ──────────────────────────────────────────────
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  branch_id uuid references public.agency_branches(id) on delete set null,
  current_status public.listing_status not null default 'draft',
  current_price numeric(14,2) not null,
  currency text not null default 'DZD',
  listing_type public.listing_type not null,
  property_type public.property_type not null,
  surface_m2 numeric(10,2),
  rooms integer,
  bathrooms integer,
  wilaya_code text not null,
  commune_id bigint,
  location geography(point,4326),
  details jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  deleted_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_listings_price_non_negative check (current_price >= 0),
  constraint chk_listings_surface_non_negative check (surface_m2 is null or surface_m2 >= 0),
  constraint chk_listings_rooms_non_negative check (rooms is null or rooms >= 0),
  constraint chk_listings_bathrooms_non_negative check (bathrooms is null or bathrooms >= 0),
  constraint chk_listings_details_is_object check (jsonb_typeof(details) = 'object')
);

comment on column public.listings.details is
  'Flexible JSON for extra attributes. Schema: {"floor": int, "has_elevator": bool, "has_parking": bool, "has_garden": bool, "has_pool": bool, "has_balcony": bool, "heating_type": string, "year_built": int, "furnished": bool}. Validated at application layer via Zod.';

-- ──────────────────────────────────────────────
-- listing_translations
-- ──────────────────────────────────────────────
create table public.listing_translations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  locale text not null check (locale in ('fr','ar','en','es')),
  title text not null,
  description text not null,
  slug text not null,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(listing_id, locale),
  unique(locale, slug)
);

-- ──────────────────────────────────────────────
-- listing_media
-- ──────────────────────────────────────────────
create table public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  content_type text,
  file_size_bytes bigint,
  width integer,
  height integer,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on column public.listing_media.storage_path is
  'Path in Supabase Storage private bucket. Image variants (thumb_320, medium_800, large_1600, webp) are derived at read time via Supabase Image Transformations — no separate rows needed.';

-- ──────────────────────────────────────────────
-- listing_documents
-- ──────────────────────────────────────────────
create table public.listing_documents (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  document_type public.document_type not null,
  storage_path text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
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
-- M04 Marketplace — Tables
-- favorites, notes, saved_searches, view_history, leads, conversations, messages

-- ──────────────────────────────────────────────
-- favorites
-- ──────────────────────────────────────────────
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

-- ──────────────────────────────────────────────
-- notes
-- ──────────────────────────────────────────────
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- saved_searches
-- ──────────────────────────────────────────────
create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  notify boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- view_history
-- ──────────────────────────────────────────────
create table public.view_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- leads
-- ──────────────────────────────────────────────
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  agency_id uuid not null references public.agencies(id) on delete cascade,
  sender_user_id uuid not null references public.users(id) on delete cascade,
  status public.lead_status not null default 'new',
  source text not null default 'platform' check (source in ('platform','whatsapp','phone')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- conversations
-- ──────────────────────────────────────────────
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- messages
-- ──────────────────────────────────────────────
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
-- M05 Billing, AI & Analytics — Tables

-- ──────────────────────────────────────────────
-- plans
-- ──────────────────────────────────────────────
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  stripe_price_id text unique,
  price_monthly numeric(10,2) not null default 0,
  currency text not null default 'DZD',
  max_listings integer not null default 10,
  max_media_per_listing integer not null default 5,
  max_team_members integer not null default 2,
  max_ai_jobs integer not null default 0,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- subscriptions
-- ──────────────────────────────────────────────
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  stripe_subscription_id text unique,
  status public.subscription_status not null default 'trialing',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- ai_prompts
-- ──────────────────────────────────────────────
create table public.ai_prompts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  system_prompt text not null,
  user_prompt_template text not null,
  model text not null default 'claude-sonnet-4-20250514',
  max_tokens integer not null default 4096,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- ai_jobs
-- ──────────────────────────────────────────────
create table public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  job_type text not null check (job_type in ('generate_description', 'translate', 'enrich')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  source_locale text check (source_locale in ('fr', 'ar', 'en', 'es')),
  target_locale text check (target_locale in ('fr', 'ar', 'en', 'es')),
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ──────────────────────────────────────────────
-- entitlements
-- ──────────────────────────────────────────────
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  feature_key text not null,
  is_enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(agency_id, feature_key)
);

-- ──────────────────────────────────────────────
-- domain_events
-- ──────────────────────────────────────────────
create table public.domain_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  actor_id uuid references public.users(id),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- listing_views
-- ──────────────────────────────────────────────
create table public.listing_views (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewer_id uuid references public.users(id),
  session_id text,
  referrer text,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- agency_stats_daily
-- ──────────────────────────────────────────────
create table public.agency_stats_daily (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  stat_date date not null,
  total_views integer not null default 0,
  total_leads integer not null default 0,
  total_listings integer not null default 0,
  created_at timestamptz not null default now(),
  unique(agency_id, stat_date)
);

-- ──────────────────────────────────────────────
-- audit_logs
-- ──────────────────────────────────────────────
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);
-- M03 Listings Core — Full-Text Search
-- Search vector function, trigger, GIN index, trigram index

-- ──────────────────────────────────────────────
-- listing_translation_search_vector(title, description)
-- Builds a weighted tsvector: title=A, description=B
-- Uses 'simple' config to handle multilingual content
-- ──────────────────────────────────────────────
create or replace function public.listing_translation_search_vector(p_title text, p_description text)
  returns tsvector
  language sql
  immutable
  parallel safe
as $$
  select
    setweight(to_tsvector('simple', coalesce(p_title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(p_description, '')), 'B');
$$;

comment on function public.listing_translation_search_vector(text, text) is
  'Builds a weighted tsvector from listing title (weight A) and description (weight B). Uses simple config for multilingual support (FR/AR/EN/ES).';

-- ──────────────────────────────────────────────
-- Trigger: auto-update search_vector on insert/update
-- ──────────────────────────────────────────────
create or replace function public.update_listing_search_vector()
  returns trigger
  language plpgsql
as $$
begin
  new.search_vector := public.listing_translation_search_vector(new.title, new.description);
  return new;
end;
$$;

create trigger trg_update_listing_search_vector
  before insert or update of title, description
  on public.listing_translations
  for each row
  execute function public.update_listing_search_vector();

-- ──────────────────────────────────────────────
-- GIN index on search_vector for full-text search
-- ──────────────────────────────────────────────
create index idx_listing_translations_search_vector
  on public.listing_translations
  using gin (search_vector);

-- ──────────────────────────────────────────────
-- pg_trgm GIN index on title for fuzzy/partial search
-- ──────────────────────────────────────────────
create index idx_listing_translations_title_trgm
  on public.listing_translations
  using gin (title gin_trgm_ops);
-- M02 Agencies, Branches & Team — Indexes

create index idx_agency_branches_agency_id
  on public.agency_branches(agency_id);

create index idx_agency_memberships_agency_id
  on public.agency_memberships(agency_id);

create index idx_agency_memberships_user_id
  on public.agency_memberships(user_id);

create index idx_agency_invites_token
  on public.agency_invites(token);

create index idx_agencies_active
  on public.agencies(id)
  where deleted_at is null;

-- ══════════════════════════════════════════════
-- M03 Listings Core — Indexes
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- listings
-- ──────────────────────────────────────────────
create index idx_listings_agency_id
  on public.listings(agency_id);

create index idx_listings_branch_id
  on public.listings(branch_id);

create index idx_listings_status
  on public.listings(current_status);

create index idx_listings_listing_type
  on public.listings(listing_type);

create index idx_listings_property_type
  on public.listings(property_type);

create index idx_listings_wilaya_code
  on public.listings(wilaya_code);

create index idx_listings_published_at
  on public.listings(published_at desc);

create index idx_listings_location_gist
  on public.listings
  using gist (location);

-- Composite index for common search queries
create index idx_listings_search_composite
  on public.listings(current_status, listing_type, property_type, wilaya_code);

-- Partial index for active (non-deleted) listings
create index idx_listings_active
  on public.listings(id)
  where deleted_at is null;

-- GIN index on details JSONB column
create index idx_listings_details
  on public.listings
  using gin (details);

-- ──────────────────────────────────────────────
-- listing_translations
-- ──────────────────────────────────────────────
create index idx_listing_translations_listing_locale
  on public.listing_translations(listing_id, locale);

-- ──────────────────────────────────────────────
-- listing_media
-- ──────────────────────────────────────────────
create index idx_listing_media_listing_id
  on public.listing_media(listing_id);

-- ──────────────────────────────────────────────
-- listing_documents
-- ──────────────────────────────────────────────
create index idx_listing_documents_listing_id
  on public.listing_documents(listing_id);

-- ──────────────────────────────────────────────
-- History tables
-- ──────────────────────────────────────────────

-- Current price version per listing (unique partial)
create unique index idx_listing_price_versions_current
  on public.listing_price_versions(listing_id)
  where is_current = true;

create index idx_listing_price_versions_valid_from
  on public.listing_price_versions(listing_id, (lower(valid_during)) desc);

-- Current status version per listing (unique partial)
create unique index idx_listing_status_versions_current
  on public.listing_status_versions(listing_id)
  where is_current = true;

create index idx_listing_status_versions_valid_from
  on public.listing_status_versions(listing_id, (lower(valid_during)) desc);

-- Revisions by listing
create index idx_listing_revisions_listing_id
  on public.listing_revisions(listing_id, version desc);

-- Publication history by listing
create index idx_listing_publication_history_listing_id
  on public.listing_publication_history(listing_id, created_at desc);

-- Media history by listing
create index idx_listing_media_history_listing_id
  on public.listing_media_history(listing_id, created_at desc);

-- Moderation history by listing
create index idx_listing_moderation_history_listing_id
  on public.listing_moderation_history(listing_id, created_at desc);

-- ══════════════════════════════════════════════
-- M06 Leads & Messaging — Indexes
-- ══════════════════════════════════════════════

create index idx_leads_agency_id
  on public.leads(agency_id);

create index idx_leads_listing_id
  on public.leads(listing_id);

create index idx_conversations_lead_id
  on public.conversations(lead_id);

create index idx_messages_conversation_id
  on public.messages(conversation_id);

-- Partial index for unread messages
create index idx_messages_read_at
  on public.messages(conversation_id, created_at)
  where read_at is null;
-- M01 Auth & Identity — Functions
-- Utility functions and trigger handlers

-- ──────────────────────────────────────────────
-- is_agency_member(p_agency_id, p_user_id)
-- Returns true if the user is an active member of the agency.
-- ──────────────────────────────────────────────
create or replace function public.is_agency_member(p_agency_id uuid, p_user_id uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select exists (
    select 1
    from public.agency_members am
    where am.agency_id = p_agency_id
      and am.user_id   = p_user_id
      and am.is_active  = true
  );
$$;

comment on function public.is_agency_member(uuid, uuid) is
  'Check whether a user is an active member of a given agency.';

-- ──────────────────────────────────────────────
-- is_agency_admin(p_agency_id, p_user_id)
-- Returns true if the user holds owner or admin role in the agency.
-- ──────────────────────────────────────────────
create or replace function public.is_agency_admin(p_agency_id uuid, p_user_id uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select exists (
    select 1
    from public.agency_members am
    where am.agency_id = p_agency_id
      and am.user_id   = p_user_id
      and am.role in ('owner', 'admin')
      and am.is_active  = true
  );
$$;

comment on function public.is_agency_admin(uuid, uuid) is
  'Check whether a user is an owner or admin of a given agency.';

-- ──────────────────────────────────────────────
-- is_super_admin(p_user_id)
-- Returns true if the user has the super_admin role.
-- ──────────────────────────────────────────────
create or replace function public.is_super_admin(p_user_id uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = p_user_id
      and p.role    = 'super_admin'
  );
$$;

comment on function public.is_super_admin(uuid) is
  'Check whether a user holds the super_admin role.';

-- ──────────────────────────────────────────────
-- update_updated_at()
-- Generic trigger function to set updated_at = now().
-- ──────────────────────────────────────────────
create or replace function public.update_updated_at()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.update_updated_at() is
  'Trigger function: sets updated_at to current timestamp on row update.';

-- ──────────────────────────────────────────────
-- handle_new_user()
-- Trigger function: auto-creates users + profiles rows
-- when a new row is inserted into auth.users.
-- ──────────────────────────────────────────────
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  insert into public.users (id, created_at)
  values (new.id, now());

  insert into public.profiles (user_id, full_name, avatar_url, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null),
    now(),
    now()
  );

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Trigger function: creates a users row and a profiles row when a new auth user is created.';
-- M03 Listings Core — Transactional RPC Functions
-- SCD2 price/status changes with optimistic locking

-- ──────────────────────────────────────────────
-- change_listing_price
-- Transactional SCD2 price change with optimistic locking
-- ──────────────────────────────────────────────
create or replace function public.change_listing_price(
  _listing_id uuid,
  _new_price numeric(14,2),
  _changed_by uuid,
  _reason text default null,
  _expected_version integer default null
)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  _now timestamptz := now();
  _current_version integer;
  _current_currency text;
begin
  -- Lock the listing row and verify version
  select version, currency
    into _current_version, _current_currency
    from public.listings
   where id = _listing_id
     and deleted_at is null
     for update;

  if not found then
    raise exception 'Listing not found or deleted: %', _listing_id;
  end if;

  if _expected_version is not null and _current_version <> _expected_version then
    raise exception 'Optimistic lock conflict: expected version %, found %',
      _expected_version, _current_version;
  end if;

  -- Close the current price period
  update public.listing_price_versions
     set valid_during = tstzrange(lower(valid_during), _now),
         is_current = false
   where listing_id = _listing_id
     and is_current = true;

  -- Insert new price period (open-ended)
  insert into public.listing_price_versions (listing_id, price, currency, valid_during, is_current, changed_by, reason)
  values (_listing_id, _new_price, _current_currency, tstzrange(_now, null), true, _changed_by, _reason);

  -- Update the listing denormalized price and bump version
  update public.listings
     set current_price = _new_price,
         version = version + 1,
         updated_at = _now
   where id = _listing_id;
end;
$$;

comment on function public.change_listing_price(uuid, numeric, uuid, text, integer) is
  'Atomically changes listing price using SCD2 pattern. Closes current price period, opens new one, bumps version. Supports optimistic locking via _expected_version.';

-- ──────────────────────────────────────────────
-- change_listing_status
-- Transactional SCD2 status change with optimistic locking
-- Sets published_at when status transitions to published
-- ──────────────────────────────────────────────
create or replace function public.change_listing_status(
  _listing_id uuid,
  _new_status public.listing_status,
  _changed_by uuid,
  _reason text default null,
  _expected_version integer default null
)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  _now timestamptz := now();
  _current_version integer;
  _current_status public.listing_status;
begin
  -- Lock the listing row and verify version
  select version, current_status
    into _current_version, _current_status
    from public.listings
   where id = _listing_id
     and deleted_at is null
     for update;

  if not found then
    raise exception 'Listing not found or deleted: %', _listing_id;
  end if;

  if _expected_version is not null and _current_version <> _expected_version then
    raise exception 'Optimistic lock conflict: expected version %, found %',
      _expected_version, _current_version;
  end if;

  -- No-op if status unchanged
  if _current_status = _new_status then
    return;
  end if;

  -- Close the current status period
  update public.listing_status_versions
     set valid_during = tstzrange(lower(valid_during), _now),
         is_current = false
   where listing_id = _listing_id
     and is_current = true;

  -- Insert new status period (open-ended)
  insert into public.listing_status_versions (listing_id, status, valid_during, is_current, changed_by, reason)
  values (_listing_id, _new_status, tstzrange(_now, null), true, _changed_by, _reason);

  -- Update the listing denormalized status, bump version, set published_at if publishing
  update public.listings
     set current_status = _new_status,
         version = version + 1,
         updated_at = _now,
         published_at = case
           when _new_status = 'published' then _now
           else published_at
         end
   where id = _listing_id;
end;
$$;

comment on function public.change_listing_status(uuid, public.listing_status, uuid, text, integer) is
  'Atomically changes listing status using SCD2 pattern. Closes current status period, opens new one, bumps version. Sets published_at on first publish. Supports optimistic locking via _expected_version.';
-- M01 Auth & Identity — Row Level Security policies

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.mobile_devices enable row level security;
alter table public.push_tokens    enable row level security;

-- ──────────────────────────────────────────────
-- profiles
-- ──────────────────────────────────────────────

-- Users can read their own profile
create policy profiles_select_self
  on public.profiles
  for select
  using (user_id = auth.uid());

-- Users can update their own profile
create policy profiles_update_self
  on public.profiles
  for update
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Super admins can read all profiles
create policy profiles_select_super_admin
  on public.profiles
  for select
  using (public.is_super_admin(auth.uid()));

-- ──────────────────────────────────────────────
-- mobile_devices
-- ──────────────────────────────────────────────

-- Users can manage their own devices (select, insert, update, delete)
create policy mobile_devices_self
  on public.mobile_devices
  for all
  using (user_id = auth.uid());

-- ──────────────────────────────────────────────
-- push_tokens
-- ──────────────────────────────────────────────

-- Users can manage their own push tokens (select, insert, update, delete)
create policy push_tokens_self
  on public.push_tokens
  for all
  using (user_id = auth.uid());

-- ══════════════════════════════════════════════
-- M02 Agencies, Branches & Team — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.agencies           enable row level security;
alter table public.agency_branches    enable row level security;
alter table public.agency_memberships enable row level security;
alter table public.agency_invites     enable row level security;

-- ──────────────────────────────────────────────
-- agencies
-- ──────────────────────────────────────────────

-- Anyone can view non-deleted agencies
create policy agencies_select_public
  on public.agencies
  for select
  using (deleted_at is null);

-- Agency admins can update their own agency (if not soft-deleted)
create policy agencies_update_admin
  on public.agencies
  for update
  using (public.is_agency_admin(auth.uid(), id) and deleted_at is null);

-- Any authenticated user can create an agency
create policy agencies_insert_authenticated
  on public.agencies
  for insert
  with check (auth.uid() is not null);

-- ──────────────────────────────────────────────
-- agency_branches
-- ──────────────────────────────────────────────

-- Anyone can view branches
create policy branches_select_public
  on public.agency_branches
  for select
  using (true);

-- Agency admins can insert/update/delete branches
create policy branches_modify_admin
  on public.agency_branches
  for all
  using (public.is_agency_admin(auth.uid(), agency_id))
  with check (public.is_agency_admin(auth.uid(), agency_id));

-- ──────────────────────────────────────────────
-- agency_memberships
-- ──────────────────────────────────────────────

-- Agency members can view memberships of their own agency
create policy memberships_select_member
  on public.agency_memberships
  for select
  using (public.is_agency_member(auth.uid(), agency_id));

-- Agency admins can manage memberships
create policy memberships_modify_admin
  on public.agency_memberships
  for all
  using (public.is_agency_admin(auth.uid(), agency_id))
  with check (public.is_agency_admin(auth.uid(), agency_id));

-- ──────────────────────────────────────────────
-- agency_invites
-- ──────────────────────────────────────────────

-- Agency admins can view invites
create policy invites_select_admin
  on public.agency_invites
  for select
  using (public.is_agency_admin(auth.uid(), agency_id));

-- Agency admins can create invites
create policy invites_insert_admin
  on public.agency_invites
  for insert
  with check (public.is_agency_admin(auth.uid(), agency_id));

-- ══════════════════════════════════════════════
-- M03 Listings Core — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.listings                    enable row level security;
alter table public.listing_translations        enable row level security;
alter table public.listing_media               enable row level security;
alter table public.listing_documents           enable row level security;
alter table public.listing_price_versions      enable row level security;
alter table public.listing_status_versions     enable row level security;
alter table public.listing_revisions           enable row level security;
alter table public.listing_publication_history enable row level security;
alter table public.listing_media_history       enable row level security;
alter table public.listing_moderation_history  enable row level security;

-- ──────────────────────────────────────────────
-- listings
-- ──────────────────────────────────────────────

-- Public: anyone can view published, non-deleted listings
create policy listings_select_public
  on public.listings
  for select
  using (current_status = 'published' and deleted_at is null);

-- Members can view all listings of their agency
create policy listings_select_member
  on public.listings
  for select
  using (public.is_agency_member(auth.uid(), agency_id));

-- Members can insert listings for their agency
create policy listings_insert_member
  on public.listings
  for insert
  with check (public.is_agency_member(auth.uid(), agency_id));

-- Members can update non-deleted listings of their agency
create policy listings_update_member
  on public.listings
  for update
  using (public.is_agency_member(auth.uid(), agency_id) and deleted_at is null)
  with check (public.is_agency_member(auth.uid(), agency_id));

-- Only admins can delete listings (soft-delete)
create policy listings_delete_admin
  on public.listings
  for delete
  using (public.is_agency_admin(auth.uid(), agency_id));

-- ──────────────────────────────────────────────
-- listing_translations
-- ──────────────────────────────────────────────

-- Public: anyone can view translations of published listings
create policy listing_translations_select_public
  on public.listing_translations
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.current_status = 'published'
      and l.deleted_at is null
  ));

-- Members can view all translations of their agency's listings
create policy listing_translations_select_member
  on public.listing_translations
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- Members can insert/update/delete translations for their agency's listings
create policy listing_translations_modify_member
  on public.listing_translations
  for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- ──────────────────────────────────────────────
-- listing_media
-- ──────────────────────────────────────────────

-- Public: anyone can view media of published, non-deleted listings
create policy listing_media_select_public
  on public.listing_media
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.current_status = 'published'
      and l.deleted_at is null
  ));

-- Members can manage media for their agency's listings
create policy listing_media_modify_member
  on public.listing_media
  for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- ──────────────────────────────────────────────
-- listing_documents (member only — no public access)
-- ──────────────────────────────────────────────

create policy listing_documents_member
  on public.listing_documents
  for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- ──────────────────────────────────────────────
-- History tables — select for members only
-- ──────────────────────────────────────────────

create policy listing_price_versions_select_member
  on public.listing_price_versions
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

create policy listing_status_versions_select_member
  on public.listing_status_versions
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

create policy listing_revisions_select_member
  on public.listing_revisions
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

create policy listing_publication_history_select_member
  on public.listing_publication_history
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

create policy listing_media_history_select_member
  on public.listing_media_history
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

create policy listing_moderation_history_select_member
  on public.listing_moderation_history
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- ══════════════════════════════════════════════
-- M05 Search & SEO — listing_views RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.listing_views enable row level security;

-- ──────────────────────────────────────────────
-- listing_views
-- ──────────────────────────────────────────────

-- Any authenticated user can insert a view record
create policy listing_views_insert_authenticated
  on public.listing_views
  for insert
  with check (auth.uid() is not null);

-- Agency members can view analytics for their listings
create policy listing_views_select_member
  on public.listing_views
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- ══════════════════════════════════════════════
-- M06 Leads & Messaging — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.leads         enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- ──────────────────────────────────────────────
-- leads
-- ──────────────────────────────────────────────

-- Agency members can view leads for their agency
create policy leads_select_agency
  on public.leads
  for select
  using (public.is_agency_member(auth.uid(), agency_id));

-- Lead senders can view their own leads
create policy leads_select_sender
  on public.leads
  for select
  using (sender_user_id = auth.uid());

-- Any authenticated user can create a lead
create policy leads_insert_authenticated
  on public.leads
  for insert
  with check (auth.uid() is not null);

-- Agency members can update leads for their agency
create policy leads_update_agency
  on public.leads
  for update
  using (public.is_agency_member(auth.uid(), agency_id));

-- ──────────────────────────────────────────────
-- conversations
-- ──────────────────────────────────────────────

-- Participants (sender or agency member) can view conversations
create policy conversations_select_participant
  on public.conversations
  for select
  using (exists (
    select 1 from public.leads ld
    where ld.id = lead_id
      and (
        ld.sender_user_id = auth.uid()
        or public.is_agency_member(auth.uid(), ld.agency_id)
      )
  ));

-- ──────────────────────────────────────────────
-- messages
-- ──────────────────────────────────────────────

-- Participants can view messages in their conversations
create policy messages_select_participant
  on public.messages
  for select
  using (exists (
    select 1 from public.conversations c
    join public.leads ld on ld.id = c.lead_id
    where c.id = conversation_id
      and (
        ld.sender_user_id = auth.uid()
        or public.is_agency_member(auth.uid(), ld.agency_id)
      )
  ));

-- Participants can insert messages into their conversations
create policy messages_insert_participant
  on public.messages
  for insert
  with check (exists (
    select 1 from public.conversations c
    join public.leads ld on ld.id = c.lead_id
    where c.id = conversation_id
      and (
        ld.sender_user_id = auth.uid()
        or public.is_agency_member(auth.uid(), ld.agency_id)
      )
  ));

-- ══════════════════════════════════════════════
-- M09 AI — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.ai_prompts enable row level security;
alter table public.ai_jobs   enable row level security;

-- ──────────────────────────────────────────────
-- ai_prompts — anyone can read active prompts
-- ──────────────────────────────────────────────
create policy ai_prompts_select_active
  on public.ai_prompts
  for select
  using (is_active = true);

-- ──────────────────────────────────────────────
-- ai_jobs — agency members can view their agency's jobs
-- ──────────────────────────────────────────────
create policy ai_jobs_select_member
  on public.ai_jobs
  for select
  using (public.is_agency_member(auth.uid(), agency_id));

-- ai_jobs — agency members can insert jobs for their agency
create policy ai_jobs_insert_member
  on public.ai_jobs
  for insert
  with check (public.is_agency_member(auth.uid(), agency_id));

-- ══════════════════════════════════════════════
-- M07 Favorites & Alerts — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.favorites      enable row level security;
alter table public.notes          enable row level security;
alter table public.saved_searches enable row level security;
alter table public.view_history   enable row level security;

-- ──────────────────────────────────────────────
-- favorites — users manage their own
-- ──────────────────────────────────────────────
create policy favorites_self
  on public.favorites
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ──────────────────────────────────────────────
-- notes — users manage their own
-- ──────────────────────────────────────────────
create policy notes_self
  on public.notes
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ──────────────────────────────────────────────
-- saved_searches — users manage their own
-- ──────────────────────────────────────────────
create policy saved_searches_self
  on public.saved_searches
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ──────────────────────────────────────────────
-- view_history — users manage their own
-- ──────────────────────────────────────────────
create policy view_history_self
  on public.view_history
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ══════════════════════════════════════════════
-- M08 Billing — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.plans         enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements  enable row level security;

-- NOTE: stripe_customers is accessed via service_role only — no RLS policies needed.
-- If a stripe_customers table is added, enable RLS but do NOT create policies.

-- ──────────────────────────────────────────────
-- plans — anyone can view active plans
-- ──────────────────────────────────────────────
create policy plans_select_public
  on public.plans
  for select
  using (is_active = true);

-- ──────────────────────────────────────────────
-- subscriptions — agency admins only
-- ──────────────────────────────────────────────
create policy subscriptions_select_admin
  on public.subscriptions
  for select
  using (public.is_agency_admin(auth.uid(), agency_id));

-- ──────────────────────────────────────────────
-- entitlements — agency members can view
-- ──────────────────────────────────────────────
create policy entitlements_select_member
  on public.entitlements
  for select
  using (public.is_agency_member(auth.uid(), agency_id));

-- ══════════════════════════════════════════════
-- M10 Moderation — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS (listing_moderation_history already enabled in M03)
-- ──────────────────────────────────────────────
alter table public.audit_logs enable row level security;

-- ──────────────────────────────────────────────
-- listing_moderation_history — select for agency members (via listing join)
-- (already created in M03 section as listing_moderation_history_select_member)
-- ──────────────────────────────────────────────

-- ──────────────────────────────────────────────
-- audit_logs — only super admins can read
-- ──────────────────────────────────────────────
create policy audit_logs_select_super_admin
  on public.audit_logs
  for select
  using (public.is_super_admin(auth.uid()));

-- ══════════════════════════════════════════════
-- M11 Analytics — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.domain_events      enable row level security;
alter table public.agency_stats_daily enable row level security;

-- ──────────────────────────────────────────────
-- domain_events — only super admins can read
-- ──────────────────────────────────────────────
create policy domain_events_select_super_admin
  on public.domain_events
  for select
  using (public.is_super_admin(auth.uid()));

-- ──────────────────────────────────────────────
-- agency_stats_daily — agency members can read their own stats
-- ──────────────────────────────────────────────
create policy agency_stats_select_member
  on public.agency_stats_daily
  for select
  using (public.is_agency_member(auth.uid(), agency_id));
-- Bucket : listing-media (private)
insert into storage.buckets (id, name, public) values ('listing-media', 'listing-media', false);

-- Upload: authenticated users can upload
create policy "listing_media_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-media'
    and auth.uid() is not null
  );

-- Select: authenticated users can read (signed URLs for public access)
create policy "listing_media_select"
  on storage.objects for select
  using (
    bucket_id = 'listing-media'
    and auth.uid() is not null
  );

-- Update: authenticated users can update their uploads
create policy "listing_media_update"
  on storage.objects for update
  using (
    bucket_id = 'listing-media'
    and auth.uid() is not null
  );

-- Delete: authenticated users can delete
create policy "listing_media_delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-media'
    and auth.uid() is not null
  );

-- Bucket : listing-documents (private, no public access)
insert into storage.buckets (id, name, public) values ('listing-documents', 'listing-documents', false);

create policy "listing_documents_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-documents'
    and auth.uid() is not null
  );

create policy "listing_documents_select"
  on storage.objects for select
  using (
    bucket_id = 'listing-documents'
    and auth.uid() is not null
  );

create policy "listing_documents_delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-documents'
    and auth.uid() is not null
  );
-- M01 Auth & Identity — Triggers

-- Auto-update updated_at on profiles
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at();

-- Auto-create users + profiles when a new auth user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ══════════════════════════════════════════════
-- M02 Agencies, Branches & Team — Triggers
-- ══════════════════════════════════════════════

-- Auto-update updated_at on agencies
create trigger trg_agencies_updated_at
  before update on public.agencies
  for each row
  execute function public.update_updated_at();

-- ══════════════════════════════════════════════
-- M03 Listings Core — Triggers
-- ══════════════════════════════════════════════

-- Auto-update updated_at on listings
create trigger trg_listings_updated_at
  before update on public.listings
  for each row
  execute function public.update_updated_at();

-- Auto-update updated_at on listing_translations
create trigger trg_listing_translations_updated_at
  before update on public.listing_translations
  for each row
  execute function public.update_updated_at();

-- ══════════════════════════════════════════════
-- M06 Leads & Messaging — Triggers & Realtime
-- ══════════════════════════════════════════════

-- Enable Realtime on messages table for live chat
alter publication supabase_realtime add table messages;
-- M01 Auth & Identity — Geography tables
-- wilayas (provinces) and communes (municipalities) of Algeria

-- ──────────────────────────────────────────────
-- wilayas: 58 Algerian provinces
-- ──────────────────────────────────────────────
create table public.wilayas (
  code    text primary key,
  name_fr text not null,
  name_ar text not null,
  name_en text
);

comment on table public.wilayas is 'Algerian wilayas (provinces). Code is the official 2-digit number as text.';

-- ──────────────────────────────────────────────
-- communes: municipalities within wilayas
-- ──────────────────────────────────────────────
create table public.communes (
  id          bigint primary key generated always as identity,
  wilaya_code text not null references public.wilayas (code) on delete restrict,
  name_fr     text not null,
  name_ar     text,
  name_en     text,
  location    geography(point, 4326)
);

create index idx_communes_wilaya_code on public.communes (wilaya_code);

comment on table public.communes is 'Algerian communes (municipalities), each belonging to a wilaya.';

-- ──────────────────────────────────────────────
-- Seed: all 58 wilayas
-- ──────────────────────────────────────────────
insert into public.wilayas (code, name_fr, name_ar, name_en) values
  ('01', 'Adrar',             'أدرار',             'Adrar'),
  ('02', 'Chlef',             'الشلف',             'Chlef'),
  ('03', 'Laghouat',          'الأغواط',           'Laghouat'),
  ('04', 'Oum El Bouaghi',    'أم البواقي',        'Oum El Bouaghi'),
  ('05', 'Batna',             'باتنة',             'Batna'),
  ('06', 'Béjaïa',            'بجاية',             'Bejaia'),
  ('07', 'Biskra',            'بسكرة',             'Biskra'),
  ('08', 'Béchar',            'بشار',              'Bechar'),
  ('09', 'Blida',             'البليدة',           'Blida'),
  ('10', 'Bouira',            'البويرة',           'Bouira'),
  ('11', 'Tamanrasset',       'تمنراست',           'Tamanrasset'),
  ('12', 'Tébessa',           'تبسة',              'Tebessa'),
  ('13', 'Tlemcen',           'تلمسان',            'Tlemcen'),
  ('14', 'Tiaret',            'تيارت',             'Tiaret'),
  ('15', 'Tizi Ouzou',        'تيزي وزو',          'Tizi Ouzou'),
  ('16', 'Alger',             'الجزائر',           'Algiers'),
  ('17', 'Djelfa',            'الجلفة',            'Djelfa'),
  ('18', 'Jijel',             'جيجل',              'Jijel'),
  ('19', 'Sétif',             'سطيف',              'Setif'),
  ('20', 'Saïda',             'سعيدة',             'Saida'),
  ('21', 'Skikda',            'سكيكدة',            'Skikda'),
  ('22', 'Sidi Bel Abbès',    'سيدي بلعباس',       'Sidi Bel Abbes'),
  ('23', 'Annaba',            'عنابة',             'Annaba'),
  ('24', 'Guelma',            'قالمة',             'Guelma'),
  ('25', 'Constantine',       'قسنطينة',           'Constantine'),
  ('26', 'Médéa',             'المدية',            'Medea'),
  ('27', 'Mostaganem',        'مستغانم',           'Mostaganem'),
  ('28', 'M''Sila',           'المسيلة',           'M''Sila'),
  ('29', 'Mascara',           'معسكر',             'Mascara'),
  ('30', 'Ouargla',           'ورقلة',             'Ouargla'),
  ('31', 'Oran',              'وهران',             'Oran'),
  ('32', 'El Bayadh',         'البيض',             'El Bayadh'),
  ('33', 'Illizi',            'إليزي',             'Illizi'),
  ('34', 'Bordj Bou Arréridj','برج بوعريريج',      'Bordj Bou Arreridj'),
  ('35', 'Boumerdès',         'بومرداس',           'Boumerdes'),
  ('36', 'El Tarf',           'الطارف',            'El Tarf'),
  ('37', 'Tindouf',           'تندوف',             'Tindouf'),
  ('38', 'Tissemsilt',        'تيسمسيلت',          'Tissemsilt'),
  ('39', 'El Oued',           'الوادي',            'El Oued'),
  ('40', 'Khenchela',         'خنشلة',             'Khenchela'),
  ('41', 'Souk Ahras',        'سوق أهراس',         'Souk Ahras'),
  ('42', 'Tipaza',            'تيبازة',            'Tipaza'),
  ('43', 'Mila',              'ميلة',              'Mila'),
  ('44', 'Aïn Defla',         'عين الدفلى',        'Ain Defla'),
  ('45', 'Naâma',             'النعامة',           'Naama'),
  ('46', 'Aïn Témouchent',    'عين تموشنت',        'Ain Temouchent'),
  ('47', 'Ghardaïa',          'غرداية',            'Ghardaia'),
  ('48', 'Relizane',          'غليزان',            'Relizane'),
  ('49', 'Timimoun',          'تيميمون',           'Timimoun'),
  ('50', 'Bordj Badji Mokhtar','برج باجي مختار',   'Bordj Badji Mokhtar'),
  ('51', 'Ouled Djellal',     'أولاد جلال',        'Ouled Djellal'),
  ('52', 'Béni Abbès',        'بني عباس',          'Beni Abbes'),
  ('53', 'In Salah',          'عين صالح',          'In Salah'),
  ('54', 'In Guezzam',        'عين قزام',          'In Guezzam'),
  ('55', 'Touggourt',         'تقرت',              'Touggourt'),
  ('56', 'Djanet',            'جانت',              'Djanet'),
  ('57', 'El M''Ghair',       'المغير',            'El M''Ghair'),
  ('58', 'El Meniaa',         'المنيعة',           'El Meniaa');
