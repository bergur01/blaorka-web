import type { Metadata } from "next";
import Image from "next/image";
import { site, stats, team } from "@/content/site";
import { Button, Container, Eyebrow, Heading, Lead, PageHero, Section } from "@/components/ui";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = {
  title: "Um okkur",
  description:
    "Bláorka ehf (áður NetBerg) – sérfræðingar í sólarorku, rafgeymum og ótengdum raforkukerfum á Íslandi.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Um okkur"
        title="Við lifum á rafmagni"
        lead="Bláorka er íslenskt fyrirtæki sem hannar, smíðar og þjónustar sjálfstæð raforkukerfi. Við trúum því að hver sem er geti átt sína eigin orku – hvar sem er á landinu."
        image="/photos/stasetning-komdu-vi-dji_0123.webp"
        imagePosition="center 62%"
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <Eyebrow className="mb-4">Sagan</Eyebrow>
              <Heading>Frá NetBerg til Bláorku</Heading>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-900/75">
                <p>
                  Fyrirtækið hóf starfsemi undir nafninu NetBerg og byggði upp sérþekkingu
                  á raforkulausnum fyrir fjarskiptastaði, björgunarsveitir og afskekkta
                  staði þar sem áreiðanleiki skiptir öllu máli.
                </p>
                <p>
                  Árið 2024 breyttum við nafninu í Bláorku til að endurspegla betur það sem
                  við gerum í dag: sólarorka, LiFePO4 raforkubankar og heildarkerfi fyrir
                  heimili, sumarhús, húsbíla og fyrirtæki.
                </p>
                <p>
                  Við smíðum okkar eigin rafgeymabanka, setjum saman Plug n&rsquo; Play
                  töflur og notum Victron búnað sem við þekkjum út og inn.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink-800 shadow-card">
                <Image
                  src="/photos/komdu-vi-hja-blaorku-15a2772.webp"
                  alt="Verslun Bláorku að Fosshálsi 27"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 rounded-2xl bg-brand-500 p-5 text-white shadow-glow sm:-right-6">
                <LogoMark className="h-8 w-auto" />
                <p className="mt-3 text-xs uppercase tracking-wider text-white/70">Áður</p>
                <p className="font-display text-lg font-semibold">NetBerg</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="dark">
        <div className="absolute inset-0 bg-grid-dark [mask-image:linear-gradient(to_bottom,transparent,black_40%,black_60%,transparent)]" />
        <Container className="relative">
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border-l border-volt-500/40 pl-5">
                <dd className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{s.value}</dd>
                <dt className="mt-2 text-sm text-white/60">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section tone="light">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow className="mb-4">Starfsfólk</Eyebrow>
            <Heading>Fólkið á bak við kerfin</Heading>
            <Lead className="mt-4 text-ink-900/65">
              Lítið teymi með mikla reynslu – þú talar alltaf beint við þann sem hannar kerfið þitt.
            </Lead>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <li
                key={m.name}
                className="group overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-card"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-ink-800 to-brand-900">
                  <div className="absolute inset-0 bg-grid-dark opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-5xl font-semibold text-white/20">
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>
                  <span className="absolute bottom-3 right-3 rounded-full bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/60 backdrop-blur">
                    Mynd kemur
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold">{m.name}</h3>
                  <p className="mt-1 text-sm text-brand-600">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-3xl bg-ink-800 shadow-card">
            <Image
              src="/photos/stasetning-komdu-vi-dji_0123.webp"
              alt="Fossháls 27 úr lofti"
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/80 to-transparent p-6 text-white sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-volt-300">Fossháls 27</p>
              <p className="mt-1 font-display text-2xl font-semibold">Verslun og lager á einum stað</p>
            </div>
          </div>
          <div className="grid gap-10 rounded-3xl border border-mist-200 bg-mist-50 p-8 sm:p-12 lg:grid-cols-3">
            <div>
              <Eyebrow className="mb-3">Verslun</Eyebrow>
              <p className="font-display text-xl font-semibold">{site.address.street}</p>
              <p className="text-ink-900/70">
                {site.address.postal} {site.address.city}
              </p>
            </div>
            <div>
              <Eyebrow className="mb-3">Opnunartími</Eyebrow>
              <ul className="space-y-1.5 text-sm">
                {site.hours.map((h) => (
                  <li key={h.days} className="flex justify-between gap-4">
                    <span className="text-ink-900/70">{h.days}</span>
                    <span className="font-medium">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start justify-between gap-4">
              <div>
                <Eyebrow className="mb-3">Samband</Eyebrow>
                <p className="font-medium">{site.phone}</p>
                <p className="text-ink-900/70">{site.email}</p>
              </div>
              <Button href="/hafa-samband">Hafa samband</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
