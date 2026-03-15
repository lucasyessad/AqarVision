"use client";

import { useActionState } from "react";
import { submitVerificationAction } from "../actions/submit-verification.action";
import type { ActionResult } from "@/features/agencies/types/agency.types";
import type { VerificationDto } from "../actions/submit-verification.action";

interface VerificationFormProps {
  initialStatus: string;
}

function StatusBanner({ status }: { status: string }) {
  const configs = {
    pending: {
      bg: "#FFFBEB",
      border: "#FDE68A",
      iconColor: "#D97706",
      title: "Demande en cours d'examen",
      message: "Notre équipe examine votre dossier. Vous serez notifié par e-mail sous 48 h.",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    verified: {
      bg: "#F0FDF4",
      border: "#BBF7D0",
      iconColor: "#16A34A",
      title: "Agence vérifiée",
      message: "Votre agence dispose du badge de confiance AqarVision.",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
    rejected: {
      bg: "#FFF5F5",
      border: "#FECACA",
      iconColor: "#DC2626",
      title: "Demande rejetée",
      message: "Votre demande n'a pas été acceptée. Corrigez vos informations et soumettez à nouveau.",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
  };

  const config = configs[status as keyof typeof configs];
  if (!config) return null;

  return (
    <div
      className="flex items-start gap-3 rounded-lg border p-4"
      style={{ background: config.bg, borderColor: config.border }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: config.iconColor }}>{config.icon}</span>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>{config.title}</p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-600)" }}>{config.message}</p>
      </div>
    </div>
  );
}

export function VerificationForm({ initialStatus }: VerificationFormProps) {
  const [state, formAction, isPending] = useActionState<
    ActionResult<VerificationDto> | null,
    FormData
  >(submitVerificationAction, null);

  const currentStatus =
    state?.success === true ? state.data.verification_status : initialStatus;

  const showForm = currentStatus === "none" || currentStatus === "rejected";

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {currentStatus !== "none" && <StatusBanner status={currentStatus} />}

      {/* Benefits card (always visible) */}
      <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
        <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
            Badge de confiance AqarVision
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-500)" }}>
            La vérification renforce la confiance des acheteurs et augmente votre visibilité.
          </p>
        </div>
        <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0" style={{ borderColor: "#E3E8EF" }}>
          {[
            { icon: "🛡️", title: "Badge vérifié", desc: "Affiché sur toutes vos annonces" },
            { icon: "📈", title: "+40% de visibilité", desc: "Dans les résultats de recherche" },
            { icon: "🤝", title: "Confiance renforcée", desc: "Leads de meilleure qualité" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-5">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--charcoal-950)" }}>{item.title}</p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-500)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Server error */}
      {state?.success === false && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {state.error.message}
        </div>
      )}

      {/* Submission form */}
      {showForm && (
        <form action={formAction}>
          <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
            <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                {currentStatus === "rejected" ? "Nouvelle demande" : "Soumettre votre dossier"}
              </h3>
            </div>

            {/* Legal name */}
            <div className="grid grid-cols-1 gap-6 border-b p-6 md:grid-cols-[240px_1fr]" style={{ borderColor: "#E3E8EF" }}>
              <div>
                <label htmlFor="legal_name" className="block text-sm font-medium" style={{ color: "var(--charcoal-950)" }}>
                  Raison sociale
                </label>
                <p className="mt-1 text-xs" style={{ color: "var(--charcoal-500)" }}>
                  Nom légal tel qu&apos;il figure sur le registre de commerce.
                </p>
              </div>
              <div>
                <input
                  id="legal_name"
                  type="text"
                  name="legal_name"
                  required
                  placeholder="Ex : Agence Baraka SARL"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                  style={{ borderColor: "#E3E8EF", color: "var(--charcoal-950)" }}
                />
              </div>
            </div>

            {/* RC number */}
            <div className="grid grid-cols-1 gap-6 border-b p-6 md:grid-cols-[240px_1fr]" style={{ borderColor: "#E3E8EF" }}>
              <div>
                <label htmlFor="rc_number" className="block text-sm font-medium" style={{ color: "var(--charcoal-950)" }}>
                  Numéro RC
                </label>
                <p className="mt-1 text-xs" style={{ color: "var(--charcoal-500)" }}>
                  Registre de commerce (format : 16/00-1234567 B 15).
                </p>
              </div>
              <div>
                <input
                  id="rc_number"
                  type="text"
                  name="rc_number"
                  required
                  placeholder="16/00-1234567 B 15"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                  style={{ borderColor: "#E3E8EF", color: "var(--charcoal-950)" }}
                />
              </div>
            </div>

            {/* Document upload */}
            <div className="grid grid-cols-1 gap-6 border-b p-6 md:grid-cols-[240px_1fr]" style={{ borderColor: "#E3E8EF" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--charcoal-950)" }}>
                  Extrait RC
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--charcoal-500)" }}>
                  Scan ou photo lisible du registre de commerce. PDF ou image.
                </p>
              </div>
              <div>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors hover:border-[var(--coral)] hover:bg-[rgba(232,114,92,0.02)]" style={{ borderColor: "#E3E8EF", background: "#F6F9FC" }}>
                  <svg className="mb-2 h-7 w-7" style={{ color: "var(--charcoal-400)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm" style={{ color: "var(--charcoal-700)" }}>
                    Glissez ou{" "}
                    <span style={{ color: "var(--coral)", fontWeight: 500 }}>choisissez un fichier</span>
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--charcoal-400)" }}>PDF, JPG ou PNG — max 5 Mo</p>
                  <input type="file" accept=".pdf,image/*" className="sr-only" />
                </label>
                <input type="hidden" name="document_url" value="" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4" style={{ background: "#F6F9FC" }}>
              <p className="text-xs" style={{ color: "var(--charcoal-500)" }}>
                Traitement sous 24–48 h ouvrables.
              </p>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--coral)" }}
              >
                {isPending ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Envoi…
                  </>
                ) : "Soumettre la demande"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
