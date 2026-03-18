import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { SignupForm } from "@/features/auth/components/SignupForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("signup"),
  };
}

export default async function SignupPage() {
  const t = await getTranslations("auth.signup");
  const tButtons = await getTranslations("auth.buttons");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Aqar<span className="text-teal-600 dark:text-teal-400">Chaab</span>
        </p>
        <h1 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-50">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {t("subtitle")}
        </p>
      </div>

      <SignupForm />

      <div className="space-y-3 text-center text-sm">
        <p>
          <Link
            href="/agency/new"
            className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            {t("agencyPrompt")}
          </Link>
        </p>
        <p className="text-stone-500 dark:text-stone-400">
          <Link
            href="/auth/login"
            className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            {tButtons("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
