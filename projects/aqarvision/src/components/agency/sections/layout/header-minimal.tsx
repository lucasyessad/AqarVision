import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface HeaderMinimalProps {
  agency: Agency;
}

/** Minimal header — clean, no background */
export function HeaderMinimal({ agency }: HeaderMinimalProps) {
  const t = getTranslations(agency.locale ?? 'fr');

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
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-14">
        <Link href={`/agence/${agency.slug}`} className="flex items-center gap-2.5">
          {agency.logo_url && (
            <Image
              src={agency.logo_url}
              alt={agency.name}
              width={28}
              height={28}
              className="object-cover"
              unoptimized
            />
          )}
          <span className="text-body-sm font-semibold text-foreground tracking-tight">
            {agency.name}
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-caption font-medium text-neutral-500 hover:text-foreground transition-colors"
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
              className="text-caption font-medium text-neutral-500 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
