import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

export const createLeadSchema = z.object({
  listing_id: z.string().uuid(),
  agency_id: z.string().uuid(),
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .transform(sanitizeInput),
  phone: z.string().regex(PHONE_REGEX, "Numéro de téléphone algérien invalide"),
  email: z.string().email().optional().or(z.literal("")),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(1000, "Le message ne doit pas dépasser 1000 caractères")
    .transform(sanitizeInput),
  lead_type: z
    .enum(["info", "visit", "offer", "urgent"])
    .default("info"),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadStatusSchema = z.object({
  lead_id: z.string().uuid(),
  status: z.enum(["new", "contacted", "qualified", "closed"]),
});

export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
