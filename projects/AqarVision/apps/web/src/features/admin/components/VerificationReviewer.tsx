"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Check,
  X,
  Building2,
  FileText,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { reviewVerificationAction } from "../actions/admin.action";
import type { VerificationRequest, VerificationAction } from "../types/admin.types";

interface VerificationReviewerProps {
  initialRequests: VerificationRequest[];
}

const levelLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Basique", color: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400" },
  2: { label: "Vérifié", color: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400" },
  3: { label: "Certifié", color: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400" },
  4: { label: "Premium", color: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400" },
};

export function VerificationReviewer({
  initialRequests,
}: VerificationReviewerProps) {
  const tEmpty = useTranslations("common.empty");
  const [requests, setRequests] = useState(initialRequests);
  const [actionDialog, setActionDialog] = useState<{
    id: string;
    action: VerificationAction;
  } | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function openAction(id: string, action: VerificationAction) {
    setActionDialog({ id, action });
    setSelectedLevel(2);
    setReason("");
  }

  function submitAction() {
    if (!actionDialog) return;
    startTransition(async () => {
      const result = await reviewVerificationAction(
        actionDialog.id,
        actionDialog.action,
        actionDialog.action === "approve" ? selectedLevel : undefined,
        actionDialog.action === "reject" ? reason : undefined
      );
      if (result.success) {
        setRequests((prev) =>
          prev.filter((r) => r.id !== actionDialog.id)
        );
        setActionDialog(null);
      }
    });
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-5 py-12 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
        <p className="text-sm text-stone-400 dark:text-stone-500">
          {tEmpty("noVerifications")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        {requests.length} demande{requests.length !== 1 ? "s" : ""} en attente
      </p>

      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Agency info */}
              <div className="flex items-start gap-3">
                {request.agency?.logo_url ? (
                  <img
                    src={request.agency.logo_url}
                    alt=""
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-100 dark:bg-stone-800">
                    <Building2 className="h-5 w-5 text-stone-400 dark:text-stone-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {request.agency?.name ?? "Agence inconnue"}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {request.agency?.slug
                      ? `@${request.agency.slug}`
                      : request.agency_id.slice(0, 8)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAction(request.id, "approve")}
                  disabled={isPending}
                  className="rounded-md bg-green-50 dark:bg-green-950 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  Approuver
                </button>
                <button
                  type="button"
                  onClick={() => openAction(request.id, "reject")}
                  disabled={isPending}
                  className="rounded-md bg-red-50 dark:bg-red-950 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Rejeter
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Niveau demandé
                </span>
                <p className="mt-0.5">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      levelLabels[request.level]?.color ??
                        "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                    )}
                  >
                    Niveau {request.level} —{" "}
                    {levelLabels[request.level]?.label ?? "Inconnu"}
                  </span>
                </p>
              </div>

              {request.legal_name && (
                <div>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    Raison sociale
                  </span>
                  <p className="text-sm text-stone-900 dark:text-stone-100 mt-0.5">
                    {request.legal_name}
                  </p>
                </div>
              )}

              {request.rc_number && (
                <div>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    N° RC
                  </span>
                  <p className="text-sm text-stone-900 dark:text-stone-100 mt-0.5">
                    {request.rc_number}
                  </p>
                </div>
              )}

              {request.nif_number && (
                <div>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    NIF
                  </span>
                  <p className="text-sm text-stone-900 dark:text-stone-100 mt-0.5">
                    {request.nif_number}
                  </p>
                </div>
              )}

              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Soumis le
                </span>
                <p className="flex items-center gap-1 text-sm text-stone-700 dark:text-stone-300 mt-0.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(request.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            {/* Documents */}
            <div className="mt-3 flex flex-wrap gap-2">
              {request.rc_document_url && (
                <a
                  href={request.rc_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Document RC
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {request.address_proof_url && (
                <a
                  href={request.address_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Preuve d'adresse
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Approve/Reject dialog */}
      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
              {actionDialog.action === "approve"
                ? "Approuver la vérification"
                : "Rejeter la vérification"}
            </h3>

            {actionDialog.action === "approve" ? (
              <div className="space-y-3">
                <label className="block text-sm text-stone-700 dark:text-stone-300">
                  Niveau accordé
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([1, 2, 3, 4] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSelectedLevel(level)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                        selectedLevel === level
                          ? "border-teal-600 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400"
                          : "border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                      )}
                    >
                      Niveau {level} — {levelLabels[level]?.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm text-stone-700 dark:text-stone-300">
                  Raison du rejet (min. 10 caractères)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                  placeholder="Indiquez la raison du rejet..."
                />
                {reason.length > 0 && reason.length < 10 && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    Minimum 10 caractères ({reason.length}/10)
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setActionDialog(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={submitAction}
                disabled={
                  isPending ||
                  (actionDialog.action === "reject" && reason.length < 10)
                }
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50",
                  actionDialog.action === "approve"
                    ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                )}
              >
                {isPending
                  ? "En cours..."
                  : actionDialog.action === "approve"
                    ? "Approuver"
                    : "Rejeter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
