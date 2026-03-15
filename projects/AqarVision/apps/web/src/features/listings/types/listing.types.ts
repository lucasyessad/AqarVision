import type { ListingType, PropertyType, Locale } from "../schemas/listing.schema";

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "paused"
  | "rejected"
  | "sold"
  | "archived";

export interface TranslationDto {
  id: string;
  locale: Locale;
  title: string;
  description: string;
  slug: string;
}

export interface MediaDto {
  id: string;
  storage_path: string;
  content_type: string;
  is_cover: boolean;
  sort_order: number;
}

export interface ListingDto {
  id: string;
  agency_id: string;
  current_status: ListingStatus;
  current_price: number;
  currency: string;
  listing_type: ListingType;
  property_type: PropertyType;
  surface_m2: number | null;
  rooms: number | null;
  bathrooms: number | null;
  wilaya_code: string;
  commune_id: number | null;
  version: number;
  published_at: string | null;
  created_at: string;
  translations: TranslationDto[];
  cover_url: string | null;
}

export interface ListingDetailDto extends ListingDto {
  media: MediaDto[];
  agency_name: string;
  agency_slug: string;
}

export interface CreateListingResult {
  listing_id: string;
  status: ListingStatus;
}

export type { ActionResult } from "@/types/action-result";
