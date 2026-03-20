import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { searchFiltersSchema, type SearchFilters } from "@/features/marketplace/schemas/search.schema";
import { searchListings } from "@/features/marketplace/services/search.service";
import { SearchPageClient } from "./search-page-client";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams: searchParamsPromise,
}: SearchPageProps): Promise<Metadata> {
  const t = await getTranslations("metadata");
  const searchParams = await searchParamsPromise;

  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const title = query ? `${query} — ${t("search")}` : t("search");

  return {
    title,
    description: t("search"),
  };
}

export default async function SearchPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: SearchPageProps) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const locale = params.locale;
  const t = await getTranslations("search");

  // Flatten searchParams for Zod parsing
  const flatParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    flatParams[key] = value;
  }

  // Parse and validate search filters
  const parsed = searchFiltersSchema.safeParse(flatParams);
  const filters: SearchFilters = parsed.success
    ? parsed.data
    : { sort: "newest", page: 1, limit: 20 };

  // Fetch listings
  const supabase = await createClient();
  let result;
  try {
    result = await searchListings(supabase, filters, locale);
  } catch {
    result = { listings: [], total: 0, page: 1, totalPages: 0 };
  }

  // Extract map markers from listings that have coordinates
  const markers = result.listings
    .filter((listing) => listing.latitude !== null && listing.longitude !== null)
    .map((listing) => ({
      id: listing.id,
      lat: listing.latitude as number,
      lng: listing.longitude as number,
      price: listing.price,
      type: listing.listing_type,
    }));

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-20 md:pt-24">
      {/* Search header */}
      <div className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-stone-900 sm:text-2xl dark:text-stone-50">
            {t("title")}
          </h1>
          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <SearchPageClient
        initialListings={result.listings}
        initialTotal={result.total}
        initialPage={result.page}
        initialTotalPages={result.totalPages}
        initialMarkers={markers}
        initialFilters={filters}
        locale={locale}
      />
    </div>
  );
}
