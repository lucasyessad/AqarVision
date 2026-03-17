"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Plus,
  X,
  MapPin,
  Maximize2,
  BedDouble,
  Bath,
  Check,
  Minus,
} from "lucide-react";

interface CompareListing {
  id: string;
  slug: string;
  title: string;
  current_price: number;
  currency: string;
  surface_m2: number | null;
  rooms: number | null;
  bathrooms: number | null;
  wilaya_name: string;
  commune_name: string | null;
  property_type: string;
  listing_type: string;
  photo_url: string | null;
  details: Record<string, boolean | string | number>;
}

interface CompareClientProps {
  locale: string;
}

export function CompareClient({ locale }: CompareClientProps) {
  const t = useTranslations("compare");
  const [listings, setListings] = useState<CompareListing[]>([]);

  const removeListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);

  const criteria = [
    { key: "price", label: t("price"), render: (l: CompareListing) => formatPrice(l.current_price, l.currency) },
    { key: "surface", label: t("surface"), render: (l: CompareListing) => l.surface_m2 ? `${l.surface_m2} m²` : "—" },
    { key: "rooms", label: t("rooms"), render: (l: CompareListing) => l.rooms?.toString() ?? "—" },
    { key: "bathrooms", label: t("bathrooms"), render: (l: CompareListing) => l.bathrooms?.toString() ?? "—" },
    { key: "location", label: t("location"), render: (l: CompareListing) => l.commune_name ? `${l.commune_name}, ${l.wilaya_name}` : l.wilaya_name },
    { key: "type", label: t("property_type"), render: (l: CompareListing) => l.property_type },
  ];

  // Detail keys that appear in at least one listing
  const detailKeys = [...new Set(listings.flatMap((l) => Object.keys(l.details)))];

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 py-16 dark:border-zinc-600">
        <Plus className="h-10 w-10 text-zinc-400" />
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {t("empty_state")}
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {t("empty_hint")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-40 border-b border-zinc-200 p-3 text-start text-sm font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-400" />
            {listings.map((listing) => (
              <th
                key={listing.id}
                className="min-w-[200px] border-b border-zinc-200 p-3 dark:border-zinc-700"
              >
                <div className="relative">
                  <button
                    onClick={() => removeListing(listing.id)}
                    className="absolute -top-1 end-0 rounded-full bg-zinc-100 p-1 text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:bg-zinc-800 dark:hover:bg-red-900/30"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="relative mx-auto mb-2 aspect-[4/3] w-full max-w-[180px] overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                    {listing.photo_url ? (
                      <Image
                        src={listing.photo_url}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="180px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-400">
                        <Maximize2 className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <a
                    href={`/${locale}/annonce/${listing.slug}`}
                    className="block text-sm font-medium text-zinc-900 hover:text-med-600 dark:text-zinc-100 dark:hover:text-med-400"
                  >
                    {listing.title}
                  </a>
                </div>
              </th>
            ))}
            {listings.length < 4 && (
              <th className="min-w-[200px] border-b border-zinc-200 p-3 dark:border-zinc-700">
                <button className="mx-auto flex flex-col items-center gap-1 rounded-lg border-2 border-dashed border-zinc-300 px-6 py-8 text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-500 dark:border-zinc-600 dark:hover:border-zinc-500">
                  <Plus className="h-6 w-6" />
                  <span className="text-xs">{t("add_listing")}</span>
                </button>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {criteria.map((criterion, i) => (
            <tr
              key={criterion.key}
              className={i % 2 === 0 ? "bg-zinc-50 dark:bg-zinc-800/50" : ""}
            >
              <td className="border-b border-zinc-200 p-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                {criterion.label}
              </td>
              {listings.map((listing) => (
                <td
                  key={listing.id}
                  className="border-b border-zinc-200 p-3 text-center text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
                >
                  {criterion.render(listing)}
                </td>
              ))}
              {listings.length < 4 && (
                <td className="border-b border-zinc-200 dark:border-zinc-700" />
              )}
            </tr>
          ))}
          {detailKeys.map((key) => (
            <tr key={key}>
              <td className="border-b border-zinc-200 p-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                {key}
              </td>
              {listings.map((listing) => {
                const val = listing.details[key];
                return (
                  <td
                    key={listing.id}
                    className="border-b border-zinc-200 p-3 text-center dark:border-zinc-700"
                  >
                    {typeof val === "boolean" ? (
                      val ? (
                        <Check className="mx-auto h-4 w-4 text-atlas-500" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                      )
                    ) : (
                      <span className="text-sm text-zinc-900 dark:text-zinc-100">
                        {String(val ?? "—")}
                      </span>
                    )}
                  </td>
                );
              })}
              {listings.length < 4 && (
                <td className="border-b border-zinc-200 dark:border-zinc-700" />
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
