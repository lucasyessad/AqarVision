import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Maximize2, BedDouble, Building2 } from 'lucide-react';
import type { SearchPropertyResult } from '@/types/database';
import { formatPrice, getLocationLabel } from '@/lib/utils/format';
import { TrustBadge } from './trust-badge';

interface ResultCardProps {
  property: SearchPropertyResult;
  locale?: 'fr' | 'ar' | 'en';
  favoriteButton?: React.ReactNode;
}

const transactionLabels = {
  fr: { sale: 'Vente', rent: 'Location' },
  ar: { sale: 'بيع', rent: 'إيجار' },
  en: { sale: 'Sale', rent: 'Rent' },
} as const;

export function ResultCard({ property, locale = 'fr', favoriteButton }: ResultCardProps) {
  const mainImage = property.images?.[0];
  const location = getLocationLabel(property);
  const transactionLabel = transactionLabels[locale][property.transaction_type];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <Link href={`/bien/${property.property_id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <Building2 className="h-12 w-12" />
            </div>
          )}
          {/* Transaction badge */}
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              property.transaction_type === 'sale'
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {transactionLabel}
          </span>
          {/* Featured badge */}
          {property.is_featured && (
            <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              {locale === 'fr' ? 'En vedette' : locale === 'ar' ? 'مميز' : 'Featured'}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Price + Trust */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(property.price, property.currency)}
          </span>
          <TrustBadge score={property.trust_score} locale={locale} />
        </div>

        {/* Title */}
        <Link href={`/bien/${property.property_id}`}>
          <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-gray-900 hover:text-blue-600">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <p className="mb-3 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {property.surface && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" />
              {property.surface} m²
            </span>
          )}
          {property.rooms && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {property.rooms} {locale === 'fr' ? 'pièces' : locale === 'ar' ? 'غرف' : 'rooms'}
            </span>
          )}
        </div>

        {/* Agency + Favorite */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <Link
            href={`/agence/${property.agency_slug}`}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600"
          >
            {property.agency_logo_url ? (
              <Image
                src={property.agency_logo_url}
                alt={property.agency_name}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            <span className="line-clamp-1">{property.agency_name}</span>
          </Link>
          {favoriteButton}
        </div>
      </div>
    </div>
  );
}
