import Image from "next/image";
import { Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorefrontProps } from "./types";

export default function MediterraneenContemporain({ agency, listings, stats }: StorefrontProps) {
  const content = agency.storefront_content;

  return (
    <div
      className="min-h-screen bg-stone-50 text-stone-700 dark:bg-stone-900 dark:text-stone-300"
      style={{
        "--theme-primary": agency.branding?.primary_color ?? "#1B6B6D",
        "--theme-accent": agency.branding?.accent_color ?? "#1B6B6D",
        "--theme-secondary": agency.branding?.secondary_color ?? "#C4613A",
      } as React.CSSProperties}
    >
      {/* Zellige band top */}
      <div
        className="h-[3px]"
        style={{
          background: `repeating-linear-gradient(90deg, var(--theme-primary) 0 4px, var(--theme-secondary) 4px 8px, var(--bg-app, #FAF7F2) 8px 12px)`,
        }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {agency.logo_url && (
              <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                <Image src={agency.logo_url} alt={agency.name} fill sizes="40px" className="object-cover" />
              </div>
            )}
            <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">{agency.name}</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-stone-500 md:flex dark:text-stone-400">
            <a href="#about" className="transition-colors duration-200 hover:text-[var(--theme-primary)]">A propos</a>
            <a href="#listings" className="transition-colors duration-200 hover:text-[var(--theme-primary)]">Biens</a>
            <a href="#contact" className="rounded-xl bg-[var(--theme-primary)] px-5 py-2 text-white transition-opacity duration-200 hover:opacity-90">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero — mosaic layout */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-100">
              {agency.name}
            </h1>
            {content?.tagline && (
              <p className="mt-4 text-lg text-stone-500 dark:text-stone-400">{content.tagline}</p>
            )}
            <div className="mt-8 flex gap-3">
              <a href="#contact" className="rounded-xl bg-[var(--theme-primary)] px-6 py-3 font-medium text-white transition-opacity duration-200 hover:opacity-90">
                Nous contacter
              </a>
              <a href="#listings" className="rounded-xl border border-stone-300 px-6 py-3 font-medium text-stone-700 transition-colors duration-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] dark:border-stone-600 dark:text-stone-300">
                Voir les biens
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {content?.hero_image_url && (
              <div className="relative col-span-1 row-span-2 overflow-hidden rounded-[2.5rem] sm:rounded-[5rem]">
                <Image src={content.hero_image_url} alt={agency.name} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
              </div>
            )}
            {content?.extra_photos?.[0] && (
              <div className="relative overflow-hidden rounded-xl">
                <Image src={content.extra_photos[0]} alt="Photo 2" fill sizes="20vw" className="object-cover" />
              </div>
            )}
            <div className="flex items-center justify-center rounded-xl bg-[var(--theme-primary)] p-6 text-center text-white">
              <div>
                <p className="text-3xl font-bold">{stats.total_listings}</p>
                <p className="mt-1 text-sm opacity-80">Biens actifs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="overflow-hidden rounded-3xl bg-[var(--theme-primary)] p-8 text-white sm:p-12">
            <h2 className="text-3xl font-bold">A propos</h2>
            {content?.about_text && (
              <p className="mt-4 max-w-2xl leading-relaxed opacity-90">{content.about_text}</p>
            )}
            {content?.services && content.services.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {content.services.map((service) => (
                  <div key={service.title} className="rounded-xl bg-white/10 p-5">
                    <h3 className="font-semibold">{service.title}</h3>
                    <p className="mt-2 text-sm opacity-80">{service.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
          <div>
            <p className="text-3xl font-bold text-[var(--theme-secondary)]">{stats.total_listings}</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Biens</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--theme-secondary)]">{stats.total_views}</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Vues</p>
          </div>
          {content?.custom_stats?.years_experience != null && (
            <div>
              <p className="text-3xl font-bold text-[var(--theme-secondary)]">{content.custom_stats.years_experience}</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Ans</p>
            </div>
          )}
          {content?.custom_stats?.satisfied_clients != null && (
            <div>
              <p className="text-3xl font-bold text-[var(--theme-secondary)]">{content.custom_stats.satisfied_clients}</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Clients</p>
            </div>
          )}
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-stone-900 dark:text-stone-100">Nos biens</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 6).map((listing) => (
              <a
                key={listing.id}
                href={`/annonce/${listing.slug}`}
                className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-stone-800"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {listing.cover_url ? (
                    <Image src={listing.cover_url} alt={listing.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-100 text-stone-400 dark:bg-stone-700">
                      <MapPin className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
                      {listing.price.toLocaleString("fr-FR")} {listing.currency}
                    </p>
                    <span className="rounded-full bg-[var(--theme-secondary)] px-3 py-0.5 text-xs font-medium text-white">
                      {listing.listing_type}
                    </span>
                  </div>
                  <h3 className="mt-1 truncate text-stone-700 dark:text-stone-300">{listing.title}</h3>
                  <p className="mt-1 text-sm text-[var(--theme-primary)]">
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
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Contactez-nous</h2>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-4">
            <a href={`tel:${agency.phone}`} className="inline-flex items-center gap-2 rounded-xl bg-[var(--theme-primary)] px-8 py-3 font-medium text-white transition-opacity duration-200 hover:opacity-90">
              <Phone className="h-4 w-4" /> Appeler
            </a>
            {agency.whatsapp_phone && (
              <a href={`https://wa.me/${agency.whatsapp_phone.replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-8 py-3 text-stone-700 transition-colors duration-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] dark:border-stone-600 dark:text-stone-300">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            <a href={`mailto:${agency.email}`} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-8 py-3 text-stone-700 transition-colors duration-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] dark:border-stone-600 dark:text-stone-300">
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

      {/* Zellige band bottom */}
      <div
        className="h-[3px]"
        style={{
          background: `repeating-linear-gradient(90deg, var(--theme-primary) 0 4px, var(--theme-secondary) 4px 8px, var(--bg-app, #FAF7F2) 8px 12px)`,
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
