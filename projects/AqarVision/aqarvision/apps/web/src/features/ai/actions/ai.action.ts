"use server";

import { createClient } from "@/lib/supabase/server";
import { GenerateDescriptionSchema, TranslateListingSchema } from "../schemas/ai.schema";
import {
  generateDescription,
  translateListing,
} from "../services/ai.service";
import type { ActionResult } from "../types/ai.types";

export async function generateDescriptionAction(
  _prevState: ActionResult<{ text: string; job_id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ text: string; job_id: string }>> {
  const raw = {
    listing_id: formData.get("listing_id"),
    source_locale: formData.get("source_locale"),
  };

  const parsed = GenerateDescriptionSchema.safeParse(raw);

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

  // Get listing to find agency_id
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

  const agencyId = listing.agency_id as string;

  // Check membership
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("id")
    .eq("agency_id", agencyId)
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
    const result = await generateDescription(
      supabase,
      agencyId,
      parsed.data.listing_id,
      parsed.data.source_locale
    );
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    const code = message === "QUOTA_EXCEEDED" ? "QUOTA_EXCEEDED" : "AI_ERROR";
    return {
      success: false,
      error: { code, message },
    };
  }
}

export async function translateListingAction(
  _prevState: ActionResult<{ text: string; job_id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ text: string; job_id: string }>> {
  const raw = {
    listing_id: formData.get("listing_id"),
    source_locale: formData.get("source_locale"),
    target_locale: formData.get("target_locale"),
  };

  const parsed = TranslateListingSchema.safeParse(raw);

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

  // Get listing to find agency_id
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

  const agencyId = listing.agency_id as string;

  // Check membership
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("id")
    .eq("agency_id", agencyId)
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
    const result = await translateListing(
      supabase,
      agencyId,
      parsed.data.listing_id,
      parsed.data.source_locale,
      parsed.data.target_locale
    );
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    const code = message === "QUOTA_EXCEEDED" ? "QUOTA_EXCEEDED" : "AI_ERROR";
    return {
      success: false,
      error: { code, message },
    };
  }
}
