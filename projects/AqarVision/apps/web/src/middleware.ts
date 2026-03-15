import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/lib/i18n/routing";

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
  /^\/[a-z]{2}\/l(\/|$)/, // /[locale]/l/*
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

// Supported locales and default (kept in sync with routing.ts)
const SUPPORTED_LOCALES = ["fr", "ar", "en", "es"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: SupportedLocale = "fr";

// Static asset extensions — security headers are skipped for these
const STATIC_ASSET_PATTERN =
  /\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|css|js|map)$/i;

// Security headers applied to every non-asset response
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
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
    "frame-src https://js.stripe.com https://hooks.stripe.com",
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
 * TÂCHE #37 — Détecte la locale depuis l'en-tête Accept-Language.
 * Retourne la première locale supportée trouvée, ou DEFAULT_LOCALE.
 */
function detectLocaleFromAcceptLanguage(
  acceptLanguage: string | null
): SupportedLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  // Parse "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7" into priority-ordered tags
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
 * TÂCHE #37 — Vérifie si le pathname est une route vitrine sans locale préfixée.
 * Patterns concernés: /a/[slug] et /l/[slug]
 */
function isUnprefixedVitrineRoute(pathname: string): boolean {
  return /^\/(?:a|l)(\/|$)/.test(pathname);
}

/**
 * TÂCHE #37 — Vérifie si le pathname est une route vitrine avec locale déjà présente.
 * Patterns concernés: /[locale]/a/[slug] et /[locale]/l/[slug]
 */
function isVitrineRoute(pathname: string): boolean {
  return /^\/[a-z]{2}\/(?:a|l)(\/|$)/.test(pathname);
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

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // ------------------------------------------------------------------
  // TÂCHE #35 — Protection CSRF
  // Vérifier avant toute autre logique pour court-circuiter tôt.
  // ------------------------------------------------------------------
  const method = request.method;
  if (CSRF_METHODS.has(method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        const isExempt = CSRF_EXEMPT_PREFIXES.some((prefix) =>
          pathname.startsWith(prefix)
        );

        if (!isExempt && originHost !== host) {
          return new NextResponse("Forbidden", { status: 403 });
        }
      } catch {
        // Origin header malformé — refuser par précaution
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  // ------------------------------------------------------------------
  // TÂCHE #37 — Détection de locale pour routes vitrines sans préfixe
  // Ex: /a/agence-xyz → /fr/a/agence-xyz
  // ------------------------------------------------------------------
  if (isUnprefixedVitrineRoute(pathname)) {
    const detectedLocale = detectLocaleFromAcceptLanguage(
      request.headers.get("accept-language")
    );
    const redirectUrl = new URL(
      `/${detectedLocale}${pathname}`,
      request.url
    );
    // Conserver les search params existants
    redirectUrl.search = request.nextUrl.search;
    const redirectResponse = NextResponse.redirect(redirectUrl, { status: 307 });
    applySecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  // ------------------------------------------------------------------
  // Supabase Auth SSR — rafraîchir la session (obligatoire en premier)
  // ------------------------------------------------------------------
  const supabaseResponse = await updateSession(request);

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
  // TÂCHE #37 — Pour les routes vitrines avec locale, s'assurer que la
  // locale dans l'URL correspond bien à une locale supportée. Si un
  // visiteur arrive sur /xx/a/slug avec xx non supporté, next-intl
  // gérera la redirection — on laisse passer.
  // ------------------------------------------------------------------

  // ------------------------------------------------------------------
  // Vérification d'authentification pour les routes protégées
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
      // Appliquer les security headers même sur les redirections auth
      if (!isStaticAsset(pathname)) {
        applySecurityHeaders(authRedirect);
      }
      return authRedirect;
    }
  }

  // ------------------------------------------------------------------
  // TÂCHE #36 — Security Headers
  // Appliqués sur toutes les réponses sauf les assets statiques.
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
