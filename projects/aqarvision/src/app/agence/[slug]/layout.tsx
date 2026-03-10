import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LuxuryLayout } from '@/components/agency/luxury-layout';
import type { Agency } from '@/types/database';

interface AgencyLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

async function getAgency(slug: string): Promise<Agency | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

export default async function AgencyLayout({ children, params }: AgencyLayoutProps) {
  const { slug } = await params;
  const agency = await getAgency(slug);

  if (!agency) notFound();

  // Enterprise → Luxury Layout
  if (agency.active_plan === 'enterprise') {
    return <LuxuryLayout agency={agency}>{children}</LuxuryLayout>;
  }

  // Starter / Pro → Layout basique
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="text-lg font-semibold">{agency.name}</span>
          <nav className="flex gap-6 text-sm">
            <a href={`/agence/${slug}`}>Accueil</a>
            <a href={`/agence/${slug}/biens`}>Biens</a>
            <a href={`/agence/${slug}/a-propos`}>À propos</a>
            <a href={`/agence/${slug}/contact`}>Contact</a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t px-6 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {agency.name}
      </footer>
    </div>
  );
}
