import Image from "next/image";
import { Phone, Mail, MessageCircle, MapPin, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorefrontProps } from "./types";

export default function Editorial({ agency, listings, stats }: StorefrontProps) {
  const content = agency.storefront_content;
  const eyebrow = content?.theme_extras?.eyebrow;

  return (
    <div
      className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100"
      style={{
        "--theme-primary": agency.branding?.primary_color ?? "#0D0D0D",
        "--theme-accent": agency.branding?.accent_color ?? "#D4343B",
        "--theme-secondary": agency.branding?.secondary_color ?? "#F0F0F0",
      } as React.CSSProperties}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {agency.logo_url && (
              <div className="relative h-10 w-10 overflow-hidden">
                <Image src={agency.logo_url} alt={agency.name} fill sizes="40px" className="object-cover" />
              </div>
            )}
            <span className="text-lg font-bold">{agency.name}</span>
          </div>
          <div className="hidden items-center gap-8 text-xs uppercase tracking-[0.15em] md:flex">
            <a href="#about" className="border-b border-transparent transition-all duration-200 hover:border-current">A propos</a>
            <a href="#listings" className="border-b border-transparent transition-all duration-200 hover:border-current">Biens</a>
            <a href="#contact" className="border-b border-transparent transition-all duration-200 hover:border-current">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero — editorial split */}
      <section className="py-16 sm:py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col justify-center">
            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{eyebrow}</p>
            )}
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {agency.name}
            </h1>
            {content?.tagline && (
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-500 dark:text-stone-400">
                {content.tagline}
              </p>
            )}
            <a
              href="#listings"
              className="mt-8 inline-flex w-fit items-center gap-2 border-b-2 border-stone-900 pb-1 text-sm font-medium uppercase tracking-wider transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] dark:border-stone-100 dark:hover:border-[var(--theme-accent)]"
            >
              D&eacute;couvrir nos biens <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden">
            {content?.hero_image_url ? (
              <Image src={content.hero_image_url} alt={agency.name} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
            ) : (
              <div className="h-full w-full bg-stone-200 dark:bg-stone-800" />
            )}
          </div>
        </div>
      </section>

      {/* Divider with label */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6">
        <div className="h-px flex-1 bg-stone-300 dark:bg-stone-700" />
        <span className="text-xs uppercase tracking-[0.2em] text-stone-400">A propos</span>
        <div className="h-px flex-1 bg-stone-300 dark:bg-stone-700" />
      </div>

      {/* About — editorial split dark/light */}
      <section id="about" className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-0 overflow-hidden lg:grid-cols-2">
          <div className="bg-stone-900 p-8 text-white sm:p-12 dark:bg-stone-800">
            <h2 className="text-3xl font-bold">Notre histoire</h2>
            {content?.about_text && (
              <p className="mt-4 leading-relaxed text-stone-300">{content.about_text}</p>
            )}
            {content?.services && content.services.length > 0 && (
              <div className="mt-8 space-y-4">
                {content.services.map((service) => (
                  <div key={service.title}>
                    <h3 className="font-semibold">{service.title}</h3>
                    <p className="mt-1 text-sm text-stone-400">{service.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {content?.extra_photos?.[0] ? (
            <div className="relative aspect-auto min-h-[300px] lg:min-h-0">
              <Image src={content.extra_photos[0]} alt="About" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
          ) : (
            <div className="bg-stone-100 dark:bg-stone-900" />
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-12 px-6">
          <div className="text-center">
            <p className="text-4xl font-bold">{stats.total_listings}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-stone-400">Biens</p>
          </div>
          <div className="h-8 w-px bg-stone-300 dark:bg-stone-700" />
          <div className="text-center">
            <p className="text-4xl font-bold">{stats.total_views}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-stone-400">Vues</p>
          </div>
          {content?.custom_stats?.years_experience != null && (
            <>
              <div className="h-8 w-px bg-stone-300 dark:bg-stone-700" />
              <div className="text-center">
                <p className="text-4xl font-bold">{content.custom_stats.years_experience}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-stone-400">Ans</p>
              </div>
            </>
          )}
          {content?.custom_stats?.satisfied_clients != null && (
            <>
              <div className="h-8 w-px bg-stone-300 dark:bg-stone-700" />
              <div className="text-center">
                <p className="text-4xl font-bold">{content.custom_stats.satisfied_clients}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-stone-400">Clients</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Divider with label */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6">
        <div className="h-px flex-1 bg-stone-300 dark:bg-stone-700" />
        <span className="text-xs uppercase tracking-[0.2em] text-stone-400">S&eacute;lection</span>
        <div className="h-px flex-1 bg-stone-300 dark:bg-stone-700" />
      </div>

      {/* Listings — magazine asymmetric */}
      <section id="listings" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-3xl font-bold">Nos biens</h2>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            {listings[0] && (
              <a
                href={`/annonce/${listings[0].slug}`}
                className="group relative row-span-2 overflow-hidden"
              >
                <div className="relative aspect-[3/4]">
                  {listings[0].cover_url ? (
                    <Image src={listings[0].cover_url} alt={listings[0].title} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-200 dark:bg-stone-800">
                      <MapPin className="h-12 w-12 text-stone-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
                  <div className="absolute bottom-6 start-6 end-6 text-white">
                    <span className="text-sm opacity-50">01</span>
                    <h3 className="mt-1 text-2xl font-bold">{listings[0].title}</h3>
                    <p className="mt-2 text-lg font-semibold">{listings[0].price.toLocaleString("fr-FR")} {listings[0].currency}</p>
                  </div>
                </div>
              </a>
            )}
            <div className="grid gap-4">
              {listings.slice(1, 3).map((listing, i) => (
                <a
                  key={listing.id}
                  href={`/annonce/${listing.slug}`}
                  className="group relative overflow-hidden"
                >
                  <div className="relative aspect-[16/9]">
                    {listing.cover_url ? (
                      <Image src={listing.cover_url} alt={listing.title} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-stone-200 dark:bg-stone-800">
                        <MapPin className="h-8 w-8 text-stone-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
                    <div className="absolute bottom-4 start-4 end-4 text-white">
                      <span className="text-xs opacity-50">{String(i + 2).padStart(2, "0")}</span>
                      <h3 className="mt-0.5 truncate font-bold">{listing.title}</h3>
                      <p className="mt-1 font-semibold">{listing.price.toLocaleString("fr-FR")} {listing.currency}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
          {listings.length > 3 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {listings.slice(3, 6).map((listing, i) => (
                <a
                  key={listing.id}
                  href={`/annonce/${listing.slug}`}
                  className="group relative overflow-hidden"
                >
                  <div className="relative aspect-[4/3]">
                    {listing.cover_url ? (
                      <Image src={listing.cover_url} alt={listing.title} fill sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-stone-200 dark:bg-stone-800">
                        <MapPin className="h-8 w-8 text-stone-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
                    <div className="absolute bottom-4 start-4 text-white">
                      <span className="text-xs opacity-50">{String(i + 4).padStart(2, "0")}</span>
                      <h3 className="mt-0.5 truncate font-bold">{listing.title}</h3>
                      <p className="mt-1 font-semibold">{listing.price.toLocaleString("fr-FR")} {listing.currency}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold">Contactez-nous</h2>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-4">
            <a href={`tel:${agency.phone}`} className="inline-flex items-center gap-2 bg-stone-900 px-8 py-3 text-sm font-medium uppercase tracking-wider text-white transition-colors duration-200 hover:bg-[var(--theme-accent)] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-[var(--theme-accent)] dark:hover:text-white">
              <Phone className="h-4 w-4" /> Appeler
            </a>
            {agency.whatsapp_phone && (
              <a href={`https://wa.me/${agency.whatsapp_phone.replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-2 border border-stone-900 px-8 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 hover:bg-stone-900 hover:text-white dark:border-stone-100 dark:hover:bg-stone-100 dark:hover:text-stone-900">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            <a href={`mailto:${agency.email}`} className="inline-flex items-center gap-2 border border-stone-900 px-8 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 hover:bg-stone-900 hover:text-white dark:border-stone-100 dark:hover:bg-stone-100 dark:hover:text-stone-900">
              <Mail className="h-4 w-4" /> Email
            </a>
          </div>
          {agency.opening_hours && (
            <p className="mt-6 flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-stone-400">
              <Clock className="h-4 w-4" /> {agency.opening_hours}
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-300 py-8 dark:border-stone-700">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs uppercase tracking-wider text-stone-400">
          &copy; {new Date().getFullYear()} {agency.name}. Tous droits r&eacute;serv&eacute;s.
        </div>
      </footer>
    </div>
  );
}
