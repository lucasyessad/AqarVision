import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateAgencyInput } from "../schemas/agency.schema";

export interface Agency {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  description: string | null;
  logo_url: string | null;
  theme: string;
  branding: Record<string, string> | null;
  storefront_content: Record<string, unknown> | null;
  whatsapp_phone: string | null;
  opening_hours: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  notification_prefs: Record<string, boolean> | null;
  onboarding_progress: Record<string, boolean> | null;
  verification_level: number;
  created_at: string;
}

export async function createAgency(
  supabase: SupabaseClient,
  input: CreateAgencyInput,
  userId: string
): Promise<Agency> {
  // Create agency
  const { data: agency, error: agencyError } = await supabase
    .from("agencies")
    .insert({
      name: input.name,
      slug: input.slug,
      email: input.email,
      phone: input.phone,
    })
    .select()
    .single();

  if (agencyError) throw agencyError;

  // Create headquarter branch
  await supabase.from("branches").insert({
    agency_id: agency.id,
    name: "Siège",
    wilaya_code: input.wilaya_code,
    commune_id: input.commune_id,
    is_headquarters: true,
  });

  // Create owner membership
  await supabase.from("agency_memberships").insert({
    agency_id: agency.id,
    user_id: userId,
    role: "owner",
    is_active: true,
  });

  return agency as Agency;
}

export async function getAgencyBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Agency | null> {
  const { data, error } = await supabase
    .from("agencies")
    .select(
      `
      *,
      verifications(level)
    `
    )
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  const verifications = data.verifications as Array<{ level: number }> | null;

  return {
    ...data,
    verification_level: verifications?.[0]?.level ?? 1,
  } as Agency;
}

export async function checkSlugAvailability(
  supabase: SupabaseClient,
  slug: string
): Promise<boolean> {
  const { count } = await supabase
    .from("agencies")
    .select("*", { count: "exact", head: true })
    .eq("slug", slug);

  return (count ?? 0) === 0;
}
