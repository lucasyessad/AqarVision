"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, MapPin, Home, Building2 } from "lucide-react";

interface HomeSearchBarProps {
  locale: string;
  wilayas: { code: string; name: string }[];
}

const TRANSACTION_PILLS = [
  { value: "sale", labelKey: "buy" as const, emoji: "\u{1F3E0}" },
  { value: "rent", labelKey: "rent" as const, emoji: "\u{1F511}" },
  { value: "vacation", labelKey: "vacation" as const, emoji: "\u2600\uFE0F" },
] as const;

const PROPERTY_TYPES = [
  { value: "", labelKey: "all_property_types" as const },
  { value: "apartment", labelKey: "apartment" as const },
  { value: "villa", labelKey: "villa" as const },
  { value: "terrain", labelKey: "terrain" as const },
  { value: "office", labelKey: "office" as const },
  { value: "commercial", labelKey: "commercial" as const },
];

export function HomeSearchBar({ locale, wilayas }: HomeSearchBarProps) {
  const router = useRouter();
  const t = useTranslations("homepage.search_bar");
  const [wilaya, setWilaya] = useState("");
  const [listingType, setListingType] = useState("sale");
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
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      {/* Transaction type pills */}
      <div className="flex gap-2">
        {TRANSACTION_PILLS.map(({ value, labelKey, emoji }) => (
          <button
            key={value}
            type="button"
            onClick={() => setListingType(value)}
            className={[
              "rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              listingType === value
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                : "bg-white/10 text-white/65 backdrop-blur-sm hover:bg-white/20",
            ].join(" ")}
          >
            {emoji} {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="w-full overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-xl focus-within:ring-2 focus-within:ring-amber-500/30 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row">
          {/* Wilaya */}
          <div className="flex flex-1 items-center gap-2 px-4 h-14">
            <MapPin className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
            <select
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              onKeyDown={handleKeyDown}
              className={[
                "flex-1 cursor-pointer appearance-none bg-transparent text-sm outline-none",
                wilaya
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 dark:text-zinc-500",
              ].join(" ")}
            >
              <option value="">{t("all_wilayas")}</option>
              {wilayas.map((w) => (
                <option key={w.code} value={w.code}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Separator */}
          <div className="hidden sm:flex items-center">
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700" />
          </div>

          {/* Property type */}
          <div className="flex flex-1 items-center gap-2 px-4 h-14">
            <Building2 className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              onKeyDown={handleKeyDown}
              className={[
                "flex-1 cursor-pointer appearance-none bg-transparent text-sm outline-none",
                propertyType
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 dark:text-zinc-500",
              ].join(" ")}
            >
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>{t(pt.labelKey)}</option>
              ))}
            </select>
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSearch}
            className="flex min-w-[140px] items-center justify-center gap-2 whitespace-nowrap rounded-e-2xl bg-amber-500 hover:bg-amber-600 h-14 px-7 text-sm font-semibold text-white transition-colors"
          >
            <Search className="h-4 w-4" />
            {t("button")}
          </button>
        </div>
      </div>
    </div>
  );
}
