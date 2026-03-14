"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessageDto } from "../types/messaging.types";

/**
 * Subscribes to Supabase Realtime postgres_changes INSERT on messages table
 * filtered by conversation_id. Invokes the callback on each new message.
 * Cleans up subscription on unmount.
 */
export function useRealtimeMessages(
  conversationId: string | null,
  onNewMessage: (message: MessageDto) => void
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newRow = payload.new as {
            id: string;
            conversation_id: string;
            sender_user_id: string;
            body: string;
            read_at: string | null;
            created_at: string;
          };

          // Fetch sender name
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", newRow.sender_user_id)
            .single();

          const message: MessageDto = {
            id: newRow.id,
            conversation_id: newRow.conversation_id,
            sender_user_id: newRow.sender_user_id,
            sender_name: profile?.full_name ?? "—",
            body: newRow.body,
            read_at: newRow.read_at,
            created_at: newRow.created_at,
          };

          callbackRef.current(message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);
}
