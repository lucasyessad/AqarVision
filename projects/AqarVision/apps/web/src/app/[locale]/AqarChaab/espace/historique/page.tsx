import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { clearViewHistory } from "@/features/marketplace/actions/view-history.action";
import { Link } from "@/lib/i18n/navigation";

interface HistoriquePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HistoriquePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "espace" });
  return { title: t("nav.historique") };
}

interface HistoryEntry {
  id: string;
  listing_id: string;
  viewed_at: string;
  title: string;
  slug: string;
  cover_url: string | null;
  current_price: number | null;
  currency: string;
  surface_m2: number | null;
  rooms: number | null;
  wilaya_code: string | null;
}

function groupByDate(entries: HistoryEntry[]): Record<string, HistoryEntry[]> {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const groups: Record<string, HistoryEntry[]> = {};

  for (const entry of entries) {
    const d = new Date(entry.viewed_at);
    const dStr = d.toDateString();
    let label: string;

    if (dStr === today) {
      label = "Aujourd'hui";
    } else if (dStr === yesterdayStr) {
      label = "Hier";
    } else {
      const diffDays = Math.floor(
        (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays < 7) {
        label = "Cette semaine";
      } else {
        label = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      }
    }

    if (!groups[label]) groups[label] = [];
    groups[label]!.push(entry);
  }

  return groups;
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function HistoriquePage({ params }: HistoriquePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: historyRows } = await supabase
    .from("view_history")
    .select("id, listing_id, viewed_at")
    .eq("user_id", user!.id)
    .gte("viewed_at", thirtyDaysAgo.toISOString())
    .order("viewed_at", { ascending: false });

  const rows = (historyRows ?? []) as Array<{
    id: string;
    listing_id: string;
    viewed_at: string;
  }>;

  // Dedupe listing IDs
  const listingIds = [...new Set(rows.map((r) => r.listing_id))];
  const enrichedMap: Record<
    string,
    {
      title: string;
      slug: string;
      cover_url: string | null;
      current_price: number | null;
      currency: string;
      surface_m2: number | null;
      rooms: number | null;
      wilaya_code: string | null;
    }
  > = {};

  if (listingIds.length > 0) {
    const [{ data: listingsData }, { data: translationsData }, { data: mediaData }] =
      await Promise.all([
        supabase
          .from("listings")
          .select("id, current_price, currency, surface_m2, rooms, wilaya_code")
          .in("id", listingIds),
        supabase
          .from("listing_translations")
          .select("listing_id, title, slug, locale")
          .in("listing_id", listingIds),
        supabase
          .from("listing_media")
          .select("listing_id, storage_path, is_cover")
          .in("listing_id", listingIds)
          .eq("is_cover", true),
      ]);

    for (const id of listingIds) {
      const listing = (listingsData ?? []).find(
        (l) => (l as Record<string, unknown>).id === id
      ) as Record<string, unknown> | undefined;

      const translation =
        (translationsData ?? []).find(
          (t) =>
            (t as Record<string, unknown>).listing_id === id &&
            (t as Record<string, unknown>).locale === locale
        ) ??
        (translationsData ?? []).find(
          (t) =>
            (t as Record<string, unknown>).listing_id === id &&
            (t as Record<string, unknown>).locale === "fr"
        );

      const media = (mediaData ?? []).find(
        (m) => (m as Record<string, unknown>).listing_id === id
      ) as Record<string, unknown> | undefined;

      enrichedMap[id] = {
        title: (translation as Record<string, unknown> | undefined)?.title as string ?? "—",
        slug: (translation as Record<string, unknown> | undefined)?.slug as string ?? "",
        cover_url: (media?.storage_path as string) ?? null,
        current_price: (listing?.current_price as number) ?? null,
        currency: (listing?.currency as string) ?? "DZD",
        surface_m2: (listing?.surface_m2 as number) ?? null,
        rooms: (listing?.rooms as number) ?? null,
        wilaya_code: (listing?.wilaya_code as string) ?? null,
      };
    }
  }

  const entries: HistoryEntry[] = rows.map((r) => ({
    id: r.id,
    listing_id: r.listing_id,
    viewed_at: r.viewed_at,
    ...(enrichedMap[r.listing_id] ?? {
      title: "—",
      slug: "",
      cover_url: null,
      current_price: null,
      currency: "DZD",
      surface_m2: null,
      rooms: null,
      wilaya_code: null,
    }),
  }));

  const grouped = groupByDate(entries);
  const groupLabels = Object.keys(grouped);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Historique</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Annonces consultées ces 30 derniers jours
          </p>
        </div>

        {entries.length > 0 && (
          <form
            action={async () => {
              "use server";
              await clearViewHistory();
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              Effacer l&apos;historique
            </button>
          </form>
        )}
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mb-4 h-12 w-12 text-zinc-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Aucun historique</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Les annonces consultées apparaîtront ici
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-amber-500 px-4 py-2 text-sm font-medium text-white dark:text-zinc-950 transition-colors hover:bg-zinc-900/90 dark:hover:bg-amber-400"
          >
            Rechercher des annonces
          </Link>
        </div>
      )}

      {/* Grouped list */}
      <div className="space-y-8">
        {groupLabels.map((label) => (
          <section key={label}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {label}
            </h2>
            <div className="space-y-2">
              {(grouped[label] ?? []).map((entry) => (
                <Link
                  key={entry.id}
                  href={`/annonce/${entry.slug}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    {entry.cover_url ? (
                      <img
                        src={entry.cover_url}
                        alt={entry.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-6 w-6 text-gray-300"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      {entry.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400">
                      {entry.current_price !== null && (
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {formatPrice(entry.current_price, entry.currency)}
                        </span>
                      )}
                      {entry.surface_m2 !== null && (
                        <span>{entry.surface_m2} m²</span>
                      )}
                      {entry.rooms !== null && (
                        <span>{entry.rooms} pièces</span>
                      )}
                      {entry.wilaya_code !== null && (
                        <span>W. {entry.wilaya_code}</span>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <time className="shrink-0 text-xs text-zinc-400">
                    {new Date(entry.viewed_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
