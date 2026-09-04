import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/content/site";
import { Container, Eyebrow, PageHero, Section } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { ExternalArrow } from "@/components/icons";
import { ChatBubbles } from "@/components/chat-bubbles";

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
        image="/photos/komdu-vi-hja-blaorku-15a3273.webp"
        aside={<ChatBubbles className="w-full" />}
      />
      <Section tone="light">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div data-reveal className="rounded-3xl border border-mist-200 bg-white p-7 shadow-card sm:p-9">
              <ContactForm
                variant="full"
                title="Fá tilboð eða ráðgjöf"
                intro="Því meira sem þú segir okkur, því nákvæmari tillögu getum við sent."
                className="relative"
              />
            </div>

            <div data-reveal-stagger className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-7 text-white sm:p-9">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500/30 blur-[70px] animate-aurora" />
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

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${site.address.street}, ${site.address.city}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-ink-800 shadow-card"
              >
                <Image
                  src="/photos/stasetning-komdu-vi-dji_0126.webp"
                  alt="Bláorka að Fosshálsi 27 úr lofti"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink-900/85 to-transparent p-5 text-white">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/60">Hér erum við</p>
                    <p className="font-display text-lg font-semibold">
                      {site.address.street}, {site.address.postal} {site.address.city}
                    </p>
                  </div>
                  <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold backdrop-blur group-hover:bg-brand-500">
                    Kort <ExternalArrow className="h-4 w-4" />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
