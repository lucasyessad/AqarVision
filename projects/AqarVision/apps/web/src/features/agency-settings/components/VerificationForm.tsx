"use client";

import { useActionState } from "react";
import { submitVerificationAction } from "../actions/submit-verification.action";
import type { ActionResult } from "@/features/agencies/types/agency.types";
import type { VerificationDto } from "../actions/submit-verification.action";
import { Clock, ShieldCheck, AlertTriangle, Upload } from "lucide-react";

interface VerificationFormProps {
  initialStatus: string;
}

function StatusBanner({ status }: { status: string }) {
  const configs = {
    pending: {
      containerClass: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700",
      iconClass: "text-amber-600 dark:text-amber-400",
      title: "Demande en cours d'examen",
      message: "Notre équipe examine votre dossier. Vous serez notifié par e-mail sous 48 h.",
      icon: <Clock className="h-5 w-5" />,
    },
    verified: {
      containerClass: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
      iconClass: "text-green-600 dark:text-green-400",
      title: "Agence vérifiée",
      message: "Votre agence dispose du badge de confiance AqarVision.",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    rejected: {
      containerClass: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
      iconClass: "text-red-600 dark:text-red-400",
      title: "Demande rejetée",
      message: "Votre demande n'a pas été acceptée. Corrigez vos informations et soumettez à nouveau.",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
  };

  const config = configs[status as keyof typeof configs];
  if (!config) return null;

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${config.containerClass}`}>
      <span className={`mt-0.5 shrink-0 ${config.iconClass}`}>{config.icon}</span>
      <div>
        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{config.title}</p>
        <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{config.message}</p>
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
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <div className="border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Badge de confiance AqarVision
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            La vérification renforce la confiance des acheteurs et augmente votre visibilité.
          </p>
        </div>
        <div className="grid grid-cols-1 divide-y divide-zinc-200 dark:divide-zinc-700 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: "🛡️", title: "Badge vérifié", desc: "Affiché sur toutes vos annonces" },
            { icon: "📈", title: "+40% de visibilité", desc: "Dans les résultats de recherche" },
            { icon: "🤝", title: "Confiance renforcée", desc: "Leads de meilleure qualité" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-5">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{item.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Server error */}
      {state?.success === false && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {state.error.message}
        </div>
      )}

      {/* Submission form */}
      {showForm && (
        <form action={formAction}>
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <div className="border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                {currentStatus === "rejected" ? "Nouvelle demande" : "Soumettre votre dossier"}
              </h3>
            </div>

            {/* Legal name */}
            <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 dark:border-zinc-700 p-6 md:grid-cols-[240px_1fr]">
              <div>
                <label htmlFor="legal_name" className="block text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  Raison sociale
                </label>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
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
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* RC number */}
            <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 dark:border-zinc-700 p-6 md:grid-cols-[240px_1fr]">
              <div>
                <label htmlFor="rc_number" className="block text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  Numéro RC
                </label>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
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
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Document upload */}
            <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 dark:border-zinc-700 p-6 md:grid-cols-[240px_1fr]">
              <div>
                <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  Extrait RC
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Scan ou photo lisible du registre de commerce. PDF ou image.
                </p>
              </div>
              <div>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-6 py-8 text-center transition-colors hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10">
                  <Upload className="mb-2 h-7 w-7 text-zinc-400 dark:text-zinc-500" />
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    Glissez ou{" "}
                    <span className="font-medium text-amber-500">choisissez un fichier</span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">PDF, JPG ou PNG — max 5 Mo</p>
                  <input type="file" accept=".pdf,image/*" className="sr-only" />
                </label>
                <input type="hidden" name="document_url" value="" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 px-6 py-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Traitement sous 24–48 h ouvrables.
              </p>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 dark:text-zinc-50 shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
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
