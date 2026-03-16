export default function EspaceLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Welcome skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-zinc-900/[0.08] dark:bg-zinc-100/[0.08]" />
        <div className="h-7 w-48 rounded bg-zinc-900/[0.08] dark:bg-zinc-100/[0.08]" />
        <div className="h-4 w-64 rounded bg-zinc-900/[0.05] dark:bg-zinc-100/[0.05]" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-zinc-900/[0.05] dark:bg-zinc-100/[0.05]"
          />
        ))}
      </div>

      {/* CTA skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-20 rounded-xl bg-zinc-900/[0.08] dark:bg-zinc-100/[0.08]" />
        <div className="h-20 rounded-xl bg-zinc-900/[0.05] dark:bg-zinc-100/[0.05]" />
      </div>
    </div>
  );
}
