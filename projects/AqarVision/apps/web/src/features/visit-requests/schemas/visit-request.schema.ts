import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

const PHONE_REGEX = /^(\+213|0)[5-7][0-9]{8}$/;

export const createVisitRequestSchema = z.object({
  listing_id: z.string().uuid(),
  agency_id: z.string().uuid(),
  name: z
    .string()
    .min(2)
    .transform(sanitizeInput),
  phone: z.string().regex(PHONE_REGEX, "Numéro de téléphone algérien invalide"),
  email: z.string().email().optional().or(z.literal("")),
  preferred_date: z.string().refine((val) => {
    const date = new Date(val);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return date >= tomorrow;
  }, "La date doit être au minimum demain"),
  preferred_time_slot: z.enum(["morning", "afternoon", "evening"]),
  message: z.string().max(500).transform(sanitizeInput).optional(),
});

export type CreateVisitRequestInput = z.infer<typeof createVisitRequestSchema>;
