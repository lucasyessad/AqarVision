import Link from "next/link";
import { History, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSearchHistory } from "@/lib/queries/alerts";
import { ClearHistoryButton } from "./clear-button";

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "A l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

function buildSearchUrl(entry: {
  query_text?: string | null;
  filters?: Record<string, unknown> | null;
}): string {
  const params = new URLSearchParams();
  if (entry.query_text) params.set("q", entry.query_text);
  if (entry.filters && typeof entry.filters === "object") {
    const f = entry.filters as Record<string, string>;
    if (f.transaction_type) params.set("transaction_type", f.transaction_type);
    if (f.wilaya) params.set("wilaya", f.wilaya);
    if (f.property_type) params.set("property_type", f.property_type);
    if (f.price_min) params.set("price_min", f.price_min);
    if (f.price_max) params.set("price_max", f.price_max);
    if (f.surface_min) params.set("surface_min", f.surface_min);
    if (f.surface_max) params.set("surface_max", f.surface_max);
  }
  const qs = params.toString();
  return `/recherche${qs ? `?${qs}` : ""}`;
}

function buildFiltersSummary(entry: {
  query_text?: string | null;
  filters?: Record<string, unknown> | null;
}): string {
  const parts: string[] = [];
  if (entry.filters && typeof entry.filters === "object") {
    const f = entry.filters as Record<string, string>;
    if (f.transaction_type) parts.push(f.transaction_type);
    if (f.property_type) parts.push(f.property_type);
    if (f.wilaya) parts.push(f.wilaya);
    if (f.price_min || f.price_max) {
      const min = f.price_min ? `${(Number(f.price_min) / 1000000).toFixed(1)}M` : "0";
      const max = f.price_max ? `${(Number(f.price_max) / 1000000).toFixed(1)}M` : "+";
      parts.push(`${min} - ${max} DA`);
    }
  }
  return parts.join(" · ");
}

export default async function HistoriquePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const history = user ? await getSearchHistory(user.id) : [];
  const count = history.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
          {count > 0 && (
            <span className="text-sm text-gray-500">
              {count} recherche{count > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {count > 0 && <ClearHistoryButton />}
      </div>

      {count === 0 ? (
        <div className="text-center py-16">
          <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Aucune recherche récente
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Vos recherches apparaîtront ici pour vous permettre de les relancer
            facilement.
          </p>
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-4 py-2 bg-bleu-nuit text-white text-sm font-medium rounded-lg hover:bg-bleu-nuit/90 transition-colors"
          >
            <Search className="h-4 w-4" />
            Lancer une recherche
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => {
            const filtersSummary = buildFiltersSummary(entry);

            return (
              <Link
                key={entry.id}
                href={buildSearchUrl(entry)}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm hover:border-gray-300 transition-all"
              >
                <div className="flex-shrink-0 w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {entry.query_text || "Recherche sans texte"}
                  </p>
                  {filtersSummary && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {filtersSummary}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-gray-400">
                    {formatRelativeTime(entry.created_at)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
