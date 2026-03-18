import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModerationQueueItem } from "../types/moderation.types";

export async function getModerationQueue(
  supabase: SupabaseClient,
  filters?: { type?: string; wilaya?: string; ownerType?: string }
): Promise<ModerationQueueItem[]> {
  let query = supabase
    .from("listings")
    .select(
      `
      id,
      listing_type,
      property_type,
      owner_type,
      created_at,
      agency:agencies(name),
      user:profiles(first_name, last_name),
      translations:listing_translations(title, locale),
      media:listing_media(storage_path, is_cover),
      wilaya:wilayas(name_fr)
    `
    )
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  if (filters?.type) query = query.eq("listing_type", filters.type);
  if (filters?.wilaya) query = query.eq("wilaya_code", filters.wilaya);
  if (filters?.ownerType) query = query.eq("owner_type", filters.ownerType);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((item: Record<string, unknown>) => {
    const translations = item.translations as Array<{ title: string; locale: string }>;
    const media = item.media as Array<{ storage_path: string; is_cover: boolean }>;
    const agency = item.agency as { name: string } | null;
    const user = item.user as { first_name: string; last_name: string } | null;
    const wilaya = item.wilaya as { name_fr: string } | null;
    const fr = translations?.find((t) => t.locale === "fr");
    const cover = media?.find((m) => m.is_cover);

    return {
      listing_id: item.id as string,
      listing_title: fr?.title ?? "",
      listing_type: item.listing_type as string,
      property_type: item.property_type as string,
      owner_type: item.owner_type as "agency" | "individual",
      agency_name: agency?.name ?? null,
      user_name: user ? `${user.first_name} ${user.last_name}` : null,
      wilaya_name: wilaya?.name_fr ?? "",
      submitted_at: item.created_at as string,
      photos_count: (media ?? []).length,
      cover_url: cover?.storage_path ?? null,
    };
  });
}

export async function moderateListing(
  supabase: SupabaseClient,
  listingId: string,
  action: "approved" | "rejected" | "hidden",
  reason: string | null,
  moderatorId: string
): Promise<void> {
  const statusMap = {
    approved: "published",
    rejected: "rejected",
    hidden: "paused",
  } as const;

  const { error: updateError } = await supabase
    .from("listings")
    .update({
      status: statusMap[action],
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId);

  if (updateError) throw updateError;

  // Log the moderation action
  await supabase.from("audit_logs").insert({
    action: `listing.${action}`,
    actor_id: moderatorId,
    target_type: "listing",
    target_id: listingId,
    metadata: { reason },
  });
}
