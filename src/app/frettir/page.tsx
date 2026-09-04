import type { Metadata } from "next";
import { getAllNews, getNewsCategories } from "@/lib/content";
import { Container, PageHero, Section } from "@/components/ui";
import { NewsCard } from "@/components/news-card";
import { BroadcastMast } from "@/components/broadcast-mast";

export const metadata: Metadata = {
  title: "Fréttir",
  description: "Fréttir og verkefni frá Bláorku – sólarorkukerfi um allt land.",
};

export default async function NewsPage() {
  const [posts, categories] = await Promise.all([getAllNews(), getNewsCategories()]);
  const [first, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Fréttir & verkefni"
        title="Það sem við höfum verið að gera"
        lead="Uppsetningar, ný tæki og tilkynningar – beint úr versluninni og af vettvangi."
        compact
        image="/gallery/36.webp"
        aside={<BroadcastMast className="w-full" />}
      />
      <Section tone="light">
        <Container>
          {/* Flokkasía – aðeins útlit í skeleton */}
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
            <span className="shrink-0 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white">
              Allt
            </span>
            {categories.map((c) => (
              <span
                key={c}
                className="shrink-0 rounded-full border border-mist-300 bg-white px-4 py-2 text-sm font-medium text-ink-900/70"
              >
                {c}
              </span>
            ))}
          </div>

          <div data-reveal-stagger className="mt-10 grid gap-6 lg:grid-cols-3">
            {first && <NewsCard post={first} featured />}
            {rest.map((p) => (
              <NewsCard key={p.slug} post={p} />
            ))}
          </div>

        </Container>
      </Section>
    </>
  );
}
