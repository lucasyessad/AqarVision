"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import {
  createCheckoutSession,
  createCustomerPortalSession,
} from "../services/billing.service";
import { redirect } from "next/navigation";

export async function createCheckoutAction(
  agencyId: string,
  planId: string
): Promise<ActionResult<{ url: string }>> {
  return withAgencyAuth(agencyId, "billing", "update", async () => {
    const supabase = await createClient();
    const url = await createCheckoutSession(agencyId, planId, supabase);
    return { url };
  });
}

export async function createPortalAction(
  agencyId: string
): Promise<ActionResult<{ url: string }>> {
  return withAgencyAuth(agencyId, "billing", "read", async () => {
    const supabase = await createClient();
    const url = await createCustomerPortalSession(agencyId, supabase);
    return { url };
  });
}

export async function getCurrentSubscription(agencyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*, plan:plans(*)")
    .eq("agency_id", agencyId)
    .in("status", ["active", "trialing"])
    .single();

  return data;
}
