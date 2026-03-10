// === Luxury Branding Types ===

export type HeroStyle = 'color' | 'cover' | 'video';
export type FontStyle = 'modern' | 'classic' | 'elegant';
export type ThemeMode = 'light' | 'dark';

export type AgencyPlan = 'starter' | 'pro' | 'enterprise';

export interface Agency {
  id: string;
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
  created_at: string;
  updated_at: string;

  // === Luxury Branding Fields (Enterprise Only) ===
  secondary_color: string | null;
  hero_video_url: string | null;
  hero_style: HeroStyle;
  font_style: FontStyle;
  theme_mode: ThemeMode;
  tagline: string | null;
  stats_years: number | null;
  stats_properties_sold: number | null;
  stats_clients: number | null;
}

export interface Property {
  id: string;
  agency_id: string;
  title: string;
  description: string | null;
  price: number;
  surface: number | null;
  rooms: number | null;
  bathrooms: number | null;
  type: string;
  transaction_type: 'sale' | 'rent';
  wilaya: string | null;
  address: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

export type LeadSource = 'contact_form' | 'property_detail' | 'whatsapp';

export interface Lead {
  id: string;
  agency_id: string;
  property_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: LeadSource;
  created_at: string;
}
