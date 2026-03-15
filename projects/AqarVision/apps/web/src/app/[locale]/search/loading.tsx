export default function SearchLoading() {
  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: "var(--onyx)", opacity: 0.3, animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
