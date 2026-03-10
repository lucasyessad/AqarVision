export default function BienLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[16/9] animate-pulse rounded-xl bg-gray-200" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
          </div>
          <div className="lg:col-span-1">
            <div className="h-80 animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
