import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide');

// === Base Branding Schema (Starter / Pro) ===
export const agencyBrandingSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  slogan: z.string().max(120, 'Le slogan ne doit pas dépasser 120 caractères').optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  primary_color: hexColor,
  theme: z.enum(['minimal', 'modern', 'professional', 'editorial', 'premium', 'luxury', 'bold', 'custom']).default('modern'),
  accent_color: hexColor.nullable().optional(),
  border_style: z.enum(['rounded', 'square']).default('rounded'),
  locale: z.enum(['fr', 'ar', 'en']).default('fr'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email invalide').optional().nullable(),
  website: z.string().url('URL invalide').optional().nullable(),
  address: z.string().optional().nullable(),
  wilaya: z.string().optional().nullable(),
});

export type AgencyBrandingValues = z.infer<typeof agencyBrandingSchema>;

// === Wilayas Schema ===
export const agencyWilayaSchema = z.object({
  wilaya: z.string().min(1, 'La wilaya est requise'),
  address: z.string().optional().nullable(),
  is_headquarters: z.boolean().default(false),
});

export const agencyWilayasSchema = z
  .array(agencyWilayaSchema)
  .min(1, 'Au moins une wilaya est requise')
  .refine(
    (wilayas) => wilayas.filter((w) => w.is_headquarters).length <= 1,
    'Un seul siège principal est autorisé'
  );

export type AgencyWilayaInput = z.infer<typeof agencyWilayaSchema>;

// === Luxury Branding Schema (Enterprise Only) ===
export const agencyLuxuryBrandingSchema = agencyBrandingSchema.extend({
  secondary_color: hexColor.optional().nullable(),
  hero_style: z.enum(['color', 'cover', 'video']).default('cover'),
  hero_video_url: z.string().url('URL vidéo invalide').optional().nullable(),
  font_style: z.enum(['modern', 'classic', 'elegant']).default('elegant'),
  theme_mode: z.enum(['light', 'dark']).default('dark'),
  tagline: z.string().max(200, 'Le tagline ne doit pas dépasser 200 caractères').optional().nullable(),
  stats_years: z.coerce.number().int().min(0).optional().nullable(),
  stats_properties_sold: z.coerce.number().int().min(0).optional().nullable(),
  stats_clients: z.coerce.number().int().min(0).optional().nullable(),
  instagram_url: z.string().url('URL Instagram invalide').optional().nullable(),
  facebook_url: z.string().url('URL Facebook invalide').optional().nullable(),
  tiktok_url: z.string().url('URL TikTok invalide').optional().nullable(),
});

export type AgencyLuxuryBrandingValues = z.infer<typeof agencyLuxuryBrandingSchema>;
