interface ListingJsonLdInput {
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  url: string;
  agencyName: string;
  propertyType: string;
  rooms: number | null;
  surface: number | null;
}

export function generateListingJsonLd(input: ListingJsonLdInput): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: input.title,
    description: input.description,
    url: input.url,
    offers: {
      "@type": "Offer",
      price: input.price,
      priceCurrency: input.currency,
      availability: "https://schema.org/InStock",
    },
    seller: {
      "@type": "RealEstateAgent",
      name: input.agencyName,
    },
  };

  if (input.images.length > 0) {
    jsonLd.image = input.images;
  }

  // Property details as additionalProperty
  const additionalProperties: Record<string, unknown>[] = [];

  if (input.propertyType) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "propertyType",
      value: input.propertyType,
    });
  }

  if (input.rooms !== null) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "numberOfRooms",
      value: input.rooms,
    });
    jsonLd.numberOfRooms = input.rooms;
  }

  if (input.surface !== null) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "floorSize",
      value: `${input.surface} m2`,
      unitCode: "MTK",
    });
    jsonLd.floorSize = {
      "@type": "QuantitativeValue",
      value: input.surface,
      unitCode: "MTK",
    };
  }

  if (additionalProperties.length > 0) {
    jsonLd.additionalProperty = additionalProperties;
  }

  return jsonLd;
}
