import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgencyDto, BranchDto, InviteDto, MembershipDto } from "../types/agency.types";
import type {
  CreateAgencyInput,
  UpdateAgencyInput,
  CreateBranchInput,
  InviteMemberInput,
  AnyAgencyRole,
} from "../schemas/agency.schema";

const AGENCY_SELECT =
  "id, name, slug, description, logo_url, cover_url, phone, email, is_verified, created_at";

const BRANCH_SELECT = "id, agency_id, name, wilaya_code, commune_id, address_text";

function mapAgency(row: Record<string, unknown>): AgencyDto {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? null,
    logo_url: (row.logo_url as string) ?? null,
    cover_url: (row.cover_url as string) ?? null,
    phone: (row.phone as string) ?? null,
    email: (row.email as string) ?? null,
    is_verified: (row.is_verified as boolean) ?? false,
    created_at: row.created_at as string,
  };
}

function mapBranch(row: Record<string, unknown>): BranchDto {
  return {
    id: row.id as string,
    agency_id: row.agency_id as string,
    name: row.name as string,
    wilaya_code: row.wilaya_code as string,
    commune_id: (row.commune_id as number) ?? null,
    address_text: (row.address_text as string) ?? null,
  };
}

function mapMembership(row: Record<string, unknown>): MembershipDto {
  const profile = row.profiles as Record<string, unknown> | null;
  return {
    id: row.id as string,
    agency_id: row.agency_id as string,
    user_id: row.user_id as string,
    role: row.role as AnyAgencyRole,
    is_active: row.is_active as boolean,
    joined_at: row.joined_at as string,
    user_name: (profile?.full_name as string) ?? null,
    user_email: (profile?.phone as string) ?? null,
  };
}

function mapInvite(row: Record<string, unknown>): InviteDto {
  return {
    id: row.id as string,
    agency_id: row.agency_id as string,
    email: row.email as string,
    role: row.role as string,
    expires_at: row.expires_at as string,
    accepted_at: (row.accepted_at as string) ?? null,
  };
}

export async function createAgency(
  supabase: SupabaseClient,
  _userId: string,
  data: CreateAgencyInput
): Promise<AgencyDto> {
  // Use RPC to create agency + owner membership atomically (security definer bypasses RLS)
  const { data: agencyId, error: rpcError } = await supabase.rpc("create_agency_with_owner", {
    p_name: data.name,
    p_slug: data.slug,
    p_description: data.description ?? null,
    p_phone: data.phone ?? null,
    p_email: data.email || null,
  });

  if (rpcError || !agencyId) {
    throw new Error(rpcError?.message ?? "Failed to create agency");
  }

  // Fetch the created agency
  const { data: agency, error: fetchError } = await supabase
    .from("agencies")
    .select(AGENCY_SELECT)
    .eq("id", agencyId)
    .single();

  if (fetchError || !agency) {
    throw new Error(fetchError?.message ?? "Failed to fetch created agency");
  }

  return mapAgency(agency);
}

export async function updateAgency(
  supabase: SupabaseClient,
  agencyId: string,
  data: Omit<UpdateAgencyInput, "agency_id">
): Promise<AgencyDto> {
  const updatePayload: Record<string, unknown> = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.phone !== undefined) updatePayload.phone = data.phone;
  if (data.email !== undefined) updatePayload.email = data.email || null;

  const { data: agency, error } = await supabase
    .from("agencies")
    .update(updatePayload)
    .eq("id", agencyId)
    .select(AGENCY_SELECT)
    .single();

  if (error || !agency) {
    throw new Error(error?.message ?? "Failed to update agency");
  }

  return mapAgency(agency);
}

export async function getAgency(
  supabase: SupabaseClient,
  agencyId: string
): Promise<AgencyDto | null> {
  const { data, error } = await supabase
    .from("agencies")
    .select(AGENCY_SELECT)
    .eq("id", agencyId)
    .single();

  if (error || !data) {
    return null;
  }

  return mapAgency(data);
}

export async function getUserAgencies(
  supabase: SupabaseClient,
  userId: string
): Promise<AgencyDto[]> {
  const { data: memberships, error: memberError } = await supabase
    .from("agency_memberships")
    .select("agency_id")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (memberError || !memberships || memberships.length === 0) {
    return [];
  }

  const agencyIds = memberships.map((m) => m.agency_id);

  const { data: agencies, error: agencyError } = await supabase
    .from("agencies")
    .select(AGENCY_SELECT)
    .in("id", agencyIds);

  if (agencyError || !agencies) {
    return [];
  }

  return agencies.map(mapAgency);
}

export async function createBranch(
  supabase: SupabaseClient,
  data: CreateBranchInput
): Promise<BranchDto> {
  const { data: branch, error } = await supabase
    .from("branches")
    .insert({
      agency_id: data.agency_id,
      name: data.name,
      wilaya_code: data.wilaya_code,
      commune_id: data.commune_id ?? null,
      address_text: data.address_text ?? null,
    })
    .select(BRANCH_SELECT)
    .single();

  if (error || !branch) {
    throw new Error(error?.message ?? "Failed to create branch");
  }

  return mapBranch(branch);
}

export async function getAgencyBranches(
  supabase: SupabaseClient,
  agencyId: string
): Promise<BranchDto[]> {
  const { data, error } = await supabase
    .from("branches")
    .select(BRANCH_SELECT)
    .eq("agency_id", agencyId);

  if (error || !data) {
    return [];
  }

  return data.map(mapBranch);
}

export async function getAgencyMembers(
  supabase: SupabaseClient,
  agencyId: string
): Promise<MembershipDto[]> {
  const { data, error } = await supabase
    .from("agency_memberships")
    .select("id, agency_id, user_id, role, is_active, joined_at, profiles(full_name, phone)")
    .eq("agency_id", agencyId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapMembership(row as unknown as Record<string, unknown>));
}

export async function inviteMember(
  supabase: SupabaseClient,
  data: InviteMemberInput
): Promise<InviteDto> {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: invite, error } = await supabase
    .from("agency_invites")
    .insert({
      agency_id: data.agency_id,
      email: data.email,
      role: data.role,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, agency_id, email, role, expires_at, accepted_at")
    .single();

  if (error || !invite) {
    throw new Error(error?.message ?? "Failed to create invite");
  }

  return mapInvite(invite);
}

export async function acceptInvite(
  supabase: SupabaseClient,
  userId: string,
  token: string
): Promise<MembershipDto> {
  const { data: invite, error: inviteError } = await supabase
    .from("agency_invites")
    .select("id, agency_id, email, role, expires_at, accepted_at")
    .eq("token", token)
    .is("accepted_at", null)
    .single();

  if (inviteError || !invite) {
    throw new Error("Invalid or already used invite token");
  }

  const now = new Date();
  const expiresAt = new Date(invite.expires_at);
  if (now > expiresAt) {
    throw new Error("Invite token has expired");
  }

  const { data: membership, error: memberError } = await supabase
    .from("agency_memberships")
    .insert({
      agency_id: invite.agency_id,
      user_id: userId,
      role: invite.role,
      is_active: true,
    })
    .select("id, agency_id, user_id, role, is_active, joined_at, profiles(full_name, phone)")
    .single();

  if (memberError || !membership) {
    throw new Error(memberError?.message ?? "Failed to create membership");
  }

  await supabase
    .from("agency_invites")
    .update({ accepted_at: now.toISOString() })
    .eq("id", invite.id);

  return mapMembership(membership as unknown as Record<string, unknown>);
}

export async function changeMemberRole(
  supabase: SupabaseClient,
  agencyId: string,
  userId: string,
  newRole: string
): Promise<void> {
  const { error } = await supabase
    .from("agency_memberships")
    .update({ role: newRole })
    .eq("agency_id", agencyId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deactivateMember(
  supabase: SupabaseClient,
  agencyId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("agency_memberships")
    .update({ is_active: false })
    .eq("agency_id", agencyId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAgencyInvites(
  supabase: SupabaseClient,
  agencyId: string
): Promise<InviteDto[]> {
  const { data, error } = await supabase
    .from("agency_invites")
    .select("id, agency_id, email, role, expires_at, accepted_at")
    .eq("agency_id", agencyId)
    .is("accepted_at", null)
    .order("expires_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(mapInvite);
}

export async function getUserMembership(
  supabase: SupabaseClient,
  agencyId: string,
  userId: string
): Promise<MembershipDto | null> {
  const { data, error } = await supabase
    .from("agency_memberships")
    .select("id, agency_id, user_id, role, is_active, joined_at, profiles(full_name, phone)")
    .eq("agency_id", agencyId)
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  return mapMembership(data as unknown as Record<string, unknown>);
}
