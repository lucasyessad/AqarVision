import { getTranslations, setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

import { searchListingsAction } from "@/features/marketplace/actions/search.action";
import { getWilayas } from "@/features/marketplace/services/search.service";
import { getViewedListingIds } from "@/features/marketplace/actions/view-history.action";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
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
  if (sp.wilaya_code) filters.wilaya_code = String(sp.wilaya_code);
  if (sp.commune_id) filters.commune_id = Number(sp.commune_id);
  if (sp.price_min) filters.price_min = Number(sp.price_min);
  if (sp.price_max) filters.price_max = Number(sp.price_max);
  if (sp.rooms_min) filters.rooms_min = Number(sp.rooms_min);
  if (sp.surface_min) filters.surface_min = Number(sp.surface_min);
  if (sp.sort) filters.sort = String(sp.sort);

  const supabase = await createClient();
  const [result, wilayas, viewedIds] = await Promise.all([
    searchListingsAction(filters),
    getWilayas(supabase),
    getViewedListingIds(),
  ]);

  const data = result.success
    ? result.data
    : { results: [], total_count: 0, page: 1, page_size: 20 };

  return (
    <>
      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}><MarketingHeaderWrapper locale={locale} /></Suspense>
      <SearchPageClient
        results={data.results}
        totalCount={data.total_count}
        page={data.page}
        pageSize={data.page_size}
        locale={locale}
        wilayas={wilayas}
        viewedIds={viewedIds}
      />
      <MarketingFooter locale={locale} />
    </>
  );
}
