import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Maximize2, BedDouble, ArrowRight, Star } from 'lucide-react';
import { FadeInUp, StaggerContainer } from '@/components/ui/animated-sections';
import { formatPrice, getLocationLabel } from '@/lib/utils/format';
import { getTranslations } from '@/lib/i18n';
import type { Agency, Property } from '@/types/database';

interface PropertiesFeaturedProps {
  agency: Agency;
  properties: Property[];
}

/** Featured properties first, then grid for the rest */
export function PropertiesFeatured({ agency, properties }: PropertiesFeaturedProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  if (properties.length === 0) return null;

  const featured = properties.filter((p) => p.is_featured).slice(0, 2);
  const rest = properties.filter((p) => !featured.includes(p));

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <FadeInUp>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-heading-lg text-foreground">{t('properties.featured')}</h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              {t('properties.latestFrom', { name: agency.name })}
            </p>
          </div>
          <Link
            href={`/agence/${agency.slug}/biens`}
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-medium hover:underline"
            style={{ color: accentColor }}
          >
            {t('properties.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </FadeInUp>

      {/* Featured row */}
      {featured.length > 0 && (
        <StaggerContainer className="grid gap-5 sm:grid-cols-2 mb-5">
          {featured.map((property) => (
            <FadeInUp key={property.id}>
              <Link
                href={`/agence/${agency.slug}/biens/${property.id}`}
                className="group relative bg-white overflow-hidden rounded-xl border border-neutral-200 hover:shadow-lg transition-all block"
              >
                <div className="relative aspect-[16/9] bg-neutral-100">
                  {property.images[0] ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-body-sm text-neutral-300">
                      {t('properties.noPhoto')}
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className="px-2.5 py-1 text-caption font-semibold uppercase tracking-wider text-white rounded-md"
                      style={{ backgroundColor: accentColor }}
                    >
                      {property.transaction_type === 'sale' ? t('properties.sale') : t('properties.rent')}
                    </span>
                    <span className="px-2.5 py-1 text-caption font-semibold text-white bg-amber-500 rounded-md flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" /> Mis en avant
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-body-sm font-semibold text-foreground line-clamp-1">{property.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-caption text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {getLocationLabel(property)}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-caption text-muted-foreground">
                      {property.surface && <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" /> {property.surface} m²</span>}
                      {property.rooms && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {property.rooms} {t('properties.rooms')}</span>}
                    </div>
                    <p className="text-body-sm font-bold" style={{ color: accentColor }}>
                      {formatPrice(property.price, property.currency)}
                    </p>
                  </div>
                </div>
              </Link>
            </FadeInUp>
          ))}
        </StaggerContainer>
      )}

      {/* Rest of properties grid */}
      {rest.length > 0 && (
        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((property) => (
            <FadeInUp key={property.id}>
              <Link
                href={`/agence/${agency.slug}/biens/${property.id}`}
                className="group bg-white overflow-hidden rounded-xl border border-neutral-200 hover:shadow-lg transition-all block"
              >
                <div className="relative aspect-[4/3] bg-neutral-100">
                  {property.images[0] ? (
                    <Image src={property.images[0]} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  ) : (
                    <div className="flex items-center justify-center h-full text-body-sm text-neutral-300">{t('properties.noPhoto')}</div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-caption font-semibold uppercase tracking-wider text-white rounded-md" style={{ backgroundColor: accentColor }}>
                    {property.transaction_type === 'sale' ? t('properties.sale') : t('properties.rent')}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-body-sm font-semibold text-foreground line-clamp-1">{property.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-caption text-muted-foreground"><MapPin className="h-3 w-3" /> {getLocationLabel(property)}</p>
                  <p className="mt-3 text-body-sm font-bold" style={{ color: accentColor }}>
                    {formatPrice(property.price, property.currency)}
                    {property.transaction_type === 'rent' && <span className="text-muted-foreground font-normal"> /mois</span>}
                  </p>
                </div>
              </Link>
            </FadeInUp>
          ))}
        </StaggerContainer>
      )}
    </section>
  );
}
