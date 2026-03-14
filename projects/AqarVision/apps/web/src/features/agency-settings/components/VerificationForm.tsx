"use client";

import { useActionState } from "react";
import { submitVerificationAction } from "../actions/submit-verification.action";
import type { ActionResult } from "@/features/agencies/types/agency.types";
import type { VerificationDto } from "../actions/submit-verification.action";

interface VerificationFormProps {
  initialStatus: string;
}

// ── Status banner ─────────────────────────────────────────────────────────────

function StatusBanner({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-semibold text-blue-800">
              Demande en cours d&apos;examen
            </p>
            <p className="mt-0.5 text-sm text-blue-600">
              Notre équipe examine votre dossier. Vous serez notifié par email.
            </p>
          </div>
        </div>
      );
    case "verified":
      return (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-5">
          <span className="text-2xl">✓</span>
          <div>
            <p className="font-semibold text-green-800">Agence vérifiée</p>
            <p className="mt-0.5 text-sm text-green-600">
              Votre agence est officiellement vérifiée sur AqarVision.
            </p>
          </div>
        </div>
      );
    case "rejected":
      return (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
          <span className="text-2xl">✗</span>
          <div>
            <p className="font-semibold text-red-800">Demande rejetée</p>
            <p className="mt-0.5 text-sm text-red-600">
              Votre demande a été rejetée. Vous pouvez corriger vos informations
              et soumettre à nouveau.
            </p>
          </div>
        </div>
      );
    default:
      return null;
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export function VerificationForm({ initialStatus }: VerificationFormProps) {
  const [state, formAction, isPending] = useActionState<
    ActionResult<VerificationDto> | null,
    FormData
  >(submitVerificationAction, null);

  // Resolved status: prefer server feedback over initial prop
  const currentStatus =
    state?.success === true
      ? state.data.verification_status
      : initialStatus;

  const showForm =
    currentStatus === "none" || currentStatus === "rejected";

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <StatusBanner status={currentStatus} />

      {/* Server error */}
      {state?.success === false && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.error.message}
        </div>
      )}

      {/* Submission form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-1 text-base font-semibold text-gray-800">
            {currentStatus === "rejected"
              ? "Soumettre à nouveau"
              : "Faites vérifier votre agence"}
          </h3>
          <p className="mb-6 text-sm text-gray-500">
            La vérification permet d&apos;afficher un badge de confiance sur votre
            profil public et d&apos;augmenter votre visibilité.
          </p>

          <form action={formAction} className="space-y-5">
            {/* Legal name */}
            <div>
              <label
                htmlFor="legal_name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nom légal de l&apos;agence
              </label>
              <input
                id="legal_name"
                type="text"
                name="legal_name"
                required
                placeholder="Ex: Agence Immobilière Baraka SARL"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-night focus:outline-none focus:ring-2 focus:ring-blue-night/20"
              />
            </div>

            {/* RC / SIRET */}
            <div>
              <label
                htmlFor="rc_number"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Numéro RC / Registre de commerce
              </label>
              <input
                id="rc_number"
                type="text"
                name="rc_number"
                required
                placeholder="Ex: 16/00-1234567 B 15"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-night focus:outline-none focus:ring-2 focus:ring-blue-night/20"
              />
            </div>

            {/* Document upload (placeholder) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Extrait du registre de commerce
              </label>
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
                <svg
                  className="mx-auto mb-3 h-10 w-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-gray-500">
                  Glissez votre document ici ou{" "}
                  <span className="font-medium text-blue-night">
                    cliquez pour sélectionner
                  </span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  PDF, JPG ou PNG — max 5 MB
                </p>
                {/* TODO: implémenter Supabase Storage signed upload URL
                    1. Créer un bucket privé "verification-docs"
                    2. GET /api/upload/verification-doc → retourne une signed URL
                    3. Uploader directement depuis le browser
                    4. Stocker l'URL publique dans document_url
                */}
                <input type="hidden" name="document_url" value="" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-night px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-night/90 disabled:opacity-50"
            >
              {isPending ? "Envoi en cours…" : "Soumettre la demande"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
