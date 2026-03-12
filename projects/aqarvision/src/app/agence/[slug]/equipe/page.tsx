import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getAgencyBySlug } from '@/lib/queries/agency';
import { getTranslations } from '@/lib/i18n';
import { Users, Mail, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

interface TeamPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) return {};
  const t = getTranslations(agency.locale ?? 'fr');
  return { title: `${t('nav.team')} — ${agency.name}` };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) notFound();

  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color || '#234E6F';

  const supabase = await createClient();
  const { data: members } = await supabase
    .from('agency_members')
    .select('id, role, full_name, phone, email, avatar_url')
    .eq('agency_id', agency.id)
    .eq('is_active', true)
    .order('role', { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-heading-lg text-neutral-900">
        {t('team.heading')}
      </h1>
      <div className="mt-3 agency-line" style={{ backgroundColor: accentColor }} />
      <p className="mt-4 text-body-sm text-neutral-600 max-w-2xl">
        {t('team.description', { name: agency.name })}
      </p>

      {members && members.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            const name = member.full_name || 'Membre';
            const roleLabel =
              member.role === 'admin'
                ? t('team.admin')
                : member.role === 'agent'
                  ? t('team.agent')
                  : t('team.member');

            return (
              <div
                key={member.id}
                className="bg-white rounded-xl border border-neutral-200 p-6 text-center"
              >
                {member.avatar_url ? (
                  <Image
                    src={member.avatar_url}
                    alt={name}
                    width={80}
                    height={80}
                    className="mx-auto rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div
                    className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <Users className="h-8 w-8" style={{ color: accentColor }} />
                  </div>
                )}
                <p className="mt-4 text-body-md font-semibold text-neutral-900">
                  {name}
                </p>
                <p className="text-caption" style={{ color: accentColor }}>
                  {roleLabel}
                </p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border-2 border-dashed border-neutral-200 bg-white py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-neutral-300" />
          <p className="mt-4 text-body-md text-neutral-500">{t('team.empty')}</p>
        </div>
      )}
    </div>
  );
}
