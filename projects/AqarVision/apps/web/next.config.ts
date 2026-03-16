import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["maplibre-gl", "@aqarvision/config", "@aqarvision/domain", "@aqarvision/security"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
};

const intlConfig = withNextIntl(nextConfig);

// Only wrap with Sentry when a DSN is configured to avoid broken import
// errors from version mismatches (@sentry/core v10 vs @sentry/nextjs v8).
let finalConfig = intlConfig;

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withSentryConfig } = require("@sentry/nextjs");
    finalConfig = withSentryConfig(intlConfig, {
      silent: true,
      org: "aqarvision",
      project: "web",
    });
  } catch {
    console.warn("⚠ Sentry SDK failed to load — running without Sentry.");
  }
}

export default finalConfig;
