-- M16 Listing Notes
-- Private user notes on individual listings (one per user per listing)

create table public.listing_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

alter table public.listing_notes enable row level security;

create policy notes_owner on public.listing_notes
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Index
create index idx_listing_notes_user_listing on public.listing_notes(user_id, listing_id);
