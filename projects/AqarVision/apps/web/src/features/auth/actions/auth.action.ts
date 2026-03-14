"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignInSchema, SignUpSchema } from "../schemas/auth.schema";

export type AuthFormState = {
  success: false;
  error: { code: string; message: string };
} | null;

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid email or password" },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      success: false,
      error: { code: "AUTH_ERROR", message: error.message },
    };
  }

  const redirectTo = (formData.get("redirect") as string) || "/fr/dashboard";
  redirect(redirectTo);
}

export type SignUpFormState =
  | { success: true; emailConfirmation: boolean }
  | { success: false; error: { code: string; message: string } }
  | null;

export async function signUpAction(
  _prevState: SignUpFormState,
  formData: FormData
): Promise<SignUpFormState> {
  const parsed = SignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    preferred_locale: formData.get("preferred_locale") || "fr",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid input" },
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { preferred_locale: parsed.data.preferred_locale },
    },
  });

  if (error) {
    return {
      success: false,
      error: { code: "AUTH_ERROR", message: error.message },
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
      error: { code: "AUTH_ERROR", message: "An account with this email already exists" },
    };
  }

  const locale = parsed.data.preferred_locale ?? "fr";
  redirect(`/${locale}/dashboard`);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/fr/auth/login");
}
