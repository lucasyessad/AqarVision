"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { SearchBar, SearchResults, SearchFilters, SearchMap } from "@/features/marketplace/components";
import { SearchAlertButton } from "@/features/marketplace/components/SearchAlertButton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import type { SearchResultDto } from "@/features/marketplace/types/search.types";
import type { MapBounds } from "@/features/marketplace/schemas/search.schema";
import type { MapListing } from "@/features/marketplace/components/SearchMap";

interface SearchPageClientProps {
  results: SearchResultDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  locale: string;
  wilayas: { code: string; name: string }[];
  viewedIds: string[];
}

export function SearchPageClient({
  results,
  totalCount,
  page,
  pageSize,
  locale,
  wilayas,
  viewedIds,
}: SearchPageClientProps) {
  const t = useTranslations("search");
  const [showFilters, setShowFilters] = useState(false);
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(true);
  // "list" | "map" view mode
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Build map listings from search results (only those with PostGIS location data)
  // SearchResultDto does not expose lat/lng directly (PostGIS geometry).
  // When the backend returns coordinates, they should be added to SearchResultDto.
  // For now we cast safely — listings without coordinates are filtered out.
  const mapListings: MapListing[] = results.flatMap((r) => {
    const rAny = r as SearchResultDto & { lat?: number; lng?: number };
    if (typeof rAny.lat === "number" && typeof rAny.lng === "number") {
      return [
        {
          id: r.id,
          lat: rAny.lat,
          lng: rAny.lng,
          price: r.current_price,
          currency: r.currency,
          title: r.title,
          slug: r.slug,
        },
      ];
    }
    return [];
  });

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    // Bounds are handled via URL search params update on the parent page.
    // Here we could trigger a client-side re-fetch or navigate.
    // For now, log bounds — full integration with router will be done
    // once the server action supports client-side invocation.
    void bounds; // suppress unused warning — intentional placeholder
  }, []);

  return (
    <main className="min-h-screen bg-[#f7fafc]">
      {/* Top navigation bar: logo + language switcher */}
      <nav className="bg-[#1a365d] border-b border-white/10 px-4 py-2">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Logo */}
          <Link href="/" locale={locale} className="flex items-center gap-2">
            <span className="font-bold text-white">
              Aqar<span className="text-[#d4af37]">Search</span>
            </span>
          </Link>

          {/* Language switcher */}
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </nav>

      {/* Hero search bar */}
      <div className="bg-[#1a365d] px-4 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-2xl font-bold md:text-3xl">{t("title")}</h1>
          <SearchBar />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Toolbar: filters toggle + List/Map toggle + alert */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Toggle sidebar filters — visible on all screen sizes */}
          <button
            type="button"
            onClick={() => {
              // On mobile: use showFilters (inline block display)
              // On desktop: use showFiltersSidebar
              setShowFilters((prev) => !prev);
              setShowFiltersSidebar((prev) => !prev);
            }}
            title={showFiltersSidebar ? t("hide_filters") : t("show_filters")}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[#2d3748] transition-colors hover:bg-gray-100"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
              />
            </svg>
            <span className="hidden sm:inline">
              {showFiltersSidebar ? t("hide_filters") : t("show_filters")}
            </span>
          </button>

          {/* List / Map view toggle */}
          <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-[#1a365d] text-white"
                  : "text-[#2d3748] hover:bg-gray-50"
              }`}
              aria-pressed={viewMode === "list"}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Liste
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-s border-gray-300 ${
                viewMode === "map"
                  ? "bg-[#1a365d] text-white"
                  : "text-[#2d3748] hover:bg-gray-50"
              }`}
              aria-pressed={viewMode === "map"}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              Carte
            </button>
          </div>

          {/* Search alert button */}
          <div className="ms-auto">
            <SearchAlertButton />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters — controlled by showFiltersSidebar on desktop, showFilters on mobile */}
          <SearchFilters
            isOpen={showFilters}
            isDesktopVisible={showFiltersSidebar}
            onToggle={() => {
              setShowFilters((prev) => !prev);
              setShowFiltersSidebar((prev) => !prev);
            }}
            wilayas={wilayas}
          />

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {viewMode === "map" ? (
              /* Full-height map view */
              <div className="mb-6">
                <SearchMap
                  listings={mapListings}
                  onBoundsChange={handleBoundsChange}
                />
                {/* Show results below map in map mode */}
                <div className="mt-4">
                  <SearchResults
                    results={results}
                    totalCount={totalCount}
                    page={page}
                    pageSize={pageSize}
                    viewedIds={viewedIds}
                  />
                </div>
              </div>
            ) : (
              /* List-only view — map hidden */
              <SearchResults
                results={results}
                totalCount={totalCount}
                page={page}
                pageSize={pageSize}
                viewedIds={viewedIds}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
