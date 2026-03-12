import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { FadeIn, FadeInUp } from '@/components/ui/animated-sections';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface HeroAsymmetricProps {
  agency: Agency;
}

/** Bold theme: hero asymétrique */
export function HeroAsymmetric({ agency }: HeroAsymmetricProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '500px' }}>
      <div className="absolute inset-0" style={{ backgroundColor: agency.primary_color }} />
      {/* Diagonal accent shape */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full skew-x-[-6deg] origin-top-right"
        style={{ backgroundColor: accentColor, opacity: 0.15 }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-5 items-center" style={{ minHeight: '500px' }}>
          {/* Left: text (3 cols) */}
          <FadeIn>
            <div className="lg:col-span-3 py-20">
              {agency.logo_url && (
                <Image
                  src={agency.logo_url}
                  alt={agency.name}
                  width={64}
                  height={64}
                  className="mb-6 object-cover rounded-xl border-2"
                  style={{ borderColor: accentColor }}
                  unoptimized
                />
              )}
              <h1 className="text-display-lg sm:text-display-xl text-white font-bold leading-tight">
                {agency.name}
              </h1>
              <div className="mt-4 h-1.5 w-16 rounded-full" style={{ backgroundColor: accentColor }} />
              {agency.slogan && (
                <p className="mt-5 text-body-lg text-white/70 max-w-md">{agency.slogan}</p>
              )}
              {agency.wilaya && (
                <p className="mt-3 flex items-center gap-1.5 text-body-sm text-white/40">
                  <MapPin className="h-3.5 w-3.5" />
                  {agency.wilaya}{agency.address ? ` — ${agency.address}` : ''}
                </p>
              )}
              <FadeInUp delay={0.15}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/agence/${agency.slug}/biens`}
                    className="inline-flex items-center gap-2 h-12 px-8 text-sm font-bold uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: accentColor, color: '#ffffff' }}
                  >
                    {t('nav.properties')} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/agence/${agency.slug}/contact`}
                    className="inline-flex items-center gap-2 h-12 px-8 border-2 border-white/20 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-colors hover:bg-white/5"
                  >
                    {t('nav.contact')}
                  </Link>
                </div>
              </FadeInUp>
            </div>
          </FadeIn>

          {/* Right: cover image (2 cols) */}
          <FadeInUp delay={0.2}>
            <div className="hidden lg:block lg:col-span-2">
              {agency.cover_image_url ? (
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden rotate-2 shadow-2xl">
                  <Image
                    src={agency.cover_image_url}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="aspect-[3/4] rounded-3xl rotate-2"
                  style={{ backgroundColor: `${accentColor}20` }}
                />
              )}
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}
