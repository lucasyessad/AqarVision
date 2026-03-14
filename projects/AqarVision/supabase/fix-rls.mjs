// Fix RLS policies via Supabase Management API (SQL execution)
// Usage: node supabase/fix-rls.mjs

import { createRequire } from "module";
const require = createRequire(import.meta.url.replace("/supabase/", "/apps/web/"));
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://tntiakqdvetdhdfzbzsn.supabase.co";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudGlha3FkdmV0ZGhkZnpienNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQzODM3OSwiZXhwIjoyMDg5MDE0Mzc5fQ.rJGds3cFyvcpDXvgYXvpaJ61mmWa3hwgPCMxW3_lKA8";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Execute raw SQL via rpc (we'll create a temporary function)
async function runSQL(sql) {
  const { data, error } = await supabase.rpc("exec_sql", { query: sql });
  if (error) {
    // If exec_sql doesn't exist, try the pg_net approach or direct
    console.error("RPC exec_sql failed:", error.message);
    return false;
  }
  return true;
}

// Alternative: use the Supabase Management API to run SQL
async function runSQLViaAPI(sql) {
  const projectRef = "tntiakqdvetdhdfzbzsn";
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  if (!response.ok) {
    const text = await response.text();
    console.error("API query failed:", response.status, text);
    return false;
  }
  return true;
}

// Use the REST API with service_role to call a security definer function
async function fixViaSecurityDefiner() {
  console.log("🔧 Creating temporary SQL execution function...\n");

  // Step 1: Create a security definer function to execute arbitrary SQL
  // We'll do this by creating the fix function itself
  const createFixFn = `
    create or replace function public._fix_rls_policies()
      returns void
      language plpgsql
      security definer
      set search_path = ''
    as $$
    begin
      -- ══════════════════════════════════════════════
      -- FIX #1: profiles - allow agency co-members to read profiles
      -- ══════════════════════════════════════════════

      -- Drop if exists (idempotent)
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
              and their_m.user_id = public.profiles.user_id
              and their_m.is_active = true
          )
        );

      -- ══════════════════════════════════════════════
      -- FIX #2: Fix ALL arg-order issues
      -- Pattern: is_agency_member(auth.uid(), agency_id) → is_agency_member(agency_id, auth.uid())
      -- ══════════════════════════════════════════════

      -- === agencies ===
      drop policy if exists agencies_update_admin on public.agencies;
      create policy agencies_update_admin
        on public.agencies
        for update
        using (public.is_agency_admin(id, auth.uid()) and deleted_at is null);

      -- === agency_branches ===
      drop policy if exists branches_modify_admin on public.agency_branches;
      create policy branches_modify_admin
        on public.agency_branches
        for all
        using (public.is_agency_admin(agency_id, auth.uid()))
        with check (public.is_agency_admin(agency_id, auth.uid()));

      -- === agency_memberships ===
      drop policy if exists memberships_select_member on public.agency_memberships;
      create policy memberships_select_member
        on public.agency_memberships
        for select
        using (public.is_agency_member(agency_id, auth.uid()));

      drop policy if exists memberships_modify_admin on public.agency_memberships;
      create policy memberships_modify_admin
        on public.agency_memberships
        for all
        using (public.is_agency_admin(agency_id, auth.uid()))
        with check (public.is_agency_admin(agency_id, auth.uid()));

      -- === agency_invites ===
      -- Drop OLD policies (from 00080)
      drop policy if exists invites_select_admin on public.agency_invites;
      drop policy if exists invites_insert_admin on public.agency_invites;
      -- Drop policies from 00110 attempt
      drop policy if exists invites_select_member on public.agency_invites;
      drop policy if exists invites_modify_admin on public.agency_invites;

      -- Recreate correctly
      create policy invites_select_admin
        on public.agency_invites
        for select
        using (public.is_agency_admin(agency_id, auth.uid()));

      create policy invites_insert_admin
        on public.agency_invites
        for insert
        with check (public.is_agency_admin(agency_id, auth.uid()));

      -- === listings ===
      drop policy if exists listings_select_member on public.listings;
      create policy listings_select_member
        on public.listings
        for select
        using (public.is_agency_member(agency_id, auth.uid()));

      drop policy if exists listings_insert_member on public.listings;
      create policy listings_insert_member
        on public.listings
        for insert
        with check (public.is_agency_member(agency_id, auth.uid()));

      drop policy if exists listings_update_member on public.listings;
      create policy listings_update_member
        on public.listings
        for update
        using (public.is_agency_member(agency_id, auth.uid()) and deleted_at is null)
        with check (public.is_agency_member(agency_id, auth.uid()));

      drop policy if exists listings_delete_admin on public.listings;
      create policy listings_delete_admin
        on public.listings
        for delete
        using (public.is_agency_admin(agency_id, auth.uid()));

      -- === listing_translations ===
      drop policy if exists listing_translations_select_member on public.listing_translations;
      create policy listing_translations_select_member
        on public.listing_translations
        for select
        using (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ));

      drop policy if exists listing_translations_modify_member on public.listing_translations;
      create policy listing_translations_modify_member
        on public.listing_translations
        for all
        using (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ))
        with check (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ));

      -- === listing_media ===
      drop policy if exists listing_media_modify_member on public.listing_media;
      create policy listing_media_modify_member
        on public.listing_media
        for all
        using (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ))
        with check (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ));

      -- === listing_documents ===
      drop policy if exists listing_documents_member on public.listing_documents;
      create policy listing_documents_member
        on public.listing_documents
        for all
        using (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ))
        with check (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ));

      -- === history tables ===
      drop policy if exists listing_price_versions_select_member on public.listing_price_versions;
      create policy listing_price_versions_select_member
        on public.listing_price_versions
        for select
        using (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ));

      drop policy if exists listing_status_versions_select_member on public.listing_status_versions;
      create policy listing_status_versions_select_member
        on public.listing_status_versions
        for select
        using (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ));

      drop policy if exists listing_revisions_select_member on public.listing_revisions;
      create policy listing_revisions_select_member
        on public.listing_revisions
        for select
        using (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ));

      drop policy if exists listing_publication_history_select_member on public.listing_publication_history;
      create policy listing_publication_history_select_member
        on public.listing_publication_history
        for select
        using (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ));

      drop policy if exists listing_media_history_select_member on public.listing_media_history;
      create policy listing_media_history_select_member
        on public.listing_media_history
        for select
        using (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ));

      drop policy if exists listing_moderation_history_select_member on public.listing_moderation_history;
      create policy listing_moderation_history_select_member
        on public.listing_moderation_history
        for select
        using (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ));

      -- === listing_views ===
      drop policy if exists listing_views_select_member on public.listing_views;
      create policy listing_views_select_member
        on public.listing_views
        for select
        using (exists (
          select 1 from public.listings l
          where l.id = listing_id
            and public.is_agency_member(l.agency_id, auth.uid())
        ));

      -- === leads ===
      drop policy if exists leads_select_agency on public.leads;
      create policy leads_select_agency
        on public.leads
        for select
        using (public.is_agency_member(agency_id, auth.uid()));

      drop policy if exists leads_update_agency on public.leads;
      create policy leads_update_agency
        on public.leads
        for update
        using (public.is_agency_member(agency_id, auth.uid()));

      -- === conversations ===
      drop policy if exists conversations_select_participant on public.conversations;
      create policy conversations_select_participant
        on public.conversations
        for select
        using (exists (
          select 1 from public.leads ld
          where ld.id = lead_id
            and (
              ld.sender_user_id = auth.uid()
              or public.is_agency_member(ld.agency_id, auth.uid())
            )
        ));

      -- === messages ===
      drop policy if exists messages_select_participant on public.messages;
      create policy messages_select_participant
        on public.messages
        for select
        using (exists (
          select 1 from public.conversations c
          join public.leads ld on ld.id = c.lead_id
          where c.id = conversation_id
            and (
              ld.sender_user_id = auth.uid()
              or public.is_agency_member(ld.agency_id, auth.uid())
            )
        ));

      drop policy if exists messages_insert_participant on public.messages;
      create policy messages_insert_participant
        on public.messages
        for insert
        with check (exists (
          select 1 from public.conversations c
          join public.leads ld on ld.id = c.lead_id
          where c.id = conversation_id
            and (
              ld.sender_user_id = auth.uid()
              or public.is_agency_member(ld.agency_id, auth.uid())
            )
        ));

      -- === ai_jobs ===
      drop policy if exists ai_jobs_select_member on public.ai_jobs;
      create policy ai_jobs_select_member
        on public.ai_jobs
        for select
        using (public.is_agency_member(agency_id, auth.uid()));

      drop policy if exists ai_jobs_insert_member on public.ai_jobs;
      create policy ai_jobs_insert_member
        on public.ai_jobs
        for insert
        with check (public.is_agency_member(agency_id, auth.uid()));

      -- === subscriptions ===
      drop policy if exists subscriptions_select_admin on public.subscriptions;
      create policy subscriptions_select_admin
        on public.subscriptions
        for select
        using (public.is_agency_admin(agency_id, auth.uid()));

      -- === entitlements ===
      drop policy if exists entitlements_select_member on public.entitlements;
      create policy entitlements_select_member
        on public.entitlements
        for select
        using (public.is_agency_member(agency_id, auth.uid()));

      -- === agency_stats_daily ===
      drop policy if exists agency_stats_select_member on public.agency_stats_daily;
      create policy agency_stats_select_member
        on public.agency_stats_daily
        for select
        using (public.is_agency_member(agency_id, auth.uid()));

    end;
    $$;
  `;

  // Use the REST PostgREST endpoint to call the function
  // First, create the function via service_role (bypasses RLS)
  const { error: createErr } = await supabase.rpc("exec_sql", {
    query: createFixFn,
  });

  if (createErr) {
    console.log(
      "exec_sql not available, trying direct SQL via service_role...\n"
    );
    // Alternative approach: execute SQL statements individually via service_role
    await fixViaIndividualStatements();
    return;
  }

  // Execute the fix function
  const { error: execErr } = await supabase.rpc("_fix_rls_policies");
  if (execErr) {
    console.error("Failed to execute fix:", execErr.message);
    return;
  }

  // Cleanup
  await supabase.rpc("exec_sql", {
    query: "drop function if exists public._fix_rls_policies();",
  });

  console.log("✅ All RLS policies fixed!");
}

async function fixViaIndividualStatements() {
  console.log("🔧 Fixing RLS via individual SQL statements...\n");

  // We can't run arbitrary SQL via the JS client alone.
  // But we CAN create/call security definer functions.
  // Let's use the REST API directly with the Supabase Management API.

  // Alternative: Use the PostgREST-compatible approach by creating
  // the fix function via a migration-style call.

  // The supabase-js client can't run raw SQL. We need either:
  // 1. supabase db push (CLI)
  // 2. Supabase Management API
  // 3. A pre-existing exec_sql function

  // Let's try using the Supabase SQL Editor API
  const projectRef = "tntiakqdvetdhdfzbzsn";

  // Try using the management API with the service role key as a bearer token
  // Actually, the Management API requires a personal access token, not service_role

  console.log("❌ Cannot run raw SQL via JS client alone.");
  console.log("   Please run this SQL via the Supabase Dashboard SQL Editor:");
  console.log("   https://supabase.com/dashboard/project/tntiakqdvetdhdfzbzsn/sql\n");

  printFixSQL();
}

function printFixSQL() {
  const sql = `
-- ══════════════════════════════════════════════
-- FIX: RLS policies - correct argument order + profiles co-member access
-- Run this in Supabase Dashboard > SQL Editor
-- ══════════════════════════════════════════════

-- FIX #1: profiles - allow agency co-members to read profiles
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

-- FIX #2: Fix ALL arg-order: is_agency_member(auth.uid(), x) → is_agency_member(x, auth.uid())

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
`;

  console.log(sql);
}

async function linkTestUserToAgency() {
  console.log("\n👤 Linking test user to agency as owner...");

  // Get the test user
  const {
    data: { users },
    error: usersErr,
  } = await supabase.auth.admin.listUsers();

  if (usersErr) {
    console.error("  ✗ Failed to list users:", usersErr.message);
    return;
  }

  const testUser = users?.find(
    (u) => u.email === "test@aqarvision.dz" || u.email === "lounis@test.com"
  );
  if (!testUser) {
    console.log("  ⚠ No test user found. Creating one...");
    return;
  }

  console.log(`  Found test user: ${testUser.email} (${testUser.id})`);

  // Check if already a member
  const { data: existingMembership } = await supabase
    .from("agency_memberships")
    .select("id, agency_id, role")
    .eq("user_id", testUser.id)
    .eq("is_active", true);

  if (existingMembership && existingMembership.length > 0) {
    console.log(
      `  ✓ Already member of agency ${existingMembership[0].agency_id} as ${existingMembership[0].role}`
    );
    return;
  }

  // Add as owner of the first agency
  const agencyId = "a0000000-0000-0000-0000-000000000001";
  const { error: memberErr } = await supabase
    .from("agency_memberships")
    .insert({
      agency_id: agencyId,
      user_id: testUser.id,
      role: "owner",
      is_active: true,
    });

  if (memberErr) {
    console.error("  ✗ Failed to add membership:", memberErr.message);
  } else {
    console.log(`  ✓ Added as owner of agency ${agencyId}`);
  }
}

async function main() {
  // First, link the test user to an agency (this works via service_role which bypasses RLS)
  await linkTestUserToAgency();

  // Then try to fix RLS
  console.log("\n");
  await fixViaSecurityDefiner();
}

main().catch(console.error);
