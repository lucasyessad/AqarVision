import type { AgencyThemeProps } from "./types";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { Phone, Mail, MapPin, ChevronRight, Check } from "lucide-react";
import { ThemeFonts } from "./ThemeFonts";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80";
const FALLBACK_ABOUT = "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80";

export default function Mediterranee({ agency, listings, locale }: AgencyThemeProps) {
  const terra = agency.primary_color ?? "#C4775A";
  const terraLight = agency.accent_color ?? "#E8A88C";
  const olive = agency.secondary_color ?? "#5E6B52";
  const sand = "#F5EDE3";
  const cream = "#FBF8F4";
  const charcoal = "#2C2825";
  const textLight = "#8A827A";

  const firstBranch = agency.branches?.[0];
  const address = firstBranch?.address_text ?? firstBranch?.name ?? "";
  const createdYear = new Date(agency.created_at).getFullYear();

  return (
    <div className="min-h-screen font-light" style={{ background: cream, color: "#4A4440", fontFamily: "'Jost', sans-serif" }}>
      <ThemeFonts themeId="mediterranee" />
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12" style={{ background: cream }}>
        <div className="text-2xl" style={{ color: charcoal, fontFamily: "'DM Serif Display', serif" }}>
          {agency.name}
        </div>
        <ul className="hidden md:flex gap-8 text-sm tracking-wider">
          <li><a href="#biens" className="hover:opacity-70 transition-colors">Nos biens</a></li>
          <li><a href="#agence" className="hover:opacity-70 transition-colors">L&apos;agence</a></li>
          <li><a href="#contact" className="hover:opacity-70 transition-colors">Contact</a></li>
        </ul>
        <a href="#contact" className="px-5 py-2 rounded-full text-sm text-white transition-colors"
          style={{ background: terra }}>
          Nous contacter
        </a>
      </nav>

      {/* HERO */}
      <section className="mx-3 md:mx-12 rounded-3xl overflow-hidden relative flex items-center" style={{ minHeight: "70vh" }}>
        <Image
          src={agency.cover_url ?? FALLBACK_COVER}
          alt={agency.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(44,40,37,0.6), transparent 70%)" }} />
        <div className="relative p-8 md:p-16 max-w-[600px] animate-[fadeUp_0.8s_ease_0.2s_both]">
          <h1 className="text-2xl md:text-4xl lg:text-6xl text-white leading-tight mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Votre futur chez-vous
          </h1>
          <p className="text-white/80 leading-relaxed mb-8">
            {agency.description ?? `Specialiste de l'immobilier residentiel depuis ${createdYear}, nous vous guidons vers le bien qui vous ressemble.`}
          </p>
          <a href="#biens"
            className="inline-block px-8 py-3 rounded-full text-sm text-white transition-all hover:-translate-y-0.5"
            style={{ background: terra }}>
            Voir nos biens <ChevronRight className="inline w-4 h-4" />
          </a>
        </div>
      </section>

      {/* LISTINGS */}
      <section id="biens" className="px-6 py-20 md:px-12">
        <p className="text-[0.7rem] uppercase tracking-[0.15em] mb-2" style={{ color: terra }}>Selection</p>
        <h2 className="text-xl md:text-2xl lg:text-3xl mb-10" style={{ color: charcoal, fontFamily: "'DM Serif Display', serif" }}>
          Nos biens a la vente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/annonce/${listing.slug}`}
              className="group block bg-white rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg"
            >
              <div className="relative h-[240px]" style={{ borderRadius: "0 0 50% 50% / 0 0 30px 30px", overflow: "hidden" }}>
                {listing.cover_url ? (
                  <Image src={listing.cover_url} alt={listing.title} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full" style={{ background: sand }} />
                )}
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-[0.7rem] tracking-wider"
                  style={{ background: olive }}>
                  {listing.listing_type === "sale" ? "Vente" : "Location"}
                </span>
              </div>
              <div className="p-6">
                <div className="text-lg md:text-xl mb-1" style={{ color: terra, fontFamily: "'DM Serif Display', serif" }}>
                  {formatPrice(listing.current_price, listing.currency)}
                </div>
                <div className="text-sm mb-3" style={{ color: charcoal }}>{listing.title}</div>
                <div className="flex gap-3 text-sm" style={{ color: textLight }}>
                  {listing.surface_m2 && (
                    <span className="px-3 py-1 rounded-[20px]" style={{ background: sand }}>{listing.surface_m2} m²</span>
                  )}
                  {listing.rooms && (
                    <span className="px-3 py-1 rounded-[20px]" style={{ background: sand }}>{listing.rooms} ch.</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <div id="agence" className="mx-4 md:mx-12 rounded-3xl p-8 md:p-16" style={{ background: sand }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative h-[300px] md:h-[400px] overflow-hidden" style={{ borderRadius: "120px 120px 20px 20px" }}>
            <Image
              src={agency.cover_url ?? FALLBACK_ABOUT}
              alt={`${agency.name} agence`}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.15em] mb-2" style={{ color: terra }}>Notre histoire</p>
            <h2 className="text-xl md:text-2xl lg:text-3xl mb-6" style={{ color: charcoal, fontFamily: "'DM Serif Display', serif" }}>
              Bien plus qu&apos;une agence
            </h2>
            {agency.description && (
              <p className="leading-relaxed mb-4" style={{ color: textLight }}>{agency.description}</p>
            )}
            <div className="flex gap-6 sm:gap-8 mt-8">
              {[
                { icon: <Check size={20} />, label: "Confiance" },
                { icon: <ChevronRight size={20} />, label: "Precision" },
                { icon: <Mail size={20} />, label: "Conseil" },
              ].map((v) => (
                <div key={v.label} className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-2"
                    style={{ background: terra }}>
                    {v.icon}
                  </div>
                  <div className="text-xs tracking-wider" style={{ color: textLight }}>{v.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <section id="contact" className="px-6 py-20 md:px-12">
        <p className="text-[0.7rem] uppercase tracking-[0.15em] mb-2" style={{ color: terra }}>Contact</p>
        <h2 className="text-xl md:text-2xl lg:text-3xl mb-10" style={{ color: charcoal, fontFamily: "'DM Serif Display', serif" }}>
          Echangeons ensemble
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[20px] p-8 shadow-sm">
            <h3 className="text-xl mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>Nos coordonnees</h3>
            {address && (
              <p className="flex items-center gap-3 mb-1" style={{ color: textLight }}>
                <MapPin size={16} style={{ color: terra }} /> {address}
              </p>
            )}
            {agency.phone && (
              <p className="flex items-center gap-3 mb-1" style={{ color: textLight }}>
                <Phone size={16} style={{ color: terra }} /> {agency.phone}
              </p>
            )}
            {agency.email && (
              <p className="flex items-center gap-3 mb-1" style={{ color: textLight }}>
                <Mail size={16} style={{ color: terra }} /> {agency.email}
              </p>
            )}
            <p className="mt-6 text-sm" style={{ color: textLight }}>Lun — Sam &middot; 9h — 19h</p>
          </div>
          <div className="bg-white rounded-[20px] p-8 shadow-sm">
            <h3 className="text-xl mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>Envoyez-nous un message</h3>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
              <input type="text" placeholder="Nom complet"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors font-['Jost']"
                style={{ border: `1.5px solid ${sand}`, background: cream, color: "#4A4440" }} />
              <input type="email" placeholder="Email"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors font-['Jost']"
                style={{ border: `1.5px solid ${sand}`, background: cream, color: "#4A4440" }} />
              <input type="tel" placeholder="Telephone"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors font-['Jost']"
                style={{ border: `1.5px solid ${sand}`, background: cream, color: "#4A4440" }} />
              <textarea placeholder="Decrivez votre projet..." rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none font-['Jost']"
                style={{ border: `1.5px solid ${sand}`, background: cream, color: "#4A4440" }} />
              <button type="submit" className="w-full py-3 rounded-xl text-sm text-white transition-colors cursor-pointer border-none font-['Jost']"
                style={{ background: terra }}>
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center px-6 py-8 text-xs" style={{ color: textLight }}>
        &copy; {new Date().getFullYear()} {agency.name} &middot; Propulse par <span style={{ color: terra }}>Aqar</span>Pro
      </footer>
    </div>
  );
}
