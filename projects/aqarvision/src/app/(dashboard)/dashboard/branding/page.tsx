import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BrandingForm } from './form';

export default async function BrandingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Récupérer l'agence de l'utilisateur
  const { data: agency, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (error || !agency) {
    return (
      <div className="p-8">
        <p className="text-red-600">Agence introuvable. Veuillez en créer une.</p>
      </div>
    );
  }

  const isEnterprise = agency.active_plan === 'enterprise';

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-2xl font-bold">Branding</h1>
      <p className="mb-8 text-sm text-gray-500">
        Personnalisez l&apos;apparence de votre site vitrine
      </p>

      {/* Aperçu cover (Enterprise) */}
      {isEnterprise && agency.cover_image_url && (
        <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-xl">
          <Image
            src={agency.cover_image_url}
            alt="Cover de l'agence"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <p className="text-xs uppercase tracking-widest opacity-70">Aperçu couverture</p>
            <p className="mt-1 text-lg font-semibold">{agency.name}</p>
          </div>
        </div>
      )}

      <BrandingForm agency={agency} isEnterprise={isEnterprise} />
    </div>
  );
}
