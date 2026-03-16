"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { CreateListingSchema } from "../schemas/listing.schema";
import { create } from "../services/listing.service";
import type { ActionResult, CreateListingResult } from "../types/listing.types";

export async function createListingAction(
  _prevState: ActionResult<CreateListingResult> | null,
  formData: FormData
): Promise<ActionResult<CreateListingResult>> {
  const agencyId = formData.get("agency_id") as string;
  if (!agencyId) return { success: false, error: { code: "VALIDATION_ERROR", message: "agency_id requis" } };

  const raw = {
    agency_id: agencyId,
    branch_id: formData.get("branch_id") || undefined,
    listing_type: formData.get("listing_type"),
    property_type: formData.get("property_type"),
    current_price: Number(formData.get("current_price")),
    wilaya_code: formData.get("wilaya_code") as string,
    commune_id: formData.get("commune_id") ? Number(formData.get("commune_id")) : undefined,
    surface_m2: formData.get("surface_m2") ? Number(formData.get("surface_m2")) : undefined,
    rooms: formData.get("rooms") ? Number(formData.get("rooms")) : undefined,
    bathrooms: formData.get("bathrooms") ? Number(formData.get("bathrooms")) : undefined,
    details: formData.get("details") ? (() => { try { return JSON.parse(formData.get("details") as string); } catch { return undefined; } })() : undefined,
  };

  const parsed = CreateListingSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.errors.map((e) => e.message).join(", ") } };
  }

  return withAgencyAuth(agencyId, "listing", "create", async ({ userId }) => {
    const supabase = await createClient();
    const result = await create(supabase, userId, parsed.data);
    revalidatePath("/[locale]/search", "page");
    revalidatePath("/[locale]/AqarPro/dashboard/listings", "page");
    return result;
  });
}
