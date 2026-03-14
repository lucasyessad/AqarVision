export interface AgencyStatsDto {
  day: string;
  total_views: number;
  total_leads: number;
  total_new_listings: number;
}

export interface AnalyticsSummary {
  total_views: number;
  total_leads: number;
  total_new_listings: number;
  conversion_rate: number;
  trend_views: number;
  trend_leads: number;
  trend_new_listings: number;
  trend_conversion: number;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
