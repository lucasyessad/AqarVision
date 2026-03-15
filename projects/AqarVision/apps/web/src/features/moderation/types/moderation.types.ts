export interface ReportDto {
  id: string;
  listing_id: string;
  action: string;
  reason: string | null;
  performed_by: string | null;
  created_at: string;
  listing_title: string | null;
  listing_agency_id: string | null;
}

export interface ModerationHistoryDto {
  id: string;
  listing_id: string;
  action: string;
  reason: string | null;
  performed_by: string | null;
  created_at: string;
}

export type { ActionResult } from "@/types/action-result";
