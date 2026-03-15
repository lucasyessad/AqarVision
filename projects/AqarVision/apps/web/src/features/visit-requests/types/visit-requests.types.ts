export type VisitRequestStatus = "pending" | "confirmed" | "cancelled" | "done";

export interface VisitRequestDto {
  id: string;
  listing_id: string;
  agency_id: string;
  lead_id: string | null;
  visitor_name: string;
  visitor_phone: string;
  visitor_email: string | null;
  message: string | null;
  requested_date: string | null;
  status: VisitRequestStatus;
  created_at: string;
  updated_at: string;
  // Joined
  listing_title: string;
}

export type { ActionResult } from "@/types/action-result";
