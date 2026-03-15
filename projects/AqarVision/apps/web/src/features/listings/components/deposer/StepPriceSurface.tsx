"use client";

import type { WizardState } from "./wizard-state";

interface StepPriceSurfaceProps {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const inputClass =
  "w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";

function InputWithSuffix({
  label,
  required,
  suffix,
  value,
  onChange,
  type = "number",
  placeholder,
  min,
  max,
}: {
  label: string;
  required?: boolean;
  suffix: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      <div className="flex overflow-hidden rounded-md border border-zinc-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20">
        <input
          type={type}
          className="min-w-0 flex-1 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
        />
        <span className="flex items-center border-s border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500">
          {suffix}
        </span>
      </div>
    </div>
  );
}

const FLOOR_APPLICABLE = ["apartment", "office", "building"];

export function StepPriceSurface({ state, onChange, onNext, onBack }: StepPriceSurfaceProps) {
  const price = Number(state.current_price);
  const surface = Number(state.surface_m2);
  const pricePerM2 = price > 0 && surface > 0 ? Math.round(price / surface) : null;
  const showFloor = FLOOR_APPLICABLE.includes(state.property_type);
  const canProceed = price > 0;

  return (
    <div className="space-y-6">
      <InputWithSuffix
        label="Prix"
        required
        suffix="DZD"
        value={state.current_price}
        onChange={(v) => onChange({ current_price: v })}
        placeholder="Ex : 12 000 000"
        min={0}
      />

      {pricePerM2 !== null && (
        <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          ≈ <span className="font-semibold text-zinc-700">{pricePerM2.toLocaleString("fr-DZ")} DZD/m²</span> (calculé automatiquement)
        </p>
      )}

      <InputWithSuffix
        label="Surface"
        suffix="m²"
        value={state.surface_m2}
        onChange={(v) => onChange({ surface_m2: v })}
        placeholder="Ex : 100"
        min={1}
      />

      {showFloor && (
        <div className="grid grid-cols-2 gap-3">
          <InputWithSuffix
            label="Étage"
            suffix="ème"
            value={state.floor}
            onChange={(v) => onChange({ floor: v })}
            placeholder="3"
            min={0}
            max={50}
          />
          <InputWithSuffix
            label="Total étages"
            suffix="étages"
            value={state.total_floors}
            onChange={(v) => onChange({ total_floors: v })}
            placeholder="5"
            min={1}
            max={50}
          />
        </div>
      )}

      <InputWithSuffix
        label="Année de construction (optionnel)"
        suffix="année"
        value={state.year_built}
        onChange={(v) => onChange({ year_built: v })}
        placeholder={String(new Date().getFullYear())}
        min={1900}
        max={new Date().getFullYear()}
      />

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
