import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export interface EditorialSplitProps {
  eyebrow: string;
  title: string;
  description: string;
  linkHref: string;
  linkText: string;
  imageSrc: string;
  imageAlt: string;
  className?: string;
  reversed?: boolean;
}

export function EditorialSplit({
  eyebrow,
  title,
  description,
  linkHref,
  linkText,
  imageSrc,
  imageAlt,
  className,
  reversed = false,
}: EditorialSplitProps) {
  return (
    <section
      className={cn(
        "grid grid-cols-1 lg:grid-cols-[45fr_55fr] min-h-[480px] lg:min-h-[560px]",
        reversed && "lg:grid-cols-[55fr_45fr]",
        className
      )}
    >
      {/* Text side */}
      <div
        className={cn(
          "flex flex-col justify-center bg-stone-900 dark:bg-stone-950 px-6 py-16 sm:px-10 lg:px-16 lg:py-20",
          reversed && "lg:order-2"
        )}
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-400 dark:text-amber-400">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-stone-300 dark:text-stone-400 max-w-lg">
          {description}
        </p>
        <Link
          href={linkHref}
          className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-amber-400 dark:text-amber-400 transition-colors duration-normal hover:text-amber-300 dark:hover:text-amber-300"
        >
          {linkText}
          <ArrowRight
            size={16}
            className="transition-transform duration-normal group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180"
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* Image side */}
      <div
        className={cn(
          "relative min-h-[320px] lg:min-h-0",
          reversed && "lg:order-1"
        )}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
