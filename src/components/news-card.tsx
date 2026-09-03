import Image from "next/image";
import Link from "next/link";
import type { NewsPost } from "@/lib/types";
import { formatDate } from "@/lib/content";
import { Badge } from "./ui";
import { ArrowRight } from "./icons";
import { LogoMark } from "./logo";

export function NewsCard({
  post,
  featured = false,
}: {
  post: NewsPost;
  featured?: boolean;
}) {
  const cover = post.images[0];
  return (
    <Link
      href={`/frettir/${post.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgb(18_136_202/0.35)] ${
        featured ? "lg:col-span-2 lg:flex-row" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-ink-800 ${
          featured ? "aspect-[16/10] lg:aspect-auto lg:w-1/2" : "aspect-[16/10]"
        }`}
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-ink-800 to-brand-900">
            <LogoMark className="h-14 w-auto opacity-60" />
          </div>
        )}
        <div className="absolute left-4 top-4">
          <Badge tone="dark" className="backdrop-blur">
            {post.category}
          </Badge>
        </div>
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? "lg:p-10 lg:justify-center" : ""}`}>
        <time dateTime={post.date} className="text-xs font-medium uppercase tracking-wider text-ink-900/50">
          {formatDate(post.date)}
        </time>
        <h3
          className={`mt-2 font-display font-semibold tracking-tight text-ink-900 group-hover:text-brand-600 ${
            featured ? "text-2xl sm:text-3xl" : "text-xl"
          }`}
        >
          {post.title}
        </h3>
        <p className={`mt-3 text-sm leading-relaxed text-ink-900/65 ${featured ? "sm:text-base line-clamp-4" : "line-clamp-3"}`}>
          {post.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500">
          Lesa meira
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
