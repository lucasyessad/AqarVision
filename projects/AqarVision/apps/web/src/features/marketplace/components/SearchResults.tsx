"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { Loader2 } from "lucide-react";
import type { SearchResultDto } from "../types/search.types";
import { formatListingRef } from "../types/search.types";
import { TrustBadge } from "./TrustBadge";
import { formatPrice } from "@/lib/format";
import { searchListingsAction } from "../actions/search.action";

const STATUS_BADGE_CLS: Record<string, string> = {
  available:   "bg-emerald-100/90 text-emerald-700 backdrop-blur-sm",
  under_offer: "bg-amber-100/90 text-amber-700 backdrop-blur-sm",
  sold:        "bg-red-100/90 text-red-700 backdrop-blur-sm",
  rented:      "bg-red-100/90 text-red-700 backdrop-blur-sm",
};

const STATUS_KEY: Record<string, string> = {
  available:   "status_available",
  under_offer: "status_under_offer",
  sold:        "status_sold",
  rented:      "status_rented",
};

interface SearchResultCardProps {
  listing: SearchResultDto;
  isViewed: boolean;
}

function SearchResultCard({ listing, isViewed }: SearchResultCardProps) {
  const tListings = useTranslations("listings");

  const status = (listing as SearchResultDto & { status?: string }).status;
  const badgeCls = status ? STATUS_BADGE_CLS[status] : null;
  const badgeKey = status ? STATUS_KEY[status] : null;
  const mediaCount = (listing as SearchResultDto & { media_count?: number }).media_count;
  const isNew = (listing as SearchResultDto & { is_new?: boolean }).is_new;
  const agencyLogo = (listing as SearchResultDto & { agency_logo_url?: string }).agency_logo_url;
  const agencyPhone = (listing as SearchResultDto & { agency_phone?: string }).agency_phone;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-[3px] hover:border-zinc-300 hover:shadow-card-hover dark:border-zinc-800 dark:bg-zinc-900">
      {/* ── Image area ─────────────────────────────────────────── */}
      <Link href={`/annonce/${listing.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        {listing.cover_url ? (
          <Image
            src={listing.cover_url}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105 bg-zinc-50"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-zinc-200">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {/* Top-left: badges */}
        <div className="absolute start-2 top-2 flex flex-wrap gap-1">
          {isNew && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-950">
              {tListings("badge_new")}
            </span>
          )}
          {badgeCls && badgeKey && (
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeCls}`}>
              {tListings(badgeKey)}
            </span>
          )}
          {isViewed && (
            <span className="rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-medium text-white/85 backdrop-blur-sm">
              {tListings("badge_viewed")}
            </span>
          )}
        </div>

        {/* Top-right: photo count */}
        {mediaCount !== undefined && mediaCount > 1 && (
          <span className="absolute end-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
            {mediaCount}
          </span>
        )}

        {/* Bottom-left: agency logo */}
        {agencyLogo && (
          <div className="absolute bottom-2 start-2 h-8 w-8 overflow-hidden rounded-full border-2 border-white shadow-sm">
            <Image src={agencyLogo} alt={listing.agency_name} fill className="object-cover" sizes="32px" />
          </div>
        )}
      </Link>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Location */}
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-500">
          {listing.wilaya_name}
          {listing.commune_name ? ` · ${listing.commune_name}` : ""}
        </p>

        {/* Title */}
        <Link href={`/annonce/${listing.slug}`}>
          <h3
            className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 transition-colors font-display hover:text-amber-600"
          >
            {listing.title}
          </h3>
        </Link>

        {/* Type badges */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-amber-500">
            {tListings(listing.listing_type)}
          </span>
          <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-amber-500">
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

        {/* Price */}
        <div className="mb-3">
          <p className="text-lg font-semibold tracking-tight text-zinc-900 font-display">
            {formatPrice(listing.current_price, listing.currency)}
          </p>
          {listing.surface_m2 !== null && listing.surface_m2 > 0 && listing.current_price > 0 && (
            <p className="text-xs text-zinc-500">
              {Math.round(listing.current_price / listing.surface_m2).toLocaleString("fr-DZ")} {listing.currency}/m²
            </p>
          )}
        </div>

        {/* Meta pills */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {listing.rooms !== null && (
            <span className="rounded-full bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-600">
              {listing.rooms} {tListings("rooms")}
            </span>
          )}
          {listing.surface_m2 !== null && (
            <span className="rounded-full bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-600">
              {listing.surface_m2} m²
            </span>
          )}
        </div>

        {/* Footer: agency + contact button */}
        <div className="mt-auto flex items-center justify-between border-t border-zinc-200 pt-3">
          <div className="flex items-center gap-2 min-w-0">
            {agencyLogo ? (
              <Image src={agencyLogo} alt={listing.agency_name} width={20} height={20} className="rounded-full object-cover shrink-0" />
            ) : (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[9px] font-bold text-amber-500">
                {listing.agency_name.charAt(0).toUpperCase()}
              </span>
            )}
            <p className="truncate text-xs font-medium text-zinc-600">
              {listing.agency_name}
            </p>
          </div>

          {/* Contact direct — JE signature feature */}
          {agencyPhone ? (
            <a
              href={`tel:${agencyPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 flex items-center gap-1 rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-50 transition-opacity hover:opacity-90"
              title={tListings("call_name", { name: listing.agency_name })}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              {tListings("contact_button")}
            </a>
          ) : (
            <Link
              href={`/annonce/${listing.slug}`}
              className="shrink-0 flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-500 transition-colors"
            >
              {tListings("view_button")}
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

interface SearchResultsProps {
  results: SearchResultDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  viewedIds?: string[];
  /** Id of listing highlighted via map marker hover */
  highlightedId?: string | null;
}

export function SearchResults({
  results: initialResults,
  totalCount,
  page: initialPage,
  pageSize,
  viewedIds = [],
  highlightedId,
}: SearchResultsProps) {
  const t = useTranslations("search");
  const tListings = useTranslations("listings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Infinite scroll state
  const [results, setResults] = useState(initialResults);
  const [page, setPage] = useState(initialPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = page < totalPages;

  // Reset when initial results change (new search/filter)
  useEffect(() => {
    setResults(initialResults);
    setPage(initialPage);
  }, [initialResults, initialPage]);

  // Infinite scroll observer
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const nextPage = page + 1;
    const filters: Record<string, unknown> = {
      locale: pathname.split("/")[1] ?? "fr",
      page: nextPage,
      page_size: pageSize,
    };

    // Carry over current search params as filters
    searchParams.forEach((value, key) => {
      if (key !== "page") filters[key] = value;
    });

    const result = await searchListingsAction(filters);
    if (result.success && result.data.results.length > 0) {
      setResults((prev) => [...prev, ...result.data.results]);
      setPage(nextPage);
    }
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, page, pageSize, pathname, searchParams]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803M10.5 7.5v6m3-3h-6" />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-900">{t("no_results")}</p>
        <p className="mt-1 text-sm text-zinc-500">{tListings("no_results_hint")}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header: count + sort */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-zinc-600">
          <span className="font-semibold text-zinc-900">{totalCount.toLocaleString("fr-DZ")}</span>{" "}
          {t("results_count", { count: totalCount })}
        </p>
        <select
          value={searchParams.get("sort") ?? "newest"}
          onChange={(e) => handleSortChange(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-600 outline-none font-sans"
        >
          <option value="newest">{t("newest")}</option>
          <option value="oldest">{t("oldest")}</option>
          <option value="price_asc">{t("price_asc")}</option>
          <option value="price_desc">{t("price_desc")}</option>
          <option value="surface_asc">{t("surface_asc")}</option>
        </select>
      </div>

      {/* Grid — 3 columns full-width */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((listing) => (
          <div
            key={listing.id}
            className={[
              "transition-all",
              highlightedId === listing.id ? "outline outline-2 outline-zinc-950 rounded-xl" : "",
            ].join(" ")}
          >
            <SearchResultCard
              listing={listing}
              isViewed={viewedIds.includes(listing.id)}
            />
          </div>
        ))}
      </div>


      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Chargement...
          </span>
        </div>
      )}

      {/* End of results */}
      {!hasMore && results.length > 0 && (
        <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          {results.length} / {totalCount} annonces affichées
        </p>
      )}
    </div>
  );
}
