export default function ListingDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-800 dark:bg-zinc-950">

      {/* Photo hero skeleton 55vh */}
      <div className="h-[55vh] w-full animate-pulse bg-zinc-200 dark:bg-zinc-800" />

      {/* Content grid */}
      <div className="mx-auto max-w-[1320px] px-4 py-10">
        <div className="flex flex-col gap-10 lg:flex-row">

          {/* Main column */}
          <div className="flex-1 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <div className="h-3 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-3 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 w-3/4 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>

            {/* Price */}
            <div className="h-12 w-56 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />

            {/* Facts grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                >
                  <div className="h-5 w-5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-5 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-2 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <div className="h-5 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-3 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
          </div>

          {/* Sidebar 360px */}
          <div className="w-full shrink-0 space-y-4 lg:w-[360px]">
            {/* Agency card */}
            <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            </div>

            {/* Calculator card */}
            <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <div className="h-5 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
