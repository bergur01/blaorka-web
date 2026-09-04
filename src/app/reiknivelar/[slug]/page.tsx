import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCalculatorBySlug, getCalculators } from "@/lib/content";
import { Badge, Container, PageHero, Section } from "@/components/ui";
import { SolarSystemCalculator } from "@/components/calculators/solar-system-calculator";
import { MpptCalculator } from "@/components/calculators/mppt-calculator";
import { EnergyCalculator } from "@/components/calculators/energy-calculator";
import { BatteryCalculator } from "@/components/calculators/battery-calculator";
import { CableCalculator } from "@/components/calculators/cable-calculator";

type Params = { slug: string };

const BADGES: Record<string, string> = {
  solarorkukerfi: "Rauntímagögn frá PVGIS · JRC",
  mppt: "Reglur og stýringagögn frá Victron Energy",
  orkunotkun: "Sömu forsendur og sólarorkureiknivélin",
  rafgeymar: "Miðað við rafgeyma Bláorku",
  kaplar: "Spennufall og straumþol fyrir kopar",
};

const IMAGES: Record<string, string> = {
  solarorkukerfi: "/gallery/11.webp",
  mppt: "/photos/rafmagn-egar-u-arft-a-vi-a-halda-15a2936.webp",
  orkunotkun: "/photos/ertu-klar-i-feralagi-15a2948.webp",
  rafgeymar: "/photos/oflokkaar-15a2905.webp",
  kaplar: "/photos/miki-urval-15a3037.webp",
};

export async function generateStaticParams() {
  return (await getCalculators()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCalculatorBySlug(slug);
  if (!c) return {};
  return { title: c.title, description: c.description };
}

export default async function CalculatorPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const num = (v: string | string[] | undefined) => {
    const n = Number(Array.isArray(v) ? v[0] : v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const calc = await getCalculatorBySlug(slug);
  if (!calc) notFound();

  return (
    <>
      <PageHero
        eyebrow="Reiknivél"
        title={calc.title}
        lead={calc.description}
        compact
        image={IMAGES[calc.slug]}
      >
        <Badge tone="volt">{BADGES[calc.slug] ?? "Leiðbeinandi niðurstöður"}</Badge>
      </PageHero>

      <Section tone="light">
        <Container>
          {calc.slug === "solarorkukerfi" ? (
            <SolarSystemCalculator initialDaily={num(sp.daily)} initialPeak={num(sp.peak)} />
          ) : calc.slug === "mppt" ? (
            <MpptCalculator />
          ) : calc.slug === "orkunotkun" ? (
            <EnergyCalculator />
          ) : calc.slug === "rafgeymar" ? (
            <BatteryCalculator />
          ) : calc.slug === "kaplar" ? (
            <CableCalculator />
          ) : null}
        </Container>
      </Section>
    </>
  );
}
