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
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const mapListings: MapListing[] = results.flatMap((r) => {
    const rAny = r as SearchResultDto & { lat?: number; lng?: number };
    if (typeof rAny.lat === "number" && typeof rAny.lng === "number") {
      return [{
        id: r.id,
        lat: rAny.lat,
        lng: rAny.lng,
        price: r.current_price,
        currency: r.currency,
        title: r.title,
        slug: r.slug,
      }];
    }
    return [];
  });

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    void bounds;
  }, []);

  const toggleFilters = () => {
    setShowFilters((p) => !p);
    setShowFiltersSidebar((p) => !p);
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-deep)" }}>

      {/* ── Top navigation ─────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(253, 252, 250, 0.92)",
          backdropFilter: "blur(20px)",
          borderColor: "var(--border-light)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" locale={locale} className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight">
            <span style={{ color: "var(--text-primary)" }}>Aqar</span>
            <span
              className="aqar-pulse inline-block h-2 w-2 rounded-full"
              style={{ background: "var(--coral)" }}
            />
          </Link>

          {/* Language switcher */}
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </nav>

      {/* ── Hero search ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-4 pb-10 pt-12 text-center"
        style={{ background: "var(--bg-primary)" }}
      >
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: "700px",
            height: "700px",
            background: "radial-gradient(circle, rgba(232,114,92,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium"
          style={{
            background: "var(--cyan-ghost)",
            borderColor: "var(--coral-glow)",
            color: "var(--coral)",
          }}
        >
          <span className="aqar-pulse inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--coral)" }} />
          {t("title")}
        </div>

        <h1 className="aqar-fade-up relative mx-auto mb-3 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}
        >
          {t("title")}
        </h1>
        <p className="relative mx-auto mb-8 max-w-md text-sm" style={{ color: "var(--text-secondary)" }}>
          {t("subtitle")}
        </p>

        <div className="relative">
          <SearchBar />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1320px] px-4 py-6">

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Filters toggle */}
          <button
            type="button"
            onClick={toggleFilters}
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            <span className="hidden sm:inline">
              {showFiltersSidebar ? t("hide_filters") : t("show_filters")}
            </span>
          </button>

          {/* List / Map toggle */}
          <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
            {(["list", "map"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  background: viewMode === mode ? "var(--bg-tertiary)" : "transparent",
                  color: viewMode === mode ? "var(--text-primary)" : "var(--text-secondary)",
                  borderLeft: mode === "map" ? `1px solid var(--border)` : undefined,
                }}
                aria-pressed={viewMode === mode}
              >
                {mode === "list" ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                )}
                {mode === "list" ? "Liste" : "Carte"}
              </button>
            ))}
          </div>

          {/* Alert button */}
          <div className="ms-auto">
            <SearchAlertButton />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <SearchFilters
            isOpen={showFilters}
            isDesktopVisible={showFiltersSidebar}
            onToggle={toggleFilters}
            wilayas={wilayas}
          />

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {viewMode === "map" ? (
              <div className="mb-6">
                <SearchMap listings={mapListings} onBoundsChange={handleBoundsChange} />
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
