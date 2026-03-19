export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center animate-pulse">
      <div className="w-full max-w-md space-y-4 px-4">
        <div className="h-8 w-48 mx-auto rounded-md bg-stone-200 dark:bg-stone-800" />
        <div className="h-4 w-64 mx-auto rounded bg-stone-200 dark:bg-stone-800" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-md bg-stone-200 dark:bg-stone-800" />
          ))}
        </div>
        <div className="h-10 rounded-md bg-stone-300 dark:bg-stone-700" />
      </div>
    </div>
  );
}

