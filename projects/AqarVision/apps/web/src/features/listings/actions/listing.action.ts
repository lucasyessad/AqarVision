"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { createListingSchema } from "../schemas/listing.schema";
import { createListing, saveDraft } from "../services/listing.service";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { updateTag } from "next/cache";
import { CacheTags } from "@/lib/cache/tags";
import type { Listing } from "../types/listing.types";
import type { CreateListingInput } from "../schemas/listing.schema";

export async function createListingAction(
  input: CreateListingInput,
  agencyId: string
): Promise<ActionResult<Listing>> {
  const parsed = createListingSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Données invalides");
  }

  return withAgencyAuth(agencyId, "listing", "create", async (ctx) => {
    const supabase = await createClient();
    const listing = await createListing(supabase, parsed.data, "agency", agencyId);
    updateTag(CacheTags.listings(agencyId));
    return listing;
  });
}

export async function saveDraftAction(
  listingId: string | null,
  data: Partial<CreateListingInput>,
  agencyId: string
): Promise<ActionResult<{ listingId: string }>> {
  return withAgencyAuth(agencyId, "listing", "create", async () => {
    const supabase = await createClient();
    const id = await saveDraft(supabase, listingId, data, "agency", agencyId);
    return { listingId: id };
  });
}

export async function publishListingAction(
  listingId: string,
  agencyId: string
): Promise<ActionResult<void>> {
  return withAgencyAuth(agencyId, "listing", "update", async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("listings")
      .update({ status: "pending_review", updated_at: new Date().toISOString() })
      .eq("id", listingId)
      .eq("agency_id", agencyId);

    if (error) throw error;
    updateTag(CacheTags.listings(agencyId));
    updateTag(CacheTags.listing(listingId));
  });
}

export async function pauseListingAction(
  listingId: string,
  agencyId: string
): Promise<ActionResult<void>> {
  return withAgencyAuth(agencyId, "listing", "update", async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("listings")
      .update({ status: "paused", updated_at: new Date().toISOString() })
      .eq("id", listingId)
      .eq("agency_id", agencyId);

    if (error) throw error;
    updateTag(CacheTags.listings(agencyId));
    updateTag(CacheTags.listing(listingId));
  });
}

export async function deleteListingAction(
  listingId: string,
  agencyId: string
): Promise<ActionResult<void>> {
  return withAgencyAuth(agencyId, "listing", "delete", async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("listings")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", listingId)
      .eq("agency_id", agencyId);

    if (error) throw error;
    updateTag(CacheTags.listings(agencyId));
  });
}
