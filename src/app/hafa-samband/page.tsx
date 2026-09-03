import type { Metadata } from "next";
import { site } from "@/content/site";
import { Container, Eyebrow, PageHero, Section, WipNote } from "@/components/ui";
import { ExternalArrow } from "@/components/icons";

export const metadata: Metadata = {
  title: "Hafa samband",
  description: "Hafðu samband við Bláorku – fáðu tilboð í sólarorkukerfi eða ráðgjöf.",
};

const inputCls =
  "h-12 w-full rounded-xl border border-mist-300 bg-mist-50 px-4 text-sm text-ink-900 placeholder:text-ink-900/35 disabled:cursor-not-allowed";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Hafa samband"
        title="Segðu okkur frá verkefninu"
        lead="Sendu okkur línu, hringdu eða kíktu við í Fosshálsi. Við svörum yfirleitt samdægurs á virkum dögum."
        compact
      />
      <Section tone="light">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <form className="rounded-3xl border border-mist-200 bg-white p-7 shadow-card sm:p-9">
              <h2 className="font-display text-xl font-semibold">Fá tilboð eða ráðgjöf</h2>
              <p className="mt-1 text-sm text-ink-900/60">
                Því meira sem þú segir okkur, því nákvæmari tillögu getum við sent.
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Nafn</span>
                  <input disabled className={`mt-1.5 ${inputCls}`} placeholder="Fullt nafn" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Sími</span>
                  <input disabled className={`mt-1.5 ${inputCls}`} placeholder="xxx xxxx" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium">Netfang</span>
                  <input disabled className={`mt-1.5 ${inputCls}`} placeholder="nafn@dæmi.is" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Tegund verkefnis</span>
                  <select disabled className={`mt-1.5 appearance-none ${inputCls}`}>
                    <option>Heimili / sumarhús</option>
                    <option>Ótengt kerfi</option>
                    <option>Húsbíll / bátur</option>
                    <option>Fyrirtæki / fjarskipti</option>
                    <option>Annað</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Staðsetning</span>
                  <input disabled className={`mt-1.5 ${inputCls}`} placeholder="t.d. Borgarfjörður" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium">Lýsing</span>
                  <textarea
                    disabled
                    rows={5}
                    className="mt-1.5 w-full rounded-xl border border-mist-300 bg-mist-50 px-4 py-3 text-sm placeholder:text-ink-900/35 disabled:cursor-not-allowed"
                    placeholder="Hvaða tæki þarf að keyra, er rafstöð til staðar, hvað er stórt þak…"
                  />
                </label>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  disabled
                  className="inline-flex h-12 items-center rounded-full bg-brand-500 px-6 text-sm font-semibold text-white opacity-50"
                >
                  Senda fyrirspurn
                </button>
                <span className="text-xs text-ink-900/50">Við deilum aldrei upplýsingunum þínum.</span>
              </div>
              <div className="mt-6">
                <WipNote>Formið verður tengt við tölvupóst/CRM í næsta skrefi.</WipNote>
              </div>
            </form>

            <div className="space-y-6">
              <div className="rounded-3xl bg-ink-900 p-7 text-white sm:p-9">
                <Eyebrow tone="volt" className="mb-5">
                  Beint samband
                </Eyebrow>
                <dl className="space-y-5">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-white/50">Sími</dt>
                    <dd className="mt-1 font-display text-2xl font-semibold">
                      <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-volt-300">
                        {site.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-white/50">Netfang</dt>
                    <dd className="mt-1 text-lg">
                      <a href={`mailto:${site.email}`} className="hover:text-volt-300">
                        {site.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-white/50">Heimilisfang</dt>
                    <dd className="mt-1 text-lg">
                      {site.address.street}
                      <br />
                      {site.address.postal} {site.address.city}
                    </dd>
                  </div>
                </dl>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${site.address.street}, ${site.address.city}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-volt-300 hover:text-white"
                >
                  Opna í kortum <ExternalArrow className="h-4 w-4" />
                </a>
              </div>

              <div className="rounded-3xl border border-mist-200 bg-white p-7">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-900/50">
                  Opnunartími
                </h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {site.hours.map((h) => (
                    <li key={h.days} className="flex justify-between gap-4">
                      <span className="text-ink-900/70">{h.days}</span>
                      <span className="font-medium">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kort – placeholder */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-mist-200 bg-mist-100 bg-grid-light">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </span>
                  <p className="mt-3 text-sm font-medium">Kort kemur hér</p>
                  <p className="text-xs text-ink-900/50">{site.address.street}, {site.address.city}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
