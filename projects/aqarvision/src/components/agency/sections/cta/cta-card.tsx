import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';
import { FadeInUp } from '@/components/ui/animated-sections';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface CtaCardProps {
  agency: Agency;
}

/** Centered CTA card with subtle background */
export function CtaCard({ agency }: CtaCardProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  return (
    <section className="bg-neutral-50 border-t border-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <FadeInUp>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-6" style={{ backgroundColor: `${accentColor}15` }}>
            <Phone className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          <h2 className="text-heading-lg text-foreground">
            {t('contact.ctaTitle', { name: agency.name })}
          </h2>
          <p className="mt-3 text-body-sm text-muted-foreground max-w-md mx-auto">
            {t('contact.ctaDescription')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/agence/${agency.slug}/contact`}
              className="inline-flex items-center gap-2 h-11 px-6 text-white text-body-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              {t('contact.sendMessage')} <ArrowRight className="h-4 w-4" />
            </Link>
            {agency.phone && (
              <a
                href={`tel:${agency.phone}`}
                className="inline-flex items-center gap-2 h-11 px-6 border border-neutral-200 text-foreground text-body-sm font-semibold rounded-lg transition-colors hover:bg-white"
              >
                <Phone className="h-4 w-4" /> {agency.phone}
              </a>
            )}
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
