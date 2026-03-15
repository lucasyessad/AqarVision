import { z } from "zod";
import { LISTING_TYPES, PROPERTY_TYPES } from "./listing.schema";

export const IndividualListingSchema = z.object({
  listing_type: z.enum(LISTING_TYPES),
  property_type: z.enum(PROPERTY_TYPES),
  wilaya_code: z.string().min(1),
  commune_id: z.number().int().positive().optional(),
  title: z.string().min(10, "Le titre doit contenir au moins 10 caractères").max(120),
  current_price: z.number().positive("Le prix doit être positif"),
  surface_m2: z.number().positive().optional(),
  rooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  details: z
    .object({
      has_elevator: z.boolean().default(false),
      has_parking: z.boolean().default(false),
      has_balcony: z.boolean().default(false),
      has_pool: z.boolean().default(false),
      has_garden: z.boolean().default(false),
      furnished: z.boolean().default(false),
    })
    .default({}),
});

export type IndividualListingInput = z.infer<typeof IndividualListingSchema>;
