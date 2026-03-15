-- ──────────────────────────────────────────────────────────────────────────
-- 00180 — Payment provider columns for individual billing
--         (supports non-Stripe providers: CIB, Dahabia, BaridiMob, virement)
-- ──────────────────────────────────────────────────────────────────────────

-- 1. Add payment provider tracking to individual_listing_packs
alter table public.individual_listing_packs
  add column if not exists payment_provider text not null default 'stripe',
  add column if not exists payment_status   text not null default 'confirmed'
    check (payment_status in ('pending', 'confirmed', 'failed', 'refunded')),
  add column if not exists amount_da        integer; -- informational DZD amount

comment on column public.individual_listing_packs.payment_provider is
  'Provider used: stripe | cib | dahabia | baridimob | virement';
comment on column public.individual_listing_packs.payment_status is
  'confirmed = slots active; pending = awaiting manual validation';

-- 2. Add payment provider tracking to individual_subscriptions
alter table public.individual_subscriptions
  add column if not exists payment_provider text not null default 'stripe',
  add column if not exists amount_da        integer; -- informational DZD amount

-- Extend status check to include 'pending' (awaiting manual validation)
alter table public.individual_subscriptions
  drop constraint if exists individual_subscriptions_status_check;

alter table public.individual_subscriptions
  add constraint individual_subscriptions_status_check
  check (status in ('active', 'trialing', 'past_due', 'canceled', 'pending'));

comment on column public.individual_subscriptions.payment_provider is
  'Provider used: stripe | cib | dahabia | baridimob | virement';

-- 3. Admin can view/update pending payments (service role bypasses RLS,
--    but add policy for authenticated admin reads via is_super_admin())
create policy individual_packs_admin_all
  on public.individual_listing_packs for all to authenticated
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

create policy individual_subs_admin_all
  on public.individual_subscriptions for all to authenticated
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));
