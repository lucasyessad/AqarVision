"use client";

import { useTransition } from "react";
import { approveAgencyAction } from "@/features/admin/actions/approve-agency.action";
import { rejectAgencyAction } from "@/features/admin/actions/reject-agency.action";
import { suspendAgencyAction } from "@/features/admin/actions/suspend-agency.action";
import type { AgencyRow } from "@/features/admin/services/admin.service";

// ── Status badge ──────────────────────────────────────────────────────────────

function VerificationBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    verified: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
    unverified: "bg-gray-100 text-gray-500",
  };
  const labels: Record<string, string> = {
    verified: "Vérifié",
    pending: "En attente",
    rejected: "Rejeté",
    unverified: "Non vérifié",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

// ── Row actions ───────────────────────────────────────────────────────────────

function AgencyActions({ agency }: { agency: AgencyRow }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveAgencyAction(agency.id);
      if (!result.success) alert(result.error.message);
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectAgencyAction(agency.id);
      if (!result.success) alert(result.error.message);
    });
  };

  const handleSuspend = () => {
    if (!confirm(`Suspendre l'agence "${agency.name}" ?`)) return;
    startTransition(async () => {
      const result = await suspendAgencyAction(agency.id);
      if (!result.success) alert(result.error.message);
    });
  };

  const isSuspended = Boolean(agency.deleted_at);

  return (
    <div className="flex items-center gap-2">
      {agency.verification_status !== "verified" && (
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="rounded px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-300 transition-colors hover:bg-green-50 disabled:opacity-50"
        >
          Vérifier
        </button>
      )}
      {agency.verification_status !== "rejected" && (
        <button
          onClick={handleReject}
          disabled={isPending}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 ring-1 ring-red-300 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          Rejeter
        </button>
      )}
      {!isSuspended && (
        <button
          onClick={handleSuspend}
          disabled={isPending}
          className="rounded px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-300 transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          Suspendre
        </button>
      )}
      {isSuspended && (
        <span className="text-xs text-red-500 font-medium">Suspendue</span>
      )}
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

interface Props {
  agencies: AgencyRow[];
}

export function AgenciesTableClient({ agencies }: Props) {
  if (agencies.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-400">
        Aucune agence trouvée.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-400">
              Nom
            </th>
            <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-400">
              Statut
            </th>
            <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-400">
              Annonces
            </th>
            <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-400">
              Créée le
            </th>
            <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {agencies.map((agency) => (
            <tr key={agency.id} className="transition-colors hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-blue-night">{agency.name}</p>
                <p className="text-xs text-gray-400">{agency.slug}</p>
              </td>
              <td className="px-4 py-3">
                <VerificationBadge status={agency.verification_status} />
              </td>
              <td className="px-4 py-3 text-gray-600">{agency.listings_count}</td>
              <td className="px-4 py-3 text-gray-400">
                {new Date(agency.created_at).toLocaleDateString("fr-FR")}
              </td>
              <td className="px-4 py-3">
                <AgencyActions agency={agency} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
