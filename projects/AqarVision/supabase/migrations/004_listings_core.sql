-- ============================================================================
-- 004 — Listings Core
-- listings, listing_translations, listing_media, listing_documents
-- Includes: reference_number sequence, individual owner support, extended fields
-- ============================================================================

-- ── Sequence for reference numbers ──────────────────────────────────────────

create sequence if not exists public.listing_reference_seq
  start 1 increment 1 minvalue 1 maxvalue 9999999 cache 1;

-- ── listings ────────────────────────────────────────────────────────────────

create table public.listings (
  id                       uuid primary key default gen_random_uuid(),
  agency_id                uuid references public.agencies(id) on delete cascade,
  branch_id                uuid references public.agency_branches(id) on delete set null,
  owner_type               public.listing_owner_type not null default 'agency',
  individual_owner_id      uuid references public.users(id) on delete set null,
  current_status           public.listing_status not null default 'draft',
  current_price            numeric(14,2) not null,
  currency                 text not null default 'DZD',
  listing_type             public.listing_type not null,
  property_type            public.property_type not null,
  surface_m2               numeric(10,2),
  rooms                    integer,
  bathrooms                integer,
  wilaya_code              text not null,
  commune_id               bigint,
  location                 geography(point,4326),
  details                  jsonb not null default '{}'::jsonb,
  version                  integer not null default 1,
  reference_number         integer not null default nextval('public.listing_reference_seq') unique,
  contact_phone            text,
  show_phone               boolean default true,
  accept_messages          boolean default true,
  floor                    integer,
  total_floors             integer,
  year_built               integer,
  address_text             text,
  quality_score            integer default 0 check (quality_score between 0 and 100),
  availability_confirmed_at timestamptz,
  deleted_at               timestamptz,
  published_at             timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  constraint chk_listings_price_non_negative check (current_price >= 0),
  constraint chk_listings_surface_non_negative check (surface_m2 is null or surface_m2 >= 0),
  constraint chk_listings_rooms_non_negative check (rooms is null or rooms >= 0),
  constraint chk_listings_bathrooms_non_negative check (bathrooms is null or bathrooms >= 0),
  constraint chk_listings_details_is_object check (jsonb_typeof(details) = 'object'),
  constraint listings_owner_coherence check (
    (owner_type = 'agency'     and agency_id is not null and individual_owner_id is null) or
    (owner_type = 'individual' and individual_owner_id is not null and agency_id is null)
  )
);

comment on column public.listings.details is
  'Flexible JSON for extra attributes. Schema validated at application layer via Zod.';
comment on column public.listings.owner_type is
  'Identifies whether the listing is owned by an agency (B2C/B2B) or an individual (C2C).';
comment on column public.listings.individual_owner_id is
  'For owner_type=individual: FK to users.id of the posting user. NULL for agency listings.';

-- ── listing_translations ────────────────────────────────────────────────────

create table public.listing_translations (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.listings(id) on delete cascade,
  locale        text not null check (locale in ('fr','ar','en','es')),
  title         text not null,
  description   text not null,
  slug          text not null,
  search_vector tsvector,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(listing_id, locale),
  unique(locale, slug)
);

-- ── listing_media ───────────────────────────────────────────────────────────

create table public.listing_media (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references public.listings(id) on delete cascade,
  storage_path    text not null,
  content_type    text,
  file_size_bytes bigint,
  width           integer,
  height          integer,
  is_cover        boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

comment on column public.listing_media.storage_path is
  'Path in Supabase Storage (WebP, processed by Sharp at upload). Variants via Supabase Image Transformations at read time.';

-- ── listing_documents ───────────────────────────────────────────────────────

create table public.listing_documents (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.listings(id) on delete cascade,
  document_type public.document_type not null,
  storage_path  text not null,
  is_public     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ── listing_features (extensible feature definitions) ─────────────────────

create table public.listing_features (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  label_fr   text not null,
  label_ar   text,
  label_en   text,
  label_es   text,
  icon       text not null default 'Circle',
  category   text not null default 'exterior'
    check (category in ('exterior', 'interior', 'infrastructure', 'security')),
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.listing_features is
  'Extensible feature definitions for listings. Admin can add/edit via platform settings. Listings store feature values in details JSONB.';

create index idx_listing_features_category on public.listing_features(category, sort_order);

-- ── filter_options (configurable filter dropdown values) ──────────────────

create table public.filter_options (
  id         uuid primary key default gen_random_uuid(),
  filter_key text not null,
  value      text not null,
  label_fr   text not null,
  label_ar   text,
  label_en   text,
  label_es   text,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  unique(filter_key, value)
);

comment on table public.filter_options is
  'Configurable dropdown values for search filters. Admin can add/edit price ranges, room counts, surface options, etc. filter_key = price_sale, price_rent, rooms, bathrooms, surface, year, floor.';

create index idx_filter_options_key on public.filter_options(filter_key, sort_order);
