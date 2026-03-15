"use client";

import { STEP_LABELS } from "./wizard-state";

interface WizardStepperProps {
  current: number; // 0-indexed
  total?: number;
}

export function WizardStepper({ current, total = 7 }: WizardStepperProps) {
  return (
    <>
      {/* Desktop — horizontal with labels */}
      <div className="mb-8 hidden sm:block">
        <div className="flex items-start">
          {STEP_LABELS.slice(0, total).map((label, i) => {
            const completed = i < current;
            const active = i === current;
            return (
              <div key={label} className="flex flex-1 flex-col items-center">
                <div className="relative flex w-full items-center">
                  {/* Left connector */}
                  {i > 0 && (
                    <div
                      className={[
                        "h-0.5 flex-1",
                        completed || active ? "bg-zinc-900" : "bg-zinc-200",
                      ].join(" ")}
                    />
                  )}
                  {/* Dot */}
                  <div
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                      completed
                        ? "bg-zinc-900 text-zinc-50"
                        : active
                        ? "bg-amber-500 text-zinc-950 ring-4 ring-amber-500/20"
                        : "bg-zinc-100 text-zinc-400",
                    ].join(" ")}
                  >
                    {completed ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  {/* Right connector */}
                  {i < total - 1 && (
                    <div
                      className={[
                        "h-0.5 flex-1",
                        completed ? "bg-zinc-900" : "bg-zinc-200",
                      ].join(" ")}
                    />
                  )}
                </div>
                <span
                  className={[
                    "mt-1.5 text-center text-[10px] font-medium",
                    active ? "text-amber-600" : completed ? "text-zinc-700" : "text-zinc-400",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile — compact: "Étape X / 7 — Label" */}
      <div className="mb-6 sm:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-zinc-950">
            {current + 1}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Étape {current + 1} sur {total}
            </p>
            <p className="text-sm font-semibold text-zinc-900">{STEP_LABELS[current]}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}
