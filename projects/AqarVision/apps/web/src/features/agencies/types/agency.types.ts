import type { AnyAgencyRole } from "../schemas/agency.schema";

export interface AgencyDto {
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
}

export interface BranchDto {
  id: string;
  agency_id: string;
  name: string;
  wilaya_code: string;
  commune_id: number | null;
  address_text: string | null;
}

export interface MembershipDto {
  id: string;
  agency_id: string;
  user_id: string;
  role: AnyAgencyRole;
  is_active: boolean;
  joined_at: string;
  user_name: string | null;
  user_email: string | null;
}

export interface InviteDto {
  id: string;
  agency_id: string;
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
