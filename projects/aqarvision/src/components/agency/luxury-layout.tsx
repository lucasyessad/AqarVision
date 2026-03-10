'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { WhatsAppButton } from '@/components/agency/whatsapp-button';
import { getTranslations } from '@/lib/i18n';
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
  const mobileMenuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const t = getTranslations(agency.locale ?? 'fr');
  const isDark = agency.theme_mode === 'dark';
  const accentColor = agency.secondary_color || agency.primary_color;
  const fontClass = FONT_CLASS_MAP[agency.font_style] || 'font-display-elegant';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus trap: piège le focus dans le menu mobile quand il est ouvert
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMenuOpen(false);
      menuButtonRef.current?.focus();
      return;
    }

    if (e.key !== 'Tab') return;

    const menu = mobileMenuRef.current;
    if (!menu) return;

    const focusable = menu.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  // Fermer le menu mobile en appuyant Escape (même hors focus du menu)
  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  const navLinks = [
    { href: `/agence/${agency.slug}`, label: t('nav.home') },
    { href: `/agence/${agency.slug}/biens`, label: t('nav.properties') },
    { href: `/agence/${agency.slug}/a-propos`, label: t('nav.about') },
    { href: `/agence/${agency.slug}/contact`, label: t('nav.contact') },
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
        {t('a11y.skipToContent')}
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
          <nav className="hidden items-center gap-8 md:flex" aria-label={t('nav.navigation')}>
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
            ref={menuButtonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
            aria-label={menuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav
            id="mobile-menu"
            ref={mobileMenuRef}
            role="navigation"
            aria-label={t('nav.navigation')}
            className={`md:hidden border-t ${isDark ? 'border-white/10 bg-black/90' : 'border-gray-200 bg-white/95'} backdrop-blur-lg`}
            onKeyDown={handleMenuKeyDown}
          >
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
            aria-hidden="true"
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

              {/* Réseaux sociaux */}
              {(agency.instagram_url || agency.facebook_url || agency.tiktok_url) && (
                <div className="mt-4 flex items-center gap-3">
                  {agency.instagram_url && (
                    <a
                      href={agency.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="opacity-60 transition-opacity hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                  )}
                  {agency.facebook_url && (
                    <a
                      href={agency.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="opacity-60 transition-opacity hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {agency.tiktok_url && (
                    <a
                      href={agency.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      className="opacity-60 transition-opacity hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.6a8.22 8.22 0 004.76 1.51V6.69h-1z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest opacity-60">
                {t('nav.navigation')}
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
                {t('contact.title')}
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                {agency.phone && (
                  <a href={`tel:${agency.phone}`} className="flex items-center gap-2" aria-label={t('a11y.callAgency', { name: agency.name })}>
                    <Phone className="h-4 w-4" style={{ color: accentColor }} aria-hidden="true" />
                    {agency.phone}
                  </a>
                )}
                {agency.email && (
                  <a href={`mailto:${agency.email}`} className="flex items-center gap-2" aria-label={t('a11y.emailAgency', { name: agency.name })}>
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
            © {new Date().getFullYear()} {agency.name}. {t('footer.rights')}
          </div>
        </div>
      </footer>
    </div>
  );
}
