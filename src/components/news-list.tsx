"use client";

import { useMemo, useState } from "react";
import type { NewsPost } from "@/lib/types";
import { NewsCard } from "./news-card";

/** Fréttalisti með virkri flokkasíu. */
export function NewsList({ posts, categories }: { posts: NewsPost[]; categories: string[] }) {
  const [active, setActive] = useState<string | null>(null);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of posts) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [posts]);

  const filtered = active ? posts.filter((p) => p.category === active) : posts;
  const [first, ...rest] = filtered;

  const chip = (label: string, count: number, value: string | null) => {
    const on = active === value;
    return (
      <button
        key={label}
        type="button"
        onClick={() => setActive(value)}
        aria-pressed={on}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
          on
            ? "bg-ink-900 text-white"
            : "border border-mist-300 bg-white text-ink-900/70 hover:border-brand-300 hover:text-brand-600"
        }`}
      >
        {label}
        <span className={`ml-2 text-xs ${on ? "text-white/60" : "text-ink-900/40"}`}>{count}</span>
      </button>
    );
  };

  return (
    <>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        {chip("Allt", posts.length, null)}
        {categories.map((c) => chip(c, counts.get(c) ?? 0, c))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-ink-900/60">Engar fréttir í þessum flokki ennþá.</p>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {first && <NewsCard post={first} featured />}
          {rest.map((p) => (
            <NewsCard key={p.slug} post={p} />
          ))}
        </div>
      )}
    </>
  );
}
