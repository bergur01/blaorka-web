"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { GalleryImage } from "@/lib/types";
import { galleryCategories } from "@/content/gallery";

type Category = GalleryImage["category"] | "all";

/**
 * Myndasafn – masonry-rist með síum og lightbox.
 * `limit` sýnir aðeins fyrstu N myndir (t.d. á forsíðu), `filters` sýnir flokkasíu.
 */
export function Gallery({
  images,
  limit,
  filters = false,
  columns = 3,
}: {
  images: GalleryImage[];
  limit?: number;
  filters?: boolean;
  columns?: 3 | 4;
}) {
  const [category, setCategory] = useState<Category>("all");
  const [open, setOpen] = useState<number | null>(null);

  const visible = (category === "all" ? images : images.filter((i) => i.category === category)).slice(
    0,
    limit ?? images.length,
  );

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((o) => (o === null ? null : (o + d + visible.length) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  return (
    <div>
      {filters && (
        <div className="no-scrollbar -mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {galleryCategories.map((c) => {
            const count = c.id === "all" ? images.length : images.filter((i) => i.category === c.id).length;
            if (count === 0) return null;
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                aria-pressed={active}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? "bg-ink-900 text-white" : "border border-mist-300 bg-white text-ink-900/70 hover:border-brand-400"
                }`}
              >
                {c.label} <span className={`ml-1 text-xs ${active ? "text-white/60" : "text-ink-900/40"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className={`columns-2 gap-4 ${columns === 4 ? "lg:columns-4" : "lg:columns-3"} [&>*]:mb-4`}>
        {visible.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl bg-ink-800 text-left shadow-card focus-visible:ring-4 focus-visible:ring-volt-400/50"
            aria-label={`Opna mynd: ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(min-width: 1024px) 33vw, 50vw"
              className="h-auto w-full transition duration-700 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            <p className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 text-sm font-medium text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
              {img.alt}
            </p>
          </button>
        ))}
      </div>

      {open !== null && visible[open] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={visible[open].alt}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Loka"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {visible.length > 1 && (
            <>
              <NavButton dir={-1} onClick={(e) => { e.stopPropagation(); step(-1); }} />
              <NavButton dir={1} onClick={(e) => { e.stopPropagation(); step(1); }} />
            </>
          )}
          <figure className="flex max-h-full max-w-6xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <Image
              src={visible[open].src}
              alt={visible[open].alt}
              width={visible[open].width}
              height={visible[open].height}
              sizes="100vw"
              priority
              className="max-h-[82vh] w-auto rounded-2xl object-contain shadow-glow"
            />
            <figcaption className="mt-4 flex items-center gap-3 text-sm text-white/70">
              <span>{visible[open].alt}</span>
              <span className="text-white/35">
                {open + 1} / {visible.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}

function NavButton({ dir, onClick }: { dir: -1 | 1; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex ${
        dir === -1 ? "left-4" : "right-4"
      }`}
      aria-label={dir === -1 ? "Fyrri mynd" : "Næsta mynd"}
    >
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${dir === -1 ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}
