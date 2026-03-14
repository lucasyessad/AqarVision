"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionResult } from "@/features/marketplace/types/search.types";

const RecordViewSchema = z.object({
  listing_id: z.string().uuid(),
});

/**
 * Inserts a view_history entry for the authenticated user.
 * Upserts on (user_id, listing_id, date) to avoid duplicates within the same day.
 */
export async function recordView(
  listingId: string
): Promise<ActionResult<null>> {
  const parsed = RecordViewSchema.safeParse({ listing_id: listingId });
  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid listing ID" },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in — silently skip (public users don't get history)
  if (!user) {
    return { success: true, data: null };
  }

  // Check if already recorded today (dedup by user+listing+day)
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("view_history")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", parsed.data.listing_id)
    .gte("viewed_at", `${today}T00:00:00Z`)
    .maybeSingle();

  if (existing) {
    // Already recorded today — update timestamp
    await supabase
      .from("view_history")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", existing.id);
    return { success: true, data: null };
  }

  await supabase.from("view_history").insert({
    user_id: user.id,
    listing_id: parsed.data.listing_id,
  });

  return { success: true, data: null };
}

/**
 * Clears all view history for the authenticated user.
 */
export async function clearViewHistory(): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentification requise" },
    };
  }

  const { error } = await supabase
    .from("view_history")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      error: { code: "CLEAR_FAILED", message: error.message },
    };
  }

  revalidatePath("/[locale]/espace/historique", "page");
  return { success: true, data: null };
}
