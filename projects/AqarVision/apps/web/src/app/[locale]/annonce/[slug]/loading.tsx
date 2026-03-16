export default function ListingDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Photo skeleton */}
      <div className="h-[420px] animate-pulse bg-zinc-100" />
      <div className="mx-auto max-w-[1320px] px-4 py-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="flex-1 space-y-4">
            <div className="h-6 w-24 animate-pulse rounded bg-zinc-100" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-zinc-100" />
            <div className="h-16 w-48 animate-pulse rounded-xl bg-zinc-100" />
            <div className="h-32 animate-pulse rounded-xl bg-zinc-100" />
            <div className="h-48 animate-pulse rounded-xl bg-zinc-100" />
          </div>
          <div className="w-full shrink-0 space-y-4 lg:w-[340px]">
            <div className="h-64 animate-pulse rounded-xl bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
