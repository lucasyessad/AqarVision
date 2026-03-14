import { z } from "zod";

export const LOCALES = ["fr", "ar", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const AI_JOB_TYPES = [
  "generate_description",
  "translate",
  "enrich",
] as const;
export type AiJobType = (typeof AI_JOB_TYPES)[number];

export const GenerateDescriptionSchema = z.object({
  listing_id: z.string().uuid(),
  source_locale: z.enum(LOCALES),
});

export type GenerateDescriptionInput = z.infer<
  typeof GenerateDescriptionSchema
>;

export const TranslateListingSchema = z.object({
  listing_id: z.string().uuid(),
  source_locale: z.enum(LOCALES),
  target_locale: z.enum(LOCALES),
});

export type TranslateListingInput = z.infer<typeof TranslateListingSchema>;

export const EnrichListingSchema = z.object({
  listing_id: z.string().uuid(),
  locale: z.enum(LOCALES),
});

export type EnrichListingInput = z.infer<typeof EnrichListingSchema>;
