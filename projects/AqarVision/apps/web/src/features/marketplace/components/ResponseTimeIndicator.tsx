"use client";

import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";

interface ResponseTimeIndicatorProps {
  /** Average response time in minutes */
  avgResponseMinutes: number | null;
}

export function ResponseTimeIndicator({ avgResponseMinutes }: ResponseTimeIndicatorProps) {
  const t = useTranslations("listings");

  if (avgResponseMinutes === null) return null;

  let label: string;
  let colorClass: string;

  if (avgResponseMinutes < 60) {
    label = t("response_under_1h");
    colorClass = "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
  } else if (avgResponseMinutes < 240) {
    label = t("response_under_4h");
    colorClass = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
  } else if (avgResponseMinutes < 1440) {
    label = t("response_under_24h");
    colorClass = "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800";
  } else {
    label = t("response_over_24h");
    colorClass = "text-zinc-500 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800";
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colorClass}`}>
      <Clock className="h-3 w-3" />
      {label}
    </div>
  );
}
