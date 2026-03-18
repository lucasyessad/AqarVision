export interface VisitRequest {
  id: string;
  listing_id: string;
  agency_id: string;
  requester_user_id: string | null;
  requester_name: string;
  requester_phone: string;
  requester_email: string | null;
  preferred_date: string;
  preferred_time_slot: "morning" | "afternoon" | "evening";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  message: string | null;
  created_at: string;
  listing_title: string | null;
  listing_address: string | null;
}
