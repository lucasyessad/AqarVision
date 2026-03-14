/**
 * AgencyFooter
 *
 * Footer for agency storefronts (/a/[slug]).
 * Variants:
 *   - 'standard' → full footer with contact info, links, copyright
 *   - 'minimal'  → single-line copyright bar
 *
 * Uses CSS logical properties throughout (start/end instead of left/right).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AgencyFooterProps {
  agency: {
    name: string
    phone: string | null
    email: string | null
    address: string | null
    slug: string
  }
  footerVariant: 'standard' | 'minimal'
}

// ── Icon helpers ──────────────────────────────────────────────────────────────

function PhoneIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

// ── Standard footer ───────────────────────────────────────────────────────────

function FooterStandard({ agency }: AgencyFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer
      className="border-t"
      style={{
        background: 'var(--agency-primary, #1a1a1a)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          {/* Agency identity */}
          <div className="max-w-xs">
            <p className="text-base font-semibold text-white">{agency.name}</p>
            <p className="mt-1 text-xs text-white/50">Agence immobilière en Algérie</p>
          </div>

          {/* Contact details */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Coordonnées
            </p>
            {agency.phone && (
              <a
                href={`tel:${agency.phone}`}
                className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
              >
                <PhoneIcon />
                {agency.phone}
              </a>
            )}
            {agency.email && (
              <a
                href={`mailto:${agency.email}`}
                className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
              >
                <EmailIcon />
                {agency.email}
              </a>
            )}
            {agency.address && (
              <span className="flex items-start gap-2 text-sm text-white/70">
                <LocationIcon />
                <span>{agency.address}</span>
              </span>
            )}
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Liens rapides
            </p>
            <a
              href={`#listings`}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Nos annonces
            </a>
            <a
              href={`#contact`}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Nous contacter
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t pt-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-center text-xs text-white/30">
            &copy; {year} {agency.name}. Propulsé par{' '}
            <a
              href="https://aqarvision.dz"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-white/60"
            >
              AqarVision
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}

// ── Minimal footer ────────────────────────────────────────────────────────────

function FooterMinimal({ agency }: AgencyFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <p className="text-center text-xs text-gray-400">
          &copy; {year} {agency.name} &mdash; Propulsé par{' '}
          <a
            href="https://aqarvision.dz"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-gray-600"
          >
            AqarVision
          </a>
        </p>
      </div>
    </footer>
  )
}

// ── AgencyFooter ──────────────────────────────────────────────────────────────

export default function AgencyFooter(props: AgencyFooterProps) {
  if (props.footerVariant === 'minimal') {
    return <FooterMinimal {...props} />
  }
  return <FooterStandard {...props} />
}
