/**
 * Agency subdomain URL helper.
 *
 * Uses NEXT_PUBLIC_SITE_URL to derive the base domain dynamically.
 * No hardcoded domain — works in dev (localhost) and any prod domain.
 */

/**
 * Get the configured base domain from env or fallback to current host.
 * NEXT_PUBLIC_SITE_URL = "http://localhost:3000" → "localhost:3000"
 * NEXT_PUBLIC_SITE_URL = "https://aqarvision.dz" → "aqarvision.dz"
 */
function getConfiguredBaseDomain(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      return new URL(siteUrl).host;
    } catch {
      // fallback
    }
  }
  return "localhost:3000";
}

/**
 * Extract the base domain from a host string.
 * "immobiliere-el-djazair.localhost:3000" → "localhost:3000"
 * "immobiliere-el-djazair.example.com" → "example.com"
 * "localhost:3000" → "localhost:3000"
 */
function getBaseDomain(host: string): string {
  const hostWithoutPort = host.split(":")[0]!;
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";

  if (hostWithoutPort === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort)) {
    return host;
  }

  const parts = hostWithoutPort.split(".");
  if (parts.length <= 2) return host;
  return parts.slice(-2).join(".") + port;
}

/**
 * Extract subdomain from a host string. Returns null if no subdomain.
 * "immobiliere-el-djazair.localhost:3000" → "immobiliere-el-djazair"
 * "slug.example.com" → "slug"
 * "www.example.com" → null (www is ignored)
 * "localhost:3000" → null
 */
export function extractAgencySubdomain(host: string): string | null {
  const hostWithoutPort = host.split(":")[0]!;

  if (hostWithoutPort === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort)) {
    return null;
  }

  const parts = hostWithoutPort.split(".");

  // "slug.localhost" → subdomain = slug
  if (parts.length === 2 && parts[1] === "localhost") {
    const sub = parts[0]!;
    if (sub === "www") return null;
    return sub;
  }

  // "slug.example.com" → subdomain = slug
  if (parts.length >= 3) {
    const sub = parts[0]!;
    if (sub === "www") return null;
    return sub;
  }

  return null;
}

/**
 * Build an agency vitrine URL (absolute) for linking from the main site.
 * Works on both client and server — no hardcoded domains.
 */
export function getAgencyUrl(slug: string, currentHost?: string): string {
  // Client-side: use current host to derive base domain
  if (typeof window !== "undefined") {
    const host = window.location.host;
    const protocol = window.location.protocol;
    const baseDomain = getBaseDomain(host);
    return `${protocol}//${slug}.${baseDomain}`;
  }

  // Server-side with host hint
  if (currentHost) {
    const protocol = currentHost.includes("localhost") ? "http" : "https";
    const baseDomain = getBaseDomain(currentHost);
    return `${protocol}://${slug}.${baseDomain}`;
  }

  // Fallback: use env config
  const baseDomain = getConfiguredBaseDomain();
  const protocol = baseDomain.includes("localhost") ? "http" : "https";
  return `${protocol}://${slug}.${baseDomain}`;
}

/**
 * Check if a given host is an agency subdomain (not the main site).
 */
export function isAgencySubdomain(host: string): boolean {
  return extractAgencySubdomain(host) !== null;
}
