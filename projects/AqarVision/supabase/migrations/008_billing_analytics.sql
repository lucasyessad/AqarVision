-- ============================================================================
-- 008 — Billing, Analytics & Admin
-- plans, subscriptions, entitlements, individual billing,
-- domain_events, listing_views, agency_stats_daily, audit_logs,
-- platform_settings, verifications
-- Note: ai_prompts and ai_jobs tables removed (AI features dropped)
-- Note: plans.max_ai_jobs column removed
-- ============================================================================

-- ── plans ───────────────────────────────────────────────────────────────────

create table public.plans (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null unique,
  slug                  text not null unique,
  stripe_price_id       text unique,
  price_monthly         numeric(10,2) not null default 0,
  currency              text not null default 'DZD',
  max_listings          integer not null default 10,
  max_media_per_listing integer not null default 3,
  max_team_members      integer not null default 2,
  features              jsonb not null default '{}'::jsonb,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now()
);

-- ── subscriptions ───────────────────────────────────────────────────────────

create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  agency_id              uuid not null references public.agencies(id) on delete cascade,
  plan_id                uuid not null references public.plans(id),
  stripe_subscription_id text unique,
  status                 public.subscription_status not null default 'trialing',
  current_period_start   timestamptz not null default now(),
  current_period_end     timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ── entitlements ────────────────────────────────────────────────────────────

create table public.entitlements (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references public.agencies(id) on delete cascade,
  feature_key text not null,
  is_enabled  boolean not null default true,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  unique(agency_id, feature_key)
);

-- ── individual_listing_packs ────────────────────────────────────────────────

create table public.individual_listing_packs (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.users(id) on delete cascade,
  pack_slug                text not null,
  extra_slots              integer not null check (extra_slots > 0),
  stripe_session_id        text unique,
  stripe_payment_intent_id text,
  payment_provider         text not null default 'stripe',
  payment_status           text not null default 'confirmed'
    check (payment_status in ('pending', 'confirmed', 'failed', 'refunded')),
  amount_da                integer,
  created_at               timestamptz not null default now()
);

comment on table public.individual_listing_packs is
  'One-time purchases of extra listing slots for individual AqarChaab users.';
comment on column public.individual_listing_packs.payment_provider is
  'Provider used: stripe | cib | dahabia | baridimob | virement';

-- ── individual_subscriptions ────────────────────────────────────────────────

create table public.individual_subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users(id) on delete cascade,
  plan_slug              text not null,
  stripe_subscription_id text unique,
  stripe_customer_id     text,
  status                 text not null default 'active'
    check (status in ('active', 'trialing', 'past_due', 'canceled', 'pending')),
  max_listings           integer not null,
  current_period_start   timestamptz not null default now(),
  current_period_end     timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end   boolean not null default false,
  payment_provider       text not null default 'stripe',
  amount_da              integer,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.individual_subscriptions is
  'Monthly subscriptions for individual AqarChaab users.';
comment on column public.individual_subscriptions.payment_provider is
  'Provider used: stripe | cib | dahabia | baridimob | virement';

-- ── domain_events ───────────────────────────────────────────────────────────

create table public.domain_events (
  id             uuid primary key default gen_random_uuid(),
  event_type     text not null,
  aggregate_type text not null,
  aggregate_id   uuid not null,
  actor_id       uuid references public.users(id),
  payload        jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

-- ── listing_views ───────────────────────────────────────────────────────────

create table public.listing_views (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewer_id  uuid references public.users(id),
  session_id text,
  referrer   text,
  created_at timestamptz not null default now()
);

-- ── agency_stats_daily ──────────────────────────────────────────────────────

create table public.agency_stats_daily (
  id             uuid primary key default gen_random_uuid(),
  agency_id      uuid not null references public.agencies(id) on delete cascade,
  stat_date      date not null,
  total_views    integer not null default 0,
  total_leads    integer not null default 0,
  total_listings integer not null default 0,
  created_at     timestamptz not null default now(),
  unique(agency_id, stat_date)
);

-- ── audit_logs ──────────────────────────────────────────────────────────────

create table public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid references public.users(id),
  action        text not null,
  resource_type text not null,
  resource_id   uuid,
  old_values    jsonb,
  new_values    jsonb,
  ip_address    inet,
  created_at    timestamptz not null default now()
);

-- ── platform_settings ───────────────────────────────────────────────────────

create table public.platform_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  category    text not null default 'general',
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.users(id) on delete set null
);

comment on table public.platform_settings is
  'Platform-wide configuration settings editable by super admins via the admin dashboard.';

-- ── verifications ───────────────────────────────────────────────────────────

create table public.verifications (
  id               uuid primary key default gen_random_uuid(),
  agency_id        uuid not null references public.agencies(id) on delete cascade,
  level            integer not null default 1 check (level between 1 and 4),
  status           text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  legal_name       text,
  rc_number        text,
  document_url     text,
  nif_number       text,
  address_proof_url text,
  reviewed_by      uuid references auth.users(id),
  reviewed_at      timestamptz,
  rejection_reason text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(agency_id, level)
);

-- ── Seed default platform settings ──────────────────────────────────────────

insert into public.platform_settings (key, value, description, category) values
  -- Quotas particuliers
  ('individual_free_quota',        '2',             'Nombre d''annonces gratuites pour les particuliers',                 'quotas'),
  ('individual_free_max_photos',   '3',             'Max photos par annonce (gratuit)',                                   'quotas'),
  ('individual_max_quota_cap',     '100',           'Quota maximum absolu (abonnement Pro illimite = cette valeur)',      'quotas'),
  ('chaab_plus_max_listings',      '4',             'Max annonces chaab_plus',                                           'quotas'),
  ('chaab_plus_max_photos',        '10',            'Max photos par annonce chaab_plus',                                  'quotas'),
  ('chaab_pro_max_listings',       '6',             'Max annonces chaab_pro',                                            'quotas'),
  ('chaab_pro_max_photos',         '15',            'Max photos par annonce chaab_pro',                                   'quotas'),
  -- Plans agences (modifiables depuis /admin/platform-settings)
  ('starter_price_da',             '2900',          'Prix Starter DZD/mois',                                             'plans'),
  ('starter_max_listings',         '10',            'Max annonces Starter',                                              'plans'),
  ('starter_max_photos',           '3',             'Max photos/annonce Starter',                                        'plans'),
  ('starter_max_team',             '2',             'Max membres equipe Starter',                                        'plans'),
  ('pro_price_da',                 '6900',          'Prix Pro DZD/mois',                                                 'plans'),
  ('pro_max_listings',             '30',            'Max annonces Pro',                                                  'plans'),
  ('pro_max_photos',               '10',            'Max photos/annonce Pro',                                            'plans'),
  ('pro_max_team',                 '10',            'Max membres equipe Pro',                                            'plans'),
  ('enterprise_price_da',          '12900',         'Prix Enterprise DZD/mois',                                          'plans'),
  ('enterprise_max_listings',      '-1',            'Max annonces Enterprise (-1=illimite)',                              'plans'),
  ('enterprise_max_photos',        '20',            'Max photos/annonce Enterprise',                                     'plans'),
  ('enterprise_max_team',          '-1',            'Max membres Enterprise (-1=illimite)',                               'plans'),
  -- Payment provider
  ('payment_provider',             '"virement"',    'Provider actif: stripe | cib | dahabia | baridimob | virement',      'payments'),
  ('payment_bank_name',            '""',            'Nom de la banque pour les paiements manuels',                        'payments'),
  ('payment_account_name',         '""',            'Titulaire du compte bancaire',                                       'payments'),
  ('payment_rib',                  '""',            'RIB bancaire',                                                       'payments'),
  ('payment_ccp',                  '""',            'Numero CCP Algerie Poste',                                           'payments'),
  ('payment_iban',                 '""',            'IBAN international (si Stripe active)',                               'payments'),
  -- Pack prices
  ('pack_3_price_da',              '"≈ 500 DA"',    'Prix d''affichage pack 3 slots en DZD',                              'packs'),
  ('pack_7_price_da',              '"≈ 1 000 DA"',  'Prix d''affichage pack 7 slots en DZD',                              'packs'),
  ('pack_15_price_da',             '"≈ 1 850 DA"',  'Prix d''affichage pack 15 slots en DZD',                             'packs'),
  ('pack_3_price_eur',             '3.5',           'Prix EUR pack 3 slots (Stripe)',                                     'packs'),
  ('pack_7_price_eur',             '7.0',           'Prix EUR pack 7 slots (Stripe)',                                     'packs'),
  ('pack_15_price_eur',            '13.0',          'Prix EUR pack 15 slots (Stripe)',                                    'packs'),
  -- Subscription prices
  ('chaab_plus_price_da',          '"≈ 700 DA/mois"',  'Prix d''affichage abonnement AqarChaab+ en DZD',                 'subscriptions'),
  ('chaab_pro_price_da',           '"≈ 1 400 DA/mois"','Prix d''affichage abonnement AqarChaab Pro en DZD',              'subscriptions'),
  -- Moderation
  ('individual_listing_moderation','false',         'Activer la moderation manuelle des annonces particuliers',           'moderation'),
  ('agency_listing_moderation',    'false',         'Activer la moderation manuelle des annonces agences',               'moderation'),
  -- Platform
  ('site_maintenance_mode',        'false',         'Activer le mode maintenance (site inaccessible aux visiteurs)',      'platform'),
  ('site_contact_email',           '"contact@aqarchaab.dz"', 'Email de contact affiche sur le site',                     'platform'),
  ('eur_to_dzd_rate',              '144',           'Taux de conversion EUR→DZD indicatif (affiche uniquement)',          'platform'),
  -- Editorial
  ('editorial_hero_url',           'null'::jsonb,   'URL photo hero homepage (full-bleed, 1600x900)',                     'editorial'),
  ('editorial_split_url',          'null'::jsonb,   'URL photo split editorial (droite, 900x700)',                        'editorial'),
  ('editorial_fullbleed_url',      'null'::jsonb,   'URL photo full-bleed (1400x700)',                                   'editorial')
on conflict (key) do nothing;
