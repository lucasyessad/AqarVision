"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { signUpAction, type SignUpFormState } from "../actions/auth.action";

interface ChaabSignUpFormProps {
  locale?: string;
}

export function ChaabSignUpForm({ locale = "fr" }: ChaabSignUpFormProps) {
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState<SignUpFormState, FormData>(signUpAction, null);

  if (state?.success && state.emailConfirmation) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "rgba(253,251,247,0.05)", border: "1px solid rgba(253,251,247,0.1)" }}
      >
        <div className="mb-3 text-3xl">✉️</div>
        <h3 className="mb-2 text-base font-semibold" style={{ color: "var(--ivoire)" }}>
          {t("check_email_title")}
        </h3>
        <p className="text-sm" style={{ color: "rgba(253,251,247,0.45)" }}>
          {t("check_email_message")}
        </p>
        <Link
          href="/AqarChaab/auth/login"
          className="mt-4 inline-block text-sm font-medium hover:underline"
          style={{ color: "var(--or)" }}
        >
          {t("back_to_login")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect_to" value={`/${locale}/AqarChaab/espace`} />
      <input type="hidden" name="preferred_locale" value={locale} />

      {state?.success === false && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}
        >
          {state.error.message}
        </div>
      )}

      <div>
        <label
          htmlFor="chaab-signup-name"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em]"
          style={{ color: "rgba(253,251,247,0.4)" }}
        >
          {t("full_name")}
        </label>
        <input
          id="chaab-signup-name"
          type="text"
          name="full_name"
          required
          defaultValue={state?.success === false ? state.fullName ?? "" : ""}
          className="w-full rounded-md px-4 py-2.5 text-sm focus:outline-none"
          style={{
            background: "rgba(253,251,247,0.06)",
            border: "1px solid rgba(253,251,247,0.12)",
            color: "var(--ivoire)",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="chaab-signup-email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em]"
          style={{ color: "rgba(253,251,247,0.4)" }}
        >
          {t("email")}
        </label>
        <input
          id="chaab-signup-email"
          type="email"
          name="email"
          required
          defaultValue={state?.success === false ? state.email ?? "" : ""}
          className="w-full rounded-md px-4 py-2.5 text-sm focus:outline-none"
          style={{
            background: "rgba(253,251,247,0.06)",
            border: "1px solid rgba(253,251,247,0.12)",
            color: "var(--ivoire)",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="chaab-signup-password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em]"
          style={{ color: "rgba(253,251,247,0.4)" }}
        >
          {t("password")}
        </label>
        <input
          id="chaab-signup-password"
          type="password"
          name="password"
          required
          minLength={8}
          className="w-full rounded-md px-4 py-2.5 text-sm focus:outline-none"
          style={{
            background: "rgba(253,251,247,0.06)",
            border: "1px solid rgba(253,251,247,0.12)",
            color: "var(--ivoire)",
          }}
        />
        <p className="mt-1 text-xs" style={{ color: "rgba(253,251,247,0.2)" }}>
          {t("password_hint")}
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--ivoire)", color: "var(--onyx)" }}
      >
        {isPending ? t("signing_up") : "Créer mon compte"}
      </button>
    </form>
  );
}
