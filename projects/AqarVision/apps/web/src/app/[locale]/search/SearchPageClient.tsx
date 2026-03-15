"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { SearchResults } from "@/features/marketplace/components/SearchResults";
import { SearchAlertButton } from "@/features/marketplace/components/SearchAlertButton";
import type { SearchResultDto } from "@/features/marketplace/types/search.types";
import type { MapBounds } from "@/features/marketplace/schemas/search.schema";
import type { MapListing } from "@/features/marketplace/components/SearchMap";

const SearchMap = dynamic(
  () => import("@/features/marketplace/components/SearchMap").then((m) => m.SearchMap),
  {
    ssr: false,
    loading: () => <div className="h-full animate-pulse bg-zinc-100" />,
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
            ? "border-zinc-950 bg-zinc-950 text-zinc-50"
            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400",
        ].join(" ")}
      >
        {label}
        <svg
          className={["h-3.5 w-3.5 shrink-0 transition-transform", open ? "rotate-180" : ""].join(" ")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute start-0 top-full z-50 mt-2 min-w-[220px] rounded-xl border border-zinc-200 bg-white p-3 shadow-lg"
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

  // ── View mode: "listings" (default) or "map" ───────────────────────────────
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
    <div className="flex min-h-screen flex-col bg-zinc-50">

      {/* ── Sticky filter bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 shrink-0 border-b border-zinc-200 bg-white/95 px-4 py-2.5 backdrop-blur-lg">
        {/* Row 1 */}
        <div className="mb-2.5 flex items-center gap-2">
          {/* Search input */}
          <div className="relative max-w-sm flex-1">
            <svg
              className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-zinc-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Ville, quartier ou type de bien…"
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pe-4 ps-9 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* View toggle [Annonces | Carte] */}
          <div className="flex overflow-hidden rounded-full border border-zinc-200">
            {(["listings", "map"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={[
                  "px-4 py-1.5 text-xs font-semibold transition-colors",
                  viewMode === mode
                    ? "bg-zinc-950 text-zinc-50"
                    : "bg-transparent text-zinc-500 hover:text-zinc-700",
                ].join(" ")}
              >
                {mode === "listings" ? "Annonces" : "Carte"}
              </button>
            ))}
          </div>

          {/* Result count */}
          <span className="hidden text-sm text-zinc-400 sm:block">
            <span className="font-semibold text-zinc-800">{totalCount.toLocaleString("fr-DZ")}</span>{" "}
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
                      ? "bg-zinc-100 font-semibold text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-50",
                  ].join(" ")}
                >
                  {listingType === t && (
                    <svg className="h-3.5 w-3.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
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
                      ? "bg-zinc-950 text-zinc-50"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
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
                      ? "bg-zinc-100 font-semibold text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-50",
                  ].join(" ")}
                >
                  <span className="w-5 shrink-0 font-mono text-xs text-zinc-400">{code}</span>
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
              <p className="text-xs font-semibold text-zinc-400">Fourchette de prix (DZD)</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 focus:border-amber-500 focus:outline-none"
                />
                <span className="text-zinc-400">–</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="w-full rounded-lg bg-zinc-950 py-2 text-sm font-semibold text-zinc-50"
              >
                Appliquer
              </button>
            </div>
          </FilterDropdown>

          {/* Surface & Pièces */}
          <FilterDropdown
            label={roomsMin || surfaceMin ? [roomsMin ? `${roomsMin}+ pièces` : "", surfaceMin ? `${surfaceMin}+ m²` : ""].filter(Boolean).join(" · ") : "Surface & Pièces"}
            active={!!(roomsMin || surfaceMin)}
          >
            <div className="space-y-3 p-1">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-zinc-400">Pièces minimum</p>
                <div className="flex gap-1.5">
                  {["", "1", "2", "3", "4", "5"].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRoomsMin(n)}
                      className={[
                        "flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors",
                        roomsMin === n
                          ? "bg-zinc-950 text-zinc-50"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                      ].join(" ")}
                    >
                      {n || "—"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-zinc-400">Surface min (m²)</p>
                <input
                  type="number"
                  value={surfaceMin}
                  onChange={(e) => setSurfaceMin(e.target.value)}
                  placeholder="ex: 80"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="w-full rounded-lg bg-zinc-950 py-2 text-sm font-semibold text-zinc-50"
              >
                Appliquer
              </button>
            </div>
          </FilterDropdown>

          {/* Divider */}
          <div className="h-5 w-px shrink-0 bg-zinc-200" />

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
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400",
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
              className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-red-300 hover:text-red-500"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {viewMode === "listings" ? (
        /* Listings mode: full-width grid */
        <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
          <SearchResults
            results={results}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            viewedIds={viewedIds}
            highlightedId={highlightedId}
          />
        </div>
      ) : (
        /* Map mode: full screen */
        <div className="relative flex-1" style={{ height: "calc(100vh - 120px)" }}>
          <SearchMap
            listings={mapListings}
            onBoundsChange={handleBoundsChange}
            onListingHover={setHighlightedId}
            fillContainer
          />
          {/* Back to listings button */}
          <button
            type="button"
            onClick={() => setViewMode("listings")}
            className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-md hover:bg-zinc-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Voir les annonces
          </button>
        </div>
      )}
    </div>
  );
}
