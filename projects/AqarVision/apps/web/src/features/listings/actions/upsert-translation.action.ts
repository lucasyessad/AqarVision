"use server";

import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { upsertTranslation } from "../services/listing.service";
import type { ActionResult } from "../types/listing.types";
import type { TranslationDto } from "../types/listing.types";

export async function upsertTranslationAction(input: {
  listing_id: string;
  locale: string;
  title: string;
  description: string;
  slug: string;
}): Promise<ActionResult<TranslationDto>> {
  if (!input.listing_id || !input.title || !input.description) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Champs requis manquants" },
    };
  }

  // Fetch listing's agency_id to guard with withAgencyAuth
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("agency_id")
    .eq("id", input.listing_id)
    .single();

  if (!listing) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Annonce introuvable" },
    };
  }

  return withAgencyAuth(listing.agency_id as string, "listing", "update", async () => {
    const sb = await createClient();
    return upsertTranslation(sb, input.listing_id, {
      locale: input.locale as "fr" | "ar" | "en" | "es",
      title: input.title,
      description: input.description,
      slug: input.slug,
    });
  });
}
