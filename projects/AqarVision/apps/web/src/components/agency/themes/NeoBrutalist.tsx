import Image from "next/image";
import { Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorefrontProps } from "./types";

export default function NeoBrutalist({ agency, listings, stats }: StorefrontProps) {
  const content = agency.storefront_content;
  const manifesto = content?.theme_extras?.manifesto;

  return (
    <div
      className="min-h-screen bg-stone-100 font-mono text-stone-900 dark:bg-stone-900 dark:text-stone-100"
      style={{
        "--theme-primary": agency.branding?.primary_color ?? "#111111",
        "--theme-accent": agency.branding?.accent_color ?? "#E8FF00",
        "--theme-secondary": agency.branding?.secondary_color ?? "#FF3B30",
      } as React.CSSProperties}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b-2 border-stone-900 bg-stone-100 dark:border-stone-300 dark:bg-stone-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {agency.logo_url && (
              <div className="relative h-10 w-10 overflow-hidden border-2 border-stone-900 dark:border-stone-300">
                <Image src={agency.logo_url} alt={agency.name} fill sizes="40px" className="object-cover" />
              </div>
            )}
            <span className="text-lg font-bold uppercase tracking-widest">{agency.name}</span>
          </div>
          <div className="hidden items-center gap-8 text-xs uppercase tracking-[0.2em] md:flex">
            <a href="#about" className="transition-colors duration-100 hover:text-[var(--theme-secondary)]">About</a>
            <a href="#listings" className="transition-colors duration-100 hover:text-[var(--theme-secondary)]">Biens</a>
            <a href="#contact" className="border-2 border-stone-900 bg-[var(--theme-accent)] px-4 py-2 font-bold text-stone-900 transition-colors duration-100 hover:bg-[var(--theme-secondary)] hover:text-white dark:border-stone-300">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b-2 border-stone-900 dark:border-stone-300">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="flex flex-col justify-center border-b-2 border-stone-900 p-8 sm:p-12 lg:border-b-0 lg:border-e-2 dark:border-stone-300">
            {manifesto ? (
              <h1 className="text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl">
                {manifesto}
              </h1>
            ) : (
              <h1 className="text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl">
                {agency.name}
              </h1>
            )}
            {content?.tagline && (
              <p className="mt-6 max-w-md text-sm uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {content.tagline}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center p-8 sm:p-12">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="border-2 border-stone-900 bg-[var(--theme-accent)] p-6 text-stone-900 dark:border-stone-300">
                <p className="text-4xl font-extrabold">{stats.total_listings}</p>
                <p className="mt-1 text-xs uppercase tracking-widest">Biens</p>
              </div>
              <div className="border-2 border-stone-900 p-6 dark:border-stone-300">
                <p className="text-4xl font-extrabold">{stats.total_views}</p>
                <p className="mt-1 text-xs uppercase tracking-widest">Vues</p>
              </div>
              {content?.custom_stats?.years_experience != null && (
                <div className="border-2 border-stone-900 p-6 dark:border-stone-300">
                  <p className="text-4xl font-extrabold">{content.custom_stats.years_experience}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest">Ans</p>
                </div>
              )}
              {content?.custom_stats?.satisfied_clients != null && (
                <div className="border-2 border-stone-900 bg-[var(--theme-secondary)] p-6 text-white dark:border-stone-300">
                  <p className="text-4xl font-extrabold">{content.custom_stats.satisfied_clients}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest">Clients</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-b-2 border-stone-900 dark:border-stone-300">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="border-b-2 border-stone-900 p-8 sm:p-12 lg:border-b-0 lg:border-e-2 dark:border-stone-300">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight">A propos</h2>
            {content?.about_text && (
              <p className="mt-4 leading-relaxed text-stone-600 dark:text-stone-400">{content.about_text}</p>
            )}
          </div>
          {content?.services && content.services.length > 0 && (
            <div className="p-8 sm:p-12">
              <div className="space-y-4">
                {content.services.map((service, i) => (
                  <div key={service.title} className="border-2 border-stone-900 p-4 dark:border-stone-300">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-400">0{i + 1}</span>
                      <h3 className="font-bold uppercase">{service.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{service.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="border-b-2 border-stone-900 dark:border-stone-300">
        <div className="mx-auto max-w-7xl p-8 sm:p-12">
          <h2 className="mb-8 text-2xl font-extrabold uppercase tracking-tight">Biens</h2>
          <div className="grid border-2 border-stone-900 sm:grid-cols-2 lg:grid-cols-3 dark:border-stone-300">
            {listings.slice(0, 6).map((listing, i) => (
              <a
                key={listing.id}
                href={`/annonce/${listing.slug}`}
                className={cn(
                  "group relative border-b-2 border-stone-900 p-0 transition-colors duration-100 hover:bg-[var(--theme-accent)] dark:border-stone-300",
                  i % 3 !== 2 && "lg:border-e-2",
                  i % 2 !== 1 && "sm:border-e-2 lg:border-e-0",
                )}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {listing.cover_url ? (
                    <Image src={listing.cover_url} alt={listing.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-200 text-stone-400 dark:bg-stone-800 dark:text-stone-600">
                      <MapPin className="h-8 w-8" />
                    </div>
                  )}
                  <span className="absolute end-0 top-0 bg-stone-900 px-3 py-1 text-xs font-bold uppercase text-white opacity-20 dark:bg-stone-100 dark:text-stone-900">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="truncate font-bold uppercase group-hover:text-stone-900">{listing.title}</h3>
                  <p className="mt-1 text-lg font-extrabold">{listing.price.toLocaleString("fr-FR")} {listing.currency}</p>
                  <div className="mt-1 text-xs uppercase tracking-wider text-stone-500 group-hover:text-stone-700">
                    {listing.area_m2} m&sup2; {listing.rooms != null && `/ ${listing.rooms}p`} / {listing.wilaya_name}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-b-2 border-stone-900 py-20 dark:border-stone-300">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight">Contact</h2>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-4">
            <a href={`tel:${agency.phone}`} className="inline-flex items-center gap-2 border-2 border-stone-900 bg-[var(--theme-accent)] px-8 py-3 font-bold uppercase tracking-wider text-stone-900 transition-colors duration-100 hover:bg-[var(--theme-secondary)] hover:text-white dark:border-stone-300">
              <Phone className="h-4 w-4" /> Appeler
            </a>
            {agency.whatsapp_phone && (
              <a href={`https://wa.me/${agency.whatsapp_phone.replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-2 border-2 border-stone-900 px-8 py-3 font-bold uppercase tracking-wider transition-colors duration-100 hover:bg-stone-900 hover:text-stone-100 dark:border-stone-300 dark:hover:bg-stone-100 dark:hover:text-stone-900">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            <a href={`mailto:${agency.email}`} className="inline-flex items-center gap-2 border-2 border-stone-900 px-8 py-3 font-bold uppercase tracking-wider transition-colors duration-100 hover:bg-stone-900 hover:text-stone-100 dark:border-stone-300 dark:hover:bg-stone-100 dark:hover:text-stone-900">
              <Mail className="h-4 w-4" /> Email
            </a>
          </div>
          {agency.opening_hours && (
            <p className="mt-6 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400">
              <Clock className="h-4 w-4" /> {agency.opening_hours}
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs uppercase tracking-widest text-stone-400">
          &copy; {new Date().getFullYear()} {agency.name}
        </div>
      </footer>
    </div>
  );
}
