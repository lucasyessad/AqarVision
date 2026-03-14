"use client";

import type {
  AdvancedAnalyticsData,
  TopListingByViews,
  LeadsBySource,
  LeadsByStatus,
} from "../services/advanced-analytics.service";

/* ------------------------------------------------------------------ */
/*  HorizontalBar — generic reusable bar                                */
/* ------------------------------------------------------------------ */

function HorizontalBar({
  label,
  value,
  max,
  color = "bg-blue-night",
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <p className="w-36 shrink-0 truncate text-sm text-gray-700" title={label}>
        {label}
      </p>
      <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="w-10 text-end text-sm font-semibold text-gray-700">
        {value}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TopListingsCard                                                     */
/* ------------------------------------------------------------------ */

function TopListingsCard({ listings }: { listings: TopListingByViews[] }) {
  const max = listings[0]?.view_count ?? 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-blue-night">
        Top 5 annonces par vues
      </h3>
      {listings.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune donnée disponible</p>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <HorizontalBar
              key={l.listing_id}
              label={l.listing_title}
              value={l.view_count}
              max={max}
              color="bg-blue-night"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LeadsBySourceCard                                                   */
/* ------------------------------------------------------------------ */

function LeadsBySourceCard({ data }: { data: LeadsBySource[] }) {
  const max = data[0]?.count ?? 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-blue-night">
        Prospects par source
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune donnée disponible</p>
      ) : (
        <div className="space-y-3">
          {data.map((row) => (
            <HorizontalBar
              key={row.source}
              label={row.source}
              value={row.count}
              max={max}
              color="bg-gold"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LeadsByStatusCard                                                   */
/* ------------------------------------------------------------------ */

const STATUS_COLORS: Record<string, string> = {
  Nouveau: "bg-blue-500",
  Contacté: "bg-amber-500",
  Qualifié: "bg-emerald-500",
  Fermé: "bg-gray-400",
};

function LeadsByStatusCard({ data }: { data: LeadsByStatus[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-blue-night">
        Prospects par statut
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune donnée disponible</p>
      ) : (
        <>
          {/* Donut-like summary */}
          <div className="mb-4 flex gap-2 overflow-hidden rounded-full">
            {data.map((row) => {
              const pct = total > 0 ? (row.count / total) * 100 : 0;
              const color = STATUS_COLORS[row.status] ?? "bg-gray-300";
              return (
                <div
                  key={row.status}
                  className={`h-3 ${color} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${row.status}: ${row.count}`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2">
            {data.map((row) => {
              const color = STATUS_COLORS[row.status] ?? "bg-gray-300";
              const pct =
                total > 0 ? Math.round((row.count / total) * 100) : 0;
              return (
                <div key={row.status} className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${color}`}
                  />
                  <span className="truncate text-xs text-gray-600">
                    {row.status}
                  </span>
                  <span className="ms-auto text-xs font-bold text-gray-700">
                    {row.count}
                    <span className="ms-1 font-normal text-gray-400">
                      ({pct}%)
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AdvancedAnalytics — main export                                     */
/* ------------------------------------------------------------------ */

interface AdvancedAnalyticsProps {
  data: AdvancedAnalyticsData;
}

export function AdvancedAnalytics({ data }: AdvancedAnalyticsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <TopListingsCard listings={data.topListings} />
      <LeadsBySourceCard data={data.leadsBySource} />
      <LeadsByStatusCard data={data.leadsByStatus} />
    </div>
  );
}
