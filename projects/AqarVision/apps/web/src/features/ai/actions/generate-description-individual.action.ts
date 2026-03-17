"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { ok, fail } from "@/types/action-result";
import { z } from "zod";
import type { ActionResult } from "@/types/action-result";

const AI_BACKEND_URL = process.env.AI_BACKEND_URL ?? "http://localhost:8000";
const AI_SERVICE_KEY = process.env.AI_SERVICE_KEY ?? "";

const InputSchema = z.object({
  listing_type: z.string(),
  property_type: z.string(),
  current_price: z.number(),
  surface_m2: z.number().optional(),
  rooms: z.number().optional(),
  bathrooms: z.number().optional(),
  floor: z.number().optional(),
  wilaya_code: z.string(),
  commune_name: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  condition: z.string().optional(),
  year_built: z.number().optional(),
});

export async function generateDescriptionIndividualAction(
  input: unknown
): Promise<ActionResult<{ text: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("UNAUTHORIZED", "Connexion requise");

  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.errors.map((e) => e.message).join(", "));
  }

  const d = parsed.data;

  try {
    const response = await fetch(
      `${AI_BACKEND_URL}/api/v1/generate/description/individual`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Key": AI_SERVICE_KEY,
        },
        body: JSON.stringify({
          listing_type: d.listing_type,
          property_type: d.property_type,
          current_price: d.current_price,
          surface_m2: d.surface_m2 ?? null,
          rooms: d.rooms ?? null,
          bathrooms: d.bathrooms ?? null,
          floor: d.floor ?? null,
          wilaya_code: d.wilaya_code,
          commune_name: d.commune_name ?? null,
          details: d.details ?? {},
          condition: d.condition ?? null,
          year_built: d.year_built ?? null,
          locale: "fr",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        { status: response.status, error: errorText, userId: user.id },
        "AI backend error for individual description"
      );
      return fail("AI_ERROR", "La génération a échoué. Réessayez.");
    }

    const result = (await response.json()) as { text: string; locale: string };
    return ok({ text: result.text });
  } catch (err) {
    logger.error({ err, userId: user.id }, "generateDescriptionIndividual failed");
    return fail("AI_ERROR", "La génération a échoué. Vérifiez votre connexion et réessayez.");
  }
}
