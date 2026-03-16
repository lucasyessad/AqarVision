import type { ComponentType } from "react";
import type { AgencyThemeProps } from "./types";

/**
 * Theme component registry.
 * Maps theme IDs to their full-page React components.
 * Each component renders the entire agency vitrine (hero, about, listings, contact, footer).
 */

// Lazy imports for code splitting — only load the selected theme
const THEME_COMPONENTS: Record<string, () => Promise<{ default: ComponentType<AgencyThemeProps> }>> = {
  "luxe-noir": () => import("./LuxeNoir"),
  "mediterranee": () => import("./Mediterranee"),
  "neo-brutalist": () => import("./NeoBrutalist"),
  "marocain-contemporain": () => import("./MarocainContemporain"),
  "pastel-doux": () => import("./PastelDoux"),
  "corporate-navy": () => import("./CorporateNavy"),
  "editorial": () => import("./Editorial"),
  "art-deco": () => import("./ArtDeco"),
  "organique-eco": () => import("./OrganiqueEco"),
  "swiss-minimal": () => import("./SwissMinimal"),
};

/**
 * Get the theme component for a given theme ID.
 * Returns null if the theme doesn't have a custom component (falls back to default rendering).
 */
export function getThemeComponent(themeId: string): (() => Promise<{ default: ComponentType<AgencyThemeProps> }>) | null {
  return THEME_COMPONENTS[themeId] ?? null;
}

export const AVAILABLE_THEME_IDS = Object.keys(THEME_COMPONENTS);
