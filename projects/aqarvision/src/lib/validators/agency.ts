import { z } from 'zod';

// === Base Branding Schema (Starter / Pro) ===
export const agencyBrandingSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  slogan: z.string().max(120, 'Le slogan ne doit pas dépasser 120 caractères').optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email invalide').optional().nullable(),
  website: z.string().url('URL invalide').optional().nullable(),
  address: z.string().optional().nullable(),
  wilaya: z.string().optional().nullable(),
});

export type AgencyBrandingValues = z.infer<typeof agencyBrandingSchema>;

// === Luxury Branding Schema (Enterprise Only) ===
export const agencyLuxuryBrandingSchema = agencyBrandingSchema.extend({
  secondary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Couleur secondaire invalide')
    .optional()
    .nullable(),
  hero_style: z.enum(['color', 'cover', 'video']).default('cover'),
  hero_video_url: z.string().url('URL vidéo invalide').optional().nullable(),
  font_style: z.enum(['modern', 'classic', 'elegant']).default('elegant'),
  theme_mode: z.enum(['light', 'dark']).default('dark'),
  tagline: z.string().max(200, 'Le tagline ne doit pas dépasser 200 caractères').optional().nullable(),
  stats_years: z.coerce.number().int().min(0).optional().nullable(),
  stats_properties_sold: z.coerce.number().int().min(0).optional().nullable(),
  stats_clients: z.coerce.number().int().min(0).optional().nullable(),
});

export type AgencyLuxuryBrandingValues = z.infer<typeof agencyLuxuryBrandingSchema>;
