"use server";

import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { PublishListingSchema } from "../schemas/listing.schema";
import { canPublish, submitForReview } from "../services/listing.service";
import type { ActionResult } from "@/types/action-result";

type PublishResult = ActionResult<{ submitted: true }> & {
  error?: { code: string; message: string; missing?: string[] };
};

export async function submitForReviewAction(
  _prevState: PublishResult | null,
  formData: FormData
): Promise<PublishResult> {
  const parsed = PublishListingSchema.safeParse({
    listing_id: formData.get("listing_id"),
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

  // Pre-check publication requirements before auth (no DB write, read-only)
  const check = await canPublish(supabase, parsed.data.listing_id);
  if (!check.canPublish) {
    return {
      success: false,
      error: {
        code: "PUBLISH_REQUIREMENTS_NOT_MET",
        message: "Publication requirements not met",
        missing: check.missing,
      },
    };
  }

  return withAgencyAuth(listing.agency_id as string, "listing", "update", async (ctx) => {
    const supabaseAuth = await createClient();
    await submitForReview(supabaseAuth, ctx.userId, parsed.data.listing_id);
    return { submitted: true as const };
  });
}
