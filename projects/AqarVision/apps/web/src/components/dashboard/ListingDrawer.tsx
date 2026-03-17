"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { X, ExternalLink, Eye, Users, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/format";

export interface DrawerListing {
  id: string;
  slug: string;
  title: string;
  status: string;
  listing_type: string;
  property_type: string;
  current_price: number;
  currency: string;
  wilaya_name: string;
  surface_m2: number | null;
  rooms: number | null;
  cover_url: string | null;
  views_count: number;
  leads_count: number;
  created_at: string;
  quality_score: number;
}

interface ListingDrawerProps {
  listing: DrawerListing | null;
  onClose: () => void;
  locale: string;
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    draft: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
    pending_review: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    published: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    paused: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    sold: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[status] ?? colorMap.draft}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function QualityBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{score}%</span>
    </div>
  );
}

export function ListingDrawer({ listing, onClose, locale }: ListingDrawerProps) {
  const t = useTranslations("listings");

  // Close on Escape
  useEffect(() => {
    if (!listing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [listing, onClose]);

  return (
    <>
      {/* Backdrop */}
      {listing && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 end-0 z-50 flex w-full max-w-[480px] flex-col border-s border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl transition-transform duration-300 ${
          listing ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {listing && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 truncate pe-4">
                {listing.title || t("untitled")}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Cover image */}
              {listing.cover_url && (
                <div className="aspect-video overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={listing.cover_url}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Status + Price */}
              <div className="flex items-center justify-between">
                <StatusBadge status={listing.status} />
                <p className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                  {formatPrice(listing.current_price, listing.currency)}
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{t("listing_type")}</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{t(listing.listing_type as "sale" | "rent" | "vacation")}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{t("property_type")}</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{t(listing.property_type as "apartment" | "villa")}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{t("wilaya")}</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{listing.wilaya_name}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{t("surface")}</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {listing.surface_m2 ? `${listing.surface_m2} m²` : "—"}
                    {listing.rooms ? ` · ${listing.rooms} ${t("rooms")}` : ""}
                  </p>
                </div>
              </div>

              {/* Quality score */}
              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Score qualité</p>
                <QualityBar score={listing.quality_score} />
              </div>

              {/* Stats row */}
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{listing.views_count} vues</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                  <Users className="h-3.5 w-3.5" />
                  <span>{listing.leads_count} leads</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(listing.created_at).toLocaleDateString(locale)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-zinc-200 dark:border-zinc-700 px-6 py-4">
              <Link
                href={`/AqarPro/dashboard/listings/${listing.id}` as `/${string}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                {t("edit_listing")}
              </Link>
              <a
                href={`/${locale}/annonce/${listing.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t("view_button")}
              </a>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
