"use client";

import { lazy, Suspense } from "react";
import type { AgencyThemeProps } from "./types";
import type { ComponentType } from "react";

const THEME_MAP: Record<string, ComponentType<AgencyThemeProps>> = {};

// Lazy load theme components
const loaders: Record<string, () => Promise<{ default: ComponentType<AgencyThemeProps> }>> = {
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

// Create lazy components once
const lazyComponents: Record<string, ReturnType<typeof lazy>> = {};
for (const [id, loader] of Object.entries(loaders)) {
  lazyComponents[id] = lazy(loader);
}

interface ThemeLoaderProps extends AgencyThemeProps {
  themeId: string;
}

export function ThemeLoader({ themeId, ...props }: ThemeLoaderProps) {
  const LazyTheme = lazyComponents[themeId];

  if (!LazyTheme) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <LazyTheme {...props} />
    </Suspense>
  );
}
