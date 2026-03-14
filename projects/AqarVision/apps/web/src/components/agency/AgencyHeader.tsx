'use client'

/**
 * AgencyHeader
 *
 * Sticky navigation header for agency storefronts (/a/[slug]).
 * Adapts its visual style based on `headerVariant`:
 *   - 'standard' → solid background using --agency-primary, full nav
 *   - 'luxury'   → transparent → frosted glass on scroll, gold accents
 *   - 'minimal'  → white bar, minimal styling
 *
 * Uses CSS logical properties throughout (start/end instead of left/right).
 */

import { useEffect, useRef, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AgencyHeaderProps {
  agency: {
    name: string
    logo_url: string | null
    is_verified: boolean
    slug: string
  }
  locale: string
  headerVariant: 'standard' | 'luxury' | 'minimal'
}

// ── Verified badge ────────────────────────────────────────────────────────────

function VerifiedBadge() {
  return (
    <svg
      aria-label="Agence vérifiée"
      className="h-4 w-4 shrink-0"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="false"
      role="img"
    >
      <path
        fillRule="evenodd"
        d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.548 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.548 4.491 4.491 0 01-3.497-1.307 4.491 4.491 0 01-1.307-3.497A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.491 4.491 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  )
}

// ── Logo / Initials ───────────────────────────────────────────────────────────

function AgencyLogo({
  name,
  logo_url,
  variant,
}: {
  name: string
  logo_url: string | null
  variant: 'standard' | 'luxury' | 'minimal'
}) {
  if (logo_url) {
    return (
      <img
        src={logo_url}
        alt={name}
        className="h-8 w-8 rounded-full object-cover ring-2 ring-white/30 sm:h-9 sm:w-9"
      />
    )
  }

  const initial = name.charAt(0).toUpperCase()

  if (variant === 'luxury') {
    return (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold sm:h-9 sm:w-9"
        style={{ background: 'var(--agency-accent, #c9a227)', color: '#0d0d0d' }}
        aria-hidden="true"
      >
        {initial}
      </div>
    )
  }

  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white sm:h-9 sm:w-9"
      style={{ background: 'var(--agency-accent, #fbbf24)', color: 'var(--agency-primary, #1a1a1a)' }}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}

// ── Nav links ─────────────────────────────────────────────────────────────────

const NAV_LINKS: Array<{ href: string; label: string; anchor: string }> = [
  { href: '#listings', label: 'Nos biens', anchor: 'listings' },
  { href: '#team', label: 'Équipe', anchor: 'team' },
  { href: '#contact', label: 'Contact', anchor: 'contact' },
]

function scrollToAnchor(anchor: string) {
  const el = document.getElementById(anchor)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// ── AgencyHeader ──────────────────────────────────────────────────────────────

export default function AgencyHeader({ agency, headerVariant }: AgencyHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Compute classes per variant
  const headerClasses = (() => {
    const base = 'sticky top-0 z-40 w-full transition-all duration-300'
    switch (headerVariant) {
      case 'luxury':
        return `${base} ${scrolled ? 'bg-black/80 backdrop-blur-md shadow-lg' : 'bg-transparent'}`
      case 'minimal':
        return `${base} bg-white border-b border-gray-100 shadow-sm`
      default: // standard
        return `${base} shadow-md`
    }
  })()

  const headerStyle =
    headerVariant === 'standard'
      ? { background: 'var(--agency-primary, #1a365d)' }
      : undefined

  const textColorClass =
    headerVariant === 'minimal' ? 'text-gray-800' : 'text-white'

  const navItemClass =
    headerVariant === 'minimal'
      ? 'text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
      : 'text-sm font-medium text-white/80 hover:text-white transition-colors'

  return (
    <header ref={headerRef} className={headerClasses} style={headerStyle}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-2.5">
          <AgencyLogo
            name={agency.name}
            logo_url={agency.logo_url}
            variant={headerVariant}
          />
          <span className={`truncate text-sm font-semibold sm:text-base ${textColorClass}`}>
            {agency.name}
          </span>
          {agency.is_verified && (
            <span
              className={
                headerVariant === 'luxury'
                  ? 'text-[var(--agency-accent,#c9a227)]'
                  : headerVariant === 'minimal'
                    ? 'text-blue-600'
                    : 'text-[var(--agency-accent,#fbbf24)]'
              }
            >
              <VerifiedBadge />
            </span>
          )}
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation agence">
          {NAV_LINKS.map((link) => (
            <button
              key={link.anchor}
              type="button"
              onClick={() => scrollToAnchor(link.anchor)}
              className={navItemClass}
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => scrollToAnchor('contact')}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
            style={
              headerVariant === 'minimal'
                ? {
                    background: 'var(--agency-primary, #1a365d)',
                    color: '#fff',
                  }
                : headerVariant === 'luxury'
                  ? {
                      background: 'var(--agency-accent, #c9a227)',
                      color: '#0d0d0d',
                    }
                  : {
                      background: 'var(--agency-accent, #fbbf24)',
                      color: 'var(--agency-primary, #1a365d)',
                    }
            }
          >
            Nous contacter
          </button>
        </nav>

        {/* Mobile burger */}
        <button
          type="button"
          className={`flex h-8 w-8 items-center justify-center rounded-md md:hidden ${textColorClass}`}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className={`border-t md:hidden ${
            headerVariant === 'minimal'
              ? 'border-gray-100 bg-white'
              : 'border-white/10 bg-black/90 backdrop-blur-md'
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <button
                key={link.anchor}
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  scrollToAnchor(link.anchor)
                }}
                className={`w-full rounded-md px-3 py-2.5 text-start text-sm font-medium ${
                  headerVariant === 'minimal'
                    ? 'text-gray-700 hover:bg-gray-50'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                scrollToAnchor('contact')
              }}
              className="mt-2 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={
                headerVariant === 'minimal'
                  ? { background: 'var(--agency-primary, #1a365d)', color: '#fff' }
                  : { background: 'var(--agency-accent, #c9a227)', color: '#0d0d0d' }
              }
            >
              Nous contacter
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
