import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("resetPassword"),
  };
}

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth.resetPassword");

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

      <ResetPasswordForm />
    </div>
  );
}
