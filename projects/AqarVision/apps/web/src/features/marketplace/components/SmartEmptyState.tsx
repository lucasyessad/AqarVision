"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";

interface SmartEmptyStateProps {
  query?: string;
  wilayaName?: string;
  hasFilters: boolean;
  onResetFilters: () => void;
  suggestedWilayas?: { code: string; name: string }[];
}

export function SmartEmptyState({
  query,
  wilayaName,
  hasFilters,
  onResetFilters,
  suggestedWilayas = [],
}: SmartEmptyStateProps) {
  const t = useTranslations("search");

  return (
    <div className="flex flex-col items-center py-16 text-center">
      {/* Icon */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <Search className="h-7 w-7 text-zinc-400" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
        {t("no_results")}
      </h3>

      {/* Contextual message */}
      <p className="mb-6 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        {query
          ? t("no_results_for_query", { query })
          : wilayaName
            ? t("no_results_in_wilaya", { wilaya: wilayaName })
            : t("no_results_generic")}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {hasFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t("reset_filters")}
          </button>
        )}
        <Link
          href="/search"
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
        >
          <Search className="h-3.5 w-3.5" />
          {t("new_search")}
        </Link>
      </div>

      {/* Suggested wilayas */}
      {suggestedWilayas.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t("suggested_wilayas")}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedWilayas.map((w) => (
              <Link
                key={w.code}
                href={`/search?wilaya_code=${w.code}` as `/${string}`}
                className="flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 transition-colors hover:border-amber-300 hover:text-amber-600 dark:hover:border-amber-700 dark:hover:text-amber-400"
              >
                <MapPin className="h-3 w-3" />
                {w.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
