import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Preview vitrine — AqarVision',
};

export default async function BrandingPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name, slug, owner_id')
    .eq('slug', slug)
    .single();

  if (!agency || agency.owner_id !== user.id) redirect('/login');

  const vitrineUrl = `/agence/${agency.slug}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/aqarpro/${slug}/settings/branding`}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-body-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au branding
          </Link>
          <div>
            <h1 className="text-heading-lg text-neutral-900">Aperçu de votre vitrine</h1>
            <p className="text-body-sm text-neutral-500 mt-0.5">
              Visualisez le rendu de votre mini-site avant publication
            </p>
          </div>
        </div>
        <a
          href={vitrineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-10 px-4 bg-primary-600 text-white text-body-sm font-semibold rounded-md hover:bg-primary-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Ouvrir en plein écran
        </a>
      </div>

      {/* Device toggle + preview */}
      <PreviewFrame vitrineUrl={vitrineUrl} />
    </div>
  );
}

function PreviewFrame({ vitrineUrl }: { vitrineUrl: string }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Desktop preview */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-8">
            <div className="bg-white rounded-md border border-neutral-200 px-3 py-1 text-caption text-neutral-400 truncate">
              aqarvision.dz{vitrineUrl}
            </div>
          </div>
        </div>
        <div className="relative w-full" style={{ height: '70vh' }}>
          <iframe
            src={vitrineUrl}
            title="Aperçu vitrine"
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>

      {/* Mobile preview hint */}
      <p className="text-caption text-neutral-400 text-center">
        Redimensionnez la fenêtre de votre navigateur pour tester le rendu mobile
      </p>
    </div>
  );
}
