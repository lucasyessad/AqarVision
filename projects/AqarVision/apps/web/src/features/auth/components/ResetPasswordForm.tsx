"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { resetPasswordAction, type ResetPasswordFormState } from "../actions/auth.action";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState<ResetPasswordFormState, FormData>(resetPasswordAction, null);

  if (state?.success) {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <div className="mb-2 text-2xl">&#10003;</div>
        <h3 className="mb-2 text-lg font-semibold text-green-800">
          {t("password_updated_title")}
        </h3>
        <p className="text-sm text-green-700">
          {t("password_updated_message")}
        </p>
        <Link
          href="/auth/login"
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
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("new_password")}
        </label>
        <input
          id="password"
          type="password"
          name="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-night focus:outline-none focus:ring-2 focus:ring-blue-night/20"
        />
        <p className="mt-1 text-xs text-gray-400">{t("password_hint")}</p>
      </div>
      <div>
        <label
          htmlFor="confirm_password"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("confirm_password")}
        </label>
        <input
          id="confirm_password"
          type="password"
          name="confirm_password"
          required
          minLength={8}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-night focus:outline-none focus:ring-2 focus:ring-blue-night/20"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-night px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-night/90 disabled:opacity-50"
      >
        {isPending ? t("updating") : t("update_password")}
      </button>
    </form>
  );
}
