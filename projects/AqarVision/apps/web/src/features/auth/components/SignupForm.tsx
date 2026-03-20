"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { signupAction } from "@/features/auth/actions/auth.action";
import { signupSchema } from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils";

function getPasswordStrength(password: string): {
  level: "weak" | "medium" | "strong";
  score: number;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: "weak", score };
  if (score <= 3) return { level: "medium", score };
  return { level: "strong", score };
}

const strengthColors = {
  weak: "bg-red-500 dark:bg-red-400",
  medium: "bg-amber-500 dark:bg-amber-400",
  strong: "bg-green-500 dark:bg-green-400",
} as const;

const strengthLabels = {
  weak: "passwordWeak",
  medium: "passwordMedium",
  strong: "passwordStrong",
} as const;

export function SignupForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") ?? undefined;

  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateField(name: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  const strength = fields.password ? getPasswordStrength(fields.password) : null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});

    const parsed = signupSchema.safeParse(fields);
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
      const result = await signupAction({ ...parsed.data, redirectTo: redirectParam });
      if (result.success) {
        if (result.data.needsConfirmation) {
          // Production: email confirmation required
          setSuccess(true);
        } else {
          // Dev/test: auto-login, redirect immediately
          router.push(result.data.redirectTo);
          return;
        }
      } else {
        setGlobalError(result.message);
      }
    } catch (err) {
      console.error("[SignupForm] Error:", err);
      setGlobalError(err instanceof Error ? err.message : t("signup.genericError"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-6">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
            {t("signup.successTitle")}
          </h2>
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
            {t("signup.successMessage")}
          </p>
        </div>

        <div className="rounded-md bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 px-4 py-4">
          <p className="text-sm text-stone-700 dark:text-stone-300">
            {t("signup.agencyPrompt")}
          </p>
          <Link
            href="/agency/new"
            className="mt-2 inline-block text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            {t("signup.createAgency")}
          </Link>
        </div>
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

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={tCommon("labels.firstName")}
          type="text"
          autoComplete="given-name"
          value={fields.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          startIcon={<User size={16} />}
          error={errors.firstName}
          disabled={loading}
          required
        />
        <Input
          label={tCommon("labels.lastName")}
          type="text"
          autoComplete="family-name"
          value={fields.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          startIcon={<User size={16} />}
          error={errors.lastName}
          disabled={loading}
          required
        />
      </div>

      <Input
        label={t("fields.email")}
        type="email"
        autoComplete="email"
        value={fields.email}
        onChange={(e) => updateField("email", e.target.value)}
        startIcon={<Mail size={16} />}
        error={errors.email}
        disabled={loading}
        required
      />

      <PhoneInput
        label={tCommon("labels.phone")}
        value={fields.phone}
        onChange={(phone) => updateField("phone", phone)}
        error={errors.phone}
        disabled={loading}
        required
      />

      <div>
        <Input
          label={t("fields.password")}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={fields.password}
          onChange={(e) => updateField("password", e.target.value)}
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
        {strength && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i <= strength.score
                      ? strengthColors[strength.level]
                      : "bg-stone-200 dark:bg-stone-700"
                  )}
                />
              ))}
            </div>
            <p
              className={cn(
                "text-xs",
                strength.level === "weak" && "text-red-600 dark:text-red-400",
                strength.level === "medium" && "text-amber-600 dark:text-amber-400",
                strength.level === "strong" && "text-green-600 dark:text-green-400"
              )}
            >
              {t(`fields.${strengthLabels[strength.level]}`)}
            </p>
          </div>
        )}
      </div>

      <Input
        label={t("fields.confirmPassword")}
        type={showConfirm ? "text" : "password"}
        autoComplete="new-password"
        value={fields.confirmPassword}
        onChange={(e) => updateField("confirmPassword", e.target.value)}
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
        {t("buttons.signup")}
      </Button>
    </form>
  );
}
