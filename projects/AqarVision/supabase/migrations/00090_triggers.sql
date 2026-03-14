-- M01 Auth & Identity — Triggers

-- Auto-update updated_at on profiles
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at();

-- Auto-create users + profiles when a new auth user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ══════════════════════════════════════════════
-- M02 Agencies, Branches & Team — Triggers
-- ══════════════════════════════════════════════

-- Auto-update updated_at on agencies
create trigger trg_agencies_updated_at
  before update on public.agencies
  for each row
  execute function public.update_updated_at();

-- ══════════════════════════════════════════════
-- M03 Listings Core — Triggers
-- ══════════════════════════════════════════════

-- Auto-update updated_at on listings
create trigger trg_listings_updated_at
  before update on public.listings
  for each row
  execute function public.update_updated_at();

-- Auto-update updated_at on listing_translations
create trigger trg_listing_translations_updated_at
  before update on public.listing_translations
  for each row
  execute function public.update_updated_at();

-- ══════════════════════════════════════════════
-- M06 Leads & Messaging — Triggers & Realtime
-- ══════════════════════════════════════════════

-- Enable Realtime on messages table for live chat
alter publication supabase_realtime add table messages;
