"use client";

import { useTranslations } from "next-intl";
import { Flame } from "lucide-react";

interface HeatBadgeProps {
  score: number;
  compact?: boolean;
}

const HEAT_CONFIG = [
  { min: 0, max: 30, key: "cold", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { min: 31, max: 60, key: "warm", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { min: 61, max: 100, key: "hot", color: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
];

export function HeatBadge({ score, compact = false }: HeatBadgeProps) {
  const t = useTranslations("leads");

  const config = HEAT_CONFIG.find((c) => score >= c.min && score <= c.max) ?? HEAT_CONFIG[0]!;

  if (compact) {
    return (
      <span className={config.color} title={`${t(`heat_${config.key}`)} (${score})`}>
        <Flame className="h-4 w-4" />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
      <Flame className="h-3 w-3" />
      {t(`heat_${config.key}`)}
      <span className="opacity-60">({score})</span>
    </span>
  );
}
