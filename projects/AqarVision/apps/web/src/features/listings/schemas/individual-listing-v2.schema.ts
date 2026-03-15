import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

export const LISTING_TYPES_V2 = ["sale", "rent", "vacation"] as const;
export const PROPERTY_TYPES_V2 = [
  "apartment", "villa", "terrain", "commercial",
  "office", "building", "farm", "warehouse",
] as const;
export const CONDITIONS = ["new", "good", "renovation", "construction"] as const;
export const ORIENTATIONS = ["north", "south", "east", "west"] as const;

export const IndividualListingV2Schema = z.object({
  // Step 1
  listing_type: z.enum(LISTING_TYPES_V2),
  property_type: z.enum(PROPERTY_TYPES_V2),

  // Step 2
  wilaya_code: z.string().min(1),
  commune_id: z.number().int().positive().optional(),
  address_text: z.string().max(200).transform(sanitizeInput).optional(),
  latitude: z.number().min(19).max(38).optional(),
  longitude: z.number().min(-9).max(12).optional(),

  // Step 3
  current_price: z.number().positive("Le prix doit être positif"),
  surface_m2: z.number().positive("La surface doit être positive").optional(),
  floor: z.number().int().min(0).max(50).optional(),
  total_floors: z.number().int().min(1).max(50).optional(),
  year_built: z.number().int().min(1900).max(new Date().getFullYear()).optional(),

  // Step 4
  rooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  details: z.object({
    has_elevator: z.boolean().default(false),
    has_parking: z.boolean().default(false),
    has_balcony: z.boolean().default(false),
    has_pool: z.boolean().default(false),
    has_garden: z.boolean().default(false),
    furnished: z.boolean().default(false),
    has_ac: z.boolean().default(false),
    has_heating: z.boolean().default(false),
    sea_view: z.boolean().default(false),
    has_terrace: z.boolean().default(false),
    has_cave: z.boolean().default(false),
    has_intercom: z.boolean().default(false),
    has_guardian: z.boolean().default(false),
    has_digicode: z.boolean().default(false),
    orientation: z.array(z.enum(ORIENTATIONS)).default([]),
    condition: z.enum(CONDITIONS).optional(),
  }).default({}),

  // Step 5
  title: z
    .string()
    .min(10, "Le titre doit contenir au moins 10 caractères")
    .max(120, "Le titre ne doit pas dépasser 120 caractères")
    .transform(sanitizeInput),
  description: z
    .string()
    .min(50, "La description doit contenir au moins 50 caractères")
    .max(2000, "La description ne doit pas dépasser 2000 caractères")
    .transform(sanitizeInput),

  // Step 7
  contact_phone: z.string().min(9, "Numéro invalide").max(15).optional(),
  show_phone: z.boolean().default(true),
  accept_messages: z.boolean().default(true),
});

export type IndividualListingV2Input = z.infer<typeof IndividualListingV2Schema>;

// Partial schema for draft creation (steps 1-5, no contact yet)
export const DraftListingSchema = IndividualListingV2Schema.omit({
  contact_phone: true,
  show_phone: true,
  accept_messages: true,
});

export type DraftListingInput = z.infer<typeof DraftListingSchema>;
