"use client";

import { useTranslations } from "next-intl";
import type { ListingStatus } from "../types/listing.types";

const STATUS_STYLES: Record<ListingStatus, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  pending_review: "bg-amber-100 text-amber-800",
  published: "bg-green-100 text-green-800",
  paused: "bg-orange-100 text-orange-800",
  rejected: "bg-red-100 text-red-800",
  sold: "bg-zinc-900/10 text-zinc-900",
  archived: "bg-zinc-100 text-zinc-500",
};

interface ListingStatusBadgeProps {
  status: ListingStatus;
}

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  const t = useTranslations("listings");

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {t(`status_${status}`)}
    </span>
  );
}
