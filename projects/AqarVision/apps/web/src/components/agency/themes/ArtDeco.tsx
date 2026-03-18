import Image from "next/image";
import { Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorefrontProps } from "./types";

function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="h-px w-16 bg-[var(--theme-accent)] opacity-40" />
      <div className="h-3 w-3 rotate-45 border border-[var(--theme-accent)] opacity-60" />
      <div className="h-px w-16 bg-[var(--theme-accent)] opacity-40" />
    </div>
  );
}

export default function ArtDeco({ agency, listings, stats }: StorefrontProps) {
  const content = agency.storefront_content;

  return (
    <div
      className="min-h-screen bg-stone-50 text-stone-700 dark:bg-stone-950 dark:text-stone-300"
      style={{
        "--theme-primary": agency.branding?.primary_color ?? "#1B5E3B",
        "--theme-accent": agency.branding?.accent_color ?? "#C9A84C",
        "--theme-secondary": agency.branding?.secondary_color ?? "#C9A84C",
      } as React.CSSProperties}
    >
      {/* Deco band top */}
      <div
        className="h-[3px]"
        style={{
          background: `repeating-linear-gradient(90deg, var(--theme-primary) 0 33%, var(--theme-accent) 33% 66%, var(--theme-primary) 66% 100%)`,
        }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {agency.logo_url && (
              <div className="relative h-10 w-10 overflow-hidden">
                <Image src={agency.logo_url} alt={agency.name} fill sizes="40px" className="object-cover" />
              </div>
            )}
            <span className="text-lg font-bold text-[var(--theme-primary)]">{agency.name}</span>
          </div>
          <div className="hidden items-center gap-8 text-sm uppercase tracking-wider text-stone-500 md:flex dark:text-stone-400">
            <a href="#about" className="transition-colors duration-200 hover:text-[var(--theme-accent)]">A propos</a>
            <a href="#listings" className="transition-colors duration-200 hover:text-[var(--theme-accent)]">Biens</a>
            <a href="#contact" className="bg-[var(--theme-accent)] px-5 py-2 font-medium text-stone-900 transition-opacity duration-200 hover:opacity-90">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[var(--theme-primary)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:py-20 lg:grid-cols-2">
          <div className="flex flex-col justify-center text-white">
            <div className="mb-4 h-px w-12 bg-[var(--theme-accent)]" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{agency.name}</h1>
            {content?.tagline && (
              <p className="mt-4 text-lg text-white/70">{content.tagline}</p>
            )}
            <a
              href="#contact"
              className="mt-8 inline-block w-fit bg-[var(--theme-accent)] px-8 py-3 font-medium text-stone-900 transition-opacity duration-200 hover:opacity-90"
            >
              Nous contacter
            </a>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            {content?.hero_image_url ? (
              <Image src={content.hero_image_url} alt={agency.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
            ) : (
              <div className="h-full w-full bg-stone-800" />
            )}
          </div>
        </div>
      </section>

      {/* Stats with diamond dividers */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <DiamondDivider />
          <div className="grid grid-cols-2 gap-8 py-4 text-center md:grid-cols-4">
            <div>
              <p className="text-3xl font-bold text-[var(--theme-accent)]">{stats.total_listings}</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Biens</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--theme-accent)]">{stats.total_views}</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Vues</p>
            </div>
            {content?.custom_stats?.years_experience != null && (
              <div>
                <p className="text-3xl font-bold text-[var(--theme-accent)]">{content.custom_stats.years_experience}</p>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Ans</p>
              </div>
            )}
            {content?.custom_stats?.satisfied_clients != null && (
              <div>
                <p className="text-3xl font-bold text-[var(--theme-accent)]">{content.custom_stats.satisfied_clients}</p>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Clients</p>
              </div>
            )}
          </div>
          <DiamondDivider />
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="overflow-hidden bg-[var(--theme-primary)] text-white">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="p-8 sm:p-12">
                <div className="mb-4 h-px w-12 bg-[var(--theme-accent)]" />
                <h2 className="text-3xl font-bold">A propos</h2>
                {content?.about_text && (
                  <p className="mt-4 leading-relaxed text-white/80">{content.about_text}</p>
                )}
                {content?.services && content.services.length > 0 && (
                  <div className="mt-8 space-y-4">
                    {content.services.map((service) => (
                      <div key={service.title} className="border-s-2 border-[var(--theme-accent)] ps-4">
                        <h3 className="font-semibold">{service.title}</h3>
                        <p className="mt-1 text-sm text-white/60">{service.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {content?.extra_photos?.[0] ? (
                <div className="relative min-h-[300px]">
                  <Image src={content.extra_photos[0]} alt="About" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                </div>
              ) : (
                <div className="bg-[var(--theme-primary)]" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <DiamondDivider />
            <h2 className="text-3xl font-bold text-[var(--theme-primary)]">Nos biens</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 6).map((listing) => (
              <a
                key={listing.id}
                href={`/annonce/${listing.slug}`}
                className="group overflow-hidden bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-stone-900"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {listing.cover_url ? (
                    <Image src={listing.cover_url} alt={listing.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-100 text-stone-400 dark:bg-stone-800">
                      <MapPin className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute bottom-3 start-3">
                    <span className="bg-[var(--theme-primary)] px-3 py-1 text-xs font-medium text-white">
                      {listing.listing_type}
                    </span>
                  </div>
                </div>
                <div className="border-t border-[var(--theme-accent)]/20 p-4">
                  <p className="text-lg font-bold text-[var(--theme-accent)]">
                    {listing.price.toLocaleString("fr-FR")} {listing.currency}
                  </p>
                  <h3 className="mt-1 truncate font-medium text-stone-800 dark:text-stone-200">{listing.title}</h3>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    {listing.wilaya_name} &middot; {listing.area_m2} m&sup2;{listing.rooms != null && ` &middot; ${listing.rooms}p`}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <DiamondDivider />
          <h2 className="text-3xl font-bold text-[var(--theme-primary)]">Contactez-nous</h2>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-4">
            <a href={`tel:${agency.phone}`} className="inline-flex items-center gap-2 bg-[var(--theme-accent)] px-8 py-3 font-medium text-stone-900 transition-opacity duration-200 hover:opacity-90">
              <Phone className="h-4 w-4" /> Appeler
            </a>
            {agency.whatsapp_phone && (
              <a href={`https://wa.me/${agency.whatsapp_phone.replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-2 border border-stone-300 px-8 py-3 text-stone-700 transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] dark:border-stone-600 dark:text-stone-300">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            <a href={`mailto:${agency.email}`} className="inline-flex items-center gap-2 border border-stone-300 px-8 py-3 text-stone-700 transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] dark:border-stone-600 dark:text-stone-300">
              <Mail className="h-4 w-4" /> Email
            </a>
          </div>
          {agency.opening_hours && (
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-stone-500 dark:text-stone-400">
              <Clock className="h-4 w-4" /> {agency.opening_hours}
            </p>
          )}
        </div>
      </section>

      {/* Deco band bottom */}
      <div
        className="h-[3px]"
        style={{
          background: `repeating-linear-gradient(90deg, var(--theme-primary) 0 33%, var(--theme-accent) 33% 66%, var(--theme-primary) 66% 100%)`,
        }}
      />

      {/* Footer */}
      <footer className="py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-stone-500 dark:text-stone-400">
          &copy; {new Date().getFullYear()} {agency.name}. Tous droits r&eacute;serv&eacute;s.
        </div>
      </footer>
    </div>
  );
}
