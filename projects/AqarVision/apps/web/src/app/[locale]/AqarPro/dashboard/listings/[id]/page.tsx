import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Eye, Pause, Play, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { getAgencyForUser } from "@/lib/auth/get-agency-for-user";
import { getPriceHistory } from "@/features/analytics/services/analytics.service";
import { formatPrice, formatArea, formatRelativeDate } from "@/lib/format";
import { PhotoGallery } from "@/components/ui/PhotoGallery";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/lib/i18n/navigation";
import { ListingActionsClient } from "./listing-actions-client";
import type { LightboxImage } from "@/components/ui/Lightbox";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations("listing");
  return { title: t("edit") };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id, locale } = await params;
  const t = await getTranslations("listing");
  const tCommon = await getTranslations("common.buttons");

  const user = await getCachedUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const supabase = await createClient();
  const agencyCtx = await getAgencyForUser(user.id);
  if (!agencyCtx) redirect(`/${locale}/AqarPro/dashboard`);

  // Fetch listing with all related data
  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      translations:listing_translations(*),
      media:listing_media(*),
      documents:listing_documents(*),
      commune:communes(name_fr),
      wilaya:wilayas(name_fr)
    `
    )
    .eq("id", id)
    .eq("agency_id", agencyCtx.agencyId)
    .single();

  if (error || !listing) {
    notFound();
  }

  const translations = listing.translations as Array<{
    locale: string;
    title: string;
    description: string;
    slug: string;
  }>;
  const media = listing.media as Array<{
    id: string;
    storage_path: string;
    is_cover: boolean;
    position: number;
    width: number;
    height: number;
  }>;
  const details = listing.details as Record<string, unknown>;
  const commune = listing.commune as { name_fr: string } | null;
  const wilaya = listing.wilaya as { name_fr: string } | null;
  const fr = translations?.find((t) => t.locale === "fr");

  // Photos for gallery
  const sortedMedia = [...media].sort((a, b) => {
    if (a.is_cover) return -1;
    if (b.is_cover) return 1;
    return a.position - b.position;
  });

  const images: LightboxImage[] = sortedMedia.map((m) => ({
    src: m.storage_path,
    alt: fr?.title ?? "",
    width: m.width,
    height: m.height,
  }));

  // Fetch stats
  const { count: viewsCount } = await supabase
    .from("listing_views")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", id);

  const { count: leadsCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", id);

  const { count: favCount } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", id);

  // Price history
  let priceHistory: import("@/features/analytics/types/analytics.types").PriceHistoryPoint[] = [];
  try {
    priceHistory = await getPriceHistory(supabase, id);
  } catch {
    priceHistory = [];
  }

  const statusColors: Record<string, string> = {
    draft: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
    pending_review: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
    published: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
    paused: "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400",
    rejected: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
    sold: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
    rented: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
    expired: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500",
    archived: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500",
  };

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/AqarPro/dashboard/listings"
          className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors duration-fast"
        >
          <ArrowLeft className="h-4 w-4" />
          {tCommon("back")}
        </Link>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[listing.status as string] ?? ""}`}
          >
            {t(`status.${listing.status}`)}
          </span>
          <ListingActionsClient
            listingId={id}
            agencyId={agencyCtx.agencyId}
            currentStatus={listing.status as string}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          {/* Photo gallery */}
          {images.length > 0 ? (
            <PhotoGallery images={images} />
          ) : (
            <div className="aspect-video rounded-lg bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500">
              {t("noPhotos")}
            </div>
          )}

          {/* Listing info */}
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {fr?.title}
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {wilaya?.name_fr}{commune ? `, ${commune.name_fr}` : ""}
              {listing.address ? ` — ${listing.address}` : ""}
            </p>
            <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-100">
              {formatPrice(listing.price as number, listing.currency as string, locale as "fr" | "ar" | "en" | "es")}
            </p>

            {/* Details grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-md bg-stone-50 dark:bg-stone-800 p-3">
                <p className="text-xs text-stone-500 dark:text-stone-400">{t("fields.area")}</p>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  {formatArea((details as { area_m2?: number }).area_m2 ?? 0, locale as "fr" | "ar" | "en" | "es")}
                </p>
              </div>
              {(details as { rooms?: number }).rooms != null && (
                <div className="rounded-md bg-stone-50 dark:bg-stone-800 p-3">
                  <p className="text-xs text-stone-500 dark:text-stone-400">{t("fields.rooms")}</p>
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    {(details as { rooms: number }).rooms}
                  </p>
                </div>
              )}
              <div className="rounded-md bg-stone-50 dark:bg-stone-800 p-3">
                <p className="text-xs text-stone-500 dark:text-stone-400">{t("fields.type")}</p>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  {t(`type.${listing.listing_type}`)}
                </p>
              </div>
              <div className="rounded-md bg-stone-50 dark:bg-stone-800 p-3">
                <p className="text-xs text-stone-500 dark:text-stone-400">{t("fields.propertyType")}</p>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  {t(`propertyType.${listing.property_type}`)}
                </p>
              </div>
            </div>
          </div>

          {/* Description (all locales) */}
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
              {t("fields.description")}
            </h2>
            <div className="space-y-4">
              {translations.map((tr) => (
                <div key={tr.locale}>
                  <p className="text-xs font-medium text-stone-400 dark:text-stone-500 uppercase mb-1">
                    {tr.locale}
                  </p>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
                    {tr.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* View public listing link */}
          {fr?.slug && listing.status === "published" && (
            <Link
              href={`/annonce/${fr.slug}`}
              className="inline-flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors duration-fast"
            >
              <ExternalLink className="h-4 w-4" />
              {t("viewPublic")}
            </Link>
          )}
        </div>

        {/* Sidebar: Stats + Price history */}
        <div className="space-y-4">
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
              {t("statistics")}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">{t("stats.views")}</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {viewsCount ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">{t("stats.leads")}</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {leadsCount ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">{t("stats.favorites")}</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {favCount ?? 0}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
              {t("metadata")}
            </h3>
            <div className="space-y-2 text-xs text-stone-500 dark:text-stone-400">
              <div className="flex justify-between">
                <span>{t("fields.created")}</span>
                <span>{formatRelativeDate(new Date(listing.created_at as string), locale as "fr" | "ar" | "en" | "es")}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("fields.updated")}</span>
                <span>{formatRelativeDate(new Date(listing.updated_at as string), locale as "fr" | "ar" | "en" | "es")}</span>
              </div>
              <div className="flex justify-between">
                <span>Version</span>
                <span>{listing.version}</span>
              </div>
            </div>
          </div>

          {/* Price history */}
          {priceHistory.length > 0 && (
            <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5">
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
                {t("priceHistory")}
              </h3>
              <div className="space-y-2">
                {priceHistory.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-stone-500 dark:text-stone-400">
                      {new Date(point.date).toLocaleDateString(locale)}
                    </span>
                    <span className="font-medium text-stone-900 dark:text-stone-100">
                      {formatPrice(point.price, listing.currency as string, locale as "fr" | "ar" | "en" | "es")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
