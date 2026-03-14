import { z } from "zod";

export const LeadStatusSchema = z.enum(["new", "contacted", "qualified", "closed"]);

export const UpdateLeadStatusSchema = z.object({
  leadId: z.string().uuid(),
  agencyId: z.string().uuid(),
  status: LeadStatusSchema,
});

export const AddLeadNoteSchema = z.object({
  leadId: z.string().uuid(),
  agencyId: z.string().uuid(),
  note: z.string().min(1, "La note ne peut pas être vide").max(2000),
});

export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;
export type AddLeadNoteInput = z.infer<typeof AddLeadNoteSchema>;
