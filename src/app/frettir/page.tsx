import type { Metadata } from "next";
import { getAllNews, getNewsCategories } from "@/lib/content";
import { Container, PageHero, Section } from "@/components/ui";
import { NewsList } from "@/components/news-list";
import { BroadcastMast } from "@/components/broadcast-mast";

export const metadata: Metadata = {
  title: "Fréttir",
  description: "Fréttir og verkefni frá Bláorku – sólarorkukerfi um allt land.",
};

export default async function NewsPage() {
  const [posts, categories] = await Promise.all([getAllNews(), getNewsCategories()]);

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
          <NewsList posts={posts} categories={categories} />
        </Container>
      </Section>
    </>
  );
}
