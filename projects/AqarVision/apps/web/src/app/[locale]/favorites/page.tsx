import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getUserFavorites,
  getUserNotes,
  getUserSearches,
} from "@/features/favorites/services/favorites.service";
import { FavoritesList } from "@/features/favorites/components/FavoritesList";
import { deleteSavedSearchAction } from "@/features/favorites/actions/favorites.action";

interface FavoritesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: FavoritesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "favorites" });
  return { title: t("title") };
}

export default async function FavoritesPage({
  params,
  searchParams,
}: FavoritesPageProps) {
  const { locale } = await params;
  const { tab = "favorites" } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "favorites" });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
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

  const tabs = [
    { key: "favorites", label: t("my_favorites"), count: favorites.length },
    { key: "notes", label: t("my_notes"), count: notes.length },
    { key: "searches", label: t("saved_searches"), count: searches.length },
  ];

  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-[#1a365d]">
          {t("title")}
        </h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-white p-1 shadow-sm">
          {tabs.map((tabItem) => (
            <a
              key={tabItem.key}
              href={`?tab=${tabItem.key}`}
              className={`flex-1 rounded-md px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                tab === tabItem.key
                  ? "bg-[#1a365d] text-white"
                  : "text-[#2d3748] hover:bg-gray-100"
              }`}
            >
              {tabItem.label}
              {tabItem.count > 0 && (
                <span
                  className={`ms-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-semibold ${
                    tab === tabItem.key
                      ? "bg-white/20 text-white"
                      : "bg-[#1a365d]/10 text-[#1a365d]"
                  }`}
                >
                  {tabItem.count}
                </span>
              )}
            </a>
          ))}
        </div>

        {/* Tab content */}
        {tab === "favorites" && (
          <FavoritesList favorites={enrichedFavorites} />
        )}

        {tab === "notes" && (
          <div>
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mb-4 h-12 w-12 text-[#a0aec0]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
                <p className="text-sm text-[#a0aec0]">{t("no_notes")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <h3 className="mb-1 text-sm font-semibold text-[#2d3748]">
                      {noteTitles[note.listing_id] ?? "—"}
                    </h3>
                    <p className="mb-2 text-sm text-[#2d3748] whitespace-pre-wrap">
                      {note.body}
                    </p>
                    <p className="text-xs text-[#a0aec0]">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "searches" && (
          <div>
            {searches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mb-4 h-12 w-12 text-[#a0aec0]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                  />
                </svg>
                <p className="text-sm text-[#a0aec0]">
                  {t("no_saved_searches")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-[#2d3748]">
                        {search.name}
                      </h3>
                      <p className="text-xs text-[#a0aec0]">
                        {Object.keys(search.filters).length} filtre(s) &middot;{" "}
                        {new Date(search.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <form action={(formData) => { deleteSavedSearchAction(null, formData); }}>
                      <input type="hidden" name="id" value={search.id} />
                      <button
                        type="submit"
                        className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        {t("remove")}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
