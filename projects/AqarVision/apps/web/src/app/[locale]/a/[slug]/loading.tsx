export default function AgencyProfileLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--ivoire)" }}>
      <div className="h-64 animate-pulse" style={{ background: "var(--ivoire-deep)" }} />
      <div className="mx-auto max-w-[1320px] px-4 py-10 space-y-6">
        <div className="h-8 w-48 animate-pulse rounded" style={{ background: "var(--ivoire-deep)" }} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl" style={{ background: "var(--ivoire-deep)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
