"use client";

import { useTranslations } from "next-intl";
import { ChartLine } from "@/components/ui/ChartLine";
import { ChartDonut, type ChartDonutDataItem } from "@/components/ui/ChartDonut";

interface Props {
  viewsData: { date: string; value: number }[];
  leadsData: { date: string; value: number }[];
}

export function AnalyticsCharts({ viewsData, leadsData }: Props) {
  const t = useTranslations("dashboard.stats");

  // Build donut data from leads by aggregating
  const totalLeads = leadsData.reduce((s, d) => s + d.value, 0);
  const totalViews = viewsData.reduce((s, d) => s + d.value, 0);

  const donutData: ChartDonutDataItem[] = [
    { name: t("views"), value: totalViews, color: "#0D9488" },
    { name: t("leads"), value: totalLeads, color: "#FBBF24" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">
          {t("views")}
        </h3>
        <ChartLine data={viewsData} label={t("views")} />
      </div>
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">
          {t("leads")}
        </h3>
        <ChartLine
          data={leadsData}
          label={t("leads")}
          color="var(--color-amber-400)"
        />
      </div>
      <div className="lg:col-span-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">
          {t("distribution")}
        </h3>
        <ChartDonut data={donutData} label={t("distribution")} />
      </div>
    </div>
  );
}
