"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getSolarProfiles } from "@/app/actions/solar";
import { defaultLocation, solarLocations } from "@/lib/solar/locations";
import { devices, sumDevices } from "@/lib/solar/devices";
import { DevicePicker } from "./device-picker";
import {
  ASPECTS,
  ASPECT_LABELS,
  BANK_KWH,
  GOALS,
  MONTHS,
  PANEL_AREA_M2,
  PANEL_W,
  computeSizing,
  fmt,
  fmt1,
  rankAspects,
  recommendedTilt,
  type Aspect,
  type Goal,
  type Phase,
  type SolarProfiles,
} from "@/lib/solar/sizing";
import { ArrowRight, Icon } from "@/components/icons";
import { ContactForm } from "@/components/contact-form";

// ---------- Forstillingar ----------

const PRESETS = [
  { id: "cabin", label: "Sumarhús", daily: 6, peak: 3, phase: 1 as Phase },
  { id: "home", label: "Heimili", daily: 15, peak: 6, phase: 3 as Phase },
  { id: "heatpump", label: "Heimili + varmadæla", daily: 32, peak: 9, phase: 3 as Phase },
] as const;

const COLOR_PROD = "#1288ca";
const COLOR_CONS = "#f59e0b";

// PVGIS-átt → áttaviti (0 = norður, réttsælis)
const bearing = (a: Aspect) => (a + 180 + 360) % 360;

// ---------- Aðalhluti ----------

export function SolarSystemCalculator({
  initialDaily,
  initialPeak,
}: {
  /** Upphafsgildi, t.d. úr orkunotkunarreiknivél (?daily=&peak=) */
  initialDaily?: number;
  initialPeak?: number;
} = {}) {
  const [locationId, setLocationId] = useState(defaultLocation.id);
  const [custom, setCustom] = useState({ lat: 64.13, lon: -21.9 });
  const fromQuery = initialDaily != null && initialDaily > 0;
  const [presetId, setPresetId] = useState<string>(fromQuery ? "custom" : "home");
  const [dailyKwhInput, setDailyKwh] = useState(fromQuery ? initialDaily : 15);
  const [peakKwInput, setPeakKw] = useState(fromQuery && initialPeak ? initialPeak : 6);
  // Tækjaval: id → magn, og öryggismörk í %
  const [selectedDevices, setSelectedDevices] = useState<Map<string, number>>(
    () => new Map([["isskapur", 1], ["ljos", 1], ["sjonvarp", 1], ["starlink", 1], ["thvottavel", 1], ["kaffivel", 1]]),
  );
  const [marginPct, setMarginPct] = useState(20);
  const deviceMode = presetId === "devices";
  const deviceTotals = useMemo(() => sumDevices(selectedDevices, marginPct), [selectedDevices, marginPct]);
  // Í tækjaham koma tölurnar úr tækjunum, annars úr reitunum
  const dailyKwh = deviceMode ? deviceTotals.dailyKwh : dailyKwhInput;
  const peakKw = deviceMode ? deviceTotals.peakKw : peakKwInput;
  const [phase, setPhase] = useState<Phase>(3);
  const [tilt, setTilt] = useState(() => recommendedTilt("summer"));
  const [aspect, setAspect] = useState<Aspect>(0);
  const [goal, setGoal] = useState<Goal>("summer");
  const [autonomy, setAutonomy] = useState(2);
  // Handvirk yfirtaka – null = sjálfvirk tillaga
  const [manualKwp, setManualKwp] = useState<number | null>(null);
  const [manualKwh, setManualKwh] = useState<number | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);

  function openQuote() {
    setQuoteOpen(true);
    // Skruna að forminu eftir að það birtist
    setTimeout(() => document.getElementById("tilbod")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  const [profiles, setProfiles] = useState<SolarProfiles | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const cache = useRef(new Map<string, SolarProfiles>());

  const location = solarLocations.find((l) => l.id === locationId) ?? defaultLocation;
  const lat = locationId === "custom" ? custom.lat : location.lat;
  const lon = locationId === "custom" ? custom.lon : location.lon;

  // Sækja geislunargögn (debounce – halli er slider)
  useEffect(() => {
    const key = `${lat.toFixed(2)},${lon.toFixed(2)},${tilt}`;
    const hit = cache.current.get(key);
    const t = setTimeout(
      () => {
        if (hit) {
          setProfiles(hit);
          return;
        }
        startTransition(async () => {
          const r = await getSolarProfiles({ lat, lon, tilt });
          if (r.ok) {
            cache.current.set(key, r.data);
            setProfiles(r.data);
            setError(null);
          } else {
            setError(r.error);
          }
        });
      },
      hit ? 0 : 350,
    );
    return () => clearTimeout(t);
  }, [lat, lon, tilt]);

  const ranking = useMemo(() => (profiles ? rankAspects(profiles, goal) : []), [profiles, goal]);
  const bestOverall = ranking[0];
  // Valin átt – „bestAvailable" heldur nafninu svo niðurstöðuhlutar breytist ekki
  const bestAvailable = ranking.find((r) => r.aspect === aspect) ?? bestOverall;

  const result = useMemo(
    () =>
      profiles && bestAvailable
        ? computeSizing({
            dailyKwh,
            peakKw,
            phase,
            autonomyDays: autonomy,
            goal,
            aspect: bestAvailable.aspect,
            profiles,
            overrideKwp: manualKwp,
            overrideBatteryKwh: manualKwh,
          })
        : null,
    [profiles, bestAvailable, dailyKwh, peakKw, phase, autonomy, goal, manualKwp, manualKwh],
  );

  function applyPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setDailyKwh(p.daily);
    setPeakKw(p.peak);
    setPhase(p.phase);
  }

  function setDeviceQty(id: string, qty: number) {
    setSelectedDevices((prev) => {
      const next = new Map(prev);
      if (qty <= 0) next.delete(id);
      else next.set(id, qty);
      return next;
    });
  }

  /** Fara úr tækjaham yfir í sérsniðið með tölurnar sem tækin gáfu */
  function leaveDeviceMode() {
    setDailyKwh(deviceTotals.dailyKwh);
    setPeakKw(deviceTotals.peakKw);
    setPresetId("custom");
  }

  const summary =
    result && bestAvailable
      ? [
          "Forsendur úr reiknivél (blaorka.is/reiknivelar/solarorkukerfi):",
          `Staður: ${locationId === "custom" ? "eigin hnit" : location.name} (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
          `Notkun: ${fmt1.format(dailyKwh)} kWst/dag, hámark ${fmt1.format(peakKw)} kW, ${phase === 3 ? "þriggja fasa" : "einfasa"}`,
          ...(deviceMode
            ? [
                `Tæki (+${marginPct} % öryggismörk): ${[...selectedDevices]
                  .map(([id, q]) => {
                    const d = devices.find((x) => x.id === id);
                    return d ? `${q > 1 ? `${q}× ` : ""}${d.name}` : "";
                  })
                  .filter(Boolean)
                  .join(", ")}`,
              ]
            : []),
          `Uppsetning: ${tilt}° halli, sellur snúa í ${ASPECT_LABELS[bestAvailable.aspect].long.toLowerCase()}`,
          `Markmið: ${GOALS[goal].label.toLowerCase()}, ${autonomy} ${autonomy === 1 ? "dagur" : "dagar"} án sólar`,
          ...(result.manual.kWp || result.manual.battery
            ? [
                `Handvirkt stillt: ${[
                  result.manual.kWp ? `sólarafl ${fmt1.format(result.kWp)} kWp (tillaga ${fmt1.format(result.recommended.kWp)})` : null,
                  result.manual.battery ? `rafgeymar ${fmt.format(result.battery.kWh)} kWst (tillaga ${fmt.format(result.recommended.kWh)})` : null,
                ]
                  .filter(Boolean)
                  .join(", ")}`,
              ]
            : []),
          "",
          `Tillaga: ${fmt1.format(result.kWp)} kWp (${result.panels} × ${PANEL_W} W), ${result.battery.banks} × ${BANK_KWH} kWst rafgeymabanki, ${result.inverter.count} × ${result.inverter.model}, ${result.mppt.count} × ${result.mppt.model}`,
        ].join("\n")
      : "";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* ================= INNTAK ================= */}
      <div className="space-y-5">
        {/* 1 · Staðsetning */}
        <Step n={1} title="Hvar er kerfið?" hint="Geislunargögn frá PVGIS (JRC) fyrir þennan stað.">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="text-sm font-medium">Staður</span>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className={selectCls}
              >
                {solarLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                    {l.region ? ` – ${l.region}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end text-xs text-ink-900/50">
              <span className="pb-3">
                {lat.toFixed(2)}° N, {Math.abs(lon).toFixed(2)}° V
              </span>
            </div>
          </div>
          {locationId === "custom" && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <NumberField label="Breidd (lat)" value={custom.lat} step={0.01} min={63.2} max={66.6} onChange={(v) => setCustom((c) => ({ ...c, lat: v }))} />
              <NumberField label="Lengd (lon)" value={custom.lon} step={0.01} min={-24.6} max={-13.4} onChange={(v) => setCustom((c) => ({ ...c, lon: v }))} />
            </div>
          )}
        </Step>

        {/* 2 · Notkun */}
        <Step n={2} title="Hvað þarf að keyra?" hint="Veldu tækin þín, forstillingu eða sláðu inn tölur.">
          <div className="flex flex-wrap gap-2">
            <Chip active={deviceMode} onClick={() => setPresetId("devices")}>
              Velja tæki
            </Chip>
            {PRESETS.map((p) => (
              <Chip key={p.id} active={presetId === p.id} onClick={() => applyPreset(p.id)}>
                {p.label}
              </Chip>
            ))}
            <Chip active={presetId === "custom"} onClick={() => (deviceMode ? leaveDeviceMode() : setPresetId("custom"))}>
              Sérsniðið
            </Chip>
          </div>

          {deviceMode && (
            <DevicePicker
              selected={selectedDevices}
              onQty={setDeviceQty}
              marginPct={marginPct}
              onMargin={setMarginPct}
              totals={deviceTotals}
            />
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <NumberField
              label={deviceMode ? "Dagleg notkun (úr tækjum)" : "Dagleg notkun"}
              unit="kWst"
              value={dailyKwh}
              min={0.5}
              max={200}
              step={0.5}
              disabled={deviceMode}
              onChange={(v) => {
                setDailyKwh(v);
                setPresetId("custom");
              }}
            />
            <NumberField
              label={deviceMode ? "Hámarksálag (úr tækjum)" : "Hámarksálag"}
              unit="kW"
              value={peakKw}
              min={0.5}
              max={60}
              step={0.5}
              disabled={deviceMode}
              onChange={(v) => {
                setPeakKw(v);
                setPresetId("custom");
              }}
            />
            <div>
              <span className="text-sm font-medium">Fasar</span>
              <div className="mt-1.5 grid grid-cols-2 overflow-hidden rounded-xl border border-mist-300">
                {([1, 3] as Phase[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    // Fasar breyta ekki notkuninni – halda tækjaham/forstillingu
                    onClick={() => setPhase(p)}
                    className={`h-12 text-sm font-medium transition ${
                      phase === p ? "bg-brand-500 text-white" : "bg-mist-50 text-ink-900/70 hover:bg-white"
                    }`}
                    aria-pressed={phase === p}
                  >
                    {p === 1 ? "Einfasa" : "3 fasa"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Step>

        {/* 3 · Uppsetning */}
        <Step n={3} title="Hvernig snúa sellurnar?" hint="Veldu áttina sem sellurnar snúa í – stjarnan sýnir bestu áttina á staðnum.">
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <Compass
              selected={aspect}
              best={bestOverall?.aspect}
              onSelect={setAspect}
            />
            <div>
              <label className="block">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium">Halli sella</span>
                  <span className="font-display text-lg font-semibold text-brand-600">{tilt}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={1}
                  value={tilt}
                  onChange={(e) => setTilt(Number(e.target.value))}
                  className="mt-2 w-full accent-brand-500"
                  aria-valuetext={`${tilt} gráður`}
                />
                <div className="mt-1 flex justify-between text-[11px] text-ink-900/45">
                  <span>Flatt 0°</span>
                  <span>Veggur 90°</span>
                </div>
              </label>
              <p className="mt-4 text-sm text-ink-900/65">
                Mælt með fyrir {GOALS[goal].label.toLowerCase()}:{" "}
                <button
                  type="button"
                  onClick={() => setTilt(recommendedTilt(goal, profiles?.optimal.tilt))}
                  className="font-semibold text-brand-600 underline-offset-2 hover:underline"
                >
                  {GOALS[goal].tiltRange
                    ? `${GOALS[goal].tiltRange![0]}–${GOALS[goal].tiltRange![1]}°`
                    : `${recommendedTilt(goal, profiles?.optimal.tilt)}°`}
                </button>
                {GOALS[goal].tiltRange
                  ? " – sólin er hátt á lofti á sumrin, því lægri halli."
                  : profiles
                    ? ` – besti halli fyrir árið á þessum stað skv. PVGIS.`
                    : ""}
                {tilt !== recommendedTilt(goal, profiles?.optimal.tilt) && " Smelltu til að nota."}
              </p>
              {bestAvailable && bestOverall && (
                <p className="mt-2 text-sm text-ink-900/65">
                  {bestAvailable.aspect === bestOverall.aspect ? (
                    <>
                      <strong className="text-ink-900">{ASPECT_LABELS[bestAvailable.aspect].long}</strong> er
                      besta áttin hér.
                    </>
                  ) : (
                    <>
                      Sellur í <strong className="text-ink-900">{ASPECT_LABELS[bestAvailable.aspect].long.toLowerCase()}</strong>.{" "}
                      <button
                        type="button"
                        onClick={() => setAspect(bestOverall.aspect)}
                        className="font-semibold text-brand-600 underline-offset-2 hover:underline"
                      >
                        {ASPECT_LABELS[bestOverall.aspect].long}
                      </button>{" "}
                      gæfi{" "}
                      <strong className="text-brand-600">
                        +{fmt.format((bestOverall.target / bestAvailable.target - 1) * 100)} %
                      </strong>
                      .
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </Step>

        {/* 4 · Markmið */}
        <Step n={4} title="Hvað á sólin að dekka?" hint="Kerfið er stærðað svo framleiðsla yfir tímabilið jafngildi notkun – og halli sella stillist með. Á Íslandi borgar sig sjaldan að miða við desember.">
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(GOALS) as Goal[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGoal(g);
                  setTilt(recommendedTilt(g, profiles?.optimal.tilt));
                }}
                aria-pressed={goal === g}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  goal === g
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                    : "border-mist-300 bg-mist-50 hover:bg-white"
                }`}
              >
                <span className="block text-sm font-semibold">{GOALS[g].label}</span>
                <span className="block text-xs text-ink-900/55">{GOALS[g].hint}</span>
              </button>
            ))}
          </div>
          <label className="mt-5 block">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Dagar án sólar (rafgeymar)</span>
              <span className="font-display text-lg font-semibold text-brand-600">
                {autonomy} {autonomy === 1 ? "dagur" : "dagar"}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={autonomy}
              onChange={(e) => setAutonomy(Number(e.target.value))}
              className="mt-2 w-full accent-brand-500"
            />
          </label>
        </Step>
      </div>

      {/* ================= NIÐURSTAÐA ================= */}
      <div className="space-y-5">
        <ResultHero result={result} pending={pending} error={error} aspect={bestAvailable?.aspect} onQuote={openQuote} />

        {result && (
          <>
            <FineTune
              result={result}
              manualKwp={manualKwp}
              manualKwh={manualKwh}
              onKwp={setManualKwp}
              onKwh={setManualKwh}
            />
            <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
              <MonthlyChart result={result} goal={goal} />
            </div>

            <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
              <OrientationRanking
                ranking={ranking}
                selected={aspect}
                goal={goal}
                onSelect={setAspect}
              />
            </div>

            <EquipmentList result={result} summary={summary} open={quoteOpen} onToggle={() => setQuoteOpen((o) => !o)} />

            {profiles && (
              <p className="px-2 text-xs leading-relaxed text-ink-900/45">
                Gögn: {profiles.db} (PVGIS 5.3, JRC). Forsendur: 14 % kerfistap, {PANEL_W} W sellur,{" "}
                {BANK_KWH} kWst Bláorku LiFePO4 bankar, 80 % afhleðsludýpt. Niðurstöður eru leiðbeinandi –
                skuggar, snjór og staðbundið veður hafa áhrif. Við förum yfir tillöguna með þér.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Inntakshlutar ----------

const selectCls =
  "mt-1.5 h-12 w-full appearance-none rounded-xl border border-mist-300 bg-mist-50 px-4 text-sm text-ink-900 outline-none focus:border-brand-500 focus:bg-white";

function Step({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
      <div className="flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-sm font-semibold text-white">
          {n}
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold leading-tight">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-ink-900/55">{hint}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 rounded-full border px-4 text-sm font-medium transition ${
        active
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-mist-300 bg-mist-50 text-ink-900/75 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function NumberField({
  label,
  unit,
  value,
  min,
  max,
  step,
  disabled = false,
  onChange,
}: {
  label: string;
  unit?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative mt-1.5">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) onChange(v);
          }}
          className="h-12 w-full rounded-xl border border-mist-300 bg-mist-50 px-4 pr-14 text-sm text-ink-900 outline-none focus:border-brand-500 focus:bg-white disabled:cursor-not-allowed disabled:bg-brand-50/60 disabled:font-semibold disabled:text-brand-800"
        />
        {unit && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium text-ink-900/45">
            {unit}
          </span>
        )}
      </div>
    </label>
  );
}

/** Áttaviti með 8 áttum – ein átt valin í einu. */
function Compass({
  selected,
  best,
  onSelect,
}: {
  selected: Aspect;
  best?: Aspect;
  onSelect: (a: Aspect) => void;
}) {
  const size = 232;
  const r = 90;
  const c = size / 2;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} role="radiogroup" aria-label="Átt sólarsella">
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#dfe7ef" strokeWidth="1.5" />
        <circle cx={c} cy={c} r={r - 22} fill="none" stroke="#eef3f8" strokeWidth="1" strokeDasharray="3 5" />
        {/* Sólarbogi – suðurhelmingur */}
        <path
          d={`M ${c - r} ${c} A ${r} ${r} 0 0 0 ${c + r} ${c}`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.45"
        />
        <g transform={`translate(${c},${c})`}>
          <rect x="-16" y="-14" width="32" height="28" rx="6" fill="#071423" />
          <path d="M-10 -4 L0 -12 L10 -4" fill="none" stroke="#4bd8ec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text y="9" textAnchor="middle" fontSize="8" fill="white" fontFamily="var(--font-inter)">
            ÞAK
          </text>
        </g>
      </svg>
      {ASPECTS.map((a) => {
        const b = (bearing(a) * Math.PI) / 180;
        const x = c + r * Math.sin(b);
        const y = c - r * Math.cos(b);
        const on = selected === a;
        const isBest = best === a;
        return (
          <button
            key={a}
            type="button"
            role="radio"
            onClick={() => onSelect(a)}
            aria-checked={on}
            title={`${ASPECT_LABELS[a].long}${isBest ? " – besta átt" : ""}`}
            style={{ left: x, top: y }}
            className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-semibold transition ${
              on
                ? "bg-brand-500 text-white ring-4 ring-volt-400/40 shadow-glow"
                : "border border-mist-300 bg-white text-ink-900/60 hover:border-brand-400 hover:text-brand-600"
            }`}
          >
            {ASPECT_LABELS[a].short}
            {isBest && (
              <span
                className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                  on ? "bg-volt-400 text-ink-900" : "bg-amber-400 text-ink-900"
                }`}
                aria-hidden="true"
              >
                ★
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Niðurstöðuhlutar ----------

type Result = NonNullable<ReturnType<typeof computeSizing>>;

function ResultHero({
  result,
  pending,
  error,
  aspect,
  onQuote,
}: {
  result: Result | null;
  pending: boolean;
  error: string | null;
  aspect?: Aspect;
  onQuote: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-6 text-white sm:p-8">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/30 blur-[80px]" />
      <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-volt-500/15 blur-[80px]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-volt-400">
            <span className="h-px w-6 bg-current opacity-60" />
            Tillaga að kerfi
          </p>
          <span
            className={`inline-flex items-center gap-2 text-xs ${pending ? "text-volt-300" : "text-white/40"}`}
            aria-live="polite"
          >
            <span className={`h-2 w-2 rounded-full ${pending ? "animate-pulse bg-volt-400" : "bg-white/30"}`} />
            {pending ? "Sæki geislunargögn…" : aspect !== undefined ? `Sellur snúa í ${ASPECT_LABELS[aspect].long.toLowerCase()}` : ""}
          </span>
        </div>

        {error && !result && (
          <p className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
            {error}
          </p>
        )}

        {!result && !error && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        )}

        {result && (
          <div className={`mt-6 grid grid-cols-2 gap-3 transition-opacity ${pending ? "opacity-60" : ""}`}>
            <Stat
              icon="panel"
              label={result.manual.kWp ? "Sólarsellur · handvirkt" : "Sólarsellur"}
              value={`${fmt1.format(result.kWp)} kWp`}
              sub={`${result.panels} × ${PANEL_W} W · ≈ ${fmt.format(result.panels * PANEL_AREA_M2)} m²`}
            />
            <Stat
              icon="battery"
              label={result.manual.battery ? "Rafgeymabanki · handvirkt" : "Rafgeymabanki"}
              value={`${fmt.format(result.battery.kWh)} kWst`}
              sub={`${result.battery.banks} × ${BANK_KWH} kWst · dugar ${fmt1.format(result.battery.autonomyDays)} daga`}
            />
            <Stat
              icon="wave"
              label="Áriðill"
              value={`${fmt.format(result.inverter.totalKva)} kVA`}
              sub={`${result.inverter.count} × ${result.inverter.model}`}
            />
            <Stat
              icon="sun"
              label="Sólin dekkar"
              value={`${fmt.format(result.solarShare * 100)} %`}
              sub={`ársnotkunar · ${result.monthsCovered} mán. að fullu`}
              accent
            />
          </div>
        )}

        {result && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onQuote}
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_rgb(18_136_202/0.8)] transition hover:bg-brand-400"
            >
              Fá tilboð með þessum forsendum
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <span className="text-xs text-white/50">Forsendurnar fylgja með fyrirspurninni</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: "panel" | "battery" | "wave" | "sun";
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

/** Handvirk stilling á sólarafli og rafgeymarýmd – yfirtekur sjálfvirku tillöguna. */
function FineTune({
  result,
  manualKwp,
  manualKwh,
  onKwp,
  onKwh,
}: {
  result: Result;
  manualKwp: number | null;
  manualKwh: number | null;
  onKwp: (v: number | null) => void;
  onKwh: (v: number | null) => void;
}) {
  const kwpStep = PANEL_W / 1000;
  const kwpMax = Math.max(30, Math.ceil(result.recommended.kWp * 2));
  const kwhMax = Math.max(100, result.recommended.kWh * 2);
  const kwpDiff = result.kWp - result.recommended.kWp;
  const kwhDiff = result.battery.kWh - result.recommended.kWh;

  return (
    <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Fínstilla kerfið</h3>
          <p className="mt-0.5 text-sm text-ink-900/55">
            Dragðu til að prófa stærra eða minna kerfi – grafið og búnaðarlistinn uppfærast.
          </p>
        </div>
        {(manualKwp !== null || manualKwh !== null) && (
          <button
            type="button"
            onClick={() => {
              onKwp(null);
              onKwh(null);
            }}
            className="shrink-0 text-xs font-semibold text-brand-600 hover:underline"
          >
            Aftur í tillögu
          </button>
        )}
      </div>

      <div className="mt-6 space-y-6">
        <TuneRow
          icon="panel"
          label="Sólarafl"
          value={`${fmt1.format(result.kWp)} kWp`}
          sub={`${result.panels} sellur × ${PANEL_W} W · ≈ ${fmt.format(result.panels * PANEL_AREA_M2)} m² þakflötur`}
          manual={result.manual.kWp}
          diff={kwpDiff === 0 ? null : `${kwpDiff > 0 ? "+" : "−"}${fmt1.format(Math.abs(kwpDiff))} kWp miðað við tillögu (${fmt1.format(result.recommended.kWp)} kWp)`}
          onReset={() => onKwp(null)}
        >
          <input
            type="range"
            min={kwpStep}
            max={kwpMax}
            step={kwpStep}
            value={result.kWp}
            onChange={(e) => onKwp(Number(e.target.value))}
            className="mt-3 w-full accent-brand-500"
            aria-label="Sólarafl í kWp"
          />
          <Ticks left={`${kwpStep} kWp`} mid={`Tillaga ${fmt1.format(result.recommended.kWp)}`} right={`${kwpMax} kWp`} midPct={(result.recommended.kWp / kwpMax) * 100} />
        </TuneRow>

        <TuneRow
          icon="battery"
          label="Rafgeymarýmd"
          value={`${fmt.format(result.battery.kWh)} kWst`}
          sub={`${result.battery.banks} × ${BANK_KWH} kWst · ${fmt.format(result.battery.usableKwh)} kWst nýtanleg · dugar ${fmt1.format(result.battery.autonomyDays)} daga án sólar`}
          manual={result.manual.battery}
          diff={kwhDiff === 0 ? null : `${kwhDiff > 0 ? "+" : "−"}${fmt.format(Math.abs(kwhDiff))} kWst miðað við tillögu (${fmt.format(result.recommended.kWh)} kWst)`}
          onReset={() => onKwh(null)}
        >
          <input
            type="range"
            min={BANK_KWH}
            max={kwhMax}
            step={BANK_KWH}
            value={result.battery.kWh}
            onChange={(e) => onKwh(Number(e.target.value))}
            className="mt-3 w-full accent-brand-500"
            aria-label="Rafgeymarýmd í kWst"
          />
          <Ticks left={`${BANK_KWH} kWst`} mid={`Tillaga ${fmt.format(result.recommended.kWh)}`} right={`${kwhMax} kWst`} midPct={(result.recommended.kWh / kwhMax) * 100} />
        </TuneRow>
      </div>
    </div>
  );
}

function TuneRow({
  icon,
  label,
  value,
  sub,
  manual,
  diff,
  onReset,
  children,
}: {
  icon: "panel" | "battery";
  label: string;
  value: string;
  sub: string;
  manual: boolean;
  diff: string | null;
  onReset: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-2">
          <Icon name={icon} className="h-4 w-4 text-brand-500" />
          <span className="text-sm font-medium">{label}</span>
          {manual ? (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 hover:bg-amber-200"
              title="Fara aftur í sjálfvirka tillögu"
            >
              Handvirkt · endurstilla
            </button>
          ) : (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
              Sjálfvirkt
            </span>
          )}
        </div>
        <span className="font-display text-xl font-semibold text-ink-900">{value}</span>
      </div>
      {children}
      <p className="mt-2 text-xs text-ink-900/55">{sub}</p>
      {diff && <p className="mt-1 text-xs font-medium text-amber-700">{diff}</p>}
    </div>
  );
}

function Ticks({ left, mid, right, midPct }: { left: string; mid: string; right: string; midPct: number }) {
  return (
    <div className="relative mt-1 h-4 text-[11px] text-ink-900/45">
      <span className="absolute left-0">{left}</span>
      <span
        className="absolute -translate-x-1/2 whitespace-nowrap text-brand-600"
        style={{ left: `${Math.min(88, Math.max(12, midPct))}%` }}
      >
        ▲ {mid}
      </span>
      <span className="absolute right-0">{right}</span>
    </div>
  );
}

/** Súlur = framleiðsla, lína = notkun. Einn ás, tooltip á mánuð, tafla til vara. */
function MonthlyChart({ result, goal }: { result: Result; goal: Goal }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const W = 640;
  const H = 260;
  const padL = 44;
  const padR = 12;
  const padT = 18;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const rawMax = Math.max(...result.production, ...result.consumption) * 1.08 || 1;
  const step = [25, 50, 100, 200, 250, 500, 1000, 2000, 5000].find((st) => rawMax / st <= 4) ?? 10000;
  const max = Math.ceil(rawMax / step) * step;
  const y = (v: number) => padT + innerH - (v / max) * innerH;
  const slot = innerW / 12;
  const barW = slot * 0.56;
  const ticks = 4;
  const targetMonths = new Set(GOALS[goal].months);
  const peakIdx = result.production.indexOf(Math.max(...result.production));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">Framleiðsla og notkun á mánuði</h3>
          <p className="mt-0.5 text-sm text-ink-900/55">
            kWst · {fmt.format(result.annualProduction)} kWst framleitt á ári, {fmt.format(result.annualConsumption)} notað
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTable((t) => !t)}
          className="text-xs font-semibold text-brand-600 hover:underline"
        >
          {table ? "Sýna graf" : "Sýna töflu"}
        </button>
      </div>

      {/* Legend */}
      <ul className="mt-4 flex flex-wrap gap-4 text-xs text-ink-900/70">
        <li className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ background: COLOR_PROD }} /> Framleiðsla sólar
        </li>
        <li className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 rounded" style={{ background: COLOR_CONS }} />
          <span className="-ml-3 h-2 w-2 rounded-full" style={{ background: COLOR_CONS }} /> Notkun
        </li>
        <li className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-brand-100" /> Markmiðstímabil
        </li>
      </ul>

      {table ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ink-900/50">
                <th className="py-2 pr-3 font-medium">Mán.</th>
                <th className="py-2 pr-3 text-right font-medium">Framleiðsla</th>
                <th className="py-2 pr-3 text-right font-medium">Notkun</th>
                <th className="py-2 text-right font-medium">Dekkað</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((m, i) => (
                <tr key={m} className="border-t border-mist-200">
                  <td className="py-2 pr-3 font-medium">{m}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{fmt.format(result.production[i])}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{fmt.format(result.consumption[i])}</td>
                  <td className="py-2 text-right tabular-nums">{fmt.format(result.coverage[i] * 100)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Mánaðarleg framleiðsla sólar og notkun">
            {/* Markmiðstímabil */}
            {MONTHS.map((_, i) =>
              targetMonths.has(i) ? (
                <rect key={`t${i}`} x={padL + i * slot} y={padT} width={slot} height={innerH} fill="#d0e9f7" opacity="0.45" />
              ) : null,
            )}
            {/* Grid */}
            {Array.from({ length: ticks + 1 }).map((_, i) => {
              const v = (max / ticks) * i;
              return (
                <g key={i}>
                  <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="#dfe7ef" strokeWidth="1" />
                  <text x={padL - 8} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#6b7a8a">
                    {fmt.format(v)}
                  </text>
                </g>
              );
            })}
            {/* Súlur */}
            {result.production.map((p, i) => {
              const x = padL + i * slot + (slot - barW) / 2;
              const top = y(p);
              const h = Math.max(0, padT + innerH - top);
              const rr = Math.min(4, h);
              return (
                <path
                  key={i}
                  d={`M${x} ${padT + innerH} V${top + rr} a${rr} ${rr} 0 0 1 ${rr} -${rr} h${barW - 2 * rr} a${rr} ${rr} 0 0 1 ${rr} ${rr} V${padT + innerH} Z`}
                  fill={COLOR_PROD}
                  opacity={hover === null || hover === i ? 1 : 0.55}
                />
              );
            })}
            {/* Notkun – lína + punktar */}
            <polyline
              points={result.consumption.map((c, i) => `${padL + i * slot + slot / 2},${y(c)}`).join(" ")}
              fill="none"
              stroke={COLOR_CONS}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {result.consumption.map((c, i) => (
              <circle
                key={i}
                cx={padL + i * slot + slot / 2}
                cy={y(c)}
                r={hover === i ? 5 : 4}
                fill={COLOR_CONS}
                stroke="white"
                strokeWidth="2"
              />
            ))}
            {/* Bein merking á hæstu súlu */}
            <text
              x={padL + peakIdx * slot + slot / 2}
              y={y(result.production[peakIdx]) - 6}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#0f172a"
            >
              {fmt.format(result.production[peakIdx])}
            </text>
            {/* Mánaðarheiti */}
            {MONTHS.map((m, i) => (
              <text key={m} x={padL + i * slot + slot / 2} y={H - 10} textAnchor="middle" fontSize="11" fill="#6b7a8a">
                {m}
              </text>
            ))}
            {/* Hover-svæði */}
            {MONTHS.map((_, i) => (
              <rect
                key={`h${i}`}
                x={padL + i * slot}
                y={padT}
                width={slot}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${MONTHS[i]}: framleiðsla ${fmt.format(result.production[i])} kWst, notkun ${fmt.format(result.consumption[i])} kWst`}
              />
            ))}
          </svg>
          {hover !== null && (
            <div
              className="pointer-events-none absolute top-2 z-10 w-40 -translate-x-1/2 rounded-xl border border-mist-200 bg-white p-3 text-xs shadow-card"
              style={{ left: `${((padL + hover * slot + slot / 2) / W) * 100}%` }}
            >
              <p className="font-semibold capitalize">{MONTHS[hover]}</p>
              <p className="mt-1 flex justify-between">
                <span className="text-ink-900/60">Framleiðsla</span>
                <span className="font-semibold tabular-nums">{fmt.format(result.production[hover])} kWst</span>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-900/60">Notkun</span>
                <span className="font-semibold tabular-nums">{fmt.format(result.consumption[hover])} kWst</span>
              </p>
              <p className="mt-1 flex justify-between border-t border-mist-200 pt-1">
                <span className="text-ink-900/60">Dekkað</span>
                <span className={`font-semibold ${result.coverage[hover] >= 0.999 ? "text-brand-600" : "text-amber-600"}`}>
                  {fmt.format(result.coverage[hover] * 100)} %
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Note tone="good">
          Umframorka: <strong>{fmt.format(result.surplusKwh)} kWst</strong> á ári – nýtist í rafbíl, heitan pott
          eða hitun.
        </Note>
        <Note tone="warn">
          Vantar: <strong>{fmt.format(result.deficitKwh)} kWst</strong> á ári – frá rafstöð, vindmyllu eða neti,
          mest yfir veturinn.
        </Note>
      </div>
    </div>
  );
}

function Note({ tone, children }: { tone: "good" | "warn"; children: React.ReactNode }) {
  return (
    <p
      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        tone === "good" ? "bg-brand-50 text-brand-900" : "bg-amber-50 text-amber-900"
      }`}
    >
      {children}
    </p>
  );
}

function OrientationRanking({
  ranking,
  selected,
  goal,
  onSelect,
}: {
  ranking: ReturnType<typeof rankAspects>;
  selected: Aspect;
  goal: Goal;
  onSelect: (a: Aspect) => void;
}) {
  const max = ranking[0]?.target || 1;
  return (
    <div>
      <h3 className="font-display text-lg font-semibold">Áttir í samanburði</h3>
      <p className="mt-0.5 text-sm text-ink-900/55">
        kWst á hvert kWp yfir {GOALS[goal].label.toLowerCase()} · smelltu til að skipta um átt
      </p>
      <ol className="mt-5 space-y-2.5">
        {ranking.map((r, i) => {
          const on = selected === r.aspect;
          return (
            <li key={r.aspect}>
              <button
                type="button"
                onClick={() => onSelect(r.aspect)}
                aria-pressed={on}
                className="grid w-full grid-cols-[2.5rem_1fr_4.5rem] items-center gap-3 rounded-lg text-left text-sm transition hover:bg-mist-50"
              >
                <span className={`font-semibold ${on ? "text-ink-900" : "text-ink-900/45"}`}>
                  {ASPECT_LABELS[r.aspect].short}
                </span>
                <div className="relative h-5 overflow-hidden rounded-md bg-mist-100">
                  <div
                    className={`h-full rounded-md transition-all ${on ? "bg-brand-500" : "bg-mist-300"}`}
                    style={{ width: `${(r.target / max) * 100}%` }}
                  />
                  {on && (
                    <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-semibold uppercase tracking-wider text-white">
                      Valin
                    </span>
                  )}
                  {i === 0 && !on && (
                    <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-semibold uppercase tracking-wider text-ink-900/60">
                      ★ Best á staðnum
                    </span>
                  )}
                </div>
                <span className={`text-right tabular-nums ${on ? "font-semibold" : "text-ink-900/45"}`}>
                  {fmt.format(r.target)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function EquipmentList({
  result,
  summary,
  open,
  onToggle,
}: {
  result: Result;
  summary: string;
  open: boolean;
  onToggle: () => void;
}) {
  const rows = [
    [`${result.panels} ×`, `${PANEL_W} W sólarsellur (1762 × 1134 mm)`, `${fmt1.format(result.kWp)} kWp · ${fmt.format(result.panels * PANEL_AREA_M2)} m²`],
    [`${result.mppt.count} ×`, result.mppt.model, "sólarsellustýring"],
    [`${result.battery.banks} ×`, `Bláorku 48 V 200 Ah LiFePO4`, `${fmt.format(result.battery.kWh)} kWst`],
    [`${result.inverter.count} ×`, result.inverter.model, `${fmt.format(result.inverter.totalKva)} kVA`],
    ["1 ×", "Cerbo GX + Touch skjár", "stýring"],
    ["1 ×", "Lynx Distributor", "DC-skinna"],
  ];
  return (
    <div id="tilbod" className="scroll-mt-24 overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-card">
      <div className="p-6 sm:p-7">
        <h3 className="font-display text-lg font-semibold">Búnaðarlisti</h3>
        <ul className="mt-4 divide-y divide-mist-200">
          {rows.map(([n, name, note]) => (
            <li key={name} className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-3 py-2.5 text-sm">
              <span className="font-display font-semibold text-brand-600">{n}</span>
              <span className="font-medium">{name}</span>
              <span className="text-xs text-ink-900/50">{note}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onToggle}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_rgb(18_136_202/0.8)] transition hover:bg-brand-400"
          aria-expanded={open}
        >
          {open ? "Loka" : "Fá tilboð með þessum forsendum"}
        </button>
      </div>
      {open && (
        <div className="border-t border-mist-200 bg-mist-50 p-6 sm:p-7">
          <ContactForm
            key={summary}
            variant="compact"
            title="Tilboð í þetta kerfi"
            intro="Forsendurnar úr reiknivélinni fylgja með – bættu við því sem þú vilt."
            subject="Tilboð – sólarorkukerfi úr reiknivél"
            projectType="Sólarorkukerfi (reiknivél)"
            reference="reiknivel:solarorkukerfi"
            defaultMessage={summary}
            className="relative"
          />
        </div>
      )}
    </div>
  );
}
