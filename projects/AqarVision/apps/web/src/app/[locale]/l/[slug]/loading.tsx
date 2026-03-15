export default function ListingDetailLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--ivoire)" }}>
      {/* Photo skeleton */}
      <div className="h-[420px] animate-pulse" style={{ background: "var(--ivoire-deep)" }} />
      <div className="mx-auto max-w-[1320px] px-4 py-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="flex-1 space-y-4">
            <div className="h-6 w-24 animate-pulse rounded" style={{ background: "var(--ivoire-deep)" }} />
            <div className="h-10 w-3/4 animate-pulse rounded" style={{ background: "var(--ivoire-deep)" }} />
            <div className="h-16 w-48 animate-pulse rounded-xl" style={{ background: "var(--ivoire-deep)" }} />
            <div className="h-32 animate-pulse rounded-xl" style={{ background: "var(--ivoire-deep)" }} />
            <div className="h-48 animate-pulse rounded-xl" style={{ background: "var(--ivoire-deep)" }} />
          </div>
          <div className="w-full shrink-0 space-y-4 lg:w-[340px]">
            <div className="h-64 animate-pulse rounded-xl" style={{ background: "var(--ivoire-deep)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
