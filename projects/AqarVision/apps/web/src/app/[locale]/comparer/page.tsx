import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import type { Metadata } from "next";
import {
  ArrowUpDown,
  Image,
  ArrowLeft,
} from "lucide-react";

interface ComparerPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ids?: string }>;
}

export const metadata: Metadata = {
  title: "Comparer des annonces",
};

interface ListingForCompare {
  id: string;
  current_price: number;
  currency: string;
  listing_type: string;
  property_type: string;
  surface_m2: number | null;
  rooms: number | null;
  bathrooms: number | null;
  wilaya_code: string | null;
  details: Record<string, unknown>;
  title: string;
  slug: string;
  cover_url: string | null;
  agency_name: string;
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

const COMPARE_ROWS: { label: string; key: keyof ListingForCompare | "equipments" }[] = [
  { label: "Prix", key: "current_price" },
  { label: "Surface", key: "surface_m2" },
  { label: "Pièces", key: "rooms" },
  { label: "Salles de bain", key: "bathrooms" },
  { label: "Type de bien", key: "property_type" },
  { label: "Type d'annonce", key: "listing_type" },
  { label: "Wilaya", key: "wilaya_code" },
];

export default async function ComparerPage({
  params,
  searchParams,
}: ComparerPageProps) {
  const { locale } = await params;
  const { ids = "" } = await searchParams;
  setRequestLocale(locale);

  const listingIds = ids
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length === 36) // UUID length guard
    .slice(0, 3);

  if (listingIds.length < 2) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <ArrowUpDown className="mx-auto mb-4 h-12 w-12 text-zinc-400 dark:text-zinc-600" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Sélectionnez au moins 2 annonces</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Utilisez le bouton &quot;Comparer&quot; sur les annonces pour les ajouter ici.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Rechercher des annonces
          </Link>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  // Fetch listings
  const { data: listingsRaw } = await supabase
    .from("listings")
    .select(
      "id, current_price, currency, listing_type, property_type, surface_m2, rooms, bathrooms, wilaya_code, details"
    )
    .in("id", listingIds)
    .eq("current_status", "published")
    .is("deleted_at", null);

  const rows = (listingsRaw ?? []) as Array<Record<string, unknown>>;

  // Translations
  const { data: translationsRaw } = await supabase
    .from("listing_translations")
    .select("listing_id, title, slug, locale")
    .in("listing_id", listingIds);

  // Media (cover)
  const { data: mediaRaw } = await supabase
    .from("listing_media")
    .select("listing_id, storage_path, is_cover")
    .in("listing_id", listingIds)
    .eq("is_cover", true);

  // Agencies
  const agencyIds = rows.map((r) => r.agency_id as string).filter(Boolean);
  const { data: agenciesRaw } = await supabase
    .from("agencies")
    .select("id, name")
    .in("id", agencyIds);

  const listingsMaybeNull: (ListingForCompare | null)[] = listingIds
    .map((id) => {
      const row = rows.find((r) => r.id === id);
      if (!row) return null;

      const translation =
        (translationsRaw ?? []).find(
          (t) => (t as Record<string, unknown>).listing_id === id &&
                 (t as Record<string, unknown>).locale === locale
        ) ??
        (translationsRaw ?? []).find(
          (t) => (t as Record<string, unknown>).listing_id === id &&
                 (t as Record<string, unknown>).locale === "fr"
        );

      const media = (mediaRaw ?? []).find(
        (m) => (m as Record<string, unknown>).listing_id === id
      ) as Record<string, unknown> | undefined;

      const agency = (agenciesRaw ?? []).find(
        (a) => (a as Record<string, unknown>).id === row.agency_id
      ) as Record<string, unknown> | undefined;

      return {
        id,
        current_price: (row.current_price as number) ?? 0,
        currency: (row.currency as string) ?? "DZD",
        listing_type: (row.listing_type as string) ?? "",
        property_type: (row.property_type as string) ?? "",
        surface_m2: (row.surface_m2 as number) ?? null,
        rooms: (row.rooms as number) ?? null,
        bathrooms: (row.bathrooms as number) ?? null,
        wilaya_code: (row.wilaya_code as string) ?? null,
        details: (row.details as Record<string, unknown>) ?? {},
        title: (translation as Record<string, unknown> | undefined)?.title as string ?? "—",
        slug: (translation as Record<string, unknown> | undefined)?.slug as string ?? "",
        cover_url: (media?.storage_path as string) ?? null,
        agency_name: (agency?.name as string) ?? "—",
      } satisfies ListingForCompare;
    });

  const listings: ListingForCompare[] = listingsMaybeNull.filter(
    (l): l is ListingForCompare => l !== null
  );

  function renderCell(listing: ListingForCompare, key: keyof ListingForCompare | "equipments"): string {
    if (key === "current_price") {
      return formatPrice(listing.current_price, listing.currency);
    }
    if (key === "surface_m2") {
      return listing.surface_m2 !== null ? `${listing.surface_m2} m²` : "—";
    }
    if (key === "rooms" || key === "bathrooms") {
      const val = listing[key];
      return val !== null ? String(val) : "—";
    }
    if (key === "wilaya_code") {
      return listing.wilaya_code !== null ? `Wilaya ${listing.wilaya_code}` : "—";
    }
    if (key === "equipments") {
      const eq = listing.details;
      const bools = Object.entries(eq)
        .filter(([, v]) => v === true)
        .map(([k]) => k.replace(/_/g, " "))
        .slice(0, 5);
      return bools.length > 0 ? bools.join(", ") : "—";
    }
    const val = listing[key as keyof ListingForCompare];
    return val !== null && val !== undefined ? String(val) : "—";
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Comparaison</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {listings.length} annonce{listings.length !== 1 ? "s" : ""} comparées
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la recherche
          </Link>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="w-40 px-4 py-4 text-start text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Critère
                </th>
                {listings.map((listing) => (
                  <th key={listing.id} className="px-4 py-4 text-start">
                    <div className="flex flex-col gap-2">
                      {/* Cover image */}
                      <div className="h-24 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        {listing.cover_url ? (
                          <img
                            src={listing.cover_url}
                            alt={listing.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Image className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/annonce/${listing.slug}`}
                        className="line-clamp-2 text-sm font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
                      >
                        {listing.title}
                      </Link>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">{listing.agency_name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, idx) => (
                <tr
                  key={row.key}
                  className={
                    idx % 2 === 0
                      ? "bg-white dark:bg-zinc-900"
                      : "bg-zinc-50/50 dark:bg-zinc-800/30"
                  }
                >
                  <td className="px-4 py-3 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    {row.label}
                  </td>
                  {listings.map((listing) => {
                    const value = renderCell(listing, row.key);
                    const isBestPrice =
                      row.key === "current_price" &&
                      listing.current_price === Math.min(...listings.map((l) => l.current_price));
                    const isBestSurface =
                      row.key === "surface_m2" &&
                      listing.surface_m2 !== null &&
                      listing.surface_m2 === Math.max(...listings.map((l) => l.surface_m2 ?? 0));

                    return (
                      <td
                        key={listing.id}
                        className={`px-4 py-3 text-sm ${
                          isBestPrice || isBestSurface
                            ? "font-semibold text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {value}
                        {isBestPrice && (
                          <span className="ms-1.5 inline-flex rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                            Meilleur prix
                          </span>
                        )}
                        {isBestSurface && (
                          <span className="ms-1.5 inline-flex rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                            Plus grand
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Equipements row */}
              <tr className="bg-white dark:bg-zinc-900">
                <td className="px-4 py-3 text-xs font-medium text-zinc-400 dark:text-zinc-500">Équipements</td>
                {listings.map((listing) => (
                  <td key={listing.id} className="px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200">
                    {renderCell(listing, "equipments")}
                  </td>
                ))}
              </tr>

              {/* Actions row */}
              <tr className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <td className="px-4 py-3" />
                {listings.map((listing) => (
                  <td key={listing.id} className="px-4 py-3">
                    <Link
                      href={`/annonce/${listing.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      Voir l&apos;annonce
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
