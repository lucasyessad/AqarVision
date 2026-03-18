import Image from "next/image";
import { Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorefrontProps } from "./types";

export default function CorporateNavy({ agency, listings, stats }: StorefrontProps) {
  const content = agency.storefront_content;
  const topbarHours = content?.theme_extras?.topbar_hours ?? agency.opening_hours;

  return (
    <div
      className="min-h-screen bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-300"
      style={{
        "--theme-primary": agency.branding?.primary_color ?? "#0F1B3D",
        "--theme-accent": agency.branding?.accent_color ?? "#2563EB",
        "--theme-secondary": agency.branding?.secondary_color ?? "#2563EB",
      } as React.CSSProperties}
    >
      {/* Top bar */}
      {topbarHours && (
        <div className="bg-[var(--theme-primary)] px-6 py-2 text-center text-xs text-white/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> {topbarHours}
            </span>
            <span className="hidden items-center gap-4 sm:flex">
              <a href={`tel:${agency.phone}`} className="flex items-center gap-1 hover:text-white">
                <Phone className="h-3 w-3" /> {agency.phone}
              </a>
              <a href={`mailto:${agency.email}`} className="flex items-center gap-1 hover:text-white">
                <Mail className="h-3 w-3" /> {agency.email}
              </a>
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {agency.logo_url && (
              <div className="relative h-10 w-10 overflow-hidden rounded-md">
                <Image src={agency.logo_url} alt={agency.name} fill sizes="40px" className="object-cover" />
              </div>
            )}
            <span className="text-lg font-semibold text-[var(--theme-primary)] dark:text-white">{agency.name}</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-slate-500 md:flex dark:text-slate-400">
            <a href="#about" className="transition-colors duration-200 hover:text-[var(--theme-accent)]">A propos</a>
            <a href="#listings" className="transition-colors duration-200 hover:text-[var(--theme-accent)]">Biens</a>
            <a href="#contact" className="rounded-md bg-[var(--theme-accent)] px-5 py-2 text-white transition-opacity duration-200 hover:opacity-90">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[var(--theme-primary)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:py-20 lg:grid-cols-2">
          <div className="flex flex-col justify-center text-white">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{agency.name}</h1>
            {content?.tagline && (
              <p className="mt-4 text-lg text-white/70">{content.tagline}</p>
            )}
            <a
              href="#contact"
              className="mt-8 inline-block w-fit rounded-md bg-[var(--theme-accent)] px-8 py-3 font-medium text-white transition-opacity duration-200 hover:opacity-90"
            >
              Nous contacter
            </a>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            {content?.hero_image_url ? (
              <Image src={content.hero_image_url} alt={agency.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
            ) : (
              <div className="h-full w-full bg-slate-800" />
            )}
          </div>
        </div>
      </section>

      {/* Trust bar / Stats */}
      <section className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-slate-200 px-6 py-8 text-center md:grid-cols-4 dark:divide-slate-800">
          <div className="px-4">
            <p className="text-3xl font-bold text-[var(--theme-primary)] dark:text-white">{stats.total_listings}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Biens actifs</p>
          </div>
          <div className="px-4">
            <p className="text-3xl font-bold text-[var(--theme-primary)] dark:text-white">{stats.total_views}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Vues</p>
          </div>
          {content?.custom_stats?.years_experience != null && (
            <div className="px-4">
              <p className="text-3xl font-bold text-[var(--theme-primary)] dark:text-white">{content.custom_stats.years_experience}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ans</p>
            </div>
          )}
          {content?.custom_stats?.satisfied_clients != null && (
            <div className="px-4">
              <p className="text-3xl font-bold text-[var(--theme-primary)] dark:text-white">{content.custom_stats.satisfied_clients}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Clients</p>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-slate-50 py-20 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2">
          {content?.extra_photos?.[0] && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image src={content.extra_photos[0]} alt="About" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
          )}
          <div className={cn("flex flex-col justify-center", !content?.extra_photos?.[0] && "lg:col-span-2 lg:mx-auto lg:max-w-2xl")}>
            <h2 className="text-3xl font-bold text-[var(--theme-primary)] dark:text-white">A propos</h2>
            {content?.about_text && (
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{content.about_text}</p>
            )}
            {content?.services && content.services.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-4">
                {content.services.map((service) => (
                  <div key={service.title} className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <h3 className="font-semibold text-[var(--theme-primary)] dark:text-white">{service.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{service.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-[var(--theme-primary)] dark:text-white">Nos biens</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 6).map((listing, i) => (
              <a
                key={listing.id}
                href={`/annonce/${listing.slug}`}
                className="group overflow-hidden rounded-md border border-slate-200 bg-white transition-shadow duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {listing.cover_url ? (
                    <Image src={listing.cover_url} alt={listing.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                      <MapPin className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-lg font-bold text-[var(--theme-primary)] dark:text-white">
                    {listing.price.toLocaleString("fr-FR")} {listing.currency}
                  </p>
                  <h3 className="mt-1 truncate font-medium text-slate-800 dark:text-slate-200">{listing.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {listing.wilaya_name} &middot; {listing.area_m2} m&sup2;{listing.rooms != null && ` &middot; ${listing.rooms}p`}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">R&eacute;f. #{String(i + 1).padStart(4, "0")}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-slate-50 py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-[var(--theme-primary)] dark:text-white">Contactez-nous</h2>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-4">
            <a href={`tel:${agency.phone}`} className="inline-flex items-center gap-2 rounded-md bg-[var(--theme-accent)] px-8 py-3 font-medium text-white transition-opacity duration-200 hover:opacity-90">
              <Phone className="h-4 w-4" /> Appeler
            </a>
            {agency.whatsapp_phone && (
              <a href={`https://wa.me/${agency.whatsapp_phone.replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-8 py-3 text-slate-700 transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] dark:border-slate-600 dark:text-slate-300">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            <a href={`mailto:${agency.email}`} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-8 py-3 text-slate-700 transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] dark:border-slate-600 dark:text-slate-300">
              <Mail className="h-4 w-4" /> Email
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-[var(--theme-primary)] py-8 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-white/60">
          &copy; {new Date().getFullYear()} {agency.name}. Tous droits r&eacute;serv&eacute;s.
        </div>
      </footer>
    </div>
  );
}
