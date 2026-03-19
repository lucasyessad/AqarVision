export interface Lead {
  id: string;
  agency_id: string;
  listing_id: string | null;
  sender_user_id: string | null;
  sender_name: string;
  sender_phone: string;
  sender_email: string | null;
  status: "new" | "contacted" | "qualified" | "closed";
  source: "platform" | "whatsapp" | "phone";
  lead_type: "info" | "visit" | "offer" | "urgent";
  score: number;
  heat_score: number;
  notes: LeadNote[];
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  listing_title: string | null;
}

export interface LeadNote {
  text: string;
  author_id: string;
  created_at: string;
}

export interface LeadColumn {
  status: Lead["status"];
  leads: Lead[];
}
