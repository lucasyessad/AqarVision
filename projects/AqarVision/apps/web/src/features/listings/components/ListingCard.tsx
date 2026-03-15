"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ListingStatusBadge } from "./ListingStatusBadge";
import type { ListingDto } from "../types/listing.types";

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

interface ListingCardProps {
  listing: ListingDto;
}

export function ListingCard({ listing }: ListingCardProps) {
  const t = useTranslations("listings");

  const title =
    listing.translations[0]?.title ?? t("untitled");

  return (
    <Link
      href={`/AqarPro/dashboard/listings/${listing.id}/edit`}
      className="group block w-full rounded-xl bg-zinc-50 text-start shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-zinc-100">
        {listing.cover_url ? (
          <Image
            src={listing.cover_url}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute inset-block-start-2 inset-inline-end-2">
          <ListingStatusBadge status={listing.current_status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Property type badge */}
        <span className="mb-1 inline-block rounded bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-700">
          {t(listing.property_type)}
        </span>

        <h3 className="mb-1 truncate text-sm font-semibold text-zinc-800">
          {title}
        </h3>

        {/* Price */}
        <p className="mb-2 text-lg font-bold text-zinc-900">
          {formatPrice(listing.current_price, listing.currency)}
        </p>

        {/* Details row */}
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          {listing.rooms !== null && (
            <span>{t("rooms_count", { count: listing.rooms })}</span>
          )}
          {listing.surface_m2 !== null && (
            <span>{listing.surface_m2} m²</span>
          )}
          <span className="ms-auto">
            {t("wilaya")} {listing.wilaya_code}
          </span>
        </div>
      </div>
    </Link>
  );
}
