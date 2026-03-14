export type AgencyRole = "owner" | "admin" | "agent" | "editor" | "viewer";

export interface AgencyDto {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  wilayaCode: string;
  communeCode: string;
  address: string | null;
  description: string | null;
  planId: string | null;
  subscriptionStatus: "active" | "trialing" | "past_due" | "canceled" | "unpaid" | null;
  memberCount: number;
  listingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyMemberDto {
  userId: string;
  agencyId: string;
  role: AgencyRole;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  joinedAt: string;
}
