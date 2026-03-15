export default function TeamLoading() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-40 animate-pulse rounded" style={{ background: "var(--onyx-soft)" }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg" style={{ background: "var(--onyx-soft)" }} />
      ))}
    </div>
  );
}
