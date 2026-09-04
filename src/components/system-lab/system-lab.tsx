"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MONTHS } from "@/content/climate";
import { makeFormatter } from "@/lib/format";
import {
  inverterFor,
  peakLoadKw,
  simulateDay,
  simulateYear,
  siteBySlug,
  suggestInverter,
  type EvMode,
  type LabHour,
  type LabInput,
} from "@/lib/system-lab";
import { SystemDiagram, type LiveState, type NodeId } from "./diagram";
import { DayChart, YearChart } from "./charts";
import { NODE_INFO } from "./info";

const nf0 = makeFormatter(0);
const nf1 = makeFormatter(1);

/** Fast gildi sem notandinn þarf ekki að stilla – haldið utan við viðmótið. */
const FIXED = {
  siteSlug: "reykjavik",
  tilt: 35 as const,
  turbines: 1,
  hubHeight: 12,
  reservePct: 20,
  profile: "heimili" as const,
  evKw: 7.4,
  evKwhPerDay: 10,
  grid: false,
  turbineKw: 1.5,
};

const DEFAULT: LabInput = {
  ...FIXED,
  month: 5,
  kwp: 6,
  sun: 1,
  windMean: 6,
  turbineKw: FIXED.turbineKw,
  batteryKwh: 20,
  inverterVa: 5000,
  dailyKwh: 12,
  evEnabled: false,
  evMode: "nott",
  generator: true,
};

const PRESETS: { id: string; label: string; input: Partial<LabInput> }[] = [
  {
    id: "bustadur",
    label: "Sumarbústaður",
    input: { month: 5, kwp: 3, batteryKwh: 10, dailyKwh: 6, turbineKw: 0, evEnabled: false, generator: false },
  },
  {
    id: "heimili",
    label: "Heimili utan nets",
    input: { month: 9, kwp: 8, batteryKwh: 30, dailyKwh: 28, turbineKw: 1.5, evEnabled: false, generator: true },
  },
  {
    id: "rafbill",
    label: "Rafbíll á sólinni",
    input: { month: 5, kwp: 10, batteryKwh: 20, dailyKwh: 12, turbineKw: 0, evEnabled: true, evMode: "sol", generator: true },
  },
];

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

function liveAt(hours: LabHour[], t: number): LiveState {
  const i = Math.floor(t) % 24;
  const j = (i + 1) % 24;
  const f = t - Math.floor(t);
  const a = hours[i];
  const b = hours[j];
  // Hleðslustaðan í hverri færslu er staðan í LOK klukkustundarinnar, svo
  // staðan á tíma t liggur milli loka fyrri klukkustundar og þessarar.
  const socFrom = hours[(i + 23) % 24].soc;
  return {
    hour: t,
    solar: lerp(a.solar, b.solar, f),
    wind: lerp(a.wind, b.wind, f),
    house: lerp(a.house, b.house, f),
    ev: lerp(a.ev, b.ev, f),
    battery: lerp(a.battery, b.battery, f),
    soc: lerp(socFrom, a.soc, f),
    gen: lerp(a.gen, b.gen, f),
    grid: lerp(a.grid, b.grid, f),
    curtailed: lerp(a.curtailed, b.curtailed, f),
    deficit: lerp(a.deficit, b.deficit, f),
    windSpeed: lerp(a.windSpeed, b.windSpeed, f),
    temp: lerp(a.temp, b.temp, f),
  };
}

// ---------- Stýrihlutir ----------

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-white/85">{label}</span>
        <span className="font-display text-base font-semibold tabular-nums text-volt-300">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-volt-400"
      />
    </label>
  );
}

function Toggle({ label, note, on, onChange }: { label: string; note?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
        on ? "border-volt-400/70 bg-volt-500/12" : "border-white/12 bg-white/4 hover:border-white/25"
      }`}
    >
      <span>
        <span className="block text-sm font-semibold text-white/90">{label}</span>
        {note && <span className="block text-[11px] text-white/45">{note}</span>}
      </span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? "bg-volt-500" : "bg-white/20"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function Stat({ label, value, unit, tone = "default" }: { label: string; value: string; unit?: string; tone?: "default" | "good" | "warn" }) {
  const color = { default: "text-white", good: "text-[#5ef2b8]", warn: "text-[#fbbf24]" }[tone];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.12em] text-white/45">{label}</div>
      <div className={`mt-1 font-display text-xl font-semibold tabular-nums ${color}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-white/50">{unit}</span>}
      </div>
    </div>
  );
}

// ---------- Aðalhlutinn ----------

export function SystemLab() {
  const [input, setInput] = useState<LabInput>(DEFAULT);
  const [hour, setHour] = useState(12);
  const [playing, setPlaying] = useState(true);
  const [selected, setSelected] = useState<NodeId | null>(null);
  const [preset, setPreset] = useState<string | null>(null);
  const [showYear, setShowYear] = useState(false);
  const raf = useRef<number | null>(null);
  const scrollBox = useRef<HTMLDivElement | null>(null);

  const set = useCallback(<K extends keyof LabInput>(key: K, value: LabInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    setPreset(null);
  }, []);

  // Á litlum skjám er myndin breiðari en skjárinn – byrja á miðju kerfinu
  useEffect(() => {
    const el = scrollBox.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) * 0.45);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Byrja á líðandi mánuði og klukkustund, eftir fyrstu myndbirtingu svo
  // vefþjónn og vafri skili sama HTML-i
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const now = new Date();
      setInput((prev) => ({ ...prev, month: now.getMonth() }));
      setHour(now.getHours() + now.getMinutes() / 60);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // 0,7 klst á sekúndu – sólarhringurinn líður á rúmlega hálfri mínútu
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setHour((h) => (h + dt * 0.7) % 24);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

  // Áriðillinn er valinn sjálfkrafa eftir hámarksálagi
  const sized = useMemo<LabInput>(
    () => ({
      ...input,
      inverterVa: suggestInverter(peakLoadKw(input.dailyKwh, input.profile, input.evEnabled ? input.evKw : 0)),
    }),
    [input],
  );

  const day = useMemo(() => simulateDay(sized), [sized]);
  const year = useMemo(() => simulateYear(sized), [sized]);
  const live = useMemo(() => liveAt(day.hours, hour), [day, hour]);
  const site = siteBySlug(sized.siteSlug);
  const inv = inverterFor(sized.inverterVa);

  const [sunrise, sunset] = useMemo(() => {
    const profile = site.solar[sized.tilt][sized.month];
    const up = profile.map((w, i) => (w > 0 ? i : -1)).filter((i) => i >= 0);
    if (!up.length) return [11, 15];
    return [up[0], up[up.length - 1] + 1];
  }, [site, sized.tilt, sized.month]);

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setInput({ ...DEFAULT, ...p.input });
    setPreset(id);
  };

  const totalProd = day.solarKwh + day.windKwh;
  const totalLoad = day.houseKwh + day.evKwh + day.deficitKwh;
  const info = selected ? NODE_INFO[selected] : null;

  const warnings: { tone: "warn" | "good"; text: string }[] = [];
  if (day.deficitKwh > 0.05)
    warnings.push({ tone: "warn", text: `Kerfið annar ekki notkuninni – ${nf1.format(day.deficitKwh)} kWst vantar upp á daginn.` });
  if (day.genKwh > 0.05)
    warnings.push({ tone: "warn", text: `Rafstöðin keyrir ${day.genHours} klst á sólarhring, um ${nf1.format(day.genLitres)} lítrar af olíu.` });
  if (day.curtailedKwh > totalProd * 0.25 && totalProd > 1)
    warnings.push({
      tone: "good",
      text: `${nf0.format((day.curtailedKwh / totalProd) * 100)} % framleiðslunnar nýtist ekki. Stærri rafgeymir, hitakútur eða rafbíll myndi taka við henni.`,
    });

  return (
    <div className="rounded-[2rem] border border-white/10 bg-ink-950/60 p-4 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)] sm:p-6">
      {/* Dæmi */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Dæmi</span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              preset === p.id
                ? "border-volt-400 bg-volt-500/20 text-white"
                : "border-white/12 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Myndin */}
      <div ref={scrollBox} className="mt-4 overflow-x-auto rounded-3xl border border-white/10">
        <div className="min-w-[860px]">
          <SystemDiagram
            live={live}
            config={{
              kwp: sized.kwp,
              batteryKwh: sized.batteryKwh,
              inverterLabel: inv.label,
              inverterKw: inv.contW / 1000,
              turbineKw: sized.turbineKw,
              evEnabled: sized.evEnabled,
              generator: sized.generator,
              sunrise,
              sunset,
              sunFactor: sized.sun,
              siteName: site.name,
              monthName: MONTHS[sized.month],
            }}
            selected={selected}
            onSelect={(id) => setSelected((cur) => (cur === id ? null : id))}
          />
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-white/40 sm:hidden">Strjúktu til hliðar til að sjá alla myndina</p>

      {/* Tíminn */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Stöðva daginn" : "Spila daginn"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-400"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/45">Klukkan</span>
            <span className="font-display text-lg font-semibold tabular-nums text-white">
              {String(Math.floor(hour)).padStart(2, "0")}:{String(Math.floor((hour % 1) * 60)).padStart(2, "0")}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={23.9}
            step={0.1}
            value={hour}
            onChange={(e) => {
              setPlaying(false);
              setHour(Number(e.target.value));
            }}
            className="mt-1 w-full accent-volt-400"
            aria-label="Klukkan"
          />
        </div>
      </div>

      {/* Skýring á völdum hluta */}
      {info ? (
        <div className="mt-4 rounded-2xl border border-volt-400/30 bg-volt-500/8 p-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-lg font-semibold text-white">{info.title}</h3>
            <button type="button" onClick={() => setSelected(null)} className="text-xs text-white/50 transition hover:text-white">
              Loka
            </button>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/75">{info.text}</p>
          <ul className="mt-3 grid gap-1.5 text-sm text-white/60 sm:grid-cols-3">
            {info.facts.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-volt-400" />
                {f}
              </li>
            ))}
          </ul>
          {info.href && (
            <Link href={info.href} className="mt-3 inline-flex text-sm font-semibold text-volt-300 hover:text-volt-200">
              {info.hrefLabel} →
            </Link>
          )}
        </div>
      ) : (
        <p className="mt-3 text-center text-xs text-white/40">Smelltu á hvaða hluta myndarinnar sem er til að sjá hvað hann gerir.</p>
      )}

      {/* Stýringar – þrír flokkar */}
      <div className="mt-5 grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/4 p-5">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-volt-300">Veðrið</h3>
          <Slider label="Mánuður" value={input.month} display={MONTHS[input.month]} min={0} max={11} step={1} onChange={(v) => set("month", v)} />
          <Slider
            label="Sólskin"
            value={input.sun}
            display={input.sun < 0.45 ? "Alskýjað" : input.sun < 0.8 ? "Skýjað" : input.sun < 1.15 ? "Dæmigert" : "Heiðskírt"}
            min={0.1}
            max={1.3}
            step={0.05}
            onChange={(v) => set("sun", v)}
          />
          <Slider
            label="Vindur"
            value={input.windMean}
            display={`${nf1.format(input.windMean)} m/s`}
            min={0}
            max={14}
            step={0.5}
            onChange={(v) => set("windMean", v)}
          />
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/4 p-5">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-volt-300">Kerfið</h3>
          <Slider
            label="Sólarsellur"
            value={input.kwp}
            display={`${nf1.format(input.kwp)} kWp`}
            min={0}
            max={20}
            step={0.5}
            onChange={(v) => set("kwp", v)}
          />
          <Slider
            label="Rafgeymar"
            value={input.batteryKwh}
            display={`${nf0.format(input.batteryKwh)} kWst`}
            min={5}
            max={80}
            step={5}
            onChange={(v) => set("batteryKwh", v)}
          />
          <Toggle
            label="Vindmylla"
            note="1,5 kW mylla með vindstýringu"
            on={input.turbineKw > 0}
            onChange={(v) => set("turbineKw", v ? FIXED.turbineKw : 0)}
          />
          <Toggle label="Rafstöð til vara" note="ræsist sjálfkrafa við 20 % hleðslu" on={input.generator} onChange={(v) => set("generator", v)} />
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/4 p-5">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-volt-300">Notkunin</h3>
          <Slider
            label="Dagleg notkun"
            value={input.dailyKwh}
            display={`${nf1.format(input.dailyKwh)} kWst`}
            min={1}
            max={60}
            step={1}
            onChange={(v) => set("dailyKwh", v)}
          />
          <p className="-mt-2 text-[11px] leading-snug text-white/45">
            Toppur dagsins ≈ {nf1.format(day.peakKw)} kW · {inv.label}
          </p>
          <Toggle
            label="Rafbíll"
            note={`${nf0.format(FIXED.evKwhPerDay)} kWst á dag ≈ ${nf0.format(FIXED.evKwhPerDay * 5.5)} km`}
            on={input.evEnabled}
            onChange={(v) => set("evEnabled", v)}
          />
          {input.evEnabled && (
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { value: "nott", label: "Hleðst um nótt" },
                  { value: "sol", label: "Hleðst með sólinni" },
                ] as { value: EvMode; label: string }[]
              ).map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => set("evMode", o.value)}
                  className={`rounded-xl border px-2 py-2 text-center text-xs font-semibold transition ${
                    input.evMode === o.value
                      ? "border-volt-400 bg-volt-500/15 text-white"
                      : "border-white/12 bg-white/4 text-white/65 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Viðvaranir */}
      {warnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {warnings.map((w) => (
            <div
              key={w.text}
              className={`flex gap-3 rounded-2xl border px-4 py-3 text-sm ${
                w.tone === "warn" ? "border-amber-400/40 bg-amber-500/10 text-amber-100" : "border-volt-400/30 bg-volt-500/8 text-volt-100"
              }`}
            >
              <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${w.tone === "warn" ? "bg-amber-400" : "bg-volt-400"}`} />
              <span>{w.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tölur dagsins */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Framleitt í dag" value={nf1.format(totalProd)} unit="kWst" />
        <Stat label="Notað í dag" value={nf1.format(totalLoad)} unit="kWst" />
        <Stat
          label="Sjálfbærni"
          value={nf0.format(day.selfSufficiency * 100)}
          unit="%"
          tone={day.selfSufficiency > 0.98 ? "good" : day.selfSufficiency > 0.7 ? "default" : "warn"}
        />
        <Stat label="Rafstöð" value={nf1.format(day.genKwh)} unit="kWst" tone={day.genKwh > 0.05 ? "warn" : "good"} />
      </div>

      {/* Sólarhringsferill */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/4 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-white">
            Sólarhringurinn · {MONTHS[sized.month].toLowerCase()} í {site.name}
          </h3>
          <div className="flex flex-wrap gap-3 text-[11px] text-white/55">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> sól
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-volt-500" /> vindur
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> notkun
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/70" /> hleðslustaða
            </span>
          </div>
        </div>
        <div className="mt-2">
          <DayChart
            day={day}
            hour={hour}
            onScrub={(h) => {
              setPlaying(false);
              setHour(h);
            }}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-white/40">Dragðu yfir ferilinn til að færa tímann.</p>
          <button
            type="button"
            onClick={() => setShowYear((v) => !v)}
            aria-expanded={showYear}
            className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-white/75 transition hover:border-white/40 hover:text-white"
          >
            {showYear ? "Fela árið" : "Sjá allt árið"}
          </button>
        </div>
        {showYear && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <YearChart year={year} month={sized.month} onSelect={(m) => set("month", m)} />
            <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-white/45">Framleiðsla</div>
                <div className="font-display font-semibold tabular-nums text-white">
                  {nf0.format(year.solarKwh + year.windKwh)} <span className="text-xs font-normal text-white/50">kWst/ári</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-white/45">Sjálfbærni</div>
                <div className="font-display font-semibold tabular-nums text-white">
                  {nf0.format(year.selfSufficiency * 100)} <span className="text-xs font-normal text-white/50">%</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-white/45">Olía á rafstöð</div>
                <div className="font-display font-semibold tabular-nums text-white">
                  {nf0.format(year.genLitres)} <span className="text-xs font-normal text-white/50">l/ári</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/reiknivelar/solarorkukerfi"
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400"
        >
          Reikna kerfi fyrir þína notkun →
        </Link>
        <Link
          href="/hafa-samband"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:border-white/50 hover:text-white"
        >
          Fá ráðgjöf hjá Bláorku
        </Link>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-white/40">
        Veðurgögnin eru raunveruleg: klukkustundamælingar úr PVGIS 5.3 (JRC, framkvæmdastjórn ESB) fyrir Reykjavík árin
        2021–2023, meðaltalaðar í dægursveiflu hvers mánaðar. Sellurnar snúa í suður með 35° halla og 14 % kerfistöpum,
        áriðillinn er valinn sjálfkrafa eftir hámarksálagi. Hermirinn er til skýringar – raunverulegt kerfi er hannað út
        frá staðháttum, skugga og notkunarmynstri hvers og eins.
      </p>
    </div>
  );
}
