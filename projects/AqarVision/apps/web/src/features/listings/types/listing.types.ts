import type { ListingType, PropertyType, ListingStatus } from "../schemas/listing.schema";

export interface ListingMedia {
  id: string;
  storage_path: string;
  content_type: string;
  width: number;
  height: number;
  file_size_bytes: number;
  position: number;
  is_cover: boolean;
}

export interface ListingTranslation {
  locale: string;
  title: string;
  description: string;
  slug: string;
}

export interface ListingDetails {
  area_m2: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
  has_parking?: boolean;
  has_elevator?: boolean;
  has_balcony?: boolean;
  has_pool?: boolean;
  has_garden?: boolean;
  furnished?: boolean;
  has_sea_view?: boolean;
  has_water?: boolean;
  has_electricity?: boolean;
}

export interface Listing {
  id: string;
  listing_type: ListingType;
  property_type: PropertyType;
  status: ListingStatus;
  owner_type: "agency" | "individual";
  agency_id: string | null;
  user_id: string | null;
  wilaya_code: string;
  commune_id: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number;
  currency: string;
  details: ListingDetails;
  contact_phone: string | null;
  show_phone: boolean;
  accept_messages: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  translations: ListingTranslation[];
  media: ListingMedia[];
}

export interface ListingCard {
  id: string;
  listing_type: ListingType;
  property_type: PropertyType;
  price: number;
  currency: string;
  area_m2: number;
  rooms: number | null;
  title: string;
  slug: string;
  wilaya_name: string;
  commune_name: string;
  cover_url: string | null;
  agency_name: string | null;
  agency_verified_level: number | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}
