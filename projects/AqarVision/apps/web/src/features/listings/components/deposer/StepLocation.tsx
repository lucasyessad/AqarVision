"use client";

import { useState, useEffect } from "react";
import type { WizardState } from "./wizard-state";

interface Wilaya {
  code: string;
  name: string;
}

interface Commune {
  id: number;
  name_fr: string;
}

interface StepLocationProps {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  wilayas: Wilaya[];
}

const inputClass =
  "w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";

export function StepLocation({ state, onChange, onNext, onBack, wilayas }: StepLocationProps) {
  const [communes, setCommunes] = useState<Commune[]>([]);
  const canProceed = !!state.wilaya_code;

  // Load communes when wilaya changes
  useEffect(() => {
    if (!state.wilaya_code) {
      setCommunes([]);
      return;
    }
    void (async () => {
      const res = await fetch(`/api/communes?wilaya_code=${state.wilaya_code}`);
      if (res.ok) {
        const data = await res.json() as { communes: Commune[] };
        setCommunes(data.communes ?? []);
      }
    })();
  }, [state.wilaya_code]);

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          Wilaya <span className="text-amber-500">*</span>
        </label>
        <select
          className={inputClass}
          value={state.wilaya_code}
          onChange={(e) => {
            const selected = wilayas.find((w) => w.code === e.target.value);
            onChange({
              wilaya_code: e.target.value,
              wilaya_name: selected?.name ?? "",
              commune_id: null,
              commune_name: "",
            });
          }}
        >
          <option value="">Sélectionner une wilaya</option>
          {wilayas.map((w) => (
            <option key={w.code} value={w.code}>
              {String(w.code).padStart(2, "0")} – {w.name}
            </option>
          ))}
        </select>
      </div>

      {communes.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Commune</label>
          <select
            className={inputClass}
            value={state.commune_id ?? ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              const c = communes.find((c) => c.id === id);
              onChange({ commune_id: id || null, commune_name: c?.name_fr ?? "" });
            }}
          >
            <option value="">Toute la wilaya</option>
            {communes.map((c) => (
              <option key={c.id} value={c.id}>{c.name_fr}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          Adresse (optionnel)
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="Rue, quartier, cité..."
          value={state.address_text}
          onChange={(e) => onChange({ address_text: e.target.value })}
          maxLength={200}
        />
      </div>

      {/* Map placeholder — MapLibre integration point */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          Localisation sur la carte (optionnel)
        </label>
        <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-center">
          <div className="space-y-1">
            <svg className="mx-auto h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="text-xs text-zinc-400">
              Carte disponible prochainement
            </p>
          </div>
        </div>
        {(state.latitude !== null && state.longitude !== null) && (
          <p className="mt-1 text-xs text-zinc-500">
            Lat : {state.latitude.toFixed(4)} · Lng : {state.longitude.toFixed(4)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-50 transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
