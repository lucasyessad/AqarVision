import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAgencyBySlug, getAgencyProperties, getAgencyPropertiesCount } from '@/lib/queries/agency';
import { getTranslations } from '@/lib/i18n';
import { PAGINATION, PLANS } from '@/config';
import { formatPrice, getLocationLabel } from '@/lib/utils/format';
import type { Agency, Property } from '@/types/database';
import type { Metadata } from 'next';

interface BiensPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; type?: string; transaction?: string }>;
}

export async function generateMetadata({ params }: BiensPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) return {};
  const t = getTranslations(agency.locale ?? 'fr');
  return { title: t('properties.our') };
}

function PropertyCard({
  property,
  agency,
  luxury,
  t,
}: {
  property: Property;
  agency: Agency;
  luxury: boolean;
  t: ReturnType<typeof getTranslations>;
}) {
  const isDark = agency.theme_mode === 'dark';
  const accentColor = agency.secondary_color || agency.primary_color;

  if (luxury) {
    return (
      <Link
        href={`/agence/${agency.slug}/biens/${property.id}`}
        className="luxury-property-card group block"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {property.images[0] ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <span className="text-sm opacity-40">{t('properties.noPhoto')}</span>
            </div>
          )}
          <span
            className="absolute left-4 top-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
            style={{ backgroundColor: accentColor }}
          >
            {property.transaction_type === 'sale' ? t('properties.sale') : t('properties.rent')}
          </span>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12">
            <span className="text-xl font-bold text-white">
              {formatPrice(property.price, property.currency)}
            </span>
          </div>
        </div>
        <div className={`p-5 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {property.title}
          </h3>
          <div className="mt-2 flex items-center gap-4 text-sm opacity-60">
            {(property.city || property.wilaya) && <span>{getLocationLabel(property)}</span>}
            {property.surface && <span>{property.surface} m²</span>}
            {property.rooms && <span>{property.rooms} {t('properties.rooms')}</span>}
          </div>
        </div>
      </Link>
    );
  }

  // Basic card
  return (
    <Link
      href={`/agence/${agency.slug}/biens/${property.id}`}
      className="block overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
    >
      {property.images[0] && (
        <div className="relative aspect-[4/3]">
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase text-gray-500">
            {property.transaction_type === 'sale' ? t('properties.sale') : t('properties.rent')}
          </span>
          <span className="text-xs text-gray-400">{property.type}</span>
        </div>
        <h3 className="mt-1 font-semibold">{property.title}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {getLocationLabel(property)} {property.surface && `· ${property.surface} m²`}
          {property.rooms && ` · ${property.rooms} ${t('properties.rooms')}`}
        </p>
        <p className="mt-2 font-bold text-blue-600">{formatPrice(property.price, property.currency)}</p>
      </div>
    </Link>
  );
}

export default async function BiensPage({ params, searchParams }: BiensPageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;

  const agency = await getAgencyBySlug(slug);
  if (!agency) notFound();

  const t = getTranslations(agency.locale ?? 'fr');
  const currentPage = Math.max(1, parseInt(pageStr || '1', 10));
  const offset = (currentPage - 1) * PAGINATION.PROPERTIES_PER_PAGE;

  const [properties, totalCount] = await Promise.all([
    getAgencyProperties(agency.id, PAGINATION.PROPERTIES_PER_PAGE, offset),
    getAgencyPropertiesCount(agency.id),
  ]);

  const totalPages = Math.ceil(totalCount / PAGINATION.PROPERTIES_PER_PAGE);
  const isEnterprise = agency.active_plan === PLANS.ENTERPRISE;
  const isDark = agency.theme_mode === 'dark';
  const accentColor = agency.secondary_color || agency.primary_color;

  const plural = totalCount > 1 ? 's' : '';
  const availableText = t('properties.available', { count: totalCount, plural });

  // Enterprise → Luxury listing
  if (isEnterprise) {
    return (
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              {t('properties.portfolio')}
            </span>
            <h1
              className={`mt-4 font-display-classic text-display-lg ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('properties.all')}
            </h1>
            <div
              className="mx-auto mt-6 h-0.5 w-20"
              style={{ backgroundColor: accentColor }}
            />
            {totalCount > 0 && (
              <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {availableText}
              </p>
            )}
          </div>

          {properties.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  agency={agency}
                  luxury
                  t={t}
                />
              ))}
            </div>
          ) : (
            <p className={`text-center opacity-50 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('properties.none')}
            </p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-3">
              {currentPage > 1 && (
                <Link
                  href={`/agence/${slug}/biens?page=${currentPage - 1}`}
                  className="border px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-70"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {t('pagination.prev')}
                </Link>
              )}
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('pagination.page', { current: currentPage, total: totalPages })}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/agence/${slug}/biens?page=${currentPage + 1}`}
                  className="border px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-70"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {t('pagination.next')}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Starter / Pro → Listing basique
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('properties.our')}</h1>
          {totalCount > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {availableText}
            </p>
          )}
        </div>
      </div>

      {properties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              agency={agency}
              luxury={false}
              t={t}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">{t('properties.none')}</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          {currentPage > 1 && (
            <Link
              href={`/agence/${slug}/biens?page=${currentPage - 1}`}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              {t('pagination.prev')}
            </Link>
          )}
          <span className="text-sm text-gray-500">
            {t('pagination.page', { current: currentPage, total: totalPages })}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/agence/${slug}/biens?page=${currentPage + 1}`}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              {t('pagination.next')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
