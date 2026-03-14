"use server";

import { createClient } from "@/lib/supabase/server";
import { UpdateListingSchema } from "../schemas/listing.schema";
import { update } from "../services/listing.service";
import type { ActionResult, ListingDto } from "../types/listing.types";

export async function updateListingAction(
  _prevState: ActionResult<ListingDto> | null,
  formData: FormData
): Promise<ActionResult<ListingDto>> {
  const raw = {
    listing_id: formData.get("listing_id"),
    expected_version: Number(formData.get("expected_version")),
    branch_id: formData.get("branch_id") || undefined,
    listing_type: formData.get("listing_type") || undefined,
    property_type: formData.get("property_type") || undefined,
    current_price: formData.get("current_price")
      ? Number(formData.get("current_price"))
      : undefined,
    wilaya_code: formData.get("wilaya_code")
      ? Number(formData.get("wilaya_code"))
      : undefined,
    commune_id: formData.get("commune_id")
      ? Number(formData.get("commune_id"))
      : undefined,
    surface_m2: formData.get("surface_m2")
      ? Number(formData.get("surface_m2"))
      : undefined,
    rooms: formData.get("rooms") ? Number(formData.get("rooms")) : undefined,
    bathrooms: formData.get("bathrooms")
      ? Number(formData.get("bathrooms"))
      : undefined,
    details: formData.get("details")
      ? JSON.parse(formData.get("details") as string)
      : undefined,
  };

  const parsed = UpdateListingSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    };
  }

  // Fetch listing to check agency membership
  const { data: listing } = await supabase
    .from("listings")
    .select("agency_id")
    .eq("id", parsed.data.listing_id)
    .single();

  if (!listing) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Listing not found" },
    };
  }

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("id")
    .eq("agency_id", listing.agency_id)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!membership) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Not a member of this agency" },
    };
  }

  const { listing_id, expected_version, ...fields } = parsed.data;

  try {
    const updated = await update(supabase, user.id, listing_id, expected_version, fields);
    return { success: true, data: updated };
  } catch (err) {
    if (err instanceof Error && err.name === "OPTIMISTIC_LOCK_CONFLICT") {
      return {
        success: false,
        error: {
          code: "OPTIMISTIC_LOCK_CONFLICT",
          message: err.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: "UPDATE_FAILED",
        message: err instanceof Error ? err.message : "Failed to update listing",
      },
    };
  }
}
