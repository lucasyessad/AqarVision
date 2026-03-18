import Image from "next/image";
import { Phone, Mail, MessageCircle, MapPin, Clock, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorefrontProps } from "./types";

export default function OrganiqueEco({ agency, listings, stats }: StorefrontProps) {
  const content = agency.storefront_content;
  const ecoCertifications = content?.theme_extras?.eco_certifications;

  return (
    <div
      className="min-h-screen bg-stone-50 text-stone-700 dark:bg-stone-900 dark:text-stone-300"
      style={{
        "--theme-primary": agency.branding?.primary_color ?? "#2D5F3C",
        "--theme-accent": agency.branding?.accent_color ?? "#6B5344",
        "--theme-secondary": agency.branding?.secondary_color ?? "#7A9E7E",
      } as React.CSSProperties}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-md dark:border-stone-700/60 dark:bg-stone-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {agency.logo_url && (
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image src={agency.logo_url} alt={agency.name} fill sizes="40px" className="object-cover" />
              </div>
            )}
            <span className="text-lg font-semibold text-[var(--theme-primary)]">{agency.name}</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-stone-500 md:flex dark:text-stone-400">
            <a href="#about" className="transition-colors duration-200 hover:text-[var(--theme-primary)]">A propos</a>
            <a href="#listings" className="transition-colors duration-200 hover:text-[var(--theme-primary)]">Biens</a>
            <a href="#contact" className="rounded-full bg-[var(--theme-primary)] px-5 py-2 text-white transition-opacity duration-200 hover:opacity-90">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <span className="mb-4 text-sm text-stone-400">
              &mdash; {agency.name}
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-stone-800 sm:text-5xl dark:text-stone-100">
              {content?.tagline ?? agency.name}
            </h1>
            {agency.description && content?.tagline && (
              <p className="mt-4 text-lg text-stone-500 dark:text-stone-400">{agency.description}</p>
            )}
            <div className="mt-8 flex gap-3">
              <a href="#contact" className="rounded-full bg-[var(--theme-primary)] px-8 py-3 font-medium text-white transition-opacity duration-200 hover:opacity-90">
                Nous contacter
              </a>
              <a href="#listings" className="rounded-full border border-stone-300 px-8 py-3 text-stone-700 transition-colors duration-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] dark:border-stone-600 dark:text-stone-300">
                Nos biens
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {content?.hero_image_url && (
              <div className="relative col-span-2 overflow-hidden rounded-[2rem] rounded-tl-[4rem]">
                <div className="aspect-[16/9]">
                  <Image src={content.hero_image_url} alt={agency.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
                </div>
              </div>
            )}
            {content?.extra_photos?.[0] && (
              <div className="relative overflow-hidden rounded-[1.5rem] rounded-bl-[3rem]">
                <div className="aspect-square">
                  <Image src={content.extra_photos[0]} alt="Photo 2" fill sizes="20vw" className="object-cover" />
                </div>
              </div>
            )}
            {content?.extra_photos?.[1] && (
              <div className="relative overflow-hidden rounded-[1.5rem] rounded-br-[3rem]">
                <div className="aspect-square">
                  <Image src={content.extra_photos[1]} alt="Photo 3" fill sizes="20vw" className="object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Eco certifications */}
      {ecoCertifications && (
        <section className="py-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-6">
            {ecoCertifications.split(",").map((cert: string) => (
              <span
                key={cert.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--theme-secondary)]/20 px-4 py-2 text-sm font-medium text-[var(--theme-primary)]"
              >
                <Leaf className="h-4 w-4" /> {cert.trim()}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      <section id="about" className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="overflow-hidden rounded-[2rem] bg-[var(--theme-primary)] p-8 text-white sm:p-12">
            <span className="text-sm text-white/60">&mdash; Notre agence</span>
            <h2 className="mt-2 text-3xl font-bold">A propos</h2>
            {content?.about_text && (
              <p className="mt-4 max-w-2xl leading-relaxed text-white/80">{content.about_text}</p>
            )}
            {content?.services && content.services.length > 0 && (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {content.services.map((service) => (
                  <div key={service.title} className="rounded-2xl bg-white/10 p-5">
                    <h3 className="font-semibold">{service.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{service.text}</p>
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
      </section>

      {/* Listings */}
      <section id="listings" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <span className="text-sm text-stone-400">&mdash; Nos biens</span>
          <h2 className="mt-2 mb-12 text-3xl font-bold text-stone-800 dark:text-stone-100">S&eacute;lection</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 6).map((listing) => (
              <a
                key={listing.id}
                href={`/annonce/${listing.slug}`}
                className="group overflow-hidden rounded-2xl bg-stone-100 shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-stone-800"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-tl-2xl rounded-tr-2xl">
                  {listing.cover_url ? (
                    <Image src={listing.cover_url} alt={listing.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-200 text-stone-400 dark:bg-stone-700">
                      <MapPin className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-[var(--theme-primary)]">
                      {listing.price.toLocaleString("fr-FR")} {listing.currency}
                    </p>
                    <span className="rounded-full bg-[var(--theme-secondary)]/20 px-3 py-0.5 text-xs font-medium text-[var(--theme-primary)]">
                      {listing.listing_type}
                    </span>
                  </div>
                  <h3 className="mt-1 truncate font-medium text-stone-800 dark:text-stone-100">{listing.title}</h3>
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
          <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Contactez-nous</h2>
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
      <footer className="border-t border-stone-200/60 py-8 dark:border-stone-700/60">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-stone-400">
          &copy; {new Date().getFullYear()} {agency.name}. Tous droits r&eacute;serv&eacute;s.
        </div>
      </footer>
    </div>
  );
}
