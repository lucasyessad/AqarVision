import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("pricing"),
  };
}

export default async function PricingPage() {
  const t = await getTranslations("pricing");

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-stone-500 dark:text-stone-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {/* Starter */}
          <div className="rounded-2xl border border-stone-200 bg-white p-8 dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
              {t("starter")}
            </h3>
            <p className="mt-4 text-3xl font-bold text-stone-900 dark:text-stone-50">
              2 900 <span className="text-base font-normal text-stone-500 dark:text-stone-400">DZD</span>
            </p>
            <div className="mt-8">
              <div className="h-px bg-stone-200 dark:bg-stone-700" />
            </div>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-teal-600 bg-white p-8 dark:border-teal-400 dark:bg-stone-900">
            <div className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-4 py-1 text-xs font-medium text-white dark:bg-teal-400 dark:text-stone-900">
              {t("pro")}
            </div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
              {t("pro")}
            </h3>
            <p className="mt-4 text-3xl font-bold text-stone-900 dark:text-stone-50">
              6 900 <span className="text-base font-normal text-stone-500 dark:text-stone-400">DZD</span>
            </p>
            <div className="mt-8">
              <div className="h-px bg-stone-200 dark:bg-stone-700" />
            </div>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl border border-stone-200 bg-white p-8 dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
              {t("enterprise")}
            </h3>
            <p className="mt-4 text-3xl font-bold text-stone-900 dark:text-stone-50">
              12 900 <span className="text-base font-normal text-stone-500 dark:text-stone-400">DZD</span>
            </p>
            <div className="mt-8">
              <div className="h-px bg-stone-200 dark:bg-stone-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
