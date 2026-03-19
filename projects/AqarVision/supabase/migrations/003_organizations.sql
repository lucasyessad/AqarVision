-- ============================================================================
-- 003 — Organizations
-- agencies, agency_branches, agency_memberships, agency_invites
-- ============================================================================

-- ── agencies ────────────────────────────────────────────────────────────────

create table public.agencies (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text not null unique,
  description         text,
  logo_url            text,
  cover_url           text,
  phone               text,
  email               text,
  is_verified         boolean not null default false,
  theme               text default 'modern',
  primary_color       text,
  accent_color        text,
  secondary_color     text,
  verification_status text not null default 'none'
    check (verification_status in ('none', 'pending', 'verified', 'rejected')),
  stripe_customer_id  text,
  whatsapp_phone      text,
  opening_hours       text,
  facebook_url        text,
  instagram_url       text,
  notification_prefs  jsonb not null default '{}',
  onboarding_progress jsonb not null default '{}',
  contact_button_order jsonb,
  storefront_content  jsonb not null default '{}',
  deleted_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on column public.agencies.whatsapp_phone is
  'WhatsApp number for agency contact (wa.me/ integration).';
comment on column public.agencies.notification_prefs is
  'JSON notification preferences: { new_lead_email: true, visit_email: true, ... }.';
comment on column public.agencies.onboarding_progress is
  'Onboarding checklist state: { logo: true, first_listing: false, ... completed_at: null }.';
comment on column public.agencies.contact_button_order is
  'Custom ContactCard button order. Null = default (call > whatsapp > message > visit).';
comment on column public.agencies.storefront_content is
  'Storefront wizard content: { hero_image_url, hero_video_url, extra_photos[], tagline, about_text, services[], custom_stats: { years_experience, satisfied_clients }, theme_extras: {} }.';

comment on column public.agencies.stripe_customer_id is
  'Stripe Customer ID (cus_...) — stored after first checkout or portal creation.';

-- ── agency_branches ─────────────────────────────────────────────────────────

create table public.agency_branches (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agencies(id) on delete cascade,
  name         text not null,
  wilaya_code  text not null,
  commune_id   bigint,
  address_text text,
  location     geography(point,4326),
  created_at   timestamptz not null default now()
);

-- ── agency_memberships ──────────────────────────────────────────────────────

create table public.agency_memberships (
  id         uuid primary key default gen_random_uuid(),
  agency_id  uuid not null references public.agencies(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  role       agency_role not null,
  is_active  boolean not null default true,
  joined_at  timestamptz,
  created_at timestamptz not null default now(),
  unique(agency_id, user_id)
);

-- ── agency_invites ──────────────────────────────────────────────────────────

create table public.agency_invites (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references public.agencies(id) on delete cascade,
  email       text not null,
  role        agency_role not null,
  token       text not null unique,
  expires_at  timestamptz not null,
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);
