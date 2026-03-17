"use client";

import { useTranslations } from "next-intl";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface FreshnessIndicatorProps {
  /** ISO date of last availability confirmation */
  confirmedAt: string | null;
  /** ISO date of last update */
  updatedAt: string;
}

export function FreshnessIndicator({ confirmedAt, updatedAt }: FreshnessIndicatorProps) {
  const t = useTranslations("listings");

  const now = Date.now();
  const refDate = confirmedAt ? new Date(confirmedAt).getTime() : new Date(updatedAt).getTime();
  const daysSince = Math.floor((now - refDate) / (1000 * 60 * 60 * 24));

  let label: string;
  let Icon: typeof CheckCircle2;
  let colorClass: string;

  if (daysSince <= 7) {
    label = t("freshness_recent");
    Icon = CheckCircle2;
    colorClass = "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
  } else if (daysSince <= 30) {
    label = t("freshness_moderate");
    Icon = Clock;
    colorClass = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
  } else {
    label = t("freshness_old");
    Icon = AlertCircle;
    colorClass = "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800";
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {label}
      {confirmedAt && (
        <span className="text-[10px] opacity-60">
          · {t("freshness_confirmed")}
        </span>
      )}
    </div>
  );
}
