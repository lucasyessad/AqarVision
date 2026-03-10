import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Playfair_Display, Cormorant_Garamond, Inter } from 'next/font/google';
import { LuxuryLayout } from '@/components/agency/luxury-layout';
import { getAgencyBySlug } from '@/lib/queries/agency';
import type { Metadata } from 'next';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

interface AgencyLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AgencyLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) return { title: 'Agence introuvable' };

  const description = agency.description
    || `${agency.name} — Agence immobilière${agency.wilaya ? ` à ${agency.wilaya}` : ''}, Algérie`;

  return {
    title: {
      default: agency.name,
      template: `%s | ${agency.name}`,
    },
    description,
    openGraph: {
      title: agency.name,
      description,
      type: 'website',
      ...(agency.cover_image_url && { images: [{ url: agency.cover_image_url, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: agency.name,
      description,
    },
  };
}

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function AgencyLayout({ children, params }: AgencyLayoutProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) notFound();

  const fontVars = `${playfair.variable} ${cormorant.variable} ${inter.variable}`;

  // Enterprise → Luxury Layout
  if (agency.active_plan === 'enterprise') {
    return (
      <div className={fontVars}>
        <LuxuryLayout agency={agency}>{children}</LuxuryLayout>
      </div>
    );
  }

  // Starter / Pro → Layout basique
  return (
    <div className={`min-h-screen bg-white ${fontVars}`}>
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href={`/agence/${slug}`} className="text-lg font-semibold">
            {agency.name}
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href={`/agence/${slug}`}>Accueil</Link>
            <Link href={`/agence/${slug}/biens`}>Biens</Link>
            <Link href={`/agence/${slug}/a-propos`}>À propos</Link>
            <Link href={`/agence/${slug}/contact`}>Contact</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t px-6 py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} {agency.name}
      </footer>
    </div>
  );
}
