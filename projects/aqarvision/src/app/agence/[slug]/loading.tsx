export default function AgencyLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="h-screen w-full bg-gray-200" />

      {/* Properties skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 flex flex-col items-center gap-4">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-10 w-64 rounded bg-gray-200" />
          <div className="h-0.5 w-20 rounded bg-gray-200" />
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
