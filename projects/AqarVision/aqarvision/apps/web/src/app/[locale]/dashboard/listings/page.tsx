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
  listing_translations: {
    locale: string;
    title: string;
    slug: string;
  }[];
}

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

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Get user's active membership
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!membership) {
    redirect(`/${locale}/agency/new`);
  }

  // Build query for listings with translations
  let query = supabase
    .from("listings")
    .select(
      "id, listing_type, property_type, status, current_price, wilaya_code, surface_m2, rooms, created_at, listing_translations(locale, title, slug)"
    )
    .eq("agency_id", membership.agency_id)
    .order("created_at", { ascending: false });

  // Apply status filter
  const activeFilter = (statusFilter as StatusFilter) || "all";
  if (activeFilter !== "all") {
    query = query.eq("status", activeFilter);
  }

  const { data: listings } = await query;
  const typedListings = (listings ?? []) as unknown as ListingRow[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-night">{t("title")}</h1>
        <Link
          href="/dashboard/listings/new"
          className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold/90"
        >
          {t("new_listing")}
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          const label =
            filter === "all"
              ? t("all")
              : t(`status_${filter}` as Parameters<typeof t>[0]);
          return (
            <Link
              key={filter}
              href={
                filter === "all"
                  ? "/dashboard/listings"
                  : `/dashboard/listings?status=${filter}`
              }
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-blue-night text-blue-night"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Listings grid */}
      {typedListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm">
          <p className="text-gray-500">{t("no_listings")}</p>
          <Link
            href="/dashboard/listings/new"
            className="mt-4 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold/90"
          >
            {t("new_listing")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {typedListings.map((listing) => {
            const translation = listing.listing_translations.find(
              (tr) => tr.locale === locale
            ) ?? listing.listing_translations[0];
            const title = translation?.title ?? listing.property_type;

            return (
              <Link
                key={listing.id}
                href={`/dashboard/listings/${listing.id}`}
                className="group rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-semibold text-blue-night group-hover:text-gold">
                    {title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      listing.status === "published"
                        ? "bg-green-100 text-green-700"
                        : listing.status === "draft"
                          ? "bg-gray-100 text-gray-600"
                          : listing.status === "paused"
                            ? "bg-yellow-100 text-yellow-700"
                            : listing.status === "pending_review"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t(`status_${listing.status}` as Parameters<typeof t>[0])}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>
                    {t(listing.listing_type as Parameters<typeof t>[0])} &middot;{" "}
                    {t(listing.property_type as Parameters<typeof t>[0])}
                  </p>
                  <p className="font-medium text-blue-night">
                    {new Intl.NumberFormat(locale, {
                      style: "decimal",
                    }).format(listing.current_price)}{" "}
                    DZD
                  </p>
                  {listing.surface_m2 && (
                    <p>
                      {listing.surface_m2} m²
                      {listing.rooms
                        ? ` &middot; ${listing.rooms} ${t("rooms")}`
                        : ""}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
