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

const STATUS_STYLE: Record<VisitRequestStatus, { bg: string; color: string }> = {
  pending:   { bg: "#FFFBEB", color: "#D97706" },
  confirmed: { bg: "#F0FDF4", color: "#16A34A" },
  cancelled: { bg: "#F6F9FC", color: "var(--charcoal-400)" },
  done:      { bg: "#EFF6FF", color: "#2563EB" },
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
        <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal-950)" }}>
          Demandes de visites
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--charcoal-500)" }}>
          {requests.length} demande{requests.length !== 1 ? "s" : ""} au total.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-0 border-b" style={{ borderColor: "#E3E8EF" }}>
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === "all" ? requests.length : requests.filter((r) => r.status === tab.key).length;
          return (
            <a
              key={tab.key}
              href={tab.key === "all" ? "/dashboard/visit-requests" : `/dashboard/visit-requests?status=${tab.key}`}
              className="flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderBottomColor: isActive ? "var(--coral)" : "transparent",
                color: isActive ? "var(--coral)" : "var(--charcoal-500)",
              }}
            >
              {tab.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={isActive ? { background: "var(--coral)", color: "white" } : { background: "#E3E8EF", color: "var(--charcoal-500)" }}
              >
                {count}
              </span>
            </a>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border bg-white py-16" style={{ borderColor: "#E3E8EF" }}>
          <p className="text-sm" style={{ color: "var(--charcoal-500)" }}>Aucune demande de visite</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
          {filtered.map((req, i) => {
            const style = STATUS_STYLE[req.status];
            return (
              <div
                key={req.id}
                className="grid grid-cols-1 gap-4 border-b p-6 md:grid-cols-[1fr_auto]"
                style={{ borderColor: i === filtered.length - 1 ? "transparent" : "#E3E8EF" }}
              >
                {/* Info */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                      {req.visitor_name}
                    </p>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {STATUS_LABELS[req.status]}
                    </span>
                  </div>

                  <p className="mt-1 text-xs" style={{ color: "var(--charcoal-500)" }}>
                    {req.visitor_phone}
                    {req.visitor_email && (
                      <span className="ms-2" style={{ color: "var(--charcoal-400)" }}>
                        · {req.visitor_email}
                      </span>
                    )}
                  </p>

                  <p className="mt-1 truncate text-sm" style={{ color: "var(--charcoal-700)" }}>
                    {req.listing_title}
                  </p>

                  {req.requested_date && (
                    <p className="mt-1 text-xs" style={{ color: "var(--charcoal-400)" }}>
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
                    <p
                      className="mt-2 rounded-md px-3 py-1.5 text-xs italic"
                      style={{ background: "#F6F9FC", color: "var(--charcoal-600)" }}
                    >
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
                        className="rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ background: "#16A34A" }}
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        disabled={loadingId === req.id}
                        onClick={() => handleStatusChange(req.id, "cancelled")}
                        className="rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50"
                        style={{ borderColor: "#E3E8EF", color: "var(--charcoal-600)" }}
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
                      className="rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: "var(--coral)" }}
                    >
                      Marquer comme faite
                    </button>
                  )}
                  {(req.status === "cancelled" || req.status === "done") && (
                    <span className="text-xs" style={{ color: "var(--charcoal-400)" }}>
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
