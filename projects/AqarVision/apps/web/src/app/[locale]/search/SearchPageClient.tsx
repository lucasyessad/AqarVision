"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SearchBar, SearchResults, SearchFilters, SearchMap } from "@/features/marketplace/components";
import type { SearchResultDto } from "@/features/marketplace/types/search.types";

interface SearchPageClientProps {
  results: SearchResultDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export function SearchPageClient({
  results,
  totalCount,
  page,
  pageSize,
}: SearchPageClientProps) {
  const t = useTranslations("search");
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);

  return (
    <main className="min-h-screen bg-[#f7fafc]">
      {/* Hero search bar */}
      <div className="bg-[#1a365d] px-4 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-2xl font-bold md:text-3xl">{t("title")}</h1>
          <SearchBar />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Mobile toggles */}
        <div className="mb-4 flex gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[#2d3748] transition-colors hover:bg-gray-100"
          >
            {showFilters ? t("hide_filters") : t("show_filters")}
          </button>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[#2d3748] transition-colors hover:bg-gray-100"
          >
            {showMap ? t("hide_map") : t("show_map")}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <SearchFilters
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Map placeholder (desktop always visible, mobile toggle) */}
            <div className={`mb-6 ${showMap ? "block" : "hidden"} lg:block`}>
              <SearchMap />
            </div>

            {/* Results grid */}
            <SearchResults
              results={results}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
