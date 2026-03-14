// Link test user to agency as owner
// Usage: node supabase/link-user.mjs

import { createRequire } from "module";
const require = createRequire(import.meta.url.replace("/supabase/", "/apps/web/"));
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://tntiakqdvetdhdfzbzsn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudGlha3FkdmV0ZGhkZnpienNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQzODM3OSwiZXhwIjoyMDg5MDE0Mzc5fQ.rJGds3cFyvcpDXvgYXvpaJ61mmWa3hwgPCMxW3_lKA8",
  { auth: { persistSession: false } }
);

async function main() {
  // List all users
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) { console.error("Error:", error.message); return; }

  console.log("Users in database:");
  for (const u of users) {
    console.log(`  - ${u.email} (${u.id})`);
  }

  if (users.length === 0) {
    console.log("No users found!");
    return;
  }

  // Check existing memberships
  const { data: memberships } = await supabase
    .from("agency_memberships")
    .select("user_id, agency_id, role, is_active");

  console.log("\nExisting memberships:");
  if (memberships && memberships.length > 0) {
    for (const m of memberships) {
      console.log(`  - user=${m.user_id} agency=${m.agency_id} role=${m.role} active=${m.is_active}`);
    }
  } else {
    console.log("  (none)");
  }

  // For each user not already in a membership, add as owner of first agency
  const agencyId = "a0000000-0000-0000-0000-000000000001";
  const memberUserIds = new Set((memberships || []).map(m => m.user_id));

  for (const u of users) {
    if (!memberUserIds.has(u.id)) {
      console.log(`\nAdding ${u.email} as owner of agency ${agencyId}...`);
      const { error: insertErr } = await supabase
        .from("agency_memberships")
        .insert({ agency_id: agencyId, user_id: u.id, role: "owner", is_active: true });

      if (insertErr) {
        console.error(`  ✗ Error: ${insertErr.message}`);
      } else {
        console.log(`  ✓ Done`);
      }
    } else {
      console.log(`\n${u.email} already has a membership.`);
    }
  }
}

main().catch(console.error);
