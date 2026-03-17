"use client";

import { useEffect, useRef, useState, useActionState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { sendMessageAction, markReadAction } from "../actions/messaging.action";
import { useRealtimeMessages } from "../hooks/use-realtime-messages";
import type { MessageDto, ConversationDto } from "../types/messaging.types";

interface ChatViewProps {
  conversation: ConversationDto | null;
  initialMessages: MessageDto[];
  currentUserId: string;
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatView({
  conversation,
  initialMessages,
  currentUserId,
}: ChatViewProps) {
  const t = useTranslations("messaging");
  const [messages, setMessages] = useState<MessageDto[]>(initialMessages);
  const [body, setBody] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update messages when conversation changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation opens
  const [, markReadFormAction] = useActionState(markReadAction, null);

  useEffect(() => {
    if (!conversation) return;

    const formData = new FormData();
    formData.append("conversation_id", conversation.id);
    markReadFormAction(formData);
  }, [conversation, markReadFormAction]);

  // Realtime subscription
  const handleNewMessage = useCallback(
    (message: MessageDto) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      // Mark as read if from someone else
      if (message.sender_user_id !== currentUserId && conversation) {
        const formData = new FormData();
        formData.append("conversation_id", conversation.id);
        markReadFormAction(formData);
      }
    },
    [currentUserId, conversation, markReadFormAction]
  );

  useRealtimeMessages(conversation?.id ?? null, handleNewMessage);

  // Send message
  const [sendState, sendFormAction, isSending] = useActionState(
    sendMessageAction,
    null
  );

  useEffect(() => {
    if (sendState?.success) {
      setBody("");
      inputRef.current?.focus();
    }
  }, [sendState]);

  const handleSubmit = (formData: FormData) => {
    if (!body.trim() || !conversation) return;
    formData.set("conversation_id", conversation.id);
    formData.set("body", body.trim());
    sendFormAction(formData);
  };

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        {t("no_conversations")}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">
          {conversation.other_party_name}
        </h3>
        <p className="text-xs text-gray-400">{conversation.listing_title}</p>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isOwn = msg.sender_user_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? "rounded-ee-sm bg-zinc-900 text-white"
                      : "rounded-es-sm bg-gray-100 text-gray-700"
                  }`}
                >
                  {!isOwn && (
                    <p className="mb-0.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {msg.sender_name}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {msg.body}
                  </p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 ${
                      isOwn ? "text-white/60" : "text-gray-400"
                    }`}
                  >
                    <span className="text-[10px]">
                      {formatMessageTime(msg.created_at)}
                    </span>
                    {isOwn && (
                      <span className="text-[10px]">
                        {msg.read_at ? (
                          /* Double checkmark for read */
                          <svg
                            className="h-3.5 w-3.5 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m3.5-1.5l-4 4-2-2"
                            />
                          </svg>
                        ) : (
                          /* Single checkmark for sent */
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 px-4 py-3">
        {sendState?.success === false && (
          <p className="mb-2 text-xs text-red-500">{sendState.error.message}</p>
        )}
        <form action={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (body.trim()) {
                  const formData = new FormData();
                  handleSubmit(formData);
                }
              }
            }}
            placeholder={t("your_message")}
            maxLength={2000}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          <button
            type="submit"
            disabled={isSending || !body.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {isSending ? (
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
