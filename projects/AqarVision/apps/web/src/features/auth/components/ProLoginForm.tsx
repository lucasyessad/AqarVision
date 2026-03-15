"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { signInProAction, type AuthFormState } from "../actions/auth.action";

interface ProLoginFormProps {
  locale?: string;
}

export function ProLoginForm({ locale = "fr" }: ProLoginFormProps) {
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(signInProAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />

      {state?.success === false && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error.message}
        </div>
      )}

      <div>
        <label htmlFor="pro-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#a0aec0]">
          {t("email")}
        </label>
        <input
          id="pro-email"
          type="email"
          name="email"
          required
          defaultValue={state?.email ?? ""}
          className="w-full rounded-md border border-[#2d3748] bg-[#1a1f2e] px-4 py-2.5 text-sm text-white placeholder-[#4a5568] focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30"
          placeholder="agence@exemple.dz"
        />
      </div>

      <div>
        <label htmlFor="pro-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#a0aec0]">
          {t("password")}
        </label>
        <input
          id="pro-password"
          type="password"
          name="password"
          required
          className="w-full rounded-md border border-[#2d3748] bg-[#1a1f2e] px-4 py-2.5 text-sm text-white placeholder-[#4a5568] focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30"
        />
      </div>

      <div className="flex justify-end">
        <Link
          href="/AqarPro/auth/forgot-password"
          className="text-xs text-[#d4af37] hover:underline"
        >
          {t("forgot_password")}
        </Link>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-[#d4af37] px-4 py-3 text-sm font-semibold text-[#0f1623] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? t("logging_in") : "Accéder à AqarPro"}
      </button>

      <p className="text-center text-xs text-[#4a5568]">
        Pas encore d&apos;agence ?{" "}
        <Link href="/AqarPro/auth/signup" className="text-[#d4af37] hover:underline">
          Créer un compte agence
        </Link>
      </p>
    </form>
  );
}
