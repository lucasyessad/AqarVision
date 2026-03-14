export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export type LeadSource = "platform" | "whatsapp" | "phone";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

export interface LeadDto {
  id: string;
  listing_id: string;
  agency_id: string;
  sender_user_id: string;
  status: LeadStatus;
  source: LeadSource;
  created_at: string;
  updated_at: string;
}

export interface ConversationDto {
  id: string;
  lead_id: string;
  listing_title: string;
  other_party_name: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface MessageDto {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  sender_name: string;
  body: string;
  read_at: string | null;
  created_at: string;
}
