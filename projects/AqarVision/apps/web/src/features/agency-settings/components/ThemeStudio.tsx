"use client";

import { useActionState, useState, useTransition } from "react";
import { THEME_REGISTRY } from "@/lib/themes/registry";
import { isThemeAvailable } from "@/lib/plan-gating";
import { updateAgencyThemeAction } from "../actions/update-agency-theme.action";
import { uploadBrandingAction } from "../actions/upload-branding.action";
import type { ActionResult } from "@/features/agencies/types/agency.types";
import type { BrandingType } from "../actions/upload-branding.action";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeStudioProps {
  currentTheme: string;
  currentPrimaryColor: string | null;
  currentAccentColor: string | null;
  currentSecondaryColor: string | null;
  currentLogoUrl: string | null;
  currentCoverUrl: string | null;
  agencyPlan: string;
  agencyName: string;
  agencySlug: string;
  agencyDescription: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan badge
// ─────────────────────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string | null }) {
  if (!plan) return null;
  const isEnt = plan === "enterprise";
  return (
    <span
      className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
      style={
        isEnt
          ? { background: "#F5F3FF", color: "#7C3AED" }
          : { background: "#EFF6FF", color: "#2563EB" }
      }
    >
      {isEnt ? "Enterprise" : "Pro"}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Storefront preview
// ─────────────────────────────────────────────────────────────────────────────

interface PreviewProps {
  themeId: string;
  primary: string;
  accent: string;
  secondary: string;
  logoUrl: string | null;
  coverUrl: string | null;
  agencyName: string;
  description: string | null;
}

function StorefrontPreview({
  themeId,
  primary,
  accent,
  secondary,
  logoUrl,
  coverUrl,
  agencyName,
  description,
}: PreviewProps) {
  const manifest = THEME_REGISTRY.find((t) => t.id === themeId);
  const isDark = manifest?.style.themeMode === "dark";
  const bg = isDark ? primary : "#f8fafc";
  const cardBg = isDark ? "rgba(255,255,255,0.07)" : "#ffffff";
  const textMain = isDark ? "#ffffff" : primary;
  const textMuted = isDark ? "rgba(255,255,255,0.55)" : "#718096";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";

  return (
    <div
      className="h-full overflow-hidden rounded-xl border text-[10px]"
      style={{
        background: bg,
        borderColor: isDark ? "rgba(255,255,255,0.15)" : "#E3E8EF",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Simulated nav */}
      <div
        className="flex h-7 items-center justify-between px-3"
        style={{
          background:
            manifest?.layout.header === "header-luxury"
              ? "transparent"
              : primary,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div className="flex items-center gap-1.5">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-4 w-4 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
              style={{ background: accent, color: isDark ? "#000" : "#fff" }}
            >
              {agencyName.charAt(0)}
            </div>
          )}
          <span
            className="font-semibold"
            style={{
              color:
                manifest?.layout.header === "header-minimal"
                  ? primary
                  : "#ffffff",
              fontSize: 9,
            }}
          >
            {agencyName}
          </span>
        </div>
        <div
          className="rounded px-2 py-0.5 text-[8px] font-semibold"
          style={{
            background: accent,
            color: isDark ? "#000" : "#fff",
          }}
        >
          Contact
        </div>
      </div>

      {/* Hero */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: primary,
          height:
            manifest?.sections.find((s) => s.variant === "hero-fullscreen")
              ? 80
              : manifest?.sections.find((s) => s.variant === "hero-medium")
                ? 56
                : 40,
        }}
      >
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: 0.35 }}
          />
        )}
        <div className="relative text-center px-2">
          <p
            className="font-bold leading-tight"
            style={{ color: "#fff", fontSize: 11 }}
          >
            {agencyName}
          </p>
          {description && (
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 8, marginTop: 2 }}>
              {description.slice(0, 40)}…
            </p>
          )}
          <div
            className="mx-auto mt-1.5"
            style={{ height: 1, width: 20, background: accent }}
          />
        </div>
      </div>

      {/* Content area */}
      <div className="flex gap-2 px-3 py-2.5">
        {/* Listings grid */}
        <div className="flex-1">
          <p
            className="mb-1.5 font-semibold"
            style={{ color: textMain, fontSize: 8 }}
          >
            Nos biens
          </p>
          <div className="grid grid-cols-2 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded"
                style={{ background: cardBg, border: `1px solid ${borderColor}` }}
              >
                <div
                  className="h-5 w-full"
                  style={{
                    background: isDark
                      ? `rgba(255,255,255,0.05)`
                      : `rgba(0,0,0,0.06)`,
                  }}
                />
                <div className="p-1">
                  <div
                    className="h-1 w-full rounded"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(0,0,0,0.1)",
                    }}
                  />
                  <div
                    className="mt-0.5 h-1 w-3/4 rounded"
                    style={{ background: accent, opacity: 0.7 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact sidebar */}
        <div className="w-14 shrink-0">
          <div
            className="rounded p-1.5"
            style={{ background: cardBg, border: `1px solid ${borderColor}` }}
          >
            <p
              className="mb-1 font-semibold"
              style={{ color: textMain, fontSize: 7 }}
            >
              Contact
            </p>
            <div
              className="w-full rounded py-0.5 text-center text-[7px] font-medium text-white"
              style={{ background: primary }}
            >
              Appeler
            </div>
            <div
              className="mt-0.5 w-full rounded border py-0.5 text-center text-[7px] font-medium"
              style={{ borderColor: primary, color: primary }}
            >
              Email
            </div>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div
        className="mt-auto flex h-5 items-center justify-center"
        style={{ background: isDark ? "rgba(0,0,0,0.5)" : primary }}
      >
        <span style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)", fontSize: 7 }}>
          footer — {agencyName}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────────────────────

function Steps({ current }: { current: number }) {
  const steps = ["Thème", "Couleurs", "Branding", "Aperçu & Valider"];
  return (
    <ol className="flex items-center gap-0">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <li key={idx} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  background: done
                    ? "#22c55e"
                    : active
                      ? "var(--coral)"
                      : "#E3E8EF",
                  color: done || active ? "#fff" : "#94a3b8",
                }}
              >
                {done ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx
                )}
              </span>
              <span
                className="text-xs font-medium hidden sm:block"
                style={{ color: active ? "var(--charcoal-950)" : "#94a3b8" }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="mx-3 h-px flex-1 w-6"
                style={{ background: done ? "#22c55e" : "#E3E8EF" }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline image upload zone (branding step)
// ─────────────────────────────────────────────────────────────────────────────

function InlineUploadZone({
  brandingType,
  currentUrl,
  onUploaded,
}: {
  brandingType: BrandingType;
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}) {
  type State = ActionResult<{ url: string; type: BrandingType }> | null;
  const [state, formAction, isPending] = useActionState<State, FormData>(
    uploadBrandingAction,
    null
  );
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [file, setFile] = useState<File | null>(null);

  // On success, propagate the URL up
  if (state?.success && state.data.url !== preview) {
    setPreview(state.data.url);
    onUploaded(state.data.url);
  }

  const isLogo = brandingType === "logo";
  const previewClass = isLogo
    ? "h-16 w-16 rounded-full"
    : "h-16 w-full rounded-lg";

  return (
    <div className="flex items-start gap-4">
      {/* Preview */}
      <div className={`shrink-0 overflow-hidden border bg-gray-100 ${previewClass}`} style={{ borderColor: "#E3E8EF" }}>
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Upload form */}
      <form action={formAction} className="flex-1">
        <input type="hidden" name="type" value={brandingType} />
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--charcoal-700)" }}>
            {isLogo ? "Logo (400×400 px, max 500 Ko)" : "Couverture (1200×400 px, max 2 Mo)"}
          </p>
          <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 transition-colors hover:border-[var(--coral)]"
            style={{ borderColor: file ? "var(--coral)" : "#E3E8EF" }}
          >
            <svg className="h-4 w-4 shrink-0" style={{ color: "var(--charcoal-400)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-xs" style={{ color: "var(--charcoal-500)" }}>
              {file ? file.name : "Choisir un fichier"}
            </span>
            <input
              type="file"
              name="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (f) {
                  const reader = new FileReader();
                  reader.onloadend = () => setPreview(reader.result as string);
                  reader.readAsDataURL(f);
                }
              }}
            />
          </label>
        </div>
        {file && (
          <button
            type="submit"
            disabled={isPending}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            style={{ background: "var(--coral)" }}
          >
            {isPending ? "Envoi…" : "Enregistrer"}
          </button>
        )}
        {state?.success === false && (
          <p className="mt-1 text-xs text-red-600">{state.error.message}</p>
        )}
        {state?.success === true && (
          <p className="mt-1 text-xs text-green-600">✓ Enregistré</p>
        )}
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ThemeStudio
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeStudio({
  currentTheme,
  currentPrimaryColor,
  currentAccentColor,
  currentSecondaryColor,
  currentLogoUrl,
  currentCoverUrl,
  agencyPlan,
  agencyName,
  agencyDescription,
  agencySlug,
}: ThemeStudioProps) {
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [primaryColor, setPrimaryColor] = useState(
    currentPrimaryColor ?? THEME_REGISTRY.find((t) => t.id === currentTheme)?.defaultColors.primary ?? "#1a365d"
  );
  const [accentColor, setAccentColor] = useState(
    currentAccentColor ?? THEME_REGISTRY.find((t) => t.id === currentTheme)?.defaultColors.accent ?? "#d4af37"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    currentSecondaryColor ?? THEME_REGISTRY.find((t) => t.id === currentTheme)?.defaultColors.secondary ?? "#2d5a8e"
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl);
  const [coverUrl, setCoverUrl] = useState<string | null>(currentCoverUrl);

  const [saveState, saveAction, isSaving] = useActionState<
    ActionResult<{ theme: string }> | null,
    FormData
  >(updateAgencyThemeAction, null);

  // When selecting a theme, auto-fill default colors
  function selectTheme(id: string) {
    setSelectedTheme(id);
    const manifest = THEME_REGISTRY.find((t) => t.id === id);
    if (manifest) {
      if (!currentPrimaryColor) setPrimaryColor(manifest.defaultColors.primary);
      if (!currentAccentColor) setAccentColor(manifest.defaultColors.accent);
      if (!currentSecondaryColor) setSecondaryColor(manifest.defaultColors.secondary);
    }
  }

  const manifest = THEME_REGISTRY.find((t) => t.id === selectedTheme);

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Step indicator */}
      <div
        className="rounded-xl border bg-white px-6 py-4"
        style={{ borderColor: "#E3E8EF" }}
      >
        <Steps current={step} />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: step content */}
        <div className="space-y-4">

          {/* ── STEP 1: Choose theme ── */}
          {step === 1 && (
            <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: "#E3E8EF" }}>
              <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
                <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                  Choisissez votre thème
                </h2>
                <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-500)" }}>
                  Sélectionnez le style visuel de votre vitrine publique.
                </p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {THEME_REGISTRY.map((theme) => {
                    const available = isThemeAvailable(theme.id, agencyPlan);
                    const isSelected = selectedTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        disabled={!available}
                        onClick={() => available && selectTheme(theme.id)}
                        className={[
                          "relative rounded-xl border-2 p-3 text-start transition-all focus:outline-none",
                          isSelected ? "shadow-sm" : "border-[#E3E8EF] hover:border-[var(--coral)]",
                          !available ? "cursor-not-allowed opacity-40 grayscale" : "cursor-pointer",
                        ].join(" ")}
                        style={isSelected ? { borderColor: "var(--coral)" } : {}}
                      >
                        {/* Locked */}
                        {!available && (
                          <span className="absolute end-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </span>
                        )}
                        {/* Selected tick */}
                        {isSelected && (
                          <span className="absolute end-2 top-2 flex h-4 w-4 items-center justify-center rounded-full text-white" style={{ background: "var(--coral)" }}>
                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}

                        {/* Color swatches */}
                        <div className="mb-2 flex h-5 overflow-hidden rounded">
                          <div className="flex-1" style={{ background: theme.defaultColors.primary }} />
                          <div className="flex-1" style={{ background: theme.defaultColors.accent }} />
                          <div className="flex-1" style={{ background: theme.defaultColors.secondary }} />
                        </div>

                        <p className="text-xs font-semibold leading-tight" style={{ color: "var(--charcoal-950)" }}>
                          {theme.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1">
                          <span className="text-[10px]" style={{ color: "var(--charcoal-400)" }}>
                            {theme.style.themeMode === "dark" ? "🌙 Sombre" : "☀️ Clair"}
                          </span>
                          <PlanBadge plan={theme.plan} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Colors ── */}
          {step === 2 && (
            <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: "#E3E8EF" }}>
              <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
                <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                  Personnalisez les couleurs
                </h2>
                <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-500)" }}>
                  Ces couleurs remplacent les valeurs par défaut du thème <strong>{manifest?.name}</strong>.
                </p>
              </div>
              <div className="space-y-5 p-6">
                {[
                  { label: "Couleur principale", value: primaryColor, onChange: setPrimaryColor },
                  { label: "Couleur d'accentuation", value: accentColor, onChange: setAccentColor },
                  { label: "Couleur secondaire", value: secondaryColor, onChange: setSecondaryColor },
                ].map(({ label, value, onChange }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--charcoal-800)" }}>{label}</p>
                      <p className="text-xs font-mono" style={{ color: "var(--charcoal-400)" }}>{value}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg border shadow-sm" style={{ borderColor: "#E3E8EF" }}>
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          className="h-12 w-12 -translate-x-1 -translate-y-1 cursor-pointer border-0 bg-transparent p-0"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Reset to defaults */}
                <button
                  type="button"
                  onClick={() => {
                    if (manifest) {
                      setPrimaryColor(manifest.defaultColors.primary);
                      setAccentColor(manifest.defaultColors.accent);
                      setSecondaryColor(manifest.defaultColors.secondary);
                    }
                  }}
                  className="text-xs underline transition-opacity hover:opacity-70"
                  style={{ color: "var(--charcoal-400)" }}
                >
                  Réinitialiser aux couleurs par défaut du thème
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Branding ── */}
          {step === 3 && (
            <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: "#E3E8EF" }}>
              <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
                <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                  Logo et image de couverture
                </h2>
                <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-500)" }}>
                  Ces visuels s&apos;affichent sur votre vitrine. Les modifications sont immédiates.
                </p>
              </div>
              <div className="space-y-6 p-6">
                <InlineUploadZone
                  brandingType="logo"
                  currentUrl={logoUrl}
                  onUploaded={(url) => setLogoUrl(url)}
                />
                <div className="border-t pt-6" style={{ borderColor: "#E3E8EF" }}>
                  <InlineUploadZone
                    brandingType="cover"
                    currentUrl={coverUrl}
                    onUploaded={(url) => setCoverUrl(url)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Preview & confirm ── */}
          {step === 4 && (
            <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: "#E3E8EF" }}>
              <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
                <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                  Vérifiez et confirmez
                </h2>
                <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-500)" }}>
                  L&apos;aperçu en temps réel est visible à droite. Cliquez sur "Appliquer" pour publier.
                </p>
              </div>
              <div className="p-6 space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Thème", value: manifest?.name ?? selectedTheme },
                    { label: "Mode", value: manifest?.style.themeMode === "dark" ? "Sombre" : "Clair" },
                    { label: "Logo", value: logoUrl ? "✓ Configuré" : "Non défini" },
                    { label: "Couverture", value: coverUrl ? "✓ Configurée" : "Non définie" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-lg p-3"
                      style={{ background: "#F6F9FC" }}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--charcoal-400)" }}>
                        {label}
                      </p>
                      <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--charcoal-800)" }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                {saveState?.success === false && (
                  <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {saveState.error.message}
                  </div>
                )}
                {saveState?.success === true && (
                  <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    ✓ Thème appliqué avec succès ! Votre vitrine est mise à jour.
                  </div>
                )}

                {/* Submit */}
                <form action={saveAction}>
                  <input type="hidden" name="theme" value={selectedTheme} />
                  <input type="hidden" name="primary_color" value={primaryColor} />
                  <input type="hidden" name="accent_color" value={accentColor} />
                  <input type="hidden" name="secondary_color" value={secondaryColor} />
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: "var(--coral)" }}
                    >
                      {isSaving ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Application…
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Appliquer le thème
                        </>
                      )}
                    </button>
                    <a
                      href={`/fr/a/${agencySlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs underline transition-opacity hover:opacity-70"
                      style={{ color: "var(--charcoal-500)" }}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      Ouvrir la vitrine
                    </a>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ borderColor: "#E3E8EF", color: "var(--charcoal-700)" }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Précédent
              </button>
            ) : (
              <div />
            )}
            {step < 4 && (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ background: "var(--coral)" }}
              >
                Suivant
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Right: live preview */}
        <div className="hidden lg:block">
          <div
            className="sticky top-4 overflow-hidden rounded-xl border bg-white"
            style={{ borderColor: "#E3E8EF" }}
          >
            <div className="border-b px-4 py-3" style={{ borderColor: "#E3E8EF" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--charcoal-700)" }}>
                Aperçu en direct
              </p>
              <p className="text-[10px]" style={{ color: "var(--charcoal-400)" }}>
                Thème : <strong>{manifest?.name ?? selectedTheme}</strong>
              </p>
            </div>
            <div className="p-3" style={{ background: "#F6F9FC", height: 420 }}>
              <StorefrontPreview
                themeId={selectedTheme}
                primary={primaryColor}
                accent={accentColor}
                secondary={secondaryColor}
                logoUrl={logoUrl}
                coverUrl={coverUrl}
                agencyName={agencyName}
                description={agencyDescription}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
