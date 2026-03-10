import { z } from 'zod';

export const leadSchema = z.object({
  agency_id: z.string().uuid(),
  property_id: z.string().uuid().optional().nullable(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(9, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
  source: z.enum(['contact_form', 'property_detail', 'whatsapp']).default('contact_form'),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
