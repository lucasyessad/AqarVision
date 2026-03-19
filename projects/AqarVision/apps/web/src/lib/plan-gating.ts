import { createClient } from "@/lib/supabase/server";

interface PlanLimits {
  maxListings: number;
  maxPhotosPerListing: number;
  maxTeamMembers: number;
}

async function getDefaultLimitsFromSettings(): Promise<PlanLimits> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("platform_settings")
    .select("key, value")
    .in("key", ["starter_max_listings", "starter_max_photos", "starter_max_team"]);

  const map = new Map((settings ?? []).map((s) => [s.key, s.value]));
  return {
    maxListings: Number(map.get("starter_max_listings") ?? 10),
    maxPhotosPerListing: Number(map.get("starter_max_photos") ?? 3),
    maxTeamMembers: Number(map.get("starter_max_team") ?? 2),
  };
}

export async function getAgencyLimits(
  agencyId: string
): Promise<PlanLimits> {
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan:plans(*)")
    .eq("agency_id", agencyId)
    .eq("status", "active")
    .single();

  if (!subscription?.plan) return getDefaultLimitsFromSettings();

  const plan = subscription.plan as unknown as {
    max_listings: number;
    max_photos_per_listing: number;
    max_team_members: number;
  };

  return {
    maxListings: plan.max_listings,
    maxPhotosPerListing: plan.max_photos_per_listing,
    maxTeamMembers: plan.max_team_members,
  };
}

export async function canCreateListing(agencyId: string): Promise<boolean> {
  const limits = await getAgencyLimits(agencyId);
  const supabase = await createClient();

  const { count } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .not("status", "eq", "archived");

  return (count ?? 0) < limits.maxListings;
}
