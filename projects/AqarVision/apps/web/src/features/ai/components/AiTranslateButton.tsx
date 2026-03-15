"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { translateListingAction } from "../actions/ai.action";
import type { ActionResult } from "../types/ai.types";

const LOCALE_OPTIONS = [
  { value: "fr", label: "Francais" },
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
  { value: "es", label: "Espanol" },
] as const;

interface AiTranslateButtonProps {
  listingId: string;
  sourceLocale: string;
  onAccept?: (translation: { title: string; description: string }, targetLocale: string) => void;
}

export function AiTranslateButton({
  listingId,
  sourceLocale,
  onAccept,
}: AiTranslateButtonProps) {
  const t = useTranslations("ai");
  const [targetLocale, setTargetLocale] = useState("");
  const [showResult, setShowResult] = useState(false);

  const [state, formAction, isPending] = useActionState<
    ActionResult<{ translation: { title: string; description: string }; job_id: string }> | null,
    FormData
  >(translateListingAction, null);

  const availableLocales = LOCALE_OPTIONS.filter(
    (opt) => opt.value !== sourceLocale
  );

  function handleAccept() {
    if (state?.success && onAccept && targetLocale) {
      onAccept(state.data.translation, targetLocale);
    }
    setShowResult(false);
  }

  function handleReject() {
    setShowResult(false);
  }

  if (state?.success && !showResult) {
    setShowResult(true);
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="flex items-end gap-3">
        <input type="hidden" name="listing_id" value={listingId} />
        <input type="hidden" name="source_locale" value={sourceLocale} />
        <div className="flex-1">
          <label
            htmlFor="target_locale"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {t("target_locale")}
          </label>
          <select
            id="target_locale"
            name="target_locale"
            value={targetLocale}
            onChange={(e) => setTargetLocale(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-night focus:outline-none focus:ring-1 focus:ring-blue-night"
            required
          >
            <option value="">{t("target_locale")}...</option>
            {availableLocales.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending || !targetLocale}
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
              {t("translating")}
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
                  d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
                />
              </svg>
              {t("translate")}
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
          <div className="mb-4 space-y-2">
            <p className="mb-1 text-xs font-semibold uppercase text-gray-400">
              {t("generated_text")}
            </p>
            <div className="rounded-lg bg-green-50 p-3 text-sm font-medium text-gray-800">
              {state.data.translation.title}
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
              {state.data.translation.description}
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
