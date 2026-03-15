import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

export const CreateLeadSchema = z.object({
  listing_id: z.string().uuid(),
  message: z.string().max(500).transform(sanitizeInput).optional(),
  source: z
    .enum(["platform", "whatsapp", "phone"])
    .default("platform"),
});

export const SendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  body: z.string().min(1).max(2000).transform(sanitizeInput),
});

export const MarkReadSchema = z.object({
  conversation_id: z.string().uuid(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type MarkReadInput = z.infer<typeof MarkReadSchema>;
