// =============================================================================
// AqarVision - Database Types
// =============================================================================

// === Enums ===

export type AgencyTheme = 'minimal' | 'modern' | 'professional' | 'editorial' | 'premium' | 'luxury' | 'bold' | 'custom';
export type HeroStyle = 'color' | 'cover' | 'video';
export type FontStyle = 'modern' | 'classic' | 'elegant';
export type ThemeMode = 'light' | 'dark';
export type BorderStyle = 'rounded' | 'square';
export type AgencyLocale = 'fr' | 'ar' | 'en';
export type AgencyPlan = 'starter' | 'pro' | 'enterprise';
export type MemberRole = 'admin' | 'agent' | 'viewer';
export type TransactionType = 'sale' | 'rent';
export type PropertyStatus = 'draft' | 'active' | 'sold' | 'rented' | 'archived';
export type LeadSource = 'contact_form' | 'property_detail' | 'whatsapp' | 'phone' | 'walk_in' | 'referral' | 'aqarsearch';
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
  | 'search' | 'filter_change' | 'lead_submit'
  | 'search_executed' | 'search_filter_change' | 'search_sort_change'
  | 'property_card_click' | 'property_favorite_add' | 'property_favorite_remove'
  | 'search_alert_create' | 'search_alert_disable';

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

  // Theme & Personnalisation
  theme: AgencyTheme;
  secondary_color: string | null;
  accent_color: string | null;
  font_style: FontStyle;
  theme_mode: ThemeMode;
  border_style: BorderStyle;

  // Geolocation
  latitude: number | null;
  longitude: number | null;

  // Social Media
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;

  // Hero & Contenu premium (Enterprise)
  hero_video_url: string | null;
  hero_style: HeroStyle;
  tagline: string | null;
  stats_years: number | null;
  stats_properties_sold: number | null;
  stats_clients: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface AgencyWilaya {
  id: string;
  agency_id: string;
  wilaya: string;
  address: string | null;
  is_headquarters: boolean;
  created_at: string;
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
  country: string;
  city: string | null;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  currency: string;
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
  desired_country: string | null;
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

// === AqarSearch Types ===

export type SearchAlertChannel = 'email' | 'in_app';
export type SearchAlertFrequency = 'instant' | 'daily' | 'weekly';
export type SearchSortOption = 'recent' | 'price_asc' | 'price_desc' | 'surface_asc' | 'surface_desc' | 'trust_desc';
export type TrustLevel = 'high' | 'medium' | 'low';
export type RecommendationSignalType = 'view' | 'favorite' | 'contact' | 'share' | 'search_click' | 'compare';
export type VisitRequestStatus = 'pending' | 'confirmed' | 'declined' | 'completed';
export type ResponsivenessLevel = 'fast' | 'moderate' | 'slow' | 'unrated';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  transaction_type: TransactionType | null;
  country: string | null;
  wilaya: string | null;
  commune: string | null;
  city: string | null;
  property_type: string | null;
  price_min: number | null;
  price_max: number | null;
  surface_min: number | null;
  surface_max: number | null;
  rooms_min: number | null;
  features: string[];
  keywords: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchAlert {
  id: string;
  saved_search_id: string;
  user_id: string;
  channel: SearchAlertChannel;
  frequency: SearchAlertFrequency;
  last_sent_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query_text: string | null;
  filters: Record<string, unknown>;
  created_at: string;
}

export interface PropertyTrustScore {
  id: string;
  property_id: string;
  score: number;
  price_consistency_score: number;
  description_quality_score: number;
  image_quality_score: number;
  agency_verification_score: number;
  location_consistency_score: number;
  flags: string[];
  updated_at: string;
}

// === Messaging Types ===

export type ConversationStatus = 'active' | 'archived' | 'blocked';

export interface Conversation {
  id: string;
  agency_id: string;
  user_id: string;
  property_id: string | null;
  subject: string | null;
  status: ConversationStatus;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface SearchPropertyResult {
  property_id: string;
  agency_id: string;
  agency_name: string;
  agency_slug: string;
  agency_plan: AgencyPlan;
  agency_logo_url: string | null;
  agency_phone: string | null;
  agency_email: string | null;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  transaction_type: TransactionType;
  type: string;
  surface: number | null;
  rooms: number | null;
  bathrooms: number | null;
  country: string;
  wilaya: string | null;
  commune: string | null;
  city: string | null;
  address: string | null;
  images: string[];
  features: string[];
  latitude: number | null;
  longitude: number | null;
  is_featured: boolean;
  views_count: number;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  images_count: number | null;
  has_location: boolean;
  has_description: boolean;
  has_features: boolean;
  trust_score: number;
  responsiveness_level: ResponsivenessLevel;
}

// === AqarSearch V2 Types ===

export interface ViewedProperty {
  id: string;
  user_id: string;
  property_id: string;
  viewed_at: string;
}

export interface PropertyNote {
  id: string;
  user_id: string;
  property_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface FavoriteCollection {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface FavoriteCollectionItem {
  id: string;
  collection_id: string;
  favorite_id: string;
  added_at: string;
}

export interface VisitRequest {
  id: string;
  property_id: string;
  agency_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: VisitRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface AgencyResponsivenessStats {
  agency_id: string;
  avg_response_time_minutes: number | null;
  response_rate: number | null;
  total_conversations: number;
  responsiveness_level: ResponsivenessLevel;
  updated_at: string;
}
