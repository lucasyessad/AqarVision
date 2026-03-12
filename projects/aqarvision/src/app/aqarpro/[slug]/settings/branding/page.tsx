import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Eye } from 'lucide-react';
import { PLANS } from '@/config';
import { BrandingForm } from './form';
import type { AgencyWilaya } from '@/types/database';

export default async function BrandingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: agency, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (error || !agency) {
    return (
      <div className="p-8">
        <p className="text-body-sm text-red-600">Agence introuvable. Veuillez en créer une.</p>
      </div>
    );
  }

  const isEnterprise = agency.active_plan === PLANS.ENTERPRISE;

  // Charger les wilayas de l'agence
  const { data: agencyWilayas } = await supabase
    .from('agency_wilayas')
    .select('*')
    .eq('agency_id', agency.id)
    .order('is_headquarters', { ascending: false });

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-heading-lg text-neutral-900">Branding & Personnalisation</h1>
          <p className="mt-1 text-body-sm text-neutral-500">
            Personnalisez l&apos;apparence de votre site vitrine
          </p>
        </div>
        <Link
          href={`/aqarpro/${agency.slug}/settings/branding/preview`}
          className="inline-flex items-center gap-2 h-10 px-4 text-body-sm font-semibold text-primary-600 border border-primary-200 rounded-md hover:bg-primary-50 transition-colors"
        >
          <Eye className="h-4 w-4" />
          Prévisualiser la vitrine
        </Link>
      </div>

      {/* Aperçu cover (Enterprise) */}
      {isEnterprise && agency.cover_image_url && (
        <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-xl">
          <Image
            src={agency.cover_image_url}
            alt="Cover de l'agence"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <p className="text-caption uppercase tracking-widest opacity-70">Aperçu couverture</p>
            <p className="mt-1 text-body-lg font-semibold">{agency.name}</p>
          </div>
        </div>
      )}

      <BrandingForm
        agency={agency}
        isEnterprise={isEnterprise}
        initialWilayas={(agencyWilayas as AgencyWilaya[]) || []}
      />
    </div>
  );
}
