import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

export const listingTypeSchema = z.enum(["sale", "rent", "vacation"]);
export type ListingType = z.infer<typeof listingTypeSchema>;

export const propertyTypeSchema = z.enum([
  "apartment",
  "villa",
  "terrain",
  "commercial",
  "office",
  "building",
  "farm",
  "warehouse",
]);
export type PropertyType = z.infer<typeof propertyTypeSchema>;

export const listingStatusSchema = z.enum([
  "draft",
  "pending_review",
  "published",
  "paused",
  "rejected",
  "sold",
  "rented",
  "expired",
  "archived",
]);
export type ListingStatus = z.infer<typeof listingStatusSchema>;

export const listingDetailsSchema = z.object({
  area_m2: z.number().positive(),
  rooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  floor: z.number().int().optional(),
  total_floors: z.number().int().optional(),
  year_built: z.number().int().min(1900).max(2030).optional(),
  has_parking: z.boolean().optional(),
  has_elevator: z.boolean().optional(),
  has_balcony: z.boolean().optional(),
  has_pool: z.boolean().optional(),
  has_garden: z.boolean().optional(),
  furnished: z.boolean().optional(),
  has_sea_view: z.boolean().optional(),
  has_water: z.boolean().optional(),
  has_electricity: z.boolean().optional(),
});

export const listingTranslationSchema = z.object({
  locale: z.enum(["fr", "ar", "en", "es"]),
  title: z
    .string()
    .min(10, "Le titre doit contenir au moins 10 caractères")
    .max(120, "Le titre ne doit pas dépasser 120 caractères")
    .transform(sanitizeInput),
  description: z
    .string()
    .min(50, "La description doit contenir au moins 50 caractères")
    .max(5000, "La description ne doit pas dépasser 5000 caractères")
    .transform(sanitizeInput),
  slug: z.string().optional(),
});

export const createListingSchema = z.object({
  listing_type: listingTypeSchema,
  property_type: propertyTypeSchema,
  wilaya_code: z.string().min(1),
  commune_id: z.number().int().positive(),
  address: z.string().max(200).transform(sanitizeInput).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  details: listingDetailsSchema,
  price: z.number().positive("Le prix doit être positif"),
  currency: z.enum(["DZD", "EUR"]).default("DZD"),
  translations: z
    .array(listingTranslationSchema)
    .min(1, "Au moins une traduction est requise"),
  contact_phone: z.string().optional(),
  show_phone: z.boolean().default(true),
  accept_messages: z.boolean().default(true),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
