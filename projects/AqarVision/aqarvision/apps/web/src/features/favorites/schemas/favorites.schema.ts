import { z } from "zod";

export const ToggleFavoriteSchema = z.object({
  listing_id: z.string().uuid(),
});

export const SaveNoteSchema = z.object({
  listing_id: z.string().uuid(),
  body: z.string().min(1),
});

export const SaveSearchSchema = z.object({
  name: z.string().min(1),
  filters: z.record(z.unknown()),
});

export const DeleteSavedSearchSchema = z.object({
  id: z.string().uuid(),
});

export type ToggleFavoriteInput = z.infer<typeof ToggleFavoriteSchema>;
export type SaveNoteInput = z.infer<typeof SaveNoteSchema>;
export type SaveSearchInput = z.infer<typeof SaveSearchSchema>;
export type DeleteSavedSearchInput = z.infer<typeof DeleteSavedSearchSchema>;
