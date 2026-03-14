export interface AgencyStatsDto {
  stat_date: string;
  total_views: number;
  total_leads: number;
  total_listings: number;
}

export interface AnalyticsSummary {
  total_views: number;
  total_leads: number;
  total_listings: number;
  conversion_rate: number;
  trend_views: number;
  trend_leads: number;
  trend_listings: number;
  trend_conversion: number;
}

export interface DashboardStats {
  active_listings: number;
  leads_this_month: number;
  views_30d: number;
  conversion_rate: number;
  trend_views: number;
  trend_leads: number;
  trend_listings: number;
  trend_conversion: number;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
