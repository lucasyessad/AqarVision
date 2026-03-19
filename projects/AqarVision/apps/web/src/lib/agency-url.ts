import type { Locale } from "@/lib/i18n/routing";

export function getAgencyUrl(slug: string, locale: Locale): string {
  if (process.env.NODE_ENV === "production") {
    return `https://${slug}.aqarvision.com/${locale}`;
  }
  return `/${locale}/a/${slug}`;
}

export function extractAgencySubdomain(hostname: string): string | null {
  const baseDomain = "aqarvision.com";
  if (!hostname.endsWith(baseDomain)) return null;

  const subdomain = hostname.replace(`.${baseDomain}`, "");
  if (subdomain === hostname || subdomain === "www") return null;

  return subdomain;
}
