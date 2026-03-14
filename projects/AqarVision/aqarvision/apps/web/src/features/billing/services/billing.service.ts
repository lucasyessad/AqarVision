import type { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import type { PlanDto, SubscriptionDto, CheckoutResult, PortalResult } from "../types/billing.types";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export async function getPlans(supabase: SupabaseClient): Promise<PlanDto[]> {
  const { data, error } = await supabase
    .from("plans")
    .select("id, slug, name, price_monthly, max_listings, max_ai_jobs, stripe_price_id")
    .eq("is_active", true)
    .order("price_monthly", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => ({
    id: p.id as string,
    code: p.slug as string,
    name: p.name as string,
    price_eur: Number(p.price_monthly),
    max_listings: p.max_listings as number,
    max_ai_jobs: p.max_ai_jobs as number,
    stripe_price_id: (p.stripe_price_id as string) ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export async function getAgencySubscription(
  supabase: SupabaseClient,
  agencyId: string
): Promise<SubscriptionDto | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      id,
      agency_id,
      status,
      current_period_start,
      current_period_end,
      plan:plans(id, slug, name, price_monthly, max_listings, max_ai_jobs, stripe_price_id)
    `)
    .eq("agency_id", agencyId)
    .in("status", ["active", "trialing", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || !data.plan) return null;

  const plan = data.plan as unknown as Record<string, unknown>;

  return {
    id: data.id as string,
    agency_id: data.agency_id as string,
    plan: {
      id: plan.id as string,
      code: plan.slug as string,
      name: plan.name as string,
      price_eur: Number(plan.price_monthly),
      max_listings: plan.max_listings as number,
      max_ai_jobs: plan.max_ai_jobs as number,
      stripe_price_id: (plan.stripe_price_id as string) ?? null,
    },
    status: data.status as string,
    current_period_start: data.current_period_start as string,
    current_period_end: data.current_period_end as string,
  };
}

// ---------------------------------------------------------------------------
// Stripe Customer (idempotent)
// ---------------------------------------------------------------------------

export async function createOrRetrieveStripeCustomer(
  supabase: SupabaseClient,
  agencyId: string,
  email: string
): Promise<string> {
  // 1. Check Supabase for existing mapping
  const { data: existing } = await supabase
    .from("agencies")
    .select("stripe_customer_id")
    .eq("id", agencyId)
    .single();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id as string;
  }

  // 2. Search Stripe by metadata
  const customers = await getStripe().customers.list({
    email,
    limit: 1,
  });

  let customerId: string;

  if (customers.data.length > 0) {
    customerId = customers.data[0]!.id;
  } else {
    // 3. Create in Stripe
    const customer = await getStripe().customers.create({
      email,
      metadata: { agency_id: agencyId },
    });
    customerId = customer.id;
  }

  // 4. Sync to DB
  await supabase
    .from("agencies")
    .update({ stripe_customer_id: customerId })
    .eq("id", agencyId);

  return customerId;
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export async function startCheckout(
  supabase: SupabaseClient,
  agencyId: string,
  planCode: string,
  email: string
): Promise<CheckoutResult> {
  const plans = await getPlans(supabase);
  const plan = plans.find((p) => p.code === planCode);

  if (!plan) throw new Error("Plan not found");
  if (!plan.stripe_price_id) throw new Error("Plan has no Stripe price configured");

  const customerId = await createOrRetrieveStripeCustomer(supabase, agencyId, email);

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    currency: "eur",
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?checkout=cancel`,
    metadata: { agency_id: agencyId, plan_id: plan.id },
  });

  if (!session.url) throw new Error("Failed to create checkout session");

  return { checkout_url: session.url };
}

// ---------------------------------------------------------------------------
// Billing Portal
// ---------------------------------------------------------------------------

export async function openBillingPortal(
  supabase: SupabaseClient,
  agencyId: string,
  email: string
): Promise<PortalResult> {
  const customerId = await createOrRetrieveStripeCustomer(supabase, agencyId, email);

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
  });

  return { portal_url: session.url };
}

// ---------------------------------------------------------------------------
// Entitlements Sync
// ---------------------------------------------------------------------------

export async function syncEntitlements(
  supabase: SupabaseClient,
  agencyId: string,
  planId: string
): Promise<void> {
  const { data: plan } = await supabase
    .from("plans")
    .select("max_listings, max_ai_jobs, max_media_per_listing, max_team_members, features")
    .eq("id", planId)
    .single();

  if (!plan) throw new Error("Plan not found");

  const entitlements: Array<{ agency_id: string; feature_key: string; is_enabled: boolean; metadata: Record<string, unknown> }> = [
    {
      agency_id: agencyId,
      feature_key: "max_listings",
      is_enabled: true,
      metadata: { limit: plan.max_listings },
    },
    {
      agency_id: agencyId,
      feature_key: "max_ai_jobs",
      is_enabled: true,
      metadata: { limit: plan.max_ai_jobs },
    },
    {
      agency_id: agencyId,
      feature_key: "max_media_per_listing",
      is_enabled: true,
      metadata: { limit: plan.max_media_per_listing },
    },
    {
      agency_id: agencyId,
      feature_key: "max_team_members",
      is_enabled: true,
      metadata: { limit: plan.max_team_members },
    },
  ];

  // Add feature flags from plan.features JSON
  const features = (plan.features ?? {}) as Record<string, boolean>;
  for (const [key, enabled] of Object.entries(features)) {
    entitlements.push({
      agency_id: agencyId,
      feature_key: key,
      is_enabled: enabled,
      metadata: {},
    });
  }

  // Upsert entitlements
  const { error } = await supabase
    .from("entitlements")
    .upsert(entitlements, { onConflict: "agency_id,feature_key" });

  if (error) throw new Error(error.message);
}
