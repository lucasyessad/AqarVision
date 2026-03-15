export default function AgencyProfileLoading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="h-64 animate-pulse bg-zinc-100" />
      <div className="mx-auto max-w-[1320px] px-4 py-10 space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
