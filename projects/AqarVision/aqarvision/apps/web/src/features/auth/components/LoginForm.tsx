"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { signInAction, type AuthFormState } from "../actions/auth.action";

export function LoginForm() {
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(signInAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.success === false && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {state.error.message}
        </div>
      )}
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
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-night focus:outline-none focus:ring-2 focus:ring-blue-night/20"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("password")}
        </label>
        <input
          id="password"
          type="password"
          name="password"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-night focus:outline-none focus:ring-2 focus:ring-blue-night/20"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-night px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-night/90 disabled:opacity-50"
      >
        {isPending ? t("logging_in") : t("login_button")}
      </button>
    </form>
  );
}
