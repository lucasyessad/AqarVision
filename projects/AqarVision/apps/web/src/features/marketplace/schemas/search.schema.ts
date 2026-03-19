import { z } from "zod";

export const searchFiltersSchema = z.object({
  q: z.string().optional(),
  type: z.enum(["sale", "rent", "vacation"]).optional(),
  propertyType: z
    .union([
      z.enum([
        "apartment",
        "villa",
        "terrain",
        "commercial",
        "office",
        "building",
        "farm",
        "warehouse",
      ]),
      z.array(
        z.enum([
          "apartment",
          "villa",
          "terrain",
          "commercial",
          "office",
          "building",
          "farm",
          "warehouse",
        ])
      ),
    ])
    .optional(),
  wilaya: z.string().optional(),
  priceMin: z.coerce.number().positive().optional(),
  priceMax: z.coerce.number().positive().optional(),
  surfaceMin: z.coerce.number().positive().optional(),
  surfaceMax: z.coerce.number().positive().optional(),
  roomsMin: z.coerce.number().int().positive().optional(),
  roomsMax: z.coerce.number().int().positive().optional(),
  bathroomsMin: z.coerce.number().int().min(0).optional(),
  floorMin: z.coerce.number().int().min(0).optional(),
  yearMin: z.coerce.number().int().min(1900).optional(),
  hasParking: z.coerce.boolean().optional(),
  hasElevator: z.coerce.boolean().optional(),
  furnished: z.coerce.boolean().optional(),
  agency: z.string().optional(),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "surface_desc"])
    .default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

export const createAlertSchema = z.object({
  name: z.string().min(2, "Le nom de l'alerte doit contenir au moins 2 caractères"),
  frequency: z.enum(["instant", "daily", "weekly"]),
  filters: searchFiltersSchema,
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
