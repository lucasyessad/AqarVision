import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Plus, Search } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("listings") };
}

export default async function ListingsPage() {
  const t = await getTranslations("listing");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common.buttons");

  const statuses = ["draft", "pending", "published", "paused", "rejected", "sold"] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {tNav("listings")}
        </h1>
        <Link
          href="/AqarPro/dashboard/listings/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-600 dark:bg-teal-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-fast"
        >
          <Plus className="h-4 w-4" />
          {tCommon("create")}
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder={tCommon("search")}
            className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 ps-9 pe-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:border-teal-600 dark:focus:border-teal-400 transition-colors duration-fast"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-fast"
            >
              {t(`statuses.${status}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-12 w-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
          <Plus className="h-6 w-6 text-stone-400" />
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("fields.title")}
        </p>
        <Link
          href="/AqarPro/dashboard/listings/new"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-teal-600 dark:bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-fast"
        >
          <Plus className="h-4 w-4" />
          {tCommon("create")}
        </Link>
      </div>
    </div>
  );
}
