"use server";

import { createClient } from "@/lib/supabase/server";
import { CreateListingSchema } from "../schemas/listing.schema";
import { create } from "../services/listing.service";
import type { ActionResult, CreateListingResult } from "../types/listing.types";

export async function createListingAction(
  _prevState: ActionResult<CreateListingResult> | null,
  formData: FormData
): Promise<ActionResult<CreateListingResult>> {
  const raw = {
    agency_id: formData.get("agency_id"),
    branch_id: formData.get("branch_id") || undefined,
    listing_type: formData.get("listing_type"),
    property_type: formData.get("property_type"),
    current_price: Number(formData.get("current_price")),
    wilaya_code: Number(formData.get("wilaya_code")),
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

  const parsed = CreateListingSchema.safeParse(raw);

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

  // Check agency membership
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("id")
    .eq("agency_id", parsed.data.agency_id)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!membership) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Not a member of this agency" },
    };
  }

  try {
    const result = await create(supabase, user.id, parsed.data);
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "CREATE_FAILED",
        message: err instanceof Error ? err.message : "Failed to create listing",
      },
    };
  }
}
