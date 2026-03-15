-- ──────────────────────────────────────────────────────────────────────────
-- 00179 — Individual billing (AqarChaab packs + subscriptions)
-- ──────────────────────────────────────────────────────────────────────────

-- 1. Stripe customer ID on profiles (for individual users)
alter table public.profiles
  add column if not exists stripe_customer_id text;

comment on column public.profiles.stripe_customer_id is
  'Stripe Customer ID (cus_...) for individual AqarChaab users.';

-- 2. One-time listing packs (permanent extra slots purchased)
create table public.individual_listing_packs (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.users(id) on delete cascade,
  pack_slug                text not null,       -- 'pack_3' | 'pack_7' | 'pack_15'
  extra_slots              integer not null check (extra_slots > 0),
  stripe_session_id        text unique,         -- checkout.session.id
  stripe_payment_intent_id text,
  created_at               timestamptz not null default now()
);

comment on table public.individual_listing_packs is
  'One-time purchases of extra listing slots for individual AqarChaab users.';

create index individual_listing_packs_user_idx
  on public.individual_listing_packs(user_id);

-- 3. Individual subscriptions (monthly quota)
create table public.individual_subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users(id) on delete cascade,
  plan_slug              text not null,       -- 'chaab_plus' | 'chaab_pro'
  stripe_subscription_id text unique,
  stripe_customer_id     text,
  status                 text not null default 'active'
                           check (status in ('active','trialing','past_due','canceled')),
  max_listings           integer not null,   -- quota given by this plan
  current_period_start   timestamptz not null default now(),
  current_period_end     timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.individual_subscriptions is
  'Monthly subscriptions for individual AqarChaab users (higher listing quota).';

create index individual_subscriptions_user_idx
  on public.individual_subscriptions(user_id);
create index individual_subscriptions_stripe_idx
  on public.individual_subscriptions(stripe_subscription_id)
  where stripe_subscription_id is not null;

-- 4. RLS — users can only see their own records

alter table public.individual_listing_packs enable row level security;
alter table public.individual_subscriptions  enable row level security;

create policy individual_packs_select_own
  on public.individual_listing_packs for select to authenticated
  using (user_id = auth.uid());

create policy individual_packs_insert_own
  on public.individual_listing_packs for insert to authenticated
  with check (user_id = auth.uid());

create policy individual_subs_select_own
  on public.individual_subscriptions for select to authenticated
  using (user_id = auth.uid());
