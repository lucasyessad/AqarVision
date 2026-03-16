export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-72 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800/50" />
        ))}
      </div>
    </div>
  );
}
