"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ListingStatusBadge } from "./ListingStatusBadge";
import { Bed, Ruler, MapPin, Camera } from "lucide-react";
import type { ListingDto } from "../types/listing.types";
import { formatPrice } from "@/lib/format";

interface ListingCardProps {
  listing: ListingDto;
}

export function ListingCard({ listing }: ListingCardProps) {
  const t = useTranslations("listings");

  const title =
    listing.translations[0]?.title ?? t("untitled");

  const isSale = listing.listing_type === "sale";

  return (
    <Link
      href={`/AqarPro/dashboard/listings/${listing.id}/edit`}
      className="group block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden text-start transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {listing.cover_url ? (
          <Image
            src={listing.cover_url}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-600">
            <Camera className="h-12 w-12" strokeWidth={1.5} />
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute end-2 top-2">
          <ListingStatusBadge status={listing.current_status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Property type badge */}
        <span
          className={[
            "mb-1 inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            isSale
              ? "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400"
              : "bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400",
          ].join(" ")}
        >
          {t(listing.property_type)}
        </span>

        <h3 className="mb-1 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {title}
        </h3>

        {/* Price */}
        <p className="mb-2 text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
          {formatPrice(listing.current_price, listing.currency)}
        </p>

        {/* Details row */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
          {listing.rooms !== null && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {t("rooms_count", { count: listing.rooms })}
            </span>
          )}
          {listing.surface_m2 !== null && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              {listing.surface_m2} m²
            </span>
          )}
          <span className="ms-auto flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {t("wilaya")} {listing.wilaya_code}
          </span>
        </div>
      </div>
    </Link>
  );
}
