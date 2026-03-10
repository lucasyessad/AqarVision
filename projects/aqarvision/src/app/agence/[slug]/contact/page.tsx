import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Agency } from '@/types/database';

interface ContactPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!agency) notFound();

  const isEnterprise = agency.active_plan === 'enterprise';
  const accentColor = (agency as Agency).secondary_color || agency.primary_color;
  const isDark = (agency as Agency).theme_mode === 'dark';

  const contactItems = [
    { label: 'Téléphone', value: agency.phone, href: agency.phone ? `tel:${agency.phone}` : null },
    { label: 'Email', value: agency.email, href: agency.email ? `mailto:${agency.email}` : null },
    { label: 'Site web', value: agency.website, href: agency.website },
    { label: 'Adresse', value: agency.address, href: null },
  ].filter((c) => c.value);

  // Enterprise → Contact cards luxe
  if (isEnterprise) {
    return (
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="mx-auto max-w-3xl px-6">
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

          <div className="grid gap-6 sm:grid-cols-2">
            {contactItems.map((item) => {
              const content = (
                <div
                  className={`rounded-lg p-6 text-center transition-transform hover:scale-[1.02] ${
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
        </div>
      </section>
    );
  }

  // Starter / Pro → Contact basique
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold">Contacter {agency.name}</h1>
      <div className="grid gap-4 sm:grid-cols-2">
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
    </div>
  );
}
