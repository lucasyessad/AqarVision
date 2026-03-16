export default function PaymentsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-64 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-white/[0.04] dark:bg-zinc-800/50 border border-white/[0.08] dark:border-zinc-700" />
        ))}
      </div>
    </div>
  );
}
