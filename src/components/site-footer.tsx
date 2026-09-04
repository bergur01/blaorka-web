import Link from "next/link";
import { navigation, site } from "@/content/site";
import { Logo, LogoMark } from "./logo";
import { ExternalArrow } from "./icons";

const columns = [
  {
    title: "Vefurinn",
    links: navigation.map((n) => ({ href: n.href, label: n.label })),
  },
  {
    title: "Lausnir",
    links: [
      { href: "/lausnir/heimili-og-sumarhus", label: "Heimili & sumarhús" },
      { href: "/lausnir/otengd-kerfi", label: "Ótengd kerfi" },
      { href: "/lausnir/husbilar-og-batar", label: "Húsbílar & bátar" },
      { href: "/lausnir/fyrirtaeki-og-fjarskipti", label: "Fyrirtæki & fjarskipti" },
      { href: "/lausnir/raforkubankar", label: "Raforkubankar" },
      { href: "/verkefni", label: "Verkefni í myndum" },
    ],
  },
  {
    title: "Reiknivélar",
    links: [
      { href: "/reiknivelar/solarorkukerfi", label: "Stærð sólarorkukerfis" },
      { href: "/reiknivelar/mppt", label: "MPPT reiknivél" },
      { href: "/reiknivelar/orkunotkun", label: "Orkunotkun" },
      { href: "/reiknivelar/rafgeymar", label: "Rafgeymabanki" },
      { href: "/reiknivelar/kaplar", label: "Kapalstærð" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-white">
      <div className="energy-line absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-500/15 blur-[120px] animate-aurora-slow" />

      <div className="container-x relative py-16 sm:py-20">
        <div data-reveal-stagger className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo variant="dark" className="h-8 w-auto" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              {site.description}
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <p className="text-white/80">
                {site.address.street}, {site.address.postal} {site.address.city}
              </p>
              <p>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-white/80 hover:text-volt-300">
                  {site.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.email}`} className="text-white/80 hover:text-volt-300">
                  {site.email}
                </a>
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/70 transition hover:border-brand-400 hover:text-white"
                aria-label="Bláorka á Facebook"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z" />
                </svg>
              </a>
              <a
                href={site.shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-10 items-center gap-2 rounded-full border border-white/12 px-4 text-sm font-medium text-white/80 transition hover:border-brand-400 hover:text-white"
              >
                Vefverslun
                <ExternalArrow className="h-4 w-4" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/75 transition hover:text-volt-300"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <LogoMark className="h-5 w-auto" dark />
            <span>
              © {new Date().getFullYear()} {site.legalName}. Allur réttur áskilinn.
            </span>
          </div>
          <p className="font-medium text-white/60">{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
