"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import type { SearchResultDto } from "../types/search.types";

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
}

function SearchResultCard({ listing }: SearchResultCardProps) {
  const tListings = useTranslations("listings");
  const t = useTranslations("search");

  return (
    <Link
      href={`/l/${listing.slug}`}
      className="group block rounded-xl bg-[#f7fafc] shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-gray-200">
        {listing.cover_url ? (
          <img
            src={listing.cover_url}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
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
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Property type badge */}
        <span className="mb-1 inline-block rounded bg-[#d4af37]/15 px-2 py-0.5 text-xs font-medium text-[#d4af37]">
          {tListings(listing.property_type)}
        </span>

        <h3 className="mb-1 truncate text-sm font-semibold text-[#2d3748]">
          {listing.title}
        </h3>

        {/* Price */}
        <p className="mb-2 text-lg font-bold text-[#1a365d]">
          {formatPrice(listing.current_price, listing.currency)}
        </p>

        {/* Details row */}
        <div className="flex items-center gap-3 text-xs text-[#a0aec0]">
          {listing.rooms !== null && (
            <span>{listing.rooms} {tListings("rooms")}</span>
          )}
          {listing.surface_m2 !== null && (
            <span>{listing.surface_m2} m&sup2;</span>
          )}
          <span className="ms-auto">
            {tListings("wilaya")} {listing.wilaya_code}
          </span>
        </div>

        {/* Agency */}
        <p className="mt-2 truncate text-xs text-[#a0aec0]">
          {listing.agency_name}
        </p>
      </div>
    </Link>
  );
}

interface SearchResultsProps {
  results: SearchResultDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export function SearchResults({
  results,
  totalCount,
  page,
  pageSize,
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
        <p className="text-gray-500">{t("no_results")}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header: count + sort */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#2d3748]">
          {t("results_count", { count: totalCount })}
        </p>
        <select
          value={searchParams.get("sort") ?? "newest"}
          onChange={(e) => handleSortChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
        >
          <option value="newest">{t("newest")}</option>
          <option value="price_asc">{t("price_asc")}</option>
          <option value="price_desc">{t("price_desc")}</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((listing) => (
          <SearchResultCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigateToPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[#2d3748] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("previous")}
          </button>
          <span className="text-sm text-[#a0aec0]">
            {t("page_of", { current: page, total: totalPages })}
          </span>
          <button
            type="button"
            onClick={() => navigateToPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[#2d3748] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("next")}
          </button>
        </div>
      )}
    </div>
  );
}
