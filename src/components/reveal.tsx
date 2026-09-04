"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll-reveal fyrir allan vefinn.
 *
 * Server components merkja einfaldlega `data-reveal` (eitt stak) eða
 * `data-reveal-stagger` (börn birtast hvert á eftir öðru) – þessi komponent
 * fylgist með þeim með IntersectionObserver og bætir `is-in` við þegar þau
 * koma í sjónmál. Stílarnir eru í globals.css undir "Reveal við scroll" og
 * eru aðeins virkir í vöfrum með JS (`@media (scripting: enabled)`), svo
 * efnið sést alltaf þótt JS bregðist.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const pending = new Set<Element>();
    const show = (el: Element) => {
      el.classList.add("is-in");
      pending.delete(el);
      io.unobserve(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Í sjónmáli – eða þegar búið að skruna fram hjá (t.d. stokkið á akkeri)
          if (e.isIntersecting || e.boundingClientRect.bottom < 0) show(e.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );

    const scan = () => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in), [data-reveal-stagger]:not(.is-in)")
        .forEach((el) => {
          if (pending.has(el)) return;
          if (el.hasAttribute("data-reveal-stagger")) {
            Array.from(el.children).forEach((child, i) =>
              (child as HTMLElement).style.setProperty("--i", String(Math.min(i, 11))),
            );
          }
          pending.add(el);
          io.observe(el);
        });
    };

    scan();

    // Vara-athugun: stök sem var stokkið yfir (End-takki, hröð skrun) fá is-in
    // um leið og þau eru komin fyrir ofan skjáinn, svo þau séu ekki auð ef
    // skrunað er til baka.
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        for (const el of pending) {
          if (el.getBoundingClientRect().bottom < 0) show(el);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Efni sem bætist við síðar (t.d. niðurstöður í reiknivélum, síur í myndasafni)
    let raf = 0;
    const mo = new MutationObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
    };
  }, [pathname]);

  return null;
}
