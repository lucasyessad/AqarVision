import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("forgotPassword"),
  };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth.forgotPassword");
  const tButtons = await getTranslations("auth.buttons");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {t("subtitle")}
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-stone-500 dark:text-stone-400">
        <Link
          href="/auth/login"
          className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
        >
          {tButtons("login")}
        </Link>
      </p>
    </div>
  );
}
