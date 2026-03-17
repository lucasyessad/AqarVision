"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { reportListingAction } from "../actions/moderation.action";

interface ReportButtonProps {
  listingId: string;
}

export function ReportButton({ listingId }: ReportButtonProps) {
  const t = useTranslations("moderation");
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(reportListingAction, null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        aria-label={t("report")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z"
          />
        </svg>
        {t("report")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {t("report")}
            </h3>

            {state?.success && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {t("report_submitted")}
              </div>
            )}

            {state?.success === false && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {state.error.message}
              </div>
            )}

            {!state?.success && (
              <form action={formAction}>
                <input type="hidden" name="listing_id" value={listingId} />
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("report_reason")}
                </label>
                <textarea
                  name="reason"
                  required
                  minLength={5}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-night/20"
                  placeholder={t("report_reason")}
                />
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {isPending ? "..." : t("report")}
                  </button>
                </div>
              </form>
            )}

            {state?.success && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  {t("close")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
