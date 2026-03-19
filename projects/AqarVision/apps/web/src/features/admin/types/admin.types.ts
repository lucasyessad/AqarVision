import type { ListingType, PropertyType, ListingStatus } from "@/features/listings/schemas/listing.schema";

export interface ModerationItem {
  id: string;
  listing_type: ListingType;
  property_type: PropertyType;
  status: ListingStatus;
  owner_type: "agency" | "individual";
  price: number;
  currency: string;
  wilaya_code: string;
  address: string | null;
  created_at: string;
  user_id: string | null;
  agency_id: string | null;
  details: Record<string, unknown>;
  translations: Array<{
    locale: string;
    title: string;
    description: string;
    slug: string;
  }>;
  media: Array<{
    id: string;
    storage_path: string;
    position: number;
    is_cover: boolean;
  }>;
  documents: Array<{
    id: string;
    document_type: string;
    storage_path: string;
    is_public: boolean;
  }>;
  agency?: {
    name: string;
    slug: string;
  } | null;
  profile?: {
    first_name: string;
    last_name: string;
  } | null;
}

export type ModerationAction = "approved" | "rejected" | "hidden";

export interface ModerationFilters {
  listing_type?: ListingType;
  wilaya_code?: string;
  owner_type?: "agency" | "individual";
  page?: number;
  per_page?: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor_id: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

export interface AuditLogFilters {
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export interface VerificationRequest {
  id: string;
  agency_id: string;
  level: number;
  type: string;
  status: string;
  legal_name: string | null;
  rc_number: string | null;
  rc_document_url: string | null;
  nif_number: string | null;
  address_proof_url: string | null;
  created_at: string;
  expires_at: string | null;
  agency?: {
    name: string;
    slug: string;
    logo_url: string | null;
  } | null;
}

export type VerificationAction = "approve" | "reject";

export interface PlatformSetting {
  key: string;
  value: string;
  updated_at: string;
}

export interface AdminAgency {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  verification_status: string;
  created_at: string;
  plan_name: string | null;
  listings_count: number;
  verified_level: number;
}

export interface AdminAgencyFilters {
  search?: string;
  verification_status?: string;
  page?: number;
  per_page?: number;
}

export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  agencies_count: number;
}

export interface AdminUserFilters {
  search?: string;
  role?: string;
  page?: number;
  per_page?: number;
}

export interface AdminPayment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  provider: string;
  payment_status: string;
  pack_type: string | null;
  subscription_type: string | null;
  transaction_id: string | null;
  receipt_url: string | null;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface AdminPaymentFilters {
  status?: string;
  provider?: string;
  page?: number;
  per_page?: number;
}

export interface Entitlement {
  id: string;
  agency_id: string;
  feature_key: string;
  enabled: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}
