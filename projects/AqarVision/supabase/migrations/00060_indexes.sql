-- M02 Agencies, Branches & Team — Indexes

create index idx_agency_branches_agency_id
  on public.agency_branches(agency_id);

create index idx_agency_memberships_agency_id
  on public.agency_memberships(agency_id);

create index idx_agency_memberships_user_id
  on public.agency_memberships(user_id);

create index idx_agency_invites_token
  on public.agency_invites(token);

create index idx_agencies_active
  on public.agencies(id)
  where deleted_at is null;

-- ══════════════════════════════════════════════
-- M03 Listings Core — Indexes
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- listings
-- ──────────────────────────────────────────────
create index idx_listings_agency_id
  on public.listings(agency_id);

create index idx_listings_branch_id
  on public.listings(branch_id);

create index idx_listings_status
  on public.listings(current_status);

create index idx_listings_listing_type
  on public.listings(listing_type);

create index idx_listings_property_type
  on public.listings(property_type);

create index idx_listings_wilaya_code
  on public.listings(wilaya_code);

create index idx_listings_published_at
  on public.listings(published_at desc);

create index idx_listings_location_gist
  on public.listings
  using gist (location);

-- Composite index for common search queries
create index idx_listings_search_composite
  on public.listings(current_status, listing_type, property_type, wilaya_code);

-- Partial index for active (non-deleted) listings
create index idx_listings_active
  on public.listings(id)
  where deleted_at is null;

-- GIN index on details JSONB column
create index idx_listings_details
  on public.listings
  using gin (details);

-- ──────────────────────────────────────────────
-- listing_translations
-- ──────────────────────────────────────────────
create index idx_listing_translations_listing_locale
  on public.listing_translations(listing_id, locale);

-- ──────────────────────────────────────────────
-- listing_media
-- ──────────────────────────────────────────────
create index idx_listing_media_listing_id
  on public.listing_media(listing_id);

-- ──────────────────────────────────────────────
-- listing_documents
-- ──────────────────────────────────────────────
create index idx_listing_documents_listing_id
  on public.listing_documents(listing_id);

-- ──────────────────────────────────────────────
-- History tables
-- ──────────────────────────────────────────────

-- Current price version per listing (unique partial)
create unique index idx_listing_price_versions_current
  on public.listing_price_versions(listing_id)
  where is_current = true;

create index idx_listing_price_versions_valid_from
  on public.listing_price_versions(listing_id, (lower(valid_during)) desc);

-- Current status version per listing (unique partial)
create unique index idx_listing_status_versions_current
  on public.listing_status_versions(listing_id)
  where is_current = true;

create index idx_listing_status_versions_valid_from
  on public.listing_status_versions(listing_id, (lower(valid_during)) desc);

-- Revisions by listing
create index idx_listing_revisions_listing_id
  on public.listing_revisions(listing_id, version desc);

-- Publication history by listing
create index idx_listing_publication_history_listing_id
  on public.listing_publication_history(listing_id, created_at desc);

-- Media history by listing
create index idx_listing_media_history_listing_id
  on public.listing_media_history(listing_id, created_at desc);

-- Moderation history by listing
create index idx_listing_moderation_history_listing_id
  on public.listing_moderation_history(listing_id, created_at desc);

-- ══════════════════════════════════════════════
-- M06 Leads & Messaging — Indexes
-- ══════════════════════════════════════════════

create index idx_leads_agency_id
  on public.leads(agency_id);

create index idx_leads_listing_id
  on public.leads(listing_id);

create index idx_conversations_lead_id
  on public.conversations(lead_id);

create index idx_messages_conversation_id
  on public.messages(conversation_id);

-- Partial index for unread messages
create index idx_messages_read_at
  on public.messages(conversation_id, created_at)
  where read_at is null;
