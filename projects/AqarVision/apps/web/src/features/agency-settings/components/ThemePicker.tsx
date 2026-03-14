"use client";

import { useActionState, useState, useEffect } from "react";
import { THEME_REGISTRY } from "@/lib/themes/registry";
import { isThemeAvailable } from "@/lib/plan-gating";
import { updateAgencyThemeAction } from "../actions/update-agency-theme.action";
import type { ActionResult } from "@/features/agencies/types/agency.types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ThemePickerProps {
  currentTheme: string;
  currentPrimaryColor: string | null;
  currentAccentColor: string | null;
  currentSecondaryColor: string | null;
  agencyPlan: string;
}

// ── Plan badge ────────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string | null }) {
  if (!plan) return null;
  const label = plan === "enterprise" ? "Enterprise" : "Pro";
  const cls =
    plan === "enterprise"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : "bg-blue-100 text-blue-700 border-blue-200";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

// ── Color swatch preview ──────────────────────────────────────────────────────

function ColorSwatch({
  primary,
  accent,
  secondary,
}: {
  primary: string;
  accent: string;
  secondary: string;
}) {
  return (
    <div className="mt-2 flex h-5 w-full overflow-hidden rounded">
      <div className="flex-1" style={{ backgroundColor: primary }} />
      <div className="flex-1" style={{ backgroundColor: accent }} />
      <div className="flex-1" style={{ backgroundColor: secondary }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ThemePicker({
  currentTheme,
  currentPrimaryColor,
  currentAccentColor,
  currentSecondaryColor,
  agencyPlan,
}: ThemePickerProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [primaryColor, setPrimaryColor] = useState(
    currentPrimaryColor ?? "#1a365d"
  );
  const [accentColor, setAccentColor] = useState(
    currentAccentColor ?? "#d4af37"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    currentSecondaryColor ?? "#2d5a8e"
  );

  const [state, formAction, isPending] = useActionState<
    ActionResult<{ theme: string }> | null,
    FormData
  >(updateAgencyThemeAction, null);

  // When theme changes, update color defaults from registry
  useEffect(() => {
    const manifest = THEME_REGISTRY.find((t) => t.id === selectedTheme);
    if (manifest && !currentPrimaryColor) {
      setPrimaryColor(manifest.defaultColors.primary);
    }
    if (manifest && !currentAccentColor) {
      setAccentColor(manifest.defaultColors.accent);
    }
    if (manifest && !currentSecondaryColor) {
      setSecondaryColor(manifest.defaultColors.secondary);
    }
  }, [selectedTheme, currentPrimaryColor, currentAccentColor, currentSecondaryColor]);

  return (
    <div className="space-y-8">
      {/* Status feedback */}
      {state?.success === false && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.error.message}
        </div>
      )}
      {state?.success === true && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          Thème appliqué avec succès.
        </div>
      )}

      {/* ── Theme grid ─────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-4 text-base font-semibold text-gray-800">
          Choisir un thème
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  "relative rounded-xl border-2 p-4 text-start transition-all focus:outline-none",
                  isSelected
                    ? "border-gold bg-gold/5 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300",
                  !available ? "cursor-not-allowed opacity-50 grayscale" : "cursor-pointer",
                ].join(" ")}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <span className="absolute end-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}

                {/* Theme name + plan badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {theme.name}
                  </span>
                  <PlanBadge plan={theme.plan} />
                </div>

                {/* Meta info */}
                <p className="mt-1 text-xs text-gray-500">
                  {theme.style.themeMode === "dark" ? "Sombre" : "Clair"} &middot;{" "}
                  {theme.style.fontFamily === "elegant"
                    ? "Élégant"
                    : theme.style.fontFamily === "classic"
                      ? "Classique"
                      : "Moderne"}
                </p>

                {/* Color swatch */}
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

      {/* ── Custom colors ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-1 text-base font-semibold text-gray-800">
          Couleurs personnalisées
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Ces couleurs remplacent les valeurs par défaut du thème sélectionné.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Primary */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Couleur principale
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-3 py-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-sm text-gray-600">
                {primaryColor}
              </span>
            </div>
          </div>

          {/* Accent */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Couleur d&apos;accentuation
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-3 py-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-sm text-gray-600">
                {accentColor}
              </span>
            </div>
          </div>

          {/* Secondary */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Couleur secondaire
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-3 py-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-sm text-gray-600">
                {secondaryColor}
              </span>
            </div>
          </div>
        </div>

        {/* Live preview bar */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Aperçu
          </p>
          <div
            className="flex h-10 w-full overflow-hidden rounded-lg shadow-sm"
            style={{
              ["--preview-primary" as string]: primaryColor,
              ["--preview-accent" as string]: accentColor,
              ["--preview-secondary" as string]: secondaryColor,
            }}
          >
            <div className="flex-1" style={{ backgroundColor: primaryColor }} />
            <div className="flex-[0.6]" style={{ backgroundColor: accentColor }} />
            <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
          </div>
        </div>
      </div>

      {/* ── Submit form (hidden inputs + button) ────────────────────── */}
      <form action={formAction}>
        <input type="hidden" name="theme" value={selectedTheme} />
        <input type="hidden" name="primary_color" value={primaryColor} />
        <input type="hidden" name="accent_color" value={accentColor} />
        <input type="hidden" name="secondary_color" value={secondaryColor} />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-night px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-night/90 disabled:opacity-50"
        >
          {isPending ? "Application en cours…" : "Appliquer le thème"}
        </button>
      </form>
    </div>
  );
}
