'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import type { Message } from '@/types/database';

interface MessageThreadProps {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Aujourd\'hui';
  if (date.toDateString() === yesterday.toDateString()) return 'Hier';
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function groupMessagesByDate(messages: Message[]): Array<{ dateLabel: string; messages: Message[] }> {
  const groups: Map<string, Message[]> = new Map();

  for (const msg of messages) {
    const date = new Date(msg.created_at).toDateString();
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(msg);
  }

  return Array.from(groups.entries()).map(([, msgs]) => ({
    dateLabel: formatDateHeader(msgs[0].created_at),
    messages: msgs,
  }));
}

export function MessageThread({ conversationId, initialMessages, currentUserId }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Subscribe to new messages via Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates (server action may have already added optimistically)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const groups = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <p className="text-body-sm text-neutral-400">
          Aucun message. Envoyez le premier message pour démarrer la conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {groups.map((group) => (
        <div key={group.dateLabel}>
          {/* Date separator */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-neutral-100" />
            <span className="text-caption text-neutral-400 whitespace-nowrap">{group.dateLabel}</span>
            <div className="flex-1 h-px bg-neutral-100" />
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {group.messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMine
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-neutral-100 text-neutral-900 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-body-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className={`text-caption mt-1 ${
                        isMine ? 'text-primary-200 text-right' : 'text-neutral-400'
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
