import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AgencyDailyStats,
  AnalyticsSummary,
  PriceHistoryPoint,
} from "../types/analytics.types";

export async function getAgencyAnalytics(
  supabase: SupabaseClient,
  agencyId: string,
  from: Date,
  to: Date
): Promise<AnalyticsSummary> {
  const { data: currentStats } = await supabase
    .from("agency_stats_daily")
    .select("total_views, total_leads, total_contacts, new_listings")
    .eq("agency_id", agencyId)
    .gte("date", from.toISOString().split("T")[0])
    .lte("date", to.toISOString().split("T")[0]);

  const stats = currentStats ?? [];
  const totalViews = stats.reduce((sum, s) => sum + (s.total_views ?? 0), 0);
  const totalLeads = stats.reduce((sum, s) => sum + (s.total_leads ?? 0), 0);
  const totalContacts = stats.reduce(
    (sum, s) => sum + (s.total_contacts ?? 0),
    0
  );

  const { count: totalListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .not("status", "eq", "archived");

  // Calculate trend (compare with previous period)
  const periodMs = to.getTime() - from.getTime();
  const prevFrom = new Date(from.getTime() - periodMs);
  const prevTo = new Date(from.getTime() - 1);

  const { data: prevStats } = await supabase
    .from("agency_stats_daily")
    .select("total_views, total_leads")
    .eq("agency_id", agencyId)
    .gte("date", prevFrom.toISOString().split("T")[0])
    .lte("date", prevTo.toISOString().split("T")[0]);

  const prevViews = (prevStats ?? []).reduce(
    (sum, s) => sum + (s.total_views ?? 0),
    0
  );
  const prevLeads = (prevStats ?? []).reduce(
    (sum, s) => sum + (s.total_leads ?? 0),
    0
  );

  function calcTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  return {
    totalViews,
    totalLeads,
    totalContacts,
    totalListings: totalListings ?? 0,
    viewsTrend: calcTrend(totalViews, prevViews),
    leadsTrend: calcTrend(totalLeads, prevLeads),
  };
}

export async function getDailyStats(
  supabase: SupabaseClient,
  agencyId: string,
  from: Date,
  to: Date
): Promise<AgencyDailyStats[]> {
  const { data, error } = await supabase
    .from("agency_stats_daily")
    .select("*")
    .eq("agency_id", agencyId)
    .gte("date", from.toISOString().split("T")[0])
    .lte("date", to.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AgencyDailyStats[];
}

export async function getPriceHistory(
  supabase: SupabaseClient,
  listingId: string
): Promise<PriceHistoryPoint[]> {
  const { data, error } = await supabase
    .from("listing_price_history")
    .select("new_price, changed_at, reason")
    .eq("listing_id", listingId)
    .order("changed_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    date: row.changed_at as string,
    price: row.new_price as number,
    reason: row.reason as string | null,
  }));
}
