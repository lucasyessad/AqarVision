export interface AgencyDailyStats {
  date: string;
  total_views: number;
  total_leads: number;
  total_contacts: number;
  total_visits: number;
  new_listings: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalLeads: number;
  totalContacts: number;
  totalListings: number;
  viewsTrend: number;
  leadsTrend: number;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  reason: string | null;
}
