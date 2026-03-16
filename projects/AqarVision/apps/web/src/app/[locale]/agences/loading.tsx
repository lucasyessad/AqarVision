export default function AgencesLoading() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header skeleton */}
      <div className="border-b border-zinc-800 bg-zinc-950 py-16 dark:border-zinc-700">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mb-3 h-4 w-24 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-10 w-72 animate-pulse rounded-lg bg-zinc-800" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded-lg bg-zinc-800" />
        </div>
      </div>

      {/* Card skeletons */}
      <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-5 rounded-xl border border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
