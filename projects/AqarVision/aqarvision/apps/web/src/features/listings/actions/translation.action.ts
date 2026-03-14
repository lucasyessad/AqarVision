"use server";

import { createClient } from "@/lib/supabase/server";
import { UpsertTranslationSchema } from "../schemas/listing.schema";
import { upsertTranslation } from "../services/listing.service";
import type { ActionResult, TranslationDto } from "../types/listing.types";

export async function upsertTranslationAction(
  _prevState: ActionResult<TranslationDto> | null,
  formData: FormData
): Promise<ActionResult<TranslationDto>> {
  const parsed = UpsertTranslationSchema.safeParse({
    listing_id: formData.get("listing_id"),
    locale: formData.get("locale"),
    title: formData.get("title"),
    description: formData.get("description"),
    slug: formData.get("slug"),
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

  const { listing_id, ...translationData } = parsed.data;

  try {
    const translation = await upsertTranslation(supabase, listing_id, translationData);
    return { success: true, data: translation };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "TRANSLATION_FAILED",
        message: err instanceof Error ? err.message : "Failed to save translation",
      },
    };
  }
}
