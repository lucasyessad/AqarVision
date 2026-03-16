import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";

type ListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "paused"
  | "rejected"
  | "sold"
  | "rented"
  | "expired"
  | "archived";

const STATUS_FILTERS = ["all", "draft", "published", "paused"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

interface ListingRow {
  id: string;
  listing_type: string;
  property_type: string;
  current_status: ListingStatus;
  current_price: number;
  wilaya_code: string;
  surface_m2: number | null;
  rooms: number | null;
  created_at: string;
  listing_translations: { locale: string; title: string; slug: string }[];
}

const STATUS_CLS: Record<string, string> = {
  published:      "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
  draft:          "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  paused:         "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400",
  pending_review: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  rejected:       "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status: statusFilter } = await searchParams;
  const t = await getTranslations("listings");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/AqarPro/auth/login`);

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!membership) redirect(`/${locale}/agency/new`);

  const activeFilter = (statusFilter as StatusFilter) || "all";

  let query = supabase
    .from("listings")
    .select(
      "id, listing_type, property_type, current_status, current_price, wilaya_code, surface_m2, rooms, created_at, listing_translations(locale, title, slug)"
    )
    .eq("agency_id", membership.agency_id)
    .order("created_at", { ascending: false });

  if (activeFilter !== "all") {
    query = query.eq("current_status", activeFilter);
  }

  const { data: listings } = await query;
  const typedListings = (listings ?? []) as unknown as ListingRow[];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {typedListings.length} annonce{typedListings.length !== 1 ? "s" : ""}
            {activeFilter !== "all" ? ` · filtre : ${activeFilter}` : ""}
          </p>
        </div>
        <Link
          href="/AqarPro/dashboard/listings/new"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("new_listing")}
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-800">
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          const label =
            filter === "all"
              ? t("all")
              : t(`status_${filter}` as Parameters<typeof t>[0]);
          return (
            <Link
              key={filter}
              href={filter === "all" ? "/AqarPro/dashboard/listings" : `/AqarPro/dashboard/listings?status=${filter}`}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      {typedListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-900">
          <svg className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("no_listings")}</p>
          <Link
            href="/AqarPro/dashboard/listings/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            {t("new_listing")}
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 overflow-hidden dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th className="px-6 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Annonce
                </th>
                <th className="px-6 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Type
                </th>
                <th className="px-6 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Prix
                </th>
                <th className="px-6 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Statut
                </th>
                <th className="px-6 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Date
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {typedListings.map((listing, i) => {
                const translation =
                  listing.listing_translations.find((tr) => tr.locale === locale) ??
                  listing.listing_translations[0];
                const title = translation?.title ?? listing.property_type;
                const statusCls = STATUS_CLS[listing.current_status] ?? STATUS_CLS.draft;

                return (
                  <tr
                    key={listing.id}
                    className={`h-12 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                      i !== typedListings.length - 1 ? "border-b border-zinc-200 dark:border-zinc-800" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-950 dark:text-zinc-50">{title}</p>
                      {listing.surface_m2 && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          {listing.surface_m2} m²
                          {listing.rooms ? ` · ${listing.rooms} pièces` : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {t(listing.listing_type as Parameters<typeof t>[0])} · {t(listing.property_type as Parameters<typeof t>[0])}
                    </td>
                    <td className="px-6 py-4 tabular-nums font-medium text-zinc-950 dark:text-zinc-50">
                      {new Intl.NumberFormat(locale).format(listing.current_price)} DZD
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusCls}`}>
                        {t(`status_${listing.current_status}` as Parameters<typeof t>[0])}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(listing.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <Link
                        href={`/AqarPro/dashboard/listings/${listing.id}/edit`}
                        className="text-xs font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                      >
                        Modifier →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
