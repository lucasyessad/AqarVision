"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { reviewListingAction } from "../actions/moderation.action";
import type { ReportDto } from "../types/moderation.types";

interface ModerationQueueProps {
  reports: ReportDto[];
}

export function ModerationQueue({ reports }: ModerationQueueProps) {
  const t = useTranslations("moderation");
  const [state, formAction, isPending] = useActionState(reviewListingAction, null);

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white dark:bg-zinc-900 p-8 text-center">
        <p className="text-sm text-gray-500">{t("no_pending")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-zinc-900">
      {state?.success === false && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error.message}
        </div>
      )}

      <table className="w-full text-start text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-start font-medium text-gray-600">
              {t("listing")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-gray-600">
              {t("report_reason")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-gray-600">
              {t("date")}
            </th>
            <th className="px-4 py-3 text-end font-medium text-gray-600">
              {t("actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {report.listing_title ?? report.listing_id.slice(0, 8)}
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                {report.reason}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(report.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <form action={formAction}>
                    <input
                      type="hidden"
                      name="listing_id"
                      value={report.listing_id}
                    />
                    <input type="hidden" name="action" value="approved" />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    >
                      {t("approve")}
                    </button>
                  </form>
                  <form action={formAction}>
                    <input
                      type="hidden"
                      name="listing_id"
                      value={report.listing_id}
                    />
                    <input type="hidden" name="action" value="rejected" />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {t("reject")}
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
