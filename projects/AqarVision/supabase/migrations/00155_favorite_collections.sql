-- M15 Favorite Collections
-- Allows users to organize favorites into named collections

-- ──────────────────────────────────────────────
-- favorite_collections
-- ──────────────────────────────────────────────
create table public.favorite_collections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

-- Add collection_id to favorites
alter table public.favorites
  add column if not exists collection_id uuid
    references public.favorite_collections(id) on delete set null;

-- RLS
alter table public.favorite_collections enable row level security;

create policy collections_owner on public.favorite_collections
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Indexes
create index idx_favorite_collections_user_id on public.favorite_collections(user_id);
create index idx_favorites_collection_id on public.favorites(collection_id);
