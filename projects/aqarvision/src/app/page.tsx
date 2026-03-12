import Link from 'next/link';
import Image from 'next/image';
import {
  Building2, ArrowRight, Search, Shield, Star, MapPin,
  CheckCircle2, Users, Zap,
} from 'lucide-react';
import { HeroSearchBar } from '@/components/search/hero-search-bar';
import { Suspense } from 'react';

/* ─── Data ─────────────────────────────────────────────────────── */

const CITIES = [
  { name: 'Alger',       count: 3240, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { name: 'Oran',        count: 1870, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
  { name: 'Constantine', count: 940,  image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=600&q=80' },
  { name: 'Annaba',      count: 620,  image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80' },
  { name: 'Tizi-Ouzou',  count: 480,  image: 'https://images.unsplash.com/photo-1567604446671-ce9ca99e1c91?w=600&q=80' },
  { name: 'Sétif',       count: 390,  image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=600&q=80' },
];

const STATS = [
  { label: 'Annonces actives',    value: '12 000+' },
  { label: 'Agences partenaires', value: '320+' },
  { label: 'Transactions/mois',   value: '800+' },
  { label: 'Wilayas couvertes',   value: '48' },
];

/* ─── Navbar ────────────────────────────────────────────────────── */

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-border/50 h-[72px] flex items-center">
      <div className="w-full max-w-content-xl mx-auto px-6 lg:px-8 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 bg-bleu-nuit rounded-xl flex items-center justify-center shadow-sm">
            <Building2 className="h-5 w-5 text-or" />
          </div>
          <span className="font-vitrine text-xl text-bleu-nuit tracking-tight">AqarVision</span>
        </Link>

        {/* CTAs — 2 audiences */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/recherche"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-body-sm font-semibold text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            Je suis particulier
          </Link>
          <Link
            href="/pro"
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-or text-white text-body-sm font-semibold rounded-lg hover:bg-or/90 transition-colors"
          >
            <Building2 className="h-3.5 w-3.5" />
            Je suis professionnel
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero — Recherche immobilière ──────────────────────────────── */

function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] pt-[72px] bg-bleu-nuit overflow-hidden">
      {/* Radial glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,150,62,0.08),transparent_50%)]" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-or/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-20 max-w-[900px] mx-auto w-full">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6 backdrop-blur-sm">
            <Search className="h-3.5 w-3.5" />
            +12 000 annonces sur 48 wilayas
          </div>
        </div>

        <h1 className="animate-fade-in-up font-vitrine text-display-xl text-white mb-5 leading-tight">
          Trouvez votre prochain bien<br />
          <span className="text-or">en Algérie</span>
        </h1>
        <p className="animate-fade-in-up text-body-lg text-white/60 mb-10 max-w-xl">
          Des milliers d&apos;annonces vérifiées dans 48 wilayas.
          Recherche avancée, alertes, carte interactive — 100% gratuit.
        </p>

        {/* Barre de recherche Github */}
        <div className="animate-fade-in-up w-full">
          <HeroSearchBar />
        </div>
      </div>

      {/* Social proof */}
      <div className="w-full glass-dark border-t border-white/10">
        <div className="max-w-content-xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/50">
          {STATS.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="font-semibold text-or text-sm">{s.value}</span>
              <span className="text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Villes populaires ─────────────────────────────────────────── */

function PopularCities() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-content-xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-or uppercase tracking-widest mb-3">Wilayas populaires</p>
          <h2 className="font-vitrine text-heading-2 text-foreground mb-3">Explorer par ville</h2>
          <p className="text-body text-muted-foreground">Des annonces dans toutes les wilayas d&apos;Algérie</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {CITIES.map(city => (
            <Link
              key={city.name}
              href={`/recherche?q=${encodeURIComponent(city.name)}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/2] block shadow-card hover:shadow-elevated transition-all duration-300"
            >
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 transition-transform duration-300 group-hover:-translate-y-1">
                <h3 className="text-heading-4 font-semibold text-white">{city.name}</h3>
                <p className="text-body-sm text-white/70">{city.count.toLocaleString('fr-FR')} annonces</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/recherche" className="inline-flex items-center gap-2 text-body-sm font-medium text-or hover:text-or/80 transition-colors">
            Voir toutes les annonces <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Encart AqarPro ────────────────────────────────────────────── */

function ProBanner() {
  return (
    <section className="section-padding bg-bleu-nuit relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(184,150,62,0.08),transparent_50%)]" />
      <div className="absolute top-10 right-10 w-64 h-64 bg-or/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative max-w-content mx-auto flex flex-col md:flex-row items-center gap-8 px-6">
        <div className="flex-1">
          <span className="text-caption font-bold text-or uppercase tracking-widest mb-2 block">AqarPro</span>
          <h2 className="font-vitrine text-heading-2 text-white mb-3">
            Vous êtes une agence immobilière ?
          </h2>
          <p className="text-body text-white/50 max-w-lg">
            Publiez vos annonces, recevez des leads qualifiés et gérez votre activité
            depuis un seul tableau de bord. Le premier SaaS immobilier pensé pour l&apos;Algérie.
          </p>
        </div>
        <Link
          href="/pro"
          className="shrink-0 inline-flex items-center gap-2 h-12 px-8 bg-or text-white text-body-sm font-semibold rounded-lg hover:bg-or/90 transition-colors"
        >
          Découvrir AqarPro <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-bleu-nuit border-t border-white/5 py-16 px-6 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-or/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="relative max-w-content-xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 mb-12">
          {[
            {
              title: 'AqarSearch',
              links: ['Rechercher un bien', 'Alertes de recherche', 'Mes favoris', 'Prix du marché'],
              hrefs: ['/recherche', '/espace/alertes', '/espace/favoris', '/prix-immobilier'],
            },
            {
              title: 'AqarPro',
              links: ['Espace professionnel', 'Annuaire agences', 'Tarifs', 'Créer une agence'],
              hrefs: ['/pro', '/agences', '/pricing', '/auth/register'],
            },
            {
              title: 'AqarVision',
              links: ['À propos', 'Confidentialité', 'Conditions d\'utilisation', 'Contact'],
              hrefs: ['#', '#', '#', '#'],
            },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-body-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link, i) => (
                  <li key={link}>
                    <Link href={col.hrefs[i]} className="text-body-sm text-white/40 hover:text-white/80 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-or" />
            </div>
            <span className="font-vitrine text-white text-sm">AqarVision</span>
          </div>
          <p className="text-caption text-white/40">
            © {new Date().getFullYear()} AqarVision. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-blanc-casse">
      <Navbar />
      <main>
        <Hero />
        <PopularCities />
        <ProBanner />
      </main>
      <Footer />
    </div>
  );
}
