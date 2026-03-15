"use client";

import { useActionState, useState, useEffect } from "react";
import { THEME_REGISTRY } from "@/lib/themes/registry";
import { isThemeAvailable } from "@/lib/plan-gating";
import { updateAgencyThemeAction } from "../actions/update-agency-theme.action";
import type { ActionResult } from "@/features/agencies/types/agency.types";

interface ThemePickerProps {
  currentTheme: string;
  currentPrimaryColor: string | null;
  currentAccentColor: string | null;
  currentSecondaryColor: string | null;
  agencyPlan: string;
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (!plan) return null;
  const label = plan === "enterprise" ? "Enterprise" : "Pro";
  const style =
    plan === "enterprise"
      ? { background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE" }
      : { background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" };
  return (
    <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={style}>
      {label}
    </span>
  );
}

function ColorSwatch({ primary, accent, secondary }: { primary: string; accent: string; secondary: string }) {
  return (
    <div className="mt-3 flex h-4 w-full overflow-hidden rounded">
      <div className="flex-1" style={{ backgroundColor: primary }} />
      <div className="flex-1" style={{ backgroundColor: accent }} />
      <div className="flex-1" style={{ backgroundColor: secondary }} />
    </div>
  );
}

export function ThemePicker({
  currentTheme,
  currentPrimaryColor,
  currentAccentColor,
  currentSecondaryColor,
  agencyPlan,
}: ThemePickerProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [primaryColor, setPrimaryColor] = useState(currentPrimaryColor ?? "#1a365d");
  const [accentColor, setAccentColor] = useState(currentAccentColor ?? "#d4af37");
  const [secondaryColor, setSecondaryColor] = useState(currentSecondaryColor ?? "#2d5a8e");

  const [state, formAction, isPending] = useActionState<
    ActionResult<{ theme: string }> | null,
    FormData
  >(updateAgencyThemeAction, null);

  useEffect(() => {
    const manifest = THEME_REGISTRY.find((t) => t.id === selectedTheme);
    if (manifest && !currentPrimaryColor) setPrimaryColor(manifest.defaultColors.primary);
    if (manifest && !currentAccentColor) setAccentColor(manifest.defaultColors.accent);
    if (manifest && !currentSecondaryColor) setSecondaryColor(manifest.defaultColors.secondary);
  }, [selectedTheme, currentPrimaryColor, currentAccentColor, currentSecondaryColor]);

  return (
    <div className="space-y-4">
      {/* Feedback banners */}
      {state?.success === false && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {state.error.message}
        </div>
      )}
      {state?.success === true && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Thème appliqué avec succès.
        </div>
      )}

      {/* ── Theme selection card ─────────────────────────────────── */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-zinc-950">
            Thème de la vitrine
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Le thème définit l'apparence de votre page publique.
          </p>
        </div>

        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {THEME_REGISTRY.map((theme) => {
              const available = isThemeAvailable(theme.id, agencyPlan);
              const isSelected = selectedTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  disabled={!available}
                  onClick={() => available && setSelectedTheme(theme.id)}
                  className={[
                    "relative rounded-lg border-2 p-4 text-start transition-all focus:outline-none",
                    isSelected
                      ? "border-rose-500 bg-rose-500/[0.04] shadow-sm"
                      : "border-zinc-200 bg-white hover:border-rose-500",
                    !available ? "cursor-not-allowed opacity-40 grayscale" : "cursor-pointer",
                  ].join(" ")}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <span
                      className="absolute end-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}

                  {/* Locked indicator */}
                  {!available && (
                    <span className="absolute end-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-1 pe-6">
                    <span className="text-sm font-semibold text-zinc-950">
                      {theme.name}
                    </span>
                    <PlanBadge plan={theme.plan} />
                  </div>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    {theme.style.themeMode === "dark" ? "Sombre" : "Clair"} &middot;{" "}
                    {theme.style.fontFamily === "elegant"
                      ? "Élégant"
                      : theme.style.fontFamily === "classic"
                        ? "Classique"
                        : "Moderne"}
                  </p>

                  <ColorSwatch
                    primary={theme.defaultColors.primary}
                    accent={theme.defaultColors.accent}
                    secondary={theme.defaultColors.secondary}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Custom colors card ───────────────────────────────────── */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-zinc-950">
            Couleurs personnalisées
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Ces couleurs remplacent les valeurs par défaut du thème sélectionné.
          </p>
        </div>

        {/* Color pickers row */}
        <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 p-6 sm:grid-cols-3">
          {[
            { label: "Couleur principale", value: primaryColor, onChange: setPrimaryColor },
            { label: "Couleur d'accentuation", value: accentColor, onChange: setAccentColor },
            { label: "Couleur secondaire", value: secondaryColor, onChange: setSecondaryColor },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="mb-1.5 block text-xs font-medium text-zinc-700">
                {label}
              </label>
              <div
                className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-2"
              >
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span className="font-mono text-sm text-zinc-700">
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Preview bar */}
        <div className="bg-zinc-50 px-6 py-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Aperçu
          </p>
          <div className="flex h-8 w-full overflow-hidden rounded-md shadow-sm">
            <div className="flex-1" style={{ backgroundColor: primaryColor }} />
            <div className="flex-[0.6]" style={{ backgroundColor: accentColor }} />
            <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
          </div>
        </div>
      </div>

      {/* ── Submit ───────────────────────────────────────────────── */}
      <form action={formAction}>
        <input type="hidden" name="theme" value={selectedTheme} />
        <input type="hidden" name="primary_color" value={primaryColor} />
        <input type="hidden" name="accent_color" value={accentColor} />
        <input type="hidden" name="secondary_color" value={secondaryColor} />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Application…
              </>
            ) : "Appliquer le thème"}
          </button>
        </div>
      </form>
    </div>
  );
}
