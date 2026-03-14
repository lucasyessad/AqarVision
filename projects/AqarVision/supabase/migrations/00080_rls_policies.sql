-- M01 Auth & Identity — Row Level Security policies

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.mobile_devices enable row level security;
alter table public.push_tokens    enable row level security;

-- ──────────────────────────────────────────────
-- profiles
-- ──────────────────────────────────────────────

-- Users can read their own profile
create policy profiles_select_self
  on public.profiles
  for select
  using (user_id = auth.uid());

-- Users can update their own profile
create policy profiles_update_self
  on public.profiles
  for update
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Super admins can read all profiles
create policy profiles_select_super_admin
  on public.profiles
  for select
  using (public.is_super_admin(auth.uid()));

-- ──────────────────────────────────────────────
-- mobile_devices
-- ──────────────────────────────────────────────

-- Users can manage their own devices (select, insert, update, delete)
create policy mobile_devices_self
  on public.mobile_devices
  for all
  using (user_id = auth.uid());

-- ──────────────────────────────────────────────
-- push_tokens
-- ──────────────────────────────────────────────

-- Users can manage their own push tokens (select, insert, update, delete)
create policy push_tokens_self
  on public.push_tokens
  for all
  using (user_id = auth.uid());

-- ══════════════════════════════════════════════
-- M02 Agencies, Branches & Team — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.agencies           enable row level security;
alter table public.agency_branches    enable row level security;
alter table public.agency_memberships enable row level security;
alter table public.agency_invites     enable row level security;

-- ──────────────────────────────────────────────
-- agencies
-- ──────────────────────────────────────────────

-- Anyone can view non-deleted agencies
create policy agencies_select_public
  on public.agencies
  for select
  using (deleted_at is null);

-- Agency admins can update their own agency (if not soft-deleted)
create policy agencies_update_admin
  on public.agencies
  for update
  using (public.is_agency_admin(auth.uid(), id) and deleted_at is null);

-- Any authenticated user can create an agency
create policy agencies_insert_authenticated
  on public.agencies
  for insert
  with check (auth.uid() is not null);

-- ──────────────────────────────────────────────
-- agency_branches
-- ──────────────────────────────────────────────

-- Anyone can view branches
create policy branches_select_public
  on public.agency_branches
  for select
  using (true);

-- Agency admins can insert/update/delete branches
create policy branches_modify_admin
  on public.agency_branches
  for all
  using (public.is_agency_admin(auth.uid(), agency_id))
  with check (public.is_agency_admin(auth.uid(), agency_id));

-- ──────────────────────────────────────────────
-- agency_memberships
-- ──────────────────────────────────────────────

-- Agency members can view memberships of their own agency
create policy memberships_select_member
  on public.agency_memberships
  for select
  using (public.is_agency_member(auth.uid(), agency_id));

-- Agency admins can manage memberships
create policy memberships_modify_admin
  on public.agency_memberships
  for all
  using (public.is_agency_admin(auth.uid(), agency_id))
  with check (public.is_agency_admin(auth.uid(), agency_id));

-- ──────────────────────────────────────────────
-- agency_invites
-- ──────────────────────────────────────────────

-- Agency admins can view invites
create policy invites_select_admin
  on public.agency_invites
  for select
  using (public.is_agency_admin(auth.uid(), agency_id));

-- Agency admins can create invites
create policy invites_insert_admin
  on public.agency_invites
  for insert
  with check (public.is_agency_admin(auth.uid(), agency_id));

-- ══════════════════════════════════════════════
-- M03 Listings Core — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
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

-- ──────────────────────────────────────────────
-- listings
-- ──────────────────────────────────────────────

-- Public: anyone can view published, non-deleted listings
create policy listings_select_public
  on public.listings
  for select
  using (current_status = 'published' and deleted_at is null);

-- Members can view all listings of their agency
create policy listings_select_member
  on public.listings
  for select
  using (public.is_agency_member(auth.uid(), agency_id));

-- Members can insert listings for their agency
create policy listings_insert_member
  on public.listings
  for insert
  with check (public.is_agency_member(auth.uid(), agency_id));

-- Members can update non-deleted listings of their agency
create policy listings_update_member
  on public.listings
  for update
  using (public.is_agency_member(auth.uid(), agency_id) and deleted_at is null)
  with check (public.is_agency_member(auth.uid(), agency_id));

-- Only admins can delete listings (soft-delete)
create policy listings_delete_admin
  on public.listings
  for delete
  using (public.is_agency_admin(auth.uid(), agency_id));

-- ──────────────────────────────────────────────
-- listing_translations
-- ──────────────────────────────────────────────

-- Public: anyone can view translations of published listings
create policy listing_translations_select_public
  on public.listing_translations
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.current_status = 'published'
      and l.deleted_at is null
  ));

-- Members can view all translations of their agency's listings
create policy listing_translations_select_member
  on public.listing_translations
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- Members can insert/update/delete translations for their agency's listings
create policy listing_translations_modify_member
  on public.listing_translations
  for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- ──────────────────────────────────────────────
-- listing_media
-- ──────────────────────────────────────────────

-- Public: anyone can view media of published, non-deleted listings
create policy listing_media_select_public
  on public.listing_media
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.current_status = 'published'
      and l.deleted_at is null
  ));

-- Members can manage media for their agency's listings
create policy listing_media_modify_member
  on public.listing_media
  for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- ──────────────────────────────────────────────
-- listing_documents (member only — no public access)
-- ──────────────────────────────────────────────

create policy listing_documents_member
  on public.listing_documents
  for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- ──────────────────────────────────────────────
-- History tables — select for members only
-- ──────────────────────────────────────────────

create policy listing_price_versions_select_member
  on public.listing_price_versions
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

create policy listing_status_versions_select_member
  on public.listing_status_versions
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

create policy listing_revisions_select_member
  on public.listing_revisions
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

create policy listing_publication_history_select_member
  on public.listing_publication_history
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

create policy listing_media_history_select_member
  on public.listing_media_history
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

create policy listing_moderation_history_select_member
  on public.listing_moderation_history
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- ══════════════════════════════════════════════
-- M05 Search & SEO — listing_views RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.listing_views enable row level security;

-- ──────────────────────────────────────────────
-- listing_views
-- ──────────────────────────────────────────────

-- Any authenticated user can insert a view record
create policy listing_views_insert_authenticated
  on public.listing_views
  for insert
  with check (auth.uid() is not null);

-- Agency members can view analytics for their listings
create policy listing_views_select_member
  on public.listing_views
  for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and public.is_agency_member(auth.uid(), l.agency_id)
  ));

-- ══════════════════════════════════════════════
-- M06 Leads & Messaging — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.leads         enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- ──────────────────────────────────────────────
-- leads
-- ──────────────────────────────────────────────

-- Agency members can view leads for their agency
create policy leads_select_agency
  on public.leads
  for select
  using (public.is_agency_member(auth.uid(), agency_id));

-- Lead senders can view their own leads
create policy leads_select_sender
  on public.leads
  for select
  using (sender_user_id = auth.uid());

-- Any authenticated user can create a lead
create policy leads_insert_authenticated
  on public.leads
  for insert
  with check (auth.uid() is not null);

-- Agency members can update leads for their agency
create policy leads_update_agency
  on public.leads
  for update
  using (public.is_agency_member(auth.uid(), agency_id));

-- ──────────────────────────────────────────────
-- conversations
-- ──────────────────────────────────────────────

-- Participants (sender or agency member) can view conversations
create policy conversations_select_participant
  on public.conversations
  for select
  using (exists (
    select 1 from public.leads ld
    where ld.id = lead_id
      and (
        ld.sender_user_id = auth.uid()
        or public.is_agency_member(auth.uid(), ld.agency_id)
      )
  ));

-- ──────────────────────────────────────────────
-- messages
-- ──────────────────────────────────────────────

-- Participants can view messages in their conversations
create policy messages_select_participant
  on public.messages
  for select
  using (exists (
    select 1 from public.conversations c
    join public.leads ld on ld.id = c.lead_id
    where c.id = conversation_id
      and (
        ld.sender_user_id = auth.uid()
        or public.is_agency_member(auth.uid(), ld.agency_id)
      )
  ));

-- Participants can insert messages into their conversations
create policy messages_insert_participant
  on public.messages
  for insert
  with check (exists (
    select 1 from public.conversations c
    join public.leads ld on ld.id = c.lead_id
    where c.id = conversation_id
      and (
        ld.sender_user_id = auth.uid()
        or public.is_agency_member(auth.uid(), ld.agency_id)
      )
  ));

-- ══════════════════════════════════════════════
-- M09 AI — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.ai_prompts enable row level security;
alter table public.ai_jobs   enable row level security;

-- ──────────────────────────────────────────────
-- ai_prompts — anyone can read active prompts
-- ──────────────────────────────────────────────
create policy ai_prompts_select_active
  on public.ai_prompts
  for select
  using (is_active = true);

-- ──────────────────────────────────────────────
-- ai_jobs — agency members can view their agency's jobs
-- ──────────────────────────────────────────────
create policy ai_jobs_select_member
  on public.ai_jobs
  for select
  using (public.is_agency_member(auth.uid(), agency_id));

-- ai_jobs — agency members can insert jobs for their agency
create policy ai_jobs_insert_member
  on public.ai_jobs
  for insert
  with check (public.is_agency_member(auth.uid(), agency_id));

-- ══════════════════════════════════════════════
-- M07 Favorites & Alerts — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.favorites      enable row level security;
alter table public.notes          enable row level security;
alter table public.saved_searches enable row level security;
alter table public.view_history   enable row level security;

-- ──────────────────────────────────────────────
-- favorites — users manage their own
-- ──────────────────────────────────────────────
create policy favorites_self
  on public.favorites
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ──────────────────────────────────────────────
-- notes — users manage their own
-- ──────────────────────────────────────────────
create policy notes_self
  on public.notes
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ──────────────────────────────────────────────
-- saved_searches — users manage their own
-- ──────────────────────────────────────────────
create policy saved_searches_self
  on public.saved_searches
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ──────────────────────────────────────────────
-- view_history — users manage their own
-- ──────────────────────────────────────────────
create policy view_history_self
  on public.view_history
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ══════════════════════════════════════════════
-- M08 Billing — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.plans         enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements  enable row level security;

-- NOTE: stripe_customers is accessed via service_role only — no RLS policies needed.
-- If a stripe_customers table is added, enable RLS but do NOT create policies.

-- ──────────────────────────────────────────────
-- plans — anyone can view active plans
-- ──────────────────────────────────────────────
create policy plans_select_public
  on public.plans
  for select
  using (is_active = true);

-- ──────────────────────────────────────────────
-- subscriptions — agency admins only
-- ──────────────────────────────────────────────
create policy subscriptions_select_admin
  on public.subscriptions
  for select
  using (public.is_agency_admin(auth.uid(), agency_id));

-- ──────────────────────────────────────────────
-- entitlements — agency members can view
-- ──────────────────────────────────────────────
create policy entitlements_select_member
  on public.entitlements
  for select
  using (public.is_agency_member(auth.uid(), agency_id));

-- ══════════════════════════════════════════════
-- M10 Moderation — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS (listing_moderation_history already enabled in M03)
-- ──────────────────────────────────────────────
alter table public.audit_logs enable row level security;

-- ──────────────────────────────────────────────
-- listing_moderation_history — select for agency members (via listing join)
-- (already created in M03 section as listing_moderation_history_select_member)
-- ──────────────────────────────────────────────

-- ──────────────────────────────────────────────
-- audit_logs — only super admins can read
-- ──────────────────────────────────────────────
create policy audit_logs_select_super_admin
  on public.audit_logs
  for select
  using (public.is_super_admin(auth.uid()));

-- ══════════════════════════════════════════════
-- M11 Analytics — RLS policies
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Enable RLS
-- ──────────────────────────────────────────────
alter table public.domain_events      enable row level security;
alter table public.agency_stats_daily enable row level security;

-- ──────────────────────────────────────────────
-- domain_events — only super admins can read
-- ──────────────────────────────────────────────
create policy domain_events_select_super_admin
  on public.domain_events
  for select
  using (public.is_super_admin(auth.uid()));

-- ──────────────────────────────────────────────
-- agency_stats_daily — agency members can read their own stats
-- ──────────────────────────────────────────────
create policy agency_stats_select_member
  on public.agency_stats_daily
  for select
  using (public.is_agency_member(auth.uid(), agency_id));
