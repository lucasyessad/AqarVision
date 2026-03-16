import type { AgencyThemeProps } from "./types";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { Phone, Mail, MapPin, ChevronRight, Check } from "lucide-react";
import { ThemeFonts } from "./ThemeFonts";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80";
const FALLBACK_ABOUT = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80";

export default function LuxeNoir({ agency, listings, locale }: AgencyThemeProps) {
  const gold = agency.primary_color ?? "#C8A45C";
  const goldLight = agency.accent_color ?? "#E8D5A3";
  const noir = "#0A0A0A";
  const charcoal = "#1A1A1A";
  const smoke = "#2A2A2A";

  const firstBranch = agency.branches?.[0];
  const address = firstBranch?.address_text ?? firstBranch?.name ?? "";
  const createdYear = new Date(agency.created_at).getFullYear();

  return (
    <div className="min-h-screen font-light" style={{ background: noir, color: "#E8E8E8", fontFamily: "'Outfit', sans-serif" }}>
      <ThemeFonts themeId="luxe-noir" />
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md"
        style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.95), transparent)" }}>
        <div className="text-xl tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
          {agency.name}<span style={{ color: gold }}>.</span>
        </div>
        <ul className="hidden md:flex gap-10 text-xs uppercase tracking-[0.12em]">
          <li><a href="#biens" className="transition-colors hover:opacity-80" style={{ color: undefined }}>Nos Biens</a></li>
          <li><a href="#agence" className="transition-colors hover:opacity-80">L&apos;Agence</a></li>
          <li><a href="#contact" className="transition-colors hover:opacity-80">Contact</a></li>
        </ul>
        <a href="#contact" className="border px-5 py-2 text-xs uppercase tracking-[0.15em] transition-colors"
          style={{ borderColor: gold, color: "#E8E8E8" }}>
          Estimer mon bien
        </a>
      </nav>

      {/* HERO */}
      <section className="relative flex items-end min-h-screen px-6 pb-24 pt-32 md:px-12">
        <div className="absolute inset-0">
          <Image
            src={agency.cover_url ?? FALLBACK_COVER}
            alt={agency.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 30%, ${noir})` }} />
        </div>
        <div className="relative max-w-[700px] animate-[fadeUp_1s_ease_0.3s_both]">
          <div className="mb-6 h-0.5 w-10" style={{ background: gold }} />
          <h1 className="text-3xl md:text-5xl lg:text-7xl leading-[1.1] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            L&apos;immobilier d&apos;<em style={{ color: gold }} className="italic">exception</em>
          </h1>
          <p className="text-base leading-relaxed mb-8 max-w-[500px]" style={{ color: "#888" }}>
            {agency.description ?? `Depuis ${createdYear}, nous accompagnons une clientele exigeante dans la recherche de biens d'exception.`}
          </p>
          <a href="#biens" className="inline-block px-8 py-3 text-xs uppercase tracking-[0.15em] font-medium transition-all hover:-translate-y-0.5"
            style={{ background: gold, color: noir }}>
            Decouvrir nos biens
          </a>
        </div>
      </section>

      {/* LISTINGS */}
      <section id="biens" className="px-4 py-16 md:px-12 md:py-24">
        <p className="text-[0.7rem] uppercase tracking-[0.2em] mb-3" style={{ color: gold }}>Portfolio</p>
        <h2 className="text-xl md:text-2xl lg:text-4xl mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>Biens d&apos;exception</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, i) => (
            <Link
              key={listing.id}
              href={`/annonce/${listing.slug}`}
              className="group block overflow-hidden transition-all duration-400 hover:-translate-y-1.5"
              style={{ background: charcoal, animationDelay: `${i * 0.15}s` }}
            >
              <div className="relative h-[260px]">
                {listing.cover_url ? (
                  <Image src={listing.cover_url} alt={listing.title} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full" style={{ background: smoke }} />
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2"
                  style={{ background: `linear-gradient(transparent, ${charcoal})` }} />
                <span className="absolute top-4 left-4 z-10 px-3 py-1 text-[0.65rem] uppercase tracking-wider font-medium"
                  style={{ background: gold, color: noir }}>
                  {listing.listing_type === "sale" ? "Vente" : "Location"}
                </span>
              </div>
              <div className="p-6">
                <div className="text-xl md:text-2xl mb-2" style={{ color: gold, fontFamily: "'Playfair Display', serif" }}>
                  {formatPrice(listing.current_price, listing.currency)}
                </div>
                <div className="text-base font-normal mb-3">{listing.title}</div>
                <div className="flex gap-5 text-sm" style={{ color: "#888" }}>
                  {listing.surface_m2 && (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-1 h-1 rounded-full" style={{ background: gold }} />
                      {listing.surface_m2} m²
                    </span>
                  )}
                  {listing.rooms && (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-1 h-1 rounded-full" style={{ background: gold }} />
                      {listing.rooms} ch.
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="agence" className="px-4 py-16 md:px-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative h-[350px] md:h-[500px]">
            <Image
              src={agency.cover_url ?? FALLBACK_ABOUT}
              alt={`${agency.name} agence`}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.2em] mb-3" style={{ color: gold }}>L&apos;Agence</p>
            <h2 className="text-xl md:text-2xl lg:text-4xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Un savoir-faire reconnu</h2>
            {agency.description && (
              <p className="leading-relaxed mb-4" style={{ color: "#888" }}>{agency.description}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 mt-8 pt-8" style={{ borderTop: `1px solid ${smoke}` }}>
              <div>
                <div className="text-2xl md:text-3xl" style={{ color: gold, fontFamily: "'Playfair Display', serif" }}>{agency.listing_count}</div>
                <div className="text-xs uppercase tracking-wider mt-1" style={{ color: "#888" }}>Biens en portefeuille</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl" style={{ color: gold, fontFamily: "'Playfair Display', serif" }}>{createdYear}</div>
                <div className="text-xs uppercase tracking-wider mt-1" style={{ color: "#888" }}>Annee de creation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-4 py-16 md:px-12 md:py-24" style={{ background: charcoal }}>
        <p className="text-[0.7rem] uppercase tracking-[0.2em] mb-3" style={{ color: gold }}>Nous contacter</p>
        <h2 className="text-xl md:text-2xl lg:text-4xl mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>Parlons de votre projet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>{agency.name}</h3>
            {address && (
              <p className="flex items-center gap-3 mb-2" style={{ color: "#888" }}>
                <MapPin size={16} style={{ color: gold }} /> {address}
              </p>
            )}
            {agency.phone && (
              <p className="flex items-center gap-3 mb-2" style={{ color: "#888" }}>
                <Phone size={16} style={{ color: gold }} /> {agency.phone}
              </p>
            )}
            {agency.email && (
              <p className="flex items-center gap-3 mb-2" style={{ color: "#888" }}>
                <Mail size={16} style={{ color: gold }} /> {agency.email}
              </p>
            )}
            <p className="mt-6 text-sm" style={{ color: "#888" }}>
              Ouvert du lundi au samedi<br />9h00 — 19h00
            </p>
          </div>
          <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Votre nom"
              className="w-full px-4 py-3 text-sm outline-none transition-colors border font-['Outfit']"
              style={{ background: smoke, borderColor: "#333", color: "#E8E8E8" }} />
            <input type="email" placeholder="Votre email"
              className="w-full px-4 py-3 text-sm outline-none transition-colors border font-['Outfit']"
              style={{ background: smoke, borderColor: "#333", color: "#E8E8E8" }} />
            <input type="tel" placeholder="Votre telephone"
              className="w-full px-4 py-3 text-sm outline-none transition-colors border font-['Outfit']"
              style={{ background: smoke, borderColor: "#333", color: "#E8E8E8" }} />
            <textarea placeholder="Votre message..." rows={4}
              className="w-full px-4 py-3 text-sm outline-none transition-colors border resize-none font-['Outfit']"
              style={{ background: smoke, borderColor: "#333", color: "#E8E8E8" }} />
            <button type="submit" className="w-full py-3 text-xs uppercase tracking-[0.15em] font-medium transition-all border-none cursor-pointer"
              style={{ background: gold, color: noir }}>
              Envoyer
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-8 text-center text-xs" style={{ color: "#888", borderTop: `1px solid ${smoke}` }}>
        <p>&copy; {new Date().getFullYear()} {agency.name} — Propulse par <span style={{ color: gold }}>Aqar</span>Pro</p>
      </footer>
    </div>
  );
}
