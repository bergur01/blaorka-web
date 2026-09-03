"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation, site } from "@/content/site";
import { Logo } from "./logo";
import { ExternalArrow } from "./icons";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "glass shadow-[0_10px_40px_-20px_rgb(0_0_0/0.6)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container-x flex h-18 items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label="Bláorka – forsíða">
          <Logo variant="dark" className="h-7 sm:h-8 w-auto" priority />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Aðalvalmynd">
          {navigation.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-white/70 hover:text-white hover:bg-white/6"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-volt-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="text-sm font-medium text-white/70 hover:text-white"
          >
            {site.phoneDisplay}
          </a>
          <a
            href={site.shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-10 items-center gap-2 rounded-full bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            Vefverslun
            <ExternalArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Loka valmynd" : "Opna valmynd"}
        >
          <span className="relative block h-4 w-6">
            <span
              className={`absolute left-0 top-0 h-0.5 w-6 bg-current transition-transform ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-6 bg-current transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-6 bg-current transition-transform ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* Farsímavalmynd */}
      <div
        id="mobile-nav"
        className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ${
          open ? "max-h-[90dvh]" : "max-h-0"
        }`}
      >
        <nav className="container-x flex flex-col gap-1 pb-6 pt-2" aria-label="Farsímavalmynd">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-lg font-medium text-white/85 hover:bg-white/6 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
            <a
              href={site.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-500 px-5 font-semibold text-white"
            >
              Vefverslun <ExternalArrow className="h-4 w-4" />
            </a>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="text-center text-white/70"
            >
              Sími {site.phoneDisplay}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
