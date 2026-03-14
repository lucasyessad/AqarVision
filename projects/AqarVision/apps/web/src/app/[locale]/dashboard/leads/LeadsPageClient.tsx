"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ConversationList } from "@/features/messaging/components/ConversationList";
import { ChatView } from "@/features/messaging/components/ChatView";
import { listMessages } from "@/features/messaging/services/messaging.service";
import { createClient } from "@/lib/supabase/client";
import type {
  ConversationDto,
  MessageDto,
} from "@/features/messaging/types/messaging.types";

interface LeadsPageClientProps {
  conversations: ConversationDto[];
  initialMessages: MessageDto[];
  currentUserId: string;
}

export function LeadsPageClient({
  conversations,
  initialMessages,
  currentUserId,
}: LeadsPageClientProps) {
  const t = useTranslations("messaging");
  const [activeConversation, setActiveConversation] =
    useState<ConversationDto | null>(conversations[0] ?? null);
  const [messages, setMessages] = useState<MessageDto[]>(initialMessages);
  const [showChat, setShowChat] = useState(false);

  const handleSelectConversation = async (conv: ConversationDto) => {
    setActiveConversation(conv);
    setShowChat(true);

    // Fetch messages for the selected conversation
    const supabase = createClient();
    try {
      const msgs = await listMessages(supabase, conv.id);
      setMessages(msgs);
    } catch {
      setMessages([]);
    }
  };

  const handleBack = () => {
    setShowChat(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-700">{t("leads_title")}</h1>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Conversation list — hidden on mobile when chat is open */}
        <div
          className={`w-full shrink-0 border-e border-gray-200 md:block md:w-80 lg:w-96 ${
            showChat ? "hidden" : "block"
          }`}
        >
          <div className="h-full overflow-y-auto">
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id ?? null}
              onSelect={handleSelectConversation}
            />
          </div>
        </div>

        {/* Chat view — hidden on mobile when list is shown */}
        <div
          className={`flex flex-1 flex-col ${
            showChat ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Mobile back button */}
          {showChat && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 border-b border-gray-200 px-4 py-2 text-sm text-[#1a365d] md:hidden"
            >
              <svg
                className="h-4 w-4 rtl:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t("conversations")}
            </button>
          )}

          <ChatView
            conversation={activeConversation}
            initialMessages={messages}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
