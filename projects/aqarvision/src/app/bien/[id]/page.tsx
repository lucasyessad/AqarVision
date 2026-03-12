import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { MapPin, Maximize2, BedDouble, Bath, Building2, ArrowLeft, Share2 } from 'lucide-react';
import { getSearchPropertyById, getSimilarProperties } from '@/lib/queries/search';
import { formatPrice, getLocationLabel } from '@/lib/utils/format';
import { TrustBadge } from '@/components/search/trust-badge';
import { FavoriteButton } from '@/components/search/favorite-button';
import { ContactPanel } from '@/components/search/contact-panel';
import { VisitRequestForm } from '@/components/search/visit-request-form';
import { ResultCard } from '@/components/search/result-card';
import { PropertyCardSkeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/server';
import { FadeInUp, FadeIn, StaggerContainer } from '@/components/ui/animated-sections';
import type { SearchPropertyResult } from '@/types/database';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getSearchPropertyById(id);
  if (!property) return { title: 'Bien introuvable' };

  const location = getLocationLabel(property);
  return {
    title: `${property.title} — ${formatPrice(property.price, property.currency)} | AqarSearch`,
    description: property.description?.slice(0, 160) || `${property.title} à ${location}`,
    openGraph: {
      title: property.title,
      description: property.description?.slice(0, 160) || undefined,
      images: property.images?.[0] ? [property.images[0]] : undefined,
    },
  };
}

export default async function BienPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getSearchPropertyById(id);

  if (!property) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const location = getLocationLabel(property);
  const formattedPrice = formatPrice(property.price, property.currency);

  const transactionLabel = property.transaction_type === 'sale' ? 'Vente' : 'Location';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/recherche" className="flex items-center gap-1 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" />
              Recherche
            </Link>
            <span>/</span>
            <span className="line-clamp-1 text-gray-900">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Image gallery */}
            <FadeIn>
              <div className="mb-6 overflow-hidden rounded-xl">
                {property.images && property.images.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="relative aspect-[4/3] sm:col-span-2">
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="rounded-xl object-cover"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        priority
                      />
                    </div>
                    {property.images.slice(1, 5).map((img: string, i: number) => (
                      <div key={i} className="relative aspect-[4/3]">
                        <Image
                          src={img}
                          alt={`${property.title} - ${i + 2}`}
                          fill
                          className="rounded-lg object-cover"
                          sizes="(max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-gray-200">
                    <Building2 className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Title + Price */}
            <FadeInUp>
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      property.transaction_type === 'sale'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {transactionLabel}
                    </span>
                    <TrustBadge score={property.trust_score} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                  <p className="mt-1 flex items-center gap-1 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <FavoriteButton
                    propertyId={property.property_id}
                    isFavorited={false}
                    isAuthenticated={isAuthenticated}
                  />
                  <button className="rounded-full bg-gray-100 p-2 text-gray-400 hover:bg-gray-200">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p className="mb-6 text-3xl font-bold text-blue-600">{formattedPrice}</p>
            </FadeInUp>

            {/* Specs */}
            <FadeInUp delay={0.1}>
              <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-4">
                {property.surface && (
                  <div className="text-center">
                    <Maximize2 className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">{property.surface} m²</p>
                    <p className="text-xs text-gray-500">Surface</p>
                  </div>
                )}
                {property.rooms && (
                  <div className="text-center">
                    <BedDouble className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">{property.rooms}</p>
                    <p className="text-xs text-gray-500">Pièces</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <Bath className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">{property.bathrooms}</p>
                    <p className="text-xs text-gray-500">SdB</p>
                  </div>
                )}
                {property.type && (
                  <div className="text-center">
                    <Building2 className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900 capitalize">{property.type}</p>
                    <p className="text-xs text-gray-500">Type</p>
                  </div>
                )}
              </div>
            </FadeInUp>

            {/* Description */}
            {property.description && (
              <FadeInUp delay={0.15}>
                <div className="mb-6">
                  <h2 className="mb-3 text-lg font-semibold text-gray-900">Description</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {property.description}
                  </p>
                </div>
              </FadeInUp>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <FadeInUp delay={0.2}>
                <div className="mb-6">
                  <h2 className="mb-3 text-lg font-semibold text-gray-900">Caractéristiques</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeInUp>
            )}

            {/* Agency info */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Agence</h2>
              <Link
                href={`/agence/${property.agency_slug}`}
                className="flex items-center gap-3 hover:text-blue-600"
              >
                {property.agency_logo_url ? (
                  <Image
                    src={property.agency_logo_url}
                    alt={property.agency_name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{property.agency_name}</p>
                  <p className="text-xs text-gray-500">Voir le mini-site</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Sidebar — Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <ContactPanel
                agencyId={property.agency_id}
                agencyName={property.agency_name}
                agencyPhone={property.agency_phone}
                agencyEmail={property.agency_email}
                propertyId={property.property_id}
                propertyTitle={property.title}
                propertyPrice={formattedPrice}
              />
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <VisitRequestForm
                  propertyId={property.property_id}
                  agencyId={property.agency_id}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Similar properties — streamed via Suspense */}
        <Suspense fallback={
          <div className="mt-12">
            <div className="mb-6 h-7 w-48 skeleton rounded" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map(i => <PropertyCardSkeleton key={i} />)}
            </div>
          </div>
        }>
          <SimilarProperties property={property} />
        </Suspense>
      </div>
    </div>
  );
}

/* ─── Similar Properties (streamed) ────────────── */

async function SimilarProperties({ property }: { property: SearchPropertyResult }) {
  const similar = await getSimilarProperties(property);
  if (similar.length === 0) return null;

  return (
    <FadeInUp>
      <div className="mt-12">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Biens similaires</h2>
        <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((p: SearchPropertyResult) => (
            <FadeInUp key={p.property_id}>
              <ResultCard property={p} />
            </FadeInUp>
          ))}
        </StaggerContainer>
      </div>
    </FadeInUp>
  );
}
