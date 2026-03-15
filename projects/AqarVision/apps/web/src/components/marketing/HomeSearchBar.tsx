"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface HomeSearchBarProps {
  locale: string;
  wilayas: { code: string; name: string }[];
}

const LISTING_TYPES = [
  { value: "", label: "Acheter ou louer" },
  { value: "sale", label: "Acheter" },
  { value: "rent", label: "Louer" },
  { value: "vacation", label: "Vacances" },
];

const PROPERTY_TYPES = [
  { value: "", label: "Tous les biens" },
  { value: "apartment", label: "Appartement" },
  { value: "villa", label: "Villa" },
  { value: "terrain", label: "Terrain" },
  { value: "office", label: "Bureau" },
  { value: "commercial", label: "Local commercial" },
];

export function HomeSearchBar({ locale, wilayas }: HomeSearchBarProps) {
  const router = useRouter();
  const [wilaya, setWilaya] = useState("");
  const [listingType, setListingType] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (wilaya) params.set("wilaya_code", wilaya);
    if (listingType) params.set("listing_type", listingType);
    if (propertyType) params.set("property_type", propertyType);
    router.push(`/${locale}/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div
      className="w-full max-w-3xl overflow-hidden shadow-2xl"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(24px)",
        borderRadius: "4px",
      }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Wilaya */}
        <div
          className="flex flex-1 items-center gap-2 px-4 py-4 sm:border-e"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "#9ca3af" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <select
            value={wilaya}
            onChange={(e) => setWilaya(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm outline-none cursor-pointer"
            style={{
              background: "transparent",
              color: wilaya ? "#111" : "#9ca3af",
              appearance: "none",
            }}
          >
            <option value="">Toutes les wilayas</option>
            {wilayas.map((w) => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* Listing type */}
        <div
          className="flex flex-1 items-center gap-2 px-4 py-4 sm:border-e"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "#9ca3af" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <select
            value={listingType}
            onChange={(e) => setListingType(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm outline-none cursor-pointer"
            style={{
              background: "transparent",
              color: listingType ? "#111" : "#9ca3af",
              appearance: "none",
            }}
          >
            {LISTING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Property type */}
        <div
          className="flex flex-1 items-center gap-2 px-4 py-4"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "#9ca3af" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
          </svg>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm outline-none cursor-pointer"
            style={{
              background: "transparent",
              color: propertyType ? "#111" : "#9ca3af",
              appearance: "none",
            }}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 px-7 py-4 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: "var(--onyx)",
            color: "var(--ivoire)",
            whiteSpace: "nowrap",
            minWidth: "140px",
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Rechercher
        </button>
      </div>
    </div>
  );
}
