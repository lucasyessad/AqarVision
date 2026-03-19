import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("dashboard"),
  };
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tOnboarding = await getTranslations("dashboard.onboarding");
  const tStats = await getTranslations("dashboard.stats");

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
          {t("overview.title")}
        </h1>
      </div>

      {/* Onboarding checklist banner */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
          {tOnboarding("title")}
        </h2>
        <div className="mt-4 h-2 w-full rounded-full bg-stone-200 dark:bg-stone-700">
          <div className="h-2 w-1/5 rounded-full bg-teal-600 dark:bg-teal-400" />
        </div>
        <ul className="mt-4 space-y-3">
          <li className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 dark:border-stone-600" />
            {tOnboarding("addLogo")}
          </li>
          <li className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 dark:border-stone-600" />
            {tOnboarding("publishListing")}
          </li>
          <li className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 dark:border-stone-600" />
            {tOnboarding("inviteTeam")}
          </li>
          <li className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 dark:border-stone-600" />
            {tOnboarding("customizeStorefront")}
          </li>
          <li className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 dark:border-stone-600" />
            {tOnboarding("choosePlan")}
          </li>
        </ul>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">{tStats("views")}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-50">0</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">{tStats("leads")}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-50">0</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">{tStats("contacts")}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-50">0</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">{tStats("listings")}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-50">0</p>
        </div>
      </div>
    </div>
  );
}
