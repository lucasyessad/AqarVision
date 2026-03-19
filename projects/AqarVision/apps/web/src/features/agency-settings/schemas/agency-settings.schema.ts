import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

export const storefrontContentSchema = z.object({
  hero_image_url: z.string().url().optional(),
  hero_video_url: z
    .string()
    .regex(
      /^https?:\/\/(www\.)?(youtube\.com\/watch|youtu\.be\/|vimeo\.com\/)/,
      "URL YouTube ou Vimeo uniquement"
    )
    .optional()
    .or(z.literal("")),
  extra_photos: z.array(z.string().url()).max(4).optional(),
  tagline: z
    .string()
    .max(80)
    .transform(sanitizeInput)
    .optional()
    .or(z.literal("")),
  about_text: z
    .string()
    .max(500)
    .transform(sanitizeInput)
    .optional()
    .or(z.literal("")),
  services: z
    .array(
      z.object({
        title: z.string().max(50).transform(sanitizeInput),
        icon: z.string().max(30),
        text: z.string().max(200).transform(sanitizeInput),
      })
    )
    .max(4)
    .optional(),
  custom_stats: z
    .object({
      years_experience: z.number().int().min(0).max(100).optional(),
      satisfied_clients: z.number().int().min(0).max(100000).optional(),
    })
    .optional(),
  theme_extras: z.record(z.string()).optional(),
});

export type StorefrontContentInput = z.infer<typeof storefrontContentSchema>;

export const brandingSchema = z.object({
  theme: z.string().min(1),
  primary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex invalide"),
  accent_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex invalide"),
  secondary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex invalide")
    .optional(),
});

export type BrandingInput = z.infer<typeof brandingSchema>;

export const notificationPrefsSchema = z.object({
  new_lead_email: z.boolean(),
  new_lead_inapp: z.boolean(),
  visit_request_email: z.boolean(),
  visit_request_inapp: z.boolean(),
  new_message_inapp: z.boolean(),
  moderation_result_email: z.boolean(),
  billing_alerts_email: z.boolean(),
  weekly_digest_email: z.boolean(),
});

export type NotificationPrefsInput = z.infer<typeof notificationPrefsSchema>;
