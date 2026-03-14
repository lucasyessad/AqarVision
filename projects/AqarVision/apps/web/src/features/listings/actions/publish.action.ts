"use server";

import { createClient } from "@/lib/supabase/server";
import { PublishListingSchema } from "../schemas/listing.schema";
import { canPublish, submitForReview } from "../services/listing.service";

type PublishResult =
  | { success: true; data: { submitted: true } }
  | { success: false; error: { code: string; message: string; missing?: string[] } };

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

  // Pre-check requirements
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

  try {
    await submitForReview(supabase, user.id, parsed.data.listing_id);
    return { success: true, data: { submitted: true } };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "SUBMIT_FAILED",
        message: err instanceof Error ? err.message : "Failed to submit for review",
      },
    };
  }
}
