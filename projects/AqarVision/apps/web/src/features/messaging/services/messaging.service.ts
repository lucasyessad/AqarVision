import type { SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, Message } from "../types/messaging.types";

export async function getConversations(
  supabase: SupabaseClient,
  userId: string,
  agencyId?: string
): Promise<Conversation[]> {
  let query = supabase
    .from("conversations")
    .select(
      `
      id,
      listing_id,
      agency_id,
      created_at,
      updated_at,
      participants:conversation_participants(
        user_id,
        profile:profiles(first_name, last_name, avatar_url)
      ),
      messages:messages(content, created_at, read_at, sender_id)
    `
    )
    .order("updated_at", { ascending: false });

  if (agencyId) {
    query = query.eq("agency_id", agencyId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => {
    const participants = row.participants as Array<{
      user_id: string;
      profile: { first_name: string; last_name: string; avatar_url: string | null } | null;
    }>;
    const messages = row.messages as Array<{
      content: string;
      created_at: string;
      read_at: string | null;
      sender_id: string;
    }>;

    const lastMessage = messages
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const unreadCount = messages.filter(
      (m) => m.sender_id !== userId && !m.read_at
    ).length;

    return {
      id: row.id as string,
      listing_id: row.listing_id as string | null,
      agency_id: row.agency_id as string | null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      last_message_preview: lastMessage?.content ?? null,
      unread_count: unreadCount,
      participants: participants.map((p) => ({
        user_id: p.user_id,
        first_name: p.profile?.first_name ?? "",
        last_name: p.profile?.last_name ?? "",
        avatar_url: p.profile?.avatar_url ?? null,
      })),
    };
  });
}

export async function getMessages(
  supabase: SupabaseClient,
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, content, created_at, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(
  supabase: SupabaseClient,
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select("id, conversation_id, sender_id, content, created_at, read_at")
    .single();

  if (error) throw error;

  // Update conversation timestamp
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data as Message;
}

export async function markAsRead(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) throw error;
}
