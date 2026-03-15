-- ──────────────────────────────────────────────────────────────────────────
-- 00181 — Platform settings table (admin-editable site configuration)
-- ──────────────────────────────────────────────────────────────────────────

-- Key-value store for all platform-level settings.
-- Admin updates these through the /admin dashboard.
-- Application reads them at runtime (cached with short TTL).

create table public.platform_settings (
  key          text primary key,
  value        jsonb not null,
  description  text,
  category     text not null default 'general',
  updated_at   timestamptz not null default now(),
  updated_by   uuid references public.users(id) on delete set null
);

comment on table public.platform_settings is
  'Platform-wide configuration settings editable by super admins via the admin dashboard.';

-- RLS: read-only for authenticated, write-only for super_admin
alter table public.platform_settings enable row level security;

create policy platform_settings_select_all
  on public.platform_settings for select to authenticated
  using (true);

create policy platform_settings_write_admin
  on public.platform_settings for all to authenticated
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

-- Trigger: auto-update updated_at
create trigger platform_settings_updated_at
  before update on public.platform_settings
  for each row execute function public.update_updated_at();

-- ── Seed default settings ────────────────────────────────────────────────

insert into public.platform_settings (key, value, description, category) values

-- Quotas
('individual_free_quota',        '2',             'Nombre d''annonces gratuites pour les particuliers',                 'quotas'),
('individual_max_quota_cap',     '100',           'Quota maximum absolu (abonnement Pro illimité = cette valeur)',       'quotas'),

-- Payment provider
('payment_provider',             '"virement"',    'Provider actif: stripe | cib | dahabia | baridimob | virement',      'payments'),
('payment_bank_name',            '""',            'Nom de la banque pour les paiements manuels',                        'payments'),
('payment_account_name',         '""',            'Titulaire du compte bancaire',                                       'payments'),
('payment_rib',                  '""',            'RIB bancaire',                                                       'payments'),
('payment_ccp',                  '""',            'Numéro CCP Algérie Poste',                                           'payments'),
('payment_iban',                 '""',            'IBAN international (si Stripe activé)',                              'payments'),

-- Pack prices (informational DZD display)
('pack_3_price_da',              '"≈ 500 DA"',    'Prix d''affichage pack 3 slots en DZD',                              'packs'),
('pack_7_price_da',              '"≈ 1 000 DA"',  'Prix d''affichage pack 7 slots en DZD',                              'packs'),
('pack_15_price_da',             '"≈ 1 850 DA"',  'Prix d''affichage pack 15 slots en DZD',                             'packs'),

-- EUR prices (for Stripe)
('pack_3_price_eur',             '3.5',           'Prix EUR pack 3 slots (Stripe)',                                     'packs'),
('pack_7_price_eur',             '7.0',           'Prix EUR pack 7 slots (Stripe)',                                     'packs'),
('pack_15_price_eur',            '13.0',          'Prix EUR pack 15 slots (Stripe)',                                    'packs'),

-- Subscription prices
('chaab_plus_price_da',          '"≈ 700 DA/mois"',  'Prix d''affichage abonnement AqarChaab+ en DZD',                 'subscriptions'),
('chaab_pro_price_da',           '"≈ 1 400 DA/mois"','Prix d''affichage abonnement AqarChaab Pro en DZD',              'subscriptions'),

-- Moderation
('individual_listing_moderation','false',         'Activer la modération manuelle des annonces particuliers',           'moderation'),
('agency_listing_moderation',    'false',         'Activer la modération manuelle des annonces agences',               'moderation'),

-- Platform
('site_maintenance_mode',        'false',         'Activer le mode maintenance (site inaccessible aux visiteurs)',      'platform'),
('site_contact_email',           '"contact@aqarchaab.dz"', 'Email de contact affiché sur le site',                    'platform'),
('eur_to_dzd_rate',              '144',           'Taux de conversion EUR→DZD indicatif (affiché uniquement)',          'platform')

on conflict (key) do nothing;
