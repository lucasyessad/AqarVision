import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, MapPin } from 'lucide-react';
import { FadeIn, FadeInUp } from '@/components/ui/animated-sections';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface HeroOverlayProps {
  agency: Agency;
}

/** Premium theme: grande image avec overlay sombre */
export function HeroOverlay({ agency }: HeroOverlayProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '520px' }}>
      {agency.cover_image_url ? (
        <div className="absolute inset-0">
          <Image
            src={agency.cover_image_url}
            alt=""
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-black/65" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      )}

      <FadeIn>
        <div className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36 text-center">
          {agency.logo_url && (
            <Image
              src={agency.logo_url}
              alt={agency.name}
              width={80}
              height={80}
              className="mx-auto mb-8 object-cover rounded-2xl shadow-2xl border border-white/10"
              unoptimized
            />
          )}
          <h1 className="text-display-lg sm:text-display-xl font-vitrine text-white tracking-tight">
            {agency.name}
          </h1>
          <div className="mx-auto mt-5 h-0.5 w-20" style={{ backgroundColor: accentColor }} />
          {agency.slogan && (
            <p className="mt-5 text-body-lg text-white/60 max-w-xl mx-auto tracking-wide">
              {agency.slogan}
            </p>
          )}
          {agency.wilaya && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-body-sm text-white/40">
              <MapPin className="h-3.5 w-3.5" />
              {agency.wilaya}{agency.address ? ` — ${agency.address}` : ''}
            </p>
          )}
          <FadeInUp delay={0.2}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/agence/${agency.slug}/biens`}
                className="inline-flex items-center gap-2 h-12 px-8 text-white text-body-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                {t('nav.properties')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/agence/${agency.slug}/contact`}
                className="inline-flex items-center gap-2 h-12 px-8 border border-white/20 text-white text-body-sm font-semibold rounded-lg transition-colors hover:bg-white/5"
              >
                <Phone className="h-4 w-4" /> {t('nav.contact')}
              </Link>
            </div>
          </FadeInUp>
        </div>
      </FadeIn>
    </section>
  );
}
