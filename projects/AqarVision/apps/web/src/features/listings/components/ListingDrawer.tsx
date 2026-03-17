"use client";

import { useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  X,
  ExternalLink,
  MapPin,
  Maximize2,
  BedDouble,
  Bath,
  Eye,
  Users,
} from "lucide-react";
import { ListingStatusBadge } from "./ListingStatusBadge";

interface ListingDrawerListing {
  id: string;
  slug: string;
  title: string;
  status: string;
  property_type: string;
  listing_type: string;
  current_price: number;
  currency: string;
  surface_m2: number | null;
  rooms: number | null;
  bathrooms: number | null;
  wilaya_name: string;
  commune_name: string | null;
  photos: string[];
  views_count: number;
  leads_count: number;
  quality_score: number;
  created_at: string;
  updated_at: string;
}

interface ListingDrawerProps {
  listing: ListingDrawerListing | null;
  onClose: () => void;
  locale: string;
}

export function ListingDrawer({ listing, onClose, locale }: ListingDrawerProps) {
  const t = useTranslations("listings");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (listing) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [listing, handleKeyDown]);

  if (!listing) return null;

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 end-0 z-50 flex w-full max-w-[480px] flex-col bg-white shadow-xl dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <ListingStatusBadge status={listing.status} />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              #{listing.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={`/${locale}/annonce/${listing.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              title={t("open_in_new_tab")}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Photo */}
          {listing.photos.length > 0 && (
            <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={listing.photos[0]}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="480px"
              />
              {listing.photos.length > 1 && (
                <span className="absolute bottom-2 end-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
                  +{listing.photos.length - 1}
                </span>
              )}
            </div>
          )}

          {/* Details */}
          <div className="space-y-4 p-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {listing.title}
              </h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-3.5 w-3.5" />
                {listing.commune_name
                  ? `${listing.commune_name}, ${listing.wilaya_name}`
                  : listing.wilaya_name}
              </p>
            </div>

            <div className="text-xl font-bold text-sahara-600 dark:text-sahara-500">
              {formatPrice(listing.current_price, listing.currency)}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {listing.surface_m2 && (
                <div className="flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                  <Maximize2 className="h-4 w-4 text-zinc-400" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("surface")}</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {listing.surface_m2} m²
                    </p>
                  </div>
                </div>
              )}
              {listing.rooms && (
                <div className="flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                  <BedDouble className="h-4 w-4 text-zinc-400" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("rooms")}</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {listing.rooms}
                    </p>
                  </div>
                </div>
              )}
              {listing.bathrooms && (
                <div className="flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                  <Bath className="h-4 w-4 text-zinc-400" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("bathrooms")}</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {listing.bathrooms}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Performance */}
            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
              <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t("performance")}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    <Eye className="h-4 w-4 text-zinc-400" />
                    {listing.views_count}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("views")}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    <Users className="h-4 w-4 text-zinc-400" />
                    {listing.leads_count}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("leads")}</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {listing.quality_score}%
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("quality")}</p>
                </div>
              </div>
            </div>

            {/* Quality bar */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">{t("quality_score")}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {listing.quality_score}/100
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className={`h-full rounded-full transition-all ${
                    listing.quality_score >= 80
                      ? "bg-atlas-500"
                      : listing.quality_score >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${listing.quality_score}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <a
            href={`/${locale}/AqarPro/dashboard/listings/${listing.id}/edit`}
            className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t("edit")}
          </a>
          <a
            href={`/${locale}/annonce/${listing.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {t("view_listing")}
          </a>
        </div>
      </div>
    </>
  );
}
