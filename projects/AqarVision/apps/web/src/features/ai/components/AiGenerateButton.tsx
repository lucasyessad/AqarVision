"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { generateDescriptionAction } from "../actions/ai.action";
import type { ActionResult } from "../types/ai.types";

interface AiGenerateButtonProps {
  listingId: string;
  sourceLocale: string;
  currentDescription?: string;
  onAccept?: (text: string) => void;
}

export function AiGenerateButton({
  listingId,
  sourceLocale,
  currentDescription,
  onAccept,
}: AiGenerateButtonProps) {
  const t = useTranslations("ai");
  const [showResult, setShowResult] = useState(false);

  const [state, formAction, isPending] = useActionState<
    ActionResult<{ text: string; job_id: string }> | null,
    FormData
  >(generateDescriptionAction, null);

  function handleAccept() {
    if (state?.success && onAccept) {
      onAccept(state.data.text);
    }
    setShowResult(false);
  }

  function handleReject() {
    setShowResult(false);
  }

  // Show result when generation completes
  if (state?.success && !showResult) {
    setShowResult(true);
  }

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <input type="hidden" name="listing_id" value={listingId} />
        <input type="hidden" name="source_locale" value={sourceLocale} />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-night px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-night/90 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t("generating")}
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
              {t("generate_description")}
            </>
          )}
        </button>
      </form>

      {!state?.success && state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error.code === "QUOTA_EXCEEDED"
            ? t("quota_exceeded")
            : state.error.message}
        </div>
      )}

      {showResult && state?.success && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          {currentDescription && (
            <div className="mb-4">
              <p className="mb-1 text-xs font-semibold uppercase text-gray-400">
                {t("source_locale")}
              </p>
              <div className="rounded-lg bg-red-50 p-3 text-sm text-gray-700 line-through">
                {currentDescription}
              </div>
            </div>
          )}
          <div className="mb-4">
            <p className="mb-1 text-xs font-semibold uppercase text-gray-400">
              {t("generated_text")}
            </p>
            <div className="rounded-lg bg-green-50 p-3 text-sm text-gray-700">
              {state.data.text}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-blue-night transition-colors hover:bg-gold/90"
            >
              {t("accept")}
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {t("reject")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
