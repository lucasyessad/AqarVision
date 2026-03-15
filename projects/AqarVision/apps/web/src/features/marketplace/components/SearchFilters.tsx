"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/features/listings/schemas/listing.schema";

interface SearchFiltersProps {
  isOpen: boolean;
  isDesktopVisible?: boolean;
  onToggle: () => void;
  onSaveSearch?: () => void;
  wilayas: { code: string; name: string }[];
}

export function SearchFilters({ isOpen, isDesktopVisible = true, onToggle, onSaveSearch, wilayas }: SearchFiltersProps) {
  const t = useTranslations("search");
  const tListings = useTranslations("listings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Existing filters
  const [listingTypes, setListingTypes] = useState<string[]>(
    searchParams.get("listing_type")?.split(",").filter(Boolean) ?? []
  );
  const [propertyTypes, setPropertyTypes] = useState<string[]>(
    searchParams.get("property_type")?.split(",").filter(Boolean) ?? []
  );
  // Multi-select wilayas (comma-separated in URL)
  const [wilayaCodes, setWilayaCodes] = useState<string[]>(
    searchParams
      .get("wilaya_codes")
      ?.split(",")
      .filter(Boolean) ??
      (searchParams.get("wilaya_code")
        ? [searchParams.get("wilaya_code")!]
        : [])
  );
  const [priceMin, setPriceMin] = useState(
    searchParams.get("price_min") ?? ""
  );
  const [priceMax, setPriceMax] = useState(
    searchParams.get("price_max") ?? ""
  );
  const [roomsMin, setRoomsMin] = useState(
    searchParams.get("rooms_min") ?? ""
  );
  const [surfaceMin, setSurfaceMin] = useState(
    searchParams.get("surface_min") ?? ""
  );

  // New: floor range
  const [floorMin, setFloorMin] = useState(
    searchParams.get("floor_min") ?? ""
  );
  const [floorMax, setFloorMax] = useState(
    searchParams.get("floor_max") ?? ""
  );

  // New: equipment (boolean amenities stored in details jsonb)
  const [hasElevator, setHasElevator] = useState(
    searchParams.get("has_elevator") === "true"
  );
  const [hasParking, setHasParking] = useState(
    searchParams.get("has_parking") === "true"
  );
  const [hasBalcony, setHasBalcony] = useState(
    searchParams.get("has_balcony") === "true"
  );
  const [hasPool, setHasPool] = useState(
    searchParams.get("has_pool") === "true"
  );
  const [hasGarden, setHasGarden] = useState(
    searchParams.get("has_garden") === "true"
  );
  const [furnished, setFurnished] = useState(
    searchParams.get("furnished") === "true"
  );

  // Wilaya dropdown open state
  const [wilayaOpen, setWilayaOpen] = useState(false);

  const toggleWilaya = (code: string) => {
    setWilayaCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (listingTypes.length > 0) {
      params.set("listing_type", listingTypes[0]!);
    } else {
      params.delete("listing_type");
    }

    if (propertyTypes.length > 0) {
      params.set("property_type", propertyTypes[0]!);
    } else {
      params.delete("property_type");
    }

    // Multi-wilaya support
    params.delete("wilaya_code");
    if (wilayaCodes.length === 1) {
      params.set("wilaya_code", String(wilayaCodes[0]));
      params.delete("wilaya_codes");
    } else if (wilayaCodes.length > 1) {
      params.set("wilaya_codes", wilayaCodes.join(","));
    } else {
      params.delete("wilaya_codes");
    }

    if (priceMin) params.set("price_min", priceMin);
    else params.delete("price_min");

    if (priceMax) params.set("price_max", priceMax);
    else params.delete("price_max");

    if (roomsMin) params.set("rooms_min", roomsMin);
    else params.delete("rooms_min");

    if (surfaceMin) params.set("surface_min", surfaceMin);
    else params.delete("surface_min");

    if (floorMin) params.set("floor_min", floorMin);
    else params.delete("floor_min");

    if (floorMax) params.set("floor_max", floorMax);
    else params.delete("floor_max");

    // Equipment booleans
    if (hasElevator) params.set("has_elevator", "true");
    else params.delete("has_elevator");

    if (hasParking) params.set("has_parking", "true");
    else params.delete("has_parking");

    if (hasBalcony) params.set("has_balcony", "true");
    else params.delete("has_balcony");

    if (hasPool) params.set("has_pool", "true");
    else params.delete("has_pool");

    if (hasGarden) params.set("has_garden", "true");
    else params.delete("has_garden");

    if (furnished) params.set("furnished", "true");
    else params.delete("furnished");

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setListingTypes([]);
    setPropertyTypes([]);
    setWilayaCodes([]);
    setPriceMin("");
    setPriceMax("");
    setRoomsMin("");
    setSurfaceMin("");
    setFloorMin("");
    setFloorMax("");
    setHasElevator(false);
    setHasParking(false);
    setHasBalcony(false);
    setHasPool(false);
    setHasGarden(false);
    setFurnished(false);

    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleListingType = (type: string) => {
    setListingTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [type]
    );
  };

  const togglePropertyType = (type: string) => {
    setPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [type]
    );
  };

  return (
    <aside
      className={`${
        isOpen ? "block" : "hidden"
      } w-full shrink-0 ${isDesktopVisible ? "lg:block" : "lg:hidden"} lg:w-64`}
    >
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">{t("filters")}</h3>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-amber-500 hover:underline"
          >
            {t("reset_filters")}
          </button>
        </div>

        {/* Listing type */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-zinc-800">
            {t("listing_type_filter")}
          </h4>
          <div className="space-y-1">
            {LISTING_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-zinc-800">
                <input
                  type="checkbox"
                  checked={listingTypes.includes(type)}
                  onChange={() => toggleListingType(type)}
                  className="rounded border-gray-300 text-zinc-900 focus:ring-amber-500"
                />
                {tListings(type)}
              </label>
            ))}
          </div>
        </div>

        {/* Property type */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-zinc-800">
            {t("property_type_filter")}
          </h4>
          <div className="space-y-1">
            {PROPERTY_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-zinc-800">
                <input
                  type="checkbox"
                  checked={propertyTypes.includes(type)}
                  onChange={() => togglePropertyType(type)}
                  className="rounded border-gray-300 text-zinc-900 focus:ring-amber-500"
                />
                {tListings(type)}
              </label>
            ))}
          </div>
        </div>

        {/* Multi-select Wilaya */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-zinc-800">
            {t("wilaya_filter")}
            {wilayaCodes.length > 0 && (
              <span className="ms-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white">
                {wilayaCodes.length}
              </span>
            )}
          </h4>
          <button
            type="button"
            onClick={() => setWilayaOpen((o) => !o)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-start text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {wilayaCodes.length === 0
              ? "Sélectionner wilayas..."
              : wilayaCodes.length === 1
              ? (() => {
                  const w = wilayas.find((o) => o.code === wilayaCodes[0]);
                  return w ? `${w.code} - ${w.name}` : `Wilaya ${wilayaCodes[0]}`;
                })()
              : `${wilayaCodes.length} wilayas sélectionnées`}
          </button>
          {wilayaOpen && (
            <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
              {wilayas.map(({ code, name }) => (
                <label
                  key={code}
                  className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-zinc-800 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={wilayaCodes.includes(code)}
                    onChange={() => toggleWilaya(code)}
                    className="rounded border-gray-300 text-zinc-900 focus:ring-amber-500"
                  />
                  {code} - {name}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price range */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-zinc-800">
            {t("price_range")}
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Min"
              min={0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Max"
              min={0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Rooms min */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-zinc-800">
            {t("rooms_min")}
          </h4>
          <input
            type="number"
            value={roomsMin}
            onChange={(e) => setRoomsMin(e.target.value)}
            min={0}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Surface min */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-zinc-800">
            {t("surface_min")}
          </h4>
          <input
            type="number"
            value={surfaceMin}
            onChange={(e) => setSurfaceMin(e.target.value)}
            min={0}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Floor range */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-zinc-800">
            Étage (min – max)
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              value={floorMin}
              onChange={(e) => setFloorMin(e.target.value)}
              placeholder="Min"
              min={0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="number"
              value={floorMax}
              onChange={(e) => setFloorMax(e.target.value)}
              placeholder="Max"
              min={0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Equipment / Amenities */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-zinc-800">
            Équipements
          </h4>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={hasElevator}
                onChange={(e) => setHasElevator(e.target.checked)}
                className="rounded border-gray-300 text-zinc-900 focus:ring-amber-500"
              />
              Ascenseur
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={hasParking}
                onChange={(e) => setHasParking(e.target.checked)}
                className="rounded border-gray-300 text-zinc-900 focus:ring-amber-500"
              />
              Parking
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={hasBalcony}
                onChange={(e) => setHasBalcony(e.target.checked)}
                className="rounded border-gray-300 text-zinc-900 focus:ring-amber-500"
              />
              Balcon
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={hasPool}
                onChange={(e) => setHasPool(e.target.checked)}
                className="rounded border-gray-300 text-zinc-900 focus:ring-amber-500"
              />
              Piscine
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={hasGarden}
                onChange={(e) => setHasGarden(e.target.checked)}
                className="rounded border-gray-300 text-zinc-900 focus:ring-amber-500"
              />
              Jardin
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={furnished}
                onChange={(e) => setFurnished(e.target.checked)}
                className="rounded border-gray-300 text-zinc-900 focus:ring-amber-500"
              />
              Meublé
            </label>
          </div>
        </div>

        {/* Apply button */}
        <button
          type="button"
          onClick={applyFilters}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-900/90"
        >
          {t("button")}
        </button>

        {/* Save search as alert */}
        {onSaveSearch && (
          <button
            type="button"
            onClick={onSaveSearch}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500 px-4 py-2 text-sm font-medium text-amber-500 transition-colors hover:bg-amber-500/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            Sauvegarder cette recherche
          </button>
        )}
      </div>
    </aside>
  );
}
