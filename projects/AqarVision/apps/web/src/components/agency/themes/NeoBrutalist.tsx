import type { AgencyThemeProps } from "./types";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { Phone, Mail, MapPin, ChevronRight, Check } from "lucide-react";
import { ThemeFonts } from "./ThemeFonts";

const FALLBACK_HERO = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80";

export default function NeoBrutalist({ agency, listings, locale }: AgencyThemeProps) {
  const yellow = agency.primary_color ?? "#E8FF00";
  const red = agency.accent_color ?? "#FF3B30";
  const black = "#111";
  const white = "#F2F0EB";
  const gray = "#999";

  const firstBranch = agency.branches?.[0];
  const address = firstBranch?.address_text ?? firstBranch?.name ?? "";
  const createdYear = new Date(agency.created_at).getFullYear();

  return (
    <div className="min-h-screen font-light text-sm" style={{ background: white, color: black, fontFamily: "'IBM Plex Mono', monospace" }}>
      <ThemeFonts themeId="neo-brutalist" />
      {/* NAV */}
      <nav className="flex items-center justify-between px-5 py-3 border-b-2" style={{ borderColor: black }}>
        <div className="text-lg md:text-xl font-extrabold uppercase tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          {agency.name}
        </div>
        <ul className="hidden md:flex gap-8 text-xs uppercase tracking-wider list-none">
          <li><a href="#biens" className="transition-colors" style={{ textDecorationLine: "none" }}>Biens</a></li>
          <li><a href="#agence" className="transition-colors" style={{ textDecorationLine: "none" }}>Agence</a></li>
          <li><a href="#contact" className="transition-colors" style={{ textDecorationLine: "none" }}>Contact</a></li>
        </ul>
        <a href="#contact"
          className="px-4 py-2 text-[0.7rem] uppercase tracking-wider"
          style={{ background: black, color: white }}>
          Estimer <ChevronRight className="inline w-3 h-3" />
        </a>
      </nav>

      {/* HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[60vh] lg:min-h-[80vh] items-center px-4 md:px-5 py-12 md:py-16 border-b-2" style={{ borderColor: black }}>
        <div>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-extrabold uppercase leading-[0.9] tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>
            L&apos;immo<span className="block" style={{ color: red }}>bilier.</span>
          </h1>
          <div className="mt-8 text-xs uppercase tracking-wider leading-loose" style={{ color: gray }}>
            {firstBranch && <>Base a {firstBranch.name}<br /></>}
            Depuis {createdYear}<br />
            {agency.listing_count} biens actifs
          </div>
        </div>
        <div className="relative">
          <div className="relative w-full h-[400px] md:h-[500px] border-2 overflow-hidden" style={{ borderColor: black }}>
            <Image
              src={agency.cover_url ?? FALLBACK_HERO}
              alt={agency.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-4 -right-4 px-5 py-3 font-['Syne'] font-extrabold text-sm uppercase border-2"
            style={{ background: yellow, borderColor: black }}>
            {firstBranch?.name ?? agency.name} — {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* LISTINGS */}
      <section id="biens" className="px-5 py-16 border-b-2" style={{ borderColor: black }}>
        <div className="flex justify-between items-baseline mb-12">
          <h2 className="font-['Syne'] text-xl font-extrabold uppercase">Biens en vente</h2>
          <span className="font-['Syne'] text-7xl font-extrabold leading-none opacity-15">01</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-2" style={{ borderColor: black }}>
          {listings.map((listing, i) => (
            <Link
              key={listing.id}
              href={`/annonce/${listing.slug}`}
              className="group block overflow-hidden transition-colors border-b-2 md:border-b-0 md:border-r-2 last:border-r-0 last:border-b-0"
              style={{ borderColor: black }}
            >
              <div className="relative h-[280px] border-b-2" style={{ borderColor: black }}>
                {listing.cover_url ? (
                  <Image src={listing.cover_url} alt={listing.title} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full" style={{ background: "#ddd" }} />
                )}
              </div>
              <div className="p-6 transition-colors group-hover:bg-[--hover]" style={{ "--hover": yellow } as React.CSSProperties}>
                <div className="font-['Syne'] text-5xl font-extrabold opacity-10">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-['Syne'] text-2xl font-extrabold my-2">
                  {formatPrice(listing.current_price, listing.currency)}
                </div>
                <div className="text-sm mb-4 leading-relaxed">{listing.title}</div>
                <div className="flex flex-wrap gap-2 text-[0.7rem] uppercase tracking-wider" style={{ color: gray }}>
                  {listing.surface_m2 && (
                    <span className="border px-2 py-0.5" style={{ borderColor: gray }}>{listing.surface_m2} m²</span>
                  )}
                  {listing.rooms && (
                    <span className="border px-2 py-0.5" style={{ borderColor: gray }}>{listing.rooms} ch</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="agence" className="border-b-2" style={{ borderColor: black, padding: 0 }}>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
          <div className="p-6 md:p-8 lg:p-12 border-b-2 lg:border-b-0 lg:border-r-2" style={{ borderColor: black }}>
            <div className="flex justify-between items-baseline mb-8">
              <h2 className="font-['Syne'] text-xl font-extrabold uppercase">L&apos;agence</h2>
              <span className="font-['Syne'] text-7xl font-extrabold leading-none opacity-15">02</span>
            </div>
            {agency.description && (
              <p className="leading-relaxed mb-6 max-w-[500px]" style={{ color: "#555" }}>{agency.description}</p>
            )}
            <p className="leading-relaxed max-w-[500px]" style={{ color: "#555" }}>
              Pas de blabla. Du resultat.
            </p>
          </div>
          <div className="p-8 md:p-12">
            {[
              { val: String(agency.listing_count), label: "Biens actifs" },
              { val: String(createdYear), label: "Fondation" },
              { val: "98%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="py-5 border-b last:border-b-0" style={{ borderColor: "#ddd" }}>
                <div className="font-['Syne'] text-4xl font-extrabold">{stat.val}</div>
                <div className="text-[0.7rem] uppercase tracking-wider mt-1" style={{ color: gray }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <div id="contact" className="grid grid-cols-1 lg:grid-cols-2" style={{ background: black, color: white }}>
        <div className="p-6 md:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r" style={{ borderColor: "#333" }}>
          <h3 className="font-['Syne'] text-xl font-extrabold uppercase mb-8">Contact</h3>
          {address && (
            <p className="flex items-center gap-3 leading-loose" style={{ color: gray }}>
              <MapPin size={14} /> {address}
            </p>
          )}
          {agency.phone && (
            <p className="flex items-center gap-3 leading-loose" style={{ color: gray }}>
              <Phone size={14} /> {agency.phone}
            </p>
          )}
          {agency.email && (
            <p className="flex items-center gap-3 leading-loose" style={{ color: gray }}>
              <Mail size={14} /> {agency.email}
            </p>
          )}
          <p className="mt-8 text-xs uppercase tracking-wider" style={{ color: gray }}>
            LUN—SAM / 09:00—19:00
          </p>
        </div>
        <div className="p-8 md:p-12">
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
            {["NOM_", "EMAIL_", "TEL_"].map((ph) => (
              <input key={ph} type="text" placeholder={ph}
                className="w-full bg-transparent border-b py-4 text-sm outline-none placeholder:opacity-30"
                style={{ borderColor: "#444", color: white }} />
            ))}
            <textarea placeholder="MESSAGE_" rows={3}
              className="w-full bg-transparent border-b py-4 text-sm outline-none resize-none placeholder:opacity-30"
              style={{ borderColor: "#444", color: white }} />
            <button type="submit"
              className="w-full mt-4 py-4 font-['Syne'] font-extrabold uppercase text-sm cursor-pointer border-none transition-colors"
              style={{ background: yellow, color: black }}>
              Envoyer <ChevronRight className="inline w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="flex justify-between px-5 py-4 text-[0.7rem] uppercase tracking-wider" style={{ color: gray }}>
        <div>&copy; {new Date().getFullYear()} {agency.name}</div>
        <div>Propulse par <span style={{ color: red }}>Aqar</span>Pro</div>
      </footer>
    </div>
  );
}
