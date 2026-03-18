import Image from "next/image";
import { Phone, Mail, MessageCircle, MapPin, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorefrontProps } from "./types";

export default function SwissMinimal({ agency, listings, stats }: StorefrontProps) {
  const content = agency.storefront_content;

  return (
    <div
      className="min-h-screen bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100"
      style={{
        "--theme-primary": agency.branding?.primary_color ?? "#111111",
        "--theme-accent": agency.branding?.accent_color ?? "#FF4D00",
        "--theme-secondary": agency.branding?.secondary_color ?? "#F9F9F9",
      } as React.CSSProperties}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-stone-100 bg-white/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {agency.logo_url && (
              <div className="relative h-8 w-8 overflow-hidden rounded-md">
                <Image src={agency.logo_url} alt={agency.name} fill sizes="32px" className="object-cover" />
              </div>
            )}
            <span className="text-base font-bold">{agency.name}</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-stone-500 md:flex dark:text-stone-400">
            <a href="#about" className="transition-colors duration-200 hover:text-[var(--theme-accent)]">A propos</a>
            <a href="#listings" className="transition-colors duration-200 hover:text-[var(--theme-accent)]">Biens</a>
            <a href="#contact" className="inline-flex items-center gap-1 rounded-md bg-stone-900 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-[var(--theme-accent)] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-[var(--theme-accent)] dark:hover:text-white">
              Contact <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero — strict grid, text + image below */}
      <section className="border-b border-stone-100 py-16 sm:py-20 lg:py-28 dark:border-stone-800">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-4 lg:grid-cols-[7fr_5fr]">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {agency.name}
              </h1>
              {content?.tagline && (
                <p className="mt-4 max-w-lg text-lg text-stone-500 dark:text-stone-400">{content.tagline}</p>
              )}
              <a
                href="#listings"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[var(--theme-accent)] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-[var(--theme-accent)] dark:hover:text-white"
              >
                Voir les biens <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="flex items-end text-end">
              <span className="inline-block rounded-sm bg-[var(--theme-accent)] px-3 py-1 text-xs font-medium uppercase tracking-wider text-white">
                {stats.total_listings} biens
              </span>
            </div>
          </div>
          {content?.hero_image_url && (
            <div className="relative mt-12 aspect-[21/9] overflow-hidden rounded-md">
              <Image src={content.hero_image_url} alt={agency.name} fill sizes="100vw" className="object-cover" priority />
            </div>
          )}
        </div>
      </section>

      {/* About + Stats inline */}
      <section id="about" className="border-b border-stone-100 py-16 sm:py-20 dark:border-stone-800">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">A propos</h2>
            {content?.about_text && (
              <p className="mt-4 leading-relaxed text-stone-500 dark:text-stone-400">{content.about_text}</p>
            )}
            {content?.services && content.services.length > 0 && (
              <div className="mt-8 space-y-4">
                {content.services.map((service) => (
                  <div key={service.title} className="flex items-start gap-3">
                    <span className="mt-1 text-[var(--theme-accent)]">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-medium">{service.title}</h3>
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{service.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md bg-stone-50 p-6 dark:bg-stone-900">
              <p className="text-3xl font-bold">{stats.total_listings}</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Biens actifs</p>
            </div>
            <div className="rounded-md bg-stone-50 p-6 dark:bg-stone-900">
              <p className="text-3xl font-bold">{stats.total_views}</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Vues</p>
            </div>
            {content?.custom_stats?.years_experience != null && (
              <div className="rounded-md bg-stone-50 p-6 dark:bg-stone-900">
                <p className="text-3xl font-bold">{content.custom_stats.years_experience}</p>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Ans</p>
              </div>
            )}
            {content?.custom_stats?.satisfied_clients != null && (
              <div className="rounded-md bg-stone-50 p-6 dark:bg-stone-900">
                <p className="text-3xl font-bold">{content.custom_stats.satisfied_clients}</p>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Clients</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Listings — table rows, not cards */}
      <section id="listings" className="border-b border-stone-100 py-16 sm:py-20 dark:border-stone-800">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="mb-8 text-2xl font-bold">Biens</h2>
          <div className="space-y-0 divide-y divide-stone-100 dark:divide-stone-800">
            {listings.slice(0, 6).map((listing) => (
              <a
                key={listing.id}
                href={`/annonce/${listing.slug}`}
                className="group grid grid-cols-[80px_1fr_auto_auto] items-center gap-4 py-4 transition-colors duration-200 hover:bg-stone-50 sm:grid-cols-[120px_1fr_auto_auto] sm:gap-6 sm:rounded-md sm:px-3 dark:hover:bg-stone-900"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                  {listing.cover_url ? (
                    <Image src={listing.cover_url} alt={listing.title} fill sizes="120px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-100 text-stone-400 dark:bg-stone-800">
                      <MapPin className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-medium">{listing.title}</h3>
                  <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                    {listing.wilaya_name} &middot; {listing.area_m2} m&sup2;{listing.rooms != null && ` &middot; ${listing.rooms}p`}
                  </p>
                </div>
                <p className="text-end font-bold">
                  {listing.price.toLocaleString("fr-FR")} {listing.currency}
                </p>
                <span className="hidden text-[var(--theme-accent)] transition-transform duration-200 group-hover:translate-x-1 sm:block">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="text-2xl font-bold">Contact</h2>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-4">
            <a href={`tel:${agency.phone}`} className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[var(--theme-accent)] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-[var(--theme-accent)] dark:hover:text-white">
              <Phone className="h-4 w-4" /> Appeler <ArrowRight className="h-3 w-3" />
            </a>
            {agency.whatsapp_phone && (
              <a href={`https://wa.me/${agency.whatsapp_phone.replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-2 rounded-md border border-stone-200 px-6 py-3 text-sm transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] dark:border-stone-700">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            <a href={`mailto:${agency.email}`} className="inline-flex items-center gap-2 rounded-md border border-stone-200 px-6 py-3 text-sm transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] dark:border-stone-700">
              <Mail className="h-4 w-4" /> Email
            </a>
          </div>
          {agency.opening_hours && (
            <p className="mt-6 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
              <Clock className="h-4 w-4" /> {agency.opening_hours}
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-8 dark:border-stone-800">
        <div className="mx-auto max-w-[1200px] px-6 text-sm text-stone-400">
          &copy; {new Date().getFullYear()} {agency.name}
        </div>
      </footer>
    </div>
  );
}
