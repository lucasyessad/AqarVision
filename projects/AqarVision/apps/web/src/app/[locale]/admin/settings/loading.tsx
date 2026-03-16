export default function SettingsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-56 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-72 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 rounded-xl bg-white/[0.04] dark:bg-zinc-800/50" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/[0.04] dark:bg-zinc-800/50" />
        ))}
      </div>
    </div>
  );
}
