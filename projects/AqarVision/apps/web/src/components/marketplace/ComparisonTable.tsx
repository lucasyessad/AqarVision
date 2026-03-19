"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { X, Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Link } from "@/lib/i18n/navigation";
import type { ListingCard } from "@/features/listings/types/listing.types";

export interface ComparisonTableProps {
  listings: ListingCard[];
  onClose: () => void;
}

interface ComparisonRow {
  labelKey: string;
  getValue: (listing: ListingCard) => string | number | boolean | null;
  format?: "price" | "area" | "boolean" | "text" | "number";
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    labelKey: "comparison.price",
    getValue: (l) => l.price,
    format: "price",
  },
  {
    labelKey: "comparison.area",
    getValue: (l) => l.area_m2,
    format: "area",
  },
  {
    labelKey: "comparison.rooms",
    getValue: (l) => l.rooms,
    format: "number",
  },
  {
    labelKey: "comparison.location",
    getValue: (l) => `${l.wilaya_name}${l.commune_name ? `, ${l.commune_name}` : ""}`,
    format: "text",
  },
  {
    labelKey: "comparison.type",
    getValue: (l) => l.listing_type,
    format: "text",
  },
  {
    labelKey: "comparison.propertyType",
    getValue: (l) => l.property_type,
    format: "text",
  },
  {
    labelKey: "comparison.agency",
    getValue: (l) => l.agency_name,
    format: "text",
  },
];

function formatValue(
  value: string | number | boolean | null,
  format: ComparisonRow["format"]
): string {
  if (value === null || value === undefined) return "—";

  switch (format) {
    case "price":
      return `${new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(value as number)} DZD`;
    case "area":
      return `${value} m²`;
    case "number":
      return value.toString();
    case "boolean":
      return "";
    case "text":
    default:
      return String(value);
  }
}

function getCellHighlight(
  value: string | number | boolean | null,
  allValues: Array<string | number | boolean | null>,
  format: ComparisonRow["format"]
): string {
  if (value === null || allValues.length < 2) return "";

  const numericFormats = ["price", "area", "number"];
  if (!numericFormats.includes(format ?? "")) return "";

  const numbers = allValues.filter((v): v is number => typeof v === "number");
  if (numbers.length < 2) return "";

  const numValue = value as number;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  if (min === max) return "";

  if (format === "price") {
    if (numValue === min) return "text-green-600 dark:text-green-400 font-semibold";
    if (numValue === max) return "text-red-600 dark:text-red-400";
  } else {
    if (numValue === max) return "text-green-600 dark:text-green-400 font-semibold";
    if (numValue === min) return "text-red-600 dark:text-red-400";
  }

  return "";
}

export function ComparisonTable({ listings, onClose }: ComparisonTableProps) {
  const t = useTranslations("search");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl dark:bg-stone-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">
            {t("comparison.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Fermer"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-700">
                <th className="w-40 shrink-0 px-4 py-3 text-start">
                  <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                    {t("comparison.photo")}
                  </span>
                </th>
                {listings.map((listing) => (
                  <th key={listing.id} className="px-3 py-3 text-start">
                    <Link href={`/annonce/${listing.slug}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
                        {listing.cover_url ? (
                          <Image
                            src={listing.cover_url}
                            alt={listing.title}
                            fill
                            sizes="(max-width: 640px) 50vw, 300px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-stone-400 dark:text-stone-500">
                            <Minus size={24} aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-stone-900 dark:text-stone-100">
                        {listing.title}
                      </p>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => {
                const values = listings.map((l) => row.getValue(l));

                return (
                  <tr
                    key={row.labelKey}
                    className="border-b border-stone-100 last:border-b-0 dark:border-stone-800"
                  >
                    <td className="w-40 shrink-0 px-4 py-3">
                      <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                        {t(row.labelKey)}
                      </span>
                    </td>
                    {listings.map((listing, idx) => {
                      const value = values[idx] ?? null;
                      const highlight = getCellHighlight(value, values, row.format);

                      return (
                        <td key={listing.id} className="px-3 py-3">
                          {row.format === "boolean" ? (
                            value ? (
                              <Check
                                size={18}
                                className="text-green-600 dark:text-green-400"
                                aria-label="Oui"
                              />
                            ) : (
                              <Minus
                                size={18}
                                className="text-stone-400 dark:text-stone-500"
                                aria-label="Non"
                              />
                            )
                          ) : (
                            <span
                              className={cn(
                                "text-sm text-stone-900 dark:text-stone-100",
                                highlight
                              )}
                            >
                              {formatValue(value, row.format)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-stone-200 dark:border-stone-700">
                <td className="w-40 shrink-0" />
                {listings.map((listing) => (
                  <td key={listing.id} className="px-3 py-3">
                    <Link href={`/annonce/${listing.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        {t("comparison.viewListing")}
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
