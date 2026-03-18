export interface StorefrontProps {
  agency: {
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    phone: string;
    email: string;
    whatsapp_phone: string | null;
    opening_hours: string | null;
    verification_level: number;
    branding: {
      primary_color: string;
      accent_color: string;
      secondary_color: string;
    } | null;
    storefront_content: {
      hero_image_url: string | null;
      hero_video_url: string | null;
      extra_photos: string[];
      tagline: string | null;
      about_text: string | null;
      services: { title: string; icon: string; text: string }[];
      custom_stats: { years_experience?: number; satisfied_clients?: number };
      theme_extras: Record<string, string>;
    } | null;
  };
  listings: Array<{
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    area_m2: number;
    rooms: number | null;
    cover_url: string | null;
    listing_type: string;
    wilaya_name: string;
  }>;
  stats: {
    total_listings: number;
    total_views: number;
    total_leads: number;
  };
}
