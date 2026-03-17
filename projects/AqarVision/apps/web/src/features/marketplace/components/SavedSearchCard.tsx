"use client";

import { useTranslations } from "next-intl";
import { Bell, BellOff, Trash2, MapPin, Search } from "lucide-react";

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    wilaya?: string;
    property_type?: string;
    listing_type?: string;
    min_price?: number;
    max_price?: number;
    min_surface?: number;
    rooms?: number;
  };
  alert_enabled: boolean;
  results_count: number;
  created_at: string;
}

interface SavedSearchCardProps {
  search: SavedSearch;
  onLoad: (search: SavedSearch) => void;
  onToggleAlert: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}

export function SavedSearchCard({
  search,
  onLoad,
  onToggleAlert,
  onDelete,
}: SavedSearchCardProps) {
  const t = useTranslations("search");
  const filters = search.filters;

  const chips: string[] = [];
  if (filters.wilaya) chips.push(filters.wilaya);
  if (filters.property_type) chips.push(filters.property_type);
  if (filters.listing_type) chips.push(filters.listing_type);
  if (filters.rooms) chips.push(`${filters.rooms} ${t("rooms")}`);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onLoad(search)}
          className="flex-1 text-start"
        >
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {search.name}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                <MapPin className="h-3 w-3" />
                {chip}
              </span>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Search className="h-3 w-3" />
            {t("results_count", { count: search.results_count })}
          </p>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleAlert(search.id, !search.alert_enabled)}
            className={`rounded-md p-1.5 transition-colors ${
              search.alert_enabled
                ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            }`}
            title={search.alert_enabled ? t("disable_alert") : t("enable_alert")}
          >
            {search.alert_enabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(search.id)}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
            title={t("delete_search")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface SavedSearchListProps {
  searches: SavedSearch[];
  onLoad: (search: SavedSearch) => void;
  onToggleAlert: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}

export function SavedSearchList({
  searches,
  onLoad,
  onToggleAlert,
  onDelete,
}: SavedSearchListProps) {
  const t = useTranslations("search");

  if (searches.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {t("no_saved_searches")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {searches.map((search) => (
        <SavedSearchCard
          key={search.id}
          search={search}
          onLoad={onLoad}
          onToggleAlert={onToggleAlert}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
