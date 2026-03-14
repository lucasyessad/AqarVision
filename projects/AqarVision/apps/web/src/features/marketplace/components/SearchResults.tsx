"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import type { SearchResultDto } from "../types/search.types";
import { formatListingRef } from "../types/search.types";
import { TrustBadge } from "./TrustBadge";

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

interface SearchResultCardProps {
  listing: SearchResultDto;
  isViewed: boolean;
}

function SearchResultCard({ listing, isViewed }: SearchResultCardProps) {
  const tListings = useTranslations("listings");

  return (
    <Link
      href={`/l/${listing.slug}`}
      className="group block overflow-hidden rounded-xl border transition-all"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-light)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
        {isViewed && (
          <span
            className="absolute start-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm"
            style={{ background: "var(--bg-surface)", color: "var(--text-tertiary)" }}
          >
            Déjà consulté
          </span>
        )}
        {listing.cover_url ? (
          <img
            src={listing.cover_url}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ color: "var(--text-tertiary)" }}>
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
          style={{ background: "linear-gradient(transparent, var(--bg-card))" }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Badges */}
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span
            className="inline-block rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide"
            style={{ background: "var(--amber-glow)", color: "var(--amber)" }}
          >
            {tListings(listing.property_type)}
          </span>
          <TrustBadge
            listing={{
              has_photos: listing.cover_url !== null,
              description: "",
              price: listing.current_price,
              agency: {
                is_verified: (listing as SearchResultDto & { agency_is_verified?: boolean }).agency_is_verified ?? false,
              },
            }}
          />
        </div>

        {/* Location */}
        <p className="mb-1 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--cyan)" }}>
          {listing.wilaya_name}
          {listing.commune_name ? ` · ${listing.commune_name}` : ""}
        </p>

        {/* Title */}
        <h3 className="mb-2 truncate text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          {listing.title}
        </h3>

        {/* Price */}
        <p className="mb-3 text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {formatPrice(listing.current_price, listing.currency)}
          {listing.surface_m2 !== null && listing.surface_m2 > 0 && (
            <span className="ms-2 font-mono text-xs font-normal" style={{ color: "var(--text-tertiary)" }}>
              {Math.round(listing.current_price / listing.surface_m2).toLocaleString("fr-DZ")} {listing.currency}/m²
            </span>
          )}
        </p>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5">
          {listing.rooms !== null && (
            <span className="rounded px-2 py-0.5 text-xs" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
              {listing.rooms} {tListings("rooms")}
            </span>
          )}
          {listing.surface_m2 !== null && (
            <span className="rounded px-2 py-0.5 text-xs" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
              {listing.surface_m2} m²
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--border-light)" }}>
          <p className="truncate text-xs" style={{ color: "var(--text-tertiary)" }}>
            {listing.agency_name}
          </p>
          <span className="shrink-0 font-mono text-xs" style={{ color: "var(--text-tertiary)" }}>
            {formatListingRef(listing.reference_number)}
          </span>
        </div>
      </div>
    </Link>
  );
}

interface SearchResultsProps {
  results: SearchResultDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  viewedIds?: string[];
}

export function SearchResults({
  results,
  totalCount,
  page,
  pageSize,
  viewedIds = [],
}: SearchResultsProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / pageSize);

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (results.length === 0) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: "var(--text-secondary)" }}>{t("no_results")}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header: count + sort */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{totalCount}</strong>{" "}
          {t("results_count", { count: totalCount })}
        </p>
        <select
          value={searchParams.get("sort") ?? "newest"}
          onChange={(e) => handleSortChange(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-sm outline-none"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
            fontFamily: "inherit",
          }}
        >
          <option value="newest">{t("newest")}</option>
          <option value="oldest">{t("oldest")}</option>
          <option value="price_asc">{t("price_asc")}</option>
          <option value="price_desc">{t("price_desc")}</option>
          <option value="surface_asc">{t("surface_asc")}</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((listing) => (
          <SearchResultCard
            key={listing.id}
            listing={listing}
            isViewed={viewedIds.includes(listing.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigateToPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "transparent" }}
          >
            {t("previous")}
          </button>
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            {t("page_of", { current: page, total: totalPages })}
          </span>
          <button
            type="button"
            onClick={() => navigateToPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "transparent" }}
          >
            {t("next")}
          </button>
        </div>
      )}
    </div>
  );
}
