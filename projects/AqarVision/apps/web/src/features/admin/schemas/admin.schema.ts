import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

export const ApproveAgencySchema = z.object({
  agencyId: z.string().uuid("ID agence invalide"),
});
export type ApproveAgencyInput = z.infer<typeof ApproveAgencySchema>;

export const RejectAgencySchema = z.object({
  agencyId: z.string().uuid("ID agence invalide"),
  comment: z.string().max(500).transform(sanitizeInput).optional(),
});
export type RejectAgencyInput = z.infer<typeof RejectAgencySchema>;

export const SuspendAgencySchema = z.object({
  agencyId: z.string().uuid("ID agence invalide"),
});
export type SuspendAgencyInput = z.infer<typeof SuspendAgencySchema>;
