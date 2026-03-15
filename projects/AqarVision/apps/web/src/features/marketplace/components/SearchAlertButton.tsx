"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createSearchAlertAction } from "../actions/create-search-alert.action";

type Frequency = "immediate" | "daily" | "weekly";

const FREQUENCY_LABELS: Record<Frequency, string> = {
  immediate: "Immédiatement",
  daily: "Quotidien (résumé du jour)",
  weekly: "Hebdomadaire (résumé de la semaine)",
};

export function SearchAlertButton({ compact }: { compact?: boolean } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [alertName, setAlertName] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const openModal = () => {
    // Generate default alert name from current URL params
    const parts: string[] = [];
    const q = searchParams.get("q");
    const wilaya = searchParams.get("wilaya_code");
    const listingType = searchParams.get("listing_type");
    const propertyType = searchParams.get("property_type");

    if (q) parts.push(q);
    if (listingType) parts.push(listingType);
    if (propertyType) parts.push(propertyType);
    if (wilaya) parts.push(`Wilaya ${wilaya}`);

    setAlertName(parts.join(" – ") || "Mon alerte immobilière");
    setError(null);
    setSuccess(false);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertName.trim()) {
      setError("Le nom de l'alerte est requis.");
      return;
    }

    // Build filters from current URL search params
    const filters: Record<string, unknown> = {};
    searchParams.forEach((value, key) => {
      filters[key] = value;
    });

    startTransition(async () => {
      const result = await createSearchAlertAction({
        name: alertName.trim(),
        filters,
        frequency,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 2000);
      } else {
        if (result.error.code === "UNAUTHORIZED") {
          // Redirect to login
          router.push(`${pathname.replace(/\/[^/]+\//, "/fr/")}`.replace(/search.*$/, "auth/login"));
          return;
        }
        setError(result.error.message);
      }
    });
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={openModal}
        className="flex items-center gap-2 rounded-lg border border-amber-500 px-3 py-2 text-sm font-medium text-amber-500 transition-colors"
        title="Créer une alerte"
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {!compact && <span>Créer une alerte</span>}
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {success ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-zinc-800">Alerte créée !</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Vous serez notifié lors de nouvelles annonces correspondant à vos critères.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 id="alert-modal-title" className="text-lg font-semibold text-zinc-900">
                      Créer une alerte de recherche
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      Recevez des notifications pour les nouvelles annonces.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Fermer"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Alert name */}
                <div className="mb-4">
                  <label htmlFor="alert-name" className="mb-1.5 block text-sm font-medium text-zinc-800">
                    Nom de l&apos;alerte
                  </label>
                  <input
                    id="alert-name"
                    type="text"
                    value={alertName}
                    onChange={(e) => setAlertName(e.target.value)}
                    placeholder="Ex: Appartements Alger centre"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    maxLength={100}
                    required
                  />
                </div>

                {/* Frequency */}
                <div className="mb-5">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-800">
                    Fréquence de notification
                  </span>
                  <div className="space-y-2">
                    {(Object.entries(FREQUENCY_LABELS) as [Frequency, string][]).map(
                      ([value, label]) => (
                        <label key={value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-amber-500">
                          <input
                            type="radio"
                            name="frequency"
                            value={value}
                            checked={frequency === value}
                            onChange={() => setFrequency(value)}
                            className="text-zinc-900 focus:ring-amber-500"
                          />
                          <span className="text-sm text-zinc-800">{label}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-900/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? "Création..." : "Créer l'alerte"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
