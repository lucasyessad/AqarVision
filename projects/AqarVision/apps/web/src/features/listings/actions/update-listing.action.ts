"use server";

import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { UpdateListingSchema } from "../schemas/listing.schema";
import { update } from "../services/listing.service";
import type { ActionResult, ListingDto } from "../types/listing.types";

export async function updateListingAction(
  _prevState: ActionResult<ListingDto> | null,
  formData: FormData
): Promise<ActionResult<ListingDto>> {
  const listingId = formData.get("listing_id") as string;
  if (!listingId) return { success: false, error: { code: "VALIDATION_ERROR", message: "listing_id requis" } };

  const raw = {
    listing_id: listingId,
    expected_version: Number(formData.get("expected_version")),
    branch_id: formData.get("branch_id") || undefined,
    listing_type: formData.get("listing_type") || undefined,
    property_type: formData.get("property_type") || undefined,
    current_price: formData.get("current_price") ? Number(formData.get("current_price")) : undefined,
    wilaya_code: formData.get("wilaya_code") ? (formData.get("wilaya_code") as string) : undefined,
    commune_id: formData.get("commune_id") ? Number(formData.get("commune_id")) : undefined,
    surface_m2: formData.get("surface_m2") ? Number(formData.get("surface_m2")) : undefined,
    rooms: formData.get("rooms") ? Number(formData.get("rooms")) : undefined,
    bathrooms: formData.get("bathrooms") ? Number(formData.get("bathrooms")) : undefined,
    details: formData.get("details") ? (() => { try { return JSON.parse(formData.get("details") as string); } catch { return undefined; } })() : undefined,
  };

  const parsed = UpdateListingSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.errors.map((e) => e.message).join(", ") } };
  }

  // Fetch listing's agency_id to guard with withAgencyAuth
  const supabase = await createClient();
  const { data: listing } = await supabase.from("listings").select("agency_id").eq("id", listingId).single();
  if (!listing) return { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } };

  const { listing_id, expected_version, ...fields } = parsed.data;

  return withAgencyAuth(listing.agency_id as string, "listing", "update", async ({ userId }) => {
    const sb = await createClient();
    return update(sb, userId, listing_id, expected_version, fields);
  });
}
