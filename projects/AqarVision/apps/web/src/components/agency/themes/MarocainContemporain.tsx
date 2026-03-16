import type { AgencyThemeProps } from "./types";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { Phone, Mail, MapPin, ChevronRight, Check } from "lucide-react";
import { ThemeFonts } from "./ThemeFonts";

const FALLBACK_MOSAIC_1 = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80";
const FALLBACK_MOSAIC_2 = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80";

export default function MarocainContemporain({ agency, listings, locale }: AgencyThemeProps) {
  const teal = agency.primary_color ?? "#1B6B6D";
  const tealLight = agency.accent_color ?? "#2A9D8F";
  const terra = agency.secondary_color ?? "#C4613A";
  const sand = "#F4EDE4";
  const cream = "#FAF7F2";
  const dark = "#1A1814";
  const textLight = "#8A7F73";

  const firstBranch = agency.branches?.[0];
  const address = firstBranch?.address_text ?? firstBranch?.name ?? "";
  const createdYear = new Date(agency.created_at).getFullYear();

  return (
    <div className="min-h-screen font-light" style={{ background: cream, color: "#3D3730", fontFamily: "'Work Sans', sans-serif" }}>
      <ThemeFonts themeId="marocain-contemporain" />
      {/* ZELLIGE BORDER TOP */}
      <div className="h-2" style={{
        background: `repeating-linear-gradient(90deg, ${teal} 0px, ${teal} 12px, ${terra} 12px, ${terra} 24px, ${sand} 24px, ${sand} 36px)`
      }} />

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="text-2xl font-semibold" style={{ color: teal, fontFamily: "'Cormorant Garamond', serif" }}>
          {agency.name}
          <small className="block text-[0.6rem] font-light uppercase tracking-[0.15em]" style={{ color: textLight, fontFamily: "'Work Sans', sans-serif" }}>
            Immobilier &middot; {firstBranch?.name ?? ""}
          </small>
        </div>
        <ul className="hidden md:flex gap-8 text-sm list-none">
          <li><a href="#biens" className="hover:opacity-70 transition-colors">Nos biens</a></li>
          <li><a href="#agence" className="hover:opacity-70 transition-colors">L&apos;agence</a></li>
          <li><a href="#contact" className="hover:opacity-70 transition-colors">Contact</a></li>
        </ul>
        <a href="#contact" className="px-5 py-2 rounded text-sm text-white transition-colors"
          style={{ background: teal }}>
          Estimer mon bien
        </a>
      </nav>

      {/* HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center px-4 md:px-12 py-12 min-h-[60vh] lg:min-h-[85vh]">
        <div className="animate-[fadeUp_0.7s_ease_both]">
          <h1 className="text-2xl md:text-4xl lg:text-6xl leading-tight" style={{ color: dark, fontFamily: "'Cormorant Garamond', serif" }}>
            L&apos;art de vivre <em style={{ color: teal }} className="italic">algerien</em>, reinvente
          </h1>
          <p className="mt-6 mb-8 max-w-[480px] leading-relaxed" style={{ color: textLight }}>
            {agency.description ?? `Specialiste des biens de caractere. Un accompagnement sur-mesure depuis ${createdYear}.`}
          </p>
          <div className="flex gap-4">
            <a href="#biens" className="inline-block px-6 py-3 rounded text-sm text-white transition-all hover:-translate-y-0.5"
              style={{ background: teal }}>
              Nos biens
            </a>
            <a href="#contact" className="inline-block px-6 py-3 rounded text-sm border-[1.5px] transition-colors"
              style={{ borderColor: teal, color: teal }}>
              Nous contacter
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[280px] md:h-[400px] lg:h-[500px] animate-[fadeUp_0.7s_ease_0.2s_both]">
          <div className="row-span-2 relative overflow-hidden" style={{ borderRadius: "80px 8px 8px 8px" }}>
            <Image src={agency.cover_url ?? FALLBACK_MOSAIC_1} alt="" fill className="object-cover" priority />
          </div>
          <div className="relative overflow-hidden" style={{ borderRadius: "8px 80px 8px 8px" }}>
            <Image src={FALLBACK_MOSAIC_2} alt="" fill className="object-cover" />
          </div>
          <div className="flex items-center justify-center text-center text-white p-6"
            style={{ background: teal, borderRadius: "8px 8px 80px 8px" }}>
            <div>
              <div className="text-3xl md:text-4xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{agency.listing_count}</div>
              <div className="text-[0.7rem] uppercase tracking-[0.12em] opacity-70 mt-1">Biens actifs</div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section id="biens" className="px-6 py-20 md:px-12">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] mb-2" style={{ color: teal }}>Selection</p>
        <h2 className="text-xl md:text-2xl lg:text-3xl mb-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Nos biens a decouvrir</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/annonce/${listing.slug}`}
              className="group block bg-white rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
            >
              <div className="relative h-[220px]">
                {listing.cover_url ? (
                  <Image src={listing.cover_url} alt={listing.title} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full" style={{ background: sand }} />
                )}
                <span className="absolute top-4 left-4 px-3 py-1 rounded text-white text-[0.65rem] uppercase tracking-wider"
                  style={{ background: terra }}>
                  {listing.listing_type === "sale" ? "Vente" : "Location"}
                </span>
              </div>
              <div className="p-5">
                {listing.commune_name && (
                  <div className="text-[0.7rem] uppercase tracking-wider mb-1" style={{ color: teal }}>
                    {listing.commune_name}, {listing.wilaya_name}
                  </div>
                )}
                <div className="text-lg md:text-xl font-semibold" style={{ color: dark, fontFamily: "'Cormorant Garamond', serif" }}>
                  {formatPrice(listing.current_price, listing.currency)}
                </div>
                <div className="text-sm my-2">{listing.title}</div>
                <div className="flex gap-4 text-xs" style={{ color: textLight }}>
                  {listing.surface_m2 && <span>{listing.surface_m2} m²</span>}
                  {listing.rooms && <span>{listing.rooms} ch.</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <div id="agence" className="mx-4 md:mx-12 rounded-xl p-8 md:p-16 relative overflow-hidden text-white"
        style={{ background: teal }}>
        {/* Pattern overlay */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] opacity-10"
          style={{ background: `repeating-conic-gradient(${tealLight} 0% 25%, transparent 0% 50%) 0 0/40px 40px` }} />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] mb-2 opacity-50">Notre agence</p>
            <h2 className="text-xl md:text-2xl lg:text-3xl mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Enracines dans le patrimoine, tournes vers l&apos;avenir
            </h2>
            {agency.description && <p className="opacity-80 leading-relaxed mb-4">{agency.description}</p>}
            <p className="opacity-80 leading-relaxed">
              Notre connaissance intime du marche et notre reseau d&apos;exception nous permettent de vous proposer les plus beaux biens.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 content-center">
            {[
              { num: String(agency.listing_count), label: "Biens actifs" },
              { num: String(createdYear), label: "Depuis" },
              { num: String(agency.branches?.length ?? 1), label: "Agences" },
              { num: "98%", label: "Satisfaction" },
            ].map((s) => (
              <div key={s.label} className="text-center p-6 rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{s.num}</div>
                <div className="text-[0.7rem] uppercase tracking-wider opacity-60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <section id="contact" className="px-6 py-20 md:px-12">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] mb-2" style={{ color: teal }}>Contact</p>
        <h2 className="text-xl md:text-2xl lg:text-3xl mb-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Parlons de votre projet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-8 rounded-lg" style={{ background: sand }}>
            <h3 className="text-xl mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{agency.name}</h3>
            {address && (
              <p className="flex items-center gap-3 leading-loose" style={{ color: textLight }}>
                <MapPin size={16} style={{ color: teal }} /> {address}
              </p>
            )}
            {agency.phone && (
              <p className="flex items-center gap-3 leading-loose" style={{ color: textLight }}>
                <Phone size={16} style={{ color: teal }} /> {agency.phone}
              </p>
            )}
            {agency.email && (
              <p className="flex items-center gap-3 leading-loose" style={{ color: textLight }}>
                <Mail size={16} style={{ color: teal }} /> {agency.email}
              </p>
            )}
            <p className="mt-4 text-sm" style={{ color: textLight }}>Lun — Sam &middot; 9h — 19h</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
            <input type="text" placeholder="Nom complet"
              className="w-full rounded-md px-4 py-3 text-sm outline-none transition-colors border-[1.5px]"
              style={{ borderColor: "#ddd", background: "white", color: "#3D3730" }} />
            <input type="email" placeholder="Email"
              className="w-full rounded-md px-4 py-3 text-sm outline-none transition-colors border-[1.5px]"
              style={{ borderColor: "#ddd", background: "white", color: "#3D3730" }} />
            <input type="tel" placeholder="Telephone"
              className="w-full rounded-md px-4 py-3 text-sm outline-none transition-colors border-[1.5px]"
              style={{ borderColor: "#ddd", background: "white", color: "#3D3730" }} />
            <textarea placeholder="Decrivez votre projet..." rows={3}
              className="w-full rounded-md px-4 py-3 text-sm outline-none transition-colors resize-none border-[1.5px]"
              style={{ borderColor: "#ddd", background: "white", color: "#3D3730" }} />
            <button type="submit"
              className="w-full py-3 rounded-md text-sm text-white cursor-pointer border-none transition-colors"
              style={{ background: teal }}>
              Envoyer
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center px-6 py-8 text-xs" style={{ color: textLight }}>
        &copy; {new Date().getFullYear()} {agency.name} &middot; Propulse par <span style={{ color: teal }}>Aqar</span>Pro
      </footer>

      {/* ZELLIGE BORDER BOTTOM */}
      <div className="h-2" style={{
        background: `repeating-linear-gradient(90deg, ${teal} 0px, ${teal} 12px, ${terra} 12px, ${terra} 24px, ${sand} 24px, ${sand} 36px)`
      }} />
    </div>
  );
}
