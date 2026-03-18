export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-md bg-stone-200 dark:bg-stone-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-stone-200 dark:bg-stone-800" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-stone-200 dark:bg-stone-800" />
    </div>
  );
}
