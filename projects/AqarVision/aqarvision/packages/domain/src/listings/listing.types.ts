export type ListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "archived"
  | "rejected"
  | "expired";

export type ListingType = "sale" | "rent" | "vacation_rental";

export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "land"
  | "commercial"
  | "office"
  | "garage"
  | "warehouse"
  | "other";

export interface ListingTranslation {
  locale: string;
  title: string;
  description: string;
}

export interface ListingMedia {
  id: string;
  url: string;
  type: "image" | "video" | "document";
  isCover: boolean;
  order: number;
}

export interface ListingDto {
  id: string;
  agencyId: string;
  status: ListingStatus;
  listingType: ListingType;
  propertyType: PropertyType;
  price: number;
  currency: string;
  surface: number;
  rooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  latitude: number | null;
  longitude: number | null;
  wilayaCode: string;
  communeCode: string;
  address: string | null;
  translations: ListingTranslation[];
  media: ListingMedia[];
  features: string[];
  slug: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingInput {
  agencyId: string;
  listingType: ListingType;
  propertyType: PropertyType;
  price: number;
  currency: string;
  surface: number;
  rooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  latitude: number | null;
  longitude: number | null;
  wilayaCode: string;
  communeCode: string;
  address: string | null;
  translations: ListingTranslation[];
  features: string[];
}
