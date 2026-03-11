import Link from 'next/link';
import Image from 'next/image';
import {
  Building2, ArrowRight, Search, Shield, Users, Star,
  Bell, Heart, MapPin, BarChart3,
  CheckCircle2, Zap, Globe2, MessageSquare, Layers,
} from 'lucide-react';

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
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200 h-[72px] flex items-center">
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-8 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl text-primary-900 tracking-tight">Aqar</span>
            <span className="text-neutral-400" style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Vision</span>
          </div>
        </Link>

        {/* CTAs droite — 2 produits distincts */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* AqarSearch — outlined */}
          <Link
            href="/recherche"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-body-sm font-semibold text-primary-700 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            AqarSearch
          </Link>
          {/* AqarPro — filled */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-primary-600 text-white text-body-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Building2 className="h-3.5 w-3.5" />
            Espace agence
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero — Vitrine écosystème ─────────────────────────────────── */

function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[90vh] pt-[72px]"
      style={{ background: 'linear-gradient(150deg, #0A1929 0%, #0D2D52 55%, #0F3D72 100%)' }}
    >
      {/* Accent drapeau algérien */}
      <div className="absolute top-[72px] left-0 right-0 h-[3px]">
        <div className="h-full w-full flex">
          <div className="flex-1 bg-green-600" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-green-600" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-12 max-w-[860px] mx-auto w-full">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
          <Layers className="h-3.5 w-3.5 text-white/70" />
          <span className="text-caption text-white/80">L'écosystème immobilier digital en Algérie</span>
        </div>

        {/* Titre */}
        <h1 className="font-display text-display-xl text-white mb-4 leading-tight">
          Deux produits.<br />
          <span className="text-primary-300">Un seul écosystème.</span>
        </h1>

        {/* Sous-titre */}
        <p className="text-body-lg text-white/70 mb-12 max-w-lg">
          AqarVision connecte les <strong className="text-white/90">particuliers</strong> qui cherchent un logement
          et les <strong className="text-white/90">agences</strong> qui veulent gérer leur activité — en Algérie et au-delà.
        </p>

        {/* 2 cartes produit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-[700px]">

          {/* AqarSearch */}
          <div className="flex flex-col text-left bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-colors">
            <div className="w-11 h-11 bg-primary-500/30 border border-primary-400/40 rounded-xl flex items-center justify-center mb-4">
              <Search className="h-5 w-5 text-primary-200" />
            </div>
            <span className="text-caption font-bold text-primary-300 uppercase tracking-widest mb-1">AqarSearch</span>
            <h2 className="font-display text-xl text-white mb-2 leading-snug">
              Vous cherchez un logement ?
            </h2>
            <p className="text-body-sm text-white/60 flex-1 mb-5">
              Des milliers d'annonces vérifiées partout en Algérie. Recherche avancée, alertes, favoris, carte interactive.
            </p>
            <Link
              href="/recherche"
              className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-white text-primary-700 text-body-sm font-semibold rounded-xl hover:bg-primary-50 transition-colors"
            >
              Rechercher un bien <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* AqarPro */}
          <div className="flex flex-col text-left bg-amber-500/10 border border-amber-400/30 backdrop-blur-sm rounded-2xl p-6 hover:bg-amber-500/15 transition-colors">
            <div className="w-11 h-11 bg-amber-500/30 border border-amber-400/40 rounded-xl flex items-center justify-center mb-4">
              <Building2 className="h-5 w-5 text-amber-200" />
            </div>
            <span className="text-caption font-bold text-amber-300 uppercase tracking-widest mb-1">AqarPro</span>
            <h2 className="font-display text-xl text-white mb-2 leading-snug">
              Vous êtes une agence ?
            </h2>
            <p className="text-body-sm text-white/60 flex-1 mb-5">
              Gérez vos biens, leads et clients depuis un seul tableau de bord. Vitrine en ligne, CRM, analytics.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-amber-400 text-amber-900 text-body-sm font-semibold rounded-xl hover:bg-amber-300 transition-colors"
            >
              Créer mon agence <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="w-full bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-display text-xl text-white">{s.value}</div>
              <div className="text-caption text-white/60">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pour les particuliers ─────────────────────────────────────── */

function ForParticuliers() {
  const features = [
    {
      icon: Search,
      title: 'Recherche intelligente',
      desc: 'Filtrez par wilaya, prix, surface, type de bien. Trouvez exactement ce que vous cherchez en quelques secondes.',
    },
    {
      icon: Bell,
      title: 'Alertes personnalisées',
      desc: 'Sauvegardez vos critères et recevez une notification dès qu\'un bien correspondant est publié.',
    },
    {
      icon: Heart,
      title: 'Favoris & comparaison',
      desc: 'Sauvegardez vos coups de cœur et comparez jusqu\'à 4 biens côte à côte.',
    },
    {
      icon: MessageSquare,
      title: 'Messagerie sécurisée',
      desc: 'Contactez les agences directement via la plateforme, sans divulguer vos coordonnées.',
    },
    {
      icon: MapPin,
      title: 'Recherche par carte',
      desc: 'Visualisez les biens sur une carte interactive et dessinez votre zone de recherche.',
    },
    {
      icon: BarChart3,
      title: 'Observatoire des prix',
      desc: 'Consultez les prix du marché par wilaya pour négocier en connaissance de cause.',
    },
  ];

  return (
    <section id="particuliers" className="py-24 px-6 bg-white">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          {/* Left — texte */}
          <div className="lg:w-[380px] shrink-0 lg:sticky lg:top-24">
            <span className="inline-flex items-center gap-2 text-caption font-semibold text-primary-600 uppercase tracking-widest mb-4">
              <Search className="h-3.5 w-3.5" /> AqarSearch
            </span>
            <h2 className="font-display text-display-md text-neutral-900 mb-4">
              Pour les particuliers
            </h2>
            <p className="text-body-lg text-neutral-500 mb-8">
              Trouvez, comparez et contactez — tout ce dont vous avez besoin pour votre projet immobilier en Algérie.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/recherche"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-primary-600 text-white text-body-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Search className="h-4 w-4" /> Rechercher un bien
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 border border-neutral-300 text-neutral-700 text-body-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Créer un compte gratuit
              </Link>
            </div>
          </div>

          {/* Right — features grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border border-neutral-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-heading-sm text-neutral-900 mb-1">{title}</h3>
                  <p className="text-body-sm text-neutral-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Pour les agences ──────────────────────────────────────────── */

function ForAgences() {
  const features = [
    {
      icon: Building2,
      title: 'Vitrine en ligne',
      desc: 'Votre mini-site personnalisé avec votre branding, vos annonces et vos coordonnées. Prêt en 5 minutes.',
    },
    {
      icon: Users,
      title: 'Gestion des leads',
      desc: 'CRM intégré : qualifiez, suivez et convertissez vos contacts avec un pipeline visuel.',
    },
    {
      icon: BarChart3,
      title: 'Analytics avancés',
      desc: 'Suivez les vues, clics, leads et conversions pour optimiser vos annonces.',
    },
    {
      icon: Zap,
      title: 'Publication rapide',
      desc: 'Publiez un bien en moins de 2 minutes avec génération IA du titre et de la description.',
    },
    {
      icon: Shield,
      title: 'Badge vérifié',
      desc: 'Obtenez le badge "Agence vérifiée" pour gagner la confiance des acheteurs et locataires.',
    },
    {
      icon: Globe2,
      title: 'Multi-pays',
      desc: 'Publiez des annonces en Algérie, France, Espagne, Dubai et plus encore.',
    },
  ];

  const plans = [
    { name: 'Starter',    price: 'Gratuit',    cta: 'Commencer',     href: '/signup',        highlight: false },
    { name: 'Pro',        price: '4 900 DA/m', cta: 'Essayer Pro',   href: '/signup',        highlight: true  },
    { name: 'Enterprise', price: 'Sur mesure', cta: 'Nous contacter', href: '/pricing',      highlight: false },
  ];

  return (
    <section id="agences" className="py-24 px-6 bg-neutral-50">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row-reverse items-start gap-16">
          {/* Right (visually left on LG) — texte */}
          <div className="lg:w-[380px] shrink-0 lg:sticky lg:top-24">
            <span className="inline-flex items-center gap-2 text-caption font-semibold text-amber-600 uppercase tracking-widest mb-4">
              <Building2 className="h-3.5 w-3.5" /> AqarPro
            </span>
            <h2 className="font-display text-display-md text-neutral-900 mb-4">
              Pour les agences
            </h2>
            <p className="text-body-lg text-neutral-500 mb-8">
              Le premier SaaS immobilier pensé pour le marché algérien. Gérez tout depuis un seul tableau de bord.
            </p>

            {/* Mini pricing */}
            <div className="flex flex-col gap-3 mb-6">
              {plans.map(plan => (
                <Link
                  key={plan.name}
                  href={plan.href}
                  className={[
                    'flex items-center justify-between px-5 py-3.5 rounded-xl border transition-colors',
                    plan.highlight
                      ? 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300',
                  ].join(' ')}
                >
                  <span className="text-body-sm font-semibold">{plan.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={['text-body-sm', plan.highlight ? 'text-white/80' : 'text-neutral-500'].join(' ')}>{plan.price}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/pricing"
              className="text-body-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              Comparer tous les plans <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Left — features */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border border-neutral-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 transition-colors">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-heading-sm text-neutral-900 mb-1">{title}</h3>
                  <p className="text-body-sm text-neutral-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Popular Cities ────────────────────────────────────────────── */

function PopularCities() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-display-md text-neutral-900 mb-3">Explorer par ville</h2>
          <p className="text-body-lg text-neutral-500">Des annonces dans toutes les wilayas d'Algérie</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {CITIES.map(city => (
            <Link
              key={city.name}
              href={`/recherche?q=${encodeURIComponent(city.name)}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/2] block shadow-sm"
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
                <h3 className="text-heading-md text-white">{city.name}</h3>
                <p className="text-body-sm text-white/70">{city.count.toLocaleString('fr-FR')} annonces</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/recherche" className="inline-flex items-center gap-2 text-body-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
            Voir toutes les annonces <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust / Why Us ────────────────────────────────────────────── */

function WhyUs() {
  const points = [
    { icon: Shield,       title: 'Agences vérifiées',  desc: 'Chaque agence passe par un processus de vérification avant d\'obtenir son badge.' },
    { icon: Star,         title: 'Score de confiance', desc: 'Chaque annonce reçoit un score basé sur la qualité des photos, la description et l\'agence.' },
    { icon: Search,       title: 'Recherche avancée',  desc: 'Filtres multicritères, carte interactive, alertes email — trouvez le bien idéal.' },
    { icon: CheckCircle2, title: '100% gratuit',        desc: 'La consultation et la recherche sont entièrement gratuites pour les acheteurs.' },
  ];

  return (
    <section className="py-20 px-6 bg-neutral-50">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="font-display text-display-md text-neutral-900 text-center mb-12">
          La confiance au cœur d'AqarVision
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {points.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-heading-sm text-neutral-900 mb-2">{title}</h3>
              <p className="text-body-sm text-neutral-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Dual CTA — bas de page ────────────────────────────────────── */

function DualCTA() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Particulier */}
        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-8 flex flex-col">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
            <Search className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-display text-display-sm text-neutral-900 mb-2">
            Je cherche un bien
          </h3>
          <p className="text-body-md text-neutral-500 flex-1 mb-6">
            Créez un compte gratuit pour sauvegarder vos favoris, activer des alertes et contacter directement les agences.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-primary-600 text-white text-body-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Créer un compte gratuit <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/recherche"
              className="inline-flex items-center justify-center h-11 px-5 border border-primary-300 text-primary-700 text-body-sm font-medium rounded-xl hover:bg-primary-100 transition-colors"
            >
              Parcourir les annonces
            </Link>
          </div>
        </div>

        {/* Agence */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 flex flex-col">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5">
            <Building2 className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="font-display text-display-sm text-neutral-900 mb-2">
            Je suis une agence
          </h3>
          <p className="text-body-md text-neutral-500 flex-1 mb-6">
            Publiez vos annonces, recevez des leads qualifiés et gérez votre présence en ligne depuis un seul tableau de bord.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-amber-500 text-white text-body-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
            >
              Créer mon agence <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center h-11 px-5 border border-amber-300 text-amber-700 text-body-sm font-medium rounded-xl hover:bg-amber-100 transition-colors"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-primary-900 py-16 px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {[
            {
              title: 'AqarSearch',
              links: ['Rechercher un bien', 'Alertes de recherche', 'Mes favoris', 'Prix du marché'],
              hrefs: ['/recherche', '/alertes', '/favoris', '/prix-immobilier'],
            },
            {
              title: 'International',
              links: ['Immobilier Espagne', 'Immobilier France', 'Immobilier Dubai', 'Toutes destinations'],
              hrefs: ['/recherche?country=ES', '/recherche?country=FR', '/recherche?country=AE', '/recherche'],
            },
            {
              title: 'AqarPro',
              links: ['Annuaire agences', 'Tableau de bord', 'Créer une agence', 'Tarifs'],
              hrefs: ['/agences', '/dashboard', '/signup', '/pricing'],
            },
            {
              title: 'Légal',
              links: ['À propos', 'Confidentialité', 'Conditions d\'utilisation', 'Contact'],
              hrefs: ['#', '#', '#', '#'],
            },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-body-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link, i) => (
                  <li key={link}>
                    <Link href={col.hrefs[i]} className="text-body-sm text-neutral-400 hover:text-white transition-colors">
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
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-white text-sm">AqarVision</span>
              <span className="text-neutral-500" style={{ fontSize: '9px', letterSpacing: '0.1em' }}>PLATEFORME IMMOBILIÈRE</span>
            </div>
          </div>
          <p className="text-caption text-neutral-500">
            © {new Date().getFullYear()} AqarVision. Tous droits réservés. · Plateforme immobilière algérienne
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ForParticuliers />
        <ForAgences />
        <PopularCities />
        <WhyUs />
        <DualCTA />
      </main>
      <Footer />
    </>
  );
}
