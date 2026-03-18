"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { saveDraft, createListing } from "@/features/listings/services/listing.service";
import { createListingSchema } from "@/features/listings/schemas/listing.schema";
import { revalidateTag } from "next/cache";
import { CacheTags } from "@/lib/cache/tags";
import type { Listing } from "@/features/listings/types/listing.types";

export async function saveDraftIndividualAction(
  listingId: string | null,
  data: Record<string, unknown>,
  userId: string
): Promise<ActionResult<{ listingId: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return fail("UNAUTHORIZED", "Vous devez être connecté");
  }

  try {
    const id = await saveDraft(supabase, listingId, data, "individual", userId);
    return ok({ listingId: id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    return fail("INTERNAL_ERROR", msg);
  }
}

export async function publishIndividualListingAction(
  data: Record<string, unknown>,
  userId: string
): Promise<ActionResult<Listing>> {
  const parsed = createListingSchema.safeParse(data);
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      parsed.error.errors[0]?.message ?? "Données invalides"
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return fail("UNAUTHORIZED", "Vous devez être connecté");
  }

  try {
    const listing = await createListing(supabase, parsed.data, "individual", userId);
    return ok(listing);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    return fail("INTERNAL_ERROR", msg);
  }
}
