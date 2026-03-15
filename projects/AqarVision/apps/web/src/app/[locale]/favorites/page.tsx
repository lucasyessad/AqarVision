import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getUserFavorites,
  getUserNotes,
  getUserSearches,
} from "@/features/favorites/services/favorites.service";
import { FavoritesTabs } from "@/features/favorites/components/FavoritesTabs";

interface FavoritesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FavoritesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "favorites" });
  return { title: t("title") };
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "favorites" });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/AqarChaab/auth/login`);
  }

  const [favorites, notes, searches] = await Promise.all([
    getUserFavorites(supabase, user.id),
    getUserNotes(supabase, user.id),
    getUserSearches(supabase, user.id),
  ]);

  // Enrich favorites with listing titles
  const listingIds = favorites.map((f) => f.listing_id);
  const listingTitles: Record<string, string> = {};

  if (listingIds.length > 0) {
    const { data: translations } = await supabase
      .from("listing_translations")
      .select("listing_id, title, locale")
      .in("listing_id", listingIds)
      .eq("locale", locale);

    const { data: fallbackTranslations } = await supabase
      .from("listing_translations")
      .select("listing_id, title, locale")
      .in("listing_id", listingIds)
      .eq("locale", "fr");

    for (const id of listingIds) {
      const match =
        translations?.find((tr) => tr.listing_id === id) ??
        fallbackTranslations?.find((tr) => tr.listing_id === id);
      listingTitles[id] = match?.title ?? "—";
    }
  }

  const enrichedFavorites = favorites.map((f) => ({
    ...f,
    listing_title: listingTitles[f.listing_id] ?? "—",
  }));

  // Enrich notes with listing titles
  const noteListingIds = notes.map((n) => n.listing_id);
  const noteTitles: Record<string, string> = {};

  if (noteListingIds.length > 0) {
    const { data: noteTranslations } = await supabase
      .from("listing_translations")
      .select("listing_id, title, locale")
      .in("listing_id", noteListingIds)
      .eq("locale", locale);

    const { data: noteFallback } = await supabase
      .from("listing_translations")
      .select("listing_id, title, locale")
      .in("listing_id", noteListingIds)
      .eq("locale", "fr");

    for (const id of noteListingIds) {
      const match =
        noteTranslations?.find((tr) => tr.listing_id === id) ??
        noteFallback?.find((tr) => tr.listing_id === id);
      noteTitles[id] = match?.title ?? "—";
    }
  }

  const enrichedNotes = notes.map((n) => ({
    ...n,
    listing_title: noteTitles[n.listing_id] ?? "—",
  }));

  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-[#1a365d]">
          {t("title")}
        </h1>

        <FavoritesTabs
          favorites={enrichedFavorites}
          notes={enrichedNotes}
          searches={searches}
        />
      </div>
    </main>
  );
}
