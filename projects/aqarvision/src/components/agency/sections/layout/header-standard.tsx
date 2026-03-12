import Link from 'next/link';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface HeaderStandardProps {
  agency: Agency;
}

/** Standard header with nav */
export function HeaderStandard({ agency }: HeaderStandardProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  const navItems = [
    { label: t('nav.home'), href: `/agence/${agency.slug}` },
    { label: t('nav.properties'), href: `/agence/${agency.slug}/biens` },
    { label: t('nav.about'), href: `/agence/${agency.slug}/a-propos` },
    { label: t('nav.team'), href: `/agence/${agency.slug}/equipe` },
    { label: t('nav.services'), href: `/agence/${agency.slug}/services` },
    { label: t('nav.zones'), href: `/agence/${agency.slug}/zones` },
    { label: t('nav.contact'), href: `/agence/${agency.slug}/contact` },
  ];

  return (
    <header className="header-glass sticky top-0 z-20">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
        <Link href={`/agence/${agency.slug}`} className="flex items-center gap-3 group">
          {agency.logo_url ? (
            <Image
              src={agency.logo_url}
              alt={agency.name}
              width={36}
              height={36}
              className="object-cover"
              style={{ borderRadius: 'var(--agency-radius-sm)' }}
              unoptimized
            />
          ) : (
            <div
              className="w-9 h-9 flex items-center justify-center text-white"
              style={{ backgroundColor: accentColor, borderRadius: 'var(--agency-radius-sm)' }}
            >
              <Building2 className="h-5 w-5" />
            </div>
          )}
          <div>
            <span className="text-body-sm font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
              {agency.name}
            </span>
            {agency.wilaya && (
              <p className="text-caption text-neutral-400">{agency.wilaya}</p>
            )}
          </div>
        </Link>
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-body-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <nav className="flex sm:hidden items-center gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-caption font-medium text-neutral-600 hover:text-neutral-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
