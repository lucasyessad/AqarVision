"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import * as LucideIcons from "lucide-react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { SearchFilters as SearchFiltersType } from "@/features/marketplace/schemas/search.schema";

// ---------------------------------------------------------------------------
// Types for DB-driven data
// ---------------------------------------------------------------------------

interface ListingFeature {
  key: string;
  label_fr: string;
  label_ar: string | null;
  label_en: string | null;
  icon: string;
  category: "exterior" | "interior" | "infrastructure" | "security";
}

interface FilterOption {
  filter_key: string;
  value: string;
  label_fr: string;
  label_en: string | null;
}

export interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFiltersType) => void;
  features?: ListingFeature[];
  filterOptions?: FilterOption[];
  resultCount?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// URL ↔ Filters parsing (kept from previous version)
// ---------------------------------------------------------------------------

const TRANSACTION_TYPES = [
  { value: "sale", labelKey: "filters.sale" },
  { value: "rent", labelKey: "filters.rent" },
  { value: "vacation", labelKey: "filters.vacation" },
] as const;

const PROPERTY_TYPES = [
  { value: "apartment", labelKey: "filters.apartment" },
  { value: "villa", labelKey: "filters.villa" },
  { value: "terrain", labelKey: "filters.terrain" },
  { value: "commercial", labelKey: "filters.commercial" },
  { value: "office", labelKey: "filters.office" },
  { value: "building", labelKey: "filters.building" },
  { value: "farm", labelKey: "filters.farm" },
  { value: "warehouse", labelKey: "filters.warehouse" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", labelKey: "sort.newest" },
  { value: "price_asc", labelKey: "sort.priceAsc" },
  { value: "price_desc", labelKey: "sort.priceDesc" },
  { value: "surface_desc", labelKey: "sort.surfaceDesc" },
] as const;

function parseSearchParams(searchParams: URLSearchParams): SearchFiltersType {
  const filters: SearchFiltersType = {
    q: searchParams.get("q") ?? undefined,
    type: (searchParams.get("type") as SearchFiltersType["type"]) ?? undefined,
    propertyType: searchParams.getAll("propertyType").length > 0
      ? (searchParams.getAll("propertyType") as SearchFiltersType["propertyType"])
      : undefined,
    wilaya: searchParams.get("wilaya") ?? undefined,
    priceMin: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined,
    priceMax: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined,
    surfaceMin: searchParams.get("surfaceMin") ? Number(searchParams.get("surfaceMin")) : undefined,
    surfaceMax: searchParams.get("surfaceMax") ? Number(searchParams.get("surfaceMax")) : undefined,
    roomsMin: searchParams.get("roomsMin") ? Number(searchParams.get("roomsMin")) : undefined,
    roomsMax: searchParams.get("roomsMax") ? Number(searchParams.get("roomsMax")) : undefined,
    bathroomsMin: searchParams.get("bathroomsMin") ? Number(searchParams.get("bathroomsMin")) : undefined,
    floorMin: searchParams.get("floorMin") ? Number(searchParams.get("floorMin")) : undefined,
    yearMin: searchParams.get("yearMin") ? Number(searchParams.get("yearMin")) : undefined,
    agency: searchParams.get("agency") ?? undefined,
    sort: (searchParams.get("sort") as SearchFiltersType["sort"]) ?? "newest",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: 20,
  };

  // Parse dynamic feature filters (hasParking=true, hasElevator=true, etc.)
  for (const [key, val] of searchParams.entries()) {
    if (val === "true" && key.startsWith("has") || key === "furnished" || key.includes("_")) {
      (filters as Record<string, unknown>)[key] = true;
    }
  }

  return filters;
}

function filtersToParams(filters: SearchFiltersType): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.type) params.set("type", filters.type);
  if (filters.propertyType) {
    const types = Array.isArray(filters.propertyType) ? filters.propertyType : [filters.propertyType];
    for (const pt of types) params.append("propertyType", pt);
  }
  if (filters.wilaya) params.set("wilaya", filters.wilaya);
  if (filters.priceMin) params.set("priceMin", filters.priceMin.toString());
  if (filters.priceMax) params.set("priceMax", filters.priceMax.toString());
  if (filters.surfaceMin) params.set("surfaceMin", filters.surfaceMin.toString());
  if (filters.surfaceMax) params.set("surfaceMax", filters.surfaceMax.toString());
  if (filters.roomsMin) params.set("roomsMin", filters.roomsMin.toString());
  if (filters.roomsMax) params.set("roomsMax", filters.roomsMax.toString());
  if (filters.bathroomsMin) params.set("bathroomsMin", filters.bathroomsMin.toString());
  if (filters.floorMin) params.set("floorMin", filters.floorMin.toString());
  if (filters.yearMin) params.set("yearMin", filters.yearMin.toString());
  if (filters.agency) params.set("agency", filters.agency);
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", filters.page.toString());

  // Dynamic feature filters
  const featureKeys = ["hasParking", "hasElevator", "furnished", "hasBalcony", "hasPool",
    "hasGarden", "seaView", "hasTerrace", "beachAccess", "hasGarage", "hasCourt",
    "separateEntrance", "hasAC", "hasHeating", "equippedKitchen", "modernBathroom",
    "hasInternet", "hasSatellite", "hasIntercom", "doubleGlazing", "hasWater",
    "hasElectricity", "hasCityGas", "hasSewer", "hasFiber", "hasCCTV", "hasGuard",
    "armoredDoor", "hasDigicode", "gatedCommunity"];

  for (const key of featureKeys) {
    if ((filters as Record<string, unknown>)[key]) params.set(key, "true");
  }

  return params;
}

// ---------------------------------------------------------------------------
// Helper: get Lucide icon component by name
// ---------------------------------------------------------------------------

function getLucideIcon(name: string): React.ComponentType<{ size?: number; className?: string }> {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>;
  return icons[name] ?? LucideIcons.Circle;
}

// ---------------------------------------------------------------------------
// Count active filters (for badge)
// ---------------------------------------------------------------------------

function countActiveFilters(filters: SearchFiltersType, featureKeys: string[]): number {
  let count = 0;
  if (filters.priceMin || filters.priceMax) count++;
  if (filters.surfaceMin || filters.surfaceMax) count++;
  if (filters.roomsMin || filters.roomsMax) count++;
  if (filters.bathroomsMin) count++;
  if (filters.floorMin) count++;
  if (filters.yearMin) count++;
  if (filters.propertyType && (Array.isArray(filters.propertyType) ? filters.propertyType.length > 0 : true)) count++;
  for (const key of featureKeys) {
    if ((filters as Record<string, unknown>)[key]) count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// FilterSection helper
// ---------------------------------------------------------------------------

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
      {children}
      <div className="border-b border-stone-200 dark:border-stone-700 pt-1" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SelectFilter helper (dropdown from DB options)
// ---------------------------------------------------------------------------

function SelectFilter({
  label,
  value,
  onChange,
  options,
  placeholder = "Aucun",
}: {
  label: string;
  value: string | number | undefined;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="flex-1">
      <p className="mb-1 text-xs text-stone-500 dark:text-stone-400">{label}</p>
      <select
        aria-label={label}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full rounded-md border px-3 text-sm",
          "border-stone-300 dark:border-stone-600",
          "bg-white dark:bg-stone-950",
          "text-stone-900 dark:text-stone-100",
          "focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600",
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FeatureCheckbox (with icon from DB)
// ---------------------------------------------------------------------------

function FeatureCheckbox({
  feature,
  checked,
  onChange,
}: {
  feature: ListingFeature;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const Icon = getLucideIcon(feature.icon);
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600 dark:border-stone-600 dark:bg-stone-950"
      />
      <Icon size={16} className={cn(checked ? "text-teal-600 dark:text-teal-400" : "text-stone-400 dark:text-stone-500")} />
      <span className={cn("text-stone-700 dark:text-stone-300", checked && "font-medium")}>
        {feature.label_fr}
      </span>
    </label>
  );
}

// ===========================================================================
// MAIN COMPONENT
// ===========================================================================

export function SearchFilters({
  onFiltersChange,
  features,
  filterOptions,
  resultCount,
  className,
}: SearchFiltersProps) {
  const t = useTranslations("search");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<SearchFiltersType>(() => parseSearchParams(searchParams));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFilters, setModalFilters] = useState<SearchFiltersType>(filters);

  // Group features by category (guard against undefined)
  const safeFeatures = features ?? [];
  const safeFilterOptions = filterOptions ?? [];

  const featuresByCategory = {
    exterior: safeFeatures.filter((f) => f.category === "exterior"),
    interior: safeFeatures.filter((f) => f.category === "interior"),
    infrastructure: safeFeatures.filter((f) => f.category === "infrastructure"),
    security: safeFeatures.filter((f) => f.category === "security"),
  };

  // Group filter options by key
  const optionsByKey = (key: string) =>
    safeFilterOptions
      .filter((o) => o.filter_key === key)
      .map((o) => ({ value: o.value, label: o.label_fr }));

  const priceOptions = filters.type === "rent" ? optionsByKey("price_rent") : optionsByKey("price_sale");
  const roomsOptions = optionsByKey("rooms");
  const bathroomsOptions = optionsByKey("bathrooms");
  const surfaceOptions = optionsByKey("surface");
  const yearOptions = optionsByKey("year");
  const floorOptions = optionsByKey("floor");

  const allFeatureKeys = safeFeatures.map((f) => {
    // Convert DB key (has_parking) to URL param key (hasParking)
    return f.key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  });

  const activeFilterCount = countActiveFilters(filters, allFeatureKeys);

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  function applyFilters(newFilters: SearchFiltersType) {
    const updated = { ...newFilters, page: 1 };
    setFilters(updated);
    onFiltersChange(updated);
    startTransition(() => {
      router.push(`/search?${filtersToParams(updated).toString()}`);
    });
  }

  function openModal() {
    setModalFilters({ ...filters });
    setModalOpen(true);
  }

  function applyModal() {
    applyFilters(modalFilters);
    setModalOpen(false);
  }

  function clearAllFilters() {
    const cleared: SearchFiltersType = { sort: "newest", page: 1, limit: 20 };
    setFilters(cleared);
    setModalFilters(cleared);
    onFiltersChange(cleared);
    startTransition(() => router.push("/search"));
  }

  function updateModalFilter<K extends keyof SearchFiltersType>(key: K, value: SearchFiltersType[K]) {
    setModalFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleModalFeature(urlKey: string, checked: boolean) {
    setModalFilters((prev) => ({ ...prev, [urlKey]: checked || undefined }));
  }

  function togglePropertyType(value: string) {
    const current = modalFilters.propertyType
      ? Array.isArray(modalFilters.propertyType) ? modalFilters.propertyType : [modalFilters.propertyType]
      : [];
    const next = current.includes(value as never)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateModalFilter("propertyType", next.length > 0 ? (next as SearchFiltersType["propertyType"]) : undefined);
  }

  const selectedPropertyTypes = modalFilters.propertyType
    ? Array.isArray(modalFilters.propertyType) ? modalFilters.propertyType : [modalFilters.propertyType]
    : [];

  // -----------------------------------------------------------------------
  // RENDER — Search Bar (always visible)
  // -----------------------------------------------------------------------

  return (
    <div className={cn("border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900", className)}>
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search input */}
          <div className="flex-1 sm:max-w-sm">
            <div className="relative">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <input
                type="text"
                placeholder={t("filters.searchPlaceholder")}
                value={filters.q ?? ""}
                onChange={(e) => {
                  const updated = { ...filters, q: e.target.value || undefined };
                  setFilters(updated);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") applyFilters(filters); }}
                className={cn(
                  "h-10 w-full rounded-md border ps-9 pe-3 text-sm",
                  "border-stone-300 dark:border-stone-600",
                  "bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100",
                  "placeholder:text-stone-400 dark:placeholder:text-stone-500",
                  "focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600",
                )}
              />
            </div>
          </div>

          {/* Transaction type pills */}
          <div className="flex items-center gap-1.5">
            {TRANSACTION_TYPES.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  const updated = { ...filters, type: filters.type === value ? undefined : value as SearchFiltersType["type"], page: 1 };
                  setFilters(updated);
                  applyFilters(updated);
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
                  filters.type === value
                    ? "bg-teal-600 text-white dark:bg-teal-500"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            aria-label={t("filters.sortLabel")}
            value={filters.sort}
            onChange={(e) => {
              const updated = { ...filters, sort: e.target.value as SearchFiltersType["sort"] };
              setFilters(updated);
              applyFilters(updated);
            }}
            className={cn(
              "h-10 rounded-md border px-3 text-sm",
              "border-stone-300 dark:border-stone-600",
              "bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300",
              "focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600",
              "w-full sm:w-44",
            )}
          >
            {SORT_OPTIONS.map(({ value, labelKey }) => (
              <option key={value} value={value}>{t(labelKey)}</option>
            ))}
          </select>

          {/* Filters button with badge */}
          <Button variant="secondary" onClick={openModal} className="relative">
            <SlidersHorizontal size={16} />
            {t("filters.moreFilters")}
            {activeFilterCount > 0 && (
              <span className="ms-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white dark:bg-teal-500">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Search button */}
          <Button onClick={() => applyFilters(filters)} loading={isPending}>
            <Search size={16} />
            {t("filters.search")}
          </Button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* FILTER MODAL                                                       */}
      {/* ================================================================= */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t("filters.moreFilters")}
        size="lg"
      >
        <div className="max-h-[70vh] overflow-y-auto space-y-5 px-1">
          {/* Section 1 — Type de bien */}
          <FilterSection title={t("filters.propertyType")}>
            <div className="grid grid-cols-2 gap-2">
              {PROPERTY_TYPES.map(({ value, labelKey }) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-stone-50 dark:hover:bg-stone-800",
                    selectedPropertyTypes.includes(value)
                      ? "border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/50"
                      : "border-stone-200 dark:border-stone-700"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedPropertyTypes.includes(value)}
                    onChange={() => togglePropertyType(value)}
                    className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600 dark:border-stone-600"
                  />
                  {t(labelKey)}
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Section 2 — Prix */}
          <FilterSection title={t("filters.priceLabel")}>
            <div className="flex items-center gap-3">
              <SelectFilter
                label="Min"
                value={modalFilters.priceMin}
                onChange={(v) => updateModalFilter("priceMin", v ? Number(v) : undefined)}
                options={priceOptions}
              />
              <span className="mt-5 text-stone-400">—</span>
              <SelectFilter
                label="Max"
                value={modalFilters.priceMax}
                onChange={(v) => updateModalFilter("priceMax", v ? Number(v) : undefined)}
                options={priceOptions}
              />
            </div>
          </FilterSection>

          {/* Section 3 — Pièces */}
          <FilterSection title={t("filters.roomsLabel")}>
            <div className="flex items-center gap-3">
              <SelectFilter
                label="Min"
                value={modalFilters.roomsMin}
                onChange={(v) => updateModalFilter("roomsMin", v ? Number(v) : undefined)}
                options={roomsOptions}
              />
              <span className="mt-5 text-stone-400">—</span>
              <SelectFilter
                label="Max"
                value={modalFilters.roomsMax}
                onChange={(v) => updateModalFilter("roomsMax", v ? Number(v) : undefined)}
                options={roomsOptions}
              />
            </div>
          </FilterSection>

          {/* Section 4 — Salles de bain */}
          <FilterSection title={t("filters.bathroomsLabel")}>
            <SelectFilter
              label="Min"
              value={modalFilters.bathroomsMin}
              onChange={(v) => updateModalFilter("bathroomsMin", v ? Number(v) : undefined)}
              options={bathroomsOptions}
            />
          </FilterSection>

          {/* Section 5 — Surface */}
          <FilterSection title={t("filters.surfaceLabel")}>
            <div className="flex items-center gap-3">
              <SelectFilter
                label="Min"
                value={modalFilters.surfaceMin}
                onChange={(v) => updateModalFilter("surfaceMin", v ? Number(v) : undefined)}
                options={surfaceOptions}
              />
              <span className="mt-5 text-stone-400">—</span>
              <SelectFilter
                label="Max"
                value={modalFilters.surfaceMax}
                onChange={(v) => updateModalFilter("surfaceMax", v ? Number(v) : undefined)}
                options={surfaceOptions}
              />
            </div>
          </FilterSection>

          {/* Section 6 — Année */}
          <FilterSection title={t("filters.yearLabel")}>
            <SelectFilter
              label="Min"
              value={modalFilters.yearMin}
              onChange={(v) => updateModalFilter("yearMin", v ? Number(v) : undefined)}
              options={yearOptions}
            />
          </FilterSection>

          {/* Section 7 — Étage */}
          <FilterSection title={t("filters.floorLabel")}>
            <SelectFilter
              label="Min"
              value={modalFilters.floorMin}
              onChange={(v) => updateModalFilter("floorMin", v ? Number(v) : undefined)}
              options={floorOptions}
            />
          </FilterSection>

          {/* Section 8 — Équipements extérieurs */}
          {featuresByCategory.exterior.length > 0 && (
            <FilterSection title={t("filters.outdoorFeatures")}>
              <div className="grid grid-cols-2 gap-1">
                {featuresByCategory.exterior.map((feature) => {
                  const urlKey = feature.key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
                  return (
                    <FeatureCheckbox
                      key={feature.key}
                      feature={feature}
                      checked={!!(modalFilters as Record<string, unknown>)[urlKey]}
                      onChange={(checked) => toggleModalFeature(urlKey, checked)}
                    />
                  );
                })}
              </div>
            </FilterSection>
          )}

          {/* Section 9 — Équipements intérieurs */}
          {featuresByCategory.interior.length > 0 && (
            <FilterSection title={t("filters.indoorFeatures")}>
              <div className="grid grid-cols-2 gap-1">
                {featuresByCategory.interior.map((feature) => {
                  const urlKey = feature.key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
                  return (
                    <FeatureCheckbox
                      key={feature.key}
                      feature={feature}
                      checked={!!(modalFilters as Record<string, unknown>)[urlKey]}
                      onChange={(checked) => toggleModalFeature(urlKey, checked)}
                    />
                  );
                })}
              </div>
            </FilterSection>
          )}

          {/* Section 10 — Infrastructure */}
          {featuresByCategory.infrastructure.length > 0 && (
            <FilterSection title={t("filters.infrastructure")}>
              <div className="grid grid-cols-2 gap-1">
                {featuresByCategory.infrastructure.map((feature) => {
                  const urlKey = feature.key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
                  return (
                    <FeatureCheckbox
                      key={feature.key}
                      feature={feature}
                      checked={!!(modalFilters as Record<string, unknown>)[urlKey]}
                      onChange={(checked) => toggleModalFeature(urlKey, checked)}
                    />
                  );
                })}
              </div>
            </FilterSection>
          )}

          {/* Section 11 — Sécurité */}
          {featuresByCategory.security.length > 0 && (
            <FilterSection title={t("filters.security")}>
              <div className="grid grid-cols-2 gap-1">
                {featuresByCategory.security.map((feature) => {
                  const urlKey = feature.key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
                  return (
                    <FeatureCheckbox
                      key={feature.key}
                      feature={feature}
                      checked={!!(modalFilters as Record<string, unknown>)[urlKey]}
                      onChange={(checked) => toggleModalFeature(urlKey, checked)}
                    />
                  );
                })}
              </div>
            </FilterSection>
          )}
        </div>

        {/* Footer fixe */}
        <div className="mt-4 flex items-center justify-between border-t border-stone-200 dark:border-stone-700 pt-4">
          <Button variant="ghost" onClick={() => {
            const cleared: SearchFiltersType = { sort: "newest", page: 1, limit: 20 };
            setModalFilters(cleared);
          }}>
            {t("filters.clearAll")}
          </Button>
          <Button onClick={applyModal} loading={isPending}>
            {t("filters.search")}
            {typeof resultCount === "number" && (
              <span className="ms-1">({resultCount.toLocaleString("fr-FR")})</span>
            )}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
