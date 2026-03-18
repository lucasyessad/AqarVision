"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { SearchFilters } from "@/components/marketplace/SearchFilters";
import { SearchResults } from "@/components/marketplace/SearchResults";
import { MapView, type MapMarker } from "@/components/marketplace/MapView";
import { searchAction } from "@/features/marketplace/actions/search.action";
import { createAlertAction } from "@/features/marketplace/actions/alert.action";
import type { SearchFilters as SearchFiltersType } from "@/features/marketplace/schemas/search.schema";
import type { ListingCard } from "@/features/listings/types/listing.types";

interface SearchPageClientProps {
  initialListings: ListingCard[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  initialMarkers: MapMarker[];
  initialFilters: SearchFiltersType;
  locale: string;
}

export function SearchPageClient({
  initialListings,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialMarkers,
  initialFilters,
  locale,
}: SearchPageClientProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [listings, setListings] = useState(initialListings);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [markers, setMarkers] = useState(initialMarkers);
  const [currentFilters, setCurrentFilters] = useState(initialFilters);
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);

  // Alert dialog
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertName, setAlertName] = useState("");
  const [alertFrequency, setAlertFrequency] = useState<"instant" | "daily" | "weekly">("daily");
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  async function handleFiltersChange(newFilters: SearchFiltersType) {
    setCurrentFilters(newFilters);
    startTransition(async () => {
      const result = await searchAction(newFilters, locale);
      if (result.success) {
        setListings(result.data.listings);
        setTotal(result.data.total);
        setPage(result.data.page);
        setTotalPages(result.data.totalPages);
        setMarkers(
          result.data.listings.map((l) => ({
            id: l.id,
            lat: 36.753 + (Math.random() - 0.5) * 2,
            lng: 3.042 + (Math.random() - 0.5) * 2,
            price: l.price,
            type: l.listing_type,
          }))
        );
      }
    });
  }

  function handlePageChange(newPage: number) {
    const newFilters = { ...currentFilters, page: newPage };
    setCurrentFilters(newFilters);
    handleFiltersChange(newFilters);

    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleMarkerClick(id: string) {
    const listing = listings.find((l) => l.id === id);
    if (listing) {
      router.push(`/annonce/${listing.slug}`);
    }
  }

  async function handleCreateAlert() {
    if (!alertName.trim()) return;

    setAlertLoading(true);
    setAlertMessage(null);

    const result = await createAlertAction({
      name: alertName.trim(),
      frequency: alertFrequency,
      filters: currentFilters,
    });

    setAlertLoading(false);

    if (result.success) {
      setAlertMessage(t("alert.success"));
      setTimeout(() => {
        setShowAlertDialog(false);
        setAlertMessage(null);
        setAlertName("");
      }, 1500);
    } else if (result.code === "UNAUTHORIZED") {
      // Redirect to login, then back to search with current filters
      const returnUrl = `/search?${new URLSearchParams(currentFilters as unknown as Record<string, string>).toString()}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
    } else {
      setAlertMessage(result.message);
    }
  }

  return (
    <>
      {/* Filters bar */}
      <SearchFilters onFiltersChange={handleFiltersChange} />

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Save search alert button */}
        <div className="mb-4 flex items-center justify-between">
          <div />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAlertDialog(true)}
          >
            <Bell size={14} aria-hidden="true" />
            {t("saveSearch")}
          </Button>
        </div>

        {/* Split view: results + map */}
        <div className="flex gap-6">
          {/* Results column */}
          <div className={cn("w-full lg:w-3/5", isPending && "opacity-60 transition-opacity")}>
            <SearchResults
              listings={listings}
              total={total}
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onListingHover={setHoveredListingId}
            />
          </div>

          {/* Map column - desktop sticky */}
          <div className="hidden lg:block lg:w-2/5">
            <div className="sticky top-4 h-[calc(100vh-12rem)]">
              <MapView
                markers={markers}
                onMarkerClick={handleMarkerClick}
                selectedMarkerId={hoveredListingId}
                mobileToggle={false}
              />
            </div>
          </div>
        </div>

        {/* Mobile map toggle (rendered by MapView) */}
        <div className="lg:hidden">
          <MapView
            markers={markers}
            onMarkerClick={handleMarkerClick}
            selectedMarkerId={hoveredListingId}
            mobileToggle={true}
            className="h-0 w-0 overflow-hidden"
          />
        </div>
      </div>

      {/* Alert creation dialog */}
      <Dialog
        open={showAlertDialog}
        onClose={() => setShowAlertDialog(false)}
        title={t("alert.title")}
      >
        <div className="space-y-4">
          <Input
            label={t("alert.name")}
            placeholder={t("alert.namePlaceholder")}
            value={alertName}
            onChange={(e) => setAlertName(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {t("alert.frequency")}
            </span>
            <div className="flex gap-2">
              {(
                [
                  { value: "instant", labelKey: "alert.instant" },
                  { value: "daily", labelKey: "alert.daily" },
                  { value: "weekly", labelKey: "alert.weekly" },
                ] as const
              ).map(({ value, labelKey }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAlertFrequency(value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
                    alertFrequency === value
                      ? "bg-teal-600 text-white dark:bg-teal-500"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  )}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>

          {alertMessage && (
            <p
              className={cn(
                "text-sm",
                alertMessage === t("alert.success")
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {alertMessage}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowAlertDialog(false)}
            >
              {t("filters.clearAll")}
            </Button>
            <Button
              onClick={handleCreateAlert}
              loading={alertLoading}
              disabled={!alertName.trim()}
            >
              {t("alert.create")}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
