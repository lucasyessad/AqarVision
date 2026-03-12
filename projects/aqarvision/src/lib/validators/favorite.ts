import { z } from 'zod';

export const favoriteSchema = z.object({
  propertyId: z.string().uuid('ID de bien invalide'),
});

export type FavoriteInput = z.infer<typeof favoriteSchema>;
