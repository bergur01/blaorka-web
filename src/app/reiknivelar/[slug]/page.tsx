import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCalculatorBySlug, getCalculators } from "@/lib/content";
import { Badge, Container, Eyebrow, PageHero, Section, WipNote } from "@/components/ui";
import { Icon } from "@/components/icons";

type Params = { slug: string };

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

export default async function CalculatorPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const calc = await getCalculatorBySlug(slug);
  if (!calc) notFound();
  const others = (await getCalculators()).filter((c) => c.slug !== slug);

  return (
    <>
      <PageHero eyebrow="Reiknivél" title={calc.title} lead={calc.description} compact>
        {calc.status === "soon" && <Badge tone="volt">Væntanlegt – beinagrind</Badge>}
      </PageHero>

      <Section tone="light">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            {/* Inntak */}
            <form
              className="rounded-3xl border border-mist-200 bg-white p-7 shadow-card sm:p-9"
              onSubmit={undefined}
              aria-describedby="calc-wip"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
                  <Icon name={calc.icon} className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-semibold">Forsendur</h2>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {calc.inputs.map((f) => (
                  <label key={f.key} className="block">
                    <span className="text-sm font-medium text-ink-900">{f.label}</span>
                    <div className="relative mt-1.5">
                      {f.type === "select" ? (
                        <select
                          disabled
                          className="h-12 w-full appearance-none rounded-xl border border-mist-300 bg-mist-50 px-4 text-sm text-ink-900 disabled:cursor-not-allowed"
                        >
                          {f.options?.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          inputMode="decimal"
                          disabled
                          placeholder={f.placeholder}
                          className="h-12 w-full rounded-xl border border-mist-300 bg-mist-50 px-4 text-sm text-ink-900 placeholder:text-ink-900/35 disabled:cursor-not-allowed"
                        />
                      )}
                      {f.unit && (
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium text-ink-900/45">
                          {f.unit}
                        </span>
                      )}
                    </div>
                    {f.hint && <span className="mt-1.5 block text-xs text-ink-900/50">{f.hint}</span>}
                  </label>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  disabled
                  className="inline-flex h-12 items-center justify-center rounded-full bg-brand-500 px-6 text-sm font-semibold text-white opacity-50"
                >
                  Reikna
                </button>
                <button
                  type="button"
                  disabled
                  className="text-sm font-medium text-ink-900/50"
                >
                  Hreinsa
                </button>
              </div>
              <div id="calc-wip" className="mt-6">
                <WipNote>Reiknivélin er ekki virk ennþá – hér er aðeins útlitið.</WipNote>
              </div>
            </form>

            {/* Úttak */}
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-7 text-white sm:p-9">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-brand-500/30 blur-[80px]" />
                <div className="relative">
                  <Eyebrow tone="volt" className="mb-5">
                    Niðurstaða
                  </Eyebrow>
                  <dl className="divide-y divide-white/10">
                    {calc.outputs.map((o) => (
                      <div key={o.label} className="flex items-baseline justify-between gap-4 py-3.5">
                        <dt className="text-sm text-white/65">{o.label}</dt>
                        <dd className="font-display text-xl font-semibold tabular-nums">
                          <span className="text-white/25">—</span>
                          {o.unit && <span className="ml-1.5 text-xs font-normal text-white/45">{o.unit}</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-6 text-xs text-white/45">
                    Niðurstöður eru leiðbeinandi. Endanleg hönnun tekur mið af aðstæðum á staðnum.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-mist-200 bg-white p-7">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-900/50">
                  Aðrar reiknivélar
                </h3>
                <ul className="mt-4 space-y-1">
                  {others.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/reiknivelar/${c.slug}`}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-900/75 transition hover:bg-mist-100 hover:text-brand-600"
                      >
                        <Icon name={c.icon} className="h-4 w-4 shrink-0 text-brand-500" />
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
