import { z } from "zod";

export const CreateCollectionSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Nom trop long"),
});

export const RenameCollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Le nom est requis").max(100, "Nom trop long"),
});

export const DeleteCollectionSchema = z.object({
  id: z.string().uuid(),
});

export const AssignFavoriteSchema = z.object({
  favorite_id: z.string().uuid(),
  collection_id: z.string().uuid().nullable(),
});

export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type RenameCollectionInput = z.infer<typeof RenameCollectionSchema>;
export type DeleteCollectionInput = z.infer<typeof DeleteCollectionSchema>;
export type AssignFavoriteInput = z.infer<typeof AssignFavoriteSchema>;
