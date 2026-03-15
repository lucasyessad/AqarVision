-- ──────────────────────────────────────────────────────────────────────────
-- 00178 — Individual listings (AqarChaab)
-- Allow non-agency users (particuliers) to post listings directly.
-- ──────────────────────────────────────────────────────────────────────────

-- 1. Make agency_id nullable — individual listings have no agency
alter table public.listings
  alter column agency_id drop not null;

-- 2. Owner type enum
create type public.listing_owner_type as enum ('agency', 'individual');

-- 3. Add owner columns
alter table public.listings
  add column owner_type public.listing_owner_type not null default 'agency',
  add column individual_owner_id uuid references public.users(id) on delete set null;

-- 4. Coherence constraint: agency XOR individual
alter table public.listings
  add constraint listings_owner_coherence check (
    (owner_type = 'agency'     and agency_id is not null and individual_owner_id is null) or
    (owner_type = 'individual' and individual_owner_id is not null and agency_id is null)
  );

-- 5. RLS — particuliers can insert their own listings
create policy listings_insert_individual
  on public.listings
  for insert
  to authenticated
  with check (
    owner_type = 'individual'
    and individual_owner_id = auth.uid()
    and agency_id is null
  );

-- 6. RLS — particuliers can view their own listings (including drafts)
create policy listings_select_individual
  on public.listings
  for select
  to authenticated
  using (
    owner_type = 'individual'
    and individual_owner_id = auth.uid()
  );

-- 7. RLS — particuliers can update their own listings
create policy listings_update_individual
  on public.listings
  for update
  to authenticated
  using  (owner_type = 'individual' and individual_owner_id = auth.uid())
  with check (owner_type = 'individual' and individual_owner_id = auth.uid());

-- 8. RLS — particuliers can soft-delete (update deleted_at) their own listings
--    We reuse the update policy for soft-delete (no separate DELETE policy needed
--    since the app uses soft-delete pattern via deleted_at).

-- 9. Performance index
create index listings_individual_owner_idx
  on public.listings(individual_owner_id)
  where owner_type = 'individual';

comment on column public.listings.owner_type is
  'Identifies whether the listing is owned by an agency (B2C/B2B) or an individual (C2C).';
comment on column public.listings.individual_owner_id is
  'For owner_type=individual: FK to users.id of the posting user. NULL for agency listings.';
