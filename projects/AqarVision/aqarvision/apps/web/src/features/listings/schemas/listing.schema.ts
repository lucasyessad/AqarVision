import { z } from "zod";

export const LISTING_TYPES = ["sale", "rent", "vacation"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const PROPERTY_TYPES = [
  "apartment",
  "villa",
  "terrain",
  "commercial",
  "office",
  "building",
  "farm",
  "warehouse",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LOCALES = ["fr", "ar", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const CreateListingSchema = z.object({
  agency_id: z.string().uuid(),
  branch_id: z.string().uuid().optional(),
  listing_type: z.enum(LISTING_TYPES),
  property_type: z.enum(PROPERTY_TYPES),
  current_price: z.number().nonnegative(),
  wilaya_code: z.number().min(1),
  commune_id: z.number().optional(),
  surface_m2: z.number().nonnegative().optional(),
  rooms: z.number().nonnegative().int().optional(),
  bathrooms: z.number().nonnegative().int().optional(),
  details: z.record(z.unknown()).optional(),
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;

export const UpdateListingSchema = z.object({
  listing_id: z.string().uuid(),
  expected_version: z.number(),
  branch_id: z.string().uuid().optional(),
  listing_type: z.enum(LISTING_TYPES).optional(),
  property_type: z.enum(PROPERTY_TYPES).optional(),
  current_price: z.number().nonnegative().optional(),
  wilaya_code: z.number().min(1).optional(),
  commune_id: z.number().optional(),
  surface_m2: z.number().nonnegative().optional(),
  rooms: z.number().nonnegative().int().optional(),
  bathrooms: z.number().nonnegative().int().optional(),
  details: z.record(z.unknown()).optional(),
});

export type UpdateListingInput = z.infer<typeof UpdateListingSchema>;

export const UpsertTranslationSchema = z.object({
  listing_id: z.string().uuid(),
  locale: z.enum(LOCALES),
  title: z.string().min(3),
  description: z.string().min(10),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
});

export type UpsertTranslationInput = z.infer<typeof UpsertTranslationSchema>;

export const PublishListingSchema = z.object({
  listing_id: z.string().uuid(),
});

export type PublishListingInput = z.infer<typeof PublishListingSchema>;

export const ChangePriceSchema = z.object({
  listing_id: z.string().uuid(),
  new_price: z.number().nonnegative(),
  expected_version: z.number(),
  reason: z.string().optional(),
});

export type ChangePriceInput = z.infer<typeof ChangePriceSchema>;
