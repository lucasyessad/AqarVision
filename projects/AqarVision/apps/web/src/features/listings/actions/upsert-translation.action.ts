"use server";

import { createClient } from "@/lib/supabase/server";
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

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("id")
    .eq("agency_id", listing.agency_id as string)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!membership) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Accès refusé" },
    };
  }

  try {
    const result = await upsertTranslation(supabase, input.listing_id, {
      locale: input.locale as "fr" | "ar" | "en" | "es",
      title: input.title,
      description: input.description,
      slug: input.slug,
    });
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "UPSERT_FAILED",
        message: err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      },
    };
  }
}
