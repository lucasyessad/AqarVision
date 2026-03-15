import Image from "next/image";
import Link from "next/link";

interface EditorialSplitProps {
  statement: string;
  subtitle?: string;
  imageUrl: string;
  imageAlt?: string;
  cta?: { label: string; href: string };
  reversed?: boolean;
}

export function EditorialSplit({
  statement,
  subtitle,
  imageUrl,
  imageAlt = "",
  cta,
  reversed = false,
}: EditorialSplitProps) {
  return (
    <section className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-2">
      {/* Text side */}
      <div
        className={[
          "flex flex-col justify-center px-8 py-16 lg:px-16",
          reversed ? "lg:order-2" : "lg:order-1",
        ].join(" ")}
      >
        <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl lg:text-5xl">
          {statement}
        </h2>
        {subtitle && (
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        )}
        {cta && (
          <Link
            href={cta.href}
            className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            {cta.label}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        )}
      </div>

      {/* Image side — full-bleed, no padding */}
      <div
        className={[
          "relative min-h-[50vh] lg:min-h-0",
          reversed ? "lg:order-1" : "lg:order-2",
        ].join(" ")}
      >
        <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
      </div>
    </section>
  );
}
