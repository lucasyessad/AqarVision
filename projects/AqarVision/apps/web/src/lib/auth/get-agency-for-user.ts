import { createClient } from "@/lib/supabase/server";

export interface UserAgency {
  agencyId: string;
  agencyName: string;
  role: string;
  slug: string;
}

export async function getAgencyForUser(
  userId: string
): Promise<UserAgency | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("agency_memberships")
    .select("agency_id, role, agency:agencies(name, slug)")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (!data?.agency) return null;

  const agency = data.agency as unknown as { name: string; slug: string };

  return {
    agencyId: data.agency_id,
    agencyName: agency.name,
    role: data.role,
    slug: agency.slug,
  };
}
