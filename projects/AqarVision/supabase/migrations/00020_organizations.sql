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
