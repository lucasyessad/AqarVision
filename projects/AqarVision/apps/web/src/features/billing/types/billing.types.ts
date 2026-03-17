export interface PlanDto {
  id: string;
  code: string;
  name: string;
  price_eur: number;
  max_listings: number;
  stripe_price_id: string | null;
}

export interface SubscriptionDto {
  id: string;
  agency_id: string;
  plan: PlanDto;
  status: string;
  current_period_start: string;
  current_period_end: string;
}

export interface CheckoutResult {
  checkout_url: string;
}

export interface PortalResult {
  portal_url: string;
}

export type { ActionResult } from "@/types/action-result";
