"use client";

import { useState, useTransition, useCallback } from "react";
import { useTranslations } from "next-intl";
import { StickyNote, Check, Loader2 } from "lucide-react";

interface FavoriteNoteFieldProps {
  favoriteId: string;
  initialNote: string;
  initialStatus: string;
  onSaveNote: (favoriteId: string, note: string) => Promise<void>;
  onUpdateStatus: (favoriteId: string, status: string) => Promise<void>;
}

const STATUSES = ["none", "interested", "visited", "negotiating", "rejected"] as const;

const STATUS_COLORS: Record<string, string> = {
  none: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
  interested: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  visited: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  negotiating: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  rejected: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
};

export function FavoriteNoteField({
  favoriteId,
  initialNote,
  initialStatus,
  onSaveNote,
  onUpdateStatus,
}: FavoriteNoteFieldProps) {
  const t = useTranslations("favorites");
  const [note, setNote] = useState(initialNote);
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSaveNote = useCallback(() => {
    startTransition(async () => {
      await onSaveNote(favoriteId, note);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }, [favoriteId, note, onSaveNote, startTransition]);

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      setStatus(newStatus);
      startTransition(async () => {
        await onUpdateStatus(favoriteId, newStatus);
      });
    },
    [favoriteId, onUpdateStatus, startTransition]
  );

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
      {/* Status chips */}
      <div className="mb-3">
        <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {t("personal_status")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStatusChange(s)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                status === s
                  ? STATUS_COLORS[s]
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              }`}
            >
              {t(`status_${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Note field */}
      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <StickyNote className="h-3 w-3 text-zinc-400" />
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("add_note")}</p>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={handleSaveNote}
          rows={2}
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          placeholder={t("note_placeholder")}
        />
        <div className="mt-1.5 flex items-center justify-end gap-2">
          {isPending && <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />}
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" />
              {t("saved")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
