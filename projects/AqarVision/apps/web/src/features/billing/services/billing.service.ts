import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripe;
}

export async function createCheckoutSession(
  agencyId: string,
  planId: string,
  supabase: SupabaseClient
): Promise<string> {
  const { data: agency } = await supabase
    .from("agencies")
    .select("stripe_customer_id, email, name")
    .eq("id", agencyId)
    .single();

  if (!agency) throw new Error("Agency not found");

  const { data: plan } = await supabase
    .from("plans")
    .select("stripe_price_id, name")
    .eq("id", planId)
    .single();

  if (!plan?.stripe_price_id) throw new Error("Plan not found");

  let customerId = agency.stripe_customer_id;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: agency.email,
      name: agency.name,
      metadata: { agency_id: agencyId },
    });
    customerId = customer.id;

    await supabase
      .from("agencies")
      .update({ stripe_customer_id: customerId })
      .eq("id", agencyId);
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("supabase", "aqarvision")}/AqarPro/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("supabase", "aqarvision")}/AqarPro/dashboard/billing?canceled=true`,
    metadata: { agency_id: agencyId, plan_id: planId },
  });

  return session.url!;
}

export async function createCustomerPortalSession(
  agencyId: string,
  supabase: SupabaseClient
): Promise<string> {
  const { data: agency } = await supabase
    .from("agencies")
    .select("stripe_customer_id")
    .eq("id", agencyId)
    .single();

  if (!agency?.stripe_customer_id) {
    throw new Error("No Stripe customer found");
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: agency.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("supabase", "aqarvision")}/AqarPro/dashboard/billing`,
  });

  return session.url;
}

export async function getPlans(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("price_monthly_dzd", { ascending: true });

  if (error) throw error;
  return data;
}
