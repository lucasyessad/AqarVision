import type { AgencyThemeProps } from "./types";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { Phone, Mail, MapPin, ChevronRight, Check } from "lucide-react";
import { ThemeFonts } from "./ThemeFonts";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80";
const FALLBACK_ABOUT = "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80";

export default function Editorial({ agency, listings, locale }: AgencyThemeProps) {
  const primaryColor = agency.primary_color ?? "#0D0D0D";
  const accentColor = agency.accent_color ?? "#D4343B";
  const mainBranch = agency.branches?.[0];
  const yearFounded = agency.created_at ? new Date(agency.created_at).getFullYear() : 2020;

  return (
    <div className="bg-[#FAFAFA] text-[#0D0D0D] font-light" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <ThemeFonts themeId="editorial" />
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-8">
        <div className="flex items-center gap-3">
          {agency.logo_url && (
            <Image src={agency.logo_url} alt={agency.name} width={32} height={32} className="rounded-none" />
          )}
          <span className="text-2xl font-bold" style={{ fontFamily: "'Libre Baskerville', serif" }}>{agency.name}</span>
        </div>
        <ul className="hidden md:flex gap-10 text-xs uppercase tracking-[0.12em]">
          <li><a href="#biens" className="transition-colors" style={{ color: undefined }} onMouseEnter={() => {}} >Collection</a></li>
          <li><a href="#agence">L&apos;agence</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] min-h-[60vh] lg:min-h-[85vh] px-4 md:px-12">
        <div className="flex flex-col justify-center py-12 md:py-0 md:pe-16">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#777] mb-4">
            Immobilier &middot; {mainBranch?.wilaya_code ?? "Algérie"} &middot; Depuis {yearFounded}
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl leading-[1.1] font-normal" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Des adresses d&apos;<em className="italic" style={{ color: accentColor }}>exception</em> pour des vies singulières
          </h1>
          <div className="w-12 h-[1.5px] bg-[#0D0D0D] my-8" />
          <p className="text-[#777] leading-relaxed text-base">
            Chaque bien a une histoire. Notre métier, c&apos;est de trouver celle qui est faite pour vous.
          </p>
        </div>
        <div className="relative min-h-[300px] md:min-h-[600px]">
          <Image
            src={agency.cover_url ?? FALLBACK_COVER}
            alt={agency.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center px-6 md:px-12 gap-6 my-12">
        <div className="flex-1 h-px bg-[#F0F0F0]" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#777]">Sélection en cours</span>
        <div className="flex-1 h-px bg-[#F0F0F0]" />
      </div>

      {/* Editorial grid */}
      <section id="biens" className="px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-6">
          {listings.slice(0, 5).map((listing, idx) => (
            <Link
              key={listing.id}
              href={`/annonce/${listing.slug}`}
              className={`group relative overflow-hidden cursor-pointer ${
                idx === 0 ? "lg:row-span-2 lg:col-span-1" : ""
              }`}
            >
              <div
                className={`relative w-full transition-transform duration-700 grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.04] ${
                  idx === 0 ? "h-full min-h-[250px] lg:min-h-full" : "h-[250px] md:h-[300px]"
                }`}
              >
                <Image
                  src={listing.cover_url ?? "https://picsum.photos/seed/" + listing.id + "/600/400"}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Number badge */}
              <span className="absolute top-4 start-6 text-5xl text-white/15 font-bold" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                {String(idx + 1).padStart(2, "0")}
              </span>
              {/* Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
                <div className="text-lg md:text-xl mb-1" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                  {formatPrice(listing.current_price, listing.currency)}
                </div>
                <div className="text-sm opacity-80 mb-2">{listing.title}</div>
                <div className="text-[10px] uppercase tracking-[0.08em] opacity-60">
                  {listing.surface_m2 && `${listing.surface_m2} m²`}
                  {listing.rooms && ` · ${listing.rooms} ch.`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About section */}
      <div id="agence" className="grid grid-cols-1 lg:grid-cols-2 mx-3 md:mx-12 my-12">
        <div className="p-8 md:p-12 bg-[#0D0D0D] text-white">
          <h2 className="text-xl md:text-2xl font-normal mb-6" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            L&apos;oeil et l&apos;expertise
          </h2>
          {agency.description && (
            <p className="text-white/60 leading-relaxed mb-4">{agency.description}</p>
          )}
          <p className="text-white/60 leading-relaxed">
            {agency.branches.length} agence{agency.branches.length > 1 ? "s" : ""}, un réseau d&apos;exception,
            et une seule obsession : la perfection.
          </p>
          <div className="flex gap-8 mt-8 pt-8 border-t border-[#333]">
            <div className="text-center">
              <div className="text-2xl md:text-3xl" style={{ fontFamily: "'Libre Baskerville', serif" }}>{agency.listing_count}</div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-[#777] mt-1">Biens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl" style={{ fontFamily: "'Libre Baskerville', serif" }}>{listings.length}</div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-[#777] mt-1">Ventes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl" style={{ fontFamily: "'Libre Baskerville', serif" }}>{yearFounded}</div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-[#777] mt-1">Fondation</div>
            </div>
          </div>
        </div>
        <div className="relative min-h-[250px] md:min-h-0">
          <Image
            src={agency.cover_url ?? FALLBACK_ABOUT}
            alt={`${agency.name} - L'agence`}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Contact section */}
      <div id="contact" className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-4 md:px-12 py-16">
        <div>
          <h3 className="text-xl mb-6" style={{ fontFamily: "'Libre Baskerville', serif" }}>Rendez-vous</h3>
          <div className="text-[#777] leading-[2]">
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
            <p className="mt-4">Lun — Sam &middot; Sur rendez-vous</p>
          </div>
        </div>
        <form className="space-y-1">
          <input
            type="text"
            placeholder="Nom"
            className="w-full border-b border-[#F0F0F0] bg-transparent py-4 text-base outline-none focus:border-[#0D0D0D] transition"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border-b border-[#F0F0F0] bg-transparent py-4 text-base outline-none focus:border-[#0D0D0D] transition"
          />
          <input
            type="tel"
            placeholder="Téléphone"
            className="w-full border-b border-[#F0F0F0] bg-transparent py-4 text-base outline-none focus:border-[#0D0D0D] transition"
          />
          <textarea
            placeholder="Votre projet..."
            rows={3}
            className="w-full border-b border-[#F0F0F0] bg-transparent py-4 text-base outline-none focus:border-[#0D0D0D] transition resize-none"
          />
          <button
            type="submit"
            className="mt-6 px-10 py-4 text-xs uppercase tracking-[0.12em] text-white transition-colors"
            style={{ backgroundColor: primaryColor }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = accentColor)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = primaryColor)}
          >
            Envoyer &rarr;
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between px-6 md:px-12 py-8 border-t border-[#F0F0F0] text-[10px] text-[#777] uppercase tracking-[0.1em]">
        <span>&copy; {new Date().getFullYear()} {agency.name}</span>
        <span>
          Propulsé par <span style={{ color: accentColor }}>Aqar</span>Pro
        </span>
      </footer>
    </div>
  );
}
