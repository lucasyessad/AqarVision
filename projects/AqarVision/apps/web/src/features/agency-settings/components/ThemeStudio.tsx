"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import {
  Image as ImageIcon,
  Type,
  BarChart3,
  Eye,
  Check,
  Plus,
  Trash2,
  Upload,
  Video,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AGENCY_THEMES, type AgencyTheme } from "@/lib/themes/registry";
import {
  updateBrandingAction,
  updateStorefrontContentAction,
} from "../actions/agency-settings.action";
import type { StorefrontContentInput } from "../schemas/agency-settings.schema";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface ServiceItem {
  title: string;
  icon: string;
  text: string;
}

interface Agency {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  whatsapp_phone: string | null;
  email: string | null;
  logo_url: string | null;
  opening_hours: string | null;
  theme: string | null;
  branding: {
    primary_color?: string;
    accent_color?: string;
    secondary_color?: string;
  } | null;
  storefront_content: StorefrontContentInput | null;
}

interface ThemeStudioProps {
  agency: Agency;
  onUploadImage: (file: File, path: string) => Promise<string>;
}

type WizardStep = 1 | 2 | 3 | 4;

const WIZARD_STEPS = [
  { step: 1 as const, icon: ImageIcon, labelKey: "media" },
  { step: 2 as const, icon: Type, labelKey: "texts" },
  { step: 3 as const, icon: BarChart3, labelKey: "stats" },
  { step: 4 as const, icon: Eye, labelKey: "preview" },
] as const;

const THEME_EXTRA_FIELDS: Record<string, { key: string; labelKey: string; type: "text" | "textarea" }[]> = {
  "luxe-noir": [{ key: "golden_tagline", labelKey: "goldenTagline", type: "text" }],
  "neo-brutalist": [{ key: "manifesto", labelKey: "manifesto", type: "textarea" }],
  "corporate-navy": [{ key: "topbar_hours", labelKey: "topbarHours", type: "text" }],
  editorial: [{ key: "eyebrow", labelKey: "eyebrow", type: "text" }],
  "organique-eco": [{ key: "eco_certifications", labelKey: "ecoCertifications", type: "text" }],
};

const LUCIDE_ICON_OPTIONS = [
  "home", "key", "building-2", "map-pin", "shield-check", "heart",
  "trending-up", "users", "star", "award", "briefcase", "handshake",
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function ThemeStudio({ agency, onUploadImage }: ThemeStudioProps) {
  const t = useTranslations("agencySettings.themeStudio");
  const [isPending, startTransition] = useTransition();

  /* --- Theme selection state (Part 1) --- */
  const [selectedTheme, setSelectedTheme] = useState(agency.theme ?? "mediterranee");
  const [primaryColor, setPrimaryColor] = useState(agency.branding?.primary_color ?? "#0D9488");
  const [accentColor, setAccentColor] = useState(agency.branding?.accent_color ?? "#FBBF24");
  const [secondaryColor, setSecondaryColor] = useState(agency.branding?.secondary_color ?? "#F5F5F4");
  const [brandingSaved, setBrandingSaved] = useState(false);

  /* --- Wizard state (Part 2) --- */
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  /* Step 1 - Media */
  const [heroImageUrl, setHeroImageUrl] = useState(agency.storefront_content?.hero_image_url ?? "");
  const [extraPhotos, setExtraPhotos] = useState<string[]>(agency.storefront_content?.extra_photos ?? []);
  const [videoUrl, setVideoUrl] = useState(agency.storefront_content?.hero_video_url ?? "");

  /* Step 2 - Texts */
  const [tagline, setTagline] = useState(
    agency.storefront_content?.tagline ?? (agency.description?.slice(0, 80) ?? "")
  );
  const [aboutText, setAboutText] = useState(
    agency.storefront_content?.about_text ?? (agency.description ?? "")
  );
  const [services, setServices] = useState<ServiceItem[]>(
    agency.storefront_content?.services ?? []
  );

  /* Step 3 - Stats + Extras */
  const [yearsExperience, setYearsExperience] = useState<number | "">(
    agency.storefront_content?.custom_stats?.years_experience ?? ""
  );
  const [satisfiedClients, setSatisfiedClients] = useState<number | "">(
    agency.storefront_content?.custom_stats?.satisfied_clients ?? ""
  );
  const [themeExtras, setThemeExtras] = useState<Record<string, string>>(
    agency.storefront_content?.theme_extras ?? {}
  );

  /* --- Feedback --- */
  const [error, setError] = useState<string | null>(null);
  const [wizardSaved, setWizardSaved] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*  Handlers                                                                  */
  /* -------------------------------------------------------------------------- */

  function handleSaveBranding() {
    setError(null);
    setBrandingSaved(false);
    startTransition(async () => {
      const result = await updateBrandingAction(agency.id, {
        theme: selectedTheme,
        primary_color: primaryColor,
        accent_color: accentColor,
        secondary_color: secondaryColor,
      });
      if (!result.success) {
        setError(result.message ?? t("saveFailed"));
        return;
      }
      setBrandingSaved(true);
    });
  }

  function handlePublishStorefront() {
    setError(null);
    setWizardSaved(false);
    const content: StorefrontContentInput = {
      hero_image_url: heroImageUrl || undefined,
      hero_video_url: videoUrl || undefined,
      extra_photos: extraPhotos.length > 0 ? extraPhotos : undefined,
      tagline: tagline || undefined,
      about_text: aboutText || undefined,
      services: services.length > 0 ? services : undefined,
      custom_stats:
        yearsExperience !== "" || satisfiedClients !== ""
          ? {
              years_experience: yearsExperience !== "" ? Number(yearsExperience) : undefined,
              satisfied_clients: satisfiedClients !== "" ? Number(satisfiedClients) : undefined,
            }
          : undefined,
      theme_extras: Object.keys(themeExtras).length > 0 ? themeExtras : undefined,
    };

    startTransition(async () => {
      const result = await updateStorefrontContentAction(agency.id, content);
      if (!result.success) {
        setError(result.message ?? t("saveFailed"));
        return;
      }
      setWizardSaved(true);
    });
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>, target: "hero" | "extra") {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = `agencies/${agency.id}/storefront/${target}-${Date.now()}`;
      const url = await onUploadImage(file, path);
      if (target === "hero") {
        setHeroImageUrl(url);
      } else {
        setExtraPhotos((prev) => (prev.length < 4 ? [...prev, url] : prev));
      }
    } catch {
      setError(t("uploadFailed"));
    }
  }

  function addService() {
    if (services.length >= 4) return;
    setServices((prev) => [...prev, { title: "", icon: "home", text: "" }]);
  }

  function updateService(index: number, field: keyof ServiceItem, value: string) {
    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  const activeTheme = AGENCY_THEMES.find((th) => th.id === selectedTheme);
  const extraFields = THEME_EXTRA_FIELDS[selectedTheme] ?? [];
  const canPublish = !!heroImageUrl;

  /* -------------------------------------------------------------------------- */
  /*  Render — Part 1: Theme Selection                                         */
  /* -------------------------------------------------------------------------- */

  if (!wizardOpen) {
    return (
      <div className="space-y-8">
        {/* Theme grid */}
        <section>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
            {t("selectTheme")}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {AGENCY_THEMES.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                selected={selectedTheme === theme.id}
                onSelect={() => {
                  setSelectedTheme(theme.id);
                  setPrimaryColor(theme.primaryColor);
                  setAccentColor(theme.accentColor);
                  setSecondaryColor(theme.secondaryColor);
                }}
              />
            ))}
          </div>
        </section>

        {/* Color pickers */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {t("customizeColors")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <ColorPicker label={t("primaryColor")} value={primaryColor} onChange={setPrimaryColor} />
            <ColorPicker label={t("accentColor")} value={accentColor} onChange={setAccentColor} />
            <ColorPicker label={t("secondaryColor")} value={secondaryColor} onChange={setSecondaryColor} />
          </div>

          {/* Live preview swatch */}
          {activeTheme && (
            <div className="flex items-center gap-3 rounded-lg border border-stone-200 dark:border-stone-700 p-4 bg-stone-50 dark:bg-stone-900">
              <div className="h-10 w-10 rounded-md" style={{ backgroundColor: primaryColor }} />
              <div className="h-10 w-10 rounded-md" style={{ backgroundColor: accentColor }} />
              <div className="h-10 w-10 rounded-md" style={{ backgroundColor: secondaryColor }} />
              <span className="text-sm text-stone-600 dark:text-stone-400 ms-2">
                {activeTheme.name} — {activeTheme.fontFamily}
              </span>
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="primary" loading={isPending} onClick={handleSaveBranding}>
            {t("saveBranding")}
          </Button>
          <Button variant="outline" onClick={() => setWizardOpen(true)}>
            <Sparkles size={16} aria-hidden="true" />
            {t("customizeStorefront")}
          </Button>
        </div>

        {brandingSaved && (
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <Check size={14} aria-hidden="true" />
            {t("brandingSaved")}
          </p>
        )}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*  Render — Part 2: Storefront Wizard                                       */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Header + close */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {t("storefrontWizard")}
        </h3>
        <button
          type="button"
          onClick={() => setWizardOpen(false)}
          className="rounded-md p-1.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label={t("close")}
        >
          <X size={20} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-1.5 w-full rounded-full bg-stone-200 dark:bg-stone-700">
          <div
            className="h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between">
          {WIZARD_STEPS.map(({ step, icon: Icon, labelKey }) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(step)}
              className={cn(
                "flex flex-col items-center gap-1 text-xs transition-colors",
                currentStep >= step
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-stone-400 dark:text-stone-500"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  currentStep === step
                    ? "border-teal-600 dark:border-teal-400 bg-teal-600 dark:bg-teal-400 text-white dark:text-stone-950"
                    : currentStep > step
                      ? "border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400"
                      : "border-stone-300 dark:border-stone-600 text-stone-400 dark:text-stone-500"
                )}
              >
                {currentStep > step ? <Check size={14} /> : <Icon size={14} />}
              </span>
              <span className="hidden sm:inline">{t(`step.${labelKey}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[320px]">
        {currentStep === 1 && (
          <StepMedia
            t={t}
            heroImageUrl={heroImageUrl}
            extraPhotos={extraPhotos}
            videoUrl={videoUrl}
            onVideoUrlChange={setVideoUrl}
            onHeroUpload={(e) => handleImageUpload(e, "hero")}
            onExtraUpload={(e) => handleImageUpload(e, "extra")}
            onRemoveExtra={(idx) => setExtraPhotos((p) => p.filter((_, i) => i !== idx))}
          />
        )}

        {currentStep === 2 && (
          <StepTexts
            t={t}
            tagline={tagline}
            aboutText={aboutText}
            services={services}
            onTaglineChange={setTagline}
            onAboutTextChange={setAboutText}
            onAddService={addService}
            onUpdateService={updateService}
            onRemoveService={removeService}
          />
        )}

        {currentStep === 3 && (
          <StepStats
            t={t}
            yearsExperience={yearsExperience}
            satisfiedClients={satisfiedClients}
            themeExtras={themeExtras}
            extraFields={extraFields}
            onYearsChange={setYearsExperience}
            onClientsChange={setSatisfiedClients}
            onExtrasChange={setThemeExtras}
          />
        )}

        {currentStep === 4 && (
          <StepPreview
            t={t}
            agencyName={agency.name}
            heroImageUrl={heroImageUrl}
            tagline={tagline}
            aboutText={aboutText}
            services={services}
            yearsExperience={yearsExperience}
            satisfiedClients={satisfiedClients}
            themeName={activeTheme?.name ?? ""}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-700 pt-4">
        <Button
          variant="ghost"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s))}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t("previous")}
        </Button>

        {currentStep < 4 ? (
          <Button
            variant="primary"
            onClick={() => setCurrentStep((s) => (s < 4 ? ((s + 1) as WizardStep) : s))}
          >
            {t("next")}
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        ) : (
          <Button
            variant="secondary"
            loading={isPending}
            disabled={!canPublish}
            onClick={handlePublishStorefront}
          >
            {t("publishStorefront")}
          </Button>
        )}
      </div>

      {wizardSaved && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5">
          <Check size={14} aria-hidden="true" />
          {t("storefrontPublished")}
        </p>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function ThemeCard({
  theme,
  selected,
  onSelect,
}: {
  theme: AgencyTheme;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all",
        "hover:shadow-md",
        selected
          ? "border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/30"
          : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-600"
      )}
    >
      {selected && (
        <span className="absolute top-2 end-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 dark:bg-teal-400 text-white dark:text-stone-950">
          <Check size={12} />
        </span>
      )}
      {/* Mini swatch */}
      <div className="flex gap-1">
        <span className="h-6 w-6 rounded" style={{ backgroundColor: theme.primaryColor }} />
        <span className="h-6 w-6 rounded" style={{ backgroundColor: theme.accentColor }} />
        <span className="h-6 w-6 rounded" style={{ backgroundColor: theme.secondaryColor }} />
      </div>
      <span className="text-xs font-medium text-stone-800 dark:text-stone-200 line-clamp-1">
        {theme.name}
      </span>
    </button>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded-md border border-stone-300 dark:border-stone-600 bg-transparent p-0.5"
        />
        <span className="text-sm font-mono text-stone-600 dark:text-stone-400">{value}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 1 — Media                                                            */
/* -------------------------------------------------------------------------- */

function StepMedia({
  t,
  heroImageUrl,
  extraPhotos,
  videoUrl,
  onVideoUrlChange,
  onHeroUpload,
  onExtraUpload,
  onRemoveExtra,
}: {
  t: ReturnType<typeof useTranslations>;
  heroImageUrl: string;
  extraPhotos: string[];
  videoUrl: string;
  onVideoUrlChange: (v: string) => void;
  onHeroUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onExtraUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveExtra: (idx: number) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Hero image */}
      <div>
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          {t("heroImage")} <span className="text-red-500">*</span>
        </p>
        {heroImageUrl ? (
          <div className="relative aspect-[2.4/1] overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700">
            <img src={heroImageUrl} alt="" className="h-full w-full object-cover" />
            <label className="absolute bottom-2 end-2 cursor-pointer rounded-md bg-white/90 dark:bg-stone-900/90 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 transition-colors">
              {t("replace")}
              <input type="file" accept="image/*" className="sr-only" onChange={onHeroUpload} />
            </label>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 py-12 text-stone-500 dark:text-stone-400 hover:border-teal-400 dark:hover:border-teal-600 transition-colors">
            <Upload size={24} />
            <span className="text-sm">{t("uploadHero")}</span>
            <span className="text-xs text-stone-400 dark:text-stone-500">{t("heroMinSize")}</span>
            <input type="file" accept="image/*" className="sr-only" onChange={onHeroUpload} />
          </label>
        )}
      </div>

      {/* Extra photos */}
      <div>
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          {t("extraPhotos")}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {extraPhotos.map((url, idx) => (
            <div key={idx} className="group relative aspect-video overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveExtra(idx)}
                className="absolute top-1 end-1 rounded-full bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t("remove")}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {extraPhotos.length < 4 && (
            <label className="flex cursor-pointer items-center justify-center aspect-video rounded-lg border-2 border-dashed border-stone-300 dark:border-stone-600 text-stone-400 dark:text-stone-500 hover:border-teal-400 dark:hover:border-teal-600 transition-colors">
              <Plus size={20} />
              <input type="file" accept="image/*" className="sr-only" onChange={onExtraUpload} />
            </label>
          )}
        </div>
      </div>

      {/* Video URL */}
      <Input
        label={t("videoUrl")}
        placeholder="https://youtube.com/watch?v=... / https://vimeo.com/..."
        value={videoUrl}
        onChange={(e) => onVideoUrlChange(e.target.value)}
        startIcon={<Video size={16} />}
        helperText={t("videoHelper")}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 2 — Texts                                                            */
/* -------------------------------------------------------------------------- */

function StepTexts({
  t,
  tagline,
  aboutText,
  services,
  onTaglineChange,
  onAboutTextChange,
  onAddService,
  onUpdateService,
  onRemoveService,
}: {
  t: ReturnType<typeof useTranslations>;
  tagline: string;
  aboutText: string;
  services: ServiceItem[];
  onTaglineChange: (v: string) => void;
  onAboutTextChange: (v: string) => void;
  onAddService: () => void;
  onUpdateService: (idx: number, field: keyof ServiceItem, value: string) => void;
  onRemoveService: (idx: number) => void;
}) {
  return (
    <div className="space-y-6">
      <Input
        label={t("tagline")}
        value={tagline}
        onChange={(e) => onTaglineChange(e.target.value)}
        maxLength={80}
        helperText={`${tagline.length}/80`}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {t("aboutText")}
        </label>
        <textarea
          value={aboutText}
          onChange={(e) => onAboutTextChange(e.target.value)}
          maxLength={500}
          rows={4}
          className={cn(
            "w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-950 px-3 py-2",
            "text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950",
            "transition-colors duration-fast"
          )}
        />
        <p className="text-xs text-stone-500 dark:text-stone-400">{aboutText.length}/500</p>
      </div>

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("services")}</p>
          {services.length < 4 && (
            <Button variant="ghost" size="sm" onClick={onAddService}>
              <Plus size={14} aria-hidden="true" />
              {t("addService")}
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="flex gap-3 rounded-lg border border-stone-200 dark:border-stone-700 p-3 bg-white dark:bg-stone-900"
            >
              <select
                value={svc.icon}
                onChange={(e) => onUpdateService(idx, "icon", e.target.value)}
                className="h-10 w-28 shrink-0 rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-950 px-2 text-sm text-stone-900 dark:text-stone-100"
                aria-label={t("iconLabel")}
              >
                {LUCIDE_ICON_OPTIONS.map((ico) => (
                  <option key={ico} value={ico}>{ico}</option>
                ))}
              </select>
              <div className="flex flex-1 flex-col gap-2">
                <input
                  value={svc.title}
                  onChange={(e) => onUpdateService(idx, "title", e.target.value)}
                  placeholder={t("serviceTitle")}
                  maxLength={50}
                  className="h-10 w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-950 px-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400"
                />
                <input
                  value={svc.text}
                  onChange={(e) => onUpdateService(idx, "text", e.target.value)}
                  placeholder={t("serviceText")}
                  maxLength={200}
                  className="h-10 w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-950 px-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveService(idx)}
                className="self-start rounded-md p-2 text-stone-400 dark:text-stone-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                aria-label={t("remove")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 3 — Stats + Theme Extras                                             */
/* -------------------------------------------------------------------------- */

function StepStats({
  t,
  yearsExperience,
  satisfiedClients,
  themeExtras,
  extraFields,
  onYearsChange,
  onClientsChange,
  onExtrasChange,
}: {
  t: ReturnType<typeof useTranslations>;
  yearsExperience: number | "";
  satisfiedClients: number | "";
  themeExtras: Record<string, string>;
  extraFields: { key: string; labelKey: string; type: "text" | "textarea" }[];
  onYearsChange: (v: number | "") => void;
  onClientsChange: (v: number | "") => void;
  onExtrasChange: (v: Record<string, string>) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Auto stats info */}
      <div className="rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 p-4">
        <p className="text-sm text-teal-800 dark:text-teal-300">{t("autoStatsInfo")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t("yearsExperience")}
          type="number"
          min={0}
          max={100}
          value={yearsExperience === "" ? "" : String(yearsExperience)}
          onChange={(e) => onYearsChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
        <Input
          label={t("satisfiedClients")}
          type="number"
          min={0}
          max={100000}
          value={satisfiedClients === "" ? "" : String(satisfiedClients)}
          onChange={(e) => onClientsChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      </div>

      {/* Theme-specific extras */}
      {extraFields.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            {t("themeExtras")}
          </h4>
          {extraFields.map((field) =>
            field.type === "textarea" ? (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {t(`extras.${field.labelKey}`)}
                </label>
                <textarea
                  value={themeExtras[field.key] ?? ""}
                  onChange={(e) =>
                    onExtrasChange({ ...themeExtras, [field.key]: e.target.value })
                  }
                  rows={3}
                  className={cn(
                    "w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-950 px-3 py-2",
                    "text-sm text-stone-900 dark:text-stone-100",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950"
                  )}
                />
              </div>
            ) : (
              <Input
                key={field.key}
                label={t(`extras.${field.labelKey}`)}
                value={themeExtras[field.key] ?? ""}
                onChange={(e) =>
                  onExtrasChange({ ...themeExtras, [field.key]: e.target.value })
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 4 — Preview                                                          */
/* -------------------------------------------------------------------------- */

function StepPreview({
  t,
  agencyName,
  heroImageUrl,
  tagline,
  aboutText,
  services,
  yearsExperience,
  satisfiedClients,
  themeName,
}: {
  t: ReturnType<typeof useTranslations>;
  agencyName: string;
  heroImageUrl: string;
  tagline: string;
  aboutText: string;
  services: ServiceItem[];
  yearsExperience: number | "";
  satisfiedClients: number | "";
  themeName: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        {t("previewDescription", { theme: themeName })}
      </p>

      {/* Mini preview card */}
      <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        {/* Hero */}
        {heroImageUrl && (
          <div className="relative aspect-[2.4/1] overflow-hidden">
            <img src={heroImageUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 to-transparent" />
            <div className="absolute bottom-4 start-4 text-white">
              <h2 className="text-xl font-bold">{agencyName}</h2>
              {tagline && <p className="text-sm opacity-90 mt-1">{tagline}</p>}
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* About */}
          {aboutText && (
            <div>
              <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1">
                {t("about")}
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-3">{aboutText}</p>
            </div>
          )}

          {/* Services */}
          {services.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {services.map((svc, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-stone-50 dark:bg-stone-800 p-3"
                >
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{svc.title}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">{svc.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {(yearsExperience !== "" || satisfiedClients !== "") && (
            <div className="flex gap-6 border-t border-stone-100 dark:border-stone-800 pt-3">
              {yearsExperience !== "" && (
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-500">{yearsExperience}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{t("yearsLabel")}</p>
                </div>
              )}
              {satisfiedClients !== "" && (
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-500">{satisfiedClients}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{t("clientsLabel")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
