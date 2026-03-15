"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { SearchResults } from "@/features/marketplace/components/SearchResults";
import { SearchAlertButton } from "@/features/marketplace/components/SearchAlertButton";
import type { SearchResultDto } from "@/features/marketplace/types/search.types";
import type { MapBounds } from "@/features/marketplace/schemas/search.schema";
import type { MapListing } from "@/features/marketplace/components/SearchMap";

const SearchMap = dynamic(() => import("@/features/marketplace/components/SearchMap"), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse" />,
});

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

// ── Dropdown component ───────────────────────────────────────────────────────

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
        className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all"
        style={{
          background: active ? "var(--onyx)" : "var(--ivoire)",
          borderColor: active ? "var(--onyx)" : "var(--ivoire-border)",
          color: active ? "var(--ivoire)" : "var(--text-body)",
        }}
      >
        {label}
        <svg
          className="h-3.5 w-3.5 shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute start-0 top-full z-50 mt-2 min-w-[220px] rounded-xl p-3 shadow-lg"
          style={{
            background: "#FFFFFF",
            border: "1px solid var(--ivoire-border)",
            boxShadow: "0 8px 32px rgba(13,13,13,0.12)",
          }}
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

  // ── Filter state (synced from URL) ─────────────────────────────────────────
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

  // ── View mode: "split" (default desktop), "list", "map" ────────────────────
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
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

  // ── Apply filters ──────────────────────────────────────────────────────────
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

    // Clear amenities not active
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

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100vh - 64px)", overflow: "hidden", background: "var(--ivoire)" }}
    >

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 border-b px-4 py-2.5"
        style={{
          background: "rgba(253,251,247,0.97)",
          backdropFilter: "blur(20px)",
          borderColor: "var(--ivoire-border)",
        }}
      >
        {/* Row 1: text search + alert + mobile toggle */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="relative flex-1 max-w-sm">
            <svg
              className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              style={{ color: "var(--text-faint)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Ville, quartier ou type de bien…"
              className="w-full rounded-full border py-2 ps-9 pe-4 text-sm focus:outline-none"
              style={{
                borderColor: "var(--ivoire-border)",
                background: "white",
                color: "var(--text-dark)",
              }}
            />
          </div>
          <SearchAlertButton />
          {/* Mobile view toggle */}
          <div className="flex md:hidden overflow-hidden rounded-full border" style={{ borderColor: "var(--ivoire-border)" }}>
            {(["list", "map"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setMobileView(mode)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: mobileView === mode ? "var(--onyx)" : "transparent",
                  color: mobileView === mode ? "var(--ivoire)" : "var(--text-muted)",
                }}
              >
                {mode === "list" ? "Liste" : "Carte"}
              </button>
            ))}
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
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#F6F1EA]"
                  style={{
                    background: listingType === t ? "var(--ivoire-deep)" : "transparent",
                    color: "var(--text-dark)",
                    fontWeight: listingType === t ? 600 : 400,
                  }}
                >
                  {listingType === t && (
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-start"
                  style={{
                    background: propertyType === t ? "var(--onyx)" : "var(--ivoire-deep)",
                    color: propertyType === t ? "var(--ivoire)" : "var(--text-body)",
                  }}
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
            <div className="max-h-56 overflow-y-auto space-y-0.5">
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
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-[#F6F1EA]"
                  style={{
                    background: wilayaCode === code ? "var(--ivoire-deep)" : "transparent",
                    color: "var(--text-dark)",
                    fontWeight: wilayaCode === code ? 600 : 400,
                  }}
                >
                  <span className="text-xs font-mono w-5 shrink-0" style={{ color: "var(--text-muted)" }}>{code}</span>
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
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Fourchette de prix (DZD)</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--ivoire-border)", color: "var(--text-dark)", background: "var(--ivoire-deep)" }}
                />
                <span style={{ color: "var(--text-muted)" }}>–</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--ivoire-border)", color: "var(--text-dark)", background: "var(--ivoire-deep)" }}
                />
              </div>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="w-full rounded-lg py-2 text-sm font-semibold"
                style={{ background: "var(--onyx)", color: "var(--ivoire)" }}
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
                <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Pièces minimum</p>
                <div className="flex gap-1.5">
                  {["", "1", "2", "3", "4", "5"].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRoomsMin(n)}
                      className="flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors"
                      style={{
                        background: roomsMin === n ? "var(--onyx)" : "var(--ivoire-deep)",
                        color: roomsMin === n ? "var(--ivoire)" : "var(--text-body)",
                      }}
                    >
                      {n || "—"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Surface min (m²)</p>
                <input
                  type="number"
                  value={surfaceMin}
                  onChange={(e) => setSurfaceMin(e.target.value)}
                  placeholder="ex: 80"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--ivoire-border)", color: "var(--text-dark)", background: "var(--ivoire-deep)" }}
                />
              </div>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="w-full rounded-lg py-2 text-sm font-semibold"
                style={{ background: "var(--onyx)", color: "var(--ivoire)" }}
              >
                Appliquer
              </button>
            </div>
          </FilterDropdown>

          {/* Divider */}
          <div className="h-5 w-px shrink-0" style={{ background: "var(--ivoire-border)" }} />

          {/* Amenity pills */}
          {AMENITY_PILLS.map(({ label, icon, key }) => {
            const active = activeAmenities.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleAmenity(key)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: active ? "var(--onyx)" : "transparent",
                  borderColor: active ? "var(--onyx)" : "var(--ivoire-border)",
                  color: active ? "var(--ivoire)" : "var(--text-body)",
                }}
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
              className="flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:border-red-300 hover:text-red-500"
              style={{ borderColor: "var(--ivoire-border)", color: "var(--text-muted)" }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── Split layout (desktop) / single (mobile) ─────────────────────── */}
      <div className="flex min-h-0 flex-1">

        {/* List panel — desktop always shown, mobile conditionally */}
        <div
          className={`flex flex-col ${mobileView === "list" ? "flex" : "hidden"} md:flex`}
          style={{ width: "100%", maxWidth: "480px", borderInlineEnd: "1px solid var(--ivoire-border)", overflowY: "auto" }}
        >
          {/* Count bar */}
          <div
            className="shrink-0 flex items-center justify-between px-4 py-3 sticky top-0 z-10"
            style={{ background: "rgba(253,251,247,0.97)", borderBottom: "1px solid var(--ivoire-border)", backdropFilter: "blur(8px)" }}
          >
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="font-semibold" style={{ color: "var(--text-dark)" }}>
                {totalCount.toLocaleString("fr-DZ")}
              </span>{" "}
              annonce{totalCount !== 1 ? "s" : ""}
            </span>
            <SearchAlertButton compact />
          </div>

          {/* Results */}
          <div className="flex-1 px-3 py-3">
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

        {/* Map panel — desktop always shown right, mobile conditionally */}
        <div
          className={`${mobileView === "map" ? "flex" : "hidden"} md:flex flex-1 relative`}
          style={{ minHeight: 0 }}
        >
          <SearchMap
            listings={mapListings}
            onBoundsChange={handleBoundsChange}
            onListingHover={setHighlightedId}
            fillContainer
          />
        </div>
      </div>
    </div>
  );
}
