import { getTranslations, setRequestLocale } from "next-intl/server";

import { searchListingsAction } from "@/features/marketplace/actions/search.action";
import { SearchPageClient } from "./SearchPageClient";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      languages: {
        fr: `/fr/search`,
        ar: `/ar/search`,
        en: `/en/search`,
        es: `/es/search`,
      },
    },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  // Build filters from URL params
  const filters: Record<string, unknown> = {
    locale,
    page: sp.page ? Number(sp.page) : 1,
    page_size: sp.page_size ? Number(sp.page_size) : 20,
  };

  if (sp.q) filters.q = String(sp.q);
  if (sp.listing_type) filters.listing_type = String(sp.listing_type);
  if (sp.property_type) filters.property_type = String(sp.property_type);
  if (sp.wilaya_code) filters.wilaya_code = Number(sp.wilaya_code);
  if (sp.commune_id) filters.commune_id = Number(sp.commune_id);
  if (sp.price_min) filters.price_min = Number(sp.price_min);
  if (sp.price_max) filters.price_max = Number(sp.price_max);
  if (sp.rooms_min) filters.rooms_min = Number(sp.rooms_min);
  if (sp.surface_min) filters.surface_min = Number(sp.surface_min);

  const result = await searchListingsAction(filters);

  const data = result.success
    ? result.data
    : { results: [], total_count: 0, page: 1, page_size: 20 };

  return (
    <SearchPageClient
      results={data.results}
      totalCount={data.total_count}
      page={data.page}
      pageSize={data.page_size}
    />
  );
}

function SearchPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <div className="bg-[#1a365d] px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="h-10 w-64 animate-pulse rounded bg-white/20" />
          <div className="mt-4 h-12 animate-pulse rounded-lg bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
