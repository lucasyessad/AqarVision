export interface Conversation {
  id: string;
  listing_id: string | null;
  agency_id: string | null;
  created_at: string;
  updated_at: string;
  last_message_preview: string | null;
  unread_count: number;
  participants: ConversationParticipant[];
}

export interface ConversationParticipant {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}
