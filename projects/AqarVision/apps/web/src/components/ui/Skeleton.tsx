interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: string;
  className?: string;
}

function Skeleton({
  width = "100%",
  height = "1rem",
  rounded = "rounded-md",
  className = "",
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      className={`bg-zinc-200 dark:bg-zinc-700 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 ${rounded} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export { Skeleton };
export type { SkeletonProps };
