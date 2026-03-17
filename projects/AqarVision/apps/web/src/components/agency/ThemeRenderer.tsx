'use client'

/**
 * ThemeRenderer & SectionRenderer
 *
 * Renders an agency storefront based on its ThemeManifest.
 * Sections are rendered in ascending `order` and dispatched via SectionRenderer.
 * Sections not yet implemented show a labeled placeholder (dev/staging only).
 */

import type { ThemeManifest, ThemeSection } from '@/lib/themes/registry'
import type { AgencyPublicDto } from '@/features/marketplace/types/search.types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ThemeRendererProps {
  manifest: ThemeManifest
  agency: AgencyPublicDto
}

export interface SectionRendererProps {
  section: ThemeSection
  agency: AgencyPublicDto
}

// ── Placeholder ───────────────────────────────────────────────────────────────

function SectionPlaceholder({ section }: { section: ThemeSection }) {
  if (process.env.NODE_ENV === 'production') {
    return null
  }
  return (
    <div className="mx-4 my-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
      <strong>[{section.id}]</strong> variant: <code>{section.variant}</code> — not yet
      implemented
    </div>
  )
}

// ── Hero sections ──────────────────────────────────────────────────────────────

function HeroShort({ agency }: { agency: AgencyPublicDto }) {
  return (
    <section
      className="relative flex items-center justify-center py-12"
      style={{ background: 'var(--agency-primary, #1a1a1a)' }}
    >
      <div className="mx-auto max-w-4xl px-4 text-center">
        {agency.logo_url && (
          <img
            src={agency.logo_url}
            alt={agency.name}
            className="mx-auto mb-4 h-16 w-16 rounded-full object-cover"
          />
        )}
        <h1 className="text-3xl font-bold text-white">{agency.name}</h1>
        {agency.description && (
          <p className="mt-2 text-sm" style={{ color: 'var(--agency-accent, #e5e5e5)' }}>
            {agency.description}
          </p>
        )}
      </div>
    </section>
  )
}

function HeroMedium({ agency }: { agency: AgencyPublicDto }) {
  return (
    <section
      className="relative flex min-h-[320px] items-center"
      style={{ background: 'var(--agency-primary, #4338ca)' }}
    >
      {agency.cover_url && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={agency.cover_url}
            alt=""
            aria-hidden
            className="h-full w-full object-cover opacity-20"
          />
        </div>
      )}
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center gap-6">
          {agency.logo_url ? (
            <img
              src={agency.logo_url}
              alt={agency.name}
              className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-lg"
            />
          ) : (
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white"
              style={{ background: 'var(--agency-accent, #fbbf24)' }}
            >
              {agency.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold text-white">{agency.name}</h1>
            {agency.description && (
              <p className="mt-2 max-w-lg text-white/80">{agency.description}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroFullscreen({ agency }: { agency: AgencyPublicDto }) {
  const hasCover = Boolean(agency.cover_url)
  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        background: 'var(--agency-primary, #0d0d0d)',
        minHeight: hasCover ? '70vh' : '50vh',
      }}
    >
      {/* Cover image */}
      {hasCover && (
        <div className="absolute inset-0">
          <img
            src={agency.cover_url!}
            alt=""
            aria-hidden
            className="h-full w-full object-cover"
            style={{ opacity: 0.45 }}
          />
          {/* Gradient overlay for readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.7) 100%)',
            }}
          />
        </div>
      )}

      <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
        {/* Logo */}
        {agency.logo_url && (
          <img
            src={agency.logo_url}
            alt={agency.name}
            className="mx-auto mb-6 h-20 w-20 rounded-full object-cover ring-2 ring-white/20 shadow-2xl"
          />
        )}

        {/* Agency name */}
        <h1
          className="text-5xl font-bold tracking-tight text-white drop-shadow-lg"
          style={{ fontFamily: 'var(--font-agency, serif)' }}
        >
          {agency.name}
        </h1>

        {/* Gold divider */}
        <div
          className="mx-auto my-5 h-0.5 w-16"
          style={{ background: 'var(--agency-accent, #c9a227)' }}
        />

        {agency.description && (
          <p className="max-w-lg mx-auto text-base text-white/75 leading-relaxed drop-shadow">
            {agency.description}
          </p>
        )}

        {/* Listing count badge */}
        <p
          className="mt-4 inline-block rounded-full px-4 py-1 text-xs font-medium"
          style={{
            background: 'rgba(255,255,255,0.12)',
            color: 'var(--agency-accent, #c9a227)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {agency.listing_count} {agency.listing_count === 1 ? 'bien' : 'biens'} disponibles
        </p>
      </div>
    </section>
  )
}

// ── About sections ────────────────────────────────────────────────────────────

function AboutStandard({ agency }: { agency: AgencyPublicDto }) {
  if (!agency.description) return null
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h2
        className="mb-4 text-2xl font-semibold"
        style={{ color: 'var(--agency-primary, #1a1a1a)' }}
      >
        À propos
      </h2>
      <p className="max-w-2xl leading-relaxed text-gray-600">{agency.description}</p>
    </section>
  )
}

function AboutLuxury({ agency }: { agency: AgencyPublicDto }) {
  if (!agency.description) return null
  return (
    <section
      className="py-20"
      style={{ background: 'var(--agency-secondary, #1a1a1a)' }}
    >
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div
          className="mx-auto mb-8 h-0.5 w-16"
          style={{ background: 'var(--agency-accent, #c9a227)' }}
        />
        <p className="text-lg leading-relaxed text-white/80">{agency.description}</p>
      </div>
    </section>
  )
}

function AboutEditorial({ agency }: { agency: AgencyPublicDto }) {
  if (!agency.description) return null
  return (
    <section className="grid min-h-[240px] grid-cols-1 md:grid-cols-2">
      <div
        className="flex items-center justify-center p-12"
        style={{ background: 'var(--agency-primary, #1a1a2e)' }}
      >
        <h2 className="text-3xl font-bold text-white">{agency.name}</h2>
      </div>
      <div className="flex items-center bg-white dark:bg-zinc-900 p-12">
        <p className="leading-relaxed text-gray-600">{agency.description}</p>
      </div>
    </section>
  )
}

// ── Listings sections (placeholder shells) ────────────────────────────────────

function ListingsGrid({ agency }: { agency: AgencyPublicDto }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2
        className="mb-6 text-xl font-semibold"
        style={{ color: 'var(--agency-primary, #1a1a1a)' }}
      >
        Nos biens ({agency.listing_count})
      </h2>
      {/* Listings rendered by page.tsx; this section serves as header/wrapper */}
    </section>
  )
}

// ── Stats section ─────────────────────────────────────────────────────────────

function StatsStrip({ agency }: { agency: AgencyPublicDto }) {
  return (
    <section
      className="py-10"
      style={{ background: 'var(--agency-accent, #e94560)' }}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap justify-around gap-6 px-6">
        <div className="text-center text-white">
          <p className="text-4xl font-bold">{agency.listing_count}</p>
          <p className="mt-1 text-sm uppercase tracking-wide opacity-80">Biens publiés</p>
        </div>
        <div className="text-center text-white">
          <p className="text-4xl font-bold">{agency.branches.length}</p>
          <p className="mt-1 text-sm uppercase tracking-wide opacity-80">Agences</p>
        </div>
      </div>
    </section>
  )
}

// ── CTA sections ──────────────────────────────────────────────────────────────

function CTASimple({ agency }: { agency: AgencyPublicDto }) {
  if (!agency.phone && !agency.email) return null
  return (
    <section className="mx-auto max-w-5xl px-6 py-10 text-center">
      <h2
        className="mb-4 text-xl font-semibold"
        style={{ color: 'var(--agency-primary, #1a1a1a)' }}
      >
        Contactez-nous
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {agency.phone && (
          <a
            href={`tel:${agency.phone}`}
            className="rounded px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--agency-primary, #1a1a1a)' }}
          >
            {agency.phone}
          </a>
        )}
        {agency.email && (
          <a
            href={`mailto:${agency.email}`}
            className="rounded border px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              borderColor: 'var(--agency-primary, #1a1a1a)',
              color: 'var(--agency-primary, #1a1a1a)',
            }}
          >
            {agency.email}
          </a>
        )}
      </div>
    </section>
  )
}

function CTACard({ agency }: { agency: AgencyPublicDto }) {
  if (!agency.phone && !agency.email) return null
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'var(--agency-primary, #4338ca)' }}
      >
        <h2 className="mb-2 text-2xl font-bold text-white">Prêt à trouver votre bien ?</h2>
        <p className="mb-6 text-white/70">Contactez {agency.name} dès maintenant.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {agency.phone && (
            <a
              href={`tel:${agency.phone}`}
              className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                background: 'var(--agency-accent, #fbbf24)',
                color: 'var(--agency-secondary, #1a1a1a)',
              }}
            >
              {agency.phone}
            </a>
          )}
          {agency.email && (
            <a
              href={`mailto:${agency.email}`}
              className="rounded-lg border border-white px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {agency.email}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function CTABanner({ agency }: { agency: AgencyPublicDto }) {
  if (!agency.phone && !agency.email) return null
  return (
    <section
      className="py-16"
      style={{ background: 'var(--agency-accent, #e94560)' }}
    >
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="mb-6 text-3xl font-bold text-white">{agency.name}</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {agency.phone && (
            <a
              href={`tel:${agency.phone}`}
              className="rounded-full bg-white dark:bg-zinc-900 px-8 py-3 text-sm font-bold transition-transform hover:scale-105"
              style={{ color: 'var(--agency-accent, #e94560)' }}
            >
              {agency.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Section dispatcher ────────────────────────────────────────────────────────

export function SectionRenderer({ section, agency }: SectionRendererProps) {
  switch (section.variant) {
    // Hero
    case 'hero-short':
      return <HeroShort agency={agency} />
    case 'hero-medium':
      return <HeroMedium agency={agency} />
    case 'hero-fullscreen':
      return <HeroFullscreen agency={agency} />

    // About
    case 'about-standard':
      return <AboutStandard agency={agency} />
    case 'about-luxury':
      return <AboutLuxury agency={agency} />
    case 'about-editorial':
      return <AboutEditorial agency={agency} />

    // Listings
    case 'listings-grid':
      return <ListingsGrid agency={agency} />

    // Stats
    case 'stats-strip':
      return <StatsStrip agency={agency} />

    // CTA
    case 'cta-simple':
      return <CTASimple agency={agency} />
    case 'cta-card':
      return <CTACard agency={agency} />
    case 'cta-banner':
      return <CTABanner agency={agency} />

    // Not yet implemented — show placeholder in dev
    default:
      return <SectionPlaceholder section={section} />
  }
}

// ── ThemeRenderer ─────────────────────────────────────────────────────────────

export default function ThemeRenderer({ manifest, agency }: ThemeRendererProps) {
  const sortedSections = [...manifest.sections].sort((a, b) => a.order - b.order)

  return (
    <div className="agency-theme-root" data-theme={manifest.id}>
      {sortedSections.map((section) => (
        <SectionRenderer key={`${section.id}-${section.order}`} section={section} agency={agency} />
      ))}
    </div>
  )
}
