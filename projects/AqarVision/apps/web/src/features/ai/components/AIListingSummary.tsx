"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";

interface AIListingSummaryProps {
  listingId: string;
  existingSummary?: string | null;
  onGenerate?: (listingId: string) => Promise<string>;
}

export function AIListingSummary({
  listingId,
  existingSummary,
  onGenerate,
}: AIListingSummaryProps) {
  const t = useTranslations("listings");
  const [summary, setSummary] = useState(existingSummary ?? null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    if (!onGenerate) return;
    startTransition(async () => {
      try {
        const result = await onGenerate(listingId);
        setSummary(result);
      } catch {
        // Error handled by parent
      }
    });
  };

  if (!summary && !onGenerate) return null;

  return (
    <div className="rounded-lg border border-med-100 bg-med-50/50 p-4 dark:border-med-700 dark:bg-med-900/20">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-med-500" />
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t("ai_summary")}
          </h3>
        </div>
        {onGenerate && summary && (
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-med-600 transition-colors hover:bg-med-100 disabled:opacity-50 dark:text-med-400 dark:hover:bg-med-900/40"
          >
            <RefreshCw className="h-3 w-3" />
            {t("regenerate")}
          </button>
        )}
      </div>

      {summary ? (
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {summary}
        </p>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-med-300 py-3 text-sm text-med-600 transition-colors hover:bg-med-50 disabled:opacity-50 dark:border-med-600 dark:text-med-400 dark:hover:bg-med-900/30"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("generating")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t("generate_summary")}
            </>
          )}
        </button>
      )}
    </div>
  );
}
