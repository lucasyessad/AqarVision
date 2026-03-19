import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { Search, Phone, CalendarCheck } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { EditorialSplit } from "@/components/editorial/EditorialSplit";
import { StatsStrip } from "@/components/editorial/StatsStrip";
import { WilayaScroller } from "@/components/editorial/WilayaScroller";
import { FeaturedListingsTabs } from "@/components/marketing/FeaturedListingsTabs";
import { ObsidianHero } from "@/components/marketing/ObsidianHero";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getFeaturedListings } from "@/features/marketplace/actions/featured.action";
import type { ListingCard } from "@/features/listings/types/listing.types";
import type { WilayaScrollerItem } from "@/components/editorial/WilayaScroller";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("home"),
    description: t("homeDescription"),
  };
}

// ---------------------------------------------------------------------------
// Placeholder data — realistic Algerian listings
// ---------------------------------------------------------------------------

const PLACEHOLDER_LISTINGS_SALE: ListingCard[] = [
  {
    id: "1",
    listing_type: "sale",
    property_type: "apartment",
    price: 18_500_000,
    currency: "DZD",
    area_m2: 120,
    rooms: 4,
    title: "Appartement F4 lumineux avec vue mer",
    slug: "appartement-f4-vue-mer-alger",
    wilaya_name: "Alger",
    commune_name: "Hydra",
    cover_url: "/images/placeholder/listing-1.jpg",
    agency_name: "Immobilier Premium",
    agency_verified_level: 3,
    latitude: null, longitude: null, created_at: "2026-03-10T10:00:00Z",
  },
  {
    id: "2",
    listing_type: "sale",
    property_type: "villa",
    price: 45_000_000,
    currency: "DZD",
    area_m2: 350,
    rooms: 6,
    title: "Villa contemporaine avec jardin et piscine",
    slug: "villa-contemporaine-oran",
    wilaya_name: "Oran",
    commune_name: "Bir El Djir",
    cover_url: "/images/placeholder/listing-2.jpg",
    agency_name: "West Immobilier",
    agency_verified_level: 4,
    latitude: null, longitude: null, created_at: "2026-03-08T14:00:00Z",
  },
  {
    id: "3",
    listing_type: "sale",
    property_type: "apartment",
    price: 12_000_000,
    currency: "DZD",
    area_m2: 85,
    rooms: 3,
    title: "F3 rénové au centre-ville",
    slug: "f3-renove-constantine",
    wilaya_name: "Constantine",
    commune_name: "Constantine",
    cover_url: "/images/placeholder/listing-3.jpg",
    agency_name: "Cirta Immo",
    agency_verified_level: 2,
    latitude: null, longitude: null, created_at: "2026-03-05T09:00:00Z",
  },
  {
    id: "4",
    listing_type: "sale",
    property_type: "terrain",
    price: 8_500_000,
    currency: "DZD",
    area_m2: 500,
    rooms: null,
    title: "Terrain constructible en zone urbaine",
    slug: "terrain-constructible-tizi-ouzou",
    wilaya_name: "Tizi Ouzou",
    commune_name: "Tizi Ouzou",
    cover_url: "/images/placeholder/listing-4.jpg",
    agency_name: null,
    agency_verified_level: null,
    latitude: null, longitude: null, created_at: "2026-03-02T11:00:00Z",
  },
  {
    id: "5",
    listing_type: "sale",
    property_type: "apartment",
    price: 22_000_000,
    currency: "DZD",
    area_m2: 150,
    rooms: 5,
    title: "Duplex standing avec terrasse panoramique",
    slug: "duplex-standing-alger",
    wilaya_name: "Alger",
    commune_name: "Dély Ibrahim",
    cover_url: "/images/placeholder/listing-5.jpg",
    agency_name: "Immobilier Premium",
    agency_verified_level: 3,
    latitude: null, longitude: null, created_at: "2026-02-28T16:00:00Z",
  },
  {
    id: "6",
    listing_type: "sale",
    property_type: "commercial",
    price: 35_000_000,
    currency: "DZD",
    area_m2: 200,
    rooms: null,
    title: "Local commercial angle boulevard principal",
    slug: "local-commercial-annaba",
    wilaya_name: "Annaba",
    commune_name: "Annaba",
    cover_url: "/images/placeholder/listing-6.jpg",
    agency_name: "Est Immobilier",
    agency_verified_level: 2,
    latitude: null, longitude: null, created_at: "2026-02-25T08:00:00Z",
  },
  {
    id: "7",
    listing_type: "sale",
    property_type: "villa",
    price: 28_000_000,
    currency: "DZD",
    area_m2: 250,
    rooms: 5,
    title: "Villa kabyle traditionnelle rénovée",
    slug: "villa-kabyle-bejaia",
    wilaya_name: "Béjaïa",
    commune_name: "Béjaïa",
    cover_url: "/images/placeholder/listing-7.jpg",
    agency_name: null,
    agency_verified_level: null,
    latitude: null, longitude: null, created_at: "2026-02-20T13:00:00Z",
  },
  {
    id: "8",
    listing_type: "sale",
    property_type: "apartment",
    price: 15_500_000,
    currency: "DZD",
    area_m2: 100,
    rooms: 3,
    title: "F3 neuf résidence sécurisée",
    slug: "f3-neuf-setif",
    wilaya_name: "Sétif",
    commune_name: "Sétif",
    cover_url: "/images/placeholder/listing-8.jpg",
    agency_name: "Sétif Immobilier",
    agency_verified_level: 2,
    latitude: null, longitude: null, created_at: "2026-02-18T10:00:00Z",
  },
];

const PLACEHOLDER_LISTINGS_RENT: ListingCard[] = [
  {
    id: "r1",
    listing_type: "rent",
    property_type: "apartment",
    price: 80_000,
    currency: "DZD",
    area_m2: 90,
    rooms: 3,
    title: "F3 meublé centre-ville pour location",
    slug: "f3-meuble-alger-location",
    wilaya_name: "Alger",
    commune_name: "Alger Centre",
    cover_url: "/images/placeholder/listing-rent-1.jpg",
    agency_name: "Immobilier Premium",
    agency_verified_level: 3,
    latitude: null, longitude: null, created_at: "2026-03-12T10:00:00Z",
  },
  {
    id: "r2",
    listing_type: "rent",
    property_type: "office",
    price: 120_000,
    currency: "DZD",
    area_m2: 60,
    rooms: 2,
    title: "Bureau moderne coworking friendly",
    slug: "bureau-moderne-oran",
    wilaya_name: "Oran",
    commune_name: "Oran",
    cover_url: "/images/placeholder/listing-rent-2.jpg",
    agency_name: "West Immobilier",
    agency_verified_level: 4,
    latitude: null, longitude: null, created_at: "2026-03-11T14:00:00Z",
  },
  {
    id: "r3",
    listing_type: "rent",
    property_type: "apartment",
    price: 55_000,
    currency: "DZD",
    area_m2: 70,
    rooms: 2,
    title: "F2 rénové proche tramway",
    slug: "f2-renove-constantine",
    wilaya_name: "Constantine",
    commune_name: "Constantine",
    cover_url: "/images/placeholder/listing-rent-3.jpg",
    agency_name: "Cirta Immo",
    agency_verified_level: 2,
    latitude: null, longitude: null, created_at: "2026-03-09T09:00:00Z",
  },
  {
    id: "r4",
    listing_type: "rent",
    property_type: "villa",
    price: 200_000,
    currency: "DZD",
    area_m2: 300,
    rooms: 5,
    title: "Villa avec jardin pour famille",
    slug: "villa-jardin-blida",
    wilaya_name: "Blida",
    commune_name: "Blida",
    cover_url: "/images/placeholder/listing-rent-4.jpg",
    agency_name: null,
    agency_verified_level: null,
    latitude: null, longitude: null, created_at: "2026-03-07T11:00:00Z",
  },
  {
    id: "r5",
    listing_type: "rent",
    property_type: "apartment",
    price: 95_000,
    currency: "DZD",
    area_m2: 110,
    rooms: 4,
    title: "F4 lumineux vue sur baie",
    slug: "f4-vue-baie-bejaia",
    wilaya_name: "Béjaïa",
    commune_name: "Béjaïa",
    cover_url: "/images/placeholder/listing-rent-5.jpg",
    agency_name: "Béjaïa Immo",
    agency_verified_level: 2,
    latitude: null, longitude: null, created_at: "2026-03-04T16:00:00Z",
  },
  {
    id: "r6",
    listing_type: "rent",
    property_type: "commercial",
    price: 150_000,
    currency: "DZD",
    area_m2: 80,
    rooms: null,
    title: "Local commercial rue passante",
    slug: "local-commercial-annaba-location",
    wilaya_name: "Annaba",
    commune_name: "Annaba",
    cover_url: "/images/placeholder/listing-rent-6.jpg",
    agency_name: "Est Immobilier",
    agency_verified_level: 2,
    latitude: null, longitude: null, created_at: "2026-03-01T08:00:00Z",
  },
  {
    id: "r7",
    listing_type: "rent",
    property_type: "apartment",
    price: 65_000,
    currency: "DZD",
    area_m2: 75,
    rooms: 3,
    title: "F3 calme quartier résidentiel",
    slug: "f3-calme-setif",
    wilaya_name: "Sétif",
    commune_name: "Sétif",
    cover_url: "/images/placeholder/listing-rent-7.jpg",
    agency_name: "Sétif Immobilier",
    agency_verified_level: 2,
    latitude: null, longitude: null, created_at: "2026-02-26T13:00:00Z",
  },
  {
    id: "r8",
    listing_type: "rent",
    property_type: "apartment",
    price: 70_000,
    currency: "DZD",
    area_m2: 80,
    rooms: 3,
    title: "F3 moderne proche universités",
    slug: "f3-moderne-tlemcen",
    wilaya_name: "Tlemcen",
    commune_name: "Tlemcen",
    cover_url: "/images/placeholder/listing-rent-8.jpg",
    agency_name: null,
    agency_verified_level: null,
    latitude: null, longitude: null, created_at: "2026-02-22T10:00:00Z",
  },
];

const PLACEHOLDER_LISTINGS_VACATION: ListingCard[] = [
  {
    id: "v1",
    listing_type: "vacation",
    property_type: "apartment",
    price: 8_000,
    currency: "DZD",
    area_m2: 60,
    rooms: 2,
    title: "Studio vue mer pour vacances",
    slug: "studio-vue-mer-jijel",
    wilaya_name: "Jijel",
    commune_name: "Jijel",
    cover_url: "/images/placeholder/listing-vac-1.jpg",
    agency_name: null,
    agency_verified_level: null,
    latitude: null, longitude: null, created_at: "2026-03-14T10:00:00Z",
  },
  {
    id: "v2",
    listing_type: "vacation",
    property_type: "villa",
    price: 25_000,
    currency: "DZD",
    area_m2: 200,
    rooms: 4,
    title: "Villa pieds dans l'eau avec terrasse",
    slug: "villa-pieds-eau-tipaza",
    wilaya_name: "Tipaza",
    commune_name: "Tipaza",
    cover_url: "/images/placeholder/listing-vac-2.jpg",
    agency_name: "Côte Ouest Immo",
    agency_verified_level: 3,
    latitude: null, longitude: null, created_at: "2026-03-13T14:00:00Z",
  },
  {
    id: "v3",
    listing_type: "vacation",
    property_type: "apartment",
    price: 12_000,
    currency: "DZD",
    area_m2: 80,
    rooms: 3,
    title: "Appartement face plage corniche",
    slug: "appartement-plage-skikda",
    wilaya_name: "Skikda",
    commune_name: "Skikda",
    cover_url: "/images/placeholder/listing-vac-3.jpg",
    agency_name: null,
    agency_verified_level: null,
    latitude: null, longitude: null, created_at: "2026-03-11T09:00:00Z",
  },
  {
    id: "v4",
    listing_type: "vacation",
    property_type: "villa",
    price: 18_000,
    currency: "DZD",
    area_m2: 150,
    rooms: 3,
    title: "Chalet montagne forêt de cèdres",
    slug: "chalet-montagne-chrea",
    wilaya_name: "Blida",
    commune_name: "Chréa",
    cover_url: "/images/placeholder/listing-vac-4.jpg",
    agency_name: null,
    agency_verified_level: null,
    latitude: null, longitude: null, created_at: "2026-03-09T11:00:00Z",
  },
  {
    id: "v5",
    listing_type: "vacation",
    property_type: "apartment",
    price: 10_000,
    currency: "DZD",
    area_m2: 70,
    rooms: 2,
    title: "F2 bord de mer familial",
    slug: "f2-bord-mer-mostaganem",
    wilaya_name: "Mostaganem",
    commune_name: "Mostaganem",
    cover_url: "/images/placeholder/listing-vac-5.jpg",
    agency_name: "Mostaganem Vacances",
    agency_verified_level: 2,
    latitude: null, longitude: null, created_at: "2026-03-06T16:00:00Z",
  },
  {
    id: "v6",
    listing_type: "vacation",
    property_type: "villa",
    price: 30_000,
    currency: "DZD",
    area_m2: 250,
    rooms: 5,
    title: "Villa luxe avec piscine privée",
    slug: "villa-luxe-piscine-zeralda",
    wilaya_name: "Alger",
    commune_name: "Zéralda",
    cover_url: "/images/placeholder/listing-vac-6.jpg",
    agency_name: "Immobilier Premium",
    agency_verified_level: 3,
    latitude: null, longitude: null, created_at: "2026-03-03T08:00:00Z",
  },
  {
    id: "v7",
    listing_type: "vacation",
    property_type: "apartment",
    price: 7_000,
    currency: "DZD",
    area_m2: 55,
    rooms: 2,
    title: "Studio cosy plage des Andalouses",
    slug: "studio-cosy-andalouses",
    wilaya_name: "Oran",
    commune_name: "Aïn El Turck",
    cover_url: "/images/placeholder/listing-vac-7.jpg",
    agency_name: null,
    agency_verified_level: null,
    latitude: null, longitude: null, created_at: "2026-02-28T13:00:00Z",
  },
  {
    id: "v8",
    listing_type: "vacation",
    property_type: "apartment",
    price: 9_000,
    currency: "DZD",
    area_m2: 65,
    rooms: 2,
    title: "Appartement vacances vue cap Carbon",
    slug: "appartement-cap-carbon-bejaia",
    wilaya_name: "Béjaïa",
    commune_name: "Béjaïa",
    cover_url: "/images/placeholder/listing-vac-8.jpg",
    agency_name: "Béjaïa Immo",
    agency_verified_level: 2,
    latitude: null, longitude: null, created_at: "2026-02-24T10:00:00Z",
  },
];

const POPULAR_WILAYAS: WilayaScrollerItem[] = [
  { name: "Alger",       name_ar: "الجزائر",    imageUrl: "/images/placeholder/wilaya-alger.jpg",       count: 4_230, code: "16" },
  { name: "Oran",        name_ar: "وهران",       imageUrl: "/images/placeholder/wilaya-oran.jpg",        count: 2_815, code: "31" },
  { name: "Constantine", name_ar: "قسنطينة",     imageUrl: "/images/placeholder/wilaya-constantine.jpg", count: 1_920, code: "25" },
  { name: "Annaba",      name_ar: "عنابة",       imageUrl: "/images/placeholder/wilaya-annaba.jpg",      count: 1_340, code: "23" },
  { name: "Sétif",       name_ar: "سطيف",        imageUrl: "/images/placeholder/wilaya-setif.jpg",       count: 1_180, code: "19" },
  { name: "Béjaïa",      name_ar: "بجاية",       imageUrl: "/images/placeholder/wilaya-bejaia.jpg",      count: 1_050, code: "06" },
  { name: "Tizi Ouzou",  name_ar: "تيزي وزو",    imageUrl: "/images/placeholder/wilaya-tizi-ouzou.jpg",  count: 980,   code: "15" },
  { name: "Blida",       name_ar: "البليدة",     imageUrl: "/images/placeholder/wilaya-blida.jpg",       count: 870,   code: "09" },
];

const STEPS = [
  { icon: Search,       color: "bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400" },
  { icon: Phone,        color: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400" },
  { icon: CalendarCheck, color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400" },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  const t = await getTranslations("marketing");
  const locale = await getLocale();

  const [featuredSale, featuredRent, featuredVacation] = await Promise.all([
    getFeaturedListings("sale", 8),
    getFeaturedListings("rent", 8),
    getFeaturedListings("vacation", 8),
  ]);

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* 1. Hero — dark fullscreen ObsidianHero                          */}
      {/* ---------------------------------------------------------------- */}
      <ObsidianHero />

      {/* ---------------------------------------------------------------- */}
      {/* 2. Feature Grid — 3 product surfaces                            */}
      {/* ---------------------------------------------------------------- */}
      <FeatureGrid />

      {/* ---------------------------------------------------------------- */}
      {/* 3. Featured listings                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white dark:bg-stone-900 py-16 lg:py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center mb-6">
            <ScrollReveal direction="none">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 sm:text-3xl">
                {t("featuredTitle")}
              </h2>
            </ScrollReveal>
            <Link
              href="/search"
              className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors duration-fast"
            >
              {t("viewAll")} &rarr;
            </Link>
          </div>
          <ScrollReveal delay={100} direction="none">
            <FeaturedListingsTabs
              listings={{
                sale: featuredSale,
                rent: featuredRent,
                vacation: featuredVacation,
              }}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 4. Wilaya Scroller                                               */}
      {/* ---------------------------------------------------------------- */}
      <WilayaScroller
        wilayas={POPULAR_WILAYAS}
        title={t("wilayasTitle")}
        locale={locale}
      />

      {/* ---------------------------------------------------------------- */}
      {/* 5. Region Cards                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white dark:bg-stone-900 py-16 lg:py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          {/* h2 NOT wrapped in ScrollReveal to avoid translate-y layout bug */}
          <h2 className="mb-8 text-2xl font-bold text-stone-900 dark:text-stone-50 sm:text-3xl animate-fade-in">
            {t("regionsTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {([
              {
                region: "sahara",
                title: t("regionSahara"),
                subtitle: t("regionSaharaSubtitle"),
                image: "/images/placeholder/region-sahara.jpg",
                fallback: "from-amber-900 via-stone-900 to-stone-950",
                delay: 0,
              },
              {
                region: "littoral",
                title: t("regionLittoral"),
                subtitle: t("regionLittoralSubtitle"),
                image: "/images/placeholder/region-littoral.jpg",
                fallback: "from-blue-900 via-teal-900 to-stone-950",
                delay: 100,
              },
              {
                region: "montagne",
                title: t("regionMontagne"),
                subtitle: t("regionMontagneSubtitle"),
                image: "/images/placeholder/region-montagne.jpg",
                fallback: "from-green-900 via-stone-900 to-stone-950",
                delay: 200,
              },
            ] as const).map((item) => (
              <ScrollReveal key={item.region} delay={item.delay} direction="none">
                <Link
                  href={`/search?region=${item.region}`}
                  className={cn(
                    "group relative h-[220px] overflow-hidden rounded-xl flex",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400"
                  )}
                >
                  {/* Gradient fallback — shown if image is missing */}
                  <div className={cn("absolute inset-0 bg-gradient-to-br", item.fallback)} />
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-slow group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-stone-200">{item.subtitle}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 6. Stats Strip                                                   */}
      {/* ---------------------------------------------------------------- */}
      <StatsStrip
        stats={[
          { value: 12_450, label: t("statsStrip.listings"), suffix: "+" },
          { value: 340, label: t("statsStrip.verifiedAgencies") },
          { value: 69, label: t("statsStrip.wilayas") },
          { value: 28_000, label: t("statsStrip.users"), suffix: "+" },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* 7. Editorial Split                                               */}
      {/* ---------------------------------------------------------------- */}
      <EditorialSplit
        eyebrow={t("editorialEyebrow")}
        title={t("editorialTitle")}
        description={t("editorialDescription")}
        linkHref="/search"
        linkText={t("editorialLink")}
        imageSrc="/images/placeholder/editorial-algerie.jpg"
        imageAlt="Architecture algérienne contemporaine"
      />

      {/* ---------------------------------------------------------------- */}
      {/* 8. How it works                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white dark:bg-stone-900 py-16 lg:py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          {/* No ScrollReveal on h2 — use opacity-only fade to avoid layout shift */}
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-50 sm:text-3xl animate-fade-in">
            {t("howItWorks.title")}
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12">
            {([1, 2, 3] as const).map((step, idx) => {
              const stepConfig = STEPS[idx]!;
              const StepIcon = stepConfig.icon;
              return (
                <ScrollReveal key={step} delay={idx * 120}>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-2xl",
                        stepConfig.color
                      )}
                    >
                      <StepIcon size={28} aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-stone-900 dark:text-stone-50">
                      {t(`howItWorks.step${step}`)}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm text-stone-600 dark:text-stone-400">
                      {t(`howItWorks.step${step}Description`)}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 9. CTA Pro                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-stone-50 dark:bg-stone-950 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal direction="none">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 sm:text-3xl">
              {t("ctaPro").split("AqarPro")[0]}
              <span className="text-amber-500 dark:text-amber-400">AqarPro</span>
            </h2>
            <div className="mt-8">
              <Link
                href="/pro"
                className={cn(
                  "inline-flex items-center rounded-lg bg-teal-600 dark:bg-teal-600 px-8 py-3",
                  "text-sm font-medium text-white",
                  "transition-colors duration-fast",
                  "hover:bg-teal-700 dark:hover:bg-teal-500"
                )}
              >
                {t("ctaProButton")}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
