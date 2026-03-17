export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md animate-pulse space-y-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto h-8 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="mx-auto h-4 w-48 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" />
        <div className="space-y-4">
          <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" />
          <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" />
          <div className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
