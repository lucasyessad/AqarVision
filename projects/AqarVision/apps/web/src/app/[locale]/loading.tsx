export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-900 dark:bg-zinc-950">
      {/* Hero skeleton */}
      <section className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-200 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-6 px-4">
          {/* Eyebrow */}
          <div className="h-3 w-48 animate-pulse rounded bg-zinc-300 dark:bg-zinc-800" />
          {/* Headline */}
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-80 animate-pulse rounded bg-zinc-300 dark:bg-zinc-800 sm:h-16 sm:w-[480px]" />
            <div className="h-12 w-60 animate-pulse rounded bg-zinc-300 dark:bg-zinc-800 sm:h-16 sm:w-[360px]" />
            <div className="h-12 w-52 animate-pulse rounded bg-zinc-300 dark:bg-zinc-800 sm:h-16 sm:w-[300px]" />
          </div>
          {/* Pills */}
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-800" />
            <div className="h-9 w-20 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-800" />
            <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-800" />
          </div>
          {/* Search bar */}
          <div className="h-14 w-full max-w-xl animate-pulse rounded-xl bg-zinc-300 dark:bg-zinc-800" />
        </div>
      </section>

      {/* Split editorial skeleton */}
      <section className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-4 bg-zinc-50 dark:bg-zinc-800 px-8 py-16 dark:bg-zinc-900 lg:px-16">
          <div className="h-3 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-72 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-16 w-96 max-w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-5 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="min-h-[400px] animate-pulse bg-zinc-200 dark:bg-zinc-800" />
      </section>

      {/* Wilayas scroll skeleton */}
      <section className="border-t border-zinc-100 bg-zinc-50 dark:bg-zinc-800 py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mb-2 h-7 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mb-7 h-4 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="flex gap-3 overflow-hidden px-4 sm:px-6 lg:px-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[200px] shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="h-[130px] animate-pulse bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured grid skeleton */}
      <section className="border-t border-zinc-100 bg-white dark:bg-zinc-900 py-20 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="mb-1 h-3 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-9 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="aspect-[16/10] animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="min-h-[280px] animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </section>

      {/* Trending skeleton */}
      <section className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-20 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="mb-2 h-3 w-14 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-9 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="mb-3 aspect-[4/3] animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-1 h-3 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip skeleton */}
      <section className="bg-zinc-950 py-20 dark:bg-zinc-900">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 flex flex-col items-center gap-2">
            <div className="h-8 w-72 animate-pulse rounded bg-zinc-800" />
            <div className="h-8 w-64 animate-pulse rounded bg-zinc-800" />
          </div>
          <div className="mx-auto grid max-w-[800px] grid-cols-2 gap-8 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-9 w-20 animate-pulse rounded bg-zinc-800" />
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Pro skeleton */}
      <section className="flex flex-col items-center bg-zinc-50 dark:bg-zinc-800 py-20 dark:bg-zinc-900">
        <div className="h-3 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-4 h-9 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2 h-9 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-4 h-5 w-80 max-w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-8 h-12 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </section>
    </main>
  );
}
