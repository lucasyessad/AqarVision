import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LuxuryHero } from '@/components/agency/luxury-hero';
import { LuxuryPropertiesSection } from '@/components/agency/luxury-properties-section';
import { LuxuryAboutSection } from '@/components/agency/luxury-about-section';
import { SocialFeedSection } from '@/components/agency/social-feed-section';
import { getAgencyBySlug, getAgencyProperties } from '@/lib/queries/agency';
import { fetchSocialFeed } from '@/lib/social/fetch-feed';
import { getTranslations } from '@/lib/i18n';
import { formatPrice, getLocationLabel } from '@/lib/utils/format';
import { PLANS } from '@/config';
import { FadeInUp, FadeIn, StaggerContainer } from '@/components/ui/animated-sections';
import { ArrowRight, MapPin, Maximize2, BedDouble, Phone } from 'lucide-react';
import type { Metadata } from 'next';

interface AgencyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AgencyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) return {};
  return {
    title: { absolute: `${agency.name} — Agence immobilière${agency.wilaya ? ` à ${agency.wilaya}` : ''}` },
  };
}

export default async function AgencyPage({ params }: AgencyPageProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) notFound();

  const t = getTranslations(agency.locale ?? 'fr');
  const hasSocial = agency.instagram_url || agency.facebook_url || agency.tiktok_url;

  const [properties, socialFeed] = await Promise.all([
    getAgencyProperties(agency.id, 6),
    hasSocial
      ? fetchSocialFeed({
          instagram_url: agency.instagram_url,
          facebook_url: agency.facebook_url,
          tiktok_url: agency.tiktok_url,
        })
      : Promise.resolve({ posts: [], embeds: [], hasApiData: false }),
  ]);

  const primaryColor = agency.primary_color || '#234E6F';
  const accentColor = agency.accent_color || primaryColor;

  // Enterprise → Pages Luxury
  if (agency.active_plan === PLANS.ENTERPRISE) {
    return (
      <>
        <LuxuryHero agency={agency} />
        <LuxuryPropertiesSection agency={agency} properties={properties} />
        <LuxuryAboutSection agency={agency} showStats={false} />
        <SocialFeedSection
          agency={agency}
          posts={socialFeed.posts}
          embeds={socialFeed.embeds}
          hasApiData={socialFeed.hasApiData}
        />
      </>
    );
  }

  // Starter / Pro → Page professionnelle
  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '420px' }}>
        {/* Background: cover image OR gradient */}
        {agency.cover_image_url ? (
          <div className="absolute inset-0">
            <Image
              src={agency.cover_image_url}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </div>
        ) : (
          <div className="absolute inset-0 hero-gradient">
            {/* Decorative dot pattern */}
            <div className="absolute inset-0 opacity-[0.07]" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }} />
          </div>
        )}

        <FadeIn>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 text-center">
          {agency.logo_url && (
            <Image
              src={agency.logo_url}
              alt={agency.name}
              width={72}
              height={72}
              className="mx-auto mb-6 object-cover border-2 border-white/20 shadow-lg"
              style={{ borderRadius: 'var(--agency-radius, 1rem)' }}
              unoptimized
            />
          )}
          <h1 className="text-display-md sm:text-display-lg font-vitrine text-white">
            {agency.name}
          </h1>

          {/* Decorative accent line */}
          <div
            className="mx-auto mt-4 h-0.5 w-16"
            style={{ backgroundColor: accentColor }}
          />

          {agency.slogan && (
            <p className="mt-4 text-body-lg text-white/75 max-w-xl mx-auto">
              {agency.slogan}
            </p>
          )}
          {agency.wilaya && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-body-sm text-white/50">
              <MapPin className="h-3.5 w-3.5" />
              {agency.wilaya}{agency.address ? ` — ${agency.address}` : ''}
            </p>
          )}
          <FadeInUp delay={0.2}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/agence/${slug}/biens`}
              className="inline-flex items-center gap-2 h-11 px-6 bg-white text-foreground text-body-sm font-semibold transition-all hover:bg-neutral-100 hover:shadow-lg"
              style={{ borderRadius: 'var(--agency-radius-sm, 0.5rem)' }}
            >
              {t('nav.properties')} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/agence/${slug}/contact`}
              className="inline-flex items-center gap-2 h-11 px-6 border border-white/30 text-white text-body-sm font-semibold transition-all hover:bg-white/10"
              style={{ borderRadius: 'var(--agency-radius-sm, 0.5rem)' }}
            >
              <Phone className="h-4 w-4" /> {t('nav.contact')}
            </Link>
          </div>
          </FadeInUp>
        </div>
        </FadeIn>
      </section>

      {/* ── Properties Section ── */}
      {properties.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <FadeInUp>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-heading-lg text-foreground">{t('properties.featured')}</h2>
              <p className="mt-1 text-body-sm text-muted-foreground">
                {t('properties.latestFrom', { name: agency.name })}
              </p>
            </div>
            <Link
              href={`/agence/${slug}/biens`}
              className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-medium hover:underline transition-colors"
              style={{ color: accentColor }}
            >
              {t('properties.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          </FadeInUp>

          <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <FadeInUp key={property.id}>
              <Link
                href={`/agence/${slug}/biens/${property.id}`}
                className="group bg-white overflow-hidden border border-neutral-200 hover:shadow-lg hover:border-neutral-300 transition-all block"
                style={{ borderRadius: 'var(--agency-radius, 0.75rem)' }}
              >
                <div className="relative aspect-[4/3] bg-neutral-100">
                  {property.images[0] ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-body-sm text-neutral-300">
                      {t('properties.noPhoto')}
                    </div>
                  )}
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 text-caption font-semibold uppercase tracking-wider text-white"
                    style={{ backgroundColor: accentColor, borderRadius: 'var(--agency-radius-badge, 0.375rem)' }}
                  >
                    {property.transaction_type === 'sale' ? t('properties.sale') : t('properties.rent')}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-body-sm font-semibold text-foreground line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-caption text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {getLocationLabel(property)}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-caption text-muted-foreground">
                    {property.surface && (
                      <span className="flex items-center gap-1">
                        <Maximize2 className="h-3 w-3" /> {property.surface} m²
                      </span>
                    )}
                    {property.rooms && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-3 w-3" /> {property.rooms} {t('properties.rooms')}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-body-sm font-bold" style={{ color: accentColor }}>
                    {formatPrice(property.price, property.currency)}
                    {property.transaction_type === 'rent' && (
                      <span className="text-muted-foreground font-normal"> /mois</span>
                    )}
                  </p>
                </div>
              </Link>
              </FadeInUp>
            ))}
          </StaggerContainer>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href={`/agence/${slug}/biens`}
              className="inline-flex items-center gap-1.5 text-body-sm font-medium"
              style={{ color: accentColor }}
            >
              {t('properties.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* ── About Preview ── */}
      {agency.description && (
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
                href={`/agence/${slug}/a-propos`}
                className="mt-4 inline-flex items-center gap-1.5 text-body-sm font-medium transition-colors"
                style={{ color: accentColor }}
              >
                {t('about.readMore')} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            </FadeInUp>
          </div>
        </section>
      )}

      {/* ── CTA Contact ── */}
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
              href={`/agence/${slug}/contact`}
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

      <SocialFeedSection
        agency={agency}
        posts={socialFeed.posts}
        embeds={socialFeed.embeds}
        hasApiData={socialFeed.hasApiData}
      />
    </>
  );
}
