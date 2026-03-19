"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { sendMessageAction, markAsReadAction } from "../actions/messaging.action";
import type { Conversation, Message } from "../types/messaging.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MessagingViewProps {
  userId: string;
  agencyId?: string;
  initialConversations: Conversation[];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Avatar({
  firstName,
  lastName,
  avatarUrl,
  size = "md",
}: {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  size?: "sm" | "md";
}) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const sizeClasses = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  if (avatarUrl) {
    return (
      <div
        className={cn(
          "shrink-0 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700",
          sizeClasses
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={initials} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "shrink-0 rounded-full flex items-center justify-center font-medium",
        "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300",
        sizeClasses
      )}
    >
      {initials}
    </div>
  );
}

function ConversationItem({
  conversation,
  userId,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  userId: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const tEmpty = useTranslations("common.empty");
  const other = conversation.participants.find((p) => p.user_id !== userId);
  const name = other
    ? `${other.first_name} ${other.last_name}`
    : "Conversation";

  const timeStr = formatRelativeTime(conversation.updated_at);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-start transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:bg-stone-100 dark:focus-visible:bg-stone-800",
        isActive
          ? "bg-teal-50 dark:bg-teal-950/50"
          : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
      )}
    >
      <Avatar
        firstName={other?.first_name ?? "?"}
        lastName={other?.last_name ?? "?"}
        avatarUrl={other?.avatar_url ?? null}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm font-medium truncate",
              conversation.unread_count > 0
                ? "text-stone-900 dark:text-stone-100"
                : "text-stone-700 dark:text-stone-300"
            )}
          >
            {name}
          </span>
          <span className="text-2xs text-stone-400 dark:text-stone-500 shrink-0">
            {timeStr}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p
            className={cn(
              "text-xs truncate",
              conversation.unread_count > 0
                ? "text-stone-700 dark:text-stone-300 font-medium"
                : "text-stone-500 dark:text-stone-400"
            )}
          >
            {conversation.last_message_preview ?? tEmpty("noMessages")}
          </p>
          {conversation.unread_count > 0 && (
            <span className="shrink-0 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-teal-600 dark:bg-teal-500 text-white text-2xs font-medium px-1">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  const time = new Date(message.created_at).toLocaleTimeString("fr", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex flex-col max-w-[75%]",
        isMine ? "items-end self-end" : "items-start self-start"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm",
          isMine
            ? "bg-teal-600 dark:bg-teal-600 text-white rounded-ee-sm"
            : "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-es-sm"
        )}
      >
        {message.content}
      </div>
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-2xs text-stone-400 dark:text-stone-500">{time}</span>
        {isMine && (
          message.read_at ? (
            <CheckCheck size={12} className="text-teal-500 dark:text-teal-400" />
          ) : (
            <Check size={12} className="text-stone-400 dark:text-stone-500" />
          )
        )}
      </div>
    </div>
  );
}

function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (content: string) => void;
  disabled: boolean;
}) {
  const tEmpty = useTranslations("common.empty");
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t border-stone-200 dark:border-stone-700">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={tEmpty("typeMessage")}
        rows={1}
        disabled={disabled}
        className={cn(
          "flex-1 resize-none rounded-lg border border-stone-300 dark:border-stone-600",
          "bg-white dark:bg-stone-950 px-3 py-2.5",
          "text-sm text-stone-900 dark:text-stone-100",
          "placeholder:text-stone-400 dark:placeholder:text-stone-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950",
          "disabled:opacity-50"
        )}
      />
      <Button
        variant="primary"
        size="md"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Envoyer"
      >
        <Send size={16} />
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "maintenant";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}j`;

  return new Date(dateStr).toLocaleDateString("fr", {
    day: "numeric",
    month: "short",
  });
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function MessagingView({
  userId,
  agencyId,
  initialConversations,
}: MessagingViewProps) {
  const tEmpty = useTranslations("common.empty");
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // If it's in the active conversation, add to messages
          if (newMessage.conversation_id === activeConversationId) {
            setMessages((prev) => [...prev, newMessage]);
          }

          // Update conversation list
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === newMessage.conversation_id) {
                return {
                  ...c,
                  last_message_preview: newMessage.content,
                  updated_at: newMessage.created_at,
                  unread_count:
                    newMessage.sender_id !== userId && newMessage.conversation_id !== activeConversationId
                      ? c.unread_count + 1
                      : c.unread_count,
                };
              }
              return c;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, userId, supabase]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function openConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setLoadingMessages(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, created_at, read_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as Message[]);
      }

      // Mark as read
      markAsReadAction(conversationId);

      // Update local unread count
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        )
      );
    } finally {
      setLoadingMessages(false);
    }
  }

  function handleSend(content: string) {
    if (!activeConversationId) return;

    // Optimistic update
    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: activeConversationId,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    startTransition(async () => {
      const result = await sendMessageAction(activeConversationId, content);
      if (!result.success) {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      }
    });
  }

  function handleBack() {
    setActiveConversationId(null);
    setMessages([]);
  }

  const otherParticipant = activeConversation?.participants.find(
    (p) => p.user_id !== userId
  );

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[35%_1fr] min-h-[500px] lg:min-h-[600px]">
        {/* Conversations list */}
        <div
          className={cn(
            "border-e border-stone-200 dark:border-stone-700 flex flex-col",
            activeConversationId ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Search */}
          <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
            <input
              type="text"
              placeholder={tEmpty("searchPlaceholder")}
              className={cn(
                "w-full rounded-md border border-stone-300 dark:border-stone-600",
                "bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm",
                "text-stone-900 dark:text-stone-100",
                "placeholder:text-stone-400 dark:placeholder:text-stone-500",
                "outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400"
              )}
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <MessageSquare
                  size={40}
                  className="text-stone-300 dark:text-stone-600 mb-3"
                />
                <p className="text-sm text-stone-400 dark:text-stone-500">
                  {tEmpty("noConversations")}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    userId={userId}
                    isActive={conv.id === activeConversationId}
                    onClick={() => openConversation(conv.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Thread area */}
        <div
          className={cn(
            "flex flex-col",
            activeConversationId ? "flex" : "hidden lg:flex"
          )}
        >
          {activeConversation ? (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={handleBack}
                  className="lg:hidden rounded-md p-1 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-fast"
                  aria-label="Retour"
                >
                  <ArrowLeft size={20} />
                </button>
                {otherParticipant && (
                  <Avatar
                    firstName={otherParticipant.first_name}
                    lastName={otherParticipant.last_name}
                    avatarUrl={otherParticipant.avatar_url}
                    size="sm"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {otherParticipant
                      ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
                      : "Conversation"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-stone-300 dark:border-stone-600 border-t-teal-600 dark:border-t-teal-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm text-stone-400 dark:text-stone-500">
                      {tEmpty("noMessages")}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isMine={msg.sender_id === userId}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <MessageInput onSend={handleSend} disabled={isPending} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare
                size={48}
                className="text-stone-200 dark:text-stone-700 mb-4"
              />
              <p className="text-sm text-stone-400 dark:text-stone-500">
                {tEmpty("selectConversation")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
