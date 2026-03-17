"use client";

import { useTranslations } from "next-intl";
import { Shield, ShieldCheck } from "lucide-react";

interface VerificationBadgeProps {
  /** Verification level: 0 = unverified, 1 = basic, 2 = docs, 3 = verified, 4 = premium */
  level: number;
  compact?: boolean;
}

const LEVEL_CONFIG: Record<number, { color: string; darkColor: string; bgColor: string }> = {
  0: { color: "text-zinc-400", darkColor: "dark:text-zinc-500", bgColor: "bg-zinc-100 dark:bg-zinc-800" },
  1: { color: "text-blue-500", darkColor: "dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  2: { color: "text-blue-600", darkColor: "dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  3: { color: "text-green-600", darkColor: "dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-900/20" },
  4: { color: "text-amber-500", darkColor: "dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
};

export function VerificationBadge({ level, compact = false }: VerificationBadgeProps) {
  const t = useTranslations("listings");
  const config = LEVEL_CONFIG[level] ?? LEVEL_CONFIG[0]!;
  const Icon = level >= 3 ? ShieldCheck : Shield;

  if (compact) {
    return (
      <span className={`${config.color} ${config.darkColor}`} title={t(`verification_level_${level}`)}>
        <Icon className="h-4 w-4" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bgColor} ${config.color} ${config.darkColor}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {t(`verification_level_${level}`)}
    </span>
  );
}
