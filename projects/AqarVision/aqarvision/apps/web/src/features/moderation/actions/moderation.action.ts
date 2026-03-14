"use server";

import { createClient } from "@/lib/supabase/server";
import { ReportListingSchema, ReviewListingSchema } from "../schemas/moderation.schema";
import { reportListing, reviewListing } from "../services/moderation.service";
import type { ActionResult } from "../types/moderation.types";

export async function reportListingAction(
  _prevState: ActionResult<{ reported: true }> | null,
  formData: FormData
): Promise<ActionResult<{ reported: true }>> {
  const raw = {
    listing_id: formData.get("listing_id"),
    reason: formData.get("reason"),
  };

  const parsed = ReportListingSchema.safeParse(raw);

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

  try {
    await reportListing(supabase, user.id, parsed.data.listing_id, parsed.data.reason);
    return { success: true, data: { reported: true } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to report listing";
    return {
      success: false,
      error: { code: "REPORT_ERROR", message },
    };
  }
}

export async function reviewListingAction(
  _prevState: ActionResult<{ reviewed: true }> | null,
  formData: FormData
): Promise<ActionResult<{ reviewed: true }>> {
  const raw = {
    listing_id: formData.get("listing_id"),
    action: formData.get("action"),
    reason: formData.get("reason") || undefined,
  };

  const parsed = ReviewListingSchema.safeParse(raw);

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

  // Check super_admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "super_admin") {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Super admin access required" },
    };
  }

  try {
    await reviewListing(
      supabase,
      user.id,
      parsed.data.listing_id,
      parsed.data.action,
      parsed.data.reason
    );
    return { success: true, data: { reviewed: true } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to review listing";
    return {
      success: false,
      error: { code: "REVIEW_ERROR", message },
    };
  }
}
