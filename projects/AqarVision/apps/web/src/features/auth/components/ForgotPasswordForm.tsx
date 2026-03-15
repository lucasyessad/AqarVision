"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { forgotPasswordAction, type ForgotPasswordFormState } from "../actions/auth.action";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState<ForgotPasswordFormState, FormData>(forgotPasswordAction, null);

  if (state?.success) {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <div className="mb-2 text-2xl">&#9993;</div>
        <h3 className="mb-2 text-lg font-semibold text-green-800">
          {t("reset_email_sent_title")}
        </h3>
        <p className="text-sm text-green-700">
          {t("reset_email_sent_message")}
        </p>
        <Link
          href="/AqarChaab/auth/login"
          className="mt-4 inline-block text-sm font-medium text-gold hover:underline"
        >
          {t("back_to_login")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.success === false && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {state.error.message}
        </div>
      )}
      <p className="text-sm text-gray-500">
        {t("forgot_password_instructions")}
      </p>
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          defaultValue={state?.email ?? ""}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-night focus:outline-none focus:ring-2 focus:ring-blue-night/20"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-night px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-night/90 disabled:opacity-50"
      >
        {isPending ? t("sending") : t("send_reset_link")}
      </button>
    </form>
  );
}
