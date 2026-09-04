import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getAllNews, getNewsBySlug } from "@/lib/content";
import { Badge, Container, Eyebrow, Heading, Section } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { NewsCard } from "@/components/news-card";
import { ReadingProgress } from "@/components/reading-progress";

type Params = { slug: string };

export async function generateStaticParams() {
  return (await getAllNews()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getNewsBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.excerpt,
    openGraph: p.images[0] ? { images: [p.images[0]] } : undefined,
  };
}

/** Línur sem líta út eins og listi (búnaðarlisti o.s.frv.) */
const looksLikeListItem = (s: string) =>
  /^(\d+\s?x|\d+×|[-•–])\s/i.test(s) || /^(cerbo|touch|lynx|victron|kestrel|\d+\s?kw)/i.test(s);

export default async function NewsArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const all = await getAllNews();
  const idx = all.findIndex((p) => p.slug === slug);
  const more = all.filter((p) => p.slug !== slug).slice(0, 3);
  const prev = all[idx + 1];
  const next = all[idx - 1];

  const [cover, ...gallery] = post.images;

  // Hópa samliggjandi „lista-línur" saman í <ul>
  const blocks: Array<{ type: "p"; text: string } | { type: "ul"; items: string[] }> = [];
  // Eftir málsgrein sem endar á „:" teljast stuttar línur til lista þar til löng málsgrein kemur
  let listMode = false;
  for (const line of post.body) {
    const isItem: boolean =
      looksLikeListItem(line) ||
      (line.length < 40 && /\d/.test(line) && !line.endsWith(".")) ||
      (listMode && line.length <= 80 && !line.endsWith("."));
    const last = blocks[blocks.length - 1];
    if (isItem && last?.type === "ul") last.items.push(line);
    else if (isItem) blocks.push({ type: "ul", items: [line] });
    else blocks.push({ type: "p", text: line });
    listMode = isItem ? listMode : line.trim().endsWith(":");
  }

  return (
    <>
      <ReadingProgress />
      <section className="relative overflow-hidden bg-ink-900 pt-32 text-white sm:pt-40">
        <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[50rem] -translate-x-1/2 rounded-full bg-brand-500/25 blur-[120px] animate-aurora-slow" />
        <Container className="relative">
          <Link
            href="/frettir"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Allar fréttir
          </Link>
          <div className="anim-rise mt-8 flex flex-wrap items-center gap-3 [--d:80ms]">
            <Badge tone="volt">{post.category}</Badge>
            <time dateTime={post.date} className="text-sm text-white/55">
              {formatDate(post.date)}
            </time>
          </div>
          <Heading as="h1" size="lg" className="anim-rise mt-5 max-w-4xl [--d:160ms]">
            {post.title}
          </Heading>
          {cover && (
            <div className="anim-scale relative mt-12 aspect-[16/9] overflow-hidden rounded-t-3xl bg-ink-800 shadow-glow sm:aspect-[21/9] [--d:320ms]">
              <Image
                src={cover}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </Container>
      </section>

      <Section tone="white" className="!pt-14">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <article className="max-w-3xl">
              {blocks.map((b, i) =>
                b.type === "p" ? (
                  <p
                    key={i}
                    className={`leading-relaxed text-ink-900/80 ${
                      i === 0 ? "text-xl sm:text-2xl font-medium text-ink-900" : "mt-6 text-lg"
                    }`}
                  >
                    {b.text}
                  </p>
                ) : (
                  <ul
                    key={i}
                    className="mt-6 grid gap-2 rounded-2xl border border-mist-200 bg-mist-50 p-5 sm:grid-cols-2"
                  >
                    {b.items.map((it) => (
                      <li key={it} className="flex gap-2.5 text-sm font-medium text-ink-900/85">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        {it}
                      </li>
                    ))}
                  </ul>
                ),
              )}

              {gallery.length > 0 && (
                <div className="mt-12 grid gap-4 sm:grid-cols-2">
                  {gallery.map((src, i) => (
                    <div
                      key={src}
                      className={`relative overflow-hidden rounded-2xl bg-ink-800 ${
                        i === 0 && gallery.length % 2 === 1 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
                      }`}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {post.links && post.links.length > 0 && (
                <div className="mt-10 rounded-2xl border border-mist-200 bg-mist-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-900/50">Tenglar</p>
                  <ul className="mt-3 space-y-2">
                    {post.links.map((l) => (
                      <li key={l.url}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
                        >
                          {l.label}
                          <ArrowRight className="h-4 w-4 -rotate-45" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <nav className="mt-16 grid gap-4 border-t border-mist-200 pt-8 sm:grid-cols-2" aria-label="Fyrri og næsta frétt">
                {prev ? (
                  <Link href={`/frettir/${prev.slug}`} className="group rounded-2xl p-4 transition hover:bg-mist-50">
                    <span className="text-xs uppercase tracking-wider text-ink-900/50">Eldri</span>
                    <p className="mt-1 font-display font-semibold group-hover:text-brand-600">{prev.title}</p>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link href={`/frettir/${next.slug}`} className="group rounded-2xl p-4 text-right transition hover:bg-mist-50">
                    <span className="text-xs uppercase tracking-wider text-ink-900/50">Nýrri</span>
                    <p className="mt-1 font-display font-semibold group-hover:text-brand-600">{next.title}</p>
                  </Link>
                )}
              </nav>
            </article>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl bg-ink-900 p-7 text-white">
                <Eyebrow tone="volt" className="mb-3">
                  Svipað verkefni?
                </Eyebrow>
                <p className="text-sm leading-relaxed text-white/70">
                  Við hönnum kerfi eftir þínum aðstæðum – hafðu samband og við gerum tillögu.
                </p>
                <Link
                  href="/hafa-samband"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold hover:bg-brand-400"
                >
                  Hafa samband <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="light">
        <Container>
          <Eyebrow className="mb-4">Fleiri fréttir</Eyebrow>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <NewsCard key={p.slug} post={p} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
