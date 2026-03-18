import Image from "next/image";
import { Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorefrontProps } from "./types";

export default function Mediterranee({ agency, listings, stats }: StorefrontProps) {
  const content = agency.storefront_content;

  return (
    <div
      className="min-h-screen bg-stone-50 text-stone-700 dark:bg-stone-900 dark:text-stone-300"
      style={{
        "--theme-primary": agency.branding?.primary_color ?? "#C4775A",
        "--theme-accent": agency.branding?.accent_color ?? "#C4775A",
        "--theme-secondary": agency.branding?.secondary_color ?? "#5E6B52",
      } as React.CSSProperties}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {agency.logo_url && (
              <div className="relative h-10 w-10 overflow-hidden rounded-2xl">
                <Image src={agency.logo_url} alt={agency.name} fill sizes="40px" className="object-cover" />
              </div>
            )}
            <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">{agency.name}</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-stone-500 md:flex dark:text-stone-400">
            <a href="#about" className="transition-colors duration-200 hover:text-[var(--theme-primary)]">A propos</a>
            <a href="#listings" className="transition-colors duration-200 hover:text-[var(--theme-primary)]">Biens</a>
            <a href="#contact" className="transition-colors duration-200 hover:text-[var(--theme-primary)]">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-b-3xl sm:aspect-[2.5/1]">
          {content?.hero_image_url ? (
            <Image
              src={content.hero_image_url}
              alt={agency.name}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-stone-200 dark:bg-stone-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/30 to-transparent" />
          <div className="absolute inset-0 flex items-end pb-12 ps-8 sm:pb-16 sm:ps-12">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-5xl">{agency.name}</h1>
              {content?.tagline && (
                <p className="mt-2 max-w-xl text-lg text-white/80">{content.tagline}</p>
              )}
              <a
                href="#contact"
                className="mt-6 inline-block rounded-full bg-[var(--theme-primary)] px-8 py-3 font-medium text-white transition-opacity duration-200 hover:opacity-90"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="overflow-hidden rounded-3xl bg-stone-100 dark:bg-stone-800">
            <div className="p-8 sm:p-12">
              <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100">A propos</h2>
              {content?.about_text && (
                <p className="mt-4 max-w-2xl leading-relaxed text-stone-600 dark:text-stone-400">
                  {content.about_text}
                </p>
              )}
              {content?.services && content.services.length > 0 && (
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {content.services.map((service) => (
                    <div key={service.title} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-900 dark:text-stone-100">{service.title}</h3>
                        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{service.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
          <div>
            <p className="text-3xl font-bold text-[var(--theme-primary)]">{stats.total_listings}</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Biens</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--theme-primary)]">{stats.total_views}</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Vues</p>
          </div>
          {content?.custom_stats?.years_experience != null && (
            <div>
              <p className="text-3xl font-bold text-[var(--theme-primary)]">{content.custom_stats.years_experience}</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Ans d&apos;exp&eacute;rience</p>
            </div>
          )}
          {content?.custom_stats?.satisfied_clients != null && (
            <div>
              <p className="text-3xl font-bold text-[var(--theme-primary)]">{content.custom_stats.satisfied_clients}</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Clients satisfaits</p>
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
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-stone-800"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {listing.cover_url ? (
                    <Image src={listing.cover_url} alt={listing.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-100 text-stone-400 dark:bg-stone-700 dark:text-stone-500">
                      <MapPin className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute start-3 top-3">
                    <span className="rounded-full bg-[var(--theme-secondary)] px-3 py-1 text-xs font-medium text-white">
                      {listing.listing_type}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-lg font-bold text-[var(--theme-primary)]">
                    {listing.price.toLocaleString("fr-FR")} {listing.currency}
                  </p>
                  <h3 className="mt-1 truncate font-medium text-stone-900 dark:text-stone-100">{listing.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                    <span>{listing.area_m2} m&sup2;</span>
                    {listing.rooms != null && <span>&middot; {listing.rooms} pi&egrave;ces</span>}
                    <span>&middot; {listing.wilaya_name}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Nous contacter</h2>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-4">
            <a href={`tel:${agency.phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--theme-primary)] px-8 py-3 font-medium text-white transition-opacity duration-200 hover:opacity-90">
              <Phone className="h-4 w-4" /> Appeler
            </a>
            {agency.whatsapp_phone && (
              <a href={`https://wa.me/${agency.whatsapp_phone.replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-8 py-3 text-stone-700 transition-colors duration-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] dark:border-stone-600 dark:text-stone-300">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            <a href={`mailto:${agency.email}`} className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-8 py-3 text-stone-700 transition-colors duration-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] dark:border-stone-600 dark:text-stone-300">
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

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8 dark:border-stone-700">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-stone-500 dark:text-stone-400">
          &copy; {new Date().getFullYear()} {agency.name}. Tous droits r&eacute;serv&eacute;s.
        </div>
      </footer>
    </div>
  );
}
