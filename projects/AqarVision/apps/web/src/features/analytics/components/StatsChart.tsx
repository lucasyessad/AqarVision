"use client";

import { useTranslations } from "next-intl";
import type { AgencyStatsDto } from "../types/analytics.types";

interface StatsChartProps {
  stats: AgencyStatsDto[];
}

export function StatsChart({ stats }: StatsChartProps) {
  const t = useTranslations("analytics");

  if (stats.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">{t("no_data")}</p>
      </div>
    );
  }

  const maxViews = Math.max(...stats.map((s) => s.total_views), 1);
  const maxLeads = Math.max(...stats.map((s) => s.total_leads), 1);

  return (
    <div className="space-y-6">
      {/* Daily Views Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-blue-night">
          {t("daily_views")}
        </h3>
        <div className="flex items-end gap-1" style={{ height: "160px" }}>
          {stats.map((day) => {
            const heightPercent = (day.total_views / maxViews) * 100;
            const label = day.stat_date.slice(5); // MM-DD
            return (
              <div
                key={`views-${day.stat_date}`}
                className="group relative flex flex-1 flex-col items-center justify-end"
                style={{ height: "100%" }}
              >
                <div
                  className="w-full min-w-[4px] rounded-t bg-blue-night/80 transition-colors group-hover:bg-blue-night"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                />
                {stats.length <= 15 && (
                  <span className="mt-1 text-[10px] text-gray-400">{label}</span>
                )}
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-8 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {day.total_views}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Leads Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-blue-night">
          {t("daily_leads")}
        </h3>
        <div className="flex items-end gap-1" style={{ height: "160px" }}>
          {stats.map((day) => {
            const heightPercent = (day.total_leads / maxLeads) * 100;
            const label = day.stat_date.slice(5);
            return (
              <div
                key={`leads-${day.stat_date}`}
                className="group relative flex flex-1 flex-col items-center justify-end"
                style={{ height: "100%" }}
              >
                <div
                  className="w-full min-w-[4px] rounded-t bg-gold/80 transition-colors group-hover:bg-gold"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                />
                {stats.length <= 15 && (
                  <span className="mt-1 text-[10px] text-gray-400">{label}</span>
                )}
                <div className="pointer-events-none absolute -top-8 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {day.total_leads}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
