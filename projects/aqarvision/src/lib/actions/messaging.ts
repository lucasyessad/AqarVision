'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Conversation, Message } from '@/types/database';

// ========== Schemas ==========

const startConversationSchema = z.object({
  agencyId: z.string().uuid('ID agence invalide'),
  propertyId: z.string().uuid('ID bien invalide').nullable(),
  messageContent: z.string().min(1, 'Le message ne peut pas être vide').max(2000, 'Le message est trop long'),
});

const sendMessageSchema = z.object({
  conversationId: z.string().uuid('ID conversation invalide'),
  content: z.string().min(1, 'Le message ne peut pas être vide').max(2000, 'Le message est trop long (max 2000 caractères)'),
});

// ========== Types ==========

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface ConversationWithMeta extends Conversation {
  last_message_content: string | null;
  unread_count: number;
  agency_name: string | null;
}

// ========== Helpers ==========

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

async function isConversationParticipant(conversationId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .or(`user_id.eq.${userId},agency_id.in.(select id from agencies where owner_id = '${userId}')`)
    .single();
  return !!data;
}

// ========== Actions ==========

export async function startConversation(
  agencyId: string,
  propertyId: string | null,
  messageContent: string
): Promise<{ conversationId: string | null; error?: string }> {
  const validation = startConversationSchema.safeParse({ agencyId, propertyId, messageContent });
  if (!validation.success) {
    return { conversationId: null, error: validation.error.errors[0]?.message || 'Données invalides' };
  }

  const user = await getCurrentUser();
  if (!user) return { conversationId: null, error: 'Vous devez être connecté pour envoyer un message' };

  const supabase = await createClient();

  // Check if conversation already exists
  let conversationId: string;

  const query = supabase
    .from('conversations')
    .select('id')
    .eq('agency_id', agencyId)
    .eq('user_id', user.id);

  if (propertyId) {
    query.eq('property_id', propertyId);
  } else {
    query.is('property_id', null);
  }

  const { data: existing } = await query.single();

  if (existing) {
    conversationId = existing.id;
  } else {
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        agency_id: agencyId,
        user_id: user.id,
        property_id: propertyId,
        status: 'active',
      })
      .select('id')
      .single();

    if (createError || !newConversation) {
      return { conversationId: null, error: 'Erreur lors de la création de la conversation' };
    }
    conversationId = newConversation.id;
  }

  // Insert the message
  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: messageContent,
    });

  if (msgError) {
    return { conversationId: null, error: 'Erreur lors de l\'envoi du message' };
  }

  revalidatePath('/messages');
  return { conversationId };
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ActionResult<Message>> {
  const validation = sendMessageSchema.safeParse({ conversationId, content });
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0]?.message || 'Données invalides' };
  }

  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Vous devez être connecté' };

  // Verify user is a participant
  const participant = await isConversationParticipant(conversationId, user.id);
  if (!participant) return { success: false, error: 'Accès non autorisé à cette conversation' };

  const supabase = await createClient();

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    })
    .select()
    .single();

  if (error || !message) {
    return { success: false, error: 'Erreur lors de l\'envoi du message' };
  }

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath(`/dashboard/messages/${conversationId}`);

  return { success: true, data: message as Message };
}

export async function markMessagesAsRead(
  conversationId: string
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Vous devez être connecté' };

  const supabase = await createClient();

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false);

  if (error) {
    return { error: 'Erreur lors de la mise à jour' };
  }

  return {};
}

export async function getConversations(): Promise<{
  conversations: ConversationWithMeta[];
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { conversations: [], error: 'Vous devez être connecté' };

  const supabase = await createClient();

  // Get user's agency IDs
  const { data: agencies } = await supabase
    .from('agencies')
    .select('id, name')
    .eq('owner_id', user.id);

  const agencyIds = agencies?.map((a) => a.id) ?? [];

  // Build query: user's conversations OR agency's conversations
  let query = supabase
    .from('conversations')
    .select('*, agencies:agency_id(name)')
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (agencyIds.length > 0) {
    query = query.or(`user_id.eq.${user.id},agency_id.in.(${agencyIds.join(',')})`);
  } else {
    query = query.eq('user_id', user.id);
  }

  const { data: conversations, error } = await query;

  if (error) return { conversations: [], error: 'Erreur lors de la récupération des conversations' };

  if (!conversations || conversations.length === 0) {
    return { conversations: [] };
  }

  const conversationIds = conversations.map((c) => c.id);

  // Get last messages
  const { data: lastMessages } = await supabase
    .from('messages')
    .select('conversation_id, content, created_at')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false });

  // Get unread counts (messages not sent by current user)
  const { data: unreadData } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', conversationIds)
    .neq('sender_id', user.id)
    .eq('is_read', false);

  const lastMessageMap = new Map<string, string>();
  const seenConversations = new Set<string>();
  for (const msg of lastMessages ?? []) {
    if (!seenConversations.has(msg.conversation_id)) {
      seenConversations.add(msg.conversation_id);
      lastMessageMap.set(msg.conversation_id, msg.content);
    }
  }

  const unreadMap = new Map<string, number>();
  for (const row of unreadData ?? []) {
    unreadMap.set(row.conversation_id, (unreadMap.get(row.conversation_id) ?? 0) + 1);
  }

  const result: ConversationWithMeta[] = conversations.map((c) => ({
    id: c.id,
    agency_id: c.agency_id,
    user_id: c.user_id,
    property_id: c.property_id,
    subject: c.subject,
    status: c.status,
    last_message_at: c.last_message_at,
    created_at: c.created_at,
    updated_at: c.updated_at,
    last_message_content: lastMessageMap.get(c.id) ?? null,
    unread_count: unreadMap.get(c.id) ?? 0,
    agency_name: (c.agencies as { name: string } | null)?.name ?? null,
  }));

  return { conversations: result };
}

export async function getMessages(
  conversationId: string,
  page = 1
): Promise<{ messages: Message[]; hasMore: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { messages: [], hasMore: false, error: 'Vous devez être connecté' };

  const participant = await isConversationParticipant(conversationId, user.id);
  if (!participant) return { messages: [], hasMore: false, error: 'Accès non autorisé' };

  const supabase = await createClient();
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE);

  if (error) return { messages: [], hasMore: false, error: 'Erreur lors de la récupération des messages' };

  const hasMore = (messages?.length ?? 0) > PAGE_SIZE;
  const result = (messages ?? []).slice(0, PAGE_SIZE).reverse();

  return { messages: result as Message[], hasMore };
}

export async function archiveConversation(
  conversationId: string
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Vous devez être connecté' };

  const participant = await isConversationParticipant(conversationId, user.id);
  if (!participant) return { error: 'Accès non autorisé' };

  const supabase = await createClient();

  const { error } = await supabase
    .from('conversations')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (error) return { error: 'Erreur lors de l\'archivage' };

  revalidatePath('/messages');
  revalidatePath('/dashboard/messages');

  return {};
}
