import { z } from 'zod';

export const aiDescriptionInputSchema = z.object({
  title: z.string().optional(),
  type: z.string().min(1, 'Type de bien requis'),
  transaction_type: z.enum(['sale', 'rent']),
  surface: z.number().positive().optional(),
  rooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  wilaya: z.string().optional(),
  commune: z.string().optional(),
  features: z.array(z.string()).optional(),
  price: z.number().positive().optional(),
});

export type AiDescriptionInput = z.infer<typeof aiDescriptionInputSchema>;
