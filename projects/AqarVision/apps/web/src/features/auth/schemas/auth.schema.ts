import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

// International phone: + followed by 7-15 digits (E.164 format)
const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .transform(sanitizeInput),
    lastName: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .transform(sanitizeInput),
    email: z.string().email("Email invalide"),
    phone: z.string().regex(PHONE_REGEX, "Numéro de téléphone algérien invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .transform(sanitizeInput),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .transform(sanitizeInput),
  phone: z.string().regex(PHONE_REGEX, "Numéro de téléphone algérien invalide"),
  preferredLocale: z.enum(["fr", "ar", "en", "es"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
