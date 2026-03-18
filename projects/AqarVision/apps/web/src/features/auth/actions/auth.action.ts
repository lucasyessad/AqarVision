"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  type SignupInput,
  type LoginInput,
} from "@/features/auth/schemas/auth.schema";
import { authRateLimit, forgotPasswordRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { createLogger } from "@/lib/logger";

const log = createLogger("auth");

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function signupAction(
  input: SignupInput
): Promise<ActionResult<{ redirectTo: string; needsConfirmation: boolean }>> {
  try {
    const parsed = signupSchema.safeParse(input);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Données invalides");
    }

    const ip = await getClientIp();
    const { success: rateLimitOk } = await authRateLimit.limit(ip);
    if (!rateLimitOk) {
      return fail("RATE_LIMITED", "Trop de tentatives. Réessayez plus tard.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          phone: parsed.data.phone,
        },
      },
    });

    if (error) {
      log.error({ error: error.message, code: error.status }, "Signup error");

      if (error.message?.includes("already registered") || error.status === 422) {
        return fail("EMAIL_EXISTS", "Un compte existe déjà avec cet email");
      }
      if (error.message?.includes("password")) {
        return fail("WEAK_PASSWORD", "Le mot de passe ne respecte pas les critères de sécurité");
      }
      if (error.message?.includes("rate") || error.status === 429) {
        return fail("RATE_LIMITED", "Trop de tentatives. Réessayez plus tard.");
      }

      return fail("AUTH_ERROR", `Erreur d'inscription : ${error.message}`);
    }

    // If email confirmation is enabled, user.identities will be empty until confirmed
    // If disabled (dev/test), session is created immediately
    const needsConfirmation = data.user?.identities?.length === 0;

    return ok({
      redirectTo: needsConfirmation ? "" : "/AqarChaab/espace/mes-annonces",
      needsConfirmation,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error({ error: message }, "Signup action crash");
    return fail("INTERNAL_ERROR", `Erreur serveur : ${message}`);
  }
}

export async function loginAction(
  input: LoginInput
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Email ou mot de passe invalide");
  }

  const ip = await getClientIp();
  const { success: rateLimitOk } = await authRateLimit.limit(ip);
  if (!rateLimitOk) {
    return fail("RATE_LIMITED", "Trop de tentatives. Réessayez plus tard.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return fail("AUTH_ERROR", "Email ou mot de passe incorrect");
  }

  // Determine redirect based on membership
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("AUTH_ERROR", "Erreur d'authentification");
  }

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "super_admin") {
    return ok({ redirectTo: "/admin/agencies" });
  }

  if (membership) {
    return ok({ redirectTo: "/AqarPro/dashboard" });
  }

  return ok({ redirectTo: "/AqarChaab/espace/mes-annonces" });
}

export async function forgotPasswordAction(
  input: { email: string }
): Promise<ActionResult<void>> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Email invalide");
  }

  const ip = await getClientIp();
  const { success: rateLimitOk } = await forgotPasswordRateLimit.limit(ip);
  if (!rateLimitOk) {
    return fail("RATE_LIMITED", "Trop de tentatives. Réessayez dans 10 minutes.");
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email);

  // Always return success (don't reveal if email exists)
  return ok(undefined);
}

export async function logoutAction(): Promise<ActionResult<void>> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return ok(undefined);
}
