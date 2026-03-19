"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Home,
  Building2,
  Landmark,
  Store,
  Briefcase,
  Building,
  Wheat,
  Warehouse,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Search,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WilayaCommuneAutocomplete } from "@/components/ui/WilayaCommuneAutocomplete";
import type { PropertyType, ListingType } from "@/features/listings/schemas/listing.schema";

interface EstimationData {
  listingType: ListingType | null;
  propertyType: PropertyType | null;
  wilayaCode: string | null;
  communeId: number | null;
  area: number | null;
  rooms: number | null;
  floor: number | null;
  yearBuilt: number | null;
  hasParking: boolean;
  hasElevator: boolean;
  hasSeaview: boolean;
  furnished: boolean;
}

const INITIAL_DATA: EstimationData = {
  listingType: null,
  propertyType: null,
  wilayaCode: null,
  communeId: null,
  area: null,
  rooms: null,
  floor: null,
  yearBuilt: null,
  hasParking: false,
  hasElevator: false,
  hasSeaview: false,
  furnished: false,
};

const PROPERTY_TYPES: { value: PropertyType; icon: typeof Home }[] = [
  { value: "apartment", icon: Building2 },
  { value: "villa", icon: Home },
  { value: "terrain", icon: Landmark },
  { value: "commercial", icon: Store },
  { value: "office", icon: Briefcase },
  { value: "building", icon: Building },
  { value: "farm", icon: Wheat },
  { value: "warehouse", icon: Warehouse },
];

const LISTING_TYPES: { value: ListingType; labelKey: string }[] = [
  { value: "sale", labelKey: "sale" },
  { value: "rent", labelKey: "rent" },
];

// Base price per m2 by wilaya (DZD) — simplified model
const BASE_PRICE_PER_M2: Record<string, { sale: number; rent: number }> = {
  "16": { sale: 250000, rent: 1200 }, // Alger
  "31": { sale: 180000, rent: 900 }, // Oran
  "25": { sale: 160000, rent: 800 }, // Constantine
  "09": { sale: 140000, rent: 700 }, // Blida
  "35": { sale: 130000, rent: 650 }, // Boumerdes
  "15": { sale: 120000, rent: 600 }, // Tizi Ouzou
  "06": { sale: 150000, rent: 750 }, // Bejaia
  "42": { sale: 110000, rent: 550 }, // Tipaza
  "19": { sale: 100000, rent: 500 }, // Setif
  "23": { sale: 95000, rent: 480 }, // Annaba
};

const DEFAULT_BASE: { sale: number; rent: number } = { sale: 80000, rent: 400 };

function estimatePrice(data: EstimationData): { min: number; max: number } | null {
  if (!data.listingType || !data.area || !data.wilayaCode) return null;

  const base = BASE_PRICE_PER_M2[data.wilayaCode] ?? DEFAULT_BASE;
  const pricePerM2 = data.listingType === "rent" ? base.rent : base.sale;
  let basePriceTotal = pricePerM2 * data.area;

  // Modifiers
  let modifier = 1.0;

  if (data.propertyType === "villa") modifier *= 1.3;
  else if (data.propertyType === "terrain") modifier *= 0.6;
  else if (data.propertyType === "commercial") modifier *= 1.2;

  if (data.rooms && data.rooms >= 5) modifier *= 1.1;

  if (data.floor !== null && data.floor !== undefined) {
    if (data.floor >= 4) modifier *= 1.05;
    if (data.floor === 0) modifier *= 0.9;
  }

  if (data.yearBuilt && data.yearBuilt >= 2020) modifier *= 1.15;
  else if (data.yearBuilt && data.yearBuilt < 1990) modifier *= 0.85;

  if (data.hasParking) modifier *= 1.05;
  if (data.hasElevator) modifier *= 1.03;
  if (data.hasSeaview) modifier *= 1.2;
  if (data.furnished && data.listingType === "rent") modifier *= 1.3;

  basePriceTotal *= modifier;

  const min = Math.round(basePriceTotal * 0.85);
  const max = Math.round(basePriceTotal * 1.15);

  return { min, max };
}

function formatDZD(value: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function EstimationWizard() {
  const t = useTranslations("estimation");
  const tCommon = useTranslations("common");
  const [step, setStep] = useState(0);
  const [data, setData] = useState<EstimationData>(INITIAL_DATA);

  const totalSteps = 3;

  const canGoNext =
    step === 0
      ? data.propertyType !== null && data.listingType !== null
      : step === 1
        ? data.wilayaCode !== null && data.communeId !== null && data.area !== null && data.area > 0
        : true;

  const result = step === 2 ? estimatePrice(data) : null;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 h-1.5 rounded-full transition-colors",
              i <= step
                ? "bg-teal-600 dark:bg-teal-400"
                : "bg-stone-200 dark:bg-stone-700"
            )}
          />
        ))}
      </div>

      {/* Step indicator */}
      <p className="text-xs text-stone-500 dark:text-stone-400">
        {t("stepOf", { current: step + 1, total: totalSteps })}
      </p>

      {/* Step 1: Property type + Transaction type */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
              {t("step1Title")}
            </h2>

            {/* Transaction type */}
            <div className="flex gap-3 mb-6">
              {LISTING_TYPES.map((lt) => (
                <button
                  key={lt.value}
                  type="button"
                  onClick={() => setData((d) => ({ ...d, listingType: lt.value }))}
                  className={cn(
                    "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                    data.listingType === lt.value
                      ? "border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300"
                      : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600"
                  )}
                >
                  {t(lt.labelKey)}
                </button>
              ))}
            </div>

            {/* Property type grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PROPERTY_TYPES.map((pt) => {
                const Icon = pt.icon;
                return (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => setData((d) => ({ ...d, propertyType: pt.value }))}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border px-3 py-4 transition-colors",
                      data.propertyType === pt.value
                        ? "border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300"
                        : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600"
                    )}
                  >
                    <Icon size={24} />
                    <span className="text-xs font-medium">{t(`propertyType.${pt.value}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Location + Details */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {t("step2Title")}
          </h2>

          <WilayaCommuneAutocomplete
            onSelect={(wilayaCode, communeId) =>
              setData((d) => ({ ...d, wilayaCode, communeId }))
            }
            defaultWilaya={data.wilayaCode ?? undefined}
            defaultCommune={data.communeId ?? undefined}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("area")}
              type="number"
              min={1}
              placeholder="120"
              value={data.area ?? ""}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  area: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
            <Input
              label={t("rooms")}
              type="number"
              min={0}
              placeholder="4"
              value={data.rooms ?? ""}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  rooms: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
            <Input
              label={t("floor")}
              type="number"
              min={0}
              placeholder="3"
              value={data.floor ?? ""}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  floor: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
            <Input
              label={t("yearBuilt")}
              type="number"
              min={1900}
              max={2030}
              placeholder="2020"
              value={data.yearBuilt ?? ""}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  yearBuilt: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
          </div>

          {/* Feature toggles */}
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { key: "hasParking", label: t("features.parking") },
                { key: "hasElevator", label: t("features.elevator") },
                { key: "hasSeaview", label: t("features.seaView") },
                { key: "furnished", label: t("features.furnished") },
              ] as const
            ).map((feat) => (
              <label
                key={feat.key}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2.5 cursor-pointer transition-colors",
                  data[feat.key]
                    ? "border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950"
                    : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                )}
              >
                <input
                  type="checkbox"
                  checked={data[feat.key]}
                  onChange={(e) =>
                    setData((d) => ({ ...d, [feat.key]: e.target.checked }))
                  }
                  className="accent-teal-600 dark:accent-teal-400"
                />
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  {feat.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {t("step3Title")}
          </h2>

          {result ? (
            <>
              {/* Price range card */}
              <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/50 p-6 text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-teal-600 dark:text-teal-400 mb-3" />
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                  {t("estimatedRange")}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {formatDZD(result.min)} — {formatDZD(result.max)}
                </p>
                {data.listingType === "rent" && (
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {t("perMonth")}
                  </p>
                )}
              </div>

              {/* Confidence indicator */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {t("confidence")}
                  </span>
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {t("confidenceModerate")}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800">
                  <div className="h-full w-3/5 rounded-full bg-amber-400 dark:bg-amber-500" />
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
                  {t("confidenceNote")}
                </p>
              </div>

              {/* Placeholder chart area */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
                <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-4">
                  {t("priceDistribution")}
                </h3>
                <div className="flex items-end justify-center gap-1 h-32">
                  {[20, 35, 55, 80, 100, 85, 60, 40, 25, 15].map((h, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-6 rounded-t",
                        i >= 3 && i <= 6
                          ? "bg-teal-500 dark:bg-teal-400"
                          : "bg-stone-200 dark:bg-stone-700"
                      )}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-stone-400 dark:text-stone-500">
                  <span>{formatDZD(result.min * 0.7)}</span>
                  <span>{formatDZD(result.max * 1.3)}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    window.location.href = "/fr/deposer";
                  }}
                >
                  <Plus size={18} />
                  {t("ctaDeposer")}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (data.wilayaCode) params.set("wilaya", data.wilayaCode);
                    if (data.propertyType) params.set("propertyType", data.propertyType);
                    if (data.listingType) params.set("type", data.listingType);
                    window.location.href = `/fr/search?${params.toString()}`;
                  }}
                >
                  <Search size={18} />
                  {t("ctaSearch")}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {t("insufficientData")}
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-stone-200 dark:border-stone-700">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ArrowLeft size={16} />
          {tCommon("previous")}
        </Button>

        {step < totalSteps - 1 ? (
          <Button
            variant="primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canGoNext}
          >
            {tCommon("next")}
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => {
              setStep(0);
              setData(INITIAL_DATA);
            }}
          >
            {t("restart")}
          </Button>
        )}
      </div>
    </div>
  );
}
