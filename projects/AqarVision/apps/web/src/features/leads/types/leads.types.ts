export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

export interface LeadDto {
  id: string;
  listing_id: string;
  agency_id: string;
  sender_user_id: string;
  status: LeadStatus;
  source: "platform" | "whatsapp" | "phone";
  score: number | null;
  notes: LeadNoteDto[];
  created_at: string;
  updated_at: string;
  // Joined
  listing_title: string;
  contact_name: string;
  contact_phone: string | null;
}

export interface LeadNoteDto {
  id: string;
  body: string;
  author_id: string;
  author_name: string;
  created_at: string;
}

export interface LeadsByStatus {
  new: LeadDto[];
  contacted: LeadDto[];
  qualified: LeadDto[];
  closed: LeadDto[];
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
