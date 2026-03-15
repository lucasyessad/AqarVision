"use client";

import { useState } from "react";
import { getMessagesAction } from "@/features/messaging/actions/get-messages.action";
import { ConversationList } from "@/features/messaging/components/ConversationList";
import { ChatView } from "@/features/messaging/components/ChatView";
import type { ConversationDto, MessageDto } from "@/features/messaging/types/messaging.types";

interface Props {
  conversations: ConversationDto[];
  initialMessages: MessageDto[];
  firstConvId: string | null;
  currentUserId: string;
}

export function EspaceMessagerieClient({
  conversations,
  initialMessages,
  firstConvId,
  currentUserId,
}: Props) {
  const [activeConv, setActiveConv] = useState<ConversationDto | null>(
    conversations.find((c) => c.id === firstConvId) ?? null
  );
  const [messages, setMessages] = useState<MessageDto[]>(initialMessages);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (conv: ConversationDto) => {
    if (conv.id === activeConv?.id) return;
    setActiveConv(conv);
    setLoading(true);
    const msgs = await getMessagesAction(conv.id);
    setMessages(msgs);
    setLoading(false);
  };

  if (conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
          <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-800">
            Aucun message pour l&apos;instant
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Vos échanges avec les propriétaires et agences apparaîtront ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white"
      style={{ height: "calc(100vh - 7rem)" }}
    >
      {/* Conversation list */}
      <div className="w-72 shrink-0 overflow-y-auto border-e border-zinc-200">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-800">
            Messagerie
          </h2>
        </div>
        <ConversationList
          conversations={conversations}
          activeId={activeConv?.id ?? null}
          onSelect={handleSelect}
        />
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <svg className="h-5 w-5 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <ChatView
            conversation={activeConv}
            initialMessages={messages}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}
