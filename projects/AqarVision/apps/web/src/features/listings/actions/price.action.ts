"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { ChangePriceSchema } from "../schemas/listing.schema";
import { changePrice } from "../services/listing.service";
import type { ActionResult } from "@/types/action-result";

export async function changePriceAction(
  _prevState: ActionResult<{ updated: true }> | null,
  formData: FormData
): Promise<ActionResult<{ updated: true }>> {
  const parsed = ChangePriceSchema.safeParse({
    listing_id: formData.get("listing_id"),
    new_price: Number(formData.get("new_price")),
    expected_version: Number(formData.get("expected_version")),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  // Resolve agency from listing for RBAC
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("agency_id")
    .eq("id", parsed.data.listing_id)
    .single();

  if (!listing?.agency_id) {
    return { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } };
  }

  return withAgencyAuth(listing.agency_id as string, "listing", "update", async (ctx) => {
    const supabaseAuth = await createClient();
    await changePrice(
      supabaseAuth,
      ctx.userId,
      parsed.data.listing_id,
      parsed.data.new_price,
      parsed.data.expected_version,
      parsed.data.reason
    );
    revalidatePath("/[locale]/search", "page");
    revalidatePath("/[locale]/AqarPro/dashboard/listings", "page");
    return { updated: true as const };
  });
}
