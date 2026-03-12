import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAgencyBySlug, getAgencyProperties, getAgencyPropertiesCount } from '@/lib/queries/agency';
import { getTranslations } from '@/lib/i18n';
import { getThemeManifest } from '@/lib/themes';
import { PAGINATION } from '@/config';
import { formatPrice, getLocationLabel } from '@/lib/utils/format';
import { MapPin, Maximize2, BedDouble, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Agency, Property } from '@/types/database';
import type { PropertiesVariant } from '@/lib/themes/registry';
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
  variant,
  t,
}: {
  property: Property;
  agency: Agency;
  variant: PropertiesVariant;
  t: ReturnType<typeof getTranslations>;
}) {
  const isDark = agency.theme_mode === 'dark';
  const accentColor = agency.accent_color || agency.secondary_color || agency.primary_color;
  const isPremium = variant === 'properties-premium';

  if (isPremium) {
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

  // Standard card — design system
  return (
    <Link
      href={`/agence/${agency.slug}/biens/${property.id}`}
      className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all"
    >
      <div className="relative aspect-[4/3] bg-neutral-100">
        {property.images[0] ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-body-sm text-neutral-300">
            {t('properties.noPhoto')}
          </div>
        )}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 text-caption font-semibold uppercase tracking-wider text-white rounded-md"
          style={{ backgroundColor: accentColor || '#234E6F' }}
        >
          {property.transaction_type === 'sale' ? t('properties.sale') : t('properties.rent')}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-caption font-medium uppercase text-neutral-400">
            {property.type}
          </span>
        </div>
        <h3 className="mt-1 text-body-sm font-semibold text-neutral-900 line-clamp-1">
          {property.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-caption text-neutral-400">
          <MapPin className="h-3 w-3" />
          {getLocationLabel(property)}
        </p>
        <div className="mt-3 flex items-center gap-3 text-caption text-neutral-500">
          {property.surface && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3 w-3" /> {property.surface} m²
            </span>
          )}
          {property.rooms && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3 w-3" /> {property.rooms} {t('properties.rooms')}
            </span>
          )}
        </div>
        <p className="mt-3 text-body-sm font-bold" style={{ color: accentColor || '#234E6F' }}>
          {formatPrice(property.price, property.currency)}
          {property.transaction_type === 'rent' && (
            <span className="text-neutral-400 font-normal"> /mois</span>
          )}
        </p>
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
  const manifest = getThemeManifest(agency.theme);

  const currentPage = Math.max(1, parseInt(pageStr || '1', 10));
  const offset = (currentPage - 1) * PAGINATION.PROPERTIES_PER_PAGE;

  const [properties, totalCount] = await Promise.all([
    getAgencyProperties(agency.id, PAGINATION.PROPERTIES_PER_PAGE, offset),
    getAgencyPropertiesCount(agency.id),
  ]);

  const totalPages = Math.ceil(totalCount / PAGINATION.PROPERTIES_PER_PAGE);
  const propertiesSection = manifest.sections.find((s) => s.id === 'properties');
  const propertiesVariant = (propertiesSection?.variant as PropertiesVariant) || 'properties-grid';
  const isPremium = propertiesVariant === 'properties-premium';
  const isDark = manifest.style.themeMode === 'dark';
  const accentColor = agency.accent_color || agency.secondary_color || agency.primary_color;

  const plural = totalCount > 1 ? 's' : '';
  const availableText = t('properties.available', { count: totalCount, plural });

  // Premium/Luxury themes → centered heading with accent line
  if (isPremium) {
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
                  variant={propertiesVariant}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <p className={`text-center opacity-50 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('properties.none')}
            </p>
          )}

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

  // Standard themes → professional listing
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-heading-lg text-neutral-900">{t('properties.our')}</h1>
          {totalCount > 0 && (
            <p className="mt-1 text-body-sm text-neutral-500">
              {availableText}
            </p>
          )}
        </div>
      </div>

      {properties.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              agency={agency}
              variant={propertiesVariant}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-white py-16 text-center">
          <div className="mx-auto w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Home className="h-6 w-6 text-neutral-400" />
          </div>
          <p className="text-body-md text-neutral-500">{t('properties.none')}</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/agence/${slug}/biens?page=${currentPage - 1}`}
              className="inline-flex items-center gap-1 h-9 px-4 text-body-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> {t('pagination.prev')}
            </Link>
          )}
          <span className="px-3 text-body-sm text-neutral-500">
            {t('pagination.page', { current: currentPage, total: totalPages })}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/agence/${slug}/biens?page=${currentPage + 1}`}
              className="inline-flex items-center gap-1 h-9 px-4 text-body-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              {t('pagination.next')} <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
