import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

export const moderationActionSchema = z
  .object({
    listingId: z.string().uuid(),
    action: z.enum(["approved", "rejected", "hidden"]),
    reason: z
      .string()
      .min(10, "La raison doit contenir au moins 10 caractères")
      .transform(sanitizeInput)
      .optional(),
  })
  .refine(
    (data) => {
      if (data.action === "rejected" || data.action === "hidden") {
        return !!data.reason;
      }
      return true;
    },
    {
      message: "La raison est obligatoire pour un rejet ou un masquage",
      path: ["reason"],
    }
  );

export type ModerationActionInput = z.infer<typeof moderationActionSchema>;

export const verificationReviewSchema = z
  .object({
    verificationId: z.string().uuid(),
    action: z.enum(["approve", "reject"]),
    level: z.number().int().min(1).max(4).optional(),
    reason: z
      .string()
      .min(10)
      .transform(sanitizeInput)
      .optional(),
  })
  .refine(
    (data) => {
      if (data.action === "approve") return data.level !== undefined;
      if (data.action === "reject") return !!data.reason;
      return true;
    },
    {
      message: "Niveau requis pour l'approbation, raison requise pour le rejet",
    }
  );

export type VerificationReviewInput = z.infer<typeof verificationReviewSchema>;
