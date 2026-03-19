export interface ModerationQueueItem {
  listing_id: string;
  listing_title: string;
  listing_type: string;
  property_type: string;
  owner_type: "agency" | "individual";
  agency_name: string | null;
  user_name: string | null;
  wilaya_name: string;
  submitted_at: string;
  photos_count: number;
  cover_url: string | null;
}

export interface ModerationAction {
  action: "approved" | "rejected" | "hidden";
  reason: string | null;
  moderator_id: string;
  created_at: string;
}
