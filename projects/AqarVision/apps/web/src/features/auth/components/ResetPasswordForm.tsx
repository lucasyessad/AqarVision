"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/ui";
import { useRouter } from "@/lib/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/features/auth/schemas/auth.schema";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of parsed.error.errors) {
        const key = err.path[0]?.toString();
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = err.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: parsed.data.password,
      });

      if (error) {
        setGlobalError(t("resetPassword.error"));
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch {
      setGlobalError(t("resetPassword.genericError"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-6 text-center">
        <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
          {t("resetPassword.successTitle")}
        </h2>
        <p className="mt-2 text-sm text-green-700 dark:text-green-400">
          {t("resetPassword.successMessage")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {globalError && (
        <div
          className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
          role="alert"
        >
          {globalError}
        </div>
      )}

      <Input
        label={t("fields.newPassword")}
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        startIcon={<Lock size={16} />}
        endIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pointer-events-auto text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
            aria-label={showPassword ? t("fields.hidePassword") : t("fields.showPassword")}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        error={errors.password}
        disabled={loading}
        required
      />

      <Input
        label={t("fields.confirmPassword")}
        type={showConfirm ? "text" : "password"}
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        startIcon={<Lock size={16} />}
        endIcon={
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="pointer-events-auto text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
            aria-label={showConfirm ? t("fields.hidePassword") : t("fields.showPassword")}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        error={errors.confirmPassword}
        disabled={loading}
        required
      />

      <Button
        type="submit"
        loading={loading}
        className="w-full"
        size="lg"
      >
        {t("buttons.resetPassword")}
      </Button>
    </form>
  );
}
