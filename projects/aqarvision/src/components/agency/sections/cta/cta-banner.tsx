import Link from 'next/link';
import { Phone } from 'lucide-react';
import { FadeInUp } from '@/components/ui/animated-sections';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface CtaBannerProps {
  agency: Agency;
}

/** Full-width colored CTA banner */
export function CtaBanner({ agency }: CtaBannerProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <FadeInUp>
        <div
          className="p-10 sm:p-14 text-center text-white"
          style={{ backgroundColor: accentColor, borderRadius: 'var(--agency-radius, 1rem)' }}
        >
          <h2 className="text-heading-lg font-vitrine text-white">
            {t('contact.ctaTitle', { name: agency.name })}
          </h2>
          <p className="mt-2 text-body-sm text-white/70 max-w-md mx-auto">
            {t('contact.ctaDescription')}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/agence/${agency.slug}/contact`}
              className="inline-flex items-center gap-2 h-11 px-6 bg-white text-foreground text-body-sm font-semibold transition-colors hover:bg-neutral-100"
              style={{ borderRadius: 'var(--agency-radius-sm, 0.5rem)' }}
            >
              {t('contact.sendMessage')}
            </Link>
            {agency.phone && (
              <a
                href={`tel:${agency.phone}`}
                className="inline-flex items-center gap-2 h-11 px-6 border border-white/30 text-white text-body-sm font-semibold transition-colors hover:bg-white/10"
                style={{ borderRadius: 'var(--agency-radius-sm, 0.5rem)' }}
              >
                <Phone className="h-4 w-4" /> {agency.phone}
              </a>
            )}
          </div>
        </div>
      </FadeInUp>
    </section>
  );
}
