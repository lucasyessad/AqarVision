import { notFound } from 'next/navigation';
import { getAgencyBySlug } from '@/lib/queries/agency';
import { fetchSocialFeed } from '@/lib/social/fetch-feed';
import { ContactForm } from '@/components/agency/contact-form';
import { ConditionalMap } from '@/components/agency/location-map';
import { SocialFeedWidget } from '@/components/agency/social-feed-widget';
import { getTranslations } from '@/lib/i18n';
import { getThemeManifest } from '@/lib/themes';
import { PAGINATION } from '@/config';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

interface ContactPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) return {};
  const t = getTranslations(agency.locale ?? 'fr');
  return { title: t('contact.title') };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) notFound();

  const t = getTranslations(agency.locale ?? 'fr');
  const manifest = getThemeManifest(agency.theme);

  const hasSocial = agency.instagram_url || agency.facebook_url || agency.tiktok_url;
  const socialFeed = hasSocial
    ? await fetchSocialFeed({
        instagram_url: agency.instagram_url,
        facebook_url: agency.facebook_url,
        tiktok_url: agency.tiktok_url,
        limit: PAGINATION.SOCIAL_FEED_SMALL,
      })
    : { posts: [], embeds: [], hasApiData: false };

  const isDark = manifest.style.themeMode === 'dark';
  const accentColor = agency.secondary_color || agency.primary_color || '#234E6F';
  const isPremium = manifest.style.themeMode === 'dark' || manifest.id === 'premium' || manifest.id === 'luxury' || manifest.id === 'bold';

  const contactItems = [
    { icon: Phone, label: t('contact.phone'), value: agency.phone, href: agency.phone ? `tel:${agency.phone}` : null },
    { icon: Mail, label: t('contact.email'), value: agency.email, href: agency.email ? `mailto:${agency.email}` : null },
    { icon: Globe, label: t('contact.website'), value: agency.website, href: agency.website },
    { icon: MapPin, label: t('contact.address'), value: agency.address, href: null },
  ].filter((c) => c.value);

  // Premium/Luxury themes → elegant contact with centered heading
  if (isPremium) {
    return (
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              {t('contact.title')}
            </span>
            <h1
              className={`mt-4 font-display-classic text-display-lg ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('contact.heading')}
            </h1>
            <div
              className="mx-auto mt-6 h-0.5 w-20"
              style={{ backgroundColor: accentColor }}
            />
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Coordonnées */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {contactItems.map((item) => {
                const content = (
                  <div
                    className={`rounded-lg p-6 text-center transition-transform hover:scale-[1.02] lg:text-left ${
                      isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:shadow-lg'
                    }`}
                  >
                    <div
                      className="text-xs uppercase tracking-wider"
                      style={{ color: accentColor }}
                    >
                      {item.label}
                    </div>
                    <div
                      className={`mt-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {item.value}
                    </div>
                  </div>
                );

                return item.href ? (
                  <a key={item.label} href={item.href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>

            {/* Formulaire */}
            <div
              className={`rounded-xl p-8 ${
                isDark ? 'bg-white/5' : 'bg-white shadow-lg'
              }`}
            >
              <h2
                className={`mb-6 text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('contact.sendMessage')}
              </h2>
              <ContactForm agency={agency} />
            </div>
          </div>

          {/* Carte */}
          <ConditionalMap
            latitude={agency.latitude ?? null}
            longitude={agency.longitude ?? null}
            label={agency.name}
            className={`mt-12 h-72 w-full overflow-hidden rounded-xl ${
              isDark ? 'opacity-90' : ''
            }`}
          />

          {/* Widget réseaux sociaux */}
          <div className="mt-12">
            <SocialFeedWidget
              agency={agency}
              posts={socialFeed.posts}
              embeds={socialFeed.embeds}
              hasApiData={socialFeed.hasApiData}
            />
          </div>
        </div>
      </section>
    );
  }

  // Standard themes → professional contact
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-heading-lg text-neutral-900 mb-8">
        {t('contact.contactName', { name: agency.name })}
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coordonnées */}
        <div className="flex flex-col gap-4">
          {contactItems.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 bg-white rounded-xl border border-neutral-200 p-5"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <item.icon className="h-4.5 w-4.5" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-caption text-neutral-400">{item.label}</p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-0.5 text-body-sm font-medium transition-colors hover:underline"
                    style={{ color: accentColor }}
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-0.5 text-body-sm font-medium text-neutral-900">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-heading-sm text-neutral-900 mb-6">{t('contact.sendMessage')}</h2>
          <ContactForm agency={agency} />
        </div>
      </div>

      {/* Carte */}
      <ConditionalMap
        latitude={agency.latitude ?? null}
        longitude={agency.longitude ?? null}
        label={agency.name}
        className="mt-8 h-64 w-full overflow-hidden rounded-xl border border-neutral-200"
      />

      {/* Widget réseaux sociaux */}
      <div className="mt-8">
        <SocialFeedWidget
          agency={agency}
          posts={socialFeed.posts}
          embeds={socialFeed.embeds}
          hasApiData={socialFeed.hasApiData}
        />
      </div>
    </div>
  );
}
