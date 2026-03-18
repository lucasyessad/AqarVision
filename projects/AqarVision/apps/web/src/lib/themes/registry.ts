export interface AgencyTheme {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  fontFamily: string;
  layout: "classic" | "editorial" | "bold" | "minimal";
  darkMode: boolean;
}

export const AGENCY_THEMES: AgencyTheme[] = [
  {
    id: "luxe-noir",
    name: "LuxeNoir",
    description: "Élégance sombre et dorée pour les agences haut de gamme",
    primaryColor: "#1C1917",
    accentColor: "#FBBF24",
    secondaryColor: "#A8A29E",
    fontFamily: "serif",
    layout: "classic",
    darkMode: true,
  },
  {
    id: "mediterranee",
    name: "Méditerranée",
    description: "Bleu et blanc, inspiration côtière algérienne",
    primaryColor: "#1A7FA8",
    accentColor: "#FFFFFF",
    secondaryColor: "#F5F5F4",
    fontFamily: "sans-serif",
    layout: "classic",
    darkMode: true,
  },
  {
    id: "neo-brutalist",
    name: "NeoBrutalist",
    description: "Bold, brut, géométrique — impact maximal",
    primaryColor: "#0C0A09",
    accentColor: "#EF4444",
    secondaryColor: "#FBBF24",
    fontFamily: "sans-serif",
    layout: "bold",
    darkMode: false,
  },
  {
    id: "mediterraneen-contemporain",
    name: "MéditerranéenContemporain",
    description: "Méditerranée modernisée avec une touche contemporaine",
    primaryColor: "#0D9488",
    accentColor: "#E8920A",
    secondaryColor: "#F5F5F4",
    fontFamily: "sans-serif",
    layout: "classic",
    darkMode: true,
  },
  {
    id: "pastel-doux",
    name: "PastelDoux",
    description: "Couleurs douces et accueillantes, ambiance chaleureuse",
    primaryColor: "#F9A8D4",
    accentColor: "#A78BFA",
    secondaryColor: "#FDE68A",
    fontFamily: "sans-serif",
    layout: "classic",
    darkMode: true,
  },
  {
    id: "corporate-navy",
    name: "CorporateNavy",
    description: "Professionnel et sérieux, bleu marine corporate",
    primaryColor: "#1E3A5F",
    accentColor: "#3B82F6",
    secondaryColor: "#F8FAFC",
    fontFamily: "sans-serif",
    layout: "classic",
    darkMode: true,
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Style magazine, typographie forte, espaces généreux",
    primaryColor: "#0C0A09",
    accentColor: "#0D9488",
    secondaryColor: "#F5F5F4",
    fontFamily: "serif",
    layout: "editorial",
    darkMode: true,
  },
  {
    id: "art-deco",
    name: "ArtDeco",
    description: "Géométrie Art Déco, or et noir, sophistication",
    primaryColor: "#1C1917",
    accentColor: "#D4AF37",
    secondaryColor: "#292524",
    fontFamily: "serif",
    layout: "classic",
    darkMode: true,
  },
  {
    id: "organique-eco",
    name: "OrganiqueEco",
    description: "Nature, durabilité, tons terreux et verts",
    primaryColor: "#2A8A4A",
    accentColor: "#E8920A",
    secondaryColor: "#F5F5F4",
    fontFamily: "sans-serif",
    layout: "classic",
    darkMode: true,
  },
  {
    id: "swiss-minimal",
    name: "SwissMinimal",
    description: "Minimalisme suisse, grille stricte, typographie nette",
    primaryColor: "#0C0A09",
    accentColor: "#EF4444",
    secondaryColor: "#FFFFFF",
    fontFamily: "sans-serif",
    layout: "minimal",
    darkMode: true,
  },
];

export function getThemeById(id: string): AgencyTheme | undefined {
  return AGENCY_THEMES.find((t) => t.id === id);
}
