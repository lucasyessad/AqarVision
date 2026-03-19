"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { updateTag } from "next/cache";
import { CacheTags } from "@/lib/cache/tags";

export async function toggleFavoriteAction(
  listingId: string
): Promise<ActionResult<{ isFavorite: boolean }>> {
  if (!listingId) {
    return fail("VALIDATION_ERROR", "ID annonce manquant");
  }

  const user = await getCachedUser();
  if (!user) {
    return fail("UNAUTHORIZED", "Vous devez être connecté pour ajouter aux favoris");
  }

  try {
    const supabase = await createClient();

    // Check if favorite already exists
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      if (error) throw error;

      updateTag(CacheTags.favorites(user.id));
      return ok({ isFavorite: false });
    }

    // Add favorite
    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      listing_id: listingId,
    });

    if (error) throw error;

    updateTag(CacheTags.favorites(user.id));
    return ok({ isFavorite: true });
  } catch {
    return fail("INTERNAL_ERROR", "Erreur lors de la mise à jour des favoris");
  }
}
