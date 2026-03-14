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
