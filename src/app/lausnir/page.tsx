import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSolutions } from "@/lib/content";
import { Button, Container, PageHero, Section } from "@/components/ui";
import { ArrowRight, Icon } from "@/components/icons";
import { IcelandMap } from "@/components/iceland-map";

export const metadata: Metadata = {
  title: "Lausnir",
  description:
    "Sólarorkukerfi, raforkubankar og ótengd kerfi fyrir heimili, sumarhús, húsbíla, báta, fyrirtæki og fjarskipti.",
};

export default async function SolutionsPage() {
  const solutions = await getSolutions();
  return (
    <>
      <PageHero
        eyebrow="Lausnir"
        title="Frá einni sellu upp í heila eyju"
        lead="Við hönnum hvert kerfi út frá aðstæðum, notkun og framtíðarþörfum. Hér eru algengustu tegundir verkefna sem við tökum að okkur."
        image="/gallery/21.webp"
        imagePosition="center 40%"
        aside={<IcelandMap className="w-full" />}
      />
      <Section tone="light">
        <Container>
          <div data-reveal-stagger className="grid gap-6 lg:grid-cols-2">
            {solutions.map((s) => (
              <Link
                key={s.slug}
                href={`/lausnir/${s.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgb(18_136_202/0.35)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-ink-800">
                  {s.image && (
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
                  <div className="absolute bottom-5 left-6 flex items-center gap-3 text-white">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                      <Icon name={s.icon} className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-2xl font-semibold tracking-tight">{s.title}</h2>
                  </div>
                </div>
                <div className="p-7">
                  <p className="font-medium text-ink-900">{s.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-900/65">{s.description}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500">
                    Skoða lausn
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div data-reveal className="relative mt-16 overflow-hidden rounded-3xl bg-ink-900 p-8 text-white sm:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/30 blur-[80px] animate-aurora" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Passar ekkert af þessu?
                </h2>
                <p className="mt-2 text-white/65">
                  Flest verkefni eru blanda – segðu okkur frá þínu og við setjum saman tillögu.
                </p>
              </div>
              <Button href="/hafa-samband">Hafa samband</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
