import type { Metadata } from "next";
import { getGallery, getLatestNews } from "@/lib/content";
import { Button, Container, Eyebrow, Heading, PageHero, Section, TextLink } from "@/components/ui";
import { Gallery } from "@/components/gallery";
import { NewsCard } from "@/components/news-card";
import { PhotoFan } from "@/components/photo-fan";

export const metadata: Metadata = {
  title: "Verkefni í myndum",
  description:
    "Myndir úr uppsetningum Bláorku um allt land – sólarsellur, rafgeymabankar, töflur og fjarskiptastaðir.",
};

export default async function ProjectsPage() {
  const [images, news] = await Promise.all([getGallery(), getLatestNews(3)]);
  return (
    <>
      <PageHero
        eyebrow="Verkefni"
        title="Uppsetningar í myndum"
        lead="Frá sumarhúsum og heimilum upp á fjöll og út í eyjar. Hér eru myndir úr kerfum sem við höfum hannað, smíðað og sett upp."
        compact
        image="/gallery/37.webp"
        aside={<PhotoFan />}
      >
        <Button href="/hafa-samband">Ræða þitt verkefni</Button>
      </PageHero>

      <Section tone="light">
        <Container>
          <Gallery images={images} filters columns={4} />
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <div data-reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow className="mb-4">Fréttir</Eyebrow>
              <Heading size="md">Nánar um einstök verkefni</Heading>
            </div>
            <TextLink href="/frettir">Allar fréttir</TextLink>
          </div>
          <div data-reveal-stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((p) => (
              <NewsCard key={p.slug} post={p} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
