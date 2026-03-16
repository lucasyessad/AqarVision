import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { MediaGallery } from "@/features/media/components/MediaGallery";
import { MediaUploader } from "@/features/media/components/MediaUploader";
import type { MediaDto } from "@/features/media/types/media.types";
import { submitForReviewAction } from "@/features/listings/actions/publish.action";

const TABS = ["details", "translations", "media", "preview"] as const;
type Tab = (typeof TABS)[number];

const STATUS_CLS: Record<string, string> = {
  published:      "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
  draft:          "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  paused:         "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400",
  pending_review: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  rejected:       "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

const inputCls = "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50";
const labelCls = "mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300";

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

  if (!user) redirect(`/${locale}/AqarPro/auth/login`);

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!membership) redirect(`/${locale}/agency/new`);

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, agency_id, listing_type, property_type, current_status, current_price, wilaya_code, commune_id, surface_m2, rooms, bathrooms, details, version, created_at, updated_at, listing_translations(locale, title, description, slug)"
    )
    .eq("id", id)
    .single();

  if (!listing) notFound();
  if (listing.agency_id !== membership.agency_id) notFound();

  // Draft listings should be edited via the wizard
  if (listing.current_status === "draft") {
    redirect(`/${locale}/AqarPro/dashboard/listings/${id}/edit`);
  }

  const { data: listingMedia } = await supabase
    .from("listing_media")
    .select("id, storage_path, file_name, mime_type, size_bytes, width_px, height_px, position, is_cover, created_at")
    .eq("listing_id", id)
    .order("position", { ascending: true });

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
    url: "",
  }));

  const frTranslation = listing.listing_translations?.find(
    (tr: { locale: string }) => tr.locale === "fr"
  );
  const arTranslation = listing.listing_translations?.find(
    (tr: { locale: string }) => tr.locale === "ar"
  );

  const checklist = [
    { label: t("translation_fr"), met: !!frTranslation?.title && !!frTranslation?.description },
    { label: t("translation_ar"), met: !!arTranslation?.title && !!arTranslation?.description },
    { label: t("cover_media"), met: !!listingMedia?.some((m: { is_cover: boolean }) => m.is_cover) },
    { label: t("price_set"), met: listing.current_price > 0 },
  ];

  const statusCls = STATUS_CLS[listing.current_status as string] ?? STATUS_CLS.draft;
  const allMet = checklist.every((c) => c.met);

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div>
        <Link
          href="/AqarPro/dashboard/listings"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t("title")}
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
              {t("edit_title")}
            </h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusCls}`}>
              {t(`status_${listing.current_status}` as Parameters<typeof t>[0])}
            </span>
          </div>
          {listing.current_status === "draft" && (
            <form
              action={async () => {
                "use server";
                const formData = new FormData();
                formData.set("listing_id", id);
                await submitForReviewAction(null, formData);
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
              >
                {t("submit_review")}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tab) => {
          const isActive = currentTab === tab;
          return (
            <Link
              key={tab}
              href={`/AqarPro/dashboard/listings/${id}?tab=${tab}`}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              {t(tab as Parameters<typeof t>[0])}
            </Link>
          );
        })}
      </div>

      {/* Content grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main area */}
        <div className="space-y-4 lg:col-span-2">
          {currentTab === "details" && (
            <>
              {/* Type card */}
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {t("listing_type")}
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>{t("listing_type")}</label>
                    <select defaultValue={listing.listing_type} className={inputCls}>
                      <option value="sale">{t("sale")}</option>
                      <option value="rent">{t("rent")}</option>
                      <option value="vacation">{t("vacation")}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>{t("property_type")}</label>
                    <select defaultValue={listing.property_type} className={inputCls}>
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

              {/* Details card */}
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {t("step_location")}
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>{t("price_dzd")}</label>
                    <input type="number" defaultValue={listing.current_price} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t("surface")}</label>
                    <input type="number" defaultValue={listing.surface_m2 ?? ""} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t("rooms")}</label>
                    <input type="number" defaultValue={listing.rooms ?? ""} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t("bathrooms")}</label>
                    <input type="number" defaultValue={listing.bathrooms ?? ""} className={inputCls} />
                  </div>
                </div>
                <div className="flex justify-end bg-zinc-50 px-6 py-4 dark:bg-zinc-900/50">
                  <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600">
                    {t("save")}
                  </button>
                </div>
              </div>
            </>
          )}

          {currentTab === "translations" && (
            <>
              {/* FR */}
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {t("translation_fr")}
                  </h2>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <label className={labelCls}>{t("title_field")}</label>
                    <input type="text" defaultValue={frTranslation?.title ?? ""} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t("description_field")}</label>
                    <textarea rows={4} defaultValue={frTranslation?.description ?? ""} className={`${inputCls} h-auto py-2`} />
                  </div>
                  <div>
                    <label className={labelCls}>{t("slug_field")}</label>
                    <input type="text" defaultValue={frTranslation?.slug ?? ""} className={inputCls} />
                  </div>
                </div>
              </div>

              {/* AR */}
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" dir="rtl">
                <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {t("translation_ar")}
                  </h2>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <label className={labelCls}>{t("title_field")}</label>
                    <input type="text" defaultValue={arTranslation?.title ?? ""} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t("description_field")}</label>
                    <textarea rows={4} defaultValue={arTranslation?.description ?? ""} className={`${inputCls} h-auto py-2`} />
                  </div>
                  <div>
                    <label className={labelCls}>{t("slug_field")}</label>
                    <input type="text" defaultValue={arTranslation?.slug ?? ""} className={inputCls} dir="ltr" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600">
                  {t("save")}
                </button>
              </div>
            </>
          )}

          {currentTab === "media" && (
            <>
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    Ajouter des photos
                  </h2>
                </div>
                <div className="p-6">
                  <MediaUploader listingId={id} />
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    Galerie ({mediaItems.length} photo{mediaItems.length !== 1 ? "s" : ""})
                  </h2>
                </div>
                <div className="p-6">
                  <MediaGallery listingId={id} media={mediaItems} />
                </div>
              </div>
            </>
          )}

          {currentTab === "preview" && (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {t("preview")}
                </h2>
              </div>
              <div className="space-y-3 p-6 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  <span className="font-medium text-zinc-950 dark:text-zinc-50">{t("listing_type")}:</span>{" "}
                  {t(listing.listing_type as Parameters<typeof t>[0])}
                </p>
                <p>
                  <span className="font-medium text-zinc-950 dark:text-zinc-50">{t("property_type")}:</span>{" "}
                  {t(listing.property_type as Parameters<typeof t>[0])}
                </p>
                <p>
                  <span className="font-medium text-zinc-950 dark:text-zinc-50">{t("price")}:</span>{" "}
                  {new Intl.NumberFormat(locale).format(listing.current_price)} DZD
                </p>
                {listing.surface_m2 && (
                  <p>
                    <span className="font-medium text-zinc-950 dark:text-zinc-50">{t("surface")}:</span>{" "}
                    {listing.surface_m2} m²
                  </p>
                )}
                {frTranslation && (
                  <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("translation_fr")}</p>
                    <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">{frTranslation.title}</p>
                    <p className="mt-1 text-zinc-500 dark:text-zinc-400">{frTranslation.description}</p>
                  </div>
                )}
                {arTranslation && (
                  <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800" dir="rtl">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("translation_ar")}</p>
                    <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">{arTranslation.title}</p>
                    <p className="mt-1 text-zinc-500 dark:text-zinc-400">{arTranslation.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Publish checklist */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                {t("publish_checklist")}
              </h2>
            </div>
            <ul className="divide-y divide-zinc-200 p-2 dark:divide-zinc-800">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3 px-3 py-2.5">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      item.met
                        ? "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
                        : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
                    }`}
                  >
                    {item.met ? "✓" : "✗"}
                  </span>
                  <span className={`flex-1 text-xs ${item.met ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500"}`}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            {allMet && (
              <div className="border-t border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ Annonce prête à publier
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
