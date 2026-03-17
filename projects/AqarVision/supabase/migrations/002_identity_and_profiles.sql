-- ============================================================================
-- 002 — Identity & Profiles
-- users, profiles, mobile_devices, push_tokens, profiles_public view
-- ============================================================================

-- ── users: shadow table linked to auth.users ────────────────────────────────

create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.users is 'Shadow table for auth.users, allows FK references from other tables.';

-- ── profiles ────────────────────────────────────────────────────────────────

create table public.profiles (
  user_id          uuid primary key references public.users (id) on delete cascade,
  full_name        text,
  avatar_url       text,
  phone            text,
  role             public.user_role not null default 'end_user',
  preferred_locale text not null default 'fr'
    check (preferred_locale in ('fr', 'ar', 'en', 'es')),
  stripe_customer_id text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.profiles is 'User profile information. One row per user.';
comment on column public.profiles.stripe_customer_id is
  'Stripe Customer ID (cus_...) for individual AqarChaab users.';

-- ── profiles_public view ────────────────────────────────────────────────────

create view public.profiles_public as
  select user_id, full_name, avatar_url
  from public.profiles;

comment on view public.profiles_public is 'Public-safe subset of profile data.';

-- ── mobile_devices ──────────────────────────────────────────────────────────

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

-- ── push_tokens ─────────────────────────────────────────────────────────────

create table public.push_tokens (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users (id) on delete cascade,
  mobile_device_id uuid not null references public.mobile_devices (id) on delete cascade,
  token            text not null unique,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

comment on table public.push_tokens is 'Push notification tokens tied to a device.';
