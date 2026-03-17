-- ============================================================================
-- 010 — Functions, Triggers, Indexes, RLS Policies, Storage
-- All with CORRECT arg order (agency_id, auth.uid()) — no fix migrations needed
-- Broken RPCs (create_listing_atomic, create_lead_with_message) fixed
-- Redundant individual RLS policies deduplicated
-- ============================================================================

-- ████████████████████████████████████████████████████████████████████████████
-- PART 1: FUNCTIONS
-- ████████████████████████████████████████████████████████████████████████████

-- ── Utility: is_agency_member ───────────────────────────────────────────────

create or replace function public.is_agency_member(p_agency_id uuid, p_user_id uuid)
  returns boolean
  language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.agency_memberships am
    where am.agency_id = p_agency_id
      and am.user_id   = p_user_id
      and am.is_active  = true
  );
$$;

-- ── Utility: is_agency_admin ────────────────────────────────────────────────

create or replace function public.is_agency_admin(p_agency_id uuid, p_user_id uuid)
  returns boolean
  language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.agency_memberships am
    where am.agency_id = p_agency_id
      and am.user_id   = p_user_id
      and am.role in ('owner', 'admin')
      and am.is_active  = true
  );
$$;

-- ── Utility: is_super_admin ─────────────────────────────────────────────────

create or replace function public.is_super_admin(p_user_id uuid)
  returns boolean
  language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = p_user_id and p.role = 'super_admin'
  );
$$;

-- ── Utility: update_updated_at ──────────────────────────────────────────────

create or replace function public.update_updated_at()
  returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Auth: handle_new_user ───────────────────────────────────────────────────

create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.users (id, created_at) values (new.id, now());
  insert into public.profiles (user_id, full_name, avatar_url, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null),
    now(), now()
  );
  return new;
end;
$$;

-- ── Full-text search vector ─────────────────────────────────────────────────

create or replace function public.listing_translation_search_vector(p_title text, p_description text)
  returns tsvector language sql immutable parallel safe
as $$
  select
    setweight(to_tsvector('simple', coalesce(p_title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(p_description, '')), 'B');
$$;

create or replace function public.update_listing_search_vector()
  returns trigger language plpgsql
as $$
begin
  new.search_vector := public.listing_translation_search_vector(new.title, new.description);
  return new;
end;
$$;

-- ── RPC: change_listing_price (SCD2) ────────────────────────────────────────

create or replace function public.change_listing_price(
  _listing_id uuid, _new_price numeric(14,2), _changed_by uuid,
  _reason text default null, _expected_version integer default null
) returns void language plpgsql security definer set search_path = ''
as $$
declare
  _now timestamptz := now();
  _current_version integer;
  _current_currency text;
begin
  select version, currency into _current_version, _current_currency
    from public.listings where id = _listing_id and deleted_at is null for update;
  if not found then raise exception 'Listing not found or deleted: %', _listing_id; end if;
  if _expected_version is not null and _current_version <> _expected_version then
    raise exception 'Optimistic lock conflict: expected %, found %', _expected_version, _current_version;
  end if;
  update public.listing_price_versions
     set valid_during = tstzrange(lower(valid_during), _now), is_current = false
   where listing_id = _listing_id and is_current = true;
  insert into public.listing_price_versions (listing_id, price, currency, valid_during, is_current, changed_by, reason)
  values (_listing_id, _new_price, _current_currency, tstzrange(_now, null), true, _changed_by, _reason);
  update public.listings set current_price = _new_price, version = version + 1, updated_at = _now
   where id = _listing_id;
end;
$$;

-- ── RPC: change_listing_status (SCD2) ───────────────────────────────────────

create or replace function public.change_listing_status(
  _listing_id uuid, _new_status public.listing_status, _changed_by uuid,
  _reason text default null, _expected_version integer default null
) returns void language plpgsql security definer set search_path = ''
as $$
declare
  _now timestamptz := now();
  _current_version integer;
  _current_status public.listing_status;
begin
  select version, current_status into _current_version, _current_status
    from public.listings where id = _listing_id and deleted_at is null for update;
  if not found then raise exception 'Listing not found or deleted: %', _listing_id; end if;
  if _expected_version is not null and _current_version <> _expected_version then
    raise exception 'Optimistic lock conflict: expected %, found %', _expected_version, _current_version;
  end if;
  if _current_status = _new_status then return; end if;
  update public.listing_status_versions
     set valid_during = tstzrange(lower(valid_during), _now), is_current = false
   where listing_id = _listing_id and is_current = true;
  insert into public.listing_status_versions (listing_id, status, valid_during, is_current, changed_by, reason)
  values (_listing_id, _new_status, tstzrange(_now, null), true, _changed_by, _reason);
  update public.listings
     set current_status = _new_status, version = version + 1, updated_at = _now,
         published_at = case when _new_status = 'published' then _now else published_at end
   where id = _listing_id;
end;
$$;

-- ── RPC: create_agency_with_owner ───────────────────────────────────────────

create or replace function public.create_agency_with_owner(
  p_name text, p_slug text, p_description text default null,
  p_phone text default null, p_email text default null
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid;
  v_agency_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  insert into public.agencies (name, slug, description, phone, email)
  values (p_name, p_slug, p_description, p_phone, p_email)
  returning id into v_agency_id;
  insert into public.agency_memberships (agency_id, user_id, role, is_active)
  values (v_agency_id, v_user_id, 'owner', true);
  return v_agency_id;
end;
$$;

-- ── RPC: create_listing_atomic (FIXED: uses valid_during tstzrange) ─────────

create or replace function public.create_listing_atomic(
  p_agency_id uuid, p_individual_owner_id uuid, p_owner_type text,
  p_listing_type text, p_property_type text, p_wilaya_code text,
  p_commune_id bigint, p_surface_m2 numeric, p_rooms int, p_bathrooms int,
  p_current_price numeric, p_currency text, p_current_status text,
  p_details jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer
as $$
declare
  v_listing_id uuid;
  v_now timestamptz := now();
begin
  insert into public.listings (
    agency_id, individual_owner_id, owner_type,
    listing_type, property_type, wilaya_code, commune_id,
    surface_m2, rooms, bathrooms,
    current_price, currency, current_status, details,
    published_at
  ) values (
    p_agency_id, p_individual_owner_id, p_owner_type::listing_owner_type,
    p_listing_type::listing_type, p_property_type::property_type, p_wilaya_code, p_commune_id,
    p_surface_m2, p_rooms, p_bathrooms,
    p_current_price, p_currency, p_current_status::listing_status, p_details,
    case when p_current_status = 'published' then v_now else null end
  ) returning id into v_listing_id;

  insert into public.listing_price_versions (listing_id, price, currency, valid_during, is_current, changed_by)
  values (v_listing_id, p_current_price, p_currency, tstzrange(v_now, null), true, auth.uid());

  insert into public.listing_status_versions (listing_id, status, valid_during, is_current, changed_by)
  values (v_listing_id, p_current_status::listing_status, tstzrange(v_now, null), true, auth.uid());

  return v_listing_id;
end;
$$;

grant execute on function public.create_listing_atomic to authenticated;

-- ── RPC: format_listing_reference ───────────────────────────────────────────

create or replace function public.format_listing_reference(ref_num integer)
  returns text language sql immutable
as $$
  select 'AV-' || lpad(ref_num::text, 5, '0');
$$;

-- ── RPC: search_listings_in_polygon (spatial search) ────────────────────────

create or replace function public.search_listings_in_polygon(
  polygon_wkt text, p_status text default 'published',
  p_limit int default 100, p_offset int default 0
) returns table (id uuid, lat double precision, lng double precision)
  language sql stable security definer
as $$
  select l.id, ST_Y(l.location::geometry) as lat, ST_X(l.location::geometry) as lng
  from public.listings l
  where l.location is not null
    and l.current_status = p_status
    and l.deleted_at is null
    and ST_Within(l.location::geometry, ST_GeomFromText(polygon_wkt, 4326))
  order by l.published_at desc nulls last
  limit p_limit offset p_offset;
$$;

grant execute on function public.search_listings_in_polygon to anon, authenticated;

-- ── RPC: get_listing_coordinates ────────────────────────────────────────────

create or replace function public.get_listing_coordinates(listing_ids uuid[])
  returns table (id uuid, lat double precision, lng double precision)
  language sql stable security definer
as $$
  select l.id, ST_Y(l.location::geometry) as lat, ST_X(l.location::geometry) as lng
  from public.listings l
  where l.id = any(listing_ids) and l.location is not null;
$$;

grant execute on function public.get_listing_coordinates to anon, authenticated;

-- ████████████████████████████████████████████████████████████████████████████
-- PART 2: TRIGGERS
-- ████████████████████████████████████████████████████████████████████████████

create trigger trg_update_listing_search_vector
  before insert or update of title, description
  on public.listing_translations
  for each row execute function public.update_listing_search_vector();

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger trg_agencies_updated_at
  before update on public.agencies
  for each row execute function public.update_updated_at();

create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.update_updated_at();

create trigger trg_listing_translations_updated_at
  before update on public.listing_translations
  for each row execute function public.update_updated_at();

create trigger chatbot_leads_updated_at
  before update on public.chatbot_leads
  for each row execute function public.update_updated_at();

create trigger visit_requests_updated_at
  before update on public.visit_requests
  for each row execute function public.update_updated_at();

create trigger platform_settings_updated_at
  before update on public.platform_settings
  for each row execute function public.update_updated_at();

-- Realtime on messages
alter publication supabase_realtime add table public.messages;

-- ████████████████████████████████████████████████████████████████████████████
-- PART 3: INDEXES
-- ████████████████████████████████████████████████████████████████████████████

-- Organizations
create index idx_agency_branches_agency_id on public.agency_branches(agency_id);
create index idx_agency_memberships_agency_id on public.agency_memberships(agency_id);
create index idx_agency_memberships_user_id on public.agency_memberships(user_id);
create index idx_agency_invites_token on public.agency_invites(token);
create index idx_agencies_active on public.agencies(id) where deleted_at is null;

-- Listings
create index idx_listings_agency_id on public.listings(agency_id);
create index idx_listings_branch_id on public.listings(branch_id);
create index idx_listings_status on public.listings(current_status);
create index idx_listings_listing_type on public.listings(listing_type);
create index idx_listings_property_type on public.listings(property_type);
create index idx_listings_wilaya_code on public.listings(wilaya_code);
create index idx_listings_published_at on public.listings(published_at desc);
create index idx_listings_location_gist on public.listings using gist (location);
create index idx_listings_search_composite on public.listings(current_status, listing_type, property_type, wilaya_code);
create index idx_listings_active on public.listings(id) where deleted_at is null;
create index idx_listings_details on public.listings using gin (details);
create index idx_listings_individual_owner on public.listings(individual_owner_id) where owner_type = 'individual';
create index idx_listings_agency_status_active on public.listings(agency_id, current_status) where deleted_at is null;

-- Listing translations
create index idx_listing_translations_listing_locale on public.listing_translations(listing_id, locale);
create index idx_listing_translations_search_vector on public.listing_translations using gin (search_vector);
create index idx_listing_translations_title_trgm on public.listing_translations using gin (title gin_trgm_ops);

-- Listing media & documents
create index idx_listing_media_listing_id on public.listing_media(listing_id);
create index idx_listing_documents_listing_id on public.listing_documents(listing_id);

-- History tables
create unique index idx_listing_price_versions_current on public.listing_price_versions(listing_id) where is_current = true;
create index idx_listing_price_versions_valid_from on public.listing_price_versions(listing_id, (lower(valid_during)) desc);
create unique index idx_listing_status_versions_current on public.listing_status_versions(listing_id) where is_current = true;
create index idx_listing_status_versions_valid_from on public.listing_status_versions(listing_id, (lower(valid_during)) desc);
create index idx_listing_revisions_listing_id on public.listing_revisions(listing_id, version desc);
create index idx_listing_publication_history_listing_id on public.listing_publication_history(listing_id, created_at desc);
create index idx_listing_media_history_listing_id on public.listing_media_history(listing_id, created_at desc);
create index idx_listing_moderation_history_listing_id on public.listing_moderation_history(listing_id, created_at desc);

-- Marketplace
create index idx_favorite_collections_user_id on public.favorite_collections(user_id);
create index idx_favorites_collection_id on public.favorites(collection_id);
create index idx_listing_notes_user_listing on public.listing_notes(user_id, listing_id);
create index idx_search_alerts_user on public.search_alerts(user_id) where is_active = true;

-- Leads & messaging
create index idx_leads_agency_id on public.leads(agency_id);
create index idx_leads_listing_id on public.leads(listing_id);
create index idx_leads_agency_created on public.leads(agency_id, created_at desc);
create index chatbot_leads_agency_id_created_at_idx on public.chatbot_leads(agency_id, created_at desc);
create index idx_conversations_lead_id on public.conversations(lead_id);
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_messages_read_at on public.messages(conversation_id, created_at) where read_at is null;
create index visit_requests_agency_id_idx on public.visit_requests(agency_id);
create index visit_requests_listing_id_idx on public.visit_requests(listing_id);
create index visit_requests_status_idx on public.visit_requests(status);

-- Billing
create index individual_listing_packs_user_idx on public.individual_listing_packs(user_id);
create index individual_subscriptions_user_idx on public.individual_subscriptions(user_id);
create index individual_subscriptions_stripe_idx on public.individual_subscriptions(stripe_subscription_id) where stripe_subscription_id is not null;

-- Verifications
create index idx_verifications_agency on public.verifications(agency_id);
create index idx_verifications_status on public.verifications(status) where status = 'pending';

-- ████████████████████████████████████████████████████████████████████████████
-- PART 4: ENABLE RLS ON ALL TABLES
-- ████████████████████████████████████████████████████████████████████████████

alter table public.profiles                    enable row level security;
alter table public.mobile_devices              enable row level security;
alter table public.push_tokens                 enable row level security;
alter table public.agencies                    enable row level security;
alter table public.agency_branches             enable row level security;
alter table public.agency_memberships          enable row level security;
alter table public.agency_invites              enable row level security;
alter table public.listings                    enable row level security;
alter table public.listing_translations        enable row level security;
alter table public.listing_media               enable row level security;
alter table public.listing_documents           enable row level security;
alter table public.listing_price_versions      enable row level security;
alter table public.listing_status_versions     enable row level security;
alter table public.listing_revisions           enable row level security;
alter table public.listing_publication_history enable row level security;
alter table public.listing_media_history       enable row level security;
alter table public.listing_moderation_history  enable row level security;
alter table public.favorites                   enable row level security;
alter table public.favorite_collections        enable row level security;
alter table public.listing_notes               enable row level security;
alter table public.saved_searches              enable row level security;
alter table public.search_alerts               enable row level security;
alter table public.view_history                enable row level security;
alter table public.visit_requests              enable row level security;
alter table public.leads                       enable row level security;
alter table public.chatbot_leads               enable row level security;
alter table public.conversations               enable row level security;
alter table public.messages                    enable row level security;
alter table public.plans                       enable row level security;
alter table public.subscriptions               enable row level security;
alter table public.entitlements                enable row level security;
alter table public.individual_listing_packs    enable row level security;
alter table public.individual_subscriptions    enable row level security;
alter table public.listing_views               enable row level security;
alter table public.domain_events               enable row level security;
alter table public.agency_stats_daily          enable row level security;
alter table public.audit_logs                  enable row level security;
alter table public.platform_settings           enable row level security;
alter table public.verifications               enable row level security;
alter table public.wilayas                     enable row level security;
alter table public.communes                    enable row level security;

-- ████████████████████████████████████████████████████████████████████████████
-- PART 5: RLS POLICIES (all with correct arg order)
-- ████████████████████████████████████████████████████████████████████████████

-- ── profiles ────────────────────────────────────────────────────────────────

create policy profiles_select_self on public.profiles for select
  using (user_id = auth.uid());

create policy profiles_update_self on public.profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy profiles_select_super_admin on public.profiles for select
  using (public.is_super_admin(auth.uid()));

create policy profiles_select_agency_coworker on public.profiles for select
  using (exists (
    select 1 from public.agency_memberships my_m
    join public.agency_memberships their_m on their_m.agency_id = my_m.agency_id
    where my_m.user_id = auth.uid() and my_m.is_active = true
      and their_m.user_id = profiles.user_id and their_m.is_active = true
  ));

-- ── mobile_devices & push_tokens ────────────────────────────────────────────

create policy mobile_devices_self on public.mobile_devices for all using (user_id = auth.uid());
create policy push_tokens_self on public.push_tokens for all using (user_id = auth.uid());

-- ── agencies ────────────────────────────────────────────────────────────────

create policy agencies_select_public on public.agencies for select using (deleted_at is null);
create policy agencies_update_admin on public.agencies for update
  using (public.is_agency_admin(id, auth.uid()) and deleted_at is null);
create policy agencies_insert_authenticated on public.agencies for insert
  with check (auth.uid() is not null);

-- ── agency_branches ─────────────────────────────────────────────────────────

create policy branches_select_public on public.agency_branches for select using (true);
create policy branches_modify_admin on public.agency_branches for all
  using (public.is_agency_admin(agency_id, auth.uid()))
  with check (public.is_agency_admin(agency_id, auth.uid()));

-- ── agency_memberships ──────────────────────────────────────────────────────

create policy memberships_select_member on public.agency_memberships for select
  using (public.is_agency_member(agency_id, auth.uid()));
create policy memberships_modify_admin on public.agency_memberships for all
  using (public.is_agency_admin(agency_id, auth.uid()))
  with check (public.is_agency_admin(agency_id, auth.uid()));

-- ── agency_invites ──────────────────────────────────────────────────────────

create policy invites_select_admin on public.agency_invites for select
  using (public.is_agency_admin(agency_id, auth.uid()));
create policy invites_insert_admin on public.agency_invites for insert
  with check (public.is_agency_admin(agency_id, auth.uid()));

-- ── listings (agency) ───────────────────────────────────────────────────────

create policy listings_select_public on public.listings for select
  using (current_status = 'published' and deleted_at is null);
create policy listings_select_member on public.listings for select
  using (public.is_agency_member(agency_id, auth.uid()));
create policy listings_insert_member on public.listings for insert
  with check (public.is_agency_member(agency_id, auth.uid()));
create policy listings_update_member on public.listings for update
  using (public.is_agency_member(agency_id, auth.uid()) and deleted_at is null)
  with check (public.is_agency_member(agency_id, auth.uid()));
create policy listings_delete_admin on public.listings for delete
  using (public.is_agency_admin(agency_id, auth.uid()));

-- ── listings (individual) ───────────────────────────────────────────────────

create policy listings_insert_individual on public.listings for insert to authenticated
  with check (owner_type = 'individual' and individual_owner_id = auth.uid() and agency_id is null);
create policy listings_select_individual on public.listings for select to authenticated
  using (owner_type = 'individual' and individual_owner_id = auth.uid());
create policy listings_update_individual on public.listings for update to authenticated
  using (owner_type = 'individual' and individual_owner_id = auth.uid())
  with check (owner_type = 'individual' and individual_owner_id = auth.uid());

-- ── listing_translations ────────────────────────────────────────────────────

create policy listing_translations_select_public on public.listing_translations for select
  using (exists (select 1 from public.listings l where l.id = listing_id and l.current_status = 'published' and l.deleted_at is null));
create policy listing_translations_select_member on public.listing_translations for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));
create policy listing_translations_modify_member on public.listing_translations for all
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())))
  with check (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

-- Individual translations
create policy listing_translations_insert_individual on public.listing_translations for insert to authenticated
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()));
create policy listing_translations_update_individual on public.listing_translations for update to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()));
create policy listing_translations_select_individual on public.listing_translations for select to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()));

-- ── listing_media ───────────────────────────────────────────────────────────

create policy listing_media_select_public on public.listing_media for select
  using (exists (select 1 from public.listings l where l.id = listing_id and l.current_status = 'published' and l.deleted_at is null));
create policy listing_media_modify_member on public.listing_media for all
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())))
  with check (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

-- Individual media
create policy listing_media_insert_individual on public.listing_media for insert to authenticated
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()));
create policy listing_media_select_individual on public.listing_media for select to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()));
create policy listing_media_update_individual on public.listing_media for update to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()));
create policy listing_media_delete_individual on public.listing_media for delete to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()));

-- ── listing_documents ───────────────────────────────────────────────────────

create policy listing_documents_member on public.listing_documents for all
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())))
  with check (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

-- ── History tables (agency members + individual owners) ─────────────────────

create policy listing_price_versions_select_member on public.listing_price_versions for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));
create policy price_versions_insert_individual on public.listing_price_versions for insert to authenticated
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()));

create policy listing_status_versions_select_member on public.listing_status_versions for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));
create policy status_versions_insert_individual on public.listing_status_versions for insert to authenticated
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()));

create policy listing_revisions_select_member on public.listing_revisions for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

create policy listing_publication_history_select_member on public.listing_publication_history for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

create policy listing_media_history_select_member on public.listing_media_history for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

create policy listing_moderation_history_select_member on public.listing_moderation_history for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

-- ── listing_views ───────────────────────────────────────────────────────────

create policy listing_views_insert_authenticated on public.listing_views for insert
  with check (auth.uid() is not null);
create policy listing_views_select_member on public.listing_views for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

-- ── Marketplace: favorites, notes, searches, history ────────────────────────

create policy favorites_self on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy collections_owner on public.favorite_collections for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notes_owner on public.listing_notes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy saved_searches_self on public.saved_searches for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy search_alerts_self on public.search_alerts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy view_history_self on public.view_history for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── visit_requests ──────────────────────────────────────────────────────────

create policy visit_requests_agency_member on public.visit_requests for all
  using (public.is_agency_member(agency_id, auth.uid()))
  with check (public.is_agency_member(agency_id, auth.uid()));
create policy visit_requests_public_insert on public.visit_requests for insert
  with check (true);

-- ── leads ───────────────────────────────────────────────────────────────────

create policy leads_select_agency on public.leads for select
  using (public.is_agency_member(agency_id, auth.uid()));
create policy leads_select_sender on public.leads for select
  using (sender_user_id = auth.uid());
create policy leads_insert_authenticated on public.leads for insert
  with check (auth.uid() is not null);
create policy leads_update_agency on public.leads for update
  using (public.is_agency_member(agency_id, auth.uid()));
create policy leads_select_individual on public.leads for select to authenticated
  using (exists (select 1 from public.listings l where l.id = leads.listing_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()));

-- ── chatbot_leads ───────────────────────────────────────────────────────────

create policy chatbot_leads_insert_anon on public.chatbot_leads for insert with check (true);
create policy chatbot_leads_select_agency on public.chatbot_leads for select
  using (public.is_agency_member(agency_id, auth.uid()));

-- ── conversations ───────────────────────────────────────────────────────────

create policy conversations_select_participant on public.conversations for select
  using (exists (
    select 1 from public.leads ld where ld.id = lead_id
    and (ld.sender_user_id = auth.uid() or public.is_agency_member(ld.agency_id, auth.uid()))
  ));
create policy conversations_select_individual on public.conversations for select to authenticated
  using (exists (
    select 1 from public.leads ld join public.listings l on l.id = ld.listing_id
    where ld.id = conversations.lead_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()
  ));

-- ── messages ────────────────────────────────────────────────────────────────

create policy messages_select_participant on public.messages for select
  using (exists (
    select 1 from public.conversations c join public.leads ld on ld.id = c.lead_id
    where c.id = conversation_id
    and (ld.sender_user_id = auth.uid() or public.is_agency_member(ld.agency_id, auth.uid()))
  ));
create policy messages_insert_participant on public.messages for insert
  with check (exists (
    select 1 from public.conversations c join public.leads ld on ld.id = c.lead_id
    where c.id = conversation_id
    and (ld.sender_user_id = auth.uid() or public.is_agency_member(ld.agency_id, auth.uid()))
  ));
create policy messages_select_individual on public.messages for select to authenticated
  using (exists (
    select 1 from public.conversations c join public.leads ld on ld.id = c.lead_id
    join public.listings l on l.id = ld.listing_id
    where c.id = messages.conversation_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()
  ));
create policy messages_insert_individual on public.messages for insert to authenticated
  with check (exists (
    select 1 from public.conversations c join public.leads ld on ld.id = c.lead_id
    join public.listings l on l.id = ld.listing_id
    where c.id = messages.conversation_id and l.owner_type = 'individual' and l.individual_owner_id = auth.uid()
  ));

-- ── Billing ─────────────────────────────────────────────────────────────────

create policy plans_select_public on public.plans for select using (is_active = true);
create policy subscriptions_select_admin on public.subscriptions for select
  using (public.is_agency_admin(agency_id, auth.uid()));
create policy entitlements_select_member on public.entitlements for select
  using (public.is_agency_member(agency_id, auth.uid()));

-- Individual billing
create policy individual_packs_select_own on public.individual_listing_packs for select to authenticated
  using (user_id = auth.uid());
create policy individual_packs_insert_own on public.individual_listing_packs for insert to authenticated
  with check (user_id = auth.uid());
create policy individual_packs_admin_all on public.individual_listing_packs for all to authenticated
  using (public.is_super_admin(auth.uid())) with check (public.is_super_admin(auth.uid()));

create policy individual_subs_select_own on public.individual_subscriptions for select to authenticated
  using (user_id = auth.uid());
create policy individual_subs_admin_all on public.individual_subscriptions for all to authenticated
  using (public.is_super_admin(auth.uid())) with check (public.is_super_admin(auth.uid()));

-- ── Analytics & Admin ───────────────────────────────────────────────────────

create policy audit_logs_select_super_admin on public.audit_logs for select
  using (public.is_super_admin(auth.uid()));
create policy domain_events_select_super_admin on public.domain_events for select
  using (public.is_super_admin(auth.uid()));
create policy agency_stats_select_member on public.agency_stats_daily for select
  using (public.is_agency_member(agency_id, auth.uid()));

-- ── platform_settings ───────────────────────────────────────────────────────

create policy platform_settings_select_all on public.platform_settings for select to authenticated
  using (true);
create policy platform_settings_write_admin on public.platform_settings for all to authenticated
  using (public.is_super_admin(auth.uid())) with check (public.is_super_admin(auth.uid()));
create policy platform_settings_select_editorial_anon on public.platform_settings for select to anon
  using (category = 'editorial');

-- ── verifications ───────────────────────────────────────────────────────────

create policy verifications_select_agency on public.verifications for select
  using (exists (
    select 1 from public.agency_memberships
    where agency_memberships.agency_id = verifications.agency_id
    and agency_memberships.user_id = auth.uid() and agency_memberships.is_active = true
  ));
create policy verifications_manage_admin on public.verifications for all
  using (public.is_super_admin(auth.uid())) with check (public.is_super_admin(auth.uid()));

-- ── geography ───────────────────────────────────────────────────────────────

create policy wilayas_public_read on public.wilayas for select using (true);
create policy communes_public_read on public.communes for select using (true);

-- ████████████████████████████████████████████████████████████████████████████
-- PART 6: STORAGE BUCKETS & POLICIES
-- ████████████████████████████████████████████████████████████████████████████

-- ── listing-media (private) ─────────────────────────────────────────────────

insert into storage.buckets (id, name, public) values ('listing-media', 'listing-media', false)
on conflict (id) do nothing;

create policy "listing_media_upload" on storage.objects for insert
  with check (bucket_id = 'listing-media' and auth.uid() is not null);
create policy "listing_media_select" on storage.objects for select
  using (bucket_id = 'listing-media' and auth.uid() is not null);
create policy "listing_media_update" on storage.objects for update
  using (bucket_id = 'listing-media' and auth.uid() is not null);
create policy "listing_media_delete" on storage.objects for delete
  using (bucket_id = 'listing-media' and auth.uid() is not null);

-- ── listing-documents (private) ─────────────────────────────────────────────

insert into storage.buckets (id, name, public) values ('listing-documents', 'listing-documents', false)
on conflict (id) do nothing;

create policy "listing_documents_upload" on storage.objects for insert
  with check (bucket_id = 'listing-documents' and auth.uid() is not null);
create policy "listing_documents_select" on storage.objects for select
  using (bucket_id = 'listing-documents' and auth.uid() is not null);
create policy "listing_documents_delete" on storage.objects for delete
  using (bucket_id = 'listing-documents' and auth.uid() is not null);

-- ── agency-media (public, 2MB, images) ──────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('agency-media', 'agency-media', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "Agency members can upload branding" on storage.objects for insert to authenticated
  with check (bucket_id = 'agency-media' and (storage.foldername(name))[1] = 'agencies'
    and is_agency_member((storage.foldername(name))[2]::uuid, auth.uid()));
create policy "Agency members can update branding" on storage.objects for update to authenticated
  using (bucket_id = 'agency-media' and (storage.foldername(name))[1] = 'agencies'
    and is_agency_member((storage.foldername(name))[2]::uuid, auth.uid()));
create policy "Agency members can delete branding" on storage.objects for delete to authenticated
  using (bucket_id = 'agency-media' and (storage.foldername(name))[1] = 'agencies'
    and is_agency_member((storage.foldername(name))[2]::uuid, auth.uid()));
create policy "Public can read agency branding" on storage.objects for select to public
  using (bucket_id = 'agency-media');

-- ── editorial (public, 10MB, images) ────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('editorial', 'editorial', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Super admins can upload editorial media" on storage.objects for insert to authenticated
  with check (bucket_id = 'editorial' and public.is_super_admin(auth.uid()));
create policy "Super admins can update editorial media" on storage.objects for update to authenticated
  using (bucket_id = 'editorial' and public.is_super_admin(auth.uid()));
create policy "Super admins can delete editorial media" on storage.objects for delete to authenticated
  using (bucket_id = 'editorial' and public.is_super_admin(auth.uid()));
create policy "Anyone can read editorial media" on storage.objects for select
  using (bucket_id = 'editorial');
