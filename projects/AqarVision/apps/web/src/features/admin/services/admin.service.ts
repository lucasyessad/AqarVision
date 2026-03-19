import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ModerationItem,
  ModerationAction,
  ModerationFilters,
  AuditLogEntry,
  AuditLogFilters,
  VerificationRequest,
  VerificationAction,
  PlatformSetting,
  AdminAgency,
  AdminAgencyFilters,
  AdminUser,
  AdminUserFilters,
  AdminPayment,
  AdminPaymentFilters,
  Entitlement,
  PaginatedResult,
} from "../types/admin.types";

// ---------------------------------------------------------------------------
// Moderation
// ---------------------------------------------------------------------------

export async function getModerationQueue(
  supabase: SupabaseClient,
  filters: ModerationFilters = {}
): Promise<PaginatedResult<ModerationItem>> {
  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("listings")
    .select(
      `
      id, listing_type, property_type, status, owner_type, price, currency,
      wilaya_code, address, created_at, user_id, agency_id, details,
      translations:listing_translations(locale, title, description, slug),
      media:listing_media(id, storage_path, position, is_cover),
      documents:listing_documents(id, document_type, storage_path, is_public),
      agency:agencies(name, slug),
      profile:profiles!listings_user_id_fkey(first_name, last_name)
    `,
      { count: "exact" }
    )
    .eq("status", "pending_review")
    .order("created_at", { ascending: true })
    .range(from, to);

  if (filters.listing_type) {
    query = query.eq("listing_type", filters.listing_type);
  }
  if (filters.wilaya_code) {
    query = query.eq("wilaya_code", filters.wilaya_code);
  }
  if (filters.owner_type) {
    query = query.eq("owner_type", filters.owner_type);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as unknown as ModerationItem[],
    total: count ?? 0,
    page,
    per_page: perPage,
  };
}

export async function moderateListing(
  supabase: SupabaseClient,
  listingId: string,
  action: ModerationAction,
  reason: string | null,
  moderatorId: string
): Promise<void> {
  const statusMap: Record<ModerationAction, string> = {
    approved: "published",
    rejected: "rejected",
    hidden: "paused",
  };

  const { error: updateError } = await supabase
    .from("listings")
    .update({
      status: statusMap[action],
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId);

  if (updateError) throw updateError;

  const { error: historyError } = await supabase
    .from("listing_moderation_history")
    .insert({
      listing_id: listingId,
      action,
      reason,
      moderator_id: moderatorId,
    });

  if (historyError) throw historyError;

  // Audit log
  await supabase.from("audit_logs").insert({
    action: `listing.${action}`,
    actor_id: moderatorId,
    target_type: "listing",
    target_id: listingId,
    metadata: { reason },
  });
}

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------

export async function getAuditLogs(
  supabase: SupabaseClient,
  filters: AuditLogFilters = {}
): Promise<PaginatedResult<AuditLogEntry>> {
  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 30;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("audit_logs")
    .select(
      `
      id, action, actor_id, target_type, target_id, metadata, created_at,
      actor:profiles!audit_logs_actor_id_fkey(first_name, last_name, avatar_url)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.action) {
    query = query.ilike("action", `%${filters.action}%`);
  }
  if (filters.from) {
    query = query.gte("created_at", filters.from);
  }
  if (filters.to) {
    query = query.lte("created_at", filters.to);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as unknown as AuditLogEntry[],
    total: count ?? 0,
    page,
    per_page: perPage,
  };
}

// ---------------------------------------------------------------------------
// Verifications
// ---------------------------------------------------------------------------

export async function getVerificationRequests(
  supabase: SupabaseClient
): Promise<VerificationRequest[]> {
  const { data, error } = await supabase
    .from("verifications")
    .select(
      `
      id, agency_id, level, type, status, legal_name, rc_number,
      rc_document_url, nif_number, address_proof_url, created_at, expires_at,
      agency:agencies(name, slug, logo_url)
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as VerificationRequest[];
}

export async function reviewVerification(
  supabase: SupabaseClient,
  verificationId: string,
  action: VerificationAction,
  level: number | undefined,
  reason: string | undefined,
  reviewerId: string
): Promise<void> {
  if (action === "approve") {
    const { error } = await supabase
      .from("verifications")
      .update({
        status: "approved",
        level: level ?? 1,
        expires_at: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
      .eq("id", verificationId);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("verifications")
      .update({ status: "rejected" })
      .eq("id", verificationId);

    if (error) throw error;
  }

  await supabase.from("audit_logs").insert({
    action: `verification.${action}`,
    actor_id: reviewerId,
    target_type: "verification",
    target_id: verificationId,
    metadata: { level, reason },
  });
}

// ---------------------------------------------------------------------------
// Platform Settings
// ---------------------------------------------------------------------------

export async function getPlatformSettings(
  supabase: SupabaseClient
): Promise<PlatformSetting[]> {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("key, value, updated_at")
    .order("key", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PlatformSetting[];
}

export async function updatePlatformSetting(
  supabase: SupabaseClient,
  key: string,
  value: string
): Promise<void> {
  const { error } = await supabase
    .from("platform_settings")
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Agencies
// ---------------------------------------------------------------------------

export async function getAgencies(
  supabase: SupabaseClient,
  filters: AdminAgencyFilters = {}
): Promise<PaginatedResult<AdminAgency>> {
  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("agencies")
    .select(
      `
      id, name, slug, logo_url, verification_status, created_at
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`
    );
  }
  if (filters.verification_status) {
    query = query.eq("verification_status", filters.verification_status);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  // Enrich with plan + listings count + verification level
  const agencies: AdminAgency[] = await Promise.all(
    (data ?? []).map(async (agency: Record<string, unknown>) => {
      const agencyId = agency.id as string;

      const { count: listingsCount } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("agency_id", agencyId);

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plans(name)")
        .eq("agency_id", agencyId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      const { data: verification } = await supabase
        .from("verifications")
        .select("level")
        .eq("agency_id", agencyId)
        .eq("status", "approved")
        .order("level", { ascending: false })
        .limit(1)
        .maybeSingle();

      const plan = sub?.plans as unknown as { name: string } | null;

      return {
        id: agencyId,
        name: agency.name as string,
        slug: agency.slug as string,
        logo_url: agency.logo_url as string | null,
        verification_status: agency.verification_status as string,
        created_at: agency.created_at as string,
        plan_name: plan?.name ?? null,
        listings_count: listingsCount ?? 0,
        verified_level: verification?.level ?? 0,
      };
    })
  );

  return {
    data: agencies,
    total: count ?? 0,
    page,
    per_page: perPage,
  };
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUsers(
  supabase: SupabaseClient,
  filters: AdminUserFilters = {}
): Promise<PaginatedResult<AdminUser>> {
  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 30;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("profiles")
    .select(
      `
      id, first_name, last_name, email, phone, avatar_url, role, created_at
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }
  if (filters.role) {
    query = query.eq("role", filters.role);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const users: AdminUser[] = await Promise.all(
    (data ?? []).map(async (user: Record<string, unknown>) => {
      const userId = user.id as string;

      const { count: agenciesCount } = await supabase
        .from("agency_memberships")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      return {
        id: userId,
        first_name: user.first_name as string,
        last_name: user.last_name as string,
        email: user.email as string,
        phone: (user.phone as string) ?? null,
        avatar_url: (user.avatar_url as string) ?? null,
        role: user.role as string,
        created_at: user.created_at as string,
        agencies_count: agenciesCount ?? 0,
      };
    })
  );

  return {
    data: users,
    total: count ?? 0,
    page,
    per_page: perPage,
  };
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export async function getPayments(
  supabase: SupabaseClient,
  filters: AdminPaymentFilters = {}
): Promise<PaginatedResult<AdminPayment>> {
  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("individual_payments")
    .select(
      `
      id, user_id, amount, currency, provider, payment_status,
      pack_type, subscription_type, transaction_id, receipt_url, created_at,
      user:profiles!individual_payments_user_id_fkey(first_name, last_name, email)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status) {
    query = query.eq("payment_status", filters.status);
  }
  if (filters.provider) {
    query = query.eq("provider", filters.provider);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as unknown as AdminPayment[],
    total: count ?? 0,
    page,
    per_page: perPage,
  };
}

export async function approvePayment(
  supabase: SupabaseClient,
  paymentId: string,
  adminId: string
): Promise<void> {
  const { error } = await supabase
    .from("individual_payments")
    .update({
      payment_status: "verified",
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) throw error;

  await supabase.from("audit_logs").insert({
    action: "payment.approved",
    actor_id: adminId,
    target_type: "individual_payment",
    target_id: paymentId,
    metadata: {},
  });
}

// ---------------------------------------------------------------------------
// Entitlements
// ---------------------------------------------------------------------------

export async function getEntitlements(
  supabase: SupabaseClient,
  agencyId: string
): Promise<Entitlement[]> {
  const { data, error } = await supabase
    .from("entitlements")
    .select("*")
    .eq("agency_id", agencyId)
    .order("feature_key", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Entitlement[];
}

export async function setEntitlement(
  supabase: SupabaseClient,
  agencyId: string,
  featureKey: string,
  enabled: boolean,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const { error } = await supabase
    .from("entitlements")
    .upsert(
      {
        agency_id: agencyId,
        feature_key: featureKey,
        enabled,
        metadata,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "agency_id,feature_key" }
    );

  if (error) throw error;
}
