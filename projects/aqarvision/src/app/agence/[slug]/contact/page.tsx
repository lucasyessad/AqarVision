import { notFound } from 'next/navigation';
import { getAgencyBySlug } from '@/lib/queries/agency';
import { fetchSocialFeed } from '@/lib/social/fetch-feed';
import { ContactForm } from '@/components/agency/contact-form';
import { ConditionalMap } from '@/components/agency/location-map';
import { SocialFeedWidget } from '@/components/agency/social-feed-widget';
import type { Metadata } from 'next';

interface ContactPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) return {};
  return { title: 'Contact' };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) notFound();

  const hasSocial = agency.instagram_url || agency.facebook_url || agency.tiktok_url;
  const socialFeed = hasSocial
    ? await fetchSocialFeed({
        instagram_url: agency.instagram_url,
        facebook_url: agency.facebook_url,
        tiktok_url: agency.tiktok_url,
        limit: 3,
      })
    : { posts: [], embeds: [], hasApiData: false };

  const isEnterprise = agency.active_plan === 'enterprise';
  const accentColor = agency.secondary_color || agency.primary_color;
  const isDark = agency.theme_mode === 'dark';

  const contactItems = [
    { label: 'Téléphone', value: agency.phone, href: agency.phone ? `tel:${agency.phone}` : null },
    { label: 'Email', value: agency.email, href: agency.email ? `mailto:${agency.email}` : null },
    { label: 'Site web', value: agency.website, href: agency.website },
    { label: 'Adresse', value: agency.address, href: null },
  ].filter((c) => c.value);

  // Enterprise → Contact luxe avec formulaire
  if (isEnterprise) {
    return (
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              Contact
            </span>
            <h1
              className={`mt-4 font-display-classic text-display-lg ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Nous contacter
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
                Envoyez-nous un message
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

  // Starter / Pro → Contact basique avec formulaire
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold">Contacter {agency.name}</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Coordonnées */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {contactItems.map((item) => (
            <div key={item.label} className="rounded-lg border p-4">
              <span className="text-sm text-gray-500">{item.label}</span>
              {item.href ? (
                <a href={item.href} className="mt-1 block font-medium text-blue-600 hover:underline">
                  {item.value}
                </a>
              ) : (
                <p className="mt-1 font-medium">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <div className="rounded-xl border p-6">
          <h2 className="mb-6 text-lg font-semibold">Envoyez-nous un message</h2>
          <ContactForm agency={agency} />
        </div>
      </div>

      {/* Carte */}
      <ConditionalMap
        latitude={agency.latitude ?? null}
        longitude={agency.longitude ?? null}
        label={agency.name}
        className="mt-8 h-64 w-full overflow-hidden rounded-xl"
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
