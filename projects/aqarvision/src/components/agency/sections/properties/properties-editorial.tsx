import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Maximize2, BedDouble, ArrowRight } from 'lucide-react';
import { FadeInUp } from '@/components/ui/animated-sections';
import { formatPrice, getLocationLabel } from '@/lib/utils/format';
import { getTranslations } from '@/lib/i18n';
import type { Agency, Property } from '@/types/database';

interface PropertiesEditorialProps {
  agency: Agency;
  properties: Property[];
}

/** Editorial alternating layout: image left/right */
export function PropertiesEditorial({ agency, properties }: PropertiesEditorialProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  if (properties.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <FadeInUp>
        <div className="text-center mb-12">
          <span className="text-caption font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
            {t('properties.portfolio')}
          </span>
          <h2 className="mt-3 text-heading-lg text-foreground font-vitrine">{t('properties.title')}</h2>
          <div className="mx-auto mt-4 h-0.5 w-12" style={{ backgroundColor: accentColor }} />
        </div>
      </FadeInUp>

      <div className="space-y-12">
        {properties.map((property, index) => {
          const isReversed = index % 2 === 1;
          return (
            <FadeInUp key={property.id}>
              <Link
                href={`/agence/${agency.slug}/biens/${property.id}`}
                className={`group grid gap-6 lg:grid-cols-2 items-center ${isReversed ? 'lg:direction-rtl' : ''}`}
              >
                <div className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 ${isReversed ? 'lg:order-2' : ''}`}>
                  {property.images[0] ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-body-sm text-neutral-300">
                      {t('properties.noPhoto')}
                    </div>
                  )}
                  <span
                    className="absolute top-4 left-4 px-3 py-1 text-caption font-semibold uppercase tracking-wider text-white rounded-md"
                    style={{ backgroundColor: accentColor }}
                  >
                    {property.transaction_type === 'sale' ? t('properties.sale') : t('properties.rent')}
                  </span>
                </div>
                <div className={`py-4 ${isReversed ? 'lg:order-1 lg:text-right' : ''}`}>
                  <h3 className="text-heading-md text-foreground group-hover:underline decoration-1 underline-offset-4">
                    {property.title}
                  </h3>
                  <p className={`mt-2 flex items-center gap-1.5 text-body-sm text-muted-foreground ${isReversed ? 'lg:justify-end' : ''}`}>
                    <MapPin className="h-4 w-4" /> {getLocationLabel(property)}
                  </p>
                  <div className={`mt-4 flex items-center gap-4 text-body-sm text-muted-foreground ${isReversed ? 'lg:justify-end' : ''}`}>
                    {property.surface && <span className="flex items-center gap-1"><Maximize2 className="h-4 w-4" /> {property.surface} m²</span>}
                    {property.rooms && <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {property.rooms} {t('properties.rooms')}</span>}
                  </div>
                  <p className="mt-4 text-heading-md font-bold" style={{ color: accentColor }}>
                    {formatPrice(property.price, property.currency)}
                    {property.transaction_type === 'rent' && <span className="text-muted-foreground font-normal text-body-sm"> /mois</span>}
                  </p>
                </div>
              </Link>
            </FadeInUp>
          );
        })}
      </div>

      <FadeInUp>
        <div className="mt-12 text-center">
          <Link
            href={`/agence/${agency.slug}/biens`}
            className="inline-flex items-center gap-2 text-body-sm font-medium hover:underline"
            style={{ color: accentColor }}
          >
            {t('properties.viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </FadeInUp>
    </section>
  );
}
