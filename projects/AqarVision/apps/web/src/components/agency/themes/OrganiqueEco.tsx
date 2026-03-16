import type { AgencyThemeProps } from "./types";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { Phone, Mail, MapPin, ChevronRight, Check } from "lucide-react";
import { ThemeFonts } from "./ThemeFonts";

const FALLBACK_COVER_1 = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80";
const FALLBACK_COVER_2 = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=80";
const FALLBACK_ABOUT = "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=500&q=80";

export default function OrganiqueEco({ agency, listings, locale }: AgencyThemeProps) {
  const primaryColor = agency.primary_color ?? "#2D5F3C";
  const accentColor = agency.accent_color ?? "#7A9E7E";
  const secondaryColor = agency.secondary_color ?? "#E8DFD0";
  const mainBranch = agency.branches?.[0];
  const yearFounded = agency.created_at ? new Date(agency.created_at).getFullYear() : 2020;

  return (
    <div className="bg-[#FAF7F0] text-[#3A3428]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
      <ThemeFonts themeId="organique-eco" />
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          {agency.logo_url && (
            <Image src={agency.logo_url} alt={agency.name} width={32} height={32} className="rounded-full" />
          )}
          <span className="text-2xl" style={{ color: primaryColor, fontFamily: "'Instrument Serif', serif" }}>
            {agency.name}
          </span>
        </div>
        <ul className="hidden md:flex gap-8 text-sm">
          <li><a href="#biens" className="transition-colors hover:text-[#2D5F3C]">Nos biens</a></li>
          <li><a href="#agence" className="transition-colors hover:text-[#2D5F3C]">L&apos;agence</a></li>
          <li><a href="#contact" className="transition-colors hover:text-[#2D5F3C]">Contact</a></li>
        </ul>
        <a
          href="#contact"
          className="rounded-full px-6 py-2.5 text-sm text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Nous contacter
        </a>
      </nav>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-12 py-8 items-center min-h-[60vh] lg:min-h-[80vh]">
        <div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl leading-[1.12]" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Habiter <em className="italic" style={{ color: primaryColor }}>autrement</em> à{" "}
            {mainBranch?.wilaya_code ?? "votre ville"}
          </h1>
          <p className="text-[#8A8070] leading-relaxed mt-5 mb-8 max-w-md">
            Des biens sélectionnés pour leur qualité de vie, leur luminosité et leur harmonie
            avec l&apos;environnement. L&apos;immobilier responsable depuis {yearFounded}.
          </p>
          <a
            href="#biens"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm text-white transition hover:-translate-y-0.5"
            style={{ backgroundColor: primaryColor }}
          >
            Découvrir nos biens &rarr;
          </a>
        </div>
        {/* Organic hero images — 2 stacked with offset */}
        <div className="grid grid-cols-2 gap-4 h-[280px] md:h-[400px] lg:h-[500px]">
          <div className="relative rounded-t-full rounded-b-[30px] overflow-hidden">
            <Image
              src={agency.cover_url ?? FALLBACK_COVER_1}
              alt={agency.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="relative rounded-t-[30px] rounded-b-full overflow-hidden mt-12">
            <Image
              src={FALLBACK_COVER_2}
              alt={`${agency.name} - secondary`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Listings section */}
      <section id="biens" className="px-4 md:px-12 py-16 md:py-20">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.1em] uppercase mb-3" style={{ color: accentColor }}>
          <span className="w-5 h-[1.5px]" style={{ backgroundColor: accentColor }} />
          Sélection
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl mb-10" style={{ fontFamily: "'Instrument Serif', serif" }}>Biens disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.slice(0, 6).map((listing) => (
            <Link
              key={listing.id}
              href={`/annonce/${listing.slug}`}
              className="group bg-[#F6F2EA] rounded-[20px] overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="p-3">
                <div className="relative h-56 rounded-[14px] overflow-hidden">
                  <Image
                    src={listing.cover_url ?? "https://picsum.photos/seed/" + listing.id + "/600/400"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                  <span
                    className="absolute top-3 start-3 rounded-full px-3 py-1 text-[10px] text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {listing.property_type}
                  </span>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="text-lg md:text-xl" style={{ color: primaryColor, fontFamily: "'Instrument Serif', serif" }}>
                  {formatPrice(listing.current_price, listing.currency)}
                </div>
                <div className="text-sm mt-1 mb-3">{listing.title}</div>
                <div className="flex flex-wrap gap-1.5">
                  {listing.surface_m2 && (
                    <span className="rounded-full px-2.5 py-1 text-[10px] text-[#8A8070]" style={{ backgroundColor: secondaryColor }}>
                      {listing.surface_m2} m²
                    </span>
                  )}
                  {listing.rooms && (
                    <span className="rounded-full px-2.5 py-1 text-[10px] text-[#8A8070]" style={{ backgroundColor: secondaryColor }}>
                      {listing.rooms} ch.
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About section — dark forest */}
      <div
        id="agence"
        className="rounded-[20px] md:rounded-[30px] mx-3 md:mx-12 p-6 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="relative h-64 md:h-[380px] rounded-t-full rounded-b-[20px] overflow-hidden">
          <Image
            src={agency.cover_url ?? FALLBACK_ABOUT}
            alt={`${agency.name} - L'agence`}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl mb-5" style={{ fontFamily: "'Instrument Serif', serif" }}>L&apos;immobilier avec conscience</h2>
          {agency.description && (
            <p className="opacity-70 leading-relaxed mb-4">{agency.description}</p>
          )}
          <p className="opacity-70 leading-relaxed">
            Notre approche : chaque bien est évalué sur sa performance énergétique,
            sa qualité de vie et son impact environnemental.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <span className="bg-white/10 rounded-full px-5 py-2 text-xs flex items-center gap-1.5">
              <Check className="h-3 w-3" /> {agency.listing_count} biens
            </span>
            <span className="bg-white/10 rounded-full px-5 py-2 text-xs flex items-center gap-1.5">
              <Check className="h-3 w-3" /> {listings.length} ventes
            </span>
            <span className="bg-white/10 rounded-full px-5 py-2 text-xs flex items-center gap-1.5">
              <Check className="h-3 w-3" /> {agency.branches.length} agence{agency.branches.length > 1 ? "s" : ""}
            </span>
            <span className="bg-white/10 rounded-full px-5 py-2 text-xs flex items-center gap-1.5">
              <Check className="h-3 w-3" /> Depuis {yearFounded}
            </span>
          </div>
        </div>
      </div>

      {/* Contact section */}
      <section id="contact" className="px-4 md:px-12 py-16 md:py-20">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.1em] uppercase mb-3" style={{ color: accentColor }}>
          <span className="w-5 h-[1.5px]" style={{ backgroundColor: accentColor }} />
          Contact
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl mb-10" style={{ fontFamily: "'Instrument Serif', serif" }}>Échangeons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-10 bg-[#F6F2EA] rounded-[20px]">
            <h3 className="text-xl mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>Nos coordonnées</h3>
            <div className="text-[#8A8070] leading-[2]">
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
          <div className="p-10 bg-[#F6F2EA] rounded-[20px]">
            <h3 className="text-xl mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>Un message</h3>
            <form className="space-y-3">
              <input
                type="text"
                placeholder="Nom"
                className="w-full rounded-xl border-[1.5px] border-[#E8DFD0] bg-[#FAF7F0] px-4 py-3.5 text-sm outline-none transition focus:border-[#2D5F3C]"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border-[1.5px] border-[#E8DFD0] bg-[#FAF7F0] px-4 py-3.5 text-sm outline-none transition focus:border-[#2D5F3C]"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                className="w-full rounded-xl border-[1.5px] border-[#E8DFD0] bg-[#FAF7F0] px-4 py-3.5 text-sm outline-none transition focus:border-[#2D5F3C]"
              />
              <textarea
                placeholder="Votre projet..."
                rows={3}
                className="w-full rounded-xl border-[1.5px] border-[#E8DFD0] bg-[#FAF7F0] px-4 py-3.5 text-sm outline-none transition focus:border-[#2D5F3C] resize-none"
              />
              <button
                type="submit"
                className="w-full rounded-xl py-3.5 text-sm text-white transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-[#8A8070]">
        &copy; {new Date().getFullYear()} {agency.name} &middot; Propulsé par{" "}
        <span style={{ color: primaryColor }}>Aqar</span>Pro
      </footer>
    </div>
  );
}
