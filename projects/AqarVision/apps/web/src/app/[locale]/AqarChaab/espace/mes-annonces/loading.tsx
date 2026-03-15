export default function MesAnnoncesLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded" style={{ background: "var(--ivoire-deep)" }} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl" style={{ background: "var(--ivoire-deep)" }} />
        ))}
      </div>
    </div>
  );
}
