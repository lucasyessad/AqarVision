import { z } from 'zod';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 15;

export const propertyMediaSchema = z.object({
  property_id: z.string().uuid('ID de bien invalide'),
  images: z.array(z.string().url('URL d\'image invalide')).max(MAX_IMAGES, `Maximum ${MAX_IMAGES} images`),
});

export type PropertyMediaInput = z.infer<typeof propertyMediaSchema>;

export const imageUploadSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.enum(ALLOWED_IMAGE_TYPES, { message: 'Format accepté : JPEG, PNG ou WebP' }),
  fileSize: z.number().max(MAX_IMAGE_SIZE, 'Le fichier ne doit pas dépasser 10 Mo'),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;

export { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, MAX_IMAGES };
