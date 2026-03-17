"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { signInAction, type AuthFormState } from "../actions/auth.action";

interface LoginFormProps {
  locale?: string;
  defaultMode?: "visitor" | "pro";
}

export function LoginForm({ locale = "fr", defaultMode = "visitor" }: LoginFormProps) {
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(signInAction, null);
  const [mode, setMode] = useState<"visitor" | "pro">(defaultMode);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => setMode("visitor")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "visitor"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("mode_visitor")}
        </button>
        <button
          type="button"
          onClick={() => setMode("pro")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "pro"
              ? "bg-zinc-900 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("mode_pro")}
        </button>
      </div>

      {/* Mode description */}
      <p className="text-center text-sm text-gray-500">
        {mode === "visitor" ? t("mode_visitor_hint") : t("mode_pro_hint")}
      </p>

      <form action={formAction} className="space-y-4">
        {/* Hidden fields for smart routing */}
        <input type="hidden" name="locale" value={locale} />
        <input
          type="hidden"
          name="redirect"
          value={mode === "pro" ? `/${locale}/dashboard` : ""}
        />

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
            defaultValue={state?.email ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-night/20"
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
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-night/20"
          />
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-amber-500 hover:underline"
          >
            {t("forgot_password")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`w-full rounded-lg px-4 py-2.5 font-medium text-white transition-colors disabled:opacity-50 ${
            mode === "pro"
              ? "bg-amber-500 hover:bg-amber-600/90"
              : "bg-zinc-900 hover:bg-zinc-800"
          }`}
        >
          {isPending ? t("logging_in") : t("login_button")}
        </button>
      </form>

      {mode === "pro" && (
        <p className="text-center text-xs text-gray-400">
          {t("pro_no_account_hint")}{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-amber-500 hover:underline"
          >
            {t("signup_button")}
          </Link>
        </p>
      )}
    </div>
  );
}
