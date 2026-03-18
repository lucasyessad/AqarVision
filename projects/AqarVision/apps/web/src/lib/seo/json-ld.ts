interface ListingJsonLdParams {
  title: string;
  description: string;
  price: number;
  currency: string;
  address: string;
  wilaya: string;
  images: string[];
  area?: number;
  rooms?: number;
  listingType: "sale" | "rent" | "vacation";
  url: string;
}

export function generateListingJsonLd(params: ListingJsonLdParams) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: params.title,
    description: params.description,
    url: params.url,
    image: params.images,
    offers: {
      "@type": "Offer",
      price: params.price,
      priceCurrency: params.currency,
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: params.address,
      addressRegion: params.wilaya,
      addressCountry: "DZ",
    },
    ...(params.area && {
      floorSize: {
        "@type": "QuantitativeValue",
        value: params.area,
        unitCode: "MTK",
      },
    }),
    ...(params.rooms && {
      numberOfRooms: params.rooms,
    }),
  };
}
