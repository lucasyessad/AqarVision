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
  status: ListingStatus;
  current_price: number;
  wilaya_code: number;
  surface_m2: number | null;
  rooms: number | null;
  created_at: string;
  listing_translations: { locale: string; title: string; slug: string }[];
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  published:      { bg: "#F0FDF4", color: "#16A34A" },
  draft:          { bg: "#F6F9FC", color: "var(--charcoal-500)" },
  paused:         { bg: "#FFFBEB", color: "#D97706" },
  pending_review: { bg: "#EFF6FF", color: "#2563EB" },
  rejected:       { bg: "#FFF5F5", color: "#DC2626" },
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
      "id, listing_type, property_type, status, current_price, wilaya_code, surface_m2, rooms, created_at, listing_translations(locale, title, slug)"
    )
    .eq("agency_id", membership.agency_id)
    .order("created_at", { ascending: false });

  if (activeFilter !== "all") {
    query = query.eq("status", activeFilter);
  }

  const { data: listings } = await query;
  const typedListings = (listings ?? []) as unknown as ListingRow[];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal-950)" }}>
            {t("title")}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--charcoal-500)" }}>
            {typedListings.length} annonce{typedListings.length !== 1 ? "s" : ""}
            {activeFilter !== "all" ? ` · filtre : ${activeFilter}` : ""}
          </p>
        </div>
        <Link
          href="/AqarPro/dashboard/listings/new"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: "var(--coral)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("new_listing")}
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-0 border-b" style={{ borderColor: "#E3E8EF" }}>
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          const label =
            filter === "all"
              ? t("all")
              : t(`status_${filter}` as Parameters<typeof t>[0]);
          return (
            <Link
              key={filter}
              href={filter === "all" ? "/dashboard/listings" : `/dashboard/listings?status=${filter}`}
              className="border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderBottomColor: isActive ? "var(--coral)" : "transparent",
                color: isActive ? "var(--coral)" : "var(--charcoal-500)",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      {typedListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-16" style={{ borderColor: "#E3E8EF" }}>
          <svg className="mb-3 h-10 w-10" style={{ color: "var(--charcoal-300)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <p className="text-sm" style={{ color: "var(--charcoal-500)" }}>{t("no_listings")}</p>
          <Link
            href="/AqarPro/dashboard/listings/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--coral)" }}
          >
            {t("new_listing")}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#E3E8EF", background: "#F6F9FC" }}>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-500)" }}>
                  Annonce
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-500)" }}>
                  Type
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-500)" }}>
                  Prix
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-500)" }}>
                  Statut
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-500)" }}>
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
                const style = STATUS_STYLE[listing.status] ?? STATUS_STYLE.draft;

                return (
                  <tr
                    key={listing.id}
                    className="border-b transition-colors hover:bg-[#F6F9FC]"
                    style={{ borderColor: i === typedListings.length - 1 ? "transparent" : "#E3E8EF" }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium" style={{ color: "var(--charcoal-950)" }}>{title}</p>
                      {listing.surface_m2 && (
                        <p className="text-xs" style={{ color: "var(--charcoal-400)" }}>
                          {listing.surface_m2} m²
                          {listing.rooms ? ` · ${listing.rooms} pièces` : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4" style={{ color: "var(--charcoal-600)" }}>
                      {t(listing.listing_type as Parameters<typeof t>[0])} · {t(listing.property_type as Parameters<typeof t>[0])}
                    </td>
                    <td className="px-6 py-4 tabular-nums font-medium" style={{ color: "var(--charcoal-950)" }}>
                      {new Intl.NumberFormat(locale).format(listing.current_price)} DZD
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: style.bg, color: style.color }}
                      >
                        {t(`status_${listing.status}` as Parameters<typeof t>[0])}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs" style={{ color: "var(--charcoal-400)" }}>
                      {new Date(listing.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <Link
                        href={`/dashboard/listings/${listing.id}`}
                        className="text-xs font-medium transition-colors"
                        style={{ color: "var(--coral)" }}
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
