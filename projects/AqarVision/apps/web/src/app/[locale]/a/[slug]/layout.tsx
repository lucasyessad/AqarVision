import { notFound } from 'next/navigation'
import type React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getAgencyPublic } from '@/features/marketplace/services/search.service'
import { resolveManifest, resolveThemeColors } from '@/lib/themes'
import AgencyHeader from '@/components/agency/AgencyHeader'
import AgencyFooter from '@/components/agency/AgencyFooter'
import WhatsAppButton from '@/components/agency/WhatsAppButton'
import ChatbotWidget from '@/components/agency/ChatbotWidget'

// ISR: revalidate every 5 minutes
export const revalidate = 300

interface AgencyLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string; slug: string }>
}

// Map ThemeManifest layout.header → AgencyHeader headerVariant prop
function toHeaderVariant(
  header: 'header-standard' | 'header-luxury' | 'header-minimal'
): 'standard' | 'luxury' | 'minimal' {
  switch (header) {
    case 'header-luxury':
      return 'luxury'
    case 'header-minimal':
      return 'minimal'
    default:
      return 'standard'
  }
}

// Map ThemeManifest layout.footer → AgencyFooter footerVariant prop
function toFooterVariant(
  footer: 'footer-standard' | 'footer-minimal'
): 'standard' | 'minimal' {
  return footer === 'footer-minimal' ? 'minimal' : 'standard'
}

export default async function AgencyLayout({ children, params }: AgencyLayoutProps) {
  const { locale, slug } = await params

  const supabase = await createClient()
  const agency = await getAgencyPublic(supabase, slug)

  if (!agency) {
    notFound()
  }

  // Resolve theme manifest — fall back to 'modern' for unknown / missing themes
  const agencyRecord = agency as unknown as Record<string, unknown>
  const themeId: string = (agencyRecord.theme as string) ?? 'modern'
  const manifest = resolveManifest(themeId)

  // Merge agency color overrides with manifest defaults
  const colors = resolveThemeColors(manifest, {
    primary_color: (agencyRecord.primary_color as string) ?? null,
    accent_color: (agencyRecord.accent_color as string) ?? null,
    secondary_color: (agencyRecord.secondary_color as string) ?? null,
  })

  const headerVariant = toHeaderVariant(manifest.layout.header)
  const footerVariant = toFooterVariant(manifest.layout.footer)

  // Derive address from first branch if no dedicated address field
  const firstBranch = agency.branches[0]
  const address = firstBranch?.address_text ?? null

  return (
    <div
      data-theme={manifest.id}
      data-theme-mode={manifest.style.themeMode}
      style={
        {
          '--agency-primary': colors.primary,
          '--agency-accent': colors.accent,
          '--agency-secondary': colors.secondary,
        } as React.CSSProperties
      }
      className="agency-layout"
    >
      {/* Sticky header */}
      <AgencyHeader
        agency={{
          name: agency.name,
          logo_url: agency.logo_url,
          is_verified: agency.is_verified,
          slug: agency.slug,
        }}
        locale={locale}
        headerVariant={headerVariant}
      />

      {/* Page content */}
      <main>{children}</main>

      {/* Footer */}
      <AgencyFooter
        agency={{
          name: agency.name,
          phone: agency.phone,
          email: agency.email,
          address,
          slug: agency.slug,
        }}
        footerVariant={footerVariant}
      />

      {/* Floating: WhatsApp button */}
      <WhatsAppButton phone={agency.phone} agencyName={agency.name} />

      {/* Floating: Chatbot widget (above WhatsApp button) */}
      <ChatbotWidget agencyId={agency.id} agencyName={agency.name} />
    </div>
  )
}
