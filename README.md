# Bláorka – nýr vefur

Next.js 16 (App Router) · TypeScript · Tailwind v4. Engin vefverslun – hún er á blaorka.is.

## Keyra

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Uppbygging

```
src/app/            síður (App Router)
  /                 forsíða
  /lausnir[/slug]   lausnir (heimili, off-grid, húsbílar, fjarskipti, töflur, raforkubankar)
  /frodleikur[/slug] greinar
  /reiknivelar[/slug] reiknivélar – beinagrind, engir útreikningar ennþá
  /frettir[/slug]   fréttir
  /um-okkur, /hafa-samband
src/components/     haus, fótur, UI-primitives (ui.tsx), tákn, logo, fréttakort
src/content/        seed-gögn (news.ts er sótt af blaorka.is/frettir 2026-09-03)
src/lib/content.ts  gagnaaðgangslag – ALLAR síður sækja efni hér; skipta út fyrir DB síðar
src/lib/types.ts    týpur sem verða speglaðar í DB-schema
public/news/        fréttamyndir (webp, ≤1600px)
public/brand/       logo
```

## Hönnunarkerfi

Litir og letur eru skilgreind í `src/app/globals.css` (`@theme`):
`brand-*` (#1288ca), `volt-*` (rafmagnsblár áhersla), `ink-*` (dökkur navy), `mist-*` (ljós grunnur).
Letur: Sora (fyrirsagnir) + Inter (meginmál) gegnum next/font.

## Næstu skref

- [ ] Gagnagrunnur (Postgres/Prisma eða Supabase) + admin fyrir fréttir/greinar
- [ ] Útreikningar í reiknivélum (`src/lib/calculators/`)
- [ ] Tengja form á /hafa-samband
- [ ] Myndir af starfsfólki, kort á /hafa-samband
- [ ] Vektor-útgáfa af orðmerki (nú PNG)
