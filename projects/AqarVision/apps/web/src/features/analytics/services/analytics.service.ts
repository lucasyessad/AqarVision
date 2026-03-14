import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgencyStatsDto, AnalyticsSummary } from "../types/analytics.types";

/* ------------------------------------------------------------------ */
/*  Get daily agency stats for a date range                            */
/* ------------------------------------------------------------------ */

export async function getAgencyStats(
  supabase: SupabaseClient,
  agencyId: string,
  startDate: string,
  endDate: string
): Promise<AgencyStatsDto[]> {
  const { data, error } = await supabase
    .from("agency_stats_daily")
    .select("day, total_views, total_leads, total_new_listings")
    .eq("agency_id", agencyId)
    .gte("day", startDate)
    .lte("day", endDate)
    .order("day", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    day: row.day as string,
    total_views: (row.total_views as number) ?? 0,
    total_leads: (row.total_leads as number) ?? 0,
    total_new_listings: (row.total_new_listings as number) ?? 0,
  }));
}

/* ------------------------------------------------------------------ */
/*  Get 30-day summary with trend comparison                           */
/* ------------------------------------------------------------------ */

export async function getAgencySummary(
  supabase: SupabaseClient,
  agencyId: string
): Promise<AnalyticsSummary> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const formatDate = (d: Date) => d.toISOString().split("T")[0] ?? "";

  const [currentStats, previousStats] = await Promise.all([
    getAgencyStats(supabase, agencyId, formatDate(thirtyDaysAgo), formatDate(now)),
    getAgencyStats(supabase, agencyId, formatDate(sixtyDaysAgo), formatDate(thirtyDaysAgo)),
  ]);

  const sum = (arr: AgencyStatsDto[], key: keyof Omit<AgencyStatsDto, "day">) =>
    arr.reduce((acc, row) => acc + row[key], 0);

  const currentViews = sum(currentStats, "total_views");
  const currentLeads = sum(currentStats, "total_leads");
  const currentListings = sum(currentStats, "total_new_listings");
  const currentConversion = currentViews > 0 ? (currentLeads / currentViews) * 100 : 0;

  const previousViews = sum(previousStats, "total_views");
  const previousLeads = sum(previousStats, "total_leads");
  const previousListings = sum(previousStats, "total_new_listings");
  const previousConversion = previousViews > 0 ? (previousLeads / previousViews) * 100 : 0;

  const trend = (current: number, previous: number) =>
    previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;

  return {
    total_views: currentViews,
    total_leads: currentLeads,
    total_new_listings: currentListings,
    conversion_rate: Math.round(currentConversion * 100) / 100,
    trend_views: Math.round(trend(currentViews, previousViews) * 10) / 10,
    trend_leads: Math.round(trend(currentLeads, previousLeads) * 10) / 10,
    trend_new_listings: Math.round(trend(currentListings, previousListings) * 10) / 10,
    trend_conversion: Math.round(trend(currentConversion, previousConversion) * 10) / 10,
  };
}

/* ------------------------------------------------------------------ */
/*  Get listing view stats by day                                      */
/* ------------------------------------------------------------------ */

export async function getListingViewStats(
  supabase: SupabaseClient,
  listingId: string
): Promise<{ day: string; count: number }[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from("listing_views")
    .select("viewed_at")
    .eq("listing_id", listingId)
    .gte("viewed_at", thirtyDaysAgo.toISOString());

  if (error || !data) {
    return [];
  }

  // Aggregate by day
  const countsByDay: Record<string, number> = {};
  for (const row of data) {
    const day = (row.viewed_at as string).split("T")[0] ?? "";
    countsByDay[day] = (countsByDay[day] ?? 0) + 1;
  }

  return Object.entries(countsByDay)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));
}
