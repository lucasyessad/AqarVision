import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("login"),
  };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
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

      <LoginForm />

      <p className="text-center text-sm text-stone-500 dark:text-stone-400">
        <Link
          href="/auth/signup"
          className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
        >
          {tButtons("signup")}
        </Link>
      </p>
    </div>
  );
}
