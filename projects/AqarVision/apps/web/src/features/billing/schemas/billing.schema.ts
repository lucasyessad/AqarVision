import { z } from "zod";

export const checkoutSchema = z.object({
  agencyId: z.string().uuid(),
  planId: z.string().uuid(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const individualPaymentSchema = z.object({
  packType: z.enum(["pack_3", "pack_7", "pack_15"]).optional(),
  subscriptionType: z.enum(["chaab_plus", "chaab_pro"]).optional(),
  provider: z.enum(["stripe", "cib", "dahabia", "baridimob", "virement"]),
});

export type IndividualPaymentInput = z.infer<typeof individualPaymentSchema>;
