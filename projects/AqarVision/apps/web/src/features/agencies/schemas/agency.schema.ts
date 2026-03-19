import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

const PHONE_REGEX = /^(\+213|0)[5-7][0-9]{8}$/;

export const createAgencySchema = z.object({
  name: z
    .string()
    .min(3, "Le nom de l'agence doit contenir au moins 3 caractères")
    .transform(sanitizeInput),
  slug: z
    .string()
    .min(3)
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
    ),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(PHONE_REGEX, "Numéro de téléphone algérien invalide"),
  wilaya_code: z.string().min(1),
  commune_id: z.number().int().positive(),
});

export type CreateAgencyInput = z.infer<typeof createAgencySchema>;

export const updateAgencySettingsSchema = z.object({
  name: z.string().min(3).transform(sanitizeInput),
  description: z.string().max(1000).transform(sanitizeInput).optional(),
  email: z.string().email(),
  phone: z.string().regex(PHONE_REGEX),
  whatsapp_phone: z.string().regex(PHONE_REGEX).optional().or(z.literal("")),
  opening_hours: z.string().max(200).transform(sanitizeInput).optional(),
  facebook_url: z.string().url().optional().or(z.literal("")),
  instagram_url: z.string().url().optional().or(z.literal("")),
});

export type UpdateAgencySettingsInput = z.infer<typeof updateAgencySettingsSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["admin", "agent", "editor", "viewer"]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
