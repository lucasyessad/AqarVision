export default function SearchLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-800 dark:bg-zinc-950">

      {/* Sticky filter bar skeleton */}
      <div className="z-30 shrink-0 border-b border-zinc-200 dark:border-zinc-700 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5">
        {/* Row 1: search input + toggle + count */}
        <div className="mb-2.5 flex items-center gap-3">
          <div className="h-9 max-w-sm flex-1 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex overflow-hidden rounded-lg">
            <div className="h-9 w-[100px] animate-pulse rounded-s-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-9 w-[80px] animate-pulse rounded-e-lg bg-zinc-100 dark:bg-zinc-800 dark:bg-zinc-700" />
          </div>
          <div className="hidden sm:block h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="ms-auto h-9 w-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Row 2: filter pills */}
        <div className="flex items-center gap-2 overflow-hidden">
          {[90, 100, 70, 60, 110].map((w, i) => (
            <div
              key={i}
              className="h-8 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"
              style={{ width: `${w}px` }}
            />
          ))}
          <div className="h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700" />
          {[65, 65, 60, 65, 60].map((w, i) => (
            <div
              key={`a${i}`}
              className="h-7 shrink-0 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>
      </div>

      {/* Split content: listings + map */}
      <div className="flex flex-1 overflow-hidden">

        {/* Listings panel 70% */}
        <div className="w-[70%] shrink-0 overflow-hidden border-e border-zinc-200 dark:border-zinc-700 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:bg-zinc-950">
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                {/* Image 16:10 */}
                <div className="aspect-[16/10] w-full animate-pulse bg-zinc-200 dark:bg-zinc-800" />
                {/* Text lines */}
                <div className="space-y-2 p-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-5 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map panel 30% */}
        <div className="hidden flex-1 lg:block">
          <div className="h-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-none" />
        </div>
      </div>
    </div>
  );
}
