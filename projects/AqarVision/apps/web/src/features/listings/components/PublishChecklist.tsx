"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { submitForReviewAction } from "../actions/publish.action";

interface PublishChecklistProps {
  listingId: string;
  initialChecks: {
    canPublish: boolean;
    missing: string[];
  };
}

const REQUIREMENT_KEYS = [
  "french_translation",
  "arabic_translation",
  "cover_media",
  "price_set",
] as const;

type SubmitResult =
  | { success: true; data: { submitted: true } }
  | { success: false; error: { code: string; message: string; missing?: string[] } };

export function PublishChecklist({
  listingId,
  initialChecks,
}: PublishChecklistProps) {
  const t = useTranslations("listings");
  const [missing, setMissing] = useState<string[]>(initialChecks.missing);

  const [state, formAction, isPending] = useActionState<SubmitResult | null, FormData>(
    submitForReviewAction,
    null
  );

  useEffect(() => {
    if (
      state?.success === false &&
      state.error.code === "PUBLISH_REQUIREMENTS_NOT_MET" &&
      state.error.missing
    ) {
      setMissing(state.error.missing);
    }
  }, [state]);

  const allMet = missing.length === 0;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">
        {t("publish_checklist")}
      </h2>

      <ul className="mb-6 space-y-3">
        {REQUIREMENT_KEYS.map((key) => {
          const isMet = !missing.includes(key);
          return (
            <li key={key} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                  isMet
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {isMet ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </span>
              <span
                className={`text-sm ${
                  isMet ? "text-zinc-800" : "text-red-600"
                }`}
              >
                {t(`requirement_${key}`)}
              </span>
            </li>
          );
        })}
      </ul>

      {state?.success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {t("submitted_for_review")}
        </div>
      )}

      {state?.success === false && state.error.code !== "PUBLISH_REQUIREMENTS_NOT_MET" && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {state.error.message}
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="listing_id" value={listingId} />
        <button
          type="submit"
          disabled={!allMet || isPending}
          className="w-full rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-amber-500/90 disabled:opacity-50"
        >
          {isPending ? t("submitting") : t("submit_for_review")}
        </button>
      </form>
    </div>
  );
}
