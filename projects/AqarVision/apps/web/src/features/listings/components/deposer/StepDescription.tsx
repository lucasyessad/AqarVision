"use client";

import type { WizardState } from "./wizard-state";

interface StepDescriptionProps {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TITLE_MIN = 10;
const TITLE_MAX = 120;
const DESC_MIN = 50;
const DESC_MAX = 2000;

export function StepDescription({ state, onChange, onNext, onBack }: StepDescriptionProps) {
  const titleLen = state.title.length;
  const descLen = state.description.length;
  const titleOk = titleLen >= TITLE_MIN && titleLen <= TITLE_MAX;
  const descOk = descLen >= DESC_MIN && descLen <= DESC_MAX;
  const canProceed = titleOk && descOk;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700">
            Titre de l'annonce <span className="text-amber-500">*</span>
          </label>
          <span className={["text-xs", titleLen > TITLE_MAX ? "text-red-500" : "text-zinc-400"].join(" ")}>
            {titleLen}/{TITLE_MAX}
          </span>
        </div>
        <input
          type="text"
          className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          placeholder="Ex : F3 Appartement standing, vue dégagée..."
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
          maxLength={TITLE_MAX}
        />
        {titleLen > 0 && titleLen < TITLE_MIN && (
          <p className="mt-1 text-xs text-red-500">Min {TITLE_MIN} caractères</p>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700">
            Description <span className="text-amber-500">*</span>
          </label>
          <span className={["text-xs", descLen > DESC_MAX ? "text-red-500" : "text-zinc-400"].join(" ")}>
            {descLen}/{DESC_MAX}
          </span>
        </div>
        <textarea
          rows={8}
          className="w-full resize-y rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          placeholder="Décrivez votre bien : emplacement, état, atouts principaux..."
          value={state.description}
          onChange={(e) => onChange({ description: e.target.value })}
          maxLength={DESC_MAX}
        />
        {descLen > 0 && descLen < DESC_MIN && (
          <p className="mt-1 text-xs text-red-500">Min {DESC_MIN} caractères</p>
        )}
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
          disabled={!canProceed}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-50 transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
