export default function ListingsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded" style={{ background: "var(--onyx-soft)" }} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl" style={{ background: "var(--onyx-soft)" }} />
        ))}
      </div>
    </div>
  );
}
