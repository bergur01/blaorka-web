import type { Metadata } from "next";
import Link from "next/link";
import { getCalculators } from "@/lib/content";
import { Container, PageHero, Section } from "@/components/ui";
import { ArrowRight, Icon } from "@/components/icons";
import { SolarDay } from "@/components/solar-day";

export const metadata: Metadata = {
  title: "Reiknivélar",
  description:
    "Reiknivélar fyrir sólarorkukerfi: stærð kerfis, MPPT strengir, orkunotkun, rafgeymabanki og kapalstærð.",
};

export default async function CalculatorsPage() {
  const calculators = await getCalculators();
  return (
    <>
      <PageHero
        eyebrow="Reiknivélar"
        title="Verkfæri fyrir sólarorkukerfi"
        lead="Sláðu inn þínar tölur og fáðu áætlun um stærð sella, rafgeyma, áriðils og kapla. Niðurstöðurnar eru leiðbeinandi – við förum yfir þær með þér."
        image="/photos/victron-raforkubunaur-15a3061.webp"
        aside={<SolarDay className="w-full" />}
      />
      <Section tone="light">
        <Container>
          <div data-reveal-stagger className="grid gap-5 md:grid-cols-2">
            {calculators.map((c, i) => (
              <Link
                key={c.slug}
                href={`/reiknivelar/${c.slug}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-mist-200 bg-white p-8 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-300 ${
                  i === 0 ? "md:col-span-2 md:flex-row md:items-center md:gap-10 bg-gradient-to-br from-white to-brand-50" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-[0_8px_20px_-8px_rgb(18_136_202/0.8)] transition duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon name={c.icon} className="h-6 w-6" />
                    </span>
                  </div>
                  <h2 className={`mt-6 font-display font-semibold tracking-tight ${i === 0 ? "text-2xl sm:text-3xl" : "text-xl"}`}>
                    {c.title}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-900/65 sm:text-base">
                    {c.description}
                  </p>
                </div>
                <div className={`mt-8 ${i === 0 ? "md:mt-0" : ""}`}>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500">
                    Opna reiknivél
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <dl className="mt-4 flex flex-wrap gap-2">
                    {c.outputs.slice(0, 3).map((o) => (
                      <dd
                        key={o.label}
                        className="rounded-full bg-mist-100 px-3 py-1 text-xs text-ink-900/60"
                      >
                        {o.label}
                      </dd>
                    ))}
                  </dl>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
