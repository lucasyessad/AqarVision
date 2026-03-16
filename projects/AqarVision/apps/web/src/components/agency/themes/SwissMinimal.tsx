import type { AgencyThemeProps } from "./types";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { Phone, Mail, MapPin, ChevronRight, Check } from "lucide-react";
import { ThemeFonts } from "./ThemeFonts";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80";
const FALLBACK_ABOUT = "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80";

export default function SwissMinimal({ agency, listings, locale }: AgencyThemeProps) {
  const primaryColor = agency.primary_color ?? "#111111";
  const accentColor = agency.accent_color ?? "#FF4D00";
  const mainBranch = agency.branches?.[0];
  const yearFounded = agency.created_at ? new Date(agency.created_at).getFullYear() : 2020;

  return (
    <div className="bg-white text-[#111] text-[15px]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <ThemeFonts themeId="swiss-minimal" />
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Nav */}
        <nav className="flex justify-between items-center py-6">
          <div className="flex items-center gap-3">
            {agency.logo_url && (
              <Image src={agency.logo_url} alt={agency.name} width={28} height={28} />
            )}
            <span className="text-lg font-bold tracking-tight">{agency.name}</span>
          </div>
          <ul className="hidden md:flex gap-10 text-sm font-medium">
            <li><a href="#biens" className="transition-colors hover:text-[#FF4D00]">Biens</a></li>
            <li><a href="#agence" className="transition-colors hover:text-[#FF4D00]">Agence</a></li>
            <li><a href="#contact" className="transition-colors hover:text-[#FF4D00]">Contact</a></li>
          </ul>
          <a href="#contact" className="text-sm font-medium" style={{ color: accentColor }}>
            Estimation &rarr;
          </a>
        </nav>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F0F0F0]" />

      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-8 lg:gap-16 items-end py-12 md:py-24">
          <div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-[-0.04em]">
              {mainBranch?.wilaya_code ?? "Algérie"}.<br />
              <span style={{ color: accentColor }}>Immobilier.</span>
            </h1>
          </div>
          <div className="text-base text-[#555] leading-relaxed">
            <p className="mb-6">
              Fondée en {yearFounded}, notre agence propose une approche directe et transparente
              de l&apos;immobilier. Pas de superflu — juste les bons biens, au bon prix.
            </p>
            <a
              href="#biens"
              className="inline-flex items-center gap-2 text-sm font-medium transition-all"
              style={{ color: accentColor }}
            >
              Voir nos {agency.listing_count} biens <span>&rarr;</span>
            </a>
          </div>
        </div>
      </div>

      {/* Full-width hero image */}
      <div className="relative w-full h-[40vh] md:h-[60vh] max-h-[500px] mb-16">
        <Image
          src={agency.cover_url ?? FALLBACK_COVER}
          alt={agency.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Listings section — table-style rows */}
        <section id="biens" className="py-16">
          <div className="flex justify-between items-baseline mb-12">
            <h2 className="text-lg font-bold tracking-tight">Biens en vente</h2>
            <span className="text-xs text-[#888]">{agency.listing_count} biens disponibles</span>
          </div>
          <div>
            {listings.slice(0, 6).map((listing) => (
              <Link
                key={listing.id}
                href={`/annonce/${listing.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-[320px_1fr_180px_120px] gap-4 lg:gap-8 items-center py-6 border-b border-[#F0F0F0] transition hover:bg-[#F9F9F9] lg:hover:px-4 lg:hover:-mx-4 hover:rounded-lg"
              >
                <div className="relative w-full lg:w-80 h-44 rounded-md overflow-hidden">
                  <Image
                    src={listing.cover_url ?? "https://picsum.photos/seed/" + listing.id + "/500/300"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium">{listing.title}</span>
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {listing.property_type}
                    </span>
                  </div>
                  <div className="text-xs text-[#888] mt-1">
                    {listing.commune_name}, {listing.wilaya_name}
                  </div>
                  <div className="flex gap-6 mt-2 text-xs text-[#555]">
                    {listing.surface_m2 && <span>{listing.surface_m2} m²</span>}
                    {listing.rooms && <span>{listing.rooms} chambres</span>}
                  </div>
                </div>
                <div className="text-lg font-bold text-end">
                  {formatPrice(listing.current_price, listing.currency)}
                </div>
                <div className="text-end">
                  <span className="text-xs font-medium" style={{ color: accentColor }}>
                    Voir &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-[#F0F0F0]" />

        {/* About section */}
        <section id="agence" className="py-16">
          <h2 className="text-lg font-bold tracking-tight mb-12">L&apos;agence</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div>
              {agency.description && (
                <p className="text-[#555] leading-relaxed mb-4">{agency.description}</p>
              )}
              <p className="text-[#555] leading-relaxed">
                {agency.branches.length} agence{agency.branches.length > 1 ? "s" : ""}. Une approche sans fioriture.
                Des résultats mesurables.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                {[
                  { num: agency.listing_count, label: "Biens actifs" },
                  { num: listings.length, label: "Transactions" },
                  { num: yearFounded, label: "Fondation" },
                  { num: "98%", label: "Satisfaction" },
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-[#F9F9F9] rounded-lg">
                    <div className="text-3xl font-bold tracking-tight">{stat.num}</div>
                    <div className="text-[10px] text-[#888] mt-1 uppercase tracking-wide">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-full h-64 md:h-72 lg:h-[400px] rounded-lg overflow-hidden">
              <Image
                src={agency.cover_url ?? FALLBACK_ABOUT}
                alt={`${agency.name} - L'agence`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-[#F0F0F0]" />

        {/* Contact section */}
        <section id="contact" className="py-16">
          <h2 className="text-lg font-bold tracking-tight mb-12">Contact</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="text-base text-[#888] leading-[2]">
              {mainBranch?.address_text && <p>{mainBranch.address_text}</p>}
              {agency.phone && <p>{agency.phone}</p>}
              {agency.email && <p>{agency.email}</p>}
              <p className="mt-4">Lun — Sam &middot; 9h — 19h</p>
            </div>
            <form className="space-y-2.5">
              <input
                type="text"
                placeholder="Nom"
                className="w-full border border-[#CCC] rounded-md px-4 py-3 text-sm outline-none transition focus:border-[#111]"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-[#CCC] rounded-md px-4 py-3 text-sm outline-none transition focus:border-[#111]"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                className="w-full border border-[#CCC] rounded-md px-4 py-3 text-sm outline-none transition focus:border-[#111]"
              />
              <textarea
                placeholder="Message"
                rows={4}
                className="w-full border border-[#CCC] rounded-md px-4 py-3 text-sm outline-none transition focus:border-[#111] resize-none"
              />
              <button
                type="submit"
                className="px-8 py-3 rounded-md text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                Envoyer
              </button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col md:flex-row justify-between py-12 border-t border-[#F0F0F0] text-xs text-[#888]">
          <span>&copy; {new Date().getFullYear()} {agency.name}</span>
          <span>
            Propulsé par <span className="font-medium" style={{ color: accentColor }}>Aqar</span>Pro
          </span>
        </footer>
      </div>
    </div>
  );
}
