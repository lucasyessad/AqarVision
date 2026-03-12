import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FadeInUp } from '@/components/ui/animated-sections';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface AboutSimpleProps {
  agency: Agency;
}

/** Simple about preview with link to full page */
export function AboutSimple({ agency }: AboutSimpleProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  if (!agency.description) return null;

  return (
    <section className="bg-white border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <FadeInUp>
          <div className="max-w-2xl">
            <h2 className="text-heading-lg text-foreground">
              {t('about.heading', { name: agency.name })}
            </h2>
            <div className="mt-3 agency-line" style={{ backgroundColor: accentColor }} />
            <p className="mt-5 text-body-sm text-neutral-600 leading-relaxed line-clamp-4">
              {agency.description}
            </p>
            <Link
              href={`/agence/${agency.slug}/a-propos`}
              className="mt-4 inline-flex items-center gap-1.5 text-body-sm font-medium transition-colors"
              style={{ color: accentColor }}
            >
              {t('about.readMore')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
