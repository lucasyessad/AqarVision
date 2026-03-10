import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAgencyBySlug } from '@/lib/queries/agency';
import { ContactForm } from '@/components/agency/contact-form';
import type { Agency, Property } from '@/types/database';
import type { Metadata } from 'next';

interface PropertyDetailPageProps {
  params: Promise<{ slug: string; id: string }>;
}

async function getProperty(id: string): Promise<Property | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  return data as Property | null;
}

async function getSimilarProperties(
  agencyId: string,
  propertyId: string,
  type: string
): Promise<Property[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('type', type)
    .neq('id', propertyId)
    .order('created_at', { ascending: false })
    .limit(3);
  return (data || []) as Property[];
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return {};

  const price = new Intl.NumberFormat('fr-DZ').format(property.price);
  return {
    title: property.title,
    description: `${property.title} — ${price} DZD${property.wilaya ? ` à ${property.wilaya}` : ''}`,
    openGraph: {
      title: property.title,
      ...(property.images[0] && { images: [{ url: property.images[0] }] }),
    },
  };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0,
  }).format(price);
}

function PropertyInfo({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="text-xs uppercase tracking-wider opacity-50">{label}</span>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug, id } = await params;

  const [agency, property] = await Promise.all([
    getAgencyBySlug(slug),
    getProperty(id),
  ]);

  if (!agency || !property) notFound();
  if (property.agency_id !== agency.id) notFound();

  const similar = await getSimilarProperties(agency.id, property.id, property.type);

  const isEnterprise = agency.active_plan === 'enterprise';
  const isDark = agency.theme_mode === 'dark';
  const accentColor = agency.secondary_color || agency.primary_color;

  // WhatsApp message
  const whatsappMessage = `Bonjour ${agency.name}, je suis intéressé(e) par le bien "${property.title}" (${formatPrice(property.price)}).`;
  const whatsappNumber = agency.phone
    ? agency.phone.replace(/[\s\-().+]/g, '').replace(/^0/, '213')
    : null;

  if (isEnterprise) {
    return (
      <article className={`py-24 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
        <div className="mx-auto max-w-6xl px-6">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm opacity-50">
            <Link href={`/agence/${slug}`}>Accueil</Link>
            <span className="mx-2">/</span>
            <Link href={`/agence/${slug}/biens`}>Biens</Link>
            <span className="mx-2">/</span>
            <span>{property.title}</span>
          </nav>

          {/* Gallery */}
          {property.images.length > 0 && (
            <div className="mb-12 grid gap-4 sm:grid-cols-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg sm:col-span-2">
                <Image
                  src={property.images[0]}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                />
                <span
                  className="absolute left-4 top-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {property.transaction_type === 'sale' ? 'Vente' : 'Location'}
                </span>
              </div>
              {property.images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image src={img} alt={`${property.title} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main info */}
            <div className="lg:col-span-2">
              <h1 className="font-display-classic text-display-lg">{property.title}</h1>

              <p className="mt-4 text-3xl font-bold" style={{ color: accentColor }}>
                {formatPrice(property.price)}
              </p>

              {/* Caractéristiques */}
              <div
                className={`mt-8 grid grid-cols-2 gap-6 rounded-lg p-6 sm:grid-cols-4 ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                {property.type && <PropertyInfo label="Type" value={property.type} />}
                {property.surface && <PropertyInfo label="Surface" value={`${property.surface} m²`} />}
                {property.rooms && <PropertyInfo label="Pièces" value={property.rooms} />}
                {property.bathrooms && <PropertyInfo label="SdB" value={property.bathrooms} />}
                {property.wilaya && <PropertyInfo label="Wilaya" value={property.wilaya} />}
                {property.address && <PropertyInfo label="Adresse" value={property.address} />}
              </div>

              {/* Description */}
              {property.description && (
                <div className="mt-8">
                  <h2 className="mb-4 text-lg font-semibold">Description</h2>
                  <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {property.description}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar: Contact */}
            <div>
              <div className={`sticky top-24 rounded-xl p-6 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <h2 className="mb-2 text-lg font-semibold">Intéressé par ce bien ?</h2>
                <p className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Contactez {agency.name} directement
                </p>

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Contacter via WhatsApp
                  </a>
                )}

                <ContactForm agency={agency} propertyId={property.id} />
              </div>
            </div>
          </div>

          {/* Biens similaires */}
          {similar.length > 0 && (
            <div className="mt-24">
              <h2 className="mb-8 text-center font-display-classic text-2xl">Biens similaires</h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((p) => (
                  <Link
                    key={p.id}
                    href={`/agence/${slug}/biens/${p.id}`}
                    className="luxury-property-card group block"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                          <span className="text-sm opacity-40">Pas de photo</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12">
                        <span className="text-lg font-bold text-white">{formatPrice(p.price)}</span>
                      </div>
                    </div>
                    <div className={`p-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                      <h3 className="font-semibold">{p.title}</h3>
                      <p className="mt-1 text-sm opacity-60">
                        {p.wilaya} {p.surface && `· ${p.surface} m²`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    );
  }

  // Starter / Pro → Detail basique
  return (
    <article className="mx-auto max-w-5xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href={`/agence/${slug}`} className="hover:underline">Accueil</Link>
        <span className="mx-2">/</span>
        <Link href={`/agence/${slug}/biens`} className="hover:underline">Biens</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{property.title}</span>
      </nav>

      {/* Gallery */}
      {property.images.length > 0 && (
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg sm:col-span-2">
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          </div>
          {property.images.slice(1, 5).map((img, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <img src={img} alt={`${property.title} ${i + 2}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              {property.transaction_type === 'sale' ? 'Vente' : 'Location'}
            </span>
            <span className="text-sm text-gray-500">{property.type}</span>
          </div>

          <h1 className="text-2xl font-bold">{property.title}</h1>
          <p className="mt-2 text-2xl font-bold text-blue-600">{formatPrice(property.price)}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-4">
            {property.surface && <PropertyInfo label="Surface" value={`${property.surface} m²`} />}
            {property.rooms && <PropertyInfo label="Pièces" value={property.rooms} />}
            {property.bathrooms && <PropertyInfo label="SdB" value={property.bathrooms} />}
            {property.wilaya && <PropertyInfo label="Wilaya" value={property.wilaya} />}
          </div>

          {property.description && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold">Description</h2>
              <p className="leading-relaxed text-gray-600">{property.description}</p>
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24 rounded-xl border p-6">
            <h2 className="mb-2 text-lg font-semibold">Intéressé ?</h2>
            <p className="mb-6 text-sm text-gray-500">Contactez {agency.name}</p>

            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600"
              >
                Contacter via WhatsApp
              </a>
            )}

            <ContactForm agency={agency} propertyId={property.id} />
          </div>
        </div>
      </div>

      {/* Biens similaires */}
      {similar.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-bold">Biens similaires</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <Link
                key={p.id}
                href={`/agence/${slug}/biens/${p.id}`}
                className="block overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
              >
                {p.images[0] && (
                  <div className="relative aspect-[4/3]">
                    <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {p.wilaya} {p.surface && `· ${p.surface} m²`}
                  </p>
                  <p className="mt-2 font-bold text-blue-600">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
