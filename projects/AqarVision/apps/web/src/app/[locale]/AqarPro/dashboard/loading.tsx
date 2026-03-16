export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6 p-8">
      <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}
