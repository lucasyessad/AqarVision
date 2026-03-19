import Image from "next/image";
import { Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorefrontProps } from "./types";

export default function LuxeNoir({ agency, listings, stats }: StorefrontProps) {
  const content = agency.storefront_content;
  const goldenTagline = content?.theme_extras?.golden_tagline;

  return (
    <div
      className="min-h-screen bg-stone-950 text-stone-200"
      style={{
        "--theme-primary": agency.branding?.primary_color ?? "#C8A45C",
        "--theme-accent": agency.branding?.accent_color ?? "#C8A45C",
        "--theme-secondary": agency.branding?.secondary_color ?? "#1A1A1A",
      } as React.CSSProperties}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {agency.logo_url && (
              <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                <Image src={agency.logo_url} alt={agency.name} fill sizes="40px" className="object-cover" />
              </div>
            )}
            <span className="text-lg font-bold text-[var(--theme-primary)]">{agency.name}</span>
          </div>
          <div className="hidden items-center gap-8 text-sm uppercase tracking-widest text-stone-400 md:flex">
            <a href="#about" className="transition-colors duration-200 hover:text-[var(--theme-primary)]">About</a>
            <a href="#listings" className="transition-colors duration-200 hover:text-[var(--theme-primary)]">Biens</a>
            <a href="#contact" className="transition-colors duration-200 hover:text-[var(--theme-primary)]">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        {content?.hero_image_url && (
          <Image
            src={content.hero_image_url}
            alt={agency.name}
            fill
            sizes="100vw"
            className="object-cover opacity-30"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
        <div className="relative z-[1] mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto mb-6 h-[2px] w-10 bg-[var(--theme-primary)]" />
          <h1 className="text-4xl font-bold tracking-tight text-stone-100 sm:text-5xl lg:text-6xl">
            {agency.name}
          </h1>
          {content?.tagline && (
            <p className="mt-4 text-lg text-stone-400">{content.tagline}</p>
          )}
          {goldenTagline && (
            <p className="mt-3 text-xl font-light italic text-[var(--theme-primary)]">
              {goldenTagline}
            </p>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-8 h-[2px] w-10 bg-[var(--theme-primary)]" />
          <div className="grid gap-12 lg:grid-cols-2">
            {content?.extra_photos?.[0] && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image src={content.extra_photos[0]} alt="About" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
            )}
            <div className={cn("flex flex-col justify-center", !content?.extra_photos?.[0] && "lg:col-span-2 lg:mx-auto lg:max-w-2xl")}>
              <h2 className="text-3xl font-bold text-stone-100">Notre histoire</h2>
              {content?.about_text && (
                <p className="mt-4 leading-relaxed text-stone-400">{content.about_text}</p>
              )}
              {content?.services && content.services.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {content.services.map((service) => (
                    <div key={service.title} className="rounded-lg border border-stone-800 bg-stone-900 p-4">
                      <h3 className="font-semibold text-[var(--theme-primary)]">{service.title}</h3>
                      <p className="mt-1 text-sm text-stone-500">{service.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-stone-800 bg-stone-950 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
          <div>
            <p className="text-3xl font-bold text-[var(--theme-primary)]">{stats.total_listings}</p>
            <p className="mt-1 text-sm uppercase tracking-wider text-stone-500">Biens</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--theme-primary)]">{stats.total_views}</p>
            <p className="mt-1 text-sm uppercase tracking-wider text-stone-500">Vues</p>
          </div>
          {content?.custom_stats?.years_experience != null && (
            <div>
              <p className="text-3xl font-bold text-[var(--theme-primary)]">{content.custom_stats.years_experience}</p>
              <p className="mt-1 text-sm uppercase tracking-wider text-stone-500">Ann&eacute;es</p>
            </div>
          )}
          {content?.custom_stats?.satisfied_clients != null && (
            <div>
              <p className="text-3xl font-bold text-[var(--theme-primary)]">{content.custom_stats.satisfied_clients}</p>
              <p className="mt-1 text-sm uppercase tracking-wider text-stone-500">Clients</p>
            </div>
          )}
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-8 h-[2px] w-10 bg-[var(--theme-primary)]" />
          <h2 className="mb-12 text-center text-3xl font-bold text-stone-100">Nos biens</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 6).map((listing) => (
              <a
                key={listing.id}
                href={`/annonce/${listing.slug}`}
                className="group overflow-hidden rounded-lg bg-stone-900 transition-transform duration-300 hover:-translate-y-1.5"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {listing.cover_url ? (
                    <Image src={listing.cover_url} alt={listing.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-800 text-stone-600">
                      <MapPin className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
                  <div className="absolute bottom-3 start-3">
                    <span className="text-xl font-bold text-[var(--theme-primary)]">
                      {listing.price.toLocaleString("fr-FR")} {listing.currency}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="truncate font-semibold text-stone-100">{listing.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-stone-500">
                    <span>{listing.area_m2} m&sup2;</span>
                    <span className="text-[var(--theme-primary)]">&middot;</span>
                    {listing.rooms != null && (
                      <>
                        <span>{listing.rooms} pi&egrave;ces</span>
                        <span className="text-[var(--theme-primary)]">&middot;</span>
                      </>
                    )}
                    <span>{listing.wilaya_name}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-stone-800 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-stone-100">Contactez-nous</h2>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <a href={`tel:${agency.phone}`} className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--theme-primary)] px-6 py-3 font-medium text-[var(--theme-primary)] transition-colors duration-200 hover:bg-[var(--theme-primary)] hover:text-stone-950">
              <Phone className="h-4 w-4" /> Appeler
            </a>
            {agency.whatsapp_phone && (
              <a href={`https://wa.me/${agency.whatsapp_phone.replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-2 rounded-lg border border-stone-700 px-6 py-3 text-stone-300 transition-colors duration-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            <a href={`mailto:${agency.email}`} className="inline-flex items-center gap-2 rounded-lg border border-stone-700 px-6 py-3 text-stone-300 transition-colors duration-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]">
              <Mail className="h-4 w-4" /> Email
            </a>
          </div>
          {agency.opening_hours && (
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-stone-500">
              <Clock className="h-4 w-4" /> {agency.opening_hours}
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-stone-600">
          &copy; {new Date().getFullYear()} {agency.name}. Tous droits r&eacute;serv&eacute;s.
        </div>
      </footer>
    </div>
  );
}
