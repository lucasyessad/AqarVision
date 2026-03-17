"use client";

import type { WizardState } from "./wizard-state";

interface StepDetailsProps {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EQUIPMENT_OPTIONS: Array<{
  key: keyof WizardState["details"];
  label: string;
  icon: string;
}> = [
  { key: "has_elevator", label: "Ascenseur", icon: "M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" },
  { key: "has_parking", label: "Parking", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" },
  { key: "has_balcony", label: "Balcon", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { key: "has_pool", label: "Piscine", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
  { key: "has_garden", label: "Jardin", icon: "M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 001.06 1.06l1.59-1.59a.75.75 0 10-1.06-1.061l-1.59 1.59z" },
  { key: "furnished", label: "Meublé", icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },
  { key: "has_ac", label: "Climatisation", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
  { key: "has_heating", label: "Chauffage", icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" },
  { key: "sea_view", label: "Vue mer", icon: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" },
  { key: "has_terrace", label: "Terrasse", icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" },
  { key: "has_cave", label: "Cave", icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
  { key: "has_intercom", label: "Interphone", icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" },
  { key: "has_guardian", label: "Gardien", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
  { key: "has_digicode", label: "Digicode", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
];

const CONDITIONS = [
  { value: "new", label: "Neuf" },
  { value: "good", label: "Bon état" },
  { value: "renovation", label: "À rénover" },
  { value: "construction", label: "En construction" },
] as const;

const ORIENTATIONS = [
  { value: "north", label: "Nord" },
  { value: "south", label: "Sud" },
  { value: "east", label: "Est" },
  { value: "west", label: "Ouest" },
] as const;

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-zinc-700">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 transition-colors hover:bg-zinc-50 dark:bg-zinc-800"
        >
          –
        </button>
        <span className="w-8 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 transition-colors hover:bg-zinc-50 dark:bg-zinc-800"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function StepDetails({ state, onChange, onNext, onBack }: StepDetailsProps) {
  const { details } = state;

  function toggleDetail(key: keyof WizardState["details"]) {
    const val = details[key];
    onChange({
      details: {
        ...details,
        [key]: typeof val === "boolean" ? !val : val,
      },
    });
  }

  function toggleOrientation(dir: "north" | "south" | "east" | "west") {
    const cur = details.orientation ?? [];
    const next = cur.includes(dir) ? cur.filter((d) => d !== dir) : [...cur, dir];
    onChange({ details: { ...details, orientation: next } });
  }

  return (
    <div className="space-y-8">
      {/* Rooms / bathrooms */}
      <div className="flex gap-8">
        <Counter
          label="Pièces"
          value={state.rooms}
          onChange={(v) => onChange({ rooms: v })}
        />
        <Counter
          label="Salles de bain"
          value={state.bathrooms}
          onChange={(v) => onChange({ bathrooms: v })}
        />
      </div>

      {/* Equipment */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700">Équipements</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EQUIPMENT_OPTIONS.map(({ key, label, icon }) => {
            const val = details[key];
            const on = typeof val === "boolean" ? val : false;
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleDetail(key)}
                className={[
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all",
                  on
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 hover:border-zinc-300",
                ].join(" ")}
              >
                <svg className={["h-4 w-4 shrink-0", on ? "text-amber-600" : "text-zinc-400"].join(" ")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orientation */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700">Orientation (optionnel)</h3>
        <div className="flex gap-2">
          {ORIENTATIONS.map(({ value, label }) => {
            const on = (details.orientation ?? []).includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleOrientation(value)}
                className={[
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                  on
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 hover:border-zinc-300",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700">État du bien (optionnel)</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CONDITIONS.map(({ value, label }) => {
            const on = details.condition === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  onChange({
                    details: {
                      ...details,
                      condition: on ? undefined : value,
                    },
                  })
                }
                className={[
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                  on
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 hover:border-zinc-300",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

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
          onClick={onNext}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-50 transition-opacity hover:opacity-90"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
