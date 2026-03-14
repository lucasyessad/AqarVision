import { z } from "zod";
import { LISTING_TYPES, PROPERTY_TYPES, LOCALES } from "@/features/listings/schemas/listing.schema";

export const MapBoundsSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
});

export type MapBounds = z.infer<typeof MapBoundsSchema>;

export const SearchFiltersSchema = z.object({
  locale: z.enum(LOCALES),
  q: z.string().optional(),
  listing_type: z.enum(LISTING_TYPES).optional(),
  property_type: z.enum(PROPERTY_TYPES).optional(),
  wilaya_code: z.coerce.number().optional(),
  commune_id: z.coerce.number().optional(),
  price_min: z.coerce.number().nonnegative().optional(),
  price_max: z.coerce.number().nonnegative().optional(),
  rooms_min: z.coerce.number().nonnegative().int().optional(),
  surface_min: z.coerce.number().nonnegative().optional(),
  map_bounds: MapBoundsSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(20),
});

export type SearchFiltersInput = z.infer<typeof SearchFiltersSchema>;
