export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-56 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-72 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
