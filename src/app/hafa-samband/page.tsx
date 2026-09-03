import type { Metadata } from "next";
import { site } from "@/content/site";
import { Container, Eyebrow, PageHero, Section } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { ExternalArrow } from "@/components/icons";

export const metadata: Metadata = {
  title: "Hafa samband",
  description: "Hafðu samband við Bláorku – fáðu tilboð í sólarorkukerfi eða ráðgjöf.",
};

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
            <div className="rounded-3xl border border-mist-200 bg-white p-7 shadow-card sm:p-9">
              <ContactForm
                variant="full"
                title="Fá tilboð eða ráðgjöf"
                intro="Því meira sem þú segir okkur, því nákvæmari tillögu getum við sent."
                className="relative"
              />
            </div>

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
