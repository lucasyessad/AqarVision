"use client";

import { useTranslations } from "next-intl";
import { X, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import type { Listing } from "@/features/listings/types/listing.types";
import { formatPrice, formatArea } from "@/lib/format";
import { useEffect } from "react";

interface ListingDrawerProps {
  listing: Listing | null;
  onClose: () => void;
}

export function ListingDrawer({ listing, onClose }: ListingDrawerProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (listing) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [listing, onClose]);

  if (!listing) return null;

  const fr = listing.translations.find((t) => t.locale === "fr") ?? listing.translations[0];
  const cover = listing.media.find((m) => m.is_cover) ?? listing.media[0];

  return (
    <div className="fixed inset-0 z-modal flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 shadow-xl overflow-y-auto animate-slide-down">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-4 py-3">
          <h2 className="text-md font-semibold text-stone-900 dark:text-stone-100 truncate pe-4">
            {fr?.title ?? ""}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-fast"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cover image */}
        {cover && (
          <div className="relative aspect-video bg-stone-200 dark:bg-stone-800">
            <Image
              src={cover.storage_path}
              alt={fr?.title ?? ""}
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Price & status */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {formatPrice(listing.price, listing.currency)}
            </span>
            <Badge
              variant={
                listing.status === "published"
                  ? "success"
                  : listing.status === "draft"
                    ? "default"
                    : listing.status === "pending_review"
                      ? "warning"
                      : listing.status === "rejected"
                        ? "danger"
                        : "default"
              }
            >
              {listing.status}
            </Badge>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{listing.address}</span>
          </div>

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
            {listing.details.area_m2 && (
              <span className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                {formatArea(listing.details.area_m2)}
              </span>
            )}
            {listing.details.rooms != null && (
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {listing.details.rooms}
              </span>
            )}
            {listing.details.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {listing.details.bathrooms}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-stone-600 dark:text-stone-400 whitespace-pre-line">
              {fr?.description ?? ""}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="md" className="flex-1">
              Modifier
            </Button>
            <Button variant="outline" size="md" className="flex-1">
              Voir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
