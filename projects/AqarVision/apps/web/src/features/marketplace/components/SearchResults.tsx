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

// JE-style status badge config
const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  available:       { label: "Disponible",   bg: "rgba(59,155,109,0.12)", color: "#3B9B6D" },
  under_offer:     { label: "Sous offre",   bg: "rgba(212,148,58,0.12)", color: "#D4943A" },
  sold:            { label: "Vendu",        bg: "rgba(209,69,69,0.12)",  color: "#D14545" },
  rented:          { label: "Loué",         bg: "rgba(209,69,69,0.12)",  color: "#D14545" },
};

interface SearchResultCardProps {
  listing: SearchResultDto;
  isViewed: boolean;
}

function SearchResultCard({ listing, isViewed }: SearchResultCardProps) {
  const tListings = useTranslations("listings");

  const status = (listing as SearchResultDto & { status?: string }).status;
  const badge = status ? STATUS_BADGE[status] : null;
  const mediaCount = (listing as SearchResultDto & { media_count?: number }).media_count;
  const isNew = (listing as SearchResultDto & { is_new?: boolean }).is_new;
  const agencyLogo = (listing as SearchResultDto & { agency_logo_url?: string }).agency_logo_url;
  const agencyPhone = (listing as SearchResultDto & { agency_phone?: string }).agency_phone;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border transition-all"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--ivoire-border)",
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--or)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-hover)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--ivoire-border)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* ── Image area ─────────────────────────────────────────── */}
      <Link href={`/l/${listing.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        {listing.cover_url ? (
          <img
            src={listing.cover_url}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ background: "var(--ivoire-warm)" }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "var(--ivoire-warm)", color: "var(--ivoire-border)" }}
          >
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {/* Top-left: badges */}
        <div className="absolute start-2 top-2 flex flex-wrap gap-1">
          {isNew && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{ background: "var(--or)", color: "var(--onyx)" }}
            >
              Nouveau
            </span>
          )}
          {badge && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm"
              style={{ background: badge.bg, color: badge.color }}
            >
              {badge.label}
            </span>
          )}
          {isViewed && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm"
              style={{ background: "rgba(28,28,30,0.55)", color: "rgba(255,255,255,0.85)" }}
            >
              Consulté
            </span>
          )}
        </div>

        {/* Top-right: photo count */}
        {mediaCount !== undefined && mediaCount > 1 && (
          <span
            className="absolute end-2 top-2 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm"
            style={{ background: "rgba(28,28,30,0.55)", color: "rgba(255,255,255,0.9)" }}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
            {mediaCount}
          </span>
        )}

        {/* Bottom-left: agency logo */}
        {agencyLogo && (
          <div
            className="absolute bottom-2 start-2 h-8 w-8 overflow-hidden rounded-full border-2 border-white"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
          >
            <img src={agencyLogo} alt={listing.agency_name} className="h-full w-full object-cover" />
          </div>
        )}
      </Link>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Location */}
        <p
          className="mb-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--or)" }}
        >
          {listing.wilaya_name}
          {listing.commune_name ? ` · ${listing.commune_name}` : ""}
        </p>

        {/* Title */}
        <Link href={`/l/${listing.slug}`}>
          <h3
            className="mb-2 line-clamp-2 text-sm font-semibold leading-snug transition-colors"
            style={{ color: "var(--text-dark)", fontFamily: "var(--font-display)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--or-deep)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dark)")}
          >
            {listing.title}
          </h3>
        </Link>

        {/* Type badges */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span
            className="rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
            style={{ background: "var(--amber-glow)", color: "var(--amber)" }}
          >
            {tListings(listing.listing_type)}
          </span>
          <span
            className="rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
            style={{ background: "var(--or-ghost)", color: "var(--or)" }}
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

        {/* Price */}
        <div className="mb-3">
          <p
            className="text-lg font-semibold tracking-tight"
            style={{ color: "var(--text-dark)", fontFamily: "var(--font-display)" }}
          >
            {formatPrice(listing.current_price, listing.currency)}
          </p>
          {listing.surface_m2 !== null && listing.surface_m2 > 0 && listing.current_price > 0 && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {Math.round(listing.current_price / listing.surface_m2).toLocaleString("fr-DZ")} {listing.currency}/m²
            </p>
          )}
        </div>

        {/* Meta pills */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {listing.rooms !== null && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs"
              style={{ background: "var(--ivoire-warm)", color: "var(--text-body)" }}
            >
              {listing.rooms} {tListings("rooms")}
            </span>
          )}
          {listing.surface_m2 !== null && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs"
              style={{ background: "var(--ivoire-warm)", color: "var(--text-body)" }}
            >
              {listing.surface_m2} m²
            </span>
          )}
        </div>

        {/* Footer: agency + contact button */}
        <div
          className="mt-auto flex items-center justify-between border-t pt-3"
          style={{ borderColor: "var(--ivoire-border)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {agencyLogo ? (
              <img src={agencyLogo} alt={listing.agency_name} className="h-5 w-5 rounded-full object-cover shrink-0" />
            ) : (
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ background: "var(--or-ghost)", color: "var(--or)" }}
              >
                {listing.agency_name.charAt(0).toUpperCase()}
              </span>
            )}
            <p className="truncate text-xs font-medium" style={{ color: "var(--text-body)" }}>
              {listing.agency_name}
            </p>
          </div>

          {/* Contact direct — JE signature feature */}
          {agencyPhone ? (
            <a
              href={`tel:${agencyPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--onyx)", color: "var(--ivoire)" }}
              title={`Appeler ${listing.agency_name}`}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Contacter
            </a>
          ) : (
            <Link
              href={`/l/${listing.slug}`}
              className="shrink-0 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{ color: "var(--or)", background: "var(--or-ghost)" }}
            >
              Voir
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
  results,
  totalCount,
  page,
  pageSize,
  viewedIds = [],
  highlightedId,
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
      <div className="flex flex-col items-center justify-center py-20">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "var(--or-ghost)" }}
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--or)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803M10.5 7.5v6m3-3h-6" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>{t("no_results")}</p>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Essayez d&apos;élargir vos critères de recherche</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header: count + sort */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--text-body)" }}>
          <span className="font-semibold" style={{ color: "var(--text-dark)" }}>{totalCount.toLocaleString("fr-DZ")}</span>{" "}
          {t("results_count", { count: totalCount })}
        </p>
        <select
          value={searchParams.get("sort") ?? "newest"}
          onChange={(e) => handleSortChange(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-sm outline-none"
          style={{
            background: "var(--ivoire)",
            borderColor: "var(--ivoire-border)",
            color: "var(--text-body)",
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

      {/* Grid — single-column in split layout, multi-col otherwise */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {results.map((listing) => (
          <div
            key={listing.id}
            className="transition-all"
            style={
              highlightedId === listing.id
                ? { outline: "2px solid var(--onyx)", borderRadius: "12px" }
                : undefined
            }
          >
            <SearchResultCard
              listing={listing}
              isViewed={viewedIds.includes(listing.id)}
            />
          </div>
        ))}
      </div>


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigateToPage(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: "var(--ivoire-border)", color: "var(--text-body)", background: "var(--ivoire)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {t("previous")}
          </button>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => navigateToPage(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: "var(--ivoire-border)", color: "var(--text-body)", background: "var(--ivoire)" }}
          >
            {t("next")}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
