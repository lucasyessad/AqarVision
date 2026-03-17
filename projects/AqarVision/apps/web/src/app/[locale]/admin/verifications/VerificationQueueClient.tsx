"use client";

import { useState, useTransition } from "react";
import { approveAgencyAction } from "@/features/admin/actions/approve-agency.action";
import { rejectAgencyAction } from "@/features/admin/actions/reject-agency.action";
import type { PendingVerification } from "@/features/admin/services/admin.service";

// ── Single verification card ──────────────────────────────────────────────────

function VerificationCard({ agency }: { agency: PendingVerification }) {
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveAgencyAction(agency.id);
      if (result.success) {
        setDone("approved");
      } else {
        alert(result.error.message);
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectAgencyAction(agency.id, comment || undefined);
      if (result.success) {
        setDone("rejected");
      } else {
        alert(result.error.message);
      }
    });
  };

  if (done === "approved") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
        Agence <span className="font-bold">{agency.name}</span> approuvée.
      </div>
    );
  }

  if (done === "rejected") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
        Agence <span className="font-bold">{agency.name}</span> rejetée.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:bg-zinc-900 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{agency.name}</h3>
          <p className="text-xs text-gray-400">Slug: {agency.slug}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            Soumis le{" "}
            {new Date(agency.created_at).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
          En attente
        </span>
      </div>

      {/* Comment box for rejection */}
      {showCommentBox && (
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Commentaire (optionnel)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Motif du rejet..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-night"
          />
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          Approuver
        </button>

        {!showCommentBox ? (
          <button
            onClick={() => setShowCommentBox(true)}
            disabled={isPending}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            Rejeter
          </button>
        ) : (
          <>
            <button
              onClick={handleReject}
              disabled={isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              Confirmer le rejet
            </button>
            <button
              onClick={() => {
                setShowCommentBox(false);
                setComment("");
              }}
              disabled={isPending}
              className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600"
            >
              Annuler
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Queue list ────────────────────────────────────────────────────────────────

interface Props {
  verifications: PendingVerification[];
}

export function VerificationQueueClient({ verifications }: Props) {
  if (verifications.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white dark:bg-zinc-900 px-6 py-16 text-center text-sm text-gray-400">
        Aucune demande de vérification en attente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {verifications.map((agency) => (
        <VerificationCard key={agency.id} agency={agency} />
      ))}
    </div>
  );
}
