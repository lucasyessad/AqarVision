import { z } from "zod";

export const StartCheckoutSchema = z.object({
  agency_id: z.string().uuid(),
  plan_code: z.string().min(1),
});

export const OpenPortalSchema = z.object({
  agency_id: z.string().uuid(),
});
