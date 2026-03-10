import type { Agency, Property } from '@/types/database';
import { LOCALE } from '@/config';

interface JsonLdProps {
  data: Record<string, unknown>;
}

function JsonLdScript({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Données structurées JSON-LD pour une agence immobilière.
 * Schema.org: RealEstateAgent
 */
export function AgencyJsonLd({ agency, baseUrl }: { agency: Agency; baseUrl: string }) {
  const agencyUrl = `${baseUrl}/agence/${agency.slug}`;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: agency.name,
    url: agencyUrl,
    ...(agency.description && { description: agency.description }),
    ...(agency.logo_url && { logo: agency.logo_url }),
    ...(agency.cover_image_url && { image: agency.cover_image_url }),
    ...(agency.phone && { telephone: agency.phone }),
    ...(agency.email && { email: agency.email }),
    ...(agency.website && { sameAs: agency.website }),
    ...(agency.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: agency.address,
        ...(agency.wilaya && { addressRegion: agency.wilaya }),
        addressCountry: LOCALE.COUNTRY_CODE,
      },
    }),
    ...(agency.wilaya && !agency.address && {
      address: {
        '@type': 'PostalAddress',
        addressRegion: agency.wilaya,
        addressCountry: LOCALE.COUNTRY_CODE,
      },
    }),
  };

  return <JsonLdScript data={data} />;
}

/**
 * Données structurées JSON-LD pour un bien immobilier.
 * Schema.org: Product + Offer (best fit for real estate listings)
 */
export function PropertyJsonLd({
  property,
  agency,
  baseUrl,
}: {
  property: Property;
  agency: Agency;
  baseUrl: string;
}) {
  const propertyUrl = `${baseUrl}/agence/${agency.slug}/biens/${property.id}`;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.title,
    url: propertyUrl,
    ...(property.description && { description: property.description }),
    ...(property.images.length > 0 && { image: property.images }),
    category: property.type,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: LOCALE.CURRENCY,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'RealEstateAgent',
        name: agency.name,
        url: `${baseUrl}/agence/${agency.slug}`,
      },
    },
    ...(property.wilaya && {
      contentLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          ...(property.address && { streetAddress: property.address }),
          addressRegion: property.wilaya,
          addressCountry: LOCALE.COUNTRY_CODE,
        },
      },
    }),
    additionalProperty: [
      ...(property.surface ? [{ '@type': 'PropertyValue', name: 'Surface', value: property.surface, unitCode: 'MTK' }] : []),
      ...(property.rooms ? [{ '@type': 'PropertyValue', name: 'Pièces', value: property.rooms }] : []),
      ...(property.bathrooms ? [{ '@type': 'PropertyValue', name: 'Salles de bain', value: property.bathrooms }] : []),
      { '@type': 'PropertyValue', name: 'Type de transaction', value: property.transaction_type === 'sale' ? 'Vente' : 'Location' },
    ],
  };

  return <JsonLdScript data={data} />;
}

/**
 * Breadcrumb JSON-LD pour le SEO.
 */
export function BreadcrumbJsonLd({
  items,
  baseUrl,
}: {
  items: { name: string; url: string }[];
  baseUrl: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };

  return <JsonLdScript data={data} />;
}
