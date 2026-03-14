import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { MediaGallery } from "@/features/media/components/MediaGallery";
import { MediaUploader } from "@/features/media/components/MediaUploader";
import type { MediaDto } from "@/features/media/types/media.types";

const TABS = ["details", "translations", "media", "preview"] as const;
type Tab = (typeof TABS)[number];

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale, id } = await params;
  const { tab: activeTab } = await searchParams;
  const currentTab = (activeTab as Tab) || "details";
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

  // Fetch listing with translations
  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, agency_id, listing_type, property_type, status, current_price, wilaya_code, commune_id, surface_m2, rooms, bathrooms, details, version, created_at, updated_at, listing_translations(locale, title, description, slug)"
    )
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  // Check user has access to this listing's agency
  if (listing.agency_id !== membership.agency_id) {
    notFound();
  }

  // Fetch listing media
  const { data: listingMedia } = await supabase
    .from("listing_media")
    .select("id, storage_path, file_name, mime_type, size_bytes, width_px, height_px, position, is_cover, created_at")
    .eq("listing_id", id)
    .order("position", { ascending: true });

  // Map query results to MediaDto shape
  const mediaItems: MediaDto[] = (listingMedia ?? []).map((m) => ({
    id: m.id as string,
    listing_id: id,
    storage_path: m.storage_path as string,
    content_type: (m.mime_type ?? "") as string,
    file_size_bytes: (m.size_bytes ?? 0) as number,
    width: (m.width_px as number) ?? null,
    height: (m.height_px as number) ?? null,
    is_cover: m.is_cover as boolean,
    sort_order: (m.position ?? 0) as number,
    created_at: m.created_at as string,
    url: "", // URL will be resolved by the gallery or service layer
  }));

  const frTranslation = listing.listing_translations?.find(
    (tr: { locale: string }) => tr.locale === "fr"
  );
  const arTranslation = listing.listing_translations?.find(
    (tr: { locale: string }) => tr.locale === "ar"
  );

  // Publish checklist
  const checklist = [
    {
      label: t("translation_fr"),
      met: !!frTranslation?.title && !!frTranslation?.description,
    },
    {
      label: t("translation_ar"),
      met: !!arTranslation?.title && !!arTranslation?.description,
    },
    {
      label: t("cover_media"),
      met: !!listingMedia?.some((m: { is_cover: boolean }) => m.is_cover),
    },
    {
      label: t("price_set"),
      met: listing.current_price > 0,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/listings"
          className="text-sm text-gray-500 transition-colors hover:text-blue-night"
        >
          &larr; {t("title")}
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-night">
            {t("edit_title")}
          </h1>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              listing.status === "published"
                ? "bg-green-100 text-green-700"
                : listing.status === "draft"
                  ? "bg-gray-100 text-gray-600"
                  : listing.status === "paused"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
            }`}
          >
            {t(`status_${listing.status}` as Parameters<typeof t>[0])}
          </span>
        </div>
        {listing.status === "draft" && (
          <button className="rounded-lg bg-blue-night px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-night/90">
            {t("submit_review")}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => {
          const isActive = currentTab === tab;
          return (
            <Link
              key={tab}
              href={`/dashboard/listings/${id}?tab=${tab}`}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-blue-night text-blue-night"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {t(tab as Parameters<typeof t>[0])}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content area */}
        <div className="lg:col-span-2">
          {currentTab === "details" && (
            <div className="space-y-6">
              {/* Listing form */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-blue-night">
                  {t("listing_type")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("listing_type")}
                    </label>
                    <select
                      defaultValue={listing.listing_type}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="sale">{t("sale")}</option>
                      <option value="rent">{t("rent")}</option>
                      <option value="vacation">{t("vacation")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("property_type")}
                    </label>
                    <select
                      defaultValue={listing.property_type}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="apartment">{t("apartment")}</option>
                      <option value="villa">{t("villa")}</option>
                      <option value="terrain">{t("terrain")}</option>
                      <option value="commercial">{t("commercial")}</option>
                      <option value="office">{t("office")}</option>
                      <option value="building">{t("building")}</option>
                      <option value="farm">{t("farm")}</option>
                      <option value="warehouse">{t("warehouse")}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-blue-night">
                  {t("step_location")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("price_dzd")}
                    </label>
                    <input
                      type="number"
                      defaultValue={listing.current_price}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("surface")}
                    </label>
                    <input
                      type="number"
                      defaultValue={listing.surface_m2 ?? ""}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("rooms")}
                    </label>
                    <input
                      type="number"
                      defaultValue={listing.rooms ?? ""}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("bathrooms")}
                    </label>
                    <input
                      type="number"
                      defaultValue={listing.bathrooms ?? ""}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="rounded-lg bg-gold px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gold/90">
                  {t("save")}
                </button>
              </div>
            </div>
          )}

          {currentTab === "translations" && (
            <div className="space-y-6">
              {/* French translation */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-blue-night">
                  {t("translation_fr")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("title_field")}
                    </label>
                    <input
                      type="text"
                      defaultValue={frTranslation?.title ?? ""}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("description_field")}
                    </label>
                    <textarea
                      rows={4}
                      defaultValue={frTranslation?.description ?? ""}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("slug_field")}
                    </label>
                    <input
                      type="text"
                      defaultValue={frTranslation?.slug ?? ""}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Arabic translation */}
              <div className="rounded-xl bg-white p-6 shadow-sm" dir="rtl">
                <h2 className="mb-4 text-lg font-semibold text-blue-night">
                  {t("translation_ar")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("title_field")}
                    </label>
                    <input
                      type="text"
                      defaultValue={arTranslation?.title ?? ""}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("description_field")}
                    </label>
                    <textarea
                      rows={4}
                      defaultValue={arTranslation?.description ?? ""}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("slug_field")}
                    </label>
                    <input
                      type="text"
                      defaultValue={arTranslation?.slug ?? ""}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="rounded-lg bg-gold px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gold/90">
                  {t("save")}
                </button>
              </div>
            </div>
          )}

          {currentTab === "media" && (
            <div className="space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-blue-night">
                  {t("media" as Parameters<typeof t>[0])}
                </h2>
                <MediaUploader listingId={id} />
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <MediaGallery
                  listingId={id}
                  media={mediaItems}
                />
              </div>
            </div>
          )}

          {currentTab === "preview" && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-blue-night">
                {t("preview")}
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-900">
                    {t("listing_type")}:
                  </span>{" "}
                  {t(listing.listing_type as Parameters<typeof t>[0])}
                </p>
                <p>
                  <span className="font-medium text-gray-900">
                    {t("property_type")}:
                  </span>{" "}
                  {t(listing.property_type as Parameters<typeof t>[0])}
                </p>
                <p>
                  <span className="font-medium text-gray-900">
                    {t("price")}:
                  </span>{" "}
                  {new Intl.NumberFormat(locale, { style: "decimal" }).format(
                    listing.current_price
                  )}{" "}
                  DZD
                </p>
                {listing.surface_m2 && (
                  <p>
                    <span className="font-medium text-gray-900">
                      {t("surface")}:
                    </span>{" "}
                    {listing.surface_m2}
                  </p>
                )}
                {frTranslation && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-medium text-gray-900">
                      {t("translation_fr")}
                    </h3>
                    <p className="mt-1 font-semibold">{frTranslation.title}</p>
                    <p className="mt-1 text-gray-500">
                      {frTranslation.description}
                    </p>
                  </div>
                )}
                {arTranslation && (
                  <div className="mt-4 border-t pt-4" dir="rtl">
                    <h3 className="font-medium text-gray-900">
                      {t("translation_ar")}
                    </h3>
                    <p className="mt-1 font-semibold">{arTranslation.title}</p>
                    <p className="mt-1 text-gray-500">
                      {arTranslation.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Publish checklist */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-blue-night">
              {t("publish_checklist")}
            </h2>
            <ul className="space-y-3">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      item.met
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {item.met ? "\u2713" : "\u2717"}
                  </span>
                  <span className={item.met ? "text-gray-700" : "text-gray-400"}>
                    {item.label}
                  </span>
                  <span
                    className={`ms-auto text-xs ${
                      item.met ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {item.met ? t("requirement_met") : t("requirement_missing")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
