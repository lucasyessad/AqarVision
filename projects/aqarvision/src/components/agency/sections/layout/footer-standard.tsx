import Link from 'next/link';
import Image from 'next/image';
import { Building2, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface FooterStandardProps {
  agency: Agency;
}

/** Standard footer with 4 columns */
export function FooterStandard({ agency }: FooterStandardProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  const navItems = [
    { label: t('nav.home'), href: `/agence/${agency.slug}` },
    { label: t('nav.properties'), href: `/agence/${agency.slug}/biens` },
    { label: t('nav.about'), href: `/agence/${agency.slug}/a-propos` },
    { label: t('nav.contact'), href: `/agence/${agency.slug}/contact` },
  ];

  const socialLinks = [
    agency.facebook_url && { label: 'Facebook', href: agency.facebook_url },
    agency.instagram_url && { label: 'Instagram', href: agency.instagram_url },
    agency.tiktok_url && { label: 'TikTok', href: agency.tiktok_url },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="h-0.5 w-full" style={{ backgroundColor: accentColor }} />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              {agency.logo_url ? (
                <Image src={agency.logo_url} alt="" width={32} height={32} className="object-cover" style={{ borderRadius: 'var(--agency-radius-sm)' }} unoptimized />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center text-white" style={{ backgroundColor: accentColor, borderRadius: 'var(--agency-radius-sm)' }}>
                  <Building2 className="h-4 w-4" />
                </div>
              )}
              <span className="text-body-sm font-semibold text-neutral-900">{agency.name}</span>
            </div>
            {agency.slogan && <p className="text-caption text-neutral-500">{agency.slogan}</p>}
            {socialLinks.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                {socialLinks.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-700" title={link.label}>
                    <span className="text-[10px] font-bold uppercase">{link.label.slice(0, 2)}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-caption font-semibold text-neutral-900 uppercase tracking-wider mb-3">Navigation</p>
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-body-sm text-neutral-500 hover:text-neutral-900 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-caption font-semibold text-neutral-900 uppercase tracking-wider mb-3">Contact</p>
            <ul className="flex flex-col gap-2.5">
              {agency.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" style={{ color: accentColor }} />
                  <a href={`tel:${agency.phone}`} className="text-body-sm text-neutral-500 hover:text-neutral-900 transition-colors">{agency.phone}</a>
                </li>
              )}
              {agency.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" style={{ color: accentColor }} />
                  <a href={`mailto:${agency.email}`} className="text-body-sm text-neutral-500 hover:text-neutral-900 transition-colors">{agency.email}</a>
                </li>
              )}
              {agency.address && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" style={{ color: accentColor }} />
                  <span className="text-body-sm text-neutral-500">{agency.address}</span>
                </li>
              )}
              {agency.website && (
                <li className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" style={{ color: accentColor }} />
                  <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-body-sm text-neutral-500 hover:text-neutral-900 transition-colors">{agency.website.replace(/^https?:\/\//, '')}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-caption text-neutral-400">&copy; {new Date().getFullYear()} {agency.name}. {t('footer.rights')}</p>
          <p className="text-caption text-neutral-300">
            Propulsé par <Link href="/" className="text-neutral-400 hover:text-primary-600 transition-colors">AqarVision</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
