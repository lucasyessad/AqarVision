import type { AgencyThemeProps } from "./types";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { Phone, Mail, MapPin, ChevronRight, Check } from "lucide-react";
import { ThemeFonts } from "./ThemeFonts";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80";
const FALLBACK_ABOUT = "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=500&q=80";

export default function ArtDeco({ agency, listings, locale }: AgencyThemeProps) {
  const primaryColor = agency.primary_color ?? "#1B5E3B";
  const accentColor = agency.accent_color ?? "#C9A84C";
  const secondaryColor = agency.secondary_color ?? "#141210";
  const mainBranch = agency.branches?.[0];
  const yearFounded = agency.created_at ? new Date(agency.created_at).getFullYear() : 2020;

  return (
    <div className="bg-[#F8F5EE] text-[#3A3530] font-light" style={{ fontFamily: "'Figtree', sans-serif" }}>
      <ThemeFonts themeId="art-deco" />
      {/* Deco stripe bar */}
      <div className="h-1 flex">
        <div className="flex-1" style={{ backgroundColor: primaryColor }} />
        <div className="flex-1" style={{ backgroundColor: accentColor }} />
        <div className="flex-1" style={{ backgroundColor: primaryColor }} />
      </div>

      {/* Nav */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 border-b border-black/[0.08]">
        <div className="flex items-center gap-3">
          {agency.logo_url && (
            <Image src={agency.logo_url} alt={agency.name} width={32} height={32} />
          )}
          <span className="text-2xl font-bold tracking-wide text-[#141210]" style={{ fontFamily: "'Bodoni Moda', serif" }}>
            {agency.name}
          </span>
        </div>
        <ul className="hidden md:flex gap-8 text-xs tracking-[0.1em] uppercase">
          <li><a href="#biens" className="transition-colors hover:text-[#1B5E3B]">Nos biens</a></li>
          <li><a href="#agence" className="transition-colors hover:text-[#1B5E3B]">L&apos;agence</a></li>
          <li><a href="#contact" className="transition-colors hover:text-[#1B5E3B]">Contact</a></li>
        </ul>
        <a
          href="#contact"
          className="px-5 py-2.5 text-[11px] tracking-[0.1em] uppercase text-white transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          Estimer
        </a>
      </nav>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh] lg:min-h-[85vh]">
        <div
          className="relative flex flex-col justify-center px-8 md:px-16 py-16 text-white overflow-hidden"
          style={{ backgroundColor: secondaryColor }}
        >
          {/* Geometric deco diamond (top-right) */}
          <div
            className="absolute -top-12 -right-12 w-72 h-72 border-2 rotate-45 opacity-[0.08]"
            style={{ borderColor: accentColor }}
          />
          {/* Geometric deco diamond (bottom-left) */}
          <div
            className="absolute -bottom-8 -left-8 w-48 h-48 border-2 rotate-45 opacity-[0.06]"
            style={{ borderColor: accentColor }}
          />

          <h1 className="text-2xl md:text-4xl lg:text-5xl leading-[1.1] relative z-10" style={{ fontFamily: "'Bodoni Moda', serif" }}>
            L&apos;immobilier{" "}
            <span style={{ color: accentColor }}>d&apos;art</span> à{" "}
            {mainBranch?.wilaya_code ?? "votre ville"}
          </h1>
          {/* Gold diamond divider */}
          <div
            className="w-3 h-3 rotate-45 my-8 relative z-10"
            style={{ backgroundColor: accentColor }}
          />
          <p className="text-white/60 leading-relaxed relative z-10 max-w-md">
            Des propriétés remarquables, sélectionnées avec un oeil d&apos;expert.
            Depuis {yearFounded}, nous cultivons l&apos;excellence.
          </p>
          <a
            href="#biens"
            className="inline-block mt-8 px-8 py-3.5 text-[11px] tracking-[0.15em] uppercase font-medium relative z-10 transition-colors"
            style={{ backgroundColor: accentColor, color: secondaryColor }}
          >
            Découvrir &rarr;
          </a>
        </div>
        <div className="relative min-h-[300px] md:min-h-0">
          <Image
            src={agency.cover_url ?? FALLBACK_COVER}
            alt={agency.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Listings section */}
      <section id="biens" className="px-6 md:px-12 py-20">
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: accentColor }}>
            Collection
          </div>
          <h2 className="text-xl md:text-3xl lg:text-4xl text-[#141210] mt-2" style={{ fontFamily: "'Bodoni Moda', serif" }}>
            Propriétés d&apos;exception
          </h2>
          <div className="w-12 h-0.5 mx-auto mt-4" style={{ backgroundColor: accentColor }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.slice(0, 6).map((listing) => (
            <Link
              key={listing.id}
              href={`/annonce/${listing.slug}`}
              className="group bg-white border border-black/5 overflow-hidden transition hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-60">
                <Image
                  src={listing.cover_url ?? "https://picsum.photos/seed/" + listing.id + "/600/400"}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
                <span
                  className="absolute bottom-0 start-0 text-white text-[10px] tracking-[0.1em] uppercase px-4 py-1.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  {listing.property_type}
                </span>
              </div>
              <div className="p-6">
                <div
                  className="text-[10px] tracking-[0.08em] uppercase"
                  style={{ color: primaryColor }}
                >
                  {listing.commune_name} &middot; {listing.wilaya_name}
                </div>
                <div className="text-xl md:text-2xl text-[#141210] mt-1" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                  {formatPrice(listing.current_price, listing.currency)}
                </div>
                <div className="text-sm mt-2 text-[#3A3530]">{listing.title}</div>
                {/* Gold divider */}
                <div className="w-full h-px my-3 opacity-20" style={{ backgroundColor: accentColor }} />
                <div className="flex gap-5 text-xs text-[#8A847C]">
                  {listing.surface_m2 && <span>{listing.surface_m2} m²</span>}
                  {listing.rooms && <span>{listing.rooms} ch.</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About section */}
      <div
        id="agence"
        className="relative mx-3 md:mx-12 p-6 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center text-white overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Geometric diamond overlay */}
        <div className="absolute top-1/2 right-0 w-96 h-96 border border-white/[0.06] rotate-45 translate-x-[30%] -translate-y-1/2" />
        <div>
          <h2 className="text-2xl md:text-3xl mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>
            Le goût du beau, depuis {yearFounded}
          </h2>
          {agency.description && (
            <p className="opacity-70 leading-relaxed mb-4">{agency.description}</p>
          )}
          <p className="opacity-70 leading-relaxed">
            Notre équipe de {agency.branches.length} agence{agency.branches.length > 1 ? "s" : ""} sélectionne
            chaque bien avec la même exigence qu&apos;un galeriste choisit ses oeuvres.
          </p>
          <div className="flex gap-10 mt-8">
            <div>
              <div className="text-2xl md:text-3xl" style={{ fontFamily: "'Bodoni Moda', serif" }}>{agency.listing_count}</div>
              <div className="text-[10px] uppercase tracking-[0.1em] opacity-50 mt-1">Biens</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl" style={{ fontFamily: "'Bodoni Moda', serif" }}>{listings.length}</div>
              <div className="text-[10px] uppercase tracking-[0.1em] opacity-50 mt-1">Ventes</div>
            </div>
          </div>
        </div>
        <div className="relative h-64 md:h-[350px]">
          <Image
            src={agency.cover_url ?? FALLBACK_ABOUT}
            alt={`${agency.name} - L'agence`}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Contact section */}
      <section id="contact" className="px-6 md:px-12 py-20">
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: accentColor }}>
            Contact
          </div>
          <h2 className="text-xl md:text-3xl lg:text-4xl text-[#141210] mt-2" style={{ fontFamily: "'Bodoni Moda', serif" }}>
            Parlons de votre projet
          </h2>
          <div className="w-12 h-0.5 mx-auto mt-4" style={{ backgroundColor: accentColor }} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="p-10 bg-white border border-black/5">
            <h3 className="text-xl mb-6" style={{ fontFamily: "'Bodoni Moda', serif" }}>{agency.name}</h3>
            <div className="text-[#8A847C] leading-[2]">
              {mainBranch?.address_text && (
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 shrink-0" /> {mainBranch.address_text}
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
          <div className="p-10 bg-white border border-black/5">
            <h3 className="text-xl mb-6" style={{ fontFamily: "'Bodoni Moda', serif" }}>Écrivez-nous</h3>
            <form className="space-y-3">
              <input
                type="text"
                placeholder="Nom"
                className="w-full border border-[#e0ddd5] bg-[#F8F5EE] px-4 py-3.5 text-sm outline-none transition focus:border-[#1B5E3B]"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-[#e0ddd5] bg-[#F8F5EE] px-4 py-3.5 text-sm outline-none transition focus:border-[#1B5E3B]"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                className="w-full border border-[#e0ddd5] bg-[#F8F5EE] px-4 py-3.5 text-sm outline-none transition focus:border-[#1B5E3B]"
              />
              <textarea
                placeholder="Votre projet..."
                rows={4}
                className="w-full border border-[#e0ddd5] bg-[#F8F5EE] px-4 py-3.5 text-sm outline-none transition focus:border-[#1B5E3B] resize-none"
              />
              <button
                type="submit"
                className="w-full py-3.5 text-xs tracking-[0.1em] uppercase text-white transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-[11px] text-[#8A847C] tracking-wide">
        &copy; {new Date().getFullYear()} {agency.name} &middot; Propulsé par{" "}
        <span style={{ color: primaryColor }}>Aqar</span>Pro
      </footer>

      {/* Bottom deco stripe bar */}
      <div className="h-1 flex">
        <div className="flex-1" style={{ backgroundColor: primaryColor }} />
        <div className="flex-1" style={{ backgroundColor: accentColor }} />
        <div className="flex-1" style={{ backgroundColor: primaryColor }} />
      </div>
    </div>
  );
}
