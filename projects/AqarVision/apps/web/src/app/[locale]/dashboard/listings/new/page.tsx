import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import {
  LISTING_TYPES,
  PROPERTY_TYPES,
} from "@/features/listings/schemas/listing.schema";

export default async function NewListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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

      <h1 className="mb-8 text-2xl font-bold text-blue-night">
        {t("create_title")}
      </h1>

      {/* Step 1: Type selection */}
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Listing type */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-blue-night">
            {t("listing_type")}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {LISTING_TYPES.map((type) => (
              <button
                key={type}
                className="rounded-lg border-2 border-gray-200 p-4 text-center text-sm font-medium text-gray-700 transition-colors hover:border-gold hover:text-gold"
              >
                {t(type as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>

        {/* Property type */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-blue-night">
            {t("property_type")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                className="rounded-lg border-2 border-gray-200 p-4 text-center text-sm font-medium text-gray-700 transition-colors hover:border-gold hover:text-gold"
              >
                {t(type as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>

        {/* Location & Price placeholder */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-blue-night">
            {t("step_location")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("wilaya")}
              </label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">{t("wilaya")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("commune")}
              </label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">{t("commune")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("price_dzd")}
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("surface")}
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Details placeholder */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-blue-night">
            {t("step_details")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("rooms")}
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("bathrooms")}
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/listings"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {t("previous")}
          </Link>
          <button className="rounded-lg bg-gold px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gold/90">
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
