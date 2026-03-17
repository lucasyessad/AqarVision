"use client";

import { useTranslations } from "next-intl";
import { Clock, MessageCircle, Home, Star } from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";

interface AgencyTrustCardProps {
  agencyName: string;
  verificationLevel: number;
  avgResponseMinutes: number | null;
  totalListings: number;
  totalLeads: number;
  memberSince: string;
}

export function AgencyTrustCard({
  agencyName,
  verificationLevel,
  avgResponseMinutes,
  totalListings,
  totalLeads,
  memberSince,
}: AgencyTrustCardProps) {
  const t = useTranslations("listings");

  const responseLabel =
    avgResponseMinutes !== null
      ? avgResponseMinutes < 60
        ? t("response_under_1h")
        : avgResponseMinutes < 240
          ? t("response_under_4h")
          : t("response_under_24h")
      : null;

  const memberYear = new Date(memberSince).getFullYear();

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{agencyName}</h3>
        <VerificationBadge level={verificationLevel} />
      </div>

      {/* Trust indicators grid */}
      <div className="grid grid-cols-2 gap-3">
        {responseLabel && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
              <Clock className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">{responseLabel}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Home className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {totalListings} {t("active_listings")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <MessageCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {totalLeads} {t("total_contacts")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Star className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {t("member_since")} {memberYear}
          </span>
        </div>
      </div>
    </div>
  );
}
