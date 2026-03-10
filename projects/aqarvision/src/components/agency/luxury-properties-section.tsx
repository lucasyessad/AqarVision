'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { formatPrice, getLocationLabel } from '@/lib/utils/format';
import { getTranslations } from '@/lib/i18n';
import type { Agency, Property } from '@/types/database';

interface LuxuryPropertiesSectionProps {
  agency: Agency;
  properties: Property[];
}

export function LuxuryPropertiesSection({ agency, properties }: LuxuryPropertiesSectionProps) {
  const containerRef = useScrollReveal();
  const t = getTranslations(agency.locale ?? 'fr');
  const isDark = agency.theme_mode === 'dark';
  const accentColor = agency.secondary_color || agency.primary_color;

  return (
    <section
      id="properties"
      ref={containerRef}
      className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* En-tête */}
        <div className="luxury-scroll-reveal mb-16 text-center">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            {t('properties.portfolio')}
          </span>
          <h2
            className={`mt-4 font-display-classic text-display-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('properties.title')}
          </h2>
          <div
            className="luxury-animate-line-grow mx-auto mt-6 h-0.5"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Grille */}
        {properties.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property, index) => (
              <div
                key={property.id}
                className="luxury-scroll-reveal luxury-property-card group"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* Image */}
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

                  {/* Badge transaction type */}
                  <span
                    className="absolute left-4 top-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {property.transaction_type === 'sale' ? t('properties.sale') : t('properties.rent')}
                  </span>

                  {/* Prix overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12">
                    <span className="text-xl font-bold text-white">
                      {formatPrice(property.price, property.currency)}
                    </span>
                  </div>
                </div>

                {/* Infos */}
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
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center opacity-50 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('properties.none')}
          </p>
        )}

        {/* CTA */}
        {properties.length > 0 && (
          <div className="luxury-scroll-reveal mt-16 text-center">
            <Link
              href={`/agence/${agency.slug}/biens`}
              className="inline-block border px-10 py-4 text-sm font-semibold uppercase tracking-widest transition-colors duration-300 hover:opacity-80"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              {t('properties.viewAll')}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
