export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-8 w-64 rounded-md bg-stone-200 dark:bg-stone-800" />
        <div className="h-4 w-96 rounded bg-stone-200 dark:bg-stone-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-stone-200 dark:bg-stone-800" />
          ))}
        </div>
      </div>
    </div>
  );
}

