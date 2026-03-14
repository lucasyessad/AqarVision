"use client";

import { useTranslations } from "next-intl";
import type { ListingStatus } from "../types/listing.types";

const STATUS_STYLES: Record<ListingStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending_review: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  paused: "bg-orange-100 text-orange-800",
  rejected: "bg-red-100 text-red-800",
  sold: "bg-[#1a365d]/10 text-[#1a365d]",
  archived: "bg-gray-100 text-gray-500",
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
