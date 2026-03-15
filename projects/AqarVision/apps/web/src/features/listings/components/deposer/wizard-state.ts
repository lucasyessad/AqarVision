// Shared state type for the 7-step deposit wizard

export interface WizardState {
  // Step 1
  listing_type: "sale" | "rent" | "vacation" | "";
  property_type: string;

  // Step 2
  wilaya_code: string;
  wilaya_name: string;
  commune_id: number | null;
  commune_name: string;
  address_text: string;
  latitude: number | null;
  longitude: number | null;

  // Step 3
  current_price: string;
  surface_m2: string;
  floor: string;
  total_floors: string;
  year_built: string;

  // Step 4
  rooms: number;
  bathrooms: number;
  details: {
    has_elevator: boolean;
    has_parking: boolean;
    has_balcony: boolean;
    has_pool: boolean;
    has_garden: boolean;
    furnished: boolean;
    has_ac: boolean;
    has_heating: boolean;
    sea_view: boolean;
    has_terrace: boolean;
    has_cave: boolean;
    has_intercom: boolean;
    has_guardian: boolean;
    has_digicode: boolean;
    orientation: Array<"north" | "south" | "east" | "west">;
    condition?: "new" | "good" | "renovation" | "construction";
  };

  // Step 5
  title: string;
  description: string;

  // Step 6 — filled after draft creation
  draft_listing_id: string | null;
  draft_slug: string | null;

  // Step 7
  contact_phone: string;
  show_phone: boolean;
  accept_messages: boolean;
}

export const INITIAL_WIZARD_STATE: WizardState = {
  listing_type: "",
  property_type: "",
  wilaya_code: "",
  wilaya_name: "",
  commune_id: null,
  commune_name: "",
  address_text: "",
  latitude: null,
  longitude: null,
  current_price: "",
  surface_m2: "",
  floor: "",
  total_floors: "",
  year_built: "",
  rooms: 0,
  bathrooms: 0,
  details: {
    has_elevator: false,
    has_parking: false,
    has_balcony: false,
    has_pool: false,
    has_garden: false,
    furnished: false,
    has_ac: false,
    has_heating: false,
    sea_view: false,
    has_terrace: false,
    has_cave: false,
    has_intercom: false,
    has_guardian: false,
    has_digicode: false,
    orientation: [],
  },
  title: "",
  description: "",
  draft_listing_id: null,
  draft_slug: null,
  contact_phone: "",
  show_phone: true,
  accept_messages: true,
};

export const STEP_LABELS = [
  "Type",
  "Localisation",
  "Prix & Surface",
  "Détails",
  "Description",
  "Photos",
  "Récapitulatif",
] as const;
