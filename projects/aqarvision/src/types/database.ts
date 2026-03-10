// =============================================================================
// AqarVision - Database Types
// =============================================================================

// === Enums ===

export type HeroStyle = 'color' | 'cover' | 'video';
export type FontStyle = 'modern' | 'classic' | 'elegant';
export type ThemeMode = 'light' | 'dark';
export type AgencyLocale = 'fr' | 'ar';
export type AgencyPlan = 'starter' | 'pro' | 'enterprise';
export type MemberRole = 'admin' | 'agent' | 'viewer';
export type TransactionType = 'sale' | 'rent';
export type PropertyStatus = 'draft' | 'active' | 'sold' | 'rented' | 'archived';
export type LeadSource = 'contact_form' | 'property_detail' | 'whatsapp' | 'phone' | 'walk_in' | 'referral';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiation' | 'converted' | 'lost';
export type LeadPriority = 'low' | 'normal' | 'high' | 'urgent';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
export type PaymentMethod = 'ccp' | 'baridi_mob' | 'virement' | 'cash' | 'dahabia';
export type MediaCategory = 'property' | 'branding' | 'avatar' | 'document';
export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok';

export type NotificationType =
  | 'new_lead' | 'lead_assigned' | 'lead_status_change'
  | 'subscription_expiring' | 'subscription_expired' | 'subscription_renewed'
  | 'property_published' | 'property_view_milestone'
  | 'member_invited' | 'member_joined'
  | 'system';

export type AnalyticsEventType =
  | 'page_view' | 'property_click' | 'contact_click' | 'phone_click'
  | 'whatsapp_click' | 'share_click' | 'map_click' | 'gallery_view'
  | 'search' | 'filter_change' | 'lead_submit';

// === Tables ===

export interface Agency {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  wilaya: string | null;
  slogan: string | null;
  registre_commerce: string | null;
  active_plan: AgencyPlan;
  locale: AgencyLocale;
  custom_domain: string | null;

  // Geolocation
  latitude: number | null;
  longitude: number | null;

  // Social Media
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;

  // Luxury Branding (Enterprise)
  secondary_color: string | null;
  hero_video_url: string | null;
  hero_style: HeroStyle;
  font_style: FontStyle;
  theme_mode: ThemeMode;
  tagline: string | null;
  stats_years: number | null;
  stats_properties_sold: number | null;
  stats_clients: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface AgencyMember {
  id: string;
  agency_id: string;
  user_id: string;
  role: MemberRole;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  is_active: boolean;
  invited_at: string;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  agency_id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  price: number;
  surface: number | null;
  rooms: number | null;
  bathrooms: number | null;
  type: string;
  transaction_type: TransactionType;
  status: PropertyStatus;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  images: string[];
  features: string[];
  latitude: number | null;
  longitude: number | null;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface Lead {
  id: string;
  agency_id: string;
  property_id: string | null;
  assigned_to: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  budget_min: number | null;
  budget_max: number | null;
  desired_wilaya: string | null;
  desired_type: string | null;
  created_at: string;
  updated_at: string;
  contacted_at: string | null;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface PropertyView {
  id: string;
  property_id: string;
  agency_id: string;
  viewer_id: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  referrer: string | null;
  viewed_at: string;
}

export interface AnalyticsEvent {
  id: string;
  agency_id: string;
  event_type: AnalyticsEventType;
  event_data: Record<string, unknown>;
  page_url: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  referrer: string | null;
  session_id: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  agency_id: string;
  plan: AgencyPlan;
  status: SubscriptionStatus;
  price_dzd: number;
  billing_cycle: BillingCycle;
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  starts_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  agency_id: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Media {
  id: string;
  agency_id: string;
  uploaded_by: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  category: MediaCategory;
  public_url: string;
  created_at: string;
}

// === Social Feed Types (non-DB, API-driven) ===

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  permalink: string;
  caption: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | 'carousel';
  thumbnail_url: string | null;
  timestamp: string;
  likes_count: number | null;
  comments_count: number | null;
}

export interface SocialFeedConfig {
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  instagram_access_token?: string;
  facebook_access_token?: string;
  tiktok_access_token?: string;
}
