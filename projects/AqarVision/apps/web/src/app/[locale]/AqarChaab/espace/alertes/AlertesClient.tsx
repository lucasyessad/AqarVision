"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteSearchAlertAction,
  toggleSearchAlertNotifyAction,
} from "@/features/marketplace/actions/create-search-alert.action";

interface SavedSearchRow {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  notify: boolean;
  created_at: string;
  updated_at: string;
}

interface AlertesClientProps {
  alerts: SavedSearchRow[];
  savedSearches: SavedSearchRow[];
  locale: string;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function getFrequencyLabel(filters: Record<string, unknown>): string {
  const freq = filters.frequency as string | undefined;
  if (freq === "immediate") return "Immédiatement";
  if (freq === "weekly") return "Hebdomadaire";
  return "Quotidien";
}

function buildSearchUrl(filters: Record<string, unknown>, locale: string): string {
  const params = new URLSearchParams();
  const skip = ["frequency"];
  Object.entries(filters).forEach(([k, v]) => {
    if (!skip.includes(k) && v !== undefined && v !== null && v !== "") {
      params.set(k, String(v));
    }
  });
  const qs = params.toString();
  return `/${locale}/search${qs ? `?${qs}` : ""}`;
}

function AlertRow({
  item,
  locale,
  onDeleted,
  onToggled,
}: {
  item: SavedSearchRow;
  locale: string;
  onDeleted: (id: string) => void;
  onToggled: (id: string, notify: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSearchAlertAction(item.id);
      if (result.success) {
        onDeleted(item.id);
      }
    });
  };

  const handleToggleNotify = () => {
    startTransition(async () => {
      const result = await toggleSearchAlertNotifyAction(item.id, !item.notify);
      if (result.success) {
        onToggled(item.id, !item.notify);
      }
    });
  };

  const searchUrl = buildSearchUrl(item.filters, locale);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {item.notify && (
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-label="Alerte active" />
          )}
          <p className="truncate font-medium text-zinc-800">{item.name}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span className="text-xs text-zinc-400">
            Créée le {formatDate(item.created_at)}
          </span>
          {item.notify && (
            <span className="text-xs text-zinc-400">
              · {getFrequencyLabel(item.filters)}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* View results link */}
        <a
          href={searchUrl}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-[#2d3748] transition-colors hover:bg-gray-50"
        >
          Voir les annonces
        </a>

        {/* Toggle notify */}
        <button
          type="button"
          onClick={handleToggleNotify}
          disabled={isPending}
          title={item.notify ? "Désactiver les notifications" : "Activer les notifications"}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            item.notify
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-gray-300 text-gray-500 hover:bg-gray-50"
          }`}
        >
          {item.notify ? "Notif. ON" : "Notif. OFF"}
        </button>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              {isPending ? "..." : "Confirmer"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            aria-label="Supprimer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function AlertesClient({
  alerts: initialAlerts,
  savedSearches: initialSavedSearches,
  locale,
}: AlertesClientProps) {
  const router = useRouter();
  const [alerts, setAlerts] = useState(initialAlerts);
  const [savedSearches, setSavedSearches] = useState(initialSavedSearches);

  const handleDeleted = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    router.refresh();
  };

  const handleToggled = (id: string, notify: boolean) => {
    // Move between the two lists
    setAlerts((prev) => {
      const item = prev.find((a) => a.id === id);
      if (item) {
        // Was an alert, disabling notify → move to savedSearches
        if (!notify) {
          setSavedSearches((ss) => [{ ...item, notify: false }, ...ss]);
          return prev.filter((a) => a.id !== id);
        }
        return prev.map((a) => (a.id === id ? { ...a, notify } : a));
      }
      return prev;
    });
    setSavedSearches((prev) => {
      const item = prev.find((s) => s.id === id);
      if (item) {
        // Was saved search, enabling notify → move to alerts
        if (notify) {
          setAlerts((al) => [{ ...item, notify: true }, ...al]);
          return prev.filter((s) => s.id !== id);
        }
        return prev.map((s) => (s.id === id ? { ...s, notify } : s));
      }
      return prev;
    });
    router.refresh();
  };

  const isEmpty = alerts.length === 0 && savedSearches.length === 0;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Alertes de recherche</h1>
        <a
          href={`/${locale}/search`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-900/90"
        >
          Nouvelle recherche
        </a>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mb-4 h-12 w-12 text-gray-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <p className="mb-2 text-sm font-medium text-gray-400">
            Aucune alerte pour le moment
          </p>
          <p className="mb-4 text-xs text-gray-400">
            Créez une alerte depuis la page de recherche pour être notifié des nouvelles annonces.
          </p>
          <a
            href={`/${locale}/search`}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900/90"
          >
            Lancer une recherche
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active alerts */}
          {alerts.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                Alertes actives ({alerts.length})
              </h2>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    item={alert}
                    locale={locale}
                    onDeleted={handleDeleted}
                    onToggled={handleToggled}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Saved searches without notifications */}
          {savedSearches.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Recherches sauvegardées ({savedSearches.length})
              </h2>
              <div className="space-y-3">
                {savedSearches.map((search) => (
                  <AlertRow
                    key={search.id}
                    item={search}
                    locale={locale}
                    onDeleted={handleDeleted}
                    onToggled={handleToggled}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
