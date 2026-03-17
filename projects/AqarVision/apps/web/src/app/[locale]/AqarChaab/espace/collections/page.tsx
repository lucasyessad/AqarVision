import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUserCollections } from "@/features/favorites/services/collections.service";
import { getUserFavorites } from "@/features/favorites/services/favorites.service";
import { CollectionsManager } from "@/features/favorites/components/CollectionsManager";
import type { CollectionFavoriteDto } from "@/features/favorites/types/collections.types";

interface CollectionsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CollectionsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "espace" });
  return { title: t("nav.collections") };
}

export default async function CollectionsPage({ params }: CollectionsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth is guaranteed by layout, user is always present here
  const [collections, favoritesRaw] = await Promise.all([
    getUserCollections(supabase, user!.id),
    supabase
      .from("favorites")
      .select("id, listing_id, collection_id, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  const favoriteRows = (favoritesRaw.data ?? []) as Array<{
    id: string;
    listing_id: string;
    collection_id: string | null;
    created_at: string;
  }>;

  // Enrich with listing titles
  const listingIds = favoriteRows.map((f) => f.listing_id);
  let titleMap: Record<string, string> = {};

  if (listingIds.length > 0) {
    const { data: translations } = await supabase
      .from("listing_translations")
      .select("listing_id, title")
      .in("listing_id", listingIds)
      .eq("locale", locale);

    const { data: fallback } = await supabase
      .from("listing_translations")
      .select("listing_id, title")
      .in("listing_id", listingIds)
      .eq("locale", "fr");

    for (const id of listingIds) {
      const match =
        (translations ?? []).find((t) => t.listing_id === id) ??
        (fallback ?? []).find((t) => t.listing_id === id);
      titleMap[id] = (match?.title as string) ?? "—";
    }
  }

  const favorites: CollectionFavoriteDto[] = favoriteRows.map((f) => ({
    id: f.id,
    listing_id: f.listing_id,
    collection_id: f.collection_id,
    created_at: f.created_at,
    listing_title: titleMap[f.listing_id] ?? "—",
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Collections</h1>
        <p className="mt-1 text-sm text-gray-500">
          Organisez vos favoris en collections. Glissez une annonce vers une collection.
        </p>
      </div>

      <CollectionsManager collections={collections} favorites={favorites} />
    </div>
  );
}
