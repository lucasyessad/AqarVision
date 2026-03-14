"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/features/listings/schemas/listing.schema";

interface SearchFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SearchFilters({ isOpen, onToggle }: SearchFiltersProps) {
  const t = useTranslations("search");
  const tListings = useTranslations("listings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [listingTypes, setListingTypes] = useState<string[]>(
    searchParams.get("listing_type")?.split(",").filter(Boolean) ?? []
  );
  const [propertyTypes, setPropertyTypes] = useState<string[]>(
    searchParams.get("property_type")?.split(",").filter(Boolean) ?? []
  );
  const [wilayaCode, setWilayaCode] = useState(
    searchParams.get("wilaya_code") ?? ""
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

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Preserve q
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

    if (wilayaCode) {
      params.set("wilaya_code", wilayaCode);
    } else {
      params.delete("wilaya_code");
    }

    if (priceMin) {
      params.set("price_min", priceMin);
    } else {
      params.delete("price_min");
    }

    if (priceMax) {
      params.set("price_max", priceMax);
    } else {
      params.delete("price_max");
    }

    if (roomsMin) {
      params.set("rooms_min", roomsMin);
    } else {
      params.delete("rooms_min");
    }

    if (surfaceMin) {
      params.set("surface_min", surfaceMin);
    } else {
      params.delete("surface_min");
    }

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setListingTypes([]);
    setPropertyTypes([]);
    setWilayaCode("");
    setPriceMin("");
    setPriceMax("");
    setRoomsMin("");
    setSurfaceMin("");

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
      } w-full shrink-0 lg:block lg:w-64`}
    >
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1a365d]">{t("filters")}</h3>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-[#d4af37] hover:underline"
          >
            {t("reset_filters")}
          </button>
        </div>

        {/* Listing type */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-[#2d3748]">
            {t("listing_type_filter")}
          </h4>
          <div className="space-y-1">
            {LISTING_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-[#2d3748]">
                <input
                  type="checkbox"
                  checked={listingTypes.includes(type)}
                  onChange={() => toggleListingType(type)}
                  className="rounded border-gray-300 text-[#1a365d] focus:ring-[#d4af37]"
                />
                {tListings(type)}
              </label>
            ))}
          </div>
        </div>

        {/* Property type */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-[#2d3748]">
            {t("property_type_filter")}
          </h4>
          <div className="space-y-1">
            {PROPERTY_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-[#2d3748]">
                <input
                  type="checkbox"
                  checked={propertyTypes.includes(type)}
                  onChange={() => togglePropertyType(type)}
                  className="rounded border-gray-300 text-[#1a365d] focus:ring-[#d4af37]"
                />
                {tListings(type)}
              </label>
            ))}
          </div>
        </div>

        {/* Wilaya */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-[#2d3748]">
            {t("wilaya_filter")}
          </h4>
          <input
            type="number"
            value={wilayaCode}
            onChange={(e) => setWilayaCode(e.target.value)}
            min={1}
            max={58}
            placeholder="1-58"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
        </div>

        {/* Price range */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-[#2d3748]">
            {t("price_range")}
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Min"
              min={0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            />
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Max"
              min={0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            />
          </div>
        </div>

        {/* Rooms min */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-[#2d3748]">
            {t("rooms_min")}
          </h4>
          <input
            type="number"
            value={roomsMin}
            onChange={(e) => setRoomsMin(e.target.value)}
            min={0}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
        </div>

        {/* Surface min */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-[#2d3748]">
            {t("surface_min")}
          </h4>
          <input
            type="number"
            value={surfaceMin}
            onChange={(e) => setSurfaceMin(e.target.value)}
            min={0}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
        </div>

        {/* Apply button */}
        <button
          type="button"
          onClick={applyFilters}
          className="w-full rounded-lg bg-[#1a365d] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a365d]/90"
        >
          {t("button")}
        </button>
      </div>
    </aside>
  );
}
