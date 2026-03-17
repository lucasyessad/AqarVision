"use client";

import { useState, useTransition } from "react";
import { generateDescriptionIndividualAction } from "@/features/ai/actions/generate-description-individual.action";
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
  const [aiError, setAiError] = useState("");
  const [isPending, startTransition] = useTransition();

  const titleLen = state.title.length;
  const descLen = state.description.length;
  const titleOk = titleLen >= TITLE_MIN && titleLen <= TITLE_MAX;
  const descOk = descLen >= DESC_MIN && descLen <= DESC_MAX;
  const canProceed = titleOk && descOk;

  function handleGenerateAi() {
    setAiError("");
    startTransition(async () => {
      const result = await generateDescriptionIndividualAction({
        listing_type: state.listing_type,
        property_type: state.property_type,
        current_price: Number(state.current_price),
        surface_m2: state.surface_m2 ? Number(state.surface_m2) : undefined,
        rooms: state.rooms || undefined,
        bathrooms: state.bathrooms || undefined,
        floor: state.floor ? Number(state.floor) : undefined,
        wilaya_code: state.wilaya_code,
        commune_name: state.commune_name || undefined,
        details: state.details,
        condition: state.details.condition,
        year_built: state.year_built ? Number(state.year_built) : undefined,
      });

      if (result.success) {
        onChange({ description: result.data.text });
      } else {
        setAiError(result.error.message);
      }
    });
  }

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

      {/* AI suggestion panel */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Générer avec l'IA</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Claude rédige une description professionnelle à partir de vos informations. Vous pouvez la modifier ensuite.
            </p>
            <button
              type="button"
              onClick={handleGenerateAi}
              disabled={isPending || !state.wilaya_code || !state.listing_type}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 dark:text-zinc-50 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Rédaction en cours...
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Générer la description
                </>
              )}
            </button>
            {aiError && (
              <p className="mt-2 text-xs text-red-500">{aiError}</p>
            )}
          </div>
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
          disabled={!canProceed}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-50 transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
