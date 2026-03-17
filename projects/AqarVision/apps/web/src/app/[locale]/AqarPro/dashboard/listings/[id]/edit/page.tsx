import { redirect, notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getWilayas } from "@/features/marketplace/services/search.service";
import { CreateListingWizard } from "@/features/listings/components";
import type { WizardData } from "@/features/listings/components/CreateListingWizard"; // Direct import for type

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
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

  // Fetch the listing
  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, agency_id, listing_type, property_type, current_status, current_price, wilaya_code, commune_id, surface_m2, rooms, bathrooms, details, version"
    )
    .eq("id", id)
    .single();

  if (!listing) notFound();
  if (listing.agency_id !== membership.agency_id) notFound();

  // Fetch FR translation
  const { data: frTranslation } = await supabase
    .from("listing_translations")
    .select("title, description")
    .eq("listing_id", id)
    .eq("locale", "fr")
    .single();

  // Fetch wilayas
  const wilayas = getWilayas(supabase, locale);

  // Build initialData from listing + translation
  const details = (listing.details as Record<string, unknown>) ?? {};

  const initialData: Partial<WizardData> = {
    listing_type: listing.listing_type as string,
    property_type: listing.property_type as string,
    wilaya_code: listing.wilaya_code as string,
    commune_id: listing.commune_id ? String(listing.commune_id) : "",
    current_price: listing.current_price ? String(listing.current_price) : "",
    negotiable: !!details.negotiable,
    surface_m2: listing.surface_m2 ? String(listing.surface_m2) : "",
    land_area_m2: details.land_area_m2 ? String(details.land_area_m2) : "",
    rooms: (listing.rooms as number) ?? 0,
    bedrooms: (details.bedrooms as number) ?? 0,
    bathrooms: (listing.bathrooms as number) ?? 0,
    toilets: (details.toilets as number) ?? 0,
    floor: details.floor != null ? String(details.floor) : "",
    total_floors: details.total_floors != null ? String(details.total_floors) : "",
    year_built: details.year_built != null ? String(details.year_built) : "",
    condition: (details.condition as string) ?? "",
    orientation: (details.orientation as string) ?? "",
    // Amenities
    has_elevator: !!details.has_elevator,
    has_parking: !!details.has_parking,
    has_balcony: !!details.has_balcony,
    has_terrace: !!details.has_terrace,
    has_pool: !!details.has_pool,
    has_garden: !!details.has_garden,
    furnished: !!details.furnished,
    has_ac: !!details.has_ac,
    has_central_heating: !!details.has_central_heating,
    has_water_heater: !!details.has_water_heater,
    has_double_glazing: !!details.has_double_glazing,
    has_digicode: !!details.has_digicode,
    has_interphone: !!details.has_interphone,
    has_alarm: !!details.has_alarm,
    has_guard: !!details.has_guard,
    has_cameras: !!details.has_cameras,
    has_fiber: !!details.has_fiber,
    has_satellite: !!details.has_satellite,
    has_road_access: !!details.has_road_access,
    has_electricity: !!details.has_electricity,
    has_water_connection: !!details.has_water_connection,
    has_gas_connection: !!details.has_gas_connection,
    has_shop_window: !!details.has_shop_window,
    has_loading_dock: !!details.has_loading_dock,
    has_meeting_room: !!details.has_meeting_room,
    // Translation
    title_fr: frTranslation?.title ?? "",
    description_fr: frTranslation?.description ?? "",
  };

  return (
    <CreateListingWizard
      agencyId={membership.agency_id as string}
      wilayas={wilayas}
      mode="edit"
      listingId={id}
      expectedVersion={(listing.version as number) ?? 1}
      initialData={initialData}
    />
  );
}
