import type { Metadata } from "next";
import Link from "next/link";
import { getKnowledgeArticles } from "@/lib/content";
import { Container, PageHero, Section, WipNote } from "@/components/ui";
import { ArrowRight, Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Fróðleikur",
  description:
    "Fróðleikur um sólarsellur, sólarsellustýringar, rafgeyma, áriðla og ótengd raforkukerfi.",
};

export default async function KnowledgePage() {
  const articles = await getKnowledgeArticles();
  return (
    <>
      <PageHero
        eyebrow="Fróðleikur"
        title="Skildu kerfið áður en þú kaupir það"
        lead="Stuttar og skýrar greinar um tæknina á bak við sólarorku og orkugeymslu – skrifaðar fyrir íslenskar aðstæður."
      />
      <Section tone="light">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/frodleikur/${a.slug}`}
                className="group flex flex-col justify-between rounded-3xl border border-mist-200 bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 ring-1 ring-brand-100 group-hover:bg-brand-500 group-hover:text-white">
                      <Icon name={a.icon} className="h-6 w-6" />
                    </span>
                    <span className="text-xs text-ink-900/50">{a.readingMinutes} mín lestur</span>
                  </div>
                  <h2 className="mt-6 font-display text-xl font-semibold tracking-tight">{a.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-900/65">{a.summary}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500">
                  Lesa grein
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <WipNote>
              Greinar verða geymdar í gagnagrunni með ríku efni (myndir, töflur, myndbönd) –
              hér er aðeins beinagrind með texta af núverandi vef.
            </WipNote>
          </div>
        </Container>
      </Section>
    </>
  );
}
