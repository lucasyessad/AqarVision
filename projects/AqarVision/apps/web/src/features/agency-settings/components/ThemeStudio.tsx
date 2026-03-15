"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { THEME_REGISTRY } from "@/lib/themes/registry";
import { getThemeById } from "@/lib/themes";
import { isThemeAvailable } from "@/lib/plan-gating";
import { updateAgencyThemeAction } from "../actions/update-agency-theme.action";
import { uploadBrandingAction } from "../actions/upload-branding.action";
import type { ActionResult } from "@/features/agencies/types/agency.types";
import type { BrandingType } from "../actions/upload-branding.action";

// Module-level constants (avoid per-render allocations)
const LISTING_INDICES = [0, 1, 2, 3] as const;
const NAV_LINKS = ["Biens", "Contact"] as const;

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
// Live preview — browser-frame mockup
// ─────────────────────────────────────────────────────────────────────────────

function LivePreview({
  themeId, primary, accent, secondary,
  logoUrl, coverUrl, agencyName, description,
}: {
  themeId: string; primary: string; accent: string; secondary: string;
  logoUrl: string | null; coverUrl: string | null;
  agencyName: string; description: string | null;
}) {
  const manifest = getThemeById(themeId);
  const isDark = manifest?.style.themeMode === "dark";
  const bg = isDark ? primary : "#f8fafc";
  const cardBg = isDark ? "rgba(255,255,255,0.08)" : "#ffffff";
  const textMain = isDark ? "#ffffff" : primary;
  const border = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const isLuxuryHeader = manifest?.layout.header === "header-luxury";
  const isMinimalHeader = manifest?.layout.header === "header-minimal";
  const hasFullscreenHero = manifest?.sections.some(s => s.variant === "hero-fullscreen") ?? false;
  const hasMediumHero = manifest?.sections.some(s => s.variant === "hero-medium") ?? false;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl shadow-2xl" style={{ border: "1px solid rgba(0,0,0,0.12)" }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 bg-[#1e1e1e] px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-2 flex flex-1 items-center gap-1.5 rounded-md bg-[#2d2d2d] px-3 py-1">
          <svg className="h-2.5 w-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[9px] text-gray-400">aqarvision.dz/a/{agencyName.toLowerCase().replace(/\s+/g, "-")}</span>
        </div>
      </div>

      {/* Agency nav */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: isLuxuryHeader ? "transparent" : isMinimalHeader ? "#ffffff" : primary,
          borderBottom: isMinimalHeader ? `1px solid ${border}` : "none",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-5 w-5 rounded-full object-cover ring-1 ring-white/30" />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold"
              style={{ background: accent, color: isDark ? "#000" : "#fff" }}>
              {agencyName.charAt(0)}
            </div>
          )}
          <span className="text-[10px] font-semibold" style={{ color: isMinimalHeader ? primary : "#fff" }}>
            {agencyName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {NAV_LINKS.map((l) => (
            <span key={l} className="text-[8px]" style={{ color: isMinimalHeader ? "#64748b" : "rgba(255,255,255,0.7)" }}>{l}</span>
          ))}
          <div className="rounded px-2 py-0.5 text-[7px] font-bold"
            style={{ background: isMinimalHeader ? primary : accent, color: isMinimalHeader ? "#fff" : isDark ? "#000" : "#fff" }}>
            Nous contacter
          </div>
        </div>
      </div>

      {/* Hero */}
      <div
        className="relative flex items-center justify-center"
        style={{
          background: primary,
          minHeight: hasFullscreenHero ? 120 : hasMediumHero ? 80 : 56,
        }}
      >
        {coverUrl && (
          <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: 0.4 }} />
        )}
        <div className="relative z-10 text-center px-3 py-4">
          {logoUrl && hasFullscreenHero && (
            <img src={logoUrl} alt="" className="mx-auto mb-2 h-8 w-8 rounded-full object-cover ring-1 ring-white/30 shadow-lg" />
          )}
          <p className="font-bold text-white drop-shadow" style={{ fontSize: 13 }}>{agencyName}</p>
          {description && (
            <p className="mt-0.5 text-white/70" style={{ fontSize: 8 }}>{description.slice(0, 45)}…</p>
          )}
          <div className="mx-auto mt-1.5 h-px w-8" style={{ background: accent }} />
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-3 px-3 py-3" style={{ background: bg, flex: 1 }}>
        {/* Listings */}
        <div className="flex-1">
          <p className="mb-1.5 text-[9px] font-semibold" style={{ color: textMain }}>Nos biens</p>
          <div className="grid grid-cols-2 gap-1.5">
            {LISTING_INDICES.map((i) => (
              <div key={i} className="overflow-hidden rounded-lg" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="h-6 w-full" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
                <div className="p-1.5">
                  <div className="h-1 w-full rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }} />
                  <div className="mt-1 h-1.5 w-3/4 rounded-full" style={{ background: accent, opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-16 shrink-0">
          <div className="rounded-lg p-2" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <p className="mb-1.5 text-[8px] font-semibold" style={{ color: textMain }}>Contact</p>
            <div className="mb-1 w-full rounded py-0.5 text-center text-[7px] font-bold text-white" style={{ background: primary }}>
              Appeler
            </div>
            <div className="w-full rounded border py-0.5 text-center text-[7px] font-bold" style={{ borderColor: primary, color: primary }}>
              Email
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex h-6 items-center justify-center" style={{ background: isDark ? "rgba(0,0,0,0.6)" : primary }}>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 7 }}>© {agencyName} — AqarVision</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step bar
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = ["Thème", "Couleurs", "Branding", "Aperçu"];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={idx} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all"
                style={{
                  background: done ? "#22c55e" : active ? "#0D0D0D" : "#f1f5f9",
                  color: done || active ? "#fff" : "#94a3b8",
                  boxShadow: active ? "0 0 0 4px rgba(13,13,13,0.12)" : "none",
                }}
              >
                {done ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : idx}
              </div>
              <span className="text-xs font-medium hidden sm:block"
                style={{ color: active ? "#0D0D0D" : done ? "#22c55e" : "#94a3b8" }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-3 h-px w-8 sm:w-12 transition-all"
                style={{ background: done ? "#22c55e" : "#e2e8f0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload zone (branding step)
// ─────────────────────────────────────────────────────────────────────────────

function UploadZone({
  brandingType, currentUrl, onUploaded, label, hint, aspectRatio,
}: {
  brandingType: BrandingType;
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  label: string;
  hint: string;
  aspectRatio: "square" | "wide";
}) {
  type State = ActionResult<{ url: string; type: BrandingType }> | null;
  const [state, formAction, isPending] = useActionState<State, FormData>(uploadBrandingAction, null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) {
      setPreview(state.data.url);
      onUploaded(state.data.url);
    }
  }, [state]);

  function handleFile(f: File | null) {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    let cancelled = false;
    reader.onloadend = () => { if (!cancelled) setPreview(reader.result as string); };
    reader.readAsDataURL(f);
    return () => { cancelled = true; };
  }

  const isSquare = aspectRatio === "square";

  return (
    <form action={formAction}>
      <input type="hidden" name="type" value={brandingType} />
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-sm font-semibold" style={{ color: "#0D0D0D" }}>{label}</p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>{hint}</p>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragging(false);
            const f = e.dataTransfer.files[0] ?? null;
            if (f && inputRef.current) {
              const dt = new DataTransfer(); dt.items.add(f);
              inputRef.current.files = dt.files;
            }
            handleFile(f);
          }}
          className="group relative cursor-pointer overflow-hidden rounded-xl transition-all"
          style={{
            border: `2px dashed ${dragging ? "#0D0D0D" : file ? "#0D0D0D" : "#e2e8f0"}`,
            background: dragging ? "rgba(13,13,13,0.03)" : "#fafafa",
            aspectRatio: isSquare ? "1/1" : "3/1",
            maxHeight: isSquare ? 140 : 160,
          }}
        >
          {preview ? (
            <>
              <img src={preview} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-xs font-semibold text-white">Changer</p>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-700">
                  Glissez ou <span className="text-[#0D0D0D] underline">choisissez</span>
                </p>
                <p className="mt-0.5 text-[10px] text-gray-400">PNG, JPEG, WebP</p>
              </div>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-2 flex items-center justify-between">
            <p className="truncate text-xs text-gray-500">{file.name}</p>
            <button
              type="submit"
              disabled={isPending}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "#0D0D0D" }}
            >
              {isPending ? "Envoi…" : "Enregistrer"}
            </button>
          </div>
        )}
        {state?.success === false && (
          <p className="mt-1 text-xs text-red-500">{state.error.message}</p>
        )}
        {state?.success === true && (
          <p className="mt-1 text-xs font-medium text-green-600">✓ Enregistré</p>
        )}
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Color picker row
// ─────────────────────────────────────────────────────────────────────────────

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-4 transition-shadow hover:shadow-sm" style={{ borderColor: "#e2e8f0" }}>
      <div
        className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg shadow-inner"
        style={{ border: "2px solid rgba(0,0,0,0.08)" }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-12 -translate-x-1 -translate-y-1 cursor-pointer border-0 bg-transparent p-0"
        />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: "#0D0D0D" }}>{label}</p>
        <p className="font-mono text-xs uppercase" style={{ color: "#94a3b8" }}>{value}</p>
      </div>
      <div className="h-8 w-8 rounded-full shadow-sm" style={{ background: value, border: "2px solid rgba(0,0,0,0.08)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ThemeStudio
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeStudio({
  currentTheme, currentPrimaryColor, currentAccentColor, currentSecondaryColor,
  currentLogoUrl, currentCoverUrl, agencyPlan, agencyName, agencySlug, agencyDescription,
}: ThemeStudioProps) {
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const initialTheme = getThemeById(currentTheme);
  const [primaryColor, setPrimaryColor] = useState(
    currentPrimaryColor ?? initialTheme?.defaultColors.primary ?? "#1a365d"
  );
  const [accentColor, setAccentColor] = useState(
    currentAccentColor ?? initialTheme?.defaultColors.accent ?? "#d4af37"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    currentSecondaryColor ?? initialTheme?.defaultColors.secondary ?? "#2d5a8e"
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl);
  const [coverUrl, setCoverUrl] = useState<string | null>(currentCoverUrl);

  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";

  const [saveState, saveAction, isSaving] = useActionState<
    ActionResult<{ theme: string }> | null, FormData
  >(updateAgencyThemeAction, null);

  const manifest = getThemeById(selectedTheme);

  function selectTheme(id: string) {
    setSelectedTheme(id);
    const m = getThemeById(id);
    if (m) {
      setPrimaryColor(m.defaultColors.primary);
      setAccentColor(m.defaultColors.accent);
      setSecondaryColor(m.defaultColors.secondary);
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-5">
      {/* Step bar */}
      <div className="flex items-center justify-between rounded-2xl border bg-white px-6 py-4" style={{ borderColor: "#e2e8f0" }}>
        <StepBar current={step} />
        {manifest && (
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-5 overflow-hidden rounded">
              {[manifest.defaultColors.primary, manifest.defaultColors.accent, manifest.defaultColors.secondary].map((c, i) => (
                <div key={i} className="w-5" style={{ background: c }} />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: "#64748b" }}>{manifest.name}</span>
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">

        {/* Left panel */}
        <div className="flex flex-col gap-5">

          {/* ── STEP 1: Themes ── */}
          {step === 1 && (
            <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#e2e8f0" }}>
              <div className="border-b px-6 py-5" style={{ borderColor: "#e2e8f0" }}>
                <h2 className="text-base font-bold" style={{ color: "#0D0D0D" }}>Choisissez un thème</h2>
                <p className="mt-0.5 text-sm" style={{ color: "#64748b" }}>
                  Sélectionnez le style visuel de votre vitrine publique.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 xl:grid-cols-4">
                {THEME_REGISTRY.map((theme) => {
                  const available = isThemeAvailable(theme.id, agencyPlan);
                  const isSelected = selectedTheme === theme.id;
                  const isDark = theme.style.themeMode === "dark";
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      disabled={!available}
                      onClick={() => available && selectTheme(theme.id)}
                      className={[
                        "group relative flex flex-col overflow-hidden rounded-xl text-start transition-all focus:outline-none",
                        !available ? "cursor-not-allowed opacity-40 grayscale" : "cursor-pointer",
                      ].join(" ")}
                      style={isSelected
                        ? { outline: "2px solid #0D0D0D", outlineOffset: "2px" }
                        : { outline: "2px solid transparent", outlineOffset: "2px" }}
                    >
                      {/* Visual swatch header */}
                      <div
                        className="relative flex h-14 items-center justify-center overflow-hidden"
                        style={{ background: theme.defaultColors.primary }}
                      >
                        <div className="flex gap-1.5">
                          <div className="h-3 w-3 rounded-full opacity-80" style={{ background: theme.defaultColors.accent }} />
                          <div className="h-3 w-3 rounded-full opacity-60" style={{ background: theme.defaultColors.secondary }} />
                        </div>
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {!available && (
                          <div className="absolute end-1.5 top-1.5">
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/90">
                              <svg className="h-2.5 w-2.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div
                        className="flex-1 px-2.5 py-2"
                        style={{ background: isDark ? "#1a1a1a" : "#f8fafc", borderTop: "1px solid rgba(0,0,0,0.06)" }}
                      >
                        <p className="text-xs font-semibold leading-tight" style={{ color: isDark ? "#fff" : "#0D0D0D" }}>
                          {theme.name}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[9px]" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#94a3b8" }}>
                            {isDark ? "🌙" : "☀️"} {theme.plan ? (theme.plan === "enterprise" ? "Enterprise" : "Pro") : "Gratuit"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 2: Colors ── */}
          {step === 2 && (
            <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#e2e8f0" }}>
              <div className="border-b px-6 py-5" style={{ borderColor: "#e2e8f0" }}>
                <h2 className="text-base font-bold" style={{ color: "#0D0D0D" }}>Personnalisez les couleurs</h2>
                <p className="mt-0.5 text-sm" style={{ color: "#64748b" }}>
                  Adaptez les couleurs du thème <strong>{manifest?.name}</strong> à votre identité.
                </p>
              </div>
              <div className="space-y-3 p-6">
                <ColorRow label="Couleur principale" value={primaryColor} onChange={setPrimaryColor} />
                <ColorRow label="Couleur d'accentuation" value={accentColor} onChange={setAccentColor} />
                <ColorRow label="Couleur secondaire" value={secondaryColor} onChange={setSecondaryColor} />
                <button
                  type="button"
                  onClick={() => {
                    if (manifest) {
                      setPrimaryColor(manifest.defaultColors.primary);
                      setAccentColor(manifest.defaultColors.accent);
                      setSecondaryColor(manifest.defaultColors.secondary);
                    }
                  }}
                  className="mt-1 flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                  style={{ color: "#94a3b8" }}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Réinitialiser aux couleurs du thème
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Branding ── */}
          {step === 3 && (
            <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#e2e8f0" }}>
              <div className="border-b px-6 py-5" style={{ borderColor: "#e2e8f0" }}>
                <h2 className="text-base font-bold" style={{ color: "#0D0D0D" }}>Logo & image de couverture</h2>
                <p className="mt-0.5 text-sm" style={{ color: "#64748b" }}>
                  Ces visuels s&apos;affichent sur votre vitrine publique.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-[140px_1fr]">
                {/* Logo */}
                <UploadZone
                  brandingType="logo"
                  currentUrl={logoUrl}
                  onUploaded={setLogoUrl}
                  label="Logo"
                  hint="400×400 px — max 500 Ko"
                  aspectRatio="square"
                />
                {/* Cover */}
                <UploadZone
                  brandingType="cover"
                  currentUrl={coverUrl}
                  onUploaded={setCoverUrl}
                  label="Image de couverture"
                  hint="1200×400 px — max 2 Mo"
                  aspectRatio="wide"
                />
              </div>
            </div>
          )}

          {/* ── STEP 4: Confirm ── */}
          {step === 4 && (
            <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#e2e8f0" }}>
              <div className="border-b px-6 py-5" style={{ borderColor: "#e2e8f0" }}>
                <h2 className="text-base font-bold" style={{ color: "#0D0D0D" }}>Prêt à publier</h2>
                <p className="mt-0.5 text-sm" style={{ color: "#64748b" }}>
                  Vérifiez l&apos;aperçu à droite, puis cliquez sur Appliquer.
                </p>
              </div>
              <div className="p-6 space-y-5">
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: "🎨", label: "Thème", value: manifest?.name ?? selectedTheme },
                    { icon: manifest?.style.themeMode === "dark" ? "🌙" : "☀️", label: "Mode", value: manifest?.style.themeMode === "dark" ? "Sombre" : "Clair" },
                    { icon: "🖼", label: "Logo", value: logoUrl ? "Configuré" : "Non défini" },
                    { icon: "🏞", label: "Couverture", value: coverUrl ? "Configurée" : "Non définie" },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="rounded-xl p-4" style={{ background: "#f8fafc" }}>
                      <p className="text-lg">{icon}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>{label}</p>
                      <p className="mt-0.5 text-sm font-semibold" style={{ color: "#0D0D0D" }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Color palette preview */}
                <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: "#f8fafc" }}>
                  <p className="text-sm font-medium" style={{ color: "#64748b" }}>Palette :</p>
                  <div className="flex gap-2">
                    {[
                      { c: primaryColor, label: "Principale" },
                      { c: accentColor, label: "Accentuation" },
                      { c: secondaryColor, label: "Secondaire" },
                    ].map(({ c, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full shadow-sm" style={{ background: c, border: "2px solid rgba(0,0,0,0.08)" }} />
                        <span className="font-mono text-[10px]" style={{ color: "#94a3b8" }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                {saveState?.success === false && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {saveState.error.message}
                  </div>
                )}
                {saveState?.success === true && (
                  <div className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thème appliqué ! Votre vitrine est mise à jour.
                  </div>
                )}

                {/* Actions */}
                <form action={saveAction}>
                  <input type="hidden" name="theme" value={selectedTheme} />
                  <input type="hidden" name="primary_color" value={primaryColor} />
                  <input type="hidden" name="accent_color" value={accentColor} />
                  <input type="hidden" name="secondary_color" value={secondaryColor} />
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                      style={{ background: "#0D0D0D" }}
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
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Appliquer le thème
                        </>
                      )}
                    </button>
                    <a
                      href={`/${locale}/a/${agencySlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50"
                      style={{ borderColor: "#e2e8f0", color: "#0D0D0D" }}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      Voir la vitrine
                    </a>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ borderColor: "#e2e8f0", color: "#0D0D0D" }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Précédent
              </button>
            ) : <div />}
            {step < 4 && (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
                style={{ background: "#0D0D0D" }}
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
          <div className="sticky top-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>
                Aperçu en direct
              </p>
              <a
                href={`/${locale}/a/${agencySlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] transition-opacity hover:opacity-60"
                style={{ color: "#94a3b8" }}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Ouvrir
              </a>
            </div>
            <LivePreview
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
  );
}
