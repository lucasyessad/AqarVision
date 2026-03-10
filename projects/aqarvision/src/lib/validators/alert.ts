import { z } from 'zod';

export const alertSchema = z.object({
  saved_search_id: z.string().uuid(),
  channel: z.enum(['email', 'in_app']).default('in_app'),
  frequency: z.enum(['instant', 'daily', 'weekly']).default('daily'),
});

export type AlertInput = z.infer<typeof alertSchema>;
