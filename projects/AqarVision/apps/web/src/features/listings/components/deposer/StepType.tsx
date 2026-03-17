"use client";

import type { WizardState } from "./wizard-state";

const LISTING_TYPE_OPTIONS = [
  { value: "sale", label: "Vente", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { value: "rent", label: "Location", icon: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" },
  { value: "vacation", label: "Vacances", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: "apartment", label: "Appartement", icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" },
  { value: "villa", label: "Villa", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { value: "terrain", label: "Terrain", icon: "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" },
  { value: "commercial", label: "Local comm.", icon: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" },
  { value: "office", label: "Bureau", icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.193.163-.43.295-.69.39-.054.016-.108.03-.163.045m-4.5-8.41a48.107 48.107 0 00-3.413.387c-1.07.16-1.837 1.094-1.837 2.175v.75m0 0c-.175 0-.35.006-.523.018M3.75 8.25v.75m0 0c.522.005 1.044.015 1.565.031M3.75 8.25c-.176 0-.35-.006-.523-.018" },
  { value: "building", label: "Immeuble", icon: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M12 3.75h.008v.008H12V3.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
  { value: "farm", label: "Ferme", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
  { value: "warehouse", label: "Entrepôt", icon: "M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" },
];

interface StepTypeProps {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  onNext: () => void;
}

function SelectCard({
  value,
  label,
  icon,
  selected,
  onSelect,
  wide,
}: {
  value: string;
  label: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
        wide ? "min-w-[90px] flex-1" : "flex-1",
        selected
          ? "border-amber-500 bg-amber-50 shadow-sm"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300 hover:shadow-sm",
      ].join(" ")}
    >
      <svg
        className={["h-6 w-6", selected ? "text-amber-600" : "text-zinc-400"].join(" ")}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <span className={["text-xs font-semibold", selected ? "text-amber-700" : "text-zinc-700"].join(" ")}>
        {label}
      </span>
    </button>
  );
}

export function StepType({ state, onChange, onNext }: StepTypeProps) {
  const canProceed = !!state.listing_type && !!state.property_type;

  return (
    <div className="space-y-8">
      {/* Listing type */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">Type d'annonce</h2>
        <div className="flex gap-3">
          {LISTING_TYPE_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              value={opt.value}
              label={opt.label}
              icon={opt.icon}
              selected={state.listing_type === opt.value}
              onSelect={() => onChange({ listing_type: opt.value as WizardState["listing_type"] })}
            />
          ))}
        </div>
      </div>

      {/* Property type */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">Type de bien</h2>
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-4">
          {PROPERTY_TYPE_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              value={opt.value}
              label={opt.label}
              icon={opt.icon}
              selected={state.property_type === opt.value}
              onSelect={() => onChange({ property_type: opt.value })}
            />
          ))}
        </div>
      </div>

      {/* Next */}
      <div className="flex justify-end">
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
