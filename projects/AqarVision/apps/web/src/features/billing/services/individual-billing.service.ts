import type { SupabaseClient } from "@supabase/supabase-js";
import {
  FREE_LISTING_QUOTA,
  getPack,
  getIndividualPlan,
} from "../config/individual-plans";
import {
  isStripeActive,
  getActiveProvider,
  getActiveProviderConfig,
  getPaymentAccountDetails,
  type PaymentProvider,
} from "../config/payment-providers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IndividualCheckoutResult {
  /** Redirect URL (Stripe) or undefined (manual providers) */
  checkout_url?: string;
  provider: PaymentProvider;
  /** Shown to user when provider is manual */
  instructions?: string;
  /** Payment account details for manual providers */
  account_details?: ReturnType<typeof getPaymentAccountDetails>;
  /** Amount in DZD (informational, for manual providers) */
  amount_da?: string;
}

// ---------------------------------------------------------------------------
// Stripe lazy init
// ---------------------------------------------------------------------------

let _stripe: import("stripe").default | null = null;
function getStripe() {
  if (!_stripe) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require("stripe");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe!;
}

// ---------------------------------------------------------------------------
// Stripe customer (individual)
// ---------------------------------------------------------------------------

export async function createOrRetrieveStripeCustomerForUser(
  supabase: SupabaseClient,
  userId: string,
  email: string
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (profile?.stripe_customer_id) return profile.stripe_customer_id as string;

  // Search by email first to avoid duplicates
  const customers = await getStripe().customers.list({ email, limit: 1 });
  let customerId: string;

  if (customers.data.length > 0) {
    customerId = customers.data[0]!.id;
  } else {
    const customer = await getStripe().customers.create({
      email,
      metadata: { user_id: userId },
    });
    customerId = customer.id;
  }

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("user_id", userId);

  return customerId;
}

// ---------------------------------------------------------------------------
// One-time pack checkout
// ---------------------------------------------------------------------------

export async function startPackCheckout(
  supabase: SupabaseClient,
  userId: string,
  packSlug: string,
  email: string
): Promise<IndividualCheckoutResult> {
  const pack = getPack(packSlug);
  if (!pack) throw new Error("Pack introuvable");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (isStripeActive()) {
    if (!pack.stripe_price_id) {
      throw new Error("Pack sans Stripe price ID configuré");
    }

    const customerId = await createOrRetrieveStripeCustomerForUser(supabase, userId, email);
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      currency: "eur",
      line_items: [{ price: pack.stripe_price_id, quantity: 1 }],
      success_url: `${siteUrl}/espace/upgrade?checkout=success`,
      cancel_url: `${siteUrl}/espace/upgrade?checkout=cancel`,
      metadata: {
        user_id: userId,
        pack_slug: packSlug,
        extra_slots: String(pack.extra_slots),
        payment_type: "individual_pack",
      },
    });

    if (!session.url) throw new Error("Session Stripe non créée");
    return { checkout_url: session.url, provider: "stripe" };
  }

  // Manual provider (CIB, Dahabia, BaridiMob, virement)
  const providerConfig = getActiveProviderConfig();

  // Create a pending pack record — activated manually by admin after payment validation
  await supabase.from("individual_listing_packs").insert({
    user_id: userId,
    pack_slug: packSlug,
    extra_slots: pack.extra_slots,
    stripe_session_id: null, // no Stripe
    payment_provider: getActiveProvider(),
    payment_status: "pending",
    amount_da: Math.round(pack.price_eur * 144), // approximate DZD rate
  });

  return {
    provider: getActiveProvider(),
    instructions: providerConfig.instructions,
    account_details: getPaymentAccountDetails(),
    amount_da: pack.price_da_display,
  };
}

// ---------------------------------------------------------------------------
// Individual subscription checkout
// ---------------------------------------------------------------------------

export async function startIndividualSubscriptionCheckout(
  supabase: SupabaseClient,
  userId: string,
  planSlug: string,
  email: string
): Promise<IndividualCheckoutResult> {
  const plan = getIndividualPlan(planSlug);
  if (!plan) throw new Error("Plan introuvable");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (isStripeActive()) {
    if (!plan.stripe_price_id) {
      throw new Error("Plan sans Stripe price ID configuré");
    }

    const customerId = await createOrRetrieveStripeCustomerForUser(supabase, userId, email);
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      currency: "eur",
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${siteUrl}/espace/upgrade?checkout=success`,
      cancel_url: `${siteUrl}/espace/upgrade?checkout=cancel`,
      metadata: {
        user_id: userId,
        plan_slug: planSlug,
        max_listings: String(plan.max_listings),
        payment_type: "individual_subscription",
      },
    });

    if (!session.url) throw new Error("Session Stripe non créée");
    return { checkout_url: session.url, provider: "stripe" };
  }

  // Manual provider
  const providerConfig = getActiveProviderConfig();

  // Create a pending subscription record — activated by admin after payment
  await supabase.from("individual_subscriptions").insert({
    user_id: userId,
    plan_slug: planSlug,
    stripe_subscription_id: null,
    status: "pending",
    max_listings: plan.max_listings,
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    payment_provider: getActiveProvider(),
  });

  return {
    provider: getActiveProvider(),
    instructions: providerConfig.instructions,
    account_details: getPaymentAccountDetails(),
    amount_da: plan.price_da_display,
  };
}

// ---------------------------------------------------------------------------
// Effective quota — MAX(free + packs, active_subscription)
// ---------------------------------------------------------------------------

export async function getEffectiveQuota(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const [packsResult, subResult] = await Promise.all([
    supabase
      .from("individual_listing_packs")
      .select("extra_slots")
      .eq("user_id", userId)
      .in("payment_status", ["confirmed", null as unknown as string]) // confirmed or legacy (no status col)
      .limit(100),
    supabase
      .from("individual_subscriptions")
      .select("max_listings")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const extraSlots = (packsResult.data ?? []).reduce(
    (sum, p) => sum + (p.extra_slots as number),
    0
  );
  const packQuota = FREE_LISTING_QUOTA + extraSlots;
  const subQuota = (subResult.data?.max_listings as number | undefined) ?? 0;

  return Math.max(packQuota, subQuota);
}
