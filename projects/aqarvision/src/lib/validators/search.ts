import { z } from 'zod';

export const searchFiltersSchema = z.object({
  q: z.string().max(200).optional().nullable(),
  transaction_type: z.enum(['sale', 'rent']).optional().nullable(),
  country: z.string().length(2).optional().nullable(),
  wilaya: z.string().max(100).optional().nullable(),
  commune: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  property_type: z.string().max(50).optional().nullable(),
  price_min: z.coerce.number().min(0).optional().nullable(),
  price_max: z.coerce.number().min(0).optional().nullable(),
  surface_min: z.coerce.number().min(0).optional().nullable(),
  surface_max: z.coerce.number().min(0).optional().nullable(),
  rooms_min: z.coerce.number().int().min(0).optional().nullable(),
  sort: z
    .enum(['recent', 'price_asc', 'price_desc', 'surface_asc', 'surface_desc', 'trust_desc'])
    .default('recent'),
  page: z.coerce.number().int().min(1).default(1),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

export const savedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  transaction_type: z.enum(['sale', 'rent']).optional().nullable(),
  country: z.string().length(2).optional().nullable(),
  wilaya: z.string().max(100).optional().nullable(),
  commune: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  property_type: z.string().max(50).optional().nullable(),
  price_min: z.coerce.number().min(0).optional().nullable(),
  price_max: z.coerce.number().min(0).optional().nullable(),
  surface_min: z.coerce.number().min(0).optional().nullable(),
  surface_max: z.coerce.number().min(0).optional().nullable(),
  rooms_min: z.coerce.number().int().min(0).optional().nullable(),
  keywords: z.string().max(200).optional().nullable(),
});

export type SavedSearchInput = z.infer<typeof savedSearchSchema>;
