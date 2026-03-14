import { z } from "zod";

export const SUPPORTED_LOCALES = ["fr", "ar", "en", "es"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  preferred_locale: z.enum(SUPPORTED_LOCALES).default("fr"),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignInInput = z.infer<typeof SignInSchema>;

export const UpdateProfileSchema = z.object({
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  phone: z.string().optional(),
  preferred_locale: z.enum(SUPPORTED_LOCALES).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
