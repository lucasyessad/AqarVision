"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSearchBarProps {
  searchLabel: string;
}

export function HeroSearchBar({ searchLabel }: HeroSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 max-w-2xl rounded-xl border border-stone-700/50 dark:border-stone-700 bg-stone-800/60 dark:bg-stone-900/60 p-4 backdrop-blur-md animate-slide-up"
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-lg bg-stone-700/50 dark:bg-stone-800/50 px-4 py-3">
          <Search
            size={18}
            className="shrink-0 text-stone-400 dark:text-stone-500"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchLabel}
            className="w-full bg-transparent text-sm text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none"
          />
        </div>
        <button
          type="submit"
          className={cn(
            "shrink-0 rounded-lg bg-teal-600 dark:bg-teal-600 px-6 py-3",
            "text-sm font-medium text-white",
            "transition-colors duration-fast",
            "hover:bg-teal-700 dark:hover:bg-teal-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
          )}
        >
          {searchLabel}
        </button>
      </div>
    </form>
  );
}
