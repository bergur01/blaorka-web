import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getNewsBySlug, getSolutionBySlug, getSolutions } from "@/lib/content";
import {
  Button,
  Card,
  Container,
  Eyebrow,
  Heading,
  PageHero,
  Section,
} from "@/components/ui";
import { Icon } from "@/components/icons";
import { NewsCard } from "@/components/news-card";
import type { NewsPost } from "@/lib/types";

type Params = { slug: string };

export async function generateStaticParams() {
  return (await getSolutions()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSolutionBySlug(slug);
  if (!s) return {};
  return { title: s.title, description: s.tagline };
}

export default async function SolutionPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  if (!solution) notFound();

  const related = (
    await Promise.all((solution.relatedNews ?? []).map((s) => getNewsBySlug(s)))
  ).filter((p): p is NewsPost => p !== null);

  return (
    <>
      <PageHero eyebrow="Lausnir" title={solution.title} lead={solution.tagline}>
        <div className="flex flex-wrap gap-3">
          <Button href="/hafa-samband">Fá tilboð</Button>
          <Button href="/reiknivelar/solarorkukerfi" variant="outline">
            Reikna stærð kerfis
          </Button>
        </div>
      </PageHero>

      <Section tone="light">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              {solution.image && (
                <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl bg-ink-800 shadow-card">
                  <Image
                    src={solution.image}
                    alt={solution.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <Eyebrow className="mb-4">Um lausnina</Eyebrow>
              <p className="text-lg leading-relaxed text-ink-900/80">{solution.description}</p>

              <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                {solution.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex gap-3 rounded-2xl border border-mist-200 bg-white p-5 text-sm leading-relaxed"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                      <Icon name="bolt" className="h-3.5 w-3.5" />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Card className="p-7">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
                    <Icon name={solution.icon} className="h-5 w-5" />
                  </span>
                  <h2 className="font-display text-lg font-semibold">Dæmigerður búnaður</h2>
                </div>
                <ul className="mt-6 divide-y divide-mist-200">
                  {solution.equipment.map((e) => (
                    <li key={e} className="py-3 text-sm text-ink-900/80">
                      {e}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs text-ink-900/50">
                  Endanleg samsetning fer eftir notkun og aðstæðum.
                </p>
                <div className="mt-6">
                  <Button href="/hafa-samband" className="w-full">
                    Ræða við ráðgjafa
                  </Button>
                </div>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section tone="white">
          <Container>
            <Eyebrow className="mb-4">Verkefni</Eyebrow>
            <Heading size="md">Svona kerfi höfum við sett upp</Heading>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <NewsCard key={p.slug} post={p} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
