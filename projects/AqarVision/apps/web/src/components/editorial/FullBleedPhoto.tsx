import Image from "next/image";
import { cn } from "@/lib/utils";

export interface FullBleedPhotoProps {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function FullBleedPhoto({
  src,
  alt,
  title,
  subtitle,
  className,
}: FullBleedPhotoProps) {
  return (
    <section className={cn("relative min-h-[400px] lg:min-h-[560px]", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      {(title || subtitle) && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-10 sm:px-10 lg:px-16 lg:pb-16">
            {title && (
              <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 max-w-xl text-base text-stone-200 dark:text-stone-300 sm:text-lg">
                {subtitle}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
