'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface HeaderLuxuryProps {
  agency: Agency;
}

/** Luxury header with glassmorphism effect (refactoré depuis luxury-layout) */
export function HeaderLuxury({ agency }: HeaderLuxuryProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const t = getTranslations(agency.locale ?? 'fr');
  const isDark = agency.theme_mode === 'dark';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const headerScrolledClass = isDark ? '' : 'theme-light';

  return (
    <header
      className={`luxury-header-glass fixed top-0 left-0 right-0 z-50 ${
        isScrolled ? `is-scrolled ${headerScrolledClass}` : ''
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
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
  );
}
