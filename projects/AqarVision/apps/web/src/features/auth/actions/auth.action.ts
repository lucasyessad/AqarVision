"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/rate-limit";
import { SignInSchema, SignUpSchema, ResetPasswordSchema } from "../schemas/auth.schema";

async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// ── Sign In ──────────────────────────────────

export type AuthFormState = {
  success: false;
  error: { code: string; message: string };
  email?: string;
} | null;

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const rl = await rateLimit(`signIn:${ip}`, 5, 60_000);
  if (!rl.success) {
    return {
      success: false,
      error: { code: "RATE_LIMITED", message: "Trop de tentatives. Réessayez dans quelques minutes." },
    };
  }

  const email = formData.get("email") as string;

  const parsed = SignInSchema.safeParse({
    email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Email ou mot de passe invalide" },
      email,
    };
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      success: false,
      error: { code: "AUTH_ERROR", message: "Email ou mot de passe incorrect" },
      email,
    };
  }

  // Smart routing: check agency membership to determine destination
  const userId = signInData.user?.id;
  const locale = (formData.get("locale") as string) || "fr";
  const redirectOverride = formData.get("redirect") as string | null;

  if (redirectOverride) {
    redirect(redirectOverride);
  }

  if (userId) {
    const { data: membership } = await supabase
      .from("agency_memberships")
      .select("role")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (membership && ["owner", "admin", "agent"].includes(membership.role)) {
      redirect(`/${locale}/AqarPro/dashboard`);
    }
  }

  // No active agency membership → visiteur space
  redirect(`/${locale}/AqarChaab/espace`);
}

// ── Sign In (Pro — requires agency membership) ────────
export async function signInProAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const rl = await rateLimit(`signInPro:${ip}`, 5, 60_000);
  if (!rl.success) {
    return {
      success: false,
      error: { code: "RATE_LIMITED", message: "Trop de tentatives. Réessayez dans quelques minutes." },
    };
  }

  const email = formData.get("email") as string;

  const parsed = SignInSchema.safeParse({
    email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Email ou mot de passe invalide" },
      email,
    };
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      success: false,
      error: { code: "AUTH_ERROR", message: "Email ou mot de passe incorrect" },
      email,
    };
  }

  const userId = signInData.user?.id;
  const locale = (formData.get("locale") as string) || "fr";

  if (userId) {
    const { data: membership } = await supabase
      .from("agency_memberships")
      .select("role")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (membership && ["owner", "admin", "agent"].includes(membership.role)) {
      redirect(`/${locale}/AqarPro/dashboard`);
    }
  }

  // No agency membership — sign out and return error
  await supabase.auth.signOut();
  return {
    success: false,
    error: {
      code: "NO_AGENCY",
      message: "Ce compte n'est pas associé à une agence. Utilisez l'espace AqarChaab pour les particuliers.",
    },
    email,
  };
}

// ── Sign Up ──────────────────────────────────

export type SignUpFormState =
  | { success: true; emailConfirmation: boolean }
  | { success: false; error: { code: string; message: string }; email?: string; fullName?: string }
  | null;

export async function signUpAction(
  _prevState: SignUpFormState,
  formData: FormData
): Promise<SignUpFormState> {
  const ip = await getClientIp();
  const rl = await rateLimit(`signUp:${ip}`, 5, 60_000);
  if (!rl.success) {
    return {
      success: false,
      error: { code: "RATE_LIMITED", message: "Trop de tentatives. Réessayez dans quelques minutes." },
    };
  }

  const email = formData.get("email") as string;
  const fullName = formData.get("full_name") as string;

  const parsed = SignUpSchema.safeParse({
    email,
    password: formData.get("password"),
    preferred_locale: formData.get("preferred_locale") || "fr",
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    let message = "Données invalides";
    if (firstError?.path[0] === "email") message = "Adresse e-mail invalide";
    else if (firstError?.path[0] === "password") message = "Le mot de passe doit contenir au moins 8 caractères";

    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message },
      email,
      fullName,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: fullName,
        preferred_locale: parsed.data.preferred_locale,
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: { code: "AUTH_ERROR", message: error.message },
      email,
      fullName,
    };
  }

  // If email confirmation is required, user won't have a session yet
  const needsConfirmation =
    data.user && !data.session && data.user.identities?.length === 0
      ? false // User already exists (Supabase returns empty identities)
      : data.user && !data.session;

  if (needsConfirmation) {
    return { success: true, emailConfirmation: true };
  }

  // If user already exists with no identities, treat as error
  if (data.user?.identities?.length === 0) {
    return {
      success: false,
      error: { code: "AUTH_ERROR", message: "Un compte avec cet email existe déjà" },
      email,
      fullName,
    };
  }

  // Direct sign-in success (no email confirmation needed) → redirect to dashboard
  const locale = parsed.data.preferred_locale ?? "fr";
  const redirectTo = (formData.get("redirect_to") as string | null) || `/${locale}/AqarPro/dashboard`;
  redirect(redirectTo);
}

// ── Forgot Password ──────────────────────────

export type ForgotPasswordFormState =
  | { success: true }
  | { success: false; error: { code: string; message: string }; email?: string }
  | null;

export async function forgotPasswordAction(
  _prevState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const email = formData.get("email") as string;
  const locale = (formData.get("locale") as string) || "fr";

  // Rate limit by both IP and email to prevent abuse
  const ip = await getClientIp();
  const rlIp = await rateLimit(`forgotPwd:${ip}`, 3, 600_000);
  const rlEmail = email ? await rateLimit(`forgotPwd:${email.toLowerCase()}`, 3, 600_000) : { success: true };
  if (!rlIp.success || !rlEmail.success) {
    return {
      success: false,
      error: { code: "RATE_LIMITED", message: "Trop de tentatives. Réessayez dans quelques minutes." },
      email,
    };
  }

  const parsed = ResetPasswordSchema.safeParse({ email });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Adresse e-mail invalide" },
      email,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${locale}/auth/reset-password`,
  });

  if (error) {
    return {
      success: false,
      error: { code: "AUTH_ERROR", message: "Impossible d'envoyer l'email de réinitialisation" },
      email,
    };
  }

  // Always return success to avoid email enumeration
  return { success: true };
}

// ── Reset Password ───────────────────────────

export type ResetPasswordFormState =
  | { success: true }
  | { success: false; error: { code: string; message: string } }
  | null;

export async function resetPasswordAction(
  _prevState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!password || password.length < 8) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Le mot de passe doit contenir au moins 8 caractères" },
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Les mots de passe ne correspondent pas" },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      success: false,
      error: { code: "AUTH_ERROR", message: "Impossible de mettre à jour le mot de passe" },
    };
  }

  return { success: true };
}

// ── Sign Out ─────────────────────────────────

export async function signOutAction(formData?: FormData): Promise<void> {
  const supabase = await createClient();
  const locale = (formData?.get("locale") as string | null) || "fr";
  const origin = (formData?.get("origin") as string | null) || "";
  await supabase.auth.signOut();
  const isProOrigin = origin.includes("/dashboard") || origin.includes("/admin");
  redirect(isProOrigin ? `/${locale}/AqarPro/auth/login` : `/${locale}/AqarChaab/auth/login`);
}
