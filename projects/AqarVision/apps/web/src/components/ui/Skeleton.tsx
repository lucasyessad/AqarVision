import { cn } from "@/lib/utils";

interface SkeletonBaseProps {
  className?: string;
}

interface TextSkeletonProps extends SkeletonBaseProps {
  variant: "text";
  lines?: number;
}

interface CircleSkeletonProps extends SkeletonBaseProps {
  variant: "circle";
  /** Predefined sizes: sm (32px), md (40px), lg (48px), xl (64px) */
  size?: "sm" | "md" | "lg" | "xl";
}

interface RectSkeletonProps extends SkeletonBaseProps {
  variant: "rect";
}

interface CardSkeletonProps extends SkeletonBaseProps {
  variant: "card";
}

export type SkeletonProps =
  | TextSkeletonProps
  | CircleSkeletonProps
  | RectSkeletonProps
  | CardSkeletonProps;

const shimmerBase =
  "bg-stone-200 dark:bg-stone-700 rounded animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700";

const circleSizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
} as const;

export function Skeleton(props: SkeletonProps) {
  const { variant, className } = props;

  switch (variant) {
    case "text": {
      const { lines = 1 } = props;
      return (
        <div className={cn("space-y-2", className)} aria-hidden="true">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                shimmerBase,
                "h-4 rounded-md",
                i === lines - 1 && lines > 1 && "w-3/4"
              )}
            />
          ))}
        </div>
      );
    }

    case "circle": {
      const { size = "md" } = props;
      return (
        <div
          className={cn(
            shimmerBase,
            "rounded-full shrink-0",
            circleSizes[size],
            className
          )}
          aria-hidden="true"
        />
      );
    }

    case "rect":
      return (
        <div
          className={cn(shimmerBase, "w-full h-24 rounded-md", className)}
          aria-hidden="true"
        />
      );

    case "card":
      return (
        <div
          className={cn(
            "rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-3",
            className
          )}
          aria-hidden="true"
        >
          <div className={cn(shimmerBase, "h-40 rounded-md")} />
          <div className={cn(shimmerBase, "h-4 w-3/4 rounded-md")} />
          <div className={cn(shimmerBase, "h-4 w-1/2 rounded-md")} />
        </div>
      );
  }
}
