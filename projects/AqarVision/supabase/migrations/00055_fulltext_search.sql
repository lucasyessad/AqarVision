-- M03 Listings Core — Full-Text Search
-- Search vector function, trigger, GIN index, trigram index

-- ──────────────────────────────────────────────
-- listing_translation_search_vector(title, description)
-- Builds a weighted tsvector: title=A, description=B
-- Uses 'simple' config to handle multilingual content
-- ──────────────────────────────────────────────
create or replace function public.listing_translation_search_vector(p_title text, p_description text)
  returns tsvector
  language sql
  immutable
  parallel safe
as $$
  select
    setweight(to_tsvector('simple', coalesce(p_title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(p_description, '')), 'B');
$$;

comment on function public.listing_translation_search_vector(text, text) is
  'Builds a weighted tsvector from listing title (weight A) and description (weight B). Uses simple config for multilingual support (FR/AR/EN/ES).';

-- ──────────────────────────────────────────────
-- Trigger: auto-update search_vector on insert/update
-- ──────────────────────────────────────────────
create or replace function public.update_listing_search_vector()
  returns trigger
  language plpgsql
as $$
begin
  new.search_vector := public.listing_translation_search_vector(new.title, new.description);
  return new;
end;
$$;

create trigger trg_update_listing_search_vector
  before insert or update of title, description
  on public.listing_translations
  for each row
  execute function public.update_listing_search_vector();

-- ──────────────────────────────────────────────
-- GIN index on search_vector for full-text search
-- ──────────────────────────────────────────────
create index idx_listing_translations_search_vector
  on public.listing_translations
  using gin (search_vector);

-- ──────────────────────────────────────────────
-- pg_trgm GIN index on title for fuzzy/partial search
-- ──────────────────────────────────────────────
create index idx_listing_translations_title_trgm
  on public.listing_translations
  using gin (title gin_trgm_ops);
