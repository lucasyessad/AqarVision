export default function LeadsLoading() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-32 animate-pulse rounded" style={{ background: "var(--onyx-soft)" }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg" style={{ background: "var(--onyx-soft)" }} />
      ))}
    </div>
  );
}
