"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { X, Trash2, Pause, Play } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onPause?: () => void;
  onPublish?: () => void;
  onDelete?: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClear,
  onPause,
  onPublish,
  onDelete,
}: BulkActionsBarProps) {
  const t = useTranslations("common.buttons");

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:start-1/2 sm:-translate-x-1/2 z-toast max-w-lg mx-auto">
      <div className="flex items-center gap-3 rounded-lg bg-stone-900 dark:bg-stone-100 px-4 py-3 shadow-xl animate-slide-up">
        <span className="text-sm font-medium text-white dark:text-stone-900">
          {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
        </span>

        <div className="flex-1" />

        {onPublish && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onPublish}
            className="text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}

        {onPause && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onPause}
            className="text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200"
          >
            <Pause className="h-4 w-4" />
          </Button>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-400 dark:text-red-600 hover:bg-stone-800 dark:hover:bg-stone-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        <button
          type="button"
          onClick={onClear}
          className="p-1 rounded text-stone-400 dark:text-stone-500 hover:text-white dark:hover:text-stone-900 transition-colors duration-fast"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
