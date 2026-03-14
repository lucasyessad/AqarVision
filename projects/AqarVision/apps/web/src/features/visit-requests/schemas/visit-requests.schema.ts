import { z } from "zod";

export const SubmitVisitRequestSchema = z.object({
  listingId: z.string().uuid(),
  agencyId: z.string().uuid(),
  visitorName: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  visitorPhone: z
    .string()
    .min(9, "Numéro de téléphone invalide")
    .regex(/^[0-9+\s()-]{9,20}$/, "Format de téléphone invalide"),
  visitorEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
  requestedDate: z.string().optional(), // ISO date string YYYY-MM-DD
});

export const UpdateVisitRequestStatusSchema = z.object({
  requestId: z.string().uuid(),
  agencyId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "cancelled", "done"]),
});

export type SubmitVisitRequestInput = z.infer<typeof SubmitVisitRequestSchema>;
export type UpdateVisitRequestStatusInput = z.infer<
  typeof UpdateVisitRequestStatusSchema
>;
