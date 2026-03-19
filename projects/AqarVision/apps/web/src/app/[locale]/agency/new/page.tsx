import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { CreateAgencyForm } from "@/features/agencies/components/CreateAgencyForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agency");
  return {
    title: t("createTitle"),
    description: t("createDescription"),
  };
}

export default async function NewAgencyPage() {
  const t = await getTranslations("agency");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 py-12 dark:bg-stone-950">
      {/* Logo — same as auth layout */}
      <Link
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50"
      >
        Aqar<span className="text-teal-600 dark:text-teal-400">Vision</span>
      </Link>

      {/* Card — same style as signup */}
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-card dark:border-stone-800 dark:bg-stone-900">
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              Aqar<span className="text-teal-600 dark:text-teal-400">Pro</span>
            </p>
            <h1 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-50">
              {t("createTitle")}
            </h1>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              {t("createDescription")}
            </p>
          </div>

          <CreateAgencyForm />

          <p className="text-center text-sm text-stone-500 dark:text-stone-400">
            <Link
              href="/"
              className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
            >
              ← Retour à l&apos;accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
