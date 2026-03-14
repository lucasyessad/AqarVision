import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ---------------------------------------------------------------------------
// Stripe signature verification (manual HMAC for Deno)
// ---------------------------------------------------------------------------

async function verifyStripeSignature(
  payload: string,
  sigHeader: string
): Promise<boolean> {
  const parts = sigHeader.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
  const signature = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!timestamp || !signature) return false;

  // Reject if timestamp is older than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (now - parseInt(timestamp, 10) > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSig === signature;
}

// ---------------------------------------------------------------------------
// Idempotence check via domain_events
// ---------------------------------------------------------------------------

async function isEventProcessed(
  supabase: ReturnType<typeof createClient>,
  eventId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("domain_events")
    .select("id")
    .eq("aggregate_id", eventId)
    .eq("event_type", "stripe_webhook")
    .limit(1)
    .maybeSingle();

  return !!data;
}

async function markEventProcessed(
  supabase: ReturnType<typeof createClient>,
  eventId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  await supabase.from("domain_events").insert({
    event_type: "stripe_webhook",
    aggregate_type: "stripe_event",
    aggregate_id: eventId,
    payload: { stripe_event_type: eventType, ...payload },
  });
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  session: Record<string, unknown>
): Promise<void> {
  const agencyId = (session.metadata as Record<string, string>)?.agency_id;
  const planId = (session.metadata as Record<string, string>)?.plan_id;
  const stripeSubscriptionId = session.subscription as string;

  if (!agencyId || !planId || !stripeSubscriptionId) return;

  // Check if subscription already exists
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  if (existing) return;

  await supabase.from("subscriptions").insert({
    agency_id: agencyId,
    plan_id: planId,
    stripe_subscription_id: stripeSubscriptionId,
    status: "active",
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
  });

  // Sync entitlements
  await syncEntitlementsFromPlan(supabase, agencyId, planId);
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createClient>,
  subscription: Record<string, unknown>
): Promise<void> {
  const stripeSubId = subscription.id as string;
  const status = subscription.status as string;
  const currentPeriodStart = subscription.current_period_start as number;
  const currentPeriodEnd = subscription.current_period_end as number;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end as boolean;

  // Map Stripe status to our enum
  const statusMap: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "canceled",
    incomplete: "trialing",
    incomplete_expired: "canceled",
    paused: "past_due",
  };

  const mappedStatus = statusMap[status] ?? "canceled";

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id, agency_id, plan_id")
    .eq("stripe_subscription_id", stripeSubId)
    .maybeSingle();

  if (!sub) return;

  await supabase
    .from("subscriptions")
    .update({
      status: mappedStatus,
      current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
      current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
      cancel_at_period_end: cancelAtPeriodEnd ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.id);

  // Re-sync entitlements
  if (mappedStatus === "active" || mappedStatus === "trialing") {
    await syncEntitlementsFromPlan(
      supabase,
      sub.agency_id as string,
      sub.plan_id as string
    );
  }
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createClient>,
  subscription: Record<string, unknown>
): Promise<void> {
  const stripeSubId = subscription.id as string;

  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubId);
}

async function syncEntitlementsFromPlan(
  supabase: ReturnType<typeof createClient>,
  agencyId: string,
  planId: string
): Promise<void> {
  const { data: plan } = await supabase
    .from("plans")
    .select("max_listings, max_ai_jobs, max_media_per_listing, max_team_members, features")
    .eq("id", planId)
    .single();

  if (!plan) return;

  const entitlements = [
    { agency_id: agencyId, feature_key: "max_listings", is_enabled: true, metadata: { limit: plan.max_listings } },
    { agency_id: agencyId, feature_key: "max_ai_jobs", is_enabled: true, metadata: { limit: plan.max_ai_jobs } },
    { agency_id: agencyId, feature_key: "max_media_per_listing", is_enabled: true, metadata: { limit: plan.max_media_per_listing } },
    { agency_id: agencyId, feature_key: "max_team_members", is_enabled: true, metadata: { limit: plan.max_team_members } },
  ];

  const features = (plan.features ?? {}) as Record<string, boolean>;
  for (const [key, enabled] of Object.entries(features)) {
    entitlements.push({
      agency_id: agencyId,
      feature_key: key,
      is_enabled: enabled,
      metadata: {},
    });
  }

  await supabase
    .from("entitlements")
    .upsert(entitlements, { onConflict: "agency_id,feature_key" });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const sigHeader = req.headers.get("stripe-signature");

  if (!sigHeader) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const valid = await verifyStripeSignature(body, sigHeader);
  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body) as {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
  };

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Idempotence check
  if (await isEventProcessed(supabase, event.id)) {
    return new Response(JSON.stringify({ received: true, skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(supabase, event.data.object);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(supabase, event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, event.data.object);
        break;

      default:
        // Unhandled event type — acknowledge silently
        break;
    }

    await markEventProcessed(supabase, event.id, event.type, {
      object_id: event.data.object.id,
    });

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
