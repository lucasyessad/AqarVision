"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { ok, fail } from "@/types/action-result";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import type { ActionResult } from "@/types/action-result";

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

  const typeLabels: Record<string, string> = {
    sale: "Vente",
    rent: "Location",
    vacation: "Location vacances",
    apartment: "Appartement",
    villa: "Villa",
    terrain: "Terrain",
    commercial: "Local commercial",
    office: "Bureau",
    building: "Immeuble",
    farm: "Ferme",
    warehouse: "Entrepôt",
  };

  const detailsList = Object.entries(d.details ?? {})
    .filter(([, v]) => v === true)
    .map(([k]) => k.replace("has_", "").replace("_", " "))
    .join(", ");

  const userPrompt = `Rédige une description immobilière professionnelle en français pour ce bien :
- Type d'annonce : ${typeLabels[d.listing_type] ?? d.listing_type}
- Type de bien : ${typeLabels[d.property_type] ?? d.property_type}
- Prix : ${d.current_price.toLocaleString("fr-DZ")} DZD
- Surface : ${d.surface_m2 ?? "non précisée"} m²
- Pièces : ${d.rooms ?? "non précisées"}
- Salles de bain : ${d.bathrooms ?? "non précisées"}
${d.floor !== undefined ? `- Étage : ${d.floor}` : ""}
- Localisation : wilaya ${d.wilaya_code}${d.commune_name ? `, ${d.commune_name}` : ""}
${d.condition ? `- État : ${d.condition}` : ""}
${d.year_built ? `- Année de construction : ${d.year_built}` : ""}
${detailsList ? `- Équipements : ${detailsList}` : ""}

Instructions : 150 à 250 mots. Ton professionnel mais chaleureux. Ne pas inventer de caractéristiques non fournies. Commence directement par la description, sans titre ni label.`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: "Tu es un rédacteur immobilier professionnel spécialisé dans le marché algérien. Tu génères des descriptions d'annonces immobilières claires, précises et attrayantes.",
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return fail("AI_ERROR", "La génération a échoué. Réessayez.");
    }

    return ok({ text: textBlock.text.trim() });
  } catch (err) {
    logger.error({ err, userId: user.id }, "generateDescriptionIndividual failed");
    return fail("AI_ERROR", "La génération a échoué. Vérifiez votre connexion et réessayez.");
  }
}
