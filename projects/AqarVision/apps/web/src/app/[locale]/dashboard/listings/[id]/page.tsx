import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { MediaGallery } from "@/features/media/components/MediaGallery";
import { MediaUploader } from "@/features/media/components/MediaUploader";
import type { MediaDto } from "@/features/media/types/media.types";

const TABS = ["details", "translations", "media", "preview"] as const;
type Tab = (typeof TABS)[number];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  published:      { bg: "#F0FDF4", color: "#16A34A" },
  draft:          { bg: "#F6F9FC", color: "var(--charcoal-500)" },
  paused:         { bg: "#FFFBEB", color: "#D97706" },
  pending_review: { bg: "#EFF6FF", color: "#2563EB" },
  rejected:       { bg: "#FFF5F5", color: "#DC2626" },
};

const inputCls = "w-full rounded-md border px-3 py-2 text-sm focus:outline-none";
const inputStyle = { borderColor: "#E3E8EF", color: "var(--charcoal-950)" };
const labelCls = "mb-1.5 block text-xs font-medium";
const labelStyle = { color: "var(--charcoal-700)" };

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

  if (!user) redirect(`/${locale}/auth/login`);

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
      "id, agency_id, listing_type, property_type, status, current_price, wilaya_code, commune_id, surface_m2, rooms, bathrooms, details, version, created_at, updated_at, listing_translations(locale, title, description, slug)"
    )
    .eq("id", id)
    .single();

  if (!listing) notFound();
  if (listing.agency_id !== membership.agency_id) notFound();

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

  const statusStyle = STATUS_STYLE[listing.status as string] ?? STATUS_STYLE.draft;
  const allMet = checklist.every((c) => c.met);

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div>
        <Link
          href="/dashboard/listings"
          className="inline-flex items-center gap-1 text-sm transition-colors"
          style={{ color: "var(--charcoal-500)" }}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t("title")}
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal-950)" }}>
              {t("edit_title")}
            </h1>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
              {t(`status_${listing.status}` as Parameters<typeof t>[0])}
            </span>
          </div>
          {listing.status === "draft" && (
            <button
              className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ background: "var(--coral)" }}
            >
              {t("submit_review")}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b" style={{ borderColor: "#E3E8EF" }}>
        {TABS.map((tab) => {
          const isActive = currentTab === tab;
          return (
            <Link
              key={tab}
              href={`/dashboard/listings/${id}?tab=${tab}`}
              className="border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderBottomColor: isActive ? "var(--coral)" : "transparent",
                color: isActive ? "var(--coral)" : "var(--charcoal-500)",
              }}
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
              <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
                <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                    {t("listing_type")}
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("listing_type")}</label>
                    <select defaultValue={listing.listing_type} className={inputCls} style={inputStyle}>
                      <option value="sale">{t("sale")}</option>
                      <option value="rent">{t("rent")}</option>
                      <option value="vacation">{t("vacation")}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("property_type")}</label>
                    <select defaultValue={listing.property_type} className={inputCls} style={inputStyle}>
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
              <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
                <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                    {t("step_location")}
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("price_dzd")}</label>
                    <input type="number" defaultValue={listing.current_price} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("surface")}</label>
                    <input type="number" defaultValue={listing.surface_m2 ?? ""} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("rooms")}</label>
                    <input type="number" defaultValue={listing.rooms ?? ""} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("bathrooms")}</label>
                    <input type="number" defaultValue={listing.bathrooms ?? ""} className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div className="flex justify-end px-6 py-4" style={{ background: "#F6F9FC" }}>
                  <button
                    className="rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
                    style={{ background: "var(--coral)" }}
                  >
                    {t("save")}
                  </button>
                </div>
              </div>
            </>
          )}

          {currentTab === "translations" && (
            <>
              {/* FR */}
              <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
                <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                    {t("translation_fr")}
                  </h2>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("title_field")}</label>
                    <input type="text" defaultValue={frTranslation?.title ?? ""} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("description_field")}</label>
                    <textarea rows={4} defaultValue={frTranslation?.description ?? ""} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("slug_field")}</label>
                    <input type="text" defaultValue={frTranslation?.slug ?? ""} className={inputCls} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* AR */}
              <div className="overflow-hidden rounded-lg border bg-white" dir="rtl" style={{ borderColor: "#E3E8EF" }}>
                <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                    {t("translation_ar")}
                  </h2>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("title_field")}</label>
                    <input type="text" defaultValue={arTranslation?.title ?? ""} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("description_field")}</label>
                    <textarea rows={4} defaultValue={arTranslation?.description ?? ""} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>{t("slug_field")}</label>
                    <input type="text" defaultValue={arTranslation?.slug ?? ""} className={inputCls} style={inputStyle} dir="ltr" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
                  style={{ background: "var(--coral)" }}
                >
                  {t("save")}
                </button>
              </div>
            </>
          )}

          {currentTab === "media" && (
            <>
              <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
                <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                    Ajouter des photos
                  </h2>
                </div>
                <div className="p-6">
                  <MediaUploader listingId={id} />
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
                <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
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
            <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
              <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
                <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                  {t("preview")}
                </h2>
              </div>
              <div className="space-y-3 p-6 text-sm" style={{ color: "var(--charcoal-600)" }}>
                <p>
                  <span className="font-medium" style={{ color: "var(--charcoal-950)" }}>{t("listing_type")}:</span>{" "}
                  {t(listing.listing_type as Parameters<typeof t>[0])}
                </p>
                <p>
                  <span className="font-medium" style={{ color: "var(--charcoal-950)" }}>{t("property_type")}:</span>{" "}
                  {t(listing.property_type as Parameters<typeof t>[0])}
                </p>
                <p>
                  <span className="font-medium" style={{ color: "var(--charcoal-950)" }}>{t("price")}:</span>{" "}
                  {new Intl.NumberFormat(locale).format(listing.current_price)} DZD
                </p>
                {listing.surface_m2 && (
                  <p>
                    <span className="font-medium" style={{ color: "var(--charcoal-950)" }}>{t("surface")}:</span>{" "}
                    {listing.surface_m2} m²
                  </p>
                )}
                {frTranslation && (
                  <div className="border-t pt-4" style={{ borderColor: "#E3E8EF" }}>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-400)" }}>{t("translation_fr")}</p>
                    <p className="mt-1 font-semibold" style={{ color: "var(--charcoal-950)" }}>{frTranslation.title}</p>
                    <p className="mt-1" style={{ color: "var(--charcoal-500)" }}>{frTranslation.description}</p>
                  </div>
                )}
                {arTranslation && (
                  <div className="border-t pt-4" dir="rtl" style={{ borderColor: "#E3E8EF" }}>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-400)" }}>{t("translation_ar")}</p>
                    <p className="mt-1 font-semibold" style={{ color: "var(--charcoal-950)" }}>{arTranslation.title}</p>
                    <p className="mt-1" style={{ color: "var(--charcoal-500)" }}>{arTranslation.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Publish checklist */}
        <div className="lg:col-span-1">
          <div
            className="sticky top-6 overflow-hidden rounded-lg border bg-white"
            style={{ borderColor: "#E3E8EF" }}
          >
            <div className="border-b px-5 py-4" style={{ borderColor: "#E3E8EF" }}>
              <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
                {t("publish_checklist")}
              </h2>
            </div>
            <ul className="divide-y p-2" style={{ borderColor: "#E3E8EF" }}>
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3 px-3 py-2.5">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={item.met ? { background: "#F0FDF4", color: "#16A34A" } : { background: "#FFF5F5", color: "#DC2626" }}
                  >
                    {item.met ? "✓" : "✗"}
                  </span>
                  <span className="flex-1 text-xs" style={{ color: item.met ? "var(--charcoal-700)" : "var(--charcoal-400)" }}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            {allMet && (
              <div className="border-t px-5 py-4" style={{ borderColor: "#E3E8EF", background: "#F6F9FC" }}>
                <p className="text-xs" style={{ color: "#16A34A" }}>
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
