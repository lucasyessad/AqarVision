"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/features/listings/schemas/listing.schema";

export function SearchBar() {
  const t = useTranslations("search");
  const tListings = useTranslations("listings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [listingType, setListingType] = useState(
    searchParams.get("listing_type") ?? ""
  );
  const [propertyType, setPropertyType] = useState(
    searchParams.get("property_type") ?? ""
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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSearchParams = useCallback(
    (overrides?: Record<string, string>) => {
      const params = new URLSearchParams();
      const values: Record<string, string> = {
        q: query,
        listing_type: listingType,
        property_type: propertyType,
        wilaya_code: wilayaCode,
        price_min: priceMin,
        price_max: priceMax,
        ...overrides,
      };

      for (const [key, value] of Object.entries(values)) {
        if (value) {
          params.set(key, value);
        }
      }

      // Reset page to 1 on new search
      params.delete("page");

      router.push(`${pathname}?${params.toString()}`);
    },
    [query, listingType, propertyType, wilayaCode, priceMin, priceMax, pathname, router]
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        updateSearchParams({ q: value });
      }, 300);
    },
    [updateSearchParams]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-4"
    >
      {/* Search input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute inset-inline-start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full rounded-lg border border-gray-300 py-3 ps-10 pe-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[#d4af37] px-6 py-3 font-medium text-[#1a365d] transition-colors hover:bg-[#d4af37]/90"
        >
          {t("button")}
        </button>
      </div>

      {/* Filter dropdowns row */}
      <div className="flex flex-wrap gap-3">
        <select
          value={listingType}
          onChange={(e) => {
            setListingType(e.target.value);
            updateSearchParams({ listing_type: e.target.value });
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
        >
          <option value="">{t("listing_type_filter")}</option>
          {LISTING_TYPES.map((type) => (
            <option key={type} value={type}>
              {tListings(type)}
            </option>
          ))}
        </select>

        <select
          value={propertyType}
          onChange={(e) => {
            setPropertyType(e.target.value);
            updateSearchParams({ property_type: e.target.value });
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
        >
          <option value="">{t("property_type_filter")}</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {tListings(`property_${type}`)}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={wilayaCode}
          onChange={(e) => {
            setWilayaCode(e.target.value);
            updateSearchParams({ wilaya_code: e.target.value });
          }}
          placeholder={t("wilaya_filter")}
          min={1}
          max={58}
          className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
        />

        <input
          type="number"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          onBlur={() => updateSearchParams()}
          placeholder={t("price_range") + " min"}
          min={0}
          className="w-36 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
        />

        <input
          type="number"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          onBlur={() => updateSearchParams()}
          placeholder={t("price_range") + " max"}
          min={0}
          className="w-36 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
        />
      </div>
    </form>
  );
}
