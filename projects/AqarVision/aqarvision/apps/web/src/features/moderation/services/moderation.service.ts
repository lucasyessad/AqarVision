import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReportDto, ModerationHistoryDto } from "../types/moderation.types";

/* ------------------------------------------------------------------ */
/*  Report a listing                                                   */
/* ------------------------------------------------------------------ */

export async function reportListing(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from("listing_moderation_history")
    .insert({
      listing_id: listingId,
      action: "reported",
      reason,
      performed_by: userId,
    });

  if (error) {
    throw new Error(error.message);
  }
}

/* ------------------------------------------------------------------ */
/*  Review a listing (approve / reject) — super_admin only             */
/* ------------------------------------------------------------------ */

export async function reviewListing(
  supabase: SupabaseClient,
  moderatorId: string,
  listingId: string,
  action: "approved" | "rejected",
  reason?: string
): Promise<void> {
  // Update the listing status
  const newStatus = action === "approved" ? "published" : "rejected";

  const { error: updateError } = await supabase
    .from("listings")
    .update({ current_status: newStatus })
    .eq("id", listingId)
    .eq("current_status", "pending_review");

  if (updateError) {
    throw new Error(updateError.message);
  }

  // Insert moderation history entry
  const { error: historyError } = await supabase
    .from("listing_moderation_history")
    .insert({
      listing_id: listingId,
      action,
      reason: reason ?? null,
      performed_by: moderatorId,
    });

  if (historyError) {
    throw new Error(historyError.message);
  }
}

/* ------------------------------------------------------------------ */
/*  Get pending reports (super_admin)                                  */
/* ------------------------------------------------------------------ */

export async function getListingReports(
  supabase: SupabaseClient
): Promise<ReportDto[]> {
  const { data, error } = await supabase
    .from("listing_moderation_history")
    .select(
      `id, listing_id, action, reason, performed_by, created_at,
       listings!inner(id, current_status, agency_id,
         listing_translations(title, locale)
       )`
    )
    .in("action", ["reported"])
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    return [];
  }

  return data.map((row) => {
    const listing = row.listings as unknown as Record<string, unknown>;
    const translations = (listing?.listing_translations as Array<Record<string, unknown>>) ?? [];
    const title =
      (translations.find((t) => t.locale === "fr")?.title as string) ??
      (translations[0]?.title as string) ??
      null;

    return {
      id: row.id as string,
      listing_id: row.listing_id as string,
      action: row.action as string,
      reason: (row.reason as string) ?? null,
      performed_by: (row.performed_by as string) ?? null,
      created_at: row.created_at as string,
      listing_title: title,
      listing_agency_id: (listing?.agency_id as string) ?? null,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Get moderation history for a listing                               */
/* ------------------------------------------------------------------ */

export async function getModerationHistory(
  supabase: SupabaseClient,
  listingId: string
): Promise<ModerationHistoryDto[]> {
  const { data, error } = await supabase
    .from("listing_moderation_history")
    .select("id, listing_id, action, reason, performed_by, created_at")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id as string,
    listing_id: row.listing_id as string,
    action: row.action as string,
    reason: (row.reason as string) ?? null,
    performed_by: (row.performed_by as string) ?? null,
    created_at: row.created_at as string,
  }));
}
