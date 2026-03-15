"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { signInAction, type AuthFormState } from "../actions/auth.action";

interface ChaabLoginFormProps {
  locale?: string;
}

export function ChaabLoginForm({ locale = "fr" }: ChaabLoginFormProps) {
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(signInAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="redirect" value={`/${locale}/AqarChaab/espace`} />

      {state?.success === false && (
        <div className="rounded-lg border border-red-900/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {state.error.message}
        </div>
      )}

      <div>
        <label htmlFor="chaab-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: "rgba(253,251,247,0.4)" }}>
          {t("email")}
        </label>
        <input
          id="chaab-email"
          type="email"
          name="email"
          required
          defaultValue={state?.email ?? ""}
          className="w-full rounded-md px-4 py-2.5 text-sm focus:outline-none"
          style={{
            background: "rgba(253,251,247,0.06)",
            border: "1px solid rgba(253,251,247,0.12)",
            color: "var(--ivoire)",
          }}
          placeholder="votre@email.dz"
        />
      </div>

      <div>
        <label htmlFor="chaab-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: "rgba(253,251,247,0.4)" }}>
          {t("password")}
        </label>
        <input
          id="chaab-password"
          type="password"
          name="password"
          required
          className="w-full rounded-md px-4 py-2.5 text-sm focus:outline-none"
          style={{
            background: "rgba(253,251,247,0.06)",
            border: "1px solid rgba(253,251,247,0.12)",
            color: "var(--ivoire)",
          }}
        />
      </div>

      <div className="flex justify-end">
        <Link
          href="/AqarChaab/auth/forgot-password"
          className="text-xs hover:underline"
          style={{ color: "var(--or)" }}
        >
          {t("forgot_password")}
        </Link>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--ivoire)", color: "var(--onyx)" }}
      >
        {isPending ? t("logging_in") : "Se connecter"}
      </button>

      <p className="text-center text-xs" style={{ color: "rgba(253,251,247,0.3)" }}>
        Pas encore de compte ?{" "}
        <Link href="/AqarChaab/auth/signup" className="hover:underline" style={{ color: "var(--or)" }}>
          {t("signup_button")}
        </Link>
      </p>
    </form>
  );
}
