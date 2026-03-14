-- Fix ALL RLS policies with reversed is_agency_member/is_agency_admin arguments
-- Original: is_agency_member(auth.uid(), agency_id) — WRONG
-- Correct:  is_agency_member(agency_id, auth.uid())
-- Also adds profiles co-member read access

-- ══════════════════════════════════════════════
-- FIX #1: profiles - allow agency co-members to read profiles
-- ══════════════════════════════════════════════
drop policy if exists profiles_select_agency_coworker on public.profiles;
create policy profiles_select_agency_coworker
  on public.profiles
  for select
  using (
    exists (
      select 1
      from public.agency_memberships my_m
      join public.agency_memberships their_m on their_m.agency_id = my_m.agency_id
      where my_m.user_id = auth.uid()
        and my_m.is_active = true
        and their_m.user_id = profiles.user_id
        and their_m.is_active = true
    )
  );

-- ══════════════════════════════════════════════
-- FIX #2: Fix ALL arg-order issues
-- ══════════════════════════════════════════════

-- agencies
drop policy if exists agencies_update_admin on public.agencies;
create policy agencies_update_admin on public.agencies for update
  using (public.is_agency_admin(id, auth.uid()) and deleted_at is null);

-- agency_branches
drop policy if exists branches_modify_admin on public.agency_branches;
create policy branches_modify_admin on public.agency_branches for all
  using (public.is_agency_admin(agency_id, auth.uid()))
  with check (public.is_agency_admin(agency_id, auth.uid()));

-- agency_memberships
drop policy if exists memberships_select_member on public.agency_memberships;
create policy memberships_select_member on public.agency_memberships for select
  using (public.is_agency_member(agency_id, auth.uid()));

drop policy if exists memberships_modify_admin on public.agency_memberships;
create policy memberships_modify_admin on public.agency_memberships for all
  using (public.is_agency_admin(agency_id, auth.uid()))
  with check (public.is_agency_admin(agency_id, auth.uid()));

-- agency_invites (drop both old and new-attempt policy names)
drop policy if exists invites_select_admin on public.agency_invites;
drop policy if exists invites_insert_admin on public.agency_invites;
drop policy if exists invites_select_member on public.agency_invites;
drop policy if exists invites_modify_admin on public.agency_invites;

create policy invites_select_admin on public.agency_invites for select
  using (public.is_agency_admin(agency_id, auth.uid()));
create policy invites_insert_admin on public.agency_invites for insert
  with check (public.is_agency_admin(agency_id, auth.uid()));

-- listings
drop policy if exists listings_select_member on public.listings;
create policy listings_select_member on public.listings for select
  using (public.is_agency_member(agency_id, auth.uid()));

drop policy if exists listings_insert_member on public.listings;
create policy listings_insert_member on public.listings for insert
  with check (public.is_agency_member(agency_id, auth.uid()));

drop policy if exists listings_update_member on public.listings;
create policy listings_update_member on public.listings for update
  using (public.is_agency_member(agency_id, auth.uid()) and deleted_at is null)
  with check (public.is_agency_member(agency_id, auth.uid()));

drop policy if exists listings_delete_admin on public.listings;
create policy listings_delete_admin on public.listings for delete
  using (public.is_agency_admin(agency_id, auth.uid()));

-- listing_translations
drop policy if exists listing_translations_select_member on public.listing_translations;
create policy listing_translations_select_member on public.listing_translations for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

drop policy if exists listing_translations_modify_member on public.listing_translations;
create policy listing_translations_modify_member on public.listing_translations for all
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())))
  with check (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

-- listing_media
drop policy if exists listing_media_modify_member on public.listing_media;
create policy listing_media_modify_member on public.listing_media for all
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())))
  with check (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

-- listing_documents
drop policy if exists listing_documents_member on public.listing_documents;
create policy listing_documents_member on public.listing_documents for all
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())))
  with check (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

-- history tables
drop policy if exists listing_price_versions_select_member on public.listing_price_versions;
create policy listing_price_versions_select_member on public.listing_price_versions for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

drop policy if exists listing_status_versions_select_member on public.listing_status_versions;
create policy listing_status_versions_select_member on public.listing_status_versions for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

drop policy if exists listing_revisions_select_member on public.listing_revisions;
create policy listing_revisions_select_member on public.listing_revisions for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

drop policy if exists listing_publication_history_select_member on public.listing_publication_history;
create policy listing_publication_history_select_member on public.listing_publication_history for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

drop policy if exists listing_media_history_select_member on public.listing_media_history;
create policy listing_media_history_select_member on public.listing_media_history for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

drop policy if exists listing_moderation_history_select_member on public.listing_moderation_history;
create policy listing_moderation_history_select_member on public.listing_moderation_history for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

-- listing_views
drop policy if exists listing_views_select_member on public.listing_views;
create policy listing_views_select_member on public.listing_views for select
  using (exists (select 1 from public.listings l where l.id = listing_id and public.is_agency_member(l.agency_id, auth.uid())));

-- leads
drop policy if exists leads_select_agency on public.leads;
create policy leads_select_agency on public.leads for select
  using (public.is_agency_member(agency_id, auth.uid()));

drop policy if exists leads_update_agency on public.leads;
create policy leads_update_agency on public.leads for update
  using (public.is_agency_member(agency_id, auth.uid()));

-- conversations
drop policy if exists conversations_select_participant on public.conversations;
create policy conversations_select_participant on public.conversations for select
  using (exists (
    select 1 from public.leads ld where ld.id = lead_id
      and (ld.sender_user_id = auth.uid() or public.is_agency_member(ld.agency_id, auth.uid()))
  ));

-- messages
drop policy if exists messages_select_participant on public.messages;
create policy messages_select_participant on public.messages for select
  using (exists (
    select 1 from public.conversations c join public.leads ld on ld.id = c.lead_id
    where c.id = conversation_id
      and (ld.sender_user_id = auth.uid() or public.is_agency_member(ld.agency_id, auth.uid()))
  ));

drop policy if exists messages_insert_participant on public.messages;
create policy messages_insert_participant on public.messages for insert
  with check (exists (
    select 1 from public.conversations c join public.leads ld on ld.id = c.lead_id
    where c.id = conversation_id
      and (ld.sender_user_id = auth.uid() or public.is_agency_member(ld.agency_id, auth.uid()))
  ));

-- ai_jobs
drop policy if exists ai_jobs_select_member on public.ai_jobs;
create policy ai_jobs_select_member on public.ai_jobs for select
  using (public.is_agency_member(agency_id, auth.uid()));

drop policy if exists ai_jobs_insert_member on public.ai_jobs;
create policy ai_jobs_insert_member on public.ai_jobs for insert
  with check (public.is_agency_member(agency_id, auth.uid()));

-- subscriptions
drop policy if exists subscriptions_select_admin on public.subscriptions;
create policy subscriptions_select_admin on public.subscriptions for select
  using (public.is_agency_admin(agency_id, auth.uid()));

-- entitlements
drop policy if exists entitlements_select_member on public.entitlements;
create policy entitlements_select_member on public.entitlements for select
  using (public.is_agency_member(agency_id, auth.uid()));

-- agency_stats_daily
drop policy if exists agency_stats_select_member on public.agency_stats_daily;
create policy agency_stats_select_member on public.agency_stats_daily for select
  using (public.is_agency_member(agency_id, auth.uid()));
