import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Calculator } from "lucide-react";
import { EstimationWizard } from "@/features/marketplace/components/EstimationWizard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("estimation");
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function EstimerPage() {
  const t = await getTranslations("estimation");

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-12 lg:pt-28 lg:pb-16">
        <div className="text-center mb-8">
          <Calculator className="mx-auto h-10 w-10 text-teal-600 dark:text-teal-400 mb-4" />
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            {t("pageTitle")}
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {t("pageDescription")}
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
          <EstimationWizard />
        </div>
      </div>
    </div>
  );
}
