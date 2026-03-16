"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { SearchResults } from "@/features/marketplace/components/SearchResults";
import { SearchAlertButton } from "@/features/marketplace/components/SearchAlertButton";
import { Search, ChevronDown, X, Check, List, Map } from "lucide-react";
import type { SearchResultDto } from "@/features/marketplace/types/search.types";
import type { MapBounds } from "@/features/marketplace/schemas/search.schema";
import type { MapListing } from "@/features/marketplace/components/SearchMap";

const SearchMap = dynamic(
  () => import("@/features/marketplace/components/SearchMap").then((m) => m.SearchMap),
  {
    ssr: false,
    loading: () => <div className="h-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />,
  }
);

// ── Constants ────────────────────────────────────────────────────────────────

const LISTING_TYPE_LABELS: Record<string, string> = {
  sale: "Vente",
  rent: "Location",
  vacation: "Vacances",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Appartement",
  villa: "Villa",
  terrain: "Terrain",
  commercial: "Local commercial",
  office: "Bureau",
  building: "Immeuble",
  farm: "Ferme",
  warehouse: "Entrepôt",
};

const LISTING_TYPES = ["sale", "rent", "vacation"] as const;
const PROPERTY_TYPES = ["apartment", "villa", "terrain", "commercial", "office", "building", "farm", "warehouse"] as const;

const AMENITY_PILLS = [
  { label: "Vue mer",  icon: "🌊", key: "view_sea" },
  { label: "Piscine",  icon: "🏊", key: "has_pool" },
  { label: "Jardin",   icon: "🌿", key: "has_garden" },
  { label: "Parking",  icon: "🚗", key: "has_parking" },
  { label: "Meublé",   icon: "🛋️",  key: "furnished" },
  { label: "Neuf",     icon: "✨", key: "new_build" },
  { label: "Balcon",   icon: "🏡", key: "has_balcony" },
];

// ── FilterDropdown ────────────────────────────────────────────────────────────

function FilterDropdown({
  label,
  active,
  children,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
          active
            ? "border-zinc-950 dark:border-zinc-50 bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950"
            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500",
        ].join(" ")}
      >
        {label}
        <ChevronDown
          className={["h-3.5 w-3.5 shrink-0 transition-transform", open ? "rotate-180" : ""].join(" ")}
        />
      </button>

      {open && (
        <div
          className="absolute start-0 top-full z-50 mt-2 min-w-[220px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────

interface SearchPageClientProps {
  results: SearchResultDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  locale: string;
  wilayas: { code: string; name: string }[];
  viewedIds: string[];
}

// ── Main component ───────────────────────────────────────────────────────────

export function SearchPageClient({
  results,
  totalCount,
  page,
  pageSize,
  locale,
  wilayas,
  viewedIds,
}: SearchPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [listingType, setListingType] = useState(searchParams.get("listing_type") ?? "");
  const [propertyType, setPropertyType] = useState(searchParams.get("property_type") ?? "");
  const [wilayaCode, setWilayaCode] = useState(searchParams.get("wilaya_code") ?? "");
  const [priceMin, setPriceMin] = useState(searchParams.get("price_min") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("price_max") ?? "");
  const [roomsMin, setRoomsMin] = useState(searchParams.get("rooms_min") ?? "");
  const [surfaceMin, setSurfaceMin] = useState(searchParams.get("surface_min") ?? "");
  const [activeAmenities, setActiveAmenities] = useState<string[]>(() =>
    AMENITY_PILLS.filter((p) => searchParams.get(p.key) === "true").map((p) => p.key)
  );

  // ── View mode ──────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"listings" | "map">("listings");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // ── Map listings ───────────────────────────────────────────────────────────
  const mapListings: MapListing[] = results.flatMap((r) => {
    const rAny = r as SearchResultDto & { lat?: number; lng?: number };
    if (typeof rAny.lat === "number" && typeof rAny.lng === "number") {
      return [{ id: r.id, lat: rAny.lat, lng: rAny.lng, price: r.current_price, currency: r.currency, title: r.title, slug: r.slug }];
    }
    return [];
  });

  const handleBoundsChange = useCallback((bounds: MapBounds) => { void bounds; }, []);

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const queryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
    queryDebounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value); else params.delete("q");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 350);
  }

  function applyFilters(overrides?: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    const state: Record<string, string> = {
      q: query,
      listing_type: listingType,
      property_type: propertyType,
      wilaya_code: wilayaCode,
      price_min: priceMin,
      price_max: priceMax,
      rooms_min: roomsMin,
      surface_min: surfaceMin,
      ...Object.fromEntries(activeAmenities.map((k) => [k, "true"])),
    };
    AMENITY_PILLS.forEach((p) => {
      if (!activeAmenities.includes(p.key)) params.delete(p.key);
    });
    Object.entries({ ...state, ...overrides }).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleAmenity(key: string) {
    const next = activeAmenities.includes(key)
      ? activeAmenities.filter((k) => k !== key)
      : [...activeAmenities, key];
    setActiveAmenities(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next.includes(key)) params.set(key, "true");
    else params.delete(key);
    AMENITY_PILLS.forEach((p) => {
      if (!next.includes(p.key)) params.delete(p.key);
    });
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function resetAll() {
    setListingType("");
    setPropertyType("");
    setWilayaCode("");
    setPriceMin("");
    setPriceMax("");
    setRoomsMin("");
    setSurfaceMin("");
    setActiveAmenities([]);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters =
    listingType || propertyType || wilayaCode || priceMin || priceMax ||
    roomsMin || surfaceMin || activeAmenities.length > 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">

      {/* ── Sticky filter bar ───────────────────────────────────────────────── */}
      <div className="z-30 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5">
        {/* Row 1 */}
        <div className="mb-2.5 flex items-center gap-3">
          {/* Search input */}
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Ville, quartier ou type de bien…"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2 pe-4 ps-9 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-amber-500 dark:focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* View toggle [Annonces | Carte] */}
          <div className="flex overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            {(["listings", "map"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={[
                  "flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition-colors",
                  viewMode === mode
                    ? "bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950"
                    : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300",
                ].join(" ")}
              >
                {mode === "listings" ? (
                  <>
                    <List className="h-3.5 w-3.5" />
                    Annonces
                  </>
                ) : (
                  <>
                    <Map className="h-3.5 w-3.5" />
                    Carte
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Result count */}
          <span className="hidden text-sm text-zinc-400 dark:text-zinc-500 sm:block">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalCount.toLocaleString("fr-DZ")}</span>{" "}
            annonce{totalCount !== 1 ? "s" : ""}
          </span>

          <div className="ms-auto">
            <SearchAlertButton compact />
          </div>
        </div>

        {/* Row 2: filter dropdowns + amenity pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">

          {/* Listing type */}
          <FilterDropdown
            label={listingType ? LISTING_TYPE_LABELS[listingType]! : "Type d'annonce"}
            active={!!listingType}
          >
            <div className="space-y-1">
              {LISTING_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const next = listingType === t ? "" : t;
                    setListingType(next);
                    const params = new URLSearchParams(searchParams.toString());
                    if (next) params.set("listing_type", next); else params.delete("listing_type");
                    params.delete("page");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className={[
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    listingType === t
                      ? "bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {listingType === t && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  )}
                  {LISTING_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </FilterDropdown>

          {/* Property type */}
          <FilterDropdown
            label={propertyType ? PROPERTY_TYPE_LABELS[propertyType]! : "Type de bien"}
            active={!!propertyType}
          >
            <div className="grid grid-cols-2 gap-1">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const next = propertyType === t ? "" : t;
                    setPropertyType(next);
                    const params = new URLSearchParams(searchParams.toString());
                    if (next) params.set("property_type", next); else params.delete("property_type");
                    params.delete("page");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className={[
                    "rounded-lg px-2.5 py-1.5 text-start text-xs font-medium transition-colors",
                    propertyType === t
                      ? "bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                  ].join(" ")}
                >
                  {PROPERTY_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </FilterDropdown>

          {/* Wilaya */}
          <FilterDropdown
            label={wilayaCode ? (wilayas.find((w) => w.code === wilayaCode)?.name ?? wilayaCode) : "Wilaya"}
            active={!!wilayaCode}
          >
            <div className="max-h-56 space-y-0.5 overflow-y-auto">
              {wilayas.map(({ code, name }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    const next = wilayaCode === code ? "" : code;
                    setWilayaCode(next);
                    const params = new URLSearchParams(searchParams.toString());
                    if (next) params.set("wilaya_code", next); else params.delete("wilaya_code");
                    params.delete("page");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className={[
                    "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                    wilayaCode === code
                      ? "bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800",
                  ].join(" ")}
                >
                  <span className="w-5 shrink-0 font-mono text-xs text-zinc-400 dark:text-zinc-500">{code}</span>
                  {name}
                </button>
              ))}
            </div>
          </FilterDropdown>

          {/* Prix */}
          <FilterDropdown
            label={priceMin || priceMax ? `${priceMin || "0"} – ${priceMax || "∞"} DZD` : "Prix"}
            active={!!(priceMin || priceMax)}
          >
            <div className="space-y-3 p-1">
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Fourchette de prix (DZD)</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:border-amber-500 focus:outline-none"
                />
                <span className="text-zinc-400 dark:text-zinc-500">–</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="w-full rounded-lg bg-zinc-950 dark:bg-zinc-50 py-2 text-sm font-semibold text-zinc-50 dark:text-zinc-950"
              >
                Appliquer
              </button>
            </div>
          </FilterDropdown>

          {/* Surface & Pieces */}
          <FilterDropdown
            label={roomsMin || surfaceMin ? [roomsMin ? `${roomsMin}+ pièces` : "", surfaceMin ? `${surfaceMin}+ m²` : ""].filter(Boolean).join(" · ") : "Surface & Pièces"}
            active={!!(roomsMin || surfaceMin)}
          >
            <div className="space-y-3 p-1">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500">Pièces minimum</p>
                <div className="flex gap-1.5">
                  {["", "1", "2", "3", "4", "5"].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRoomsMin(n)}
                      className={[
                        "flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors",
                        roomsMin === n
                          ? "bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                      ].join(" ")}
                    >
                      {n || "—"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500">Surface min (m²)</p>
                <input
                  type="number"
                  value={surfaceMin}
                  onChange={(e) => setSurfaceMin(e.target.value)}
                  placeholder="ex: 80"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="w-full rounded-lg bg-zinc-950 dark:bg-zinc-50 py-2 text-sm font-semibold text-zinc-50 dark:text-zinc-950"
              >
                Appliquer
              </button>
            </div>
          </FilterDropdown>

          {/* Divider */}
          <div className="h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700" />

          {/* Amenity pills */}
          {AMENITY_PILLS.map(({ label, icon, key }) => {
            const active = activeAmenities.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleAmenity(key)}
                className={[
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500",
                ].join(" ")}
              >
                <span>{icon}</span>
                {label}
              </button>
            );
          })}

          {/* Reset */}
          {hasFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 transition-all hover:border-red-300 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── Split content: listings + map ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Listings panel */}
        <div
          className={[
            "shrink-0 overflow-y-auto border-e border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 ease-in-out",
            viewMode === "listings" ? "w-[70%]" : "w-[30%]",
            // Hide on mobile when map is focused
            viewMode === "map" ? "hidden lg:block" : "",
          ].join(" ")}
        >
          <div className="p-4">
            <SearchResults
              results={results}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
              viewedIds={viewedIds}
              highlightedId={highlightedId}
            />
          </div>
        </div>

        {/* Map panel */}
        <div
          className={[
            "relative flex-1 transition-all duration-300 ease-in-out",
            // On mobile, show full when map mode, hide when listings mode
            viewMode === "listings" ? "hidden lg:block" : "",
          ].join(" ")}
        >
          <SearchMap
            listings={mapListings}
            onBoundsChange={handleBoundsChange}
            onListingHover={setHighlightedId}
            locale={locale}
            fillContainer
          />

          {/* Floating result count on map */}
          <div className="absolute start-4 top-4 z-10 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1.5 shadow-md border border-zinc-200/50 dark:border-zinc-700/50">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {totalCount.toLocaleString("fr-DZ")}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {" "}annonce{totalCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
