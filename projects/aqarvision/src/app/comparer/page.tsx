import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowLeft, Building2, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { SearchPropertyResult } from '@/types/database';
import { formatPrice } from '@/lib/utils/format';

export const metadata: Metadata = {
  title: 'Comparateur de biens — AqarVision',
  description: 'Comparez plusieurs biens immobiliers côte à côte pour faire le meilleur choix.',
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function fetchProperties(ids: string[]): Promise<SearchPropertyResult[]> {
  if (ids.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('search_properties_view')
    .select('*')
    .in('property_id', ids);

  if (!data) return [];

  // Preserve order from ids
  return ids
    .map((id) => (data as SearchPropertyResult[]).find((p) => p.property_id === id))
    .filter((p): p is SearchPropertyResult => !!p);
}

const LABELS = [
  { key: 'price',       label: 'Prix' },
  { key: 'surface',     label: 'Surface' },
  { key: 'rooms',       label: 'Pièces' },
  { key: 'bathrooms',   label: 'Salles de bain' },
  { key: 'type',        label: 'Type' },
  { key: 'wilaya',      label: 'Wilaya' },
  { key: 'commune',     label: 'Commune' },
  { key: 'agency_name', label: 'Agence' },
  { key: 'trust_score', label: 'Trust Score' },
  { key: 'images',      label: 'Nb. Photos' },
] as const;

type RowKey = (typeof LABELS)[number]['key'];

function getCellValue(property: SearchPropertyResult, key: RowKey): string | number | null {
  switch (key) {
    case 'price':       return property.price;
    case 'surface':     return property.surface ?? null;
    case 'rooms':       return property.rooms ?? null;
    case 'bathrooms':   return property.bathrooms ?? null;
    case 'type':        return property.type;
    case 'wilaya':      return property.wilaya ?? '—';
    case 'commune':     return property.commune ?? '—';
    case 'agency_name': return property.agency_name;
    case 'trust_score': return property.trust_score;
    case 'images':      return property.images_count ?? property.images?.length ?? 0;
    default:            return null;
  }
}

function renderCell(
  property: SearchPropertyResult,
  key: RowKey,
  highlight?: 'min' | 'max' | null
) {
  const value = getCellValue(property, key);

  if (key === 'price') {
    const colorClass = highlight === 'min'
      ? 'text-emerald-600 font-bold'
      : highlight === 'max'
      ? 'text-red-500 font-semibold'
      : 'text-neutral-900 font-semibold';
    return (
      <span className={colorClass}>
        {formatPrice(property.price, property.currency)}
      </span>
    );
  }

  if (key === 'surface') {
    return property.surface ? <span>{property.surface} m²</span> : <span className="text-neutral-400">—</span>;
  }

  if (key === 'trust_score') {
    const score = property.trust_score;
    const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${Math.min(100, score)}%` }}
          />
        </div>
        <span className="text-xs text-neutral-600 shrink-0">{score}</span>
      </div>
    );
  }

  if (value === null || value === undefined) {
    return <span className="text-neutral-400">—</span>;
  }

  return <span>{String(value)}</span>;
}

export default async function ComparerPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const idsParam = typeof rawParams.ids === 'string' ? rawParams.ids : '';
  const ids = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 4);

  const properties = await fetchProperties(ids);

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
        <Building2 className="h-12 w-12 text-neutral-300" />
        <p className="text-heading-sm text-neutral-700">Aucun bien à comparer</p>
        <p className="text-body-sm text-neutral-500">Sélectionnez des biens depuis la page recherche.</p>
        <Link href="/recherche" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-body-sm font-medium hover:bg-primary-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour à la recherche
        </Link>
      </div>
    );
  }

  // Compute price min/max for highlighting
  const prices = properties.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-20">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/recherche" className="flex items-center gap-1.5 text-body-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à la recherche
          </Link>
          <span className="text-neutral-300">|</span>
          <h1 className="text-heading-sm text-neutral-900">
            Comparaison de {properties.length} bien{properties.length > 1 ? 's' : ''}
          </h1>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 py-8 overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: `${280 + properties.length * 220}px` }}>
          {/* Property image headers */}
          <thead>
            <tr>
              {/* Labels column */}
              <th className="w-48 min-w-[180px] text-left align-bottom pb-4 pr-4">
                <span className="text-caption text-neutral-500 uppercase tracking-wide">Critères</span>
              </th>

              {properties.map((property) => (
                <th key={property.property_id} className="min-w-[200px] px-4 pb-4 text-left align-top">
                  {/* Image */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 mb-3">
                    {property.images?.[0] ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="220px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Building2 className="h-8 w-8 text-neutral-300" />
                      </div>
                    )}
                    <span
                      className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        property.transaction_type === 'sale'
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {property.transaction_type === 'sale' ? 'Vente' : 'Location'}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-body-sm font-semibold text-neutral-900 line-clamp-2 mb-2">
                    {property.title}
                  </p>

                  {/* View link */}
                  <Link
                    href={`/bien/${property.property_id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Voir l&apos;annonce
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {LABELS.map(({ key, label }, rowIndex) => (
              <tr
                key={key}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50/60'}
              >
                {/* Label */}
                <td className="pr-4 py-3.5 text-body-sm font-medium text-neutral-600 align-middle border-t border-neutral-100">
                  {label}
                </td>

                {properties.map((property) => {
                  const priceHighlight =
                    key === 'price'
                      ? property.price === minPrice && minPrice !== maxPrice
                        ? 'min'
                        : property.price === maxPrice && minPrice !== maxPrice
                        ? 'max'
                        : null
                      : null;

                  return (
                    <td
                      key={property.property_id}
                      className="px-4 py-3.5 text-body-sm text-neutral-800 align-middle border-t border-neutral-100"
                    >
                      {renderCell(property, key, priceHighlight)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-caption text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            Prix le plus bas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            Prix le plus élevé
          </span>
        </div>
      </div>
    </div>
  );
}
