import { z } from "zod";

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const GetSignedUploadUrlSchema = z.object({
  listing_id: z.string().uuid(),
  file_name: z.string().min(1),
  content_type: z.enum(ALLOWED_TYPES),
  file_size_bytes: z.number().max(MAX_SIZE_BYTES),
});

export type GetSignedUploadUrlInput = z.infer<typeof GetSignedUploadUrlSchema>;

export const FinalizeMediaUploadSchema = z.object({
  listing_id: z.string().uuid(),
  storage_path: z.string(),
  content_type: z.string(),
  file_size_bytes: z.number(),
});

export type FinalizeMediaUploadInput = z.infer<typeof FinalizeMediaUploadSchema>;

export const ReorderMediaSchema = z.object({
  listing_id: z.string().uuid(),
  ordered_media_ids: z.array(z.string().uuid()),
});

export type ReorderMediaInput = z.infer<typeof ReorderMediaSchema>;

export const SetCoverSchema = z.object({
  listing_id: z.string().uuid(),
  media_id: z.string().uuid(),
});

export type SetCoverInput = z.infer<typeof SetCoverSchema>;

export const DeleteMediaSchema = z.object({
  media_id: z.string().uuid(),
});

export type DeleteMediaInput = z.infer<typeof DeleteMediaSchema>;
