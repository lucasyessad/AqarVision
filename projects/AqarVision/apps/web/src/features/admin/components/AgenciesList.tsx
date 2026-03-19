"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/i18n/navigation";
import {
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { AdminAgency } from "../types/admin.types";

interface AgenciesListProps {
  initialAgencies: AdminAgency[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const verificationBadge: Record<number, { label: string; color: string }> = {
  0: { label: "-", color: "text-stone-400 dark:text-stone-500" },
  1: { label: "Basique", color: "text-stone-500 dark:text-stone-400" },
  2: { label: "Vérifié", color: "text-blue-600 dark:text-blue-400" },
  3: { label: "Certifié", color: "text-green-600 dark:text-green-400" },
  4: { label: "Premium", color: "text-amber-500 dark:text-amber-400" },
};

export function AgenciesList({
  initialAgencies,
  initialTotal,
  initialPage,
  perPage,
}: AgenciesListProps) {
  const tEmpty = useTranslations("common.empty");
  const [agencies] = useState(initialAgencies);
  const [total] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");

  const totalPages = Math.ceil(total / perPage);

  const filtered = agencies.filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une agence..."
          className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 ps-9 pe-3 py-2 text-sm text-stone-700 dark:text-stone-300 outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_80px_80px_100px_120px] gap-4 px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Agence
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Plan
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Annonces
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Niveau
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Créée le
          </span>
          <span />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
            <p className="text-sm text-stone-400 dark:text-stone-500">
              {tEmpty("noAgencies")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filtered.map((agency) => {
              const badge =
                verificationBadge[agency.verified_level] ??
                verificationBadge[0];

              return (
                <div
                  key={agency.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_80px_80px_100px_120px] gap-2 md:gap-4 px-4 py-3 items-center hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  {/* Agency name + slug */}
                  <div className="flex items-center gap-3">
                    {agency.logo_url ? (
                      <img
                        src={agency.logo_url}
                        alt=""
                        className="h-8 w-8 rounded-md object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 dark:bg-stone-800 shrink-0">
                        <Building2 className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {agency.name}
                      </p>
                      <p className="text-xs text-stone-400 dark:text-stone-500 truncate">
                        @{agency.slug}
                      </p>
                    </div>
                  </div>

                  {/* Plan */}
                  <div>
                    {agency.plan_name ? (
                      <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-950 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-400">
                        {agency.plan_name}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400 dark:text-stone-500">
                        Aucun
                      </span>
                    )}
                  </div>

                  {/* Listings count */}
                  <div className="text-sm text-stone-700 dark:text-stone-300">
                    {agency.listings_count}
                  </div>

                  {/* Verification level */}
                  <div className="flex items-center gap-1">
                    <ShieldCheck
                      className={cn(
                        "h-3.5 w-3.5",
                        badge?.color
                      )}
                    />
                    <span className={cn("text-xs font-medium", badge?.color)}>
                      {badge?.label}
                    </span>
                  </div>

                  {/* Created */}
                  <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                    <Calendar className="h-3.5 w-3.5 hidden md:block" />
                    <span>
                      {new Date(agency.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  {/* Link */}
                  <div>
                    <Link
                      href={`/a/${agency.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      Voir la vitrine
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Page {page} sur {totalPages} ({total} agences)
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md p-1.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md p-1.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
