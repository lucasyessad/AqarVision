"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, GitCompareArrows, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ComparisonTable } from "@/components/marketplace/ComparisonTable";
import type { ListingCard as ListingCardType } from "@/features/listings/types/listing.types";

export interface SearchResultsProps {
  listings: ListingCardType[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onListingHover?: (id: string | null) => void;
  className?: string;
}

const MAX_COMPARE = 3;

export function SearchResults({
  listings,
  total,
  page,
  totalPages,
  onPageChange,
  onListingHover,
  className,
}: SearchResultsProps) {
  const t = useTranslations("search");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((cid) => cid !== id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  const compareListings = listings.filter((l) => compareIds.includes(l.id));

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Results header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          <span className="font-semibold text-stone-900 dark:text-stone-50">
            {total.toLocaleString("fr-DZ")}
          </span>{" "}
          {t("resultsCount")}
        </p>

        {/* Comparison button */}
        {compareIds.length >= 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(true)}
          >
            <GitCompareArrows size={14} aria-hidden="true" />
            {t("compare")} ({compareIds.length})
          </Button>
        )}
      </div>

      {/* Listing grid */}
      {listings.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="relative"
              onMouseEnter={() => onListingHover?.(listing.id)}
              onMouseLeave={() => onListingHover?.(null)}
            >
              {/* Compare checkbox */}
              <div className="absolute end-3 bottom-3 z-10">
                <label
                  className={cn(
                    "flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors",
                    compareIds.includes(listing.id)
                      ? "bg-teal-600 text-white dark:bg-teal-500"
                      : "bg-white/90 text-stone-700 backdrop-blur-sm hover:bg-white dark:bg-stone-900/90 dark:text-stone-300 dark:hover:bg-stone-900"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={compareIds.includes(listing.id)}
                    onChange={() => toggleCompare(listing.id)}
                    disabled={
                      !compareIds.includes(listing.id) &&
                      compareIds.length >= MAX_COMPARE
                    }
                    className="sr-only"
                    aria-label={t("compareLabel")}
                  />
                  <GitCompareArrows size={12} aria-hidden="true" />
                  {compareIds.includes(listing.id)
                    ? t("compareSelected")
                    : t("compareAdd")}
                </label>
              </div>

              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-stone-100 p-4 dark:bg-stone-800">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-stone-400 dark:text-stone-500"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <p className="text-lg font-medium text-stone-700 dark:text-stone-300">
            {t("noResults")}
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {t("noResultsHint")}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            {t("pagination.previous")}
          </Button>

          <span className="text-sm text-stone-600 dark:text-stone-400">
            {t("pagination.pageOf", { page, totalPages })}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            {t("pagination.next")}
            <ArrowRight size={14} aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Compare selected indicator */}
      {compareIds.length > 0 && !showComparison && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white p-3 shadow-lg dark:border-stone-700 dark:bg-stone-900 lg:bottom-0">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <p className="text-sm text-stone-700 dark:text-stone-300">
              {t("compareCount", { count: compareIds.length, max: MAX_COMPARE })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCompareIds([])}
              >
                <X size={14} aria-hidden="true" />
                {t("compareClear")}
              </Button>
              {compareIds.length >= 2 && (
                <Button
                  size="sm"
                  onClick={() => setShowComparison(true)}
                >
                  <GitCompareArrows size={14} aria-hidden="true" />
                  {t("compare")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison overlay */}
      {showComparison && compareListings.length >= 2 && (
        <ComparisonTable
          listings={compareListings}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
