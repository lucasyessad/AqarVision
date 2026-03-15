"use server";

import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { GenerateDescriptionSchema, TranslateListingSchema } from "../schemas/ai.schema";
import {
  generateDescription,
  translateListing,
} from "../services/ai.service";
import type { ActionResult } from "../types/ai.types";

async function getListingAgencyId(listingId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("agency_id")
    .eq("id", listingId)
    .single();
  return data?.agency_id as string | null;
}

export async function generateDescriptionAction(
  _prevState: ActionResult<{ text: string; job_id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ text: string; job_id: string }>> {
  const parsed = GenerateDescriptionSchema.safeParse({
    listing_id: formData.get("listing_id"),
    source_locale: formData.get("source_locale"),
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

  const agencyId = await getListingAgencyId(parsed.data.listing_id);
  if (!agencyId) {
    return { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } };
  }

  return withAgencyAuth(agencyId, "ai_job", "create", async (ctx) => {
    const supabase = await createClient();
    const result = await generateDescription(
      supabase,
      ctx.agencyId,
      parsed.data.listing_id,
      parsed.data.source_locale
    );
    return result;
  });
}

export async function translateListingAction(
  _prevState: ActionResult<{ translation: { title: string; description: string }; job_id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ translation: { title: string; description: string }; job_id: string }>> {
  const parsed = TranslateListingSchema.safeParse({
    listing_id: formData.get("listing_id"),
    source_locale: formData.get("source_locale"),
    target_locale: formData.get("target_locale"),
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

  const agencyId = await getListingAgencyId(parsed.data.listing_id);
  if (!agencyId) {
    return { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } };
  }

  return withAgencyAuth(agencyId, "ai_job", "create", async (ctx) => {
    const supabase = await createClient();
    const result = await translateListing(
      supabase,
      ctx.agencyId,
      parsed.data.listing_id,
      parsed.data.source_locale,
      parsed.data.target_locale
    );
    return result;
  });
}
