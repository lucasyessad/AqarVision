import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationDto, MessageDto } from "../types/messaging.types";

/**
 * Creates a lead, its conversation, and optionally a first message.
 * Returns the lead_id and conversation_id.
 */
export async function createLead(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
  message?: string,
  source: string = "platform"
): Promise<{ lead_id: string; conversation_id: string }> {
  // Get the listing to find the agency_id
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, agency_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    throw new Error("Listing not found");
  }

  // Create the lead
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      listing_id: listingId,
      agency_id: listing.agency_id,
      sender_user_id: userId,
      source,
    })
    .select("id")
    .single();

  if (leadError || !lead) {
    throw new Error(leadError?.message ?? "Failed to create lead");
  }

  // Create the conversation
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({ lead_id: lead.id })
    .select("id")
    .single();

  if (convError || !conversation) {
    throw new Error(convError?.message ?? "Failed to create conversation");
  }

  // Insert the first message if provided
  if (message && message.trim().length > 0) {
    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_user_id: userId,
      body: message.trim(),
    });

    if (msgError) {
      throw new Error(msgError.message);
    }
  }

  return { lead_id: lead.id, conversation_id: conversation.id };
}

/**
 * Sends a message in a conversation.
 */
export async function sendMessage(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
  body: string
): Promise<{ message_id: string }> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_user_id: userId,
      body: body.trim(),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to send message");
  }

  // Update conversation updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { message_id: data.id };
}

/**
 * Marks all unread messages in a conversation as read (except those sent by the user).
 */
export async function markRead(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_user_id", userId)
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Lists all conversations for a user (as sender or agency member)
 * with last message and unread count.
 */
export async function listConversations(
  supabase: SupabaseClient,
  userId: string
): Promise<ConversationDto[]> {
  // Get conversations where the user is a participant
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id,
      lead_id,
      created_at,
      updated_at,
      leads!inner (
        id,
        listing_id,
        agency_id,
        sender_user_id,
        listings!inner (
          id,
          listing_translations (
            title,
            locale
          )
        )
      )
    `)
    .order("updated_at", { ascending: false });

  if (error || !conversations) {
    throw new Error(error?.message ?? "Failed to list conversations");
  }

  // Get user profile for display names
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .eq("user_id", userId)
    .single();

  const result: ConversationDto[] = [];

  for (const conv of conversations) {
    const lead = conv.leads as unknown as Record<string, unknown>;
    const listing = lead.listings as Record<string, unknown>;
    const translations = listing.listing_translations as unknown as Array<{
      title: string;
      locale: string;
    }>;

    // Pick the best translation (fr first, then any)
    const translation =
      translations?.find((t) => t.locale === "fr") ?? translations?.[0];
    const listingTitle = translation?.title ?? "—";

    // Get last message
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("body, created_at, sender_user_id")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get unread count (messages not sent by user and not read)
    const { count: unreadCount } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conv.id)
      .neq("sender_user_id", userId)
      .is("read_at", null);

    // Get the other party's name
    const senderUserId = lead.sender_user_id as string;
    const isCurrentUserSender = senderUserId === userId;

    let otherPartyName = "—";
    if (isCurrentUserSender) {
      // Other party is the agency — get agency name
      const { data: agency } = await supabase
        .from("agencies")
        .select("name")
        .eq("id", lead.agency_id as string)
        .single();
      otherPartyName = agency?.name ?? "—";
    } else {
      // Other party is the sender
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", senderUserId)
        .single();
      otherPartyName =
        senderProfile?.full_name ?? currentProfile?.full_name ?? "—";
    }

    result.push({
      id: conv.id,
      lead_id: lead.id as string,
      listing_title: listingTitle,
      other_party_name: otherPartyName,
      last_message: lastMsg?.body ?? null,
      last_message_at: lastMsg?.created_at ?? null,
      unread_count: unreadCount ?? 0,
    });
  }

  return result;
}

/**
 * Lists all messages in a conversation, ordered by creation time.
 */
export async function listMessages(
  supabase: SupabaseClient,
  conversationId: string
): Promise<MessageDto[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      conversation_id,
      sender_user_id,
      body,
      read_at,
      created_at
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to list messages");
  }

  // Collect unique sender IDs
  const senderIds = [...new Set(data.map((m) => m.sender_user_id))];

  // Fetch profiles for all senders
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", senderIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, p.full_name ?? "—"])
  );

  return data.map((msg) => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_user_id: msg.sender_user_id,
    sender_name: profileMap.get(msg.sender_user_id) ?? "—",
    body: msg.body,
    read_at: msg.read_at,
    created_at: msg.created_at,
  }));
}

/**
 * Gets conversation participant info for authorization checks.
 */
export async function getConversationParticipants(
  supabase: SupabaseClient,
  conversationId: string
): Promise<{
  sender_user_id: string;
  agency_id: string;
} | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      id,
      leads!inner (
        sender_user_id,
        agency_id
      )
    `)
    .eq("id", conversationId)
    .single();

  if (error || !data) {
    return null;
  }

  const lead = data.leads as unknown as Record<string, unknown>;
  return {
    sender_user_id: lead.sender_user_id as string,
    agency_id: lead.agency_id as string,
  };
}
