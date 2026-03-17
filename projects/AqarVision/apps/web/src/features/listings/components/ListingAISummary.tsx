"use client";

import { useState } from "react";

interface AISummaryData {
  summary: string;
  strengths: string[];
  warnings: string[];
  questions: string[];
}

interface ListingAISummaryProps {
  data?: AISummaryData | null;
}

const SPARKLE_ICON = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

export function ListingAISummary({ data }: ListingAISummaryProps) {
  const [open, setOpen] = useState(false);

  if (!data) {
    return (
      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            {SPARKLE_ICON}
          </span>
          <p className="text-sm font-semibold text-zinc-700">Analyse IA non disponible</p>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          L&apos;analyse intelligente de cette annonce n&apos;a pas encore été générée.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white dark:border-amber-900/30 dark:from-zinc-900 dark:to-zinc-900">
      {/* Header — collapsible toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            {SPARKLE_ICON}
          </span>
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 dark:text-zinc-100">
            Analyse IA de cette annonce
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            Bêta
          </span>
        </div>
        <svg
          className={["h-4 w-4 text-zinc-400 transition-transform", open ? "rotate-180" : ""].join(" ")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Content */}
      {open && (
        <div className="border-t border-amber-100 px-5 pb-5 pt-4 dark:border-amber-900/20">
          {/* Summary */}
          <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {data.summary}
          </p>

          {/* Strengths / Warnings grid */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.strengths.length > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  Points forts
                </p>
                <ul className="space-y-1.5">
                  {data.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-950/20">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Points d&apos;attention
                </p>
                <ul className="space-y-1.5">
                  {data.warnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                      </svg>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Questions à poser */}
          {data.questions.length > 0 && (
            <div className="mb-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Questions à poser au vendeur
              </p>
              <ul className="space-y-1.5">
                {data.questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <span className="mt-0.5 font-mono text-zinc-400">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Analyse générée automatiquement par IA à partir des informations de l&apos;annonce. Non contractuelle.
          </p>
        </div>
      )}
    </div>
  );
}
