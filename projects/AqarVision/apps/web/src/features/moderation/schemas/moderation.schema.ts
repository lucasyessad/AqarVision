import { z } from "zod";

export const ReportListingSchema = z.object({
  listing_id: z.string().uuid(),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export type ReportListingInput = z.infer<typeof ReportListingSchema>;

export const ReviewListingSchema = z.object({
  listing_id: z.string().uuid(),
  action: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
});

export type ReviewListingInput = z.infer<typeof ReviewListingSchema>;
