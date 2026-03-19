import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

export const moderationActionSchema = z.enum(["approved", "rejected", "hidden"]);

export const moderationSchema = z
  .object({
    listing_id: z.string().uuid(),
    action: moderationActionSchema,
    reason: z
      .string()
      .transform(sanitizeInput)
      .optional(),
  })
  .refine(
    (data) => {
      if (data.action === "rejected" || data.action === "hidden") {
        return data.reason && data.reason.length >= 10;
      }
      return true;
    },
    {
      message: "La raison doit contenir au moins 10 caractères pour un rejet ou un masquage",
      path: ["reason"],
    }
  );

export type ModerationInput = z.infer<typeof moderationSchema>;

export const verificationReviewSchema = z
  .object({
    verification_id: z.string().uuid(),
    action: z.enum(["approve", "reject"]),
    level: z.number().int().min(1).max(4).optional(),
    reason: z
      .string()
      .transform(sanitizeInput)
      .optional(),
  })
  .refine(
    (data) => {
      if (data.action === "approve") {
        return data.level !== undefined;
      }
      return true;
    },
    {
      message: "Le niveau est requis pour une approbation",
      path: ["level"],
    }
  )
  .refine(
    (data) => {
      if (data.action === "reject") {
        return data.reason && data.reason.length >= 10;
      }
      return true;
    },
    {
      message: "La raison doit contenir au moins 10 caractères pour un rejet",
      path: ["reason"],
    }
  );

export type VerificationReviewInput = z.infer<typeof verificationReviewSchema>;

export const platformSettingSchema = z.object({
  key: z.string().min(1, "La clé est requise"),
  value: z.string(),
});

export type PlatformSettingInput = z.infer<typeof platformSettingSchema>;

export const entitlementSchema = z.object({
  agency_id: z.string().uuid(),
  feature_key: z.string().min(1, "La clé de fonctionnalité est requise"),
  enabled: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
});

export type EntitlementInput = z.infer<typeof entitlementSchema>;

export const paymentApprovalSchema = z.object({
  payment_id: z.string().uuid(),
});

export type PaymentApprovalInput = z.infer<typeof paymentApprovalSchema>;
