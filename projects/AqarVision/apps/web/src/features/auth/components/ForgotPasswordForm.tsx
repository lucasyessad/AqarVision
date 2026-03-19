"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/ui";
import { forgotPasswordAction } from "@/features/auth/actions/auth.action";
import { forgotPasswordSchema } from "@/features/auth/schemas/auth.schema";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? t("forgotPassword.invalidEmail"));
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPasswordAction({ email: parsed.data.email });
      if (result.success) {
        setSubmitted(true);
      } else {
        if (result.code === "RATE_LIMITED") {
          setError(result.message);
        } else {
          // Always show success message to not reveal if email exists
          setSubmitted(true);
        }
      }
    } catch {
      setError(t("forgotPassword.genericError"));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-6 text-center">
        <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
          {t("forgotPassword.successTitle")}
        </h2>
        <p className="mt-2 text-sm text-green-700 dark:text-green-400">
          {t("forgotPassword.successMessage")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div
          className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      <Input
        label={t("fields.email")}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        startIcon={<Mail size={16} />}
        disabled={loading}
        required
      />

      <Button
        type="submit"
        loading={loading}
        className="w-full"
        size="lg"
      >
        {t("buttons.sendResetLink")}
      </Button>
    </form>
  );
}
