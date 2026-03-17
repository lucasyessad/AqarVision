"use client";

import { useTranslations } from "next-intl";
import { X, Eye, Pause, Archive, Trash2 } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onPublish: () => void;
  onPause: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onPublish,
  onPause,
  onArchive,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps) {
  const t = useTranslations("listings");

  if (selectedCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Left: count + clear */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
            {t("selected_count", { count: selectedCount })}
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-3 w-3" />
            {t("clear_selection")}
          </button>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPublish}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700"
          >
            <Eye className="h-3.5 w-3.5" />
            {t("bulk_publish")}
          </button>
          <button
            type="button"
            onClick={onPause}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700"
          >
            <Pause className="h-3.5 w-3.5" />
            {t("bulk_pause")}
          </button>
          <button
            type="button"
            onClick={onArchive}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700"
          >
            <Archive className="h-3.5 w-3.5" />
            {t("bulk_archive")}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("bulk_delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
