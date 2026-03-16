import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/lib/i18n/routing";
import { LOCALES as SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale as SupportedLocale } from "@aqarvision/config";
import { extractAgencySubdomain } from "@/lib/agency-url";

const intlMiddleware = createIntlMiddleware(routing);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Public route patterns (no auth required)
const PUBLIC_PATTERNS = [
  /^\/[a-z]{2}\/?$/, // / or /fr, /ar, /en, /es
  /^\/[a-z]{2}\/auth(\/|$)/, // /[locale]/auth/*
  /^\/[a-z]{2}\/AqarPro\/auth(\/|$)/, // /[locale]/AqarPro/auth/*
  /^\/[a-z]{2}\/AqarChaab\/auth(\/|$)/, // /[locale]/AqarChaab/auth/*
  /^\/[a-z]{2}\/search(\/|$)/, // /[locale]/search/*
  /^\/[a-z]{2}\/l(\/|$)/, // /[locale]/l/* (legacy)
  /^\/[a-z]{2}\/annonce(\/|$)/, // /[locale]/annonce/*
  /^\/[a-z]{2}\/a(\/|$)/, // /[locale]/a/*
  /^\/[a-z]{2}\/agences(\/|$)/, // /[locale]/agences
  /^\/[a-z]{2}\/vendre(\/|$)/, // /[locale]/vendre
  /^\/[a-z]{2}\/pricing(\/|$)/, // /[locale]/pricing
  /^\/[a-z]{2}\/pro(\/|$)/, // /[locale]/pro
  /^\/[a-z]{2}\/estimer(\/|$)/, // /[locale]/estimer
  /^\/[a-z]{2}\/comparer(\/|$)/, // /[locale]/comparer
  /^\/$/, // bare root
];

// Routes exempt from CSRF validation (external webhooks)
const CSRF_EXEMPT_PREFIXES = ["/api/webhooks/stripe", "/api/whatsapp/webhook"];

// Mutative HTTP methods that require CSRF validation
const CSRF_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

// Static asset extensions — security headers are skipped for these
const STATIC_ASSET_PATTERN =
  /\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|css|js|map)$/i;

// Security headers applied to every non-asset response
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.maptiler.com https://*.openstreetmap.org",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "frame-ancestors 'self'",
  ].join("; "),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PATTERNS.some((pattern) => pattern.test(pathname));
}

function extractLocale(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
  return match?.[1] ?? routing.defaultLocale;
}

function isStaticAsset(pathname: string): boolean {
  return STATIC_ASSET_PATTERN.test(pathname);
}

/**
 * Détecte la locale depuis l'en-tête Accept-Language.
 */
function detectLocaleFromAcceptLanguage(
  acceptLanguage: string | null
): SupportedLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const tags = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: ((tag ?? '').trim().split("-")[0] ?? '').toLowerCase(), q: q ? parseFloat(q) : 1.0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of tags) {
    if ((SUPPORTED_LOCALES as readonly string[]).includes(lang)) {
      return lang as SupportedLocale;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Vérifie si le pathname est une route vitrine sans locale préfixée.
 */
function isUnprefixedVitrineRoute(pathname: string): boolean {
  return /^\/(?:a|l|annonce)(\/|$)/.test(pathname);
}

/**
 * Applique les security headers sur une réponse existante.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

/**
 * Check if two hosts share the same parent domain for CSRF.
 * "slug.aqarvision.dz" and "aqarvision.dz" → true
 * "slug.localhost" and "localhost" → true
 */
function isSameParentDomain(host1: string, host2: string): boolean {
  const strip = (h: string) => h.split(":")[0]!;
  const h1 = strip(host1);
  const h2 = strip(host2);
  if (h1 === h2) return true;
  // Check if one is a subdomain of the other
  if (h1.endsWith(`.${h2}`) || h2.endsWith(`.${h1}`)) return true;
  // Both subdomains of the same parent
  const parent1 = h1.split(".").slice(-2).join(".");
  const parent2 = h2.split(".").slice(-2).join(".");
  return parent1 === parent2;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "localhost:3000";

  // ------------------------------------------------------------------
  // Supabase Auth SSR — refresh session ONCE for all paths
  // ------------------------------------------------------------------
  const supabaseResponse = await updateSession(request);

  // ------------------------------------------------------------------
  // Agency subdomain detection
  // slug.aqarvision.dz → rewrite to /[locale]/a/[slug]/...
  // slug.localhost:3000 → same in dev
  // ------------------------------------------------------------------
  const agencySlug = extractAgencySubdomain(host);

  if (agencySlug) {
    // On an agency subdomain — all routes are public (vitrine)
    const hasLocalePrefix = /^\/[a-z]{2}(\/|$)/.test(pathname);
    const locale = hasLocalePrefix
      ? extractLocale(pathname)
      : detectLocaleFromAcceptLanguage(request.headers.get("accept-language"));

    // Strip locale prefix from pathname if present to get the "rest"
    const rest = hasLocalePrefix
      ? pathname.replace(/^\/[a-z]{2}/, "") || "/"
      : pathname;

    // If someone navigates to /a/xxx on a subdomain, redirect to root
    // (avoid double context: subdomain + path)
    if (/^\/a\//.test(rest) || /^\/a$/.test(rest)) {
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl, { status: 307 });
    }

    // Determine rewrite target:
    // - Root "/" → agency vitrine page /[locale]/a/[slug]
    // - Other paths (e.g. /annonce/xxx) → serve normally with locale
    let rewritePath: string;
    if (rest === "/" || rest === "") {
      rewritePath = `/${locale}/a/${agencySlug}`;
    } else {
      rewritePath = `/${locale}${rest}`;
    }

    const rewriteUrl = new URL(rewritePath, request.url);
    rewriteUrl.search = request.nextUrl.search;

    const response = NextResponse.rewrite(rewriteUrl);
    // Pass agency slug as header for downstream use
    response.headers.set("x-agency-slug", agencySlug);

    // Copy Supabase session cookies to the rewrite response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, { ...cookie });
    });

    if (!isStaticAsset(pathname)) {
      applySecurityHeaders(response);
    }
    return response;
  }

  // ------------------------------------------------------------------
  // Protection CSRF (with subdomain-aware check)
  // ------------------------------------------------------------------
  const method = request.method;
  if (CSRF_METHODS.has(method)) {
    const origin = request.headers.get("origin");

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        const isExempt = CSRF_EXEMPT_PREFIXES.some((prefix) =>
          pathname.startsWith(prefix)
        );

        if (!isExempt && !isSameParentDomain(originHost, host)) {
          return new NextResponse("Forbidden", { status: 403 });
        }
      } catch {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  // ------------------------------------------------------------------
  // Détection de locale pour routes vitrines sans préfixe
  // ------------------------------------------------------------------
  if (isUnprefixedVitrineRoute(pathname)) {
    const detectedLocale = detectLocaleFromAcceptLanguage(
      request.headers.get("accept-language")
    );
    const redirectUrl = new URL(
      `/${detectedLocale}${pathname}`,
      request.url
    );
    redirectUrl.search = request.nextUrl.search;
    const redirectResponse = NextResponse.redirect(redirectUrl, { status: 307 });
    applySecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  // ------------------------------------------------------------------
  // next-intl — routing i18n
  // ------------------------------------------------------------------
  const intlResponse = intlMiddleware(request);

  // Copier les cookies Supabase vers la réponse intl
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    });
  });

  // ------------------------------------------------------------------
  // Vérification d'authentification pour les routes protégées
  // Session was already refreshed by updateSession() above, so we
  // only need a lightweight cookie check via getUser().
  // ------------------------------------------------------------------
  if (!isPublicRoute(pathname)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op: lecture seule pour vérification de session
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const locale = extractLocale(pathname);
      const isProRoute = pathname.includes("/AqarPro/dashboard") || pathname.includes("/dashboard") || pathname.includes("/admin") || pathname.includes("/agency");
      const loginPath = isProRoute
        ? `/${locale}/AqarPro/auth/login`
        : `/${locale}/AqarChaab/auth/login`;
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const authRedirect = NextResponse.redirect(loginUrl);
      if (!isStaticAsset(pathname)) {
        applySecurityHeaders(authRedirect);
      }
      return authRedirect;
    }
  }

  // ------------------------------------------------------------------
  // Security Headers
  // ------------------------------------------------------------------
  if (!isStaticAsset(pathname)) {
    applySecurityHeaders(intlResponse);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
