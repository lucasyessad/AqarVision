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

const STATUS_COLORS: Record<VisitRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-500",
  done: "bg-blue-100 text-blue-700",
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

  const filtered =
    activeTab === "all"
      ? requests
      : requests.filter((r) => r.status === activeTab);

  const handleStatusChange = async (
    requestId: string,
    newStatus: VisitRequestStatus
  ) => {
    setLoadingId(requestId);
    setError(null);

    // Optimistic update
    const prev = [...requests];
    setRequests((curr) =>
      curr.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );

    const result = await updateVisitRequestStatusAction({
      requestId,
      agencyId,
      status: newStatus,
    });

    if (!result.success) {
      setRequests(prev);
      setError(result.error.message);
    }

    setLoadingId(null);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-blue-night">
        Demandes de visites
      </h1>

      {/* Status tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count =
            tab.key === "all"
              ? requests.length
              : requests.filter((r) => r.status === tab.key).length;

          return (
            <a
              key={tab.key}
              href={
                tab.key === "all"
                  ? "/dashboard/visit-requests"
                  : `/dashboard/visit-requests?status=${tab.key}`
              }
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-blue-night text-blue-night"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? "bg-blue-night text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </a>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Requests list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm">
          <p className="text-gray-500">Aucune demande de visite</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Left info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">
                      {req.visitor_name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        STATUS_COLORS[req.status]
                      }`}
                    >
                      {STATUS_LABELS[req.status]}
                    </span>
                  </div>

                  <p className="mb-0.5 text-sm text-gray-500">
                    {req.visitor_phone}
                    {req.visitor_email && (
                      <span className="ms-2 text-gray-400">
                        · {req.visitor_email}
                      </span>
                    )}
                  </p>

                  <p className="truncate text-sm text-blue-night/80">
                    {req.listing_title}
                  </p>

                  {req.requested_date && (
                    <p className="mt-1 text-xs text-gray-400">
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
                    <p className="mt-1 rounded bg-gray-50 px-2 py-1 text-xs text-gray-600 italic">
                      "{req.message}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap gap-2">
                  {req.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={loadingId === req.id}
                        onClick={() =>
                          handleStatusChange(req.id, "confirmed")
                        }
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        disabled={loadingId === req.id}
                        onClick={() =>
                          handleStatusChange(req.id, "cancelled")
                        }
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
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
                      className="rounded-lg bg-blue-night px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-night/90 disabled:opacity-50"
                    >
                      Marquer comme faite
                    </button>
                  )}
                  {(req.status === "cancelled" || req.status === "done") && (
                    <span className="text-xs text-gray-400">
                      {req.status === "done" ? "Visite effectuée" : "Annulée"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
