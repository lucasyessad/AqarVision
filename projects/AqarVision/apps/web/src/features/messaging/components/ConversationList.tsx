"use client";

import { useTranslations } from "next-intl";
import type { ConversationDto } from "../types/messaging.types";

interface ConversationListProps {
  conversations: ConversationDto[];
  activeId: string | null;
  onSelect: (conversation: ConversationDto) => void;
}

function formatRelativeTime(
  dateStr: string | null,
  t: ReturnType<typeof useTranslations>
): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return t("just_now");
  if (diffMin < 60) return t("minutes_ago", { count: diffMin });
  if (diffHrs < 24) return t("hours_ago", { count: diffHrs });

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return t("yesterday");
  }

  return date.toLocaleDateString();
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  const t = useTranslations("messaging");

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-gray-400">
        {t("no_conversations")}
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {conversations.map((conv) => {
        const isActive = conv.id === activeId;
        const hasUnread = conv.unread_count > 0;

        return (
          <button
            key={conv.id}
            type="button"
            onClick={() => onSelect(conv)}
            className={`flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-gray-50 ${
              isActive ? "bg-blue-50" : ""
            }`}
          >
            {/* Avatar placeholder */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              {conv.other_party_name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`truncate text-sm ${
                    hasUnread
                      ? "font-semibold text-gray-700"
                      : "font-medium text-gray-600"
                  }`}
                >
                  {conv.other_party_name}
                </span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatRelativeTime(conv.last_message_at, t)}
                </span>
              </div>

              <p className="truncate text-xs text-gray-400">
                {conv.listing_title}
              </p>

              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p
                  className={`truncate text-sm ${
                    hasUnread ? "font-medium text-gray-700" : "text-gray-500"
                  }`}
                >
                  {conv.last_message ?? "—"}
                </p>

                {hasUnread && (
                  <span className="inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
