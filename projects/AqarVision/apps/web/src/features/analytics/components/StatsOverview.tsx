"use client";

import { useTranslations } from "next-intl";
import type { AnalyticsSummary } from "../types/analytics.types";

interface StatsOverviewProps {
  summary: AnalyticsSummary;
}

function TrendIndicator({ value }: { value: number }) {
  if (value === 0) return null;

  const isUp = value > 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isUp ? "text-green-600" : "text-red-600"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-3 w-3 ${isUp ? "" : "rotate-180"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      {Math.abs(value)}%
    </span>
  );
}

export function StatsOverview({ summary }: StatsOverviewProps) {
  const t = useTranslations("analytics");

  const cards = [
    {
      label: t("views"),
      value: summary.total_views.toLocaleString(),
      trend: summary.trend_views,
    },
    {
      label: t("leads"),
      value: summary.total_leads.toLocaleString(),
      trend: summary.trend_leads,
    },
    {
      label: t("new_listings"),
      value: summary.total_listings.toLocaleString(),
      trend: summary.trend_listings,
    },
    {
      label: t("conversion"),
      value: `${summary.conversion_rate}%`,
      trend: summary.trend_conversion,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-200 bg-white dark:bg-zinc-900 p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">{card.label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{card.value}</p>
            <TrendIndicator value={card.trend} />
          </div>
          <p className="mt-1 text-xs text-gray-400">{t("last_30_days")}</p>
        </div>
      ))}
    </div>
  );
}
