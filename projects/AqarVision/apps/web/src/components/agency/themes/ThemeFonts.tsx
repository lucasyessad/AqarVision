"use client";

import { useEffect } from "react";

const FONT_MAP: Record<string, string> = {
  "luxe-noir": "Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500",
  "mediterranee": "DM+Serif+Display:ital@0;1&family=Jost:wght@300;400;500",
  "neo-brutalist": "Syne:wght@400;600;800&family=IBM+Plex+Mono:wght@300;400",
  "marocain-contemporain": "Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Work+Sans:wght@300;400;500",
  "pastel-doux": "Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400&family=Nunito:wght@300;400;600",
  "corporate-navy": "Source+Serif+4:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500",
  "editorial": "Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Hanken+Grotesk:wght@300;400;500",
  "art-deco": "Bodoni+Moda:ital,wght@0,400;0,700;1,400&family=Figtree:wght@300;400;500",
  "organique-eco": "Instrument+Serif&family=Instrument+Sans:wght@400;500",
  "swiss-minimal": "Manrope:wght@300;400;500;700",
};

export function ThemeFonts({ themeId }: { themeId: string }) {
  useEffect(() => {
    const fontParam = FONT_MAP[themeId];
    if (!fontParam) return;

    const id = `theme-font-${themeId}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
    document.head.appendChild(link);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [themeId]);

  return null;
}
