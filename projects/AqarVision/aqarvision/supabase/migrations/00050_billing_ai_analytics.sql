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
