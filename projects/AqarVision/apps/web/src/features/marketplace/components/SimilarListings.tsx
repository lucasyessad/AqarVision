"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { MapPin, Maximize2, BedDouble } from "lucide-react";

interface SimilarListing {
  id: string;
  slug: string;
  title: string;
  current_price: number;
  currency: string;
  surface_m2: number | null;
  rooms: number | null;
  wilaya_name: string;
  photo_url: string | null;
  listing_type: string;
}

interface SimilarListingsProps {
  listings: SimilarListing[];
  locale: string;
}

export function SimilarListings({ listings, locale }: SimilarListingsProps) {
  const t = useTranslations("listings");

  if (listings.length === 0) return null;

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {t("similar_listings")}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {listings.map((listing) => (
          <a
            key={listing.id}
            href={`/${locale}/annonce/${listing.slug}`}
            className="group flex-none w-64 rounded-lg border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-zinc-100 dark:bg-zinc-800">
              {listing.photo_url ? (
                <Image
                  src={listing.photo_url}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="256px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">
                  <Maximize2 className="h-8 w-8" />
                </div>
              )}
              <span className="absolute start-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300">
                {listing.listing_type === "rent" ? t("rent") : t("sale")}
              </span>
            </div>

            <div className="p-3">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {listing.title}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-3 w-3" />
                {listing.wilaya_name}
              </p>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-sahara-600 dark:text-sahara-500">
                  {formatPrice(listing.current_price, listing.currency)}
                </span>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {listing.surface_m2 && <span>{listing.surface_m2} m²</span>}
                  {listing.rooms && (
                    <span className="flex items-center gap-0.5">
                      <BedDouble className="h-3 w-3" />
                      {listing.rooms}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
