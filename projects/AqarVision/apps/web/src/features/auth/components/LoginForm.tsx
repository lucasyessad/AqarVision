"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/ui";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { loginAction } from "@/features/auth/actions/auth.action";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password, rememberMe });
    if (!parsed.success) {
      setError(t("login.invalidCredentials"));
      return;
    }

    setLoading(true);
    try {
      const result = await loginAction(parsed.data);
      if (result.success) {
        router.push(result.data.redirectTo);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("[LoginForm] Error:", err);
      setError(err instanceof Error ? err.message : t("login.genericError"));
    } finally {
      setLoading(false);
    }
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

      <div className="relative">
        <Input
          label={t("fields.password")}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
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
          disabled={loading}
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={cn(
              "h-4 w-4 rounded border-stone-300 dark:border-stone-600",
              "text-teal-600 dark:text-teal-400",
              "focus:ring-teal-600 dark:focus:ring-teal-400"
            )}
          />
          {t("fields.rememberMe")}
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
        >
          {t("buttons.forgotPassword")}
        </Link>
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full"
        size="lg"
      >
        {t("buttons.login")}
      </Button>
    </form>
  );
}
