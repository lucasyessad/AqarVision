export const LOCALES = ["fr", "ar", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

export const SUPPORTED_CURRENCIES = ["DZD", "EUR", "USD"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export interface ImageVariant {
  readonly name: string;
  readonly width: number;
  readonly height: number;
}

export const IMAGE_VARIANTS = {
  thumb: { name: "thumb", width: 150, height: 150 },
  small: { name: "small", width: 320, height: 240 },
  medium: { name: "medium", width: 640, height: 480 },
  big: { name: "big", width: 1280, height: 960 },
  square: { name: "square", width: 600, height: 600 },
  email: { name: "email", width: 560, height: 315 },
} as const satisfies Record<string, ImageVariant>;

export type ImageVariantName = keyof typeof IMAGE_VARIANTS;

/** 10 MB */
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];
