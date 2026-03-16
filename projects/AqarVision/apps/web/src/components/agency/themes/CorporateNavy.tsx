import type { AgencyThemeProps } from "./types";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { Phone, Mail, MapPin, ChevronRight, Check } from "lucide-react";
import { ThemeFonts } from "./ThemeFonts";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80";
const FALLBACK_ABOUT = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80";

export default function CorporateNavy({ agency, listings, locale }: AgencyThemeProps) {
  const primaryColor = agency.primary_color ?? "#0F1B3D";
  const accentColor = agency.accent_color ?? "#2563EB";
  const secondaryColor = agency.secondary_color ?? "#64748B";
  const mainBranch = agency.branches?.[0];
  const yearFounded = agency.created_at ? new Date(agency.created_at).getFullYear() : 2020;

  return (
    <div className="bg-white text-slate-700 font-light" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <ThemeFonts themeId="corporate-navy" />
      {/* Topbar */}
      <div
        className="hidden md:flex justify-between px-12 py-2 text-xs text-white/70"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-4">
          {agency.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {agency.phone}
            </span>
          )}
          {agency.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {agency.email}
            </span>
          )}
        </div>
        <span>Lun — Sam 9h — 19h</span>
      </div>

      {/* Nav */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {agency.logo_url && (
            <Image src={agency.logo_url} alt={agency.name} width={36} height={36} className="rounded" />
          )}
          <span
            className="text-xl font-semibold"
            style={{ color: primaryColor, fontFamily: "'Source Serif 4', serif" }}
          >
            {agency.name}
          </span>
        </div>
        <ul className="hidden md:flex gap-8 text-sm font-normal">
          <li><a href="#biens" className="hover:text-blue-600 transition-colors">Nos biens</a></li>
          <li><a href="#agence" className="hover:text-blue-600 transition-colors">L&apos;agence</a></li>
          <li><a href="#services" className="hover:text-blue-600 transition-colors">Services</a></li>
          <li><a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a></li>
        </ul>
        <a
          href="#contact"
          className="rounded-md px-5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          Estimation gratuite
        </a>
      </nav>

      {/* Hero */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center px-6 md:px-12 py-16 md:py-20 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold leading-tight" style={{ fontFamily: "'Source Serif 4', serif" }}>
            Votre partenaire immobilier à {mainBranch?.wilaya_code ?? "votre ville"}
          </h1>
          <p className="text-white/65 leading-relaxed mt-5 mb-8">
            Depuis {yearFounded}, nous offrons un service professionnel et transparent à nos clients
            — acheteurs, vendeurs et investisseurs.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="#biens"
              className="rounded-md px-7 py-3 text-sm font-medium text-white transition hover:opacity-90 hover:-translate-y-0.5"
              style={{ backgroundColor: accentColor }}
            >
              Voir nos biens
            </a>
            <a
              href="#contact"
              className="rounded-md px-7 py-3 text-sm border border-white/20 bg-white/10 text-white"
            >
              Nous contacter
            </a>
          </div>
        </div>
        <div className="relative h-64 md:h-[400px] rounded-lg overflow-hidden">
          <Image
            src={agency.cover_url ?? FALLBACK_COVER}
            alt={agency.name}
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Trust bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-200">
        {[
          { num: agency.listing_count, label: "Biens en portefeuille" },
          { num: `${listings.length}+`, label: "Transactions réalisées" },
          { num: agency.branches.length, label: "Agences" },
          { num: "98%", label: "Satisfaction clients" },
        ].map((item, i) => (
          <div
            key={i}
            className="py-8 px-6 text-center border-e border-slate-200 last:border-e-0"
          >
            <div
              className="text-2xl md:text-3xl font-semibold"
              style={{ color: primaryColor, fontFamily: "'Source Serif 4', serif" }}
            >
              {item.num}
            </div>
            <div className="text-xs text-slate-500 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Listings section */}
      <section id="biens" className="px-6 md:px-12 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2
            className="text-xl md:text-2xl font-semibold"
            style={{ color: primaryColor, fontFamily: "'Source Serif 4', serif" }}
          >
            Nos biens récents
          </h2>
          <span className="text-sm font-medium flex items-center gap-1" style={{ color: accentColor }}>
            Voir tout <ChevronRight className="h-4 w-4" />
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.slice(0, 6).map((listing) => (
            <Link
              key={listing.id}
              href={`/annonce/${listing.slug}`}
              className="group border border-slate-200 rounded-lg overflow-hidden transition hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative h-52">
                <Image
                  src={listing.cover_url ?? "https://picsum.photos/seed/" + listing.id + "/600/400"}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
                <span
                  className="absolute top-3 start-3 text-white text-[10px] font-medium px-3 py-1 rounded"
                  style={{ backgroundColor: accentColor }}
                >
                  {listing.property_type}
                </span>
              </div>
              <div className="p-5">
                <div className="text-lg md:text-xl font-semibold" style={{ color: primaryColor, fontFamily: "'Source Serif 4', serif" }}>
                  {formatPrice(listing.current_price, listing.currency)}
                </div>
                <div className="text-sm mt-1 mb-3">{listing.title}</div>
                <div className="flex gap-4 text-xs text-slate-500">
                  {listing.surface_m2 && <span>{listing.surface_m2} m²</span>}
                  {listing.rooms && <span>{listing.rooms} ch.</span>}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
                  <span>{listing.commune_name}, {listing.wilaya_name}</span>
                  <span>Réf. AQ-{listing.reference_number}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About section */}
      <div
        id="agence"
        className="mx-4 md:mx-12 rounded-lg bg-slate-100 p-8 md:p-12 grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-8 items-center"
      >
        <div className="relative h-64 md:h-[350px] rounded-md overflow-hidden">
          <Image
            src={agency.cover_url ?? FALLBACK_ABOUT}
            alt={`${agency.name} - L'agence`}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2
            className="text-xl md:text-2xl font-semibold mb-4"
            style={{ color: primaryColor, fontFamily: "'Source Serif 4', serif" }}
          >
            Un accompagnement professionnel à chaque étape
          </h2>
          {agency.description && (
            <p className="text-slate-500 leading-relaxed mb-4">{agency.description}</p>
          )}
          <div id="services" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {[
              { title: "Transaction", desc: "Achat, vente et investissement" },
              { title: "Estimation", desc: "Évaluation précise de votre bien" },
              { title: "Gestion locative", desc: "Gestion complète de vos biens" },
              { title: "Conseil", desc: "Juridique, fiscal et patrimonial" },
            ].map((service, i) => (
              <div key={i} className="p-4 bg-white rounded-md border border-slate-200">
                <div className="text-sm font-medium mb-1" style={{ color: primaryColor }}>
                  {service.title}
                </div>
                <div className="text-xs text-slate-500">{service.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact section */}
      <section id="contact" className="px-6 md:px-12 py-16">
        <h2
          className="text-xl md:text-2xl font-semibold mb-8"
          style={{ color: primaryColor, fontFamily: "'Source Serif 4', serif" }}
        >
          Contactez-nous
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 border border-slate-200 rounded-lg">
            <h3
              className="text-lg font-semibold mb-5"
              style={{ color: primaryColor, fontFamily: "'Source Serif 4', serif" }}
            >
              Nos coordonnées
            </h3>
            <div className="space-y-3 text-slate-500">
              {mainBranch?.address_text && (
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" /> {mainBranch.address_text}
                </p>
              )}
              {agency.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" /> {agency.phone}
                </p>
              )}
              {agency.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" /> {agency.email}
                </p>
              )}
            </div>
          </div>
          <div className="p-8 border border-slate-200 rounded-lg">
            <h3
              className="text-lg font-semibold mb-5"
              style={{ color: primaryColor, fontFamily: "'Source Serif 4', serif" }}
            >
              Envoyez un message
            </h3>
            <form className="space-y-3">
              <input
                type="text"
                placeholder="Nom"
                className="w-full border border-slate-200 rounded-md px-4 py-3 text-sm outline-none focus:border-blue-600 transition"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-slate-200 rounded-md px-4 py-3 text-sm outline-none focus:border-blue-600 transition"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                className="w-full border border-slate-200 rounded-md px-4 py-3 text-sm outline-none focus:border-blue-600 transition"
              />
              <textarea
                placeholder="Votre message"
                rows={3}
                className="w-full border border-slate-200 rounded-md px-4 py-3 text-sm outline-none focus:border-blue-600 transition resize-none"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="flex flex-col md:flex-row justify-between px-6 md:px-12 py-6 text-xs text-white/50"
        style={{ backgroundColor: primaryColor }}
      >
        <span>&copy; {new Date().getFullYear()} {agency.name}</span>
        <span>
          Propulsé par <span style={{ color: accentColor }}>Aqar</span>Pro
        </span>
      </footer>
    </div>
  );
}
