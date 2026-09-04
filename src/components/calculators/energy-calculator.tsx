"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  customKwhPerDay,
  devices,
  sumDevices,
  type CustomDevice,
} from "@/lib/solar/devices";
import { BANK_KWH, DOD, INVERTER_EFF, MONTH_DAYS, fmt, fmt1 } from "@/lib/solar/sizing";
import { DevicePicker } from "./device-picker";
import { ArrowRight, Icon } from "@/components/icons";

// Orkunotkunarreiknivél – sömu tæki, samtímastuðull og öryggismörk og í
// sólarorkureiknivélinni (src/lib/solar/devices.ts).

const DEFAULT_SELECTED: [string, number][] = [
  ["isskapur", 1],
  ["ljos", 1],
  ["sjonvarp", 1],
  ["starlink", 1],
  ["thvottavel", 1],
  ["kaffivel", 1],
];

export function EnergyCalculator() {
  const [selected, setSelected] = useState<Map<string, number>>(() => new Map(DEFAULT_SELECTED));
  const [marginPct, setMarginPct] = useState(20);
  const [custom, setCustom] = useState<CustomDevice[]>([]);
  const [draft, setDraft] = useState({ name: "", peakW: 0, hoursPerDay: 1 });

  const totals = useMemo(() => sumDevices(selected, marginPct, custom), [selected, marginPct, custom]);

  function setQty(id: string, qty: number) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (qty <= 0) next.delete(id);
      else next.set(id, qty);
      return next;
    });
  }

  function addCustom() {
    if (!draft.name.trim() || draft.peakW <= 0 || draft.hoursPerDay <= 0) return;
    setCustom((c) => [
      ...c,
      { id: `c${Date.now()}`, name: draft.name.trim(), peakW: draft.peakW, hoursPerDay: draft.hoursPerDay, qty: 1 },
    ]);
    setDraft({ name: "", peakW: 0, hoursPerDay: 1 });
  }

  // Sundurliðun eftir tækjum (án öryggismarka) fyrir stikur
  const breakdown = useMemo(() => {
    const rows: { name: string; kwh: number }[] = [];
    for (const [id, qty] of selected) {
      const d = devices.find((x) => x.id === id);
      if (d && qty > 0) rows.push({ name: qty > 1 ? `${qty}× ${d.name}` : d.name, kwh: d.kwhPerDay * qty });
    }
    for (const c of custom) if (c.qty > 0) rows.push({ name: c.qty > 1 ? `${c.qty}× ${c.name}` : c.name, kwh: customKwhPerDay(c) * c.qty });
    return rows.sort((a, b) => b.kwh - a.kwh);
  }, [selected, custom]);
  const rawDaily = breakdown.reduce((s, r) => s + r.kwh, 0);
  const maxKwh = breakdown[0]?.kwh || 1;

  const monthly = totals.dailyKwh * 30.4;
  const annual = MONTH_DAYS.reduce((s, d) => s + d, 0) * totals.dailyKwh;
  const banksPerDay = Math.max(1, Math.ceil(totals.dailyKwh / DOD / INVERTER_EFF / BANK_KWH));

  const solarHref = `/reiknivelar/solarorkukerfi?daily=${totals.dailyKwh}&peak=${totals.peakKw}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* ================= INNTAK ================= */}
      <div className="space-y-5">
        <section className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-sm font-semibold text-white">1</span>
            <div>
              <h2 className="font-display text-lg font-semibold leading-tight">Hvaða tæki eru í notkun?</h2>
              <p className="mt-0.5 text-sm text-ink-900/55">Hakaðu við og stilltu fjölda. Tölurnar eru meðalnotkun á dag.</p>
            </div>
          </div>
          <DevicePicker selected={selected} onQty={setQty} marginPct={marginPct} onMargin={setMarginPct} totals={totals} />
        </section>

        <section className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-sm font-semibold text-white">2</span>
            <div>
              <h2 className="font-display text-lg font-semibold leading-tight">Eigin tæki</h2>
              <p className="mt-0.5 text-sm text-ink-900/55">Vantar eitthvað? Sláðu inn afl og notkun á dag – kWst reiknast sjálfkrafa.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
            <label className="block">
              <span className="text-xs font-medium text-ink-900/80">Heiti</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                placeholder="t.d. Fiskabúr"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink-900/80">Afl (W)</span>
              <input
                type="number"
                inputMode="decimal"
                min={1}
                value={draft.peakW || ""}
                onChange={(e) => setDraft((d) => ({ ...d, peakW: Number(e.target.value) || 0 }))}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                placeholder="t.d. 60"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink-900/80">Klst á dag</span>
              <input
                type="number"
                inputMode="decimal"
                min={0.1}
                max={24}
                step={0.5}
                value={draft.hoursPerDay}
                onChange={(e) => setDraft((d) => ({ ...d, hoursPerDay: Number(e.target.value) || 0 }))}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                className={inputCls}
              />
            </label>
            <button
              type="button"
              onClick={addCustom}
              disabled={!draft.name.trim() || draft.peakW <= 0 || draft.hoursPerDay <= 0}
              className="h-11 rounded-xl bg-ink-900 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Bæta við
            </button>
          </div>
          {custom.length > 0 && (
            <ul className="mt-4 divide-y divide-mist-200 rounded-2xl border border-mist-200">
              {custom.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{c.name}</span>
                    <span className="ml-2 text-xs text-ink-900/50">
                      {fmt.format(c.peakW)} W × {fmt1.format(c.hoursPerDay)} klst = {fmt1.format(customKwhPerDay(c))} kWst/dag
                    </span>
                  </span>
                  <span className="flex items-center rounded-lg border border-mist-300 bg-mist-50">
                    <button type="button" onClick={() => setCustom((l) => l.map((x) => (x.id === c.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))} className="h-7 w-7 text-sm font-semibold text-ink-900/60 hover:text-brand-600" aria-label={`Fækka ${c.name}`}>−</button>
                    <span className="w-5 text-center text-xs font-semibold tabular-nums">{c.qty}</span>
                    <button type="button" onClick={() => setCustom((l) => l.map((x) => (x.id === c.id ? { ...x, qty: Math.min(9, x.qty + 1) } : x)))} className="h-7 w-7 text-sm font-semibold text-ink-900/60 hover:text-brand-600" aria-label={`Fjölga ${c.name}`}>+</button>
                  </span>
                  <button type="button" onClick={() => setCustom((l) => l.filter((x) => x.id !== c.id))} className="text-xs font-medium text-ink-900/50 hover:text-red-600" aria-label={`Fjarlægja ${c.name}`}>
                    Fjarlægja
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ================= NIÐURSTAÐA ================= */}
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-6 text-white sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/30 blur-[80px]" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-volt-400">
              <span className="h-px w-6 bg-current opacity-60" />
              Orkuþörf
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Stat icon="bolt" label="Á dag" value={`${fmt1.format(totals.dailyKwh)} kWst`} sub={marginPct > 0 ? `þar af +${marginPct} % öryggismörk` : `${totals.count} tæki`} accent />
              <Stat icon="gauge" label="Hámarksálag" value={`${fmt1.format(totals.peakKw)} kW`} sub="60 % samtímastuðull" />
              <Stat icon="sun" label="Á mánuði" value={`${fmt.format(monthly)} kWst`} sub="30,4 dagar" />
              <Stat icon="grid" label="Á ári" value={`${fmt.format(annual)} kWst`} sub="365 dagar" />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={solarHref}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_rgb(18_136_202/0.8)] transition hover:bg-brand-400"
              >
                Stærða sólarorkukerfi út frá þessu
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="text-xs text-white/50">Tölurnar fylgja með</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <h3 className="font-display text-lg font-semibold">Hvað notar mest?</h3>
          <p className="mt-0.5 text-sm text-ink-900/55">kWst á dag án öryggismarka · {fmt1.format(rawDaily)} kWst samtals</p>
          {breakdown.length === 0 ? (
            <p className="mt-5 text-sm text-ink-900/60">Veldu tæki til að sjá sundurliðun.</p>
          ) : (
            <ol className="mt-5 space-y-2.5">
              {breakdown.map((r) => (
                <li key={r.name} className="grid grid-cols-[minmax(0,9rem)_1fr_4rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,11rem)_1fr_4.5rem]">
                  <span className="truncate font-medium" title={r.name}>{r.name}</span>
                  <div className="h-4 overflow-hidden rounded-md bg-mist-100">
                    <div className="h-full rounded-md bg-brand-500" style={{ width: `${(r.kwh / maxKwh) * 100}%` }} />
                  </div>
                  <span className="text-right tabular-nums text-ink-900/70">
                    {fmt1.format(r.kwh)} <span className="text-xs">({fmt.format((r.kwh / rawDaily) * 100)} %)</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <h3 className="font-display text-lg font-semibold">Hvað þýðir þetta fyrir kerfi?</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-900/75">
            <li className="flex gap-3">
              <Icon name="battery" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span>
                Til að komast í gegnum <strong>einn dag án sólar</strong> þarf um{" "}
                <strong className="text-ink-900">{banksPerDay} × {fmt1.format(BANK_KWH)} kWst</strong> Bláorku rafgeymabanka ({fmt.format(banksPerDay * BANK_KWH)} kWst, {fmt.format(DOD * 100)} % afhleðsla).
              </span>
            </li>
            <li className="flex gap-3">
              <Icon name="wave" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span>
                Áriðill þarf að ráða við <strong className="text-ink-900">≈ {fmt1.format(totals.peakKw)} kW</strong> samfellt – í þriggja fasa kerfi dreifist það á þrjá MultiPlus-II.
              </span>
            </li>
            <li className="flex gap-3">
              <Icon name="sun" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span>
                Sólarorkureiknivélin finnur hversu margar sellur þarf til að framleiða{" "}
                <strong className="text-ink-900">{fmt.format(annual)} kWst á ári</strong> á þínum stað.
              </span>
            </li>
          </ul>
        </div>

        <p className="px-2 text-xs leading-relaxed text-ink-900/45">
          Meðalnotkun tækja er áætluð fyrir íslensk heimili og sumarhús. Raunnotkun fer eftir tækjum, venjum og árstíð – mælir
          (t.d. Cerbo GX eða snjallmælir) gefur nákvæmustu tölurnar.
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "mt-1 h-11 w-full rounded-xl border border-mist-300 bg-mist-50 px-3 text-sm text-ink-900 outline-none placeholder:text-ink-900/35 focus:border-brand-500 focus:bg-white";

function Stat({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: "bolt" | "gauge" | "sun" | "grid";
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? "bg-brand-500/20 ring-1 ring-brand-400/40" : "bg-white/5 ring-1 ring-white/10"}`}>
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/55">
        <Icon name={icon} className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-white/60">{sub}</p>
    </div>
  );
}
