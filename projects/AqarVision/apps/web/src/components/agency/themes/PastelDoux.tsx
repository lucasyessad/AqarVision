import type { AgencyThemeProps } from "./types";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { Phone, Mail, MapPin, ChevronRight, Check } from "lucide-react";
import { ThemeFonts } from "./ThemeFonts";

const FALLBACK_VIS_1 = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80";
const FALLBACK_VIS_2 = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80";
const FALLBACK_ABOUT = "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80";

export default function PastelDoux({ agency, listings, locale }: AgencyThemeProps) {
  const lavender = agency.primary_color ?? "#B8A9E8";
  const peach = agency.accent_color ?? "#F4B8A5";
  const mint = agency.secondary_color ?? "#A8D8C8";
  const blush = "#F9E8E0";
  const cream = "#FDF9F5";
  const dark = "#2D2A3E";
  const textColor = "#4A4558";
  const textLight = "#8E89A0";

  const firstBranch = agency.branches?.[0];
  const address = firstBranch?.address_text ?? firstBranch?.name ?? "";
  const createdYear = new Date(agency.created_at).getFullYear();

  return (
    <div className="min-h-screen font-light" style={{ background: cream, color: textColor, fontFamily: "'Nunito', sans-serif" }}>
      <ThemeFonts themeId="pastel-doux" />
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="font-['Fraunces'] text-xl font-bold" style={{ color: dark }}>
          {agency.name}
          <span className="inline-block w-2 h-2 rounded-full align-super ml-0.5" style={{ background: peach }} />
        </div>
        <ul className="hidden md:flex gap-8 text-sm list-none">
          <li><a href="#biens" className="px-3 py-1 rounded-[20px] transition-colors hover:bg-[#F9E8E0]">Nos biens</a></li>
          <li><a href="#agence" className="px-3 py-1 rounded-[20px] transition-colors hover:bg-[#F9E8E0]">L&apos;agence</a></li>
          <li><a href="#contact" className="px-3 py-1 rounded-[20px] transition-colors hover:bg-[#F9E8E0]">Contact</a></li>
        </ul>
        <a href="#contact" className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors"
          style={{ background: lavender }}>
          Nous contacter
        </a>
      </nav>

      {/* HERO */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center px-4 md:px-12 py-12 min-h-[60vh] lg:min-h-[80vh]">
        <div className="flex-1">
          <h1 className="font-['Fraunces'] text-3xl md:text-4xl lg:text-5xl leading-tight" style={{ color: dark }}>
            Trouvez votre{" "}
            <span style={{
              background: `linear-gradient(120deg, ${peach}, ${lavender})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              chez-vous
            </span>
          </h1>
          <p className="mt-5 mb-8 max-w-[450px] leading-relaxed" style={{ color: textLight }}>
            {agency.description ?? "On s'occupe de tout : recherche, visites, negociation, accompagnement. Votre seul role ? Nous dire de quoi vous revez."}
          </p>
          <div className="flex gap-4">
            <a href="#biens"
              className="px-7 py-3 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: lavender }}>
              Voir nos biens <ChevronRight className="inline w-4 h-4" />
            </a>
            <a href="#contact"
              className="px-7 py-3 rounded-full text-sm border-[1.5px] transition-colors"
              style={{ borderColor: "#e0dce8", color: dark }}>
              Estimer mon bien
            </a>
          </div>
        </div>
        <div className="flex-1 w-full grid grid-cols-2 grid-rows-2 gap-4 h-[280px] md:h-[380px] lg:h-[480px]">
          <div className="row-span-2 relative overflow-hidden" style={{ borderRadius: "100px 20px 20px 100px" }}>
            <Image src={agency.cover_url ?? FALLBACK_VIS_1} alt="" fill className="object-cover" priority />
          </div>
          <div className="relative overflow-hidden" style={{ borderRadius: "20px 100px 20px 20px" }}>
            <Image src={FALLBACK_VIS_2} alt="" fill className="object-cover" />
          </div>
          <div className="flex flex-col items-center justify-center text-center p-4"
            style={{ background: mint, borderRadius: "20px 20px 100px 20px", color: dark }}>
            <div className="font-['Fraunces'] text-3xl font-bold">{agency.listing_count}+</div>
            <div className="text-xs" style={{ color: textLight }}>Familles accompagnees</div>
          </div>
        </div>
      </div>

      {/* LISTINGS */}
      <section id="biens" className="px-4 py-16 md:px-12 md:py-20">
        <span className="inline-block px-4 py-1.5 rounded-full text-[0.7rem] uppercase tracking-wider font-semibold mb-3"
          style={{ background: blush, color: peach }}>
          Nos coups de coeur
        </span>
        <h2 className="font-['Fraunces'] text-2xl md:text-3xl mb-10" style={{ color: dark }}>Biens disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/annonce/${listing.slug}`}
              className="group block bg-white rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
            >
              <div className="relative h-[200px] m-3 rounded-[14px] overflow-hidden">
                {listing.cover_url ? (
                  <Image src={listing.cover_url} alt={listing.title} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full" style={{ background: blush }} />
                )}
                <span className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-[0.65rem] font-semibold"
                  style={{ color: lavender }}>
                  {listing.listing_type === "sale" ? "Vente" : "Location"}
                </span>
              </div>
              <div className="px-5 pb-5">
                <div className="font-['Fraunces'] text-xl font-bold" style={{ color: dark }}>
                  {formatPrice(listing.current_price, listing.currency)}
                </div>
                <div className="text-sm my-2" style={{ color: textColor }}>{listing.title}</div>
                <div className="flex gap-2 flex-wrap">
                  {listing.surface_m2 && (
                    <span className="px-3 py-1 rounded-full text-[0.7rem]" style={{ background: blush, color: textLight }}>
                      {listing.surface_m2} m²
                    </span>
                  )}
                  {listing.rooms && (
                    <span className="px-3 py-1 rounded-full text-[0.7rem]" style={{ background: blush, color: textLight }}>
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
      <div id="agence" className="mx-3 md:mx-12 bg-white rounded-3xl p-6 md:p-14 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center shadow-sm">
        <div className="relative h-[280px] md:h-[350px] rounded-2xl overflow-hidden">
          <Image
            src={agency.cover_url ?? FALLBACK_ABOUT}
            alt={`${agency.name} agence`}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full text-[0.7rem] uppercase tracking-wider font-semibold mb-3"
            style={{ background: blush, color: peach }}>
            Qui sommes-nous
          </span>
          <h2 className="font-['Fraunces'] text-2xl md:text-3xl mb-4" style={{ color: dark }}>
            Une agence a taille humaine
          </h2>
          {agency.description && (
            <p className="leading-relaxed mb-3" style={{ color: textLight }}>{agency.description}</p>
          )}
          <p className="leading-relaxed mb-6" style={{ color: textLight }}>
            Notre equipe vous accompagne avec bienveillance, transparence et bonne humeur.
          </p>
          <div className="flex gap-3 flex-wrap">
            <span className="px-4 py-2 rounded-full text-sm" style={{ background: blush, color: dark }}>
              {agency.listing_count} biens
            </span>
            <span className="px-4 py-2 rounded-full text-sm" style={{ background: blush, color: dark }}>
              Depuis {createdYear}
            </span>
            {agency.branches && agency.branches.length > 1 && (
              <span className="px-4 py-2 rounded-full text-sm" style={{ background: blush, color: dark }}>
                {agency.branches.length} agences
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <section id="contact" className="px-4 py-16 md:px-12 md:py-20">
        <span className="inline-block px-4 py-1.5 rounded-full text-[0.7rem] uppercase tracking-wider font-semibold mb-3"
          style={{ background: blush, color: peach }}>
          Un projet ?
        </span>
        <h2 className="font-['Fraunces'] text-2xl md:text-3xl mb-10" style={{ color: dark }}>On en parle !</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[20px] p-8 shadow-sm">
            <h3 className="font-['Fraunces'] text-xl mb-6" style={{ color: dark }}>Passez nous voir</h3>
            {address && (
              <p className="flex items-center gap-3 leading-loose" style={{ color: textLight }}>
                <MapPin size={16} style={{ color: lavender }} /> {address}
              </p>
            )}
            {agency.phone && (
              <p className="flex items-center gap-3 leading-loose" style={{ color: textLight }}>
                <Phone size={16} style={{ color: lavender }} /> {agency.phone}
              </p>
            )}
            {agency.email && (
              <p className="flex items-center gap-3 leading-loose" style={{ color: textLight }}>
                <Mail size={16} style={{ color: lavender }} /> {agency.email}
              </p>
            )}
            <p className="mt-4 text-sm" style={{ color: textLight }}>Lun — Sam &middot; 9h — 19h</p>
          </div>
          <div className="bg-white rounded-[20px] p-8 shadow-sm">
            <h3 className="font-['Fraunces'] text-xl mb-6" style={{ color: dark }}>Ecrivez-nous</h3>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
              <input type="text" placeholder="Votre nom"
                className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-colors border-[1.5px]"
                style={{ borderColor: "#EDE8F3", background: cream, color: textColor }} />
              <input type="email" placeholder="Votre email"
                className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-colors border-[1.5px]"
                style={{ borderColor: "#EDE8F3", background: cream, color: textColor }} />
              <input type="tel" placeholder="Votre telephone"
                className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-colors border-[1.5px]"
                style={{ borderColor: "#EDE8F3", background: cream, color: textColor }} />
              <textarea placeholder="Parlez-nous de votre projet..." rows={3}
                className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-colors resize-none border-[1.5px]"
                style={{ borderColor: "#EDE8F3", background: cream, color: textColor }} />
              <button type="submit"
                className="w-full py-3 rounded-[14px] text-sm font-semibold text-white cursor-pointer border-none transition-colors"
                style={{ background: lavender }}>
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center px-6 py-8 text-xs" style={{ color: textLight }}>
        &copy; {new Date().getFullYear()} {agency.name} &middot; Propulse par{" "}
        <span className="font-semibold" style={{ color: lavender }}>Aqar</span>Pro
      </footer>
    </div>
  );
}
