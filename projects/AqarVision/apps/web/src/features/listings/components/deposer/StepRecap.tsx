"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishIndividualListingAction } from "../../actions/publish-individual.action";
import type { WizardState } from "./wizard-state";

interface StepRecapProps {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  onBack: () => void;
  locale: string;
  activeCount: number;
  quota: number;
}

const LISTING_TYPE_LABEL: Record<string, string> = {
  sale: "Vente", rent: "Location", vacation: "Vacances",
};
const PROPERTY_TYPE_LABEL: Record<string, string> = {
  apartment: "Appartement", villa: "Villa", terrain: "Terrain",
  commercial: "Local commercial", office: "Bureau", building: "Immeuble",
  farm: "Ferme", warehouse: "Entrepôt",
};
const CONDITION_LABEL: Record<string, string> = {
  new: "Neuf", good: "Bon état", renovation: "À rénover", construction: "En construction",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <span className="text-right text-xs text-zinc-800 dark:text-zinc-200">{value}</span>
    </div>
  );
}

export function StepRecap({ state, onChange, onBack, locale, activeCount, quota }: StepRecapProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const remaining = quota - activeCount;
  const price = Number(state.current_price);

  const equip = Object.entries(state.details)
    .filter(([k, v]) => typeof v === "boolean" && v && k !== "condition")
    .map(([k]) => k.replace("has_", "").replace(/_/g, " "))
    .join(", ");

  function handlePublish() {
    setError("");
    startTransition(async () => {
      if (!state.draft_listing_id) {
        setError("Brouillon introuvable. Retournez à l'étape photos.");
        return;
      }

      const result = await publishIndividualListingAction({
        listing_id: state.draft_listing_id,
        contact_phone: state.contact_phone || undefined,
        show_phone: state.show_phone,
        accept_messages: state.accept_messages,
      });

      if (result.success) {
        router.push(`/${locale}/AqarChaab/espace/mes-annonces?published=1`);
      } else {
        setError(result.error.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="border-b border-zinc-100 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            {LISTING_TYPE_LABEL[state.listing_type] ?? state.listing_type} · {PROPERTY_TYPE_LABEL[state.property_type] ?? state.property_type}
          </p>
          <h3 className="mt-0.5 text-base font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">{state.title}</h3>
        </div>
        <div className="divide-y divide-zinc-50 px-4">
          <Row label="Localisation" value={[state.wilaya_name, state.commune_name].filter(Boolean).join(" · ")} />
          <Row label="Prix" value={<span className="font-bold text-zinc-900 dark:text-zinc-100">{price.toLocaleString("fr-DZ")} DZD</span>} />
          {state.surface_m2 && <Row label="Surface" value={`${state.surface_m2} m²`} />}
          {state.rooms > 0 && <Row label="Pièces" value={state.rooms} />}
          {state.bathrooms > 0 && <Row label="Salles de bain" value={state.bathrooms} />}
          {state.floor && <Row label="Étage" value={state.total_floors ? `${state.floor}/${state.total_floors}` : state.floor} />}
          {state.details.condition && <Row label="État" value={CONDITION_LABEL[state.details.condition]} />}
          {equip && <Row label="Équipements" value={equip} />}
          {state.address_text && <Row label="Adresse" value={state.address_text} />}
        </div>
      </div>

      {/* Description preview */}
      {state.description && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4">
          <p className="mb-1 text-xs font-semibold text-zinc-500">Description</p>
          <p className="line-clamp-4 text-sm text-zinc-700">{state.description}</p>
        </div>
      )}

      {/* Contact info */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">Vos coordonnées</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Téléphone de contact
            </label>
            <input
              type="tel"
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              placeholder="0555 XX XX XX"
              value={state.contact_phone}
              onChange={(e) => onChange({ contact_phone: e.target.value })}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={state.show_phone}
              onChange={(e) => onChange({ show_phone: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300 accent-amber-500"
            />
            <span className="text-sm text-zinc-700">Afficher mon numéro sur l'annonce</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={state.accept_messages}
              onChange={(e) => onChange({ accept_messages: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300 accent-amber-500"
            />
            <span className="text-sm text-zinc-700">Accepter les messages via la plateforme</span>
          </label>
        </div>
      </div>

      {/* Quota info */}
      {remaining > 0 && (
        <div className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-green-700">
            Votre annonce sera publiée immédiatement. Il vous restera{" "}
            <strong>{remaining - 1}</strong> emplacement{remaining - 1 !== 1 ? "s" : ""} libre{remaining - 1 !== 1 ? "s" : ""} sur {quota}.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:bg-zinc-800"
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending || !state.draft_listing_id}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-zinc-950 dark:text-zinc-50 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Publication...
            </>
          ) : (
            "Publier l'annonce →"
          )}
        </button>
      </div>
    </div>
  );
}
