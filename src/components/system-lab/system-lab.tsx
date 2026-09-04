"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CLIMATE_SITES, MONTHS, TILTS, type TiltDeg } from "@/content/climate";
import { makeFormatter } from "@/lib/format";
import {
  INVERTERS,
  LOAD_PROFILE_LABELS,
  inverterFor,
  simulateDay,
  simulateYear,
  siteBySlug,
  type EvMode,
  type InverterVa,
  type LabHour,
  type LabInput,
  type LoadProfile,
} from "@/lib/system-lab";
import { SystemDiagram, type LiveState, type NodeId } from "./diagram";
import { DayChart, YearChart } from "./charts";
import { NODE_INFO } from "./info";

const nf0 = makeFormatter(0);
const nf1 = makeFormatter(1);

const DEFAULT: LabInput = {
  siteSlug: "reykjavik",
  month: 5,
  tilt: 35,
  kwp: 6,
  sun: 1,
  windMean: 6,
  turbineKw: 0.8,
  turbines: 1,
  hubHeight: 12,
  batteryKwh: 20,
  reservePct: 20,
  inverterVa: 5000,
  dailyKwh: 12,
  profile: "heimili",
  evEnabled: false,
  evKw: 3.7,
  evKwhPerDay: 8,
  evMode: "nott",
  generator: true,
  grid: false,
};

const PRESETS: { id: string; label: string; note: string; input: Partial<LabInput> }[] = [
  {
    id: "bustadur",
    label: "Sumarbústaður",
    note: "3 kWp · 10 kWst · notað á kvöldin",
    input: { kwp: 3, batteryKwh: 10, inverterVa: 3000, dailyKwh: 6, profile: "bustadur", turbineKw: 0, evEnabled: false, generator: false, grid: false, month: 5, tilt: 35 },
  },
  {
    id: "heimili",
    label: "Heimili utan nets",
    note: "8 kWp · 30 kWst · varmadæla",
    input: { kwp: 8, batteryKwh: 30, inverterVa: 8000, dailyKwh: 28, profile: "heimili", turbineKw: 1.5, turbines: 1, evEnabled: false, generator: true, grid: false, month: 9 },
  },
  {
    id: "rafbill",
    label: "Sól í rafbílinn",
    note: "10 kWp · hleðsla þegar sólin skín",
    input: { kwp: 10, batteryKwh: 20, inverterVa: 5000, dailyKwh: 12, profile: "heimili", evEnabled: true, evMode: "sol", evKw: 7.4, evKwhPerDay: 12, turbineKw: 0, generator: false, grid: true, month: 5 },
  },
  {
    id: "slorfell",
    label: "Fjarskiptastöð",
    note: "11 kWp · 60 kWst · 800 W mylla",
    input: { siteSlug: "egilsstadir", kwp: 11, batteryKwh: 60, inverterVa: 8000, dailyKwh: 30, profile: "jafnt", turbineKw: 0.8, turbines: 1, hubHeight: 18, windMean: 9, evEnabled: false, generator: true, grid: false, month: 0, tilt: 60 },
  },
  {
    id: "husbill",
    label: "Húsbíll",
    note: "0,9 kWp · 5 kWst · ferðalag",
    input: { kwp: 0.9, batteryKwh: 5, inverterVa: 3000, dailyKwh: 3, profile: "bustadur", turbineKw: 0, evEnabled: false, generator: false, grid: false, month: 6, tilt: 15 },
  },
];

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

function liveAt(hours: LabHour[], t: number): LiveState {
  const i = Math.floor(t) % 24;
  const j = (i + 1) % 24;
  const f = t - Math.floor(t);
  const a = hours[i];
  const b = hours[j];
  return {
    hour: t,
    solar: lerp(a.solar, b.solar, f),
    wind: lerp(a.wind, b.wind, f),
    house: lerp(a.house, b.house, f),
    ev: lerp(a.ev, b.ev, f),
    battery: lerp(a.battery, b.battery, f),
    soc: lerp(a.soc, b.soc, f),
    gen: lerp(a.gen, b.gen, f),
    grid: lerp(a.grid, b.grid, f),
    curtailed: lerp(a.curtailed, b.curtailed, f),
    deficit: lerp(a.deficit, b.deficit, f),
    windSpeed: lerp(a.windSpeed, b.windSpeed, f),
    temp: lerp(a.temp, b.temp, f),
  };
}

// ---------- Litlir stýrihlutir ----------

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-white/85">{label}</span>
        <span className="font-display text-base font-semibold text-volt-300 tabular-nums">{display}</span>
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
      {hint && <span className="mt-1 block text-[11px] leading-snug text-white/45">{hint}</span>}
    </label>
  );
}

function Choice<T extends string | number>({
  label,
  value,
  options,
  onChange,
  columns = 3,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; note?: string }[];
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-white/85">{label}</span>
      <div className={`mt-2 grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onChange(o.value)}
              className={`rounded-xl border px-2 py-2 text-center text-xs font-semibold transition ${
                on
                  ? "border-volt-400 bg-volt-500/15 text-white"
                  : "border-white/12 bg-white/4 text-white/65 hover:border-white/30 hover:text-white"
              }`}
            >
              {o.label}
              {o.note && <span className="mt-0.5 block text-[10px] font-normal text-white/45">{o.note}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({
  label,
  note,
  on,
  onChange,
}: {
  label: string;
  note?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
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
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

function Stat({ label, value, unit, tone = "default" }: { label: string; value: string; unit?: string; tone?: "default" | "good" | "warn" | "bad" }) {
  const colors = {
    default: "text-white",
    good: "text-[#5ef2b8]",
    warn: "text-[#fbbf24]",
    bad: "text-[#fca5a5]",
  }[tone];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.12em] text-white/45">{label}</div>
      <div className={`mt-1 font-display text-xl font-semibold tabular-nums ${colors}`}>
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
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) * 0.5);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Byrja á líðandi mánuði og klukkustund. Gert eftir fyrstu myndbirtingu svo
  // vefþjónn og vafri skili sama HTML-i.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const now = new Date();
      setInput((prev) => ({ ...prev, month: now.getMonth() }));
      setHour(now.getHours() + now.getMinutes() / 60);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Spilun dagsins
  useEffect(() => {
    if (!playing) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setHour((h) => (h + dt * 2.4) % 24);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

  const day = useMemo(() => simulateDay(input), [input]);
  const year = useMemo(() => simulateYear(input), [input]);
  const live = useMemo(() => liveAt(day.hours, hour), [day, hour]);
  const site = siteBySlug(input.siteSlug);
  const inv = inverterFor(input.inverterVa);

  const [sunrise, sunset] = useMemo(() => {
    const profile = site.solar[input.tilt][input.month];
    const up = profile.map((w, i) => (w > 0 ? i : -1)).filter((i) => i >= 0);
    if (!up.length) return [11, 15];
    return [up[0], up[up.length - 1] + 1];
  }, [site, input.tilt, input.month]);

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setInput({ ...DEFAULT, ...p.input });
    setPreset(id);
  };

  const totalLoad = day.houseKwh + day.evKwh + day.deficitKwh;
  const totalProd = day.solarKwh + day.windKwh;
  const info = selected ? NODE_INFO[selected] : null;

  const warnings: { tone: "warn" | "bad" | "good"; text: string }[] = [];
  if (day.deficitKwh > 0.05)
    warnings.push({
      tone: "bad",
      text: day.inverterOverload
        ? `Álagið fer yfir ${nf1.format(inv.contW / 1000)} kW sem áriðillinn ræður við – veldu stærri MultiPlus.`
        : `Kerfið nær ekki að anna notkuninni: ${nf1.format(day.deficitKwh)} kWst vantar upp á daginn.`,
    });
  if (day.genKwh > 0.05)
    warnings.push({
      tone: "warn",
      text: `Rafstöðin þarf að keyra ${day.genHours} klst á sólarhring – um ${nf1.format(day.genLitres)} lítrar af olíu.`,
    });
  if (day.curtailedKwh > totalProd * 0.25 && totalProd > 1)
    warnings.push({
      tone: "good",
      text: `${nf0.format((day.curtailedKwh / totalProd) * 100)} % framleiðslunnar kemst ekki fyrir. Stærri rafgeymir, hitakútur eða rafbílahleðsla myndi nýta hana.`,
    });
  if (day.minSoc <= input.reservePct + 0.5 && day.genKwh < 0.05 && day.deficitKwh < 0.05)
    warnings.push({ tone: "warn", text: "Rafgeymirinn fer niður í varaforðann – dagurinn er alveg á mörkunum." });

  return (
    <div className="rounded-[2rem] border border-white/10 bg-ink-950/60 p-4 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)] sm:p-6">
      {/* Forstillingar */}
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
            title={p.note}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Myndin */}
      <div ref={scrollBox} className="mt-4 overflow-x-auto rounded-3xl border border-white/10 bg-ink-900/70">
        <div className="min-w-[880px]">
          <SystemDiagram
            live={live}
            config={{
              kwp: input.kwp,
              tilt: input.tilt,
              turbineKw: input.turbineKw,
              turbines: input.turbines,
              batteryKwh: input.batteryKwh,
              inverterLabel: inv.label,
              inverterKw: inv.contW / 1000,
              evEnabled: input.evEnabled,
              generator: input.generator,
              grid: input.grid,
              sunFactor: input.sun,
              sunrise,
              sunset,
              siteName: site.name,
              monthName: MONTHS[input.month],
            }}
            selected={selected}
            onSelect={(id) => setSelected((cur) => (cur === id ? null : id))}
          />
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-white/40 sm:hidden">Strjúktu til hliðar til að sjá alla myndina</p>

      {/* Tímastýring */}
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
        <div className="flex items-center gap-4 text-xs text-white/60">
          <span className="tabular-nums">{nf1.format(live.temp)} °C</span>
          <span className="tabular-nums">{nf1.format(live.windSpeed)} m/s</span>
          <span className="hidden tabular-nums sm:inline">
            {String(sunrise).padStart(2, "0")}:00–{String(sunset).padStart(2, "0")}:00 sól
          </span>
        </div>
      </div>

      {/* Upplýsingaspjald þegar smellt er á hluta myndarinnar */}
      {info && (
        <div className="mt-4 rounded-2xl border border-volt-400/30 bg-volt-500/8 p-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-lg font-semibold text-white">{info.title}</h3>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs text-white/50 transition hover:text-white"
              aria-label="Loka skýringu"
            >
              Loka ✕
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
      )}
      {!info && (
        <p className="mt-3 text-center text-xs text-white/40">
          Smelltu á hvaða hluta myndarinnar sem er til að sjá hvað hann gerir.
        </p>
      )}

      {/* Stýringar */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/4 p-5">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-volt-300">
            Staður og veður
          </h3>
          <Choice
            label="Staðsetning"
            value={input.siteSlug}
            columns={3}
            options={CLIMATE_SITES.map((s) => ({ value: s.slug, label: s.name }))}
            onChange={(v) => set("siteSlug", v)}
          />
          <Slider
            label="Mánuður"
            value={input.month}
            display={MONTHS[input.month]}
            min={0}
            max={11}
            step={1}
            onChange={(v) => set("month", v)}
            hint={`Raungögn: ${site.db.replace("PVGIS-", "")} 2021–2023`}
          />
          <Slider
            label="Sólskin"
            value={input.sun}
            display={
              input.sun < 0.45 ? "Alskýjað" : input.sun < 0.8 ? "Skýjað" : input.sun < 1.15 ? "Dæmigert" : "Heiðskírt"
            }
            min={0.1}
            max={1.3}
            step={0.05}
            onChange={(v) => set("sun", v)}
            hint="1,0 = meðalveður mánaðarins á þessum stað"
          />
          <Slider
            label="Meðalvindur á staðnum"
            value={input.windMean}
            display={`${nf1.format(input.windMean)} m/s`}
            min={0}
            max={14}
            step={0.5}
            onChange={(v) => set("windMean", v)}
            hint={`Skjólsælt ≈ 4, opið land ≈ 6–8, berangur ≈ 10. Dægursveiflan kemur úr ERA5.`}
          />
          <Choice
            label="Halli sólarsella"
            value={input.tilt}
            columns={4}
            options={TILTS.map((t) => ({
              value: t,
              label: `${t}°`,
              note: t === 15 ? "sumar" : t === 35 ? "jafnt" : t === 60 ? "vetur" : "veggur",
            }))}
            onChange={(v) => set("tilt", v as TiltDeg)}
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
            hint={`≈ ${nf0.format(Math.ceil((input.kwp * 1000) / 455))} sellur × 455 W · ${nf0.format(Math.ceil((input.kwp * 1000) / 455) * 2)} m²`}
          />
          <Slider
            label="Rafgeymar"
            value={input.batteryKwh}
            display={`${nf0.format(input.batteryKwh)} kWst`}
            min={5}
            max={80}
            step={5}
            onChange={(v) => set("batteryKwh", v)}
            hint={`${nf1.format(input.batteryKwh / 10)} × 48 V / 200 Ah banki`}
          />
          <Choice
            label="Áriðill"
            value={input.inverterVa}
            columns={4}
            options={INVERTERS.map((i) => ({ value: i.va, label: `${i.va / 1000} kVA`, note: `${nf1.format(i.contW / 1000)} kW` }))}
            onChange={(v) => set("inverterVa", v as InverterVa)}
          />
          <Choice
            label="Vindmylla"
            value={input.turbineKw}
            columns={4}
            options={[
              { value: 0, label: "Engin" },
              { value: 0.8, label: "0,8 kW" },
              { value: 1.5, label: "1,5 kW" },
              { value: 3, label: "3 kW" },
            ]}
            onChange={(v) => set("turbineKw", v)}
          />
          <Choice
            label="Varaafl"
            value={input.generator ? "rafstod" : input.grid ? "net" : "ekkert"}
            columns={3}
            options={[
              { value: "rafstod", label: "Rafstöð" },
              { value: "net", label: "Netið" },
              { value: "ekkert", label: "Ekkert" },
            ]}
            onChange={(v) => {
              setInput((prev) => ({ ...prev, generator: v === "rafstod", grid: v === "net" }));
              setPreset(null);
            }}
          />
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
            hint={`Toppur dagsins ≈ ${nf1.format(day.peakKw)} kW`}
          />
          <Choice
            label="Dægursveifla"
            value={input.profile}
            columns={3}
            options={LOAD_PROFILE_LABELS.map((p) => ({ value: p.id, label: p.label }))}
            onChange={(v) => set("profile", v as LoadProfile)}
          />
          <Toggle
            label="Rafbíll í hleðslu"
            note={`${nf0.format(input.evKwhPerDay)} kWst á dag ≈ ${nf0.format(input.evKwhPerDay * 5.5)} km`}
            on={input.evEnabled}
            onChange={(v) => set("evEnabled", v)}
          />
          {input.evEnabled && (
            <>
              <Choice
                label="Hvenær hleðst bíllinn?"
                value={input.evMode}
                columns={3}
                options={[
                  { value: "nott", label: "Um nótt" },
                  { value: "kvold", label: "Á kvöldin" },
                  { value: "sol", label: "Með sólinni" },
                ]}
                onChange={(v) => set("evMode", v as EvMode)}
              />
              <Slider
                label="Hleðsluafl"
                value={input.evKw}
                display={`${nf1.format(input.evKw)} kW`}
                min={1.4}
                max={11}
                step={0.1}
                onChange={(v) => set("evKw", v)}
              />
              <Slider
                label="Orka í bílinn"
                value={input.evKwhPerDay}
                display={`${nf0.format(input.evKwhPerDay)} kWst`}
                min={2}
                max={40}
                step={1}
                onChange={(v) => set("evKwhPerDay", v)}
              />
            </>
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
                w.tone === "bad"
                  ? "border-red-400/40 bg-red-500/10 text-red-100"
                  : w.tone === "warn"
                    ? "border-amber-400/40 bg-amber-500/10 text-amber-100"
                    : "border-volt-400/30 bg-volt-500/8 text-volt-100"
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  w.tone === "bad" ? "bg-red-400" : w.tone === "warn" ? "bg-amber-400" : "bg-volt-400"
                }`}
              />
              <span>{w.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tölur dagsins */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Framleitt í dag" value={nf1.format(totalProd)} unit="kWst" />
        <Stat label="Notað í dag" value={nf1.format(totalLoad)} unit="kWst" />
        <Stat
          label="Sjálfbærni"
          value={nf0.format(day.selfSufficiency * 100)}
          unit="%"
          tone={day.selfSufficiency > 0.98 ? "good" : day.selfSufficiency > 0.7 ? "default" : "warn"}
        />
        <Stat
          label="Lægsta hleðsla"
          value={nf0.format(day.minSoc)}
          unit="%"
          tone={day.minSoc <= input.reservePct + 0.5 ? "warn" : "default"}
        />
        <Stat
          label="Umfram orka"
          value={nf1.format(day.curtailedKwh)}
          unit="kWst"
          tone={day.curtailedKwh > totalProd * 0.25 && totalProd > 1 ? "warn" : "default"}
        />
        <Stat
          label={input.grid ? "Af neti" : "Rafstöð"}
          value={input.grid ? nf1.format(day.gridInKwh) : nf1.format(day.genKwh)}
          unit="kWst"
          tone={day.genKwh > 0.05 || day.gridInKwh > 0.05 ? "warn" : "good"}
        />
      </div>

      {/* Ferlar */}
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-sm font-semibold text-white">
              Sólarhringurinn · {MONTHS[input.month].toLowerCase()} í {site.name}
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
                <span className="h-2 w-3 rounded-full border-t border-dashed border-white/70" /> hleðslustaða
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
          <p className="mt-1 text-[11px] text-white/40">Dragðu yfir ferilinn til að færa tímann.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-sm font-semibold text-white">Árið í heild</h3>
            <div className="flex flex-wrap gap-3 text-[11px] text-white/55">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-500" /> framleiðsla
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> notkun
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-600" /> varaafl
              </span>
            </div>
          </div>
          <div className="mt-2">
            <YearChart year={year} month={input.month} onSelect={(m) => set("month", m)} />
          </div>
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
              <div className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                {input.grid ? "Af neti" : "Olía á rafstöð"}
              </div>
              <div className="font-display font-semibold tabular-nums text-white">
                {input.grid
                  ? `${nf0.format(year.genKwh + year.deficitKwh)} `
                  : `${nf0.format(year.genLitres)} `}
                <span className="text-xs font-normal text-white/50">{input.grid ? "kWst" : "l/ári"}</span>
              </div>
            </div>
          </div>
        </div>
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
        Veðurgögnin eru raunveruleg: klukkustundamælingar úr PVGIS 5.3 (JRC, framkvæmdastjórn ESB) fyrir árin
        2021–2023, meðaltöluð í dægursveiflu hvers mánaðar. Sólarframleiðslan miðast við sellur í suður með 14 %
        kerfistöpum, vindurinn við aflferil lítillar myllu og hæðarleiðréttan vindhraða. Hermirinn er til skýringar –
        raunverulegt kerfi er hannað út frá staðháttum, skugga og notkunarmynstri hvers og eins.
      </p>
    </div>
  );
}
