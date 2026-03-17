export default function AgencesLoading() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-800 dark:bg-zinc-950">

      {/* Dark hero header */}
      <div className="border-b border-zinc-800 bg-zinc-950 pb-8 pt-16 dark:border-zinc-700">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          {/* Annuaire badge */}
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-zinc-700" />
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
          </div>
          {/* Title */}
          <div className="h-10 w-72 animate-pulse rounded-lg bg-zinc-800" />
          {/* Filters row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Search input skeleton */}
            <div className="h-10 w-80 animate-pulse rounded-lg bg-zinc-800/60" />
            {/* Wilaya dropdown skeleton */}
            <div className="h-10 w-44 animate-pulse rounded-lg bg-zinc-800/60" />
            {/* Verified toggle skeleton */}
            <div className="h-10 w-28 animate-pulse rounded-lg bg-zinc-800/60" />
          </div>
          {/* Result count */}
          <div className="mt-4 h-4 w-36 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>

      {/* Agency card skeletons */}
      <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Logo */}
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              {/* Text */}
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-3 w-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
              {/* Arrow */}
              <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
