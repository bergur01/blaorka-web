import Image from "next/image";
import Link from "next/link";
import { getCalculators, getGallery, getLatestNews, getSolutions } from "@/lib/content";
import { site, stats } from "@/content/site";
import {
  Badge,
  Button,
  Container,
  Eyebrow,
  Heading,
  Lead,
  Section,
  TextLink,
} from "@/components/ui";
import { ArrowRight, Icon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { NewsCard } from "@/components/news-card";
import { Gallery } from "@/components/gallery";

export default async function HomePage() {
  const [news, solutions, calculators, gallery] = await Promise.all([
    getLatestNews(3),
    getSolutions(),
    getCalculators(),
    getGallery(),
  ]);
  // Blanda af úti- og innimyndum á forsíðu
  const featured = ["11", "17", "37", "08", "28", "43", "35", "22"]
    .map((id) => gallery.find((g) => g.id === id))
    .filter((g): g is NonNullable<typeof g> => !!g);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative isolate overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/gallery/hero.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/80 to-ink-900" />
          <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
          <div className="absolute -top-32 left-1/3 h-[36rem] w-[36rem] rounded-full bg-brand-500/30 blur-[140px]" />
          <div className="absolute bottom-0 right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-volt-500/20 blur-[120px] animate-float" />
        </div>

        <Container className="pt-40 pb-24 sm:pt-48 sm:pb-32 lg:pt-56 lg:pb-40">
          <div className="max-w-4xl">
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <Badge tone="volt">Sólarorka · Rafgeymar · Ótengd kerfi</Badge>
              <span className="text-sm text-white/55">{site.tagline}</span>
            </div>
            <Heading as="h1" size="xl">
              Þín eigin <span className="text-gradient">orka</span> –
              <br className="hidden sm:block" /> hvar sem er á landinu.
            </Heading>
            <Lead className="mt-8 max-w-2xl text-white/70">
              Bláorka hannar og smíðar sólarorkukerfi með LiFePO4 rafgeymum fyrir
              heimili, sumarhús, húsbíla, báta og fjarskiptastaði. Frá einni sellu
              á þaki upp í þriggja fasa kerfi fyrir heila eyju.
            </Lead>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href="/lausnir" size="lg">
                Skoða lausnir
              </Button>
              <Button href="/reiknivelar" size="lg" variant="outline">
                Reiknivélar
              </Button>
              <Link
                href="/hafa-samband"
                className="text-sm font-medium text-white/70 hover:text-white underline-offset-4 hover:underline"
              >
                Eða fáðu tilboð →
              </Link>
            </div>
          </div>

          {/* Tölur */}
          <dl className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-7 sm:mt-20 lg:justify-between">
            {stats.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <dt className="order-last text-sm text-white/55">{s.label}</dt>
                <dd className="font-display text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ---------------- LAUSNIR ---------------- */}
      <Section tone="light" id="lausnir">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow className="mb-4">Lausnir</Eyebrow>
              <Heading>Kerfi sem passa þínum aðstæðum</Heading>
              <Lead className="mt-4 text-ink-900/65">
                Hvort sem þú ert með sumarhús úti í sveit, húsbíl á hringveginum eða
                fjarskiptastöð uppi á fjalli – við finnum réttu samsetninguna.
              </Lead>
            </div>
            <TextLink href="/lausnir">Allar lausnir</TextLink>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((s, i) => (
              <Link
                key={s.slug}
                href={`/lausnir/${s.slug}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-mist-200 bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_24px_50px_-20px_rgb(18_136_202/0.35)] ${
                  i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 ring-1 ring-brand-100 transition group-hover:bg-brand-500 group-hover:text-white">
                    <Icon name={s.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-900/65">{s.tagline}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500">
                  Nánar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------- HVERNIG VIRKAR ÞAÐ ---------------- */}
      <Section tone="dark" className="overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" />
        <div className="absolute -right-40 top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full bg-brand-500/20 blur-[130px]" />
        <Container className="relative">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <Eyebrow tone="volt" className="mb-4">
                Hvernig virkar það
              </Eyebrow>
              <Heading>Sól, rafgeymar og heili sem stýrir öllu</Heading>
              <Lead className="mt-5 text-white/65">
                Kerfin okkar eru byggð á Victron búnaði og eigin LiFePO4
                raforkubönkum. Allt tengist saman á einni DC-skinnu og stýrieining
                sér um að hlaða, afhlaða og ræsa rafstöð þegar þarf – sjálfkrafa.
              </Lead>
              <ol className="mt-10 space-y-6">
                {[
                  ["Sólarsellur", "Framleiða jafnstraum – MPPT stýring hámarkar nýtinguna, líka í skýjuðu veðri."],
                  ["Raforkubanki", "LiFePO4 rafgeymar geyma orkuna. 10 kWst per eining, stækkanlegt í 40+ kWst."],
                  ["Áriðill", "MultiPlus-II breytir í 230 V riðstraum – einfasa eða þriggja fasa."],
                  ["Stýrieining", "Cerbo GX fylgist með öllu, ræsir rafstöð ef þarf og sendir gögn í app."],
                ].map(([title, text], i) => (
                  <li key={title} className="flex gap-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-volt-500/40 font-display text-sm font-semibold text-volt-300">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-10">
                <Button href="/frodleikur/otengd-kerfi-grunnur" variant="outline">
                  Lesa meira í fróðleik
                </Button>
              </div>
            </div>

            {/* Kerfismynd – skýringarmynd */}
            <div className="relative">
              <div className="glass rounded-[2rem] p-6 sm:p-8">
                <SystemDiagram />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-white/10 bg-ink-900/90 p-4 shadow-glow backdrop-blur sm:block">
                <p className="text-[11px] uppercase tracking-wider text-white/50">Rafgeymir</p>
                <p className="font-display text-2xl font-semibold text-volt-300">
                  94 % <span className="text-sm text-white/60">hlaðinn</span>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------- REIKNIVÉLAR ---------------- */}
      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <Eyebrow className="mb-4">Reiknivélar</Eyebrow>
              <Heading>Reiknaðu þitt eigið kerfi</Heading>
              <Lead className="mt-4 text-ink-900/65">
                Verkfæri sem hjálpa þér að stærðarákvarða sólarsellur, rafgeyma,
                áriðil og kapla – áður en þú talar við okkur, eða á meðan.
              </Lead>
              <div className="mt-8">
                <Button href="/reiknivelar">Allar reiknivélar</Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {calculators.map((c) => (
                <Link
                  key={c.slug}
                  href={`/reiknivelar/${c.slug}`}
                  className="group rounded-3xl border border-mist-200 bg-mist-50 p-6 transition hover:border-brand-300 hover:bg-white hover:shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-500 ring-1 ring-mist-200 group-hover:bg-brand-500 group-hover:text-white">
                      <Icon name={c.icon} className="h-5 w-5" />
                    </span>
                    {c.status === "soon" && <Badge tone="neutral">Væntanlegt</Badge>}
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{c.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------- MYNDIR ---------------- */}
      <Section tone="white">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow className="mb-4">Verkefni í myndum</Eyebrow>
              <Heading>Úr sumarhúsum, af fjöllum og út í eyjar</Heading>
            </div>
            <TextLink href="/verkefni">Allar myndir</TextLink>
          </div>
          <div className="mt-12">
            <Gallery images={featured} columns={4} />
          </div>
        </Container>
      </Section>

      {/* ---------------- FRÉTTIR ---------------- */}
      <Section tone="light">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow className="mb-4">Fréttir & verkefni</Eyebrow>
              <Heading>Nýjast frá Bláorku</Heading>
            </div>
            <TextLink href="/frettir">Allar fréttir</TextLink>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {news.map((p) => (
              <NewsCard key={p.slug} post={p} />
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------- VERSLUNIN ---------------- */}
      <Section tone="white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div>
              <Eyebrow className="mb-4">Komdu við</Eyebrow>
              <Heading>Verslunin í Fosshálsi</Heading>
              <Lead className="mt-4 text-ink-900/65">
                Victron-búnaður, Bláorku rafgeymar, sólarsellur, kaplar og tengi – allt á lager. Kíktu við, við
                setjum saman kerfið með þér yfir kaffibolla.
              </Lead>
              <dl className="mt-6 space-y-1.5 text-sm">
                {site.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-4 border-b border-mist-200 py-1.5">
                    <dt className="text-ink-900/60">{h.days}</dt>
                    <dd className="font-medium">{h.time}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/um-okkur" variant="outline-dark">
                  Um okkur
                </Button>
                <Button href={site.shopUrl} external>
                  Vefverslun
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-3xl bg-ink-800 shadow-card">
                <Image src="/photos/komdu-vi-hja-blaorku-15a2772.webp" alt="Verslun Bláorku að Fosshálsi 27" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink-800 shadow-card">
                <Image src="/photos/victron-raforkubunaur-15a3061.webp" alt="Victron búnaður" fill sizes="(min-width: 1024px) 27vw, 50vw" className="object-cover" />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink-800 shadow-card">
                <Image src="/photos/stasetning-komdu-vi-15a3301.webp" alt="Lagerinn" fill sizes="(min-width: 1024px) 27vw, 50vw" className="object-cover" />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------- CTA ---------------- */}
      <Section tone="dark" className="overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-ink-900 to-ink-950" />
        <div className="absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-volt-500/25 blur-[110px]" />
        <Container className="relative">
          <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <LogoMark className="mb-8 h-12 w-auto" />
              <Heading>Viltu eigið rafmagn, óháð netinu?</Heading>
              <Lead className="mt-4 text-white/70">
                Segðu okkur frá staðnum, notkuninni og hugmyndinni – við setjum
                saman tillögu að kerfi og verði.
              </Lead>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button href="/hafa-samband" size="lg">
                Fá tilboð
              </Button>
              <Button
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                size="lg"
                variant="outline"
                arrow={false}
              >
                Hringja í {site.phoneDisplay}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

/** Einföld skýringarmynd af kerfi – SVG með dýnamískum línum. */
function SystemDiagram() {
  const node = (x: number, y: number, label: string, icon: React.ReactNode, accent = false) => (
    <g transform={`translate(${x},${y})`}>
      <rect
        x="-44"
        y="-30"
        width="88"
        height="60"
        rx="14"
        fill={accent ? "#1288ca" : "rgba(255,255,255,0.05)"}
        stroke={accent ? "#4bd8ec" : "rgba(255,255,255,0.15)"}
      />
      <g transform="translate(-10,-20)" stroke="white" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </g>
      <text y="22" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10" fontFamily="var(--font-inter)">
        {label}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 400 300" className="w-full" role="img" aria-label="Skýringarmynd af sólarorkukerfi">
      <defs>
        <linearGradient id="flow" x1="0" x2="1">
          <stop offset="0" stopColor="#1288ca" stopOpacity="0" />
          <stop offset="0.5" stopColor="#4bd8ec" />
          <stop offset="1" stopColor="#1288ca" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* tengilínur */}
      <g stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none">
        <path d="M70 70 C 130 70, 130 150, 200 150" />
        <path d="M70 230 C 130 230, 130 150, 200 150" />
        <path d="M200 150 C 270 150, 270 70, 330 70" />
        <path d="M200 150 C 270 150, 270 230, 330 230" />
      </g>
      <g stroke="url(#flow)" strokeWidth="2.5" fill="none" strokeDasharray="14 220" className="[animation:dash_3s_linear_infinite]">
        <path d="M70 70 C 130 70, 130 150, 200 150" />
        <path d="M70 230 C 130 230, 130 150, 200 150" />
        <path d="M200 150 C 270 150, 270 70, 330 70" />
        <path d="M200 150 C 270 150, 270 230, 330 230" />
      </g>
      <style>{`@keyframes dash{to{stroke-dashoffset:-234}}`}</style>

      {node(60, 70, "Sólarsellur", <><rect x="2" y="3" width="16" height="10" rx="1.5" /><path d="M7 3v10M13 3v10M2 8h16M10 13v3" /></>)}
      {node(60, 230, "Vindur / rafstöð", <><path d="M3 6h9a2.5 2.5 0 1 0-2.5-2.5" /><path d="M3 11h13a2.5 2.5 0 1 1-2.5 2.5" /><path d="M3 16h6" /></>)}
      {node(200, 150, "Raforkubanki", <><rect x="1" y="5" width="15" height="9" rx="2" /><path d="M18 8.5v2M5 8.5v2M8.5 8.5v2M12 8.5v2" /></>, true)}
      {node(340, 70, "Áriðill 230 V", <><path d="M1 10c2-4 3.5-4 5 0s3.5 4 5 0 3.5-4 5 0" /></>)}
      {node(340, 230, "Stýrieining / app", <><rect x="2" y="3" width="16" height="12" rx="2" /><path d="M7 19h6M10 15v4" /></>)}
    </svg>
  );
}
