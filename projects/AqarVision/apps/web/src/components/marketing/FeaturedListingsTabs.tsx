"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ListingCard } from "@/components/marketplace/ListingCard";
import type { ListingCard as ListingCardType } from "@/features/listings/types/listing.types";

type TabType = "sale" | "rent" | "vacation";

export interface FeaturedListingsTabsProps {
  listings: {
    sale: ListingCardType[];
    rent: ListingCardType[];
    vacation: ListingCardType[];
  };
  className?: string;
}

export function FeaturedListingsTabs({
  listings,
  className,
}: FeaturedListingsTabsProps) {
  const t = useTranslations("marketing");
  const [activeTab, setActiveTab] = useState<TabType>("sale");

  const tabs: { key: TabType; label: string }[] = [
    { key: "sale", label: t("tabSale") },
    { key: "rent", label: t("tabRent") },
    { key: "vacation", label: t("tabVacation") },
  ];

  return (
    <div className={className}>
      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-stone-100 dark:bg-stone-800 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors duration-fast",
              activeTab === tab.key
                ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-50 shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {listings[activeTab].map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
