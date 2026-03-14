"use client";

import { useTranslations } from "next-intl";
import type { AiJobDto } from "../types/ai.types";

interface AiJobHistoryProps {
  jobs: AiJobDto[];
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("ai");

  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  const labels: Record<string, string> = {
    pending: t("status_pending"),
    processing: t("status_pending"),
    completed: t("status_completed"),
    failed: t("status_failed"),
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export function AiJobHistory({ jobs }: AiJobHistoryProps) {
  const t = useTranslations("ai");

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">{t("no_jobs")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("job_history")}
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("source_locale")}
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("target_locale")}
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                {job.job_type === "generate_description"
                  ? t("generate_description")
                  : job.job_type === "translate"
                    ? t("translate")
                    : job.job_type}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {job.source_locale ?? "-"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {job.target_locale ?? "-"}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge status={job.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {new Date(job.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
