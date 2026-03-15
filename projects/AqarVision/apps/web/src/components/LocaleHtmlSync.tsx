"use client";

import { useEffect } from "react";

export function LocaleHtmlSync({ locale, dir }: { locale: string; dir: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  // Also set immediately during SSR hydration via a script
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang="${locale}";document.documentElement.dir="${dir}";`,
      }}
    />
  );
}
