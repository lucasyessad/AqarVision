"use client";

import { useState } from "react";
import { updateVisitRequestStatusAction } from "@/features/visit-requests/actions/update-visit-request-status.action";
import type {
  VisitRequestDto,
  VisitRequestStatus,
} from "@/features/visit-requests/types/visit-requests.types";

const STATUS_TABS = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "confirmed", label: "Confirmées" },
  { key: "done", label: "Faites" },
] as const;

const STATUS_LABELS: Record<VisitRequestStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  done: "Faite",
};

const STATUS_CLS: Record<VisitRequestStatus, string> = {
  pending:   "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400",
  confirmed: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
  cancelled: "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500",
  done:      "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
};

interface VisitRequestsPageClientProps {
  visitRequests: VisitRequestDto[];
  agencyId: string;
  statusFilter: string;
}

export function VisitRequestsPageClient({
  visitRequests,
  agencyId,
  statusFilter,
}: VisitRequestsPageClientProps) {
  const [requests, setRequests] = useState<VisitRequestDto[]>(visitRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeTab = statusFilter === "all" ? "all" : (statusFilter as VisitRequestStatus);
  const filtered = activeTab === "all" ? requests : requests.filter((r) => r.status === activeTab);

  const handleStatusChange = async (requestId: string, newStatus: VisitRequestStatus) => {
    setLoadingId(requestId);
    setError(null);
    const prev = [...requests];
    setRequests((curr) =>
      curr.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );
    const result = await updateVisitRequestStatusAction({ requestId, agencyId, status: newStatus });
    if (!result.success) {
      setRequests(prev);
      setError(result.error.message);
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Demandes de visites
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {requests.length} demande{requests.length !== 1 ? "s" : ""} au total.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-700 dark:border-zinc-800">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === "all" ? requests.length : requests.filter((r) => r.status === tab.key).length;
          return (
            <a
              key={tab.key}
              href={tab.key === "all" ? "/dashboard/visit-requests" : `/dashboard/visit-requests?status=${tab.key}`}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-amber-500 text-white"
                    : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                }`}
              >
                {count}
              </span>
            </a>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-16 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucune demande de visite</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:bg-zinc-900">
          {filtered.map((req, i) => {
            const statusCls = STATUS_CLS[req.status];
            return (
              <div
                key={req.id}
                className={`grid grid-cols-1 gap-4 p-6 md:grid-cols-[1fr_auto] ${
                  i !== filtered.length - 1 ? "border-b border-zinc-200 dark:border-zinc-700 dark:border-zinc-800" : ""
                }`}
              >
                {/* Info */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                      {req.visitor_name}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusCls}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {req.visitor_phone}
                    {req.visitor_email && (
                      <span className="ms-2 text-zinc-400 dark:text-zinc-500">
                        · {req.visitor_email}
                      </span>
                    )}
                  </p>

                  <p className="mt-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
                    {req.listing_title}
                  </p>

                  {req.requested_date && (
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      Visite souhaitée :{" "}
                      {new Date(req.requested_date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  {req.message && (
                    <p className="mt-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs italic text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      &ldquo;{req.message}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap items-start gap-2">
                  {req.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={loadingId === req.id}
                        onClick={() => handleStatusChange(req.id, "confirmed")}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-green-700"
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        disabled={loadingId === req.id}
                        onClick={() => handleStatusChange(req.id, "cancelled")}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:bg-zinc-800 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        Annuler
                      </button>
                    </>
                  )}
                  {req.status === "confirmed" && (
                    <button
                      type="button"
                      disabled={loadingId === req.id}
                      onClick={() => handleStatusChange(req.id, "done")}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                    >
                      Marquer comme faite
                    </button>
                  )}
                  {(req.status === "cancelled" || req.status === "done") && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {req.status === "done" ? "Visite effectuée" : "Annulée"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
