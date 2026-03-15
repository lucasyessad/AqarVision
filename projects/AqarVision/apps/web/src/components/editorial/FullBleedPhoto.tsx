import Image from "next/image";
import Link from "next/link";

interface FullBleedPhotoProps {
  src: string;
  alt?: string;
  statement?: string;
  cta?: { label: string; href: string };
  height?: string;
}

export function FullBleedPhoto({
  src,
  alt = "",
  statement,
  cta,
  height = "60vh",
}: FullBleedPhotoProps) {
  return (
    <section className="relative overflow-hidden" style={{ height }}>
      <Image src={src} alt={alt} fill className="object-cover" />

      {statement && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 start-0 p-8 lg:p-16">
            <h2 className="max-w-2xl text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              {statement}
            </h2>
            {cta && (
              <Link
                href={cta.href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300"
              >
                {cta.label}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            )}
          </div>
        </>
      )}
    </section>
  );
}
