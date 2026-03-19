export interface Plan {
  id: string;
  name: string;
  slug: string;
  price_monthly_dzd: number;
  max_listings: number;
  max_photos_per_listing: number;
  max_team_members: number;
  stripe_price_id: string;
  features: string[];
}

export interface Subscription {
  id: string;
  agency_id: string;
  plan_id: string;
  plan: Plan;
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end: string | null;
}

export interface IndividualPack {
  id: string;
  user_id: string;
  pack_type: "pack_3" | "pack_7" | "pack_15";
  listings_remaining: number;
  purchased_at: string;
  expires_at: string;
}

export interface IndividualSubscription {
  id: string;
  user_id: string;
  plan_type: "chaab_plus" | "chaab_pro";
  status: string;
  current_period_end: string;
}
