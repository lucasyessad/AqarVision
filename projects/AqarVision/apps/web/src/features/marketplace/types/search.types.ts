import type { ListingType, PropertyType } from "@/features/listings/schemas/listing.schema";
import type { ListingStatus } from "@/features/listings/types/listing.types";

export interface WilayaDto {
  code: string;
  name: string;
}

export interface CommuneDto {
  id: number;
  wilaya_code: string;
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
  postal_code: string | null;
  daira_name_fr: string | null;
  daira_name_ar: string | null;
}

export interface SearchResultDto {
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
  wilaya_name: string;
  commune_name: string | null;
  commune_id: number | null;
  published_at: string | null;
  created_at: string;
  title: string;
  slug: string;
  cover_url: string | null;
  agency_name: string;
  relevance_score: number | null;
  reference_number: number;
}

export function formatListingRef(referenceNumber: number): string {
  return `AV-${String(referenceNumber).padStart(5, '0')}`;
}

export interface SearchResponse {
  results: SearchResultDto[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface ListingDetailPublicDto {
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
  wilaya_name: string;
  commune_name: string | null;
  commune_id: number | null;
  published_at: string | null;
  created_at: string;
  details: Record<string, unknown>;
  reference_number: number;
  title: string;
  description: string;
  slug: string;
  media: ListingMediaDto[];
  agency_name: string;
  agency_slug: string;
  agency_logo_url: string | null;
  agency_phone: string | null;
  translations: ListingTranslationPublicDto[];
}

export interface ListingMediaDto {
  id: string;
  storage_path: string;
  content_type: string | null;
  is_cover: boolean;
  sort_order: number;
}

export interface ListingTranslationPublicDto {
  locale: string;
  title: string;
  description: string;
  slug: string;
}

export interface AgencyPublicDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  email: string | null;
  is_verified: boolean;
  created_at: string;
  branches: AgencyBranchPublicDto[];
  listing_count: number;
  /** Theme & branding (from agencies table) */
  theme: string;
  primary_color: string | null;
  accent_color: string | null;
  secondary_color: string | null;
}

export interface AgencyBranchPublicDto {
  id: string;
  name: string;
  wilaya_code: string;
  commune_id: number | null;
  address_text: string | null;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
