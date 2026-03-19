import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import type { ListingCard as ListingCardType } from "@/features/listings/types/listing.types";

const listingTypeBadgeVariant = {
  sale: "listing-sale",
  rent: "listing-rent",
  vacation: "listing-vacation",
} as const;

const listingTypeLabel = {
  sale: "Vente",
  rent: "Location",
  vacation: "Vacances",
} as const;

export interface ListingCardProps {
  listing: ListingCardType;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const formattedPrice = new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <Link
      href={`/annonce/${listing.slug}`}
      className={cn(
        "group block overflow-hidden rounded-lg",
        "bg-white dark:bg-stone-900",
        "border border-stone-200 dark:border-stone-800",
        "shadow-card transition-all duration-normal",
        "hover:shadow-card-hover hover:scale-[1.02]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950",
        className
      )}
    >
      {/* Photo */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-stone-800">
        {listing.cover_url ? (
          <Image
            src={listing.cover_url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-slow group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400 dark:text-stone-500">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Listing type badge */}
        <div className="absolute start-3 top-3">
          <Badge
            variant={listingTypeBadgeVariant[listing.listing_type]}
            size="sm"
          >
            {listingTypeLabel[listing.listing_type]}
          </Badge>
        </div>

        {/* Verification badge */}
        {listing.agency_verified_level && listing.agency_verified_level >= 2 && (
          <div className="absolute end-3 top-3">
            <VerificationBadge
              level={listing.agency_verified_level as 1 | 2 | 3 | 4}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {/* Price */}
        <p className="text-lg font-bold text-stone-900 dark:text-stone-50 sm:text-xl">
          {formattedPrice}{" "}
          <span className="text-sm font-normal text-stone-500 dark:text-stone-400">
            {listing.currency}
          </span>
        </p>

        {/* Location pill */}
        <div className="mt-1.5">
          <span className="inline-flex rounded-full bg-amber-50 dark:bg-amber-950 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            {listing.wilaya_name}
            {listing.commune_name && `, ${listing.commune_name}`}
          </span>
        </div>

        {/* Title */}
        <p className="mt-2 line-clamp-1 text-sm font-medium text-stone-700 dark:text-stone-300">
          {listing.title}
        </p>

        {/* Details */}
        <div className="mt-1.5 flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
          <span>{listing.area_m2} m²</span>
          {listing.rooms !== null && listing.rooms !== undefined && (
            <>
              <span className="text-stone-300 dark:text-stone-600">|</span>
              <span>{listing.rooms} pièces</span>
            </>
          )}
          {listing.agency_name && (
            <>
              <span className="text-stone-300 dark:text-stone-600">|</span>
              <span className="truncate">{listing.agency_name}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
