import type { SupabaseClient } from "@supabase/supabase-js";

export interface TopListingByViews {
  listing_id: string;
  listing_title: string;
  view_count: number;
}

export interface LeadsBySource {
  source: string;
  count: number;
}

export interface LeadsByStatus {
  status: string;
  count: number;
}

export interface AdvancedAnalyticsData {
  topListings: TopListingByViews[];
  leadsBySource: LeadsBySource[];
  leadsByStatus: LeadsByStatus[];
}

const SOURCE_LABELS: Record<string, string> = {
  platform: "Plateforme",
  whatsapp: "WhatsApp",
  phone: "Téléphone",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  qualified: "Qualifié",
  closed: "Fermé",
};

/* ------------------------------------------------------------------ */
/*  getAdvancedAnalytics — top listings, leads by source and status     */
/* ------------------------------------------------------------------ */

export async function getAdvancedAnalytics(
  supabase: SupabaseClient,
  agencyId: string
): Promise<AdvancedAnalyticsData> {
  const [listingViewsResult, leadsBySourceResult, leadsByStatusResult] =
    await Promise.all([
      // Top 5 listings by views (last 90 days)
      supabase
        .from("listing_views")
        .select("listing_id, listings!inner(agency_id, listing_translations(title, locale))")
        .eq("listings.agency_id", agencyId)
        .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1000),

      // Leads by source
      supabase
        .from("leads")
        .select("source")
        .eq("agency_id", agencyId),

      // Leads by status
      supabase
        .from("leads")
        .select("status")
        .eq("agency_id", agencyId),
    ]);

  // ---- Top listings by views ----
  const viewRows = listingViewsResult.data ?? [];
  const viewCounts: Record<string, { count: number; title: string }> = {};

  for (const row of viewRows) {
    const id = row.listing_id as string;
    const listing = row.listings as unknown as Record<string, unknown>;
    const translations = listing.listing_translations as unknown as Array<{
      title: string;
      locale: string;
    }>;
    const title =
      translations?.find((t) => t.locale === "fr")?.title ??
      translations?.[0]?.title ??
      "—";

    if (!viewCounts[id]) {
      viewCounts[id] = { count: 0, title };
    }
    viewCounts[id]!.count += 1;
  }

  const topListings: TopListingByViews[] = Object.entries(viewCounts)
    .map(([listing_id, { count, title }]) => ({
      listing_id,
      listing_title: title,
      view_count: count,
    }))
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5);

  // ---- Leads by source ----
  const sourceMap: Record<string, number> = {};
  for (const row of leadsBySourceResult.data ?? []) {
    const src = row.source as string;
    sourceMap[src] = (sourceMap[src] ?? 0) + 1;
  }
  const leadsBySource: LeadsBySource[] = Object.entries(sourceMap)
    .map(([source, count]) => ({
      source: SOURCE_LABELS[source] ?? source,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // ---- Leads by status ----
  const statusMap: Record<string, number> = {};
  for (const row of leadsByStatusResult.data ?? []) {
    const st = row.status as string;
    statusMap[st] = (statusMap[st] ?? 0) + 1;
  }
  const leadsByStatus: LeadsByStatus[] = Object.entries(statusMap)
    .map(([status, count]) => ({
      status: STATUS_LABELS[status] ?? status,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return { topListings, leadsBySource, leadsByStatus };
}
