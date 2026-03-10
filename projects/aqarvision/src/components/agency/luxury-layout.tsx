'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { WhatsAppButton } from '@/components/agency/whatsapp-button';
import type { Agency } from '@/types/database';

interface LuxuryLayoutProps {
  agency: Agency;
  children: React.ReactNode;
}

const FONT_CLASS_MAP = {
  modern: 'font-display-modern',
  classic: 'font-display-classic',
  elegant: 'font-display-elegant',
} as const;

export function LuxuryLayout({ agency, children }: LuxuryLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isDark = agency.theme_mode === 'dark';
  const accentColor = agency.secondary_color || agency.primary_color;
  const fontClass = FONT_CLASS_MAP[agency.font_style] || 'font-display-elegant';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: `/agence/${agency.slug}`, label: 'Accueil' },
    { href: `/agence/${agency.slug}/biens`, label: 'Biens' },
    { href: `/agence/${agency.slug}/a-propos`, label: 'À propos' },
    { href: `/agence/${agency.slug}/contact`, label: 'Contact' },
  ];

  const bgClass = isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900';
  const headerScrolledClass = isDark ? '' : 'theme-light';

  return (
    <div className={`min-h-screen ${bgClass} ${fontClass}`}>
      {/* Skip to content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg"
      >
        Aller au contenu principal
      </a>

      {/* === Header === */}
      <header
        className={`luxury-header-glass fixed top-0 left-0 right-0 z-50 ${
          isScrolled ? `is-scrolled ${headerScrolledClass}` : ''
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo + Nom */}
          <Link href={`/agence/${agency.slug}`} className="flex items-center gap-3">
            {agency.logo_url && (
              <Image
                src={agency.logo_url}
                alt={agency.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <span className="text-lg font-semibold uppercase tracking-widest">
              {agency.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className={`md:hidden border-t ${isDark ? 'border-white/10 bg-black/90' : 'border-gray-200 bg-white/95'} backdrop-blur-lg`}>
            <div className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm uppercase tracking-widest py-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* === WhatsApp === */}
      <WhatsAppButton agency={agency} />

      {/* === Main === */}
      <main id="main-content">{children}</main>

      {/* === Footer === */}
      <footer className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'} py-16`}>
        <div className="mx-auto max-w-7xl px-6">
          {/* Ligne décorative */}
          <div
            className="mx-auto mb-12 h-0.5 w-20"
            style={{ backgroundColor: accentColor }}
          />

          <div className="grid gap-12 md:grid-cols-3">
            {/* Col 1: Agence */}
            <div>
              <h3 className="mb-4 text-lg font-semibold uppercase tracking-widest">
                {agency.name}
              </h3>
              {agency.slogan && (
                <p className="text-sm opacity-60">{agency.slogan}</p>
              )}
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest opacity-60">
                Navigation
              </h3>
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm transition-opacity hover:opacity-70"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 3: Contact */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest opacity-60">
                Contact
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                {agency.phone && (
                  <a href={`tel:${agency.phone}`} className="flex items-center gap-2" aria-label={`Appeler ${agency.name}`}>
                    <Phone className="h-4 w-4" style={{ color: accentColor }} aria-hidden="true" />
                    {agency.phone}
                  </a>
                )}
                {agency.email && (
                  <a href={`mailto:${agency.email}`} className="flex items-center gap-2" aria-label={`Envoyer un email à ${agency.name}`}>
                    <Mail className="h-4 w-4" style={{ color: accentColor }} aria-hidden="true" />
                    {agency.email}
                  </a>
                )}
                {agency.address && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" style={{ color: accentColor }} aria-hidden="true" />
                    {agency.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 border-t border-current/10 pt-8 text-center text-xs uppercase tracking-widest opacity-40">
            © {new Date().getFullYear()} {agency.name}. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
