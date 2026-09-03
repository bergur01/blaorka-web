import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getKnowledgeArticles, getKnowledgeBySlug } from "@/lib/content";
import { Button, Container, Eyebrow, PageHero, Section } from "@/components/ui";
import { Icon } from "@/components/icons";

type Params = { slug: string };

export async function generateStaticParams() {
  return (await getKnowledgeArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getKnowledgeBySlug(slug);
  if (!a) return {};
  return { title: a.title, description: a.summary };
}

export default async function KnowledgeArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = await getKnowledgeBySlug(slug);
  if (!article) notFound();
  const others = (await getKnowledgeArticles()).filter((a) => a.slug !== slug);

  return (
    <>
      <PageHero eyebrow="Fróðleikur" title={article.title} lead={article.summary} compact>
        <p className="text-sm text-white/50">{article.readingMinutes} mín lestur</p>
      </PageHero>

      <Section tone="white">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <article className="max-w-3xl">
              {article.sections.map((sec, i) => (
                <section key={sec.heading} className={i > 0 ? "mt-14" : ""}>
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
                    {sec.heading}
                  </h2>
                  {sec.paragraphs.map((p, j) => (
                    <p key={j} className="mt-5 text-lg leading-relaxed text-ink-900/80">
                      {p}
                    </p>
                  ))}
                  {sec.bullets && (
                    <ul className="mt-6 space-y-3">
                      {sec.bullets.map((b) => (
                        <li key={b} className="flex gap-3 text-base leading-relaxed text-ink-900/80">
                          <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <div className="mt-16 rounded-3xl bg-mist-100 p-8">
                <h3 className="font-display text-xl font-semibold">Viltu ræða þitt kerfi?</h3>
                <p className="mt-2 text-sm text-ink-900/65">
                  Við hjálpum þér að velja réttan búnað – engin skuldbinding.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button href="/hafa-samband">Hafa samband</Button>
                  <Button href="/reiknivelar" variant="outline-dark">
                    Reiknivélar
                  </Button>
                </div>
              </div>
            </article>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow className="mb-4">Fleiri greinar</Eyebrow>
              <ul className="space-y-2">
                {others.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/frodleikur/${a.slug}`}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-900/75 transition hover:bg-mist-100 hover:text-brand-600"
                    >
                      <Icon name={a.icon} className="h-4 w-4 shrink-0 text-brand-500" />
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
