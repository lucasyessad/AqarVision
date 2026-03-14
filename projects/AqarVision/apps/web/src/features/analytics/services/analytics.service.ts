import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AgencyStatsDto,
  AnalyticsSummary,
  DashboardStats,
} from "../types/analytics.types";

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
    .select("stat_date, total_views, total_leads, total_listings")
    .eq("agency_id", agencyId)
    .gte("stat_date", startDate)
    .lte("stat_date", endDate)
    .order("stat_date", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    stat_date: row.stat_date as string,
    total_views: (row.total_views as number) ?? 0,
    total_leads: (row.total_leads as number) ?? 0,
    total_listings: (row.total_listings as number) ?? 0,
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

  const sum = (arr: AgencyStatsDto[], key: keyof Omit<AgencyStatsDto, "stat_date">) =>
    arr.reduce((acc, row) => acc + row[key], 0);

  const currentViews = sum(currentStats, "total_views");
  const currentLeads = sum(currentStats, "total_leads");
  const currentListings = sum(currentStats, "total_listings");
  const currentConversion = currentViews > 0 ? (currentLeads / currentViews) * 100 : 0;

  const previousViews = sum(previousStats, "total_views");
  const previousLeads = sum(previousStats, "total_leads");
  const previousListings = sum(previousStats, "total_listings");
  const previousConversion = previousViews > 0 ? (previousLeads / previousViews) * 100 : 0;

  const trend = (current: number, previous: number) =>
    previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;

  return {
    total_views: currentViews,
    total_leads: currentLeads,
    total_listings: currentListings,
    conversion_rate: Math.round(currentConversion * 100) / 100,
    trend_views: Math.round(trend(currentViews, previousViews) * 10) / 10,
    trend_leads: Math.round(trend(currentLeads, previousLeads) * 10) / 10,
    trend_listings: Math.round(trend(currentListings, previousListings) * 10) / 10,
    trend_conversion: Math.round(trend(currentConversion, previousConversion) * 10) / 10,
  };
}

/* ------------------------------------------------------------------ */
/*  Get dashboard stats: active listings, leads this month, views 30d  */
/* ------------------------------------------------------------------ */

export async function getDashboardStats(
  supabase: SupabaseClient,
  agencyId: string
): Promise<DashboardStats> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const formatDate = (d: Date) => d.toISOString().split("T")[0] ?? "";

  const [
    activeListingsResult,
    leadsThisMonthResult,
    leadsPrevMonthResult,
    statsCurrentResult,
    statsPreviousResult,
  ] = await Promise.all([
    // Count active (published) listings
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agencyId)
      .eq("status", "published"),

    // Count leads this month
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agencyId)
      .gte("created_at", startOfMonth.toISOString()),

    // Count leads previous month (for trend)
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agencyId)
      .gte("created_at", startOfPrevMonth.toISOString())
      .lte("created_at", endOfPrevMonth.toISOString()),

    // Daily stats for last 30 days
    getAgencyStats(supabase, agencyId, formatDate(thirtyDaysAgo), formatDate(now)),

    // Daily stats for the 30 days before that (for trend)
    getAgencyStats(supabase, agencyId, formatDate(sixtyDaysAgo), formatDate(thirtyDaysAgo)),
  ]);

  const activeListings = activeListingsResult.count ?? 0;
  const leadsThisMonth = leadsThisMonthResult.count ?? 0;
  const leadsPrevMonth = leadsPrevMonthResult.count ?? 0;

  const sumViews = (arr: AgencyStatsDto[]) =>
    arr.reduce((acc, row) => acc + row.total_views, 0);

  const views30d = sumViews(statsCurrentResult);
  const viewsPrev30d = sumViews(statsPreviousResult);

  const conversionCurrent = views30d > 0 ? (leadsThisMonth / views30d) * 100 : 0;
  const conversionPrev = viewsPrev30d > 0 ? (leadsPrevMonth / viewsPrev30d) * 100 : 0;

  const calcTrend = (current: number, previous: number) =>
    previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : current > 0 ? 100 : 0;

  return {
    active_listings: activeListings,
    leads_this_month: leadsThisMonth,
    views_30d: views30d,
    conversion_rate: Math.round(conversionCurrent * 100) / 100,
    trend_views: calcTrend(views30d, viewsPrev30d),
    trend_leads: calcTrend(leadsThisMonth, leadsPrevMonth),
    trend_listings: 0, // actif count — pas de tendance directe disponible sans snapshots
    trend_conversion: Math.round(calcTrend(conversionCurrent, conversionPrev) * 10) / 10,
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
    .select("created_at")
    .eq("listing_id", listingId)
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (error || !data) {
    return [];
  }

  // Aggregate by day
  const countsByDay: Record<string, number> = {};
  for (const row of data) {
    const day = (row.created_at as string).split("T")[0] ?? "";
    countsByDay[day] = (countsByDay[day] ?? 0) + 1;
  }

  return Object.entries(countsByDay)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));
}
