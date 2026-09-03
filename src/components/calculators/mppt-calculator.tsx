"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_FLOAT,
  START_MARGIN_V,
  SYSTEM_VOLTAGES,
  evaluateAll,
  voltageCurve,
  type ControllerResult,
  type MpptInput,
  type PanelSpec,
  type SystemVoltage,
} from "@/lib/mppt/calc";
import { panelPresets } from "@/lib/mppt/panels";
import { site } from "@/content/site";
import { Icon, ExternalArrow } from "@/components/icons";
import { ContactForm } from "@/components/contact-form";
import { formatIs } from "@/lib/format";

const f0 = (n: number) => formatIs(n, 0);
const f1 = (n: number) => formatIs(n, 1);
const f2 = (n: number) => formatIs(n, 2);

export function MpptCalculator() {
  const [presetId, setPresetId] = useState<string>(panelPresets[0].id);
  const [panel, setPanel] = useState<PanelSpec>(panelPresets[0]);
  const [series, setSeries] = useState(3);
  const [strings, setStrings] = useState(2);
  const [systemVoltage, setSystemVoltage] = useState<SystemVoltage>(48);
  const [floatVoltage, setFloatVoltage] = useState<number>(DEFAULT_FLOAT[48]);
  const [tMin, setTMin] = useState(-25);
  const [tMax, setTMax] = useState(60);
  const [allowOversized, setAllowOversized] = useState(true);
  const [requireBluetooth, setRequireBluetooth] = useState(false);
  const [requireVeCan, setRequireVeCan] = useState(false);
  const [requireMc4, setRequireMc4] = useState(false);
  const [includeCombos, setIncludeCombos] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);

  function openQuote() {
    setQuoteOpen(true);
    setTimeout(() => document.getElementById("tilbod")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  const input: MpptInput = useMemo(
    () => ({
      panel,
      series,
      strings,
      systemVoltage,
      floatVoltage,
      tMin,
      tMax,
      allowOversized,
      requireBluetooth,
      requireVeCan,
      requireMc4,
      includeCombos,
    }),
    [panel, series, strings, systemVoltage, floatVoltage, tMin, tMax, allowOversized, requireBluetooth, requireVeCan, requireMc4, includeCombos],
  );

  const { array, results } = useMemo(() => evaluateAll(input), [input]);
  const passing = results.filter((r) => r.status !== "fail");
  const failing = results.filter((r) => r.status === "fail");
  const selected = results.find((r) => r.controller.id === selectedId) ?? passing[0] ?? null;

  function choosePreset(id: string) {
    setPresetId(id);
    const p = panelPresets.find((x) => x.id === id);
    if (p) setPanel(p);
  }
  function setPanelField<K extends keyof PanelSpec>(k: K, v: PanelSpec[K]) {
    setPresetId("custom");
    setPanel((p) => ({ ...p, [k]: v, name: "Eigin sella" }));
  }
  function chooseVoltage(v: SystemVoltage) {
    setSystemVoltage(v);
    setFloatVoltage(DEFAULT_FLOAT[v]);
  }

  const summary = [
    "Forsendur úr MPPT-reiknivél (blaorka.is/reiknivelar/mppt):",
    `Sella: ${panel.name} – ${panel.pmax} W, Voc ${panel.voc} V, Vmp ${panel.vmp} V, Isc ${panel.isc} A`,
    `Uppröðun: ${series} í röð × ${strings} ${strings === 1 ? "strengur" : "strengir"} = ${array.panels} sellur, ${f2(array.kWp)} kWp`,
    `Kerfi: ${systemVoltage} V, float ${f1(floatVoltage)} V, hitastig ${tMin} … ${tMax} °C`,
    `Voc í kulda ${f1(array.vocCold)} V · Vmp í hita ${f1(array.vmpHot)} V · Isc í hita ${f1(array.iscTotalHot)} A`,
    "",
    selected
      ? `Valin stýring: ${selected.controller.type} (${selected.status === "oversized" ? "yfirstærð PV" : "passar"}), hleðslustraumur allt að ${f0(selected.chargeCurrentCold)} A`
      : "Engin stýring passar þessari uppröðun.",
  ].join("\n");

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* ================= INNTAK ================= */}
      <div className="space-y-5">
        <Step n={1} title="Sólarsellan" hint="Veldu dæmigerða sellu eða sláðu inn gildi af gagnablaðinu.">
          <select value={presetId} onChange={(e) => choosePreset(e.target.value)} className={selectCls}>
            {panelPresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} – {p.note}
              </option>
            ))}
            <option value="custom">Eigin gildi…</option>
          </select>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Num label="Pmax" unit="W" value={panel.pmax} step={5} onChange={(v) => setPanelField("pmax", v)} />
            <Num label="Voc" unit="V" value={panel.voc} step={0.1} onChange={(v) => setPanelField("voc", v)} />
            <Num label="Vmp" unit="V" value={panel.vmp} step={0.1} onChange={(v) => setPanelField("vmp", v)} />
            <Num label="Isc" unit="A" value={panel.isc} step={0.1} onChange={(v) => setPanelField("isc", v)} />
            <Num label="Imp" unit="A" value={panel.imp} step={0.1} onChange={(v) => setPanelField("imp", v)} />
            <Num label="Hitast. Voc" unit="%/°C" value={panel.tcVoc} step={0.01} onChange={(v) => setPanelField("tcVoc", v)} />
            <Num label="Hitast. Isc" unit="%/°C" value={panel.tcIsc} step={0.001} onChange={(v) => setPanelField("tcIsc", v)} />
            <Num label="Hitast. Pmax" unit="%/°C" value={panel.tcPmax} step={0.01} onChange={(v) => setPanelField("tcPmax", v)} />
          </div>
        </Step>

        <Step n={2} title="Uppröðun sella" hint="Í röð hækkar spennu, í hlið hækkar straum.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Stepper label="Sellur í röð (í streng)" value={series} min={1} max={30} onChange={setSeries} />
            <Stepper label="Strengir í hlið" value={strings} min={1} max={12} onChange={setStrings} />
          </div>
          <ArrayDiagram series={series} strings={strings} />
          <p className="mt-3 text-sm text-ink-900/65">
            <strong className="text-ink-900">{array.panels} sellur</strong> · {f2(array.kWp)} kWp · Voc {f1(array.vocStc)} V
            og Imp {f1(array.impStc)} A við STC
          </p>
        </Step>

        <Step n={3} title="Rafgeymakerfið" hint="Float-spennan ræður lágmarksspennu sem PV þarf að ná í hita.">
          <div className="grid grid-cols-4 overflow-hidden rounded-xl border border-mist-300">
            {SYSTEM_VOLTAGES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => chooseVoltage(v)}
                aria-pressed={systemVoltage === v}
                className={`h-12 text-sm font-medium transition ${
                  systemVoltage === v ? "bg-brand-500 text-white" : "bg-mist-50 text-ink-900/70 hover:bg-white"
                }`}
              >
                {v} V
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Num label="Float-spenna" unit="V" value={floatVoltage} step={0.1} onChange={setFloatVoltage} hint="LiFePO4 sjálfgefið" />
            <Num label="Lægsta hitastig" unit="°C" value={tMin} step={1} onChange={setTMin} hint="Sellur í frosti" />
            <Num label="Hæsta hitastig" unit="°C" value={tMax} step={1} onChange={setTMax} hint="Sellur í sól" />
          </div>
        </Step>

        <Step n={4} title="Kröfur til stýringar">
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="Leyfa yfirstærð PV" hint="Meira PV-afl en nafnafl stýringar" checked={allowOversized} onChange={setAllowOversized} />
            <Toggle label="Bluetooth (SmartSolar)" hint="Stilla og fylgjast með í VictronConnect" checked={requireBluetooth} onChange={setRequireBluetooth} />
            <Toggle label="VE.Can" hint="Tengist Cerbo GX með kapli" checked={requireVeCan} onChange={setRequireVeCan} />
            <Toggle label="MC4 tengi" hint="Í stað skrúfutengja" checked={requireMc4} onChange={setRequireMc4} />
            <Toggle label="Sýna samsett tæki" hint="EasySolar, Inverter RS, Multi RS" checked={includeCombos} onChange={setIncludeCombos} />
          </div>
        </Step>
      </div>

      {/* ================= NIÐURSTAÐA ================= */}
      <div className="space-y-5">
        {/* Yfirlit strengs */}
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-6 text-white sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/30 blur-[80px]" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-volt-400">
              <span className="h-px w-6 bg-current opacity-60" />
              Strengurinn þinn
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label={`Voc við ${tMin} °C`} value={`${f1(array.vocCold)} V`} sub="hámark í kulda" />
              <Stat label={`Vmp við ${tMax} °C`} value={`${f1(array.vmpHot)} V`} sub={`þarf ≥ ${f1(floatVoltage + START_MARGIN_V)} V`} />
              <Stat label={`Isc við ${tMax} °C`} value={`${f1(array.iscTotalHot)} A`} sub={strings > 1 ? `${f1(array.iscStringHot)} A per streng` : "einn strengur"} />
              <Stat label="Afl" value={`${f2(array.kWp)} kWp`} sub={`${array.panels} × ${panel.pmax} W`} accent />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-white/50">
                {passing.length} af {results.length} stýringum passa
                {failing.length > 0 && ` · ${failing.length} falla á reglum`}
              </p>
              <button
                type="button"
                onClick={openQuote}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_rgb(18_136_202/0.8)] transition hover:bg-brand-400"
              >
                <Icon name="bolt" className="h-4 w-4" />
                Fá tilboð
              </button>
            </div>
          </div>
        </div>

        {/* Listi stýringa */}
        <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Stýringar sem passa</h3>
              <p className="mt-0.5 text-sm text-ink-900/55">Best nýttar efst. Smelltu á stýringu til að sjá athuganir og spennugraf.</p>
            </div>
          </div>

          {passing.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              <p className="font-semibold">Engin stýring passar þessari uppröðun.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {suggestions(results, input).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="mt-5 space-y-2">
              {passing.map((r) => (
                <ControllerRow
                  key={r.controller.id}
                  r={r}
                  selected={selected?.controller.id === r.controller.id}
                  onSelect={() => setSelectedId(r.controller.id)}
                />
              ))}
            </ul>
          )}

          {failing.length > 0 && (
            <div className="mt-5 border-t border-mist-200 pt-4">
              <button
                type="button"
                onClick={() => setShowFailed((s) => !s)}
                className="text-xs font-semibold text-ink-900/60 hover:text-brand-600"
                aria-expanded={showFailed}
              >
                {showFailed ? "Fela" : "Sýna"} {failing.length} stýringar sem falla
              </button>
              {showFailed && (
                <ul className="mt-3 space-y-2">
                  {failing.map((r) => (
                    <ControllerRow
                      key={r.controller.id}
                      r={r}
                      selected={selected?.controller.id === r.controller.id}
                      onSelect={() => setSelectedId(r.controller.id)}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Nánar um valda stýringu */}
        {selected && (
          <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Athuganir</p>
                <h3 className="mt-1 font-display text-xl font-semibold">{selected.controller.type}</h3>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <ul className="mt-5 divide-y divide-mist-200">
              {selected.checks.map((ch) => (
                <li key={ch.key} className="flex gap-3 py-3">
                  <CheckIcon status={ch.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <span className="text-sm font-medium">{ch.label}</span>
                      <span className="text-sm tabular-nums text-ink-900/70">{ch.detail}</span>
                    </div>
                    {ch.hint && <p className={`mt-1 text-xs ${ch.status === "fail" ? "text-red-600" : "text-amber-700"}`}>{ch.hint}</p>}
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Mini label="Nafnafl" value={`${f0(selected.nominalPower)} W`} />
              <Mini label="Nýtanlegt PV-afl" value={`${f0(selected.usablePower)} W`} />
              <Mini label={`Hleðslustr. ${tMin} °C`} value={`${f0(selected.chargeCurrentCold)} A`} />
              <Mini label={`Hleðslustr. ${tMax} °C`} value={`${f0(selected.chargeCurrentHot)} A`} />
            </dl>

            <div className="mt-6">
              <VoltageChart input={input} vocMax={selected.controller.voc_max} vmpMin={Math.max(floatVoltage + START_MARGIN_V, selected.controller.vmpp_min)} />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`${site.url}/?s=${encodeURIComponent(selected.controller.type)}&post_type=product`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-400"
              >
                Skoða í vefverslun <ExternalArrow className="h-4 w-4" />
              </a>
              <a
                href={selected.controller.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-ink-900/15 px-5 text-sm font-semibold text-ink-900 hover:border-brand-500 hover:text-brand-600"
              >
                Gagnablað Victron <ExternalArrow className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        <QuoteBox summary={summary} open={quoteOpen} onToggle={() => setQuoteOpen((o) => !o)} />

        <p className="px-2 text-xs leading-relaxed text-ink-900/45">
          Reglur og stýringagögn byggja á MPPT-reiknivél Victron Energy. Hitastuðlar og gildi dæmigerðra sella eru
          einkennandi – notaðu alltaf gagnablað þinnar sellu fyrir endanlega hönnun. Ræsimörk: PV ≥ float + {START_MARGIN_V} V.
        </p>
      </div>
    </div>
  );
}

// ---------- Hjálparföll ----------

function suggestions(results: ControllerResult[], i: MpptInput): string[] {
  const s = new Set<string>();
  for (const r of results) {
    for (const ch of r.checks) {
      if (ch.status !== "fail") continue;
      if (ch.key === "voc") s.add("Fækkaðu sellum í röð – Voc í kulda fer yfir hámarksinnspennu.");
      if (ch.key === "vmp") s.add(`Fjölgaðu sellum í röð eða lækkaðu kerfisspennu – Vmp í hita nær ekki float + ${START_MARGIN_V} V.`);
      if (ch.key === "isc") s.add("Fækkaðu strengjum í hlið – straumurinn fer yfir mörk.");
      if (ch.key === "strings") s.add("Skiptu strengjunum á fleiri stýringar.");
      if (ch.key === "power" && !i.allowOversized) s.add("Leyfðu yfirstærð PV eða skiptu á fleiri stýringar.");
    }
  }
  if (i.requireBluetooth || i.requireVeCan || i.requireMc4) s.add("Slakaðu á kröfum (Bluetooth / VE.Can / MC4).");
  return [...s];
}

const selectCls =
  "h-12 w-full appearance-none rounded-xl border border-mist-300 bg-mist-50 px-4 text-sm text-ink-900 outline-none focus:border-brand-500 focus:bg-white";

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
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

function Num({
  label,
  unit,
  value,
  step,
  onChange,
  hint,
}: {
  label: string;
  unit?: string;
  value: number;
  step?: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-900/80">{label}</span>
      <div className="relative mt-1">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) onChange(v);
          }}
          className="h-11 w-full rounded-xl border border-mist-300 bg-mist-50 px-3 pr-12 text-sm text-ink-900 outline-none focus:border-brand-500 focus:bg-white"
        />
        {unit && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] font-medium text-ink-900/45">
            {unit}
          </span>
        )}
      </div>
      {hint && <span className="mt-1 block text-[11px] text-ink-900/45">{hint}</span>}
    </label>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5 flex h-12 items-stretch overflow-hidden rounded-xl border border-mist-300 bg-mist-50">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-12 text-lg font-semibold text-ink-900/60 hover:bg-white hover:text-brand-600" aria-label="Fækka">
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const v = Math.round(Number(e.target.value));
            if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          className="w-full bg-transparent text-center font-display text-xl font-semibold outline-none"
        />
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="w-12 text-lg font-semibold text-ink-900/60 hover:bg-white hover:text-brand-600" aria-label="Fjölga">
          +
        </button>
      </div>
    </div>
  );
}

/** Lítil teikning af uppröðun: raðir = strengir, dálkar = sellur í röð */
function ArrayDiagram({ series, strings }: { series: number; strings: number }) {
  const s = Math.min(series, 12);
  const p = Math.min(strings, 6);
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl bg-mist-50 p-4" aria-hidden="true">
      <div className="inline-flex flex-col gap-1.5">
        {Array.from({ length: p }).map((_, r) => (
          <div key={r} className="flex items-center gap-1">
            <span className="mr-2 w-4 text-[10px] text-ink-900/40">{r + 1}</span>
            {Array.from({ length: s }).map((_, c) => (
              <span key={c} className="h-5 w-3.5 rounded-[3px] bg-brand-500/80 ring-1 ring-brand-700/30" />
            ))}
            {series > 12 && <span className="ml-1 text-[10px] text-ink-900/40">+{series - 12}</span>}
          </div>
        ))}
        {strings > 6 && <span className="text-[10px] text-ink-900/40">+{strings - 6} strengir</span>}
      </div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${checked ? "border-brand-500 bg-brand-50" : "border-mist-300 bg-mist-50 hover:bg-white"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-500" />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-ink-900/55">{hint}</span>}
      </span>
    </label>
  );
}

function Stat({ label, value, sub, accent = false }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? "bg-brand-500/20 ring-1 ring-brand-400/40" : "bg-white/5 ring-1 ring-white/10"}`}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/55">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-white/55">{sub}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-mist-50 p-3">
      <dt className="text-[11px] uppercase tracking-wider text-ink-900/50">{label}</dt>
      <dd className="mt-0.5 font-display text-lg font-semibold">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: ControllerResult["status"] }) {
  const map = {
    ok: ["Passar", "bg-brand-50 text-brand-700 ring-brand-200"],
    oversized: ["Yfirstærð PV", "bg-amber-50 text-amber-800 ring-amber-200"],
    fail: ["Passar ekki", "bg-red-50 text-red-700 ring-red-200"],
  } as const;
  const [text, cls] = map[status];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-inset ${cls}`}>{text}</span>;
}

function CheckIcon({ status }: { status: "ok" | "warn" | "fail" }) {
  const cls = status === "ok" ? "bg-brand-500 text-white" : status === "warn" ? "bg-amber-400 text-ink-900" : "bg-red-500 text-white";
  return (
    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${cls}`} aria-label={status}>
      {status === "ok" ? "✓" : status === "warn" ? "!" : "✕"}
    </span>
  );
}

function ControllerRow({ r, selected, onSelect }: { r: ControllerResult; selected: boolean; onSelect: () => void }) {
  const c = r.controller;
  const ratioPct = Math.min(100, r.powerRatio * 100);
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border p-3.5 text-left transition sm:grid-cols-[1fr_9rem_auto] ${
          selected ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-mist-200 hover:border-brand-300 hover:bg-mist-50"
        } ${r.status === "fail" ? "opacity-70" : ""}`}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{c.type}</p>
          <p className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-ink-900/55">
            <span>{c.voc_max} V · {c.i_bat_max} A</span>
            {c.victron_connect === 1 && <span>Bluetooth</span>}
            {c.ve_can === 1 && <span>VE.Can</span>}
            {c.mc4 === 1 && <span>MC4</span>}
            {c.rs_model === 1 && <span>{c.max_strings} trackerar</span>}
          </p>
        </div>
        <div className="hidden sm:block">
          <div className="h-2 overflow-hidden rounded-full bg-mist-200">
            <div className={`h-full rounded-full ${r.status === "oversized" ? "bg-amber-400" : "bg-brand-500"}`} style={{ width: `${ratioPct}%` }} />
          </div>
          <p className="mt-1 text-[11px] tabular-nums text-ink-900/55">{f0(r.powerRatio * 100)} % nýting</p>
        </div>
        <StatusBadge status={r.status} />
      </button>
    </li>
  );
}

/** Spenna strengs (Voc, Vmp) sem fall af hitastigi, með mörkum stýringar. */
function VoltageChart({ input, vocMax, vmpMin }: { input: MpptInput; vocMax: number; vmpMin: number }) {
  const pts = voltageCurve(input);
  const W = 640;
  const H = 240;
  const padL = 44;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const tMinAxis = -40;
  const tMaxAxis = 80;
  const vMax = Math.max(vocMax, ...pts.map((p) => p.voc)) * 1.1;
  const x = (t: number) => padL + ((t - tMinAxis) / (tMaxAxis - tMinAxis)) * iw;
  const y = (v: number) => padT + ih - (v / vMax) * ih;
  const line = (key: "voc" | "vmp") => pts.map((p) => `${x(p.t)},${y(p[key])}`).join(" ");
  const ticks = 4;
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold">Spenna strengs eftir hitastigi</h4>
        <ul className="flex flex-wrap gap-3 text-[11px] text-ink-900/65">
          <li className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-brand-500" /> Voc</li>
          <li className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-volt-600" /> Vmp</li>
          <li className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 border-t border-dashed border-red-500" /> Hámark stýringar</li>
          <li className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 border-t border-dashed border-amber-500" /> Ræsimörk</li>
        </ul>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="Voc og Vmp strengs sem fall af hitastigi ásamt mörkum stýringar">
        {/* Rekstrarsvið */}
        <rect x={x(input.tMin)} y={padT} width={x(input.tMax) - x(input.tMin)} height={ih} fill="#d0e9f7" opacity="0.4" />
        {/* Leyfilegt spennusvið */}
        <rect x={padL} y={y(vocMax)} width={iw} height={Math.max(0, y(vmpMin) - y(vocMax))} fill="#1288ca" opacity="0.06" />
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = (vMax / ticks) * i;
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="#dfe7ef" />
              <text x={padL - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#6b7a8a">{f0(v)}</text>
            </g>
          );
        })}
        {[-40, -20, 0, 20, 40, 60, 80].map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" fontSize="10" fill="#6b7a8a">{t}°</text>
        ))}
        <line x1={padL} x2={W - padR} y1={y(vocMax)} y2={y(vocMax)} stroke="#ef4444" strokeDasharray="5 4" strokeWidth="1.5" />
        <text x={W - padR - 4} y={y(vocMax) - 5} textAnchor="end" fontSize="10" fill="#b91c1c">hámark {vocMax} V</text>
        <line x1={padL} x2={W - padR} y1={y(vmpMin)} y2={y(vmpMin)} stroke="#f59e0b" strokeDasharray="5 4" strokeWidth="1.5" />
        <text x={W - padR - 4} y={y(vmpMin) - 5} textAnchor="end" fontSize="10" fill="#b45309">ræsimörk {f1(vmpMin)} V</text>
        <polyline points={line("voc")} fill="none" stroke="#1288ca" strokeWidth="2" strokeLinejoin="round" />
        <polyline points={line("vmp")} fill="none" stroke="#14a9be" strokeWidth="2" strokeLinejoin="round" />
        {/* Merkipunktar: Voc í kulda, Vmp í hita */}
        {(() => {
          const vocCold = pts.find((p) => p.t === input.tMin)?.voc;
          const vmpHot = pts.find((p) => p.t === input.tMax)?.vmp;
          return (
            <>
              <circle cx={x(input.tMin)} cy={y(vocCold ?? 0)} r="4.5" fill="#1288ca" stroke="white" strokeWidth="2" />
              <circle cx={x(input.tMax)} cy={y(vmpHot ?? 0)} r="4.5" fill="#14a9be" stroke="white" strokeWidth="2" />
            </>
          );
        })()}
      </svg>
      <p className="mt-1 text-[11px] text-ink-900/45">Ljósblátt = hitasvið kerfisins. Voc-línan verður að halda sig undir rauðu og Vmp-línan yfir gulu innan þess.</p>
    </div>
  );
}

function QuoteBox({ summary, open, onToggle }: { summary: string; open: boolean; onToggle: () => void }) {
  return (
    <div id="tilbod" className="scroll-mt-24 overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-card">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <h3 className="font-display text-lg font-semibold">Viltu að við förum yfir þetta?</h3>
          <p className="mt-0.5 text-sm text-ink-900/55">Forsendurnar fylgja með fyrirspurninni.</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_rgb(18_136_202/0.8)] transition hover:bg-brand-400"
          aria-expanded={open}
        >
          <Icon name="bolt" className="h-4 w-4" />
          {open ? "Loka" : "Fá tilboð"}
        </button>
      </div>
      {open && (
        <div className="border-t border-mist-200 bg-mist-50 p-6 sm:p-7">
          <ContactForm
            key={summary}
            variant="compact"
            title="Tilboð í MPPT og sellur"
            subject="Tilboð – MPPT úr reiknivél"
            projectType="MPPT (reiknivél)"
            reference="reiknivel:mppt"
            defaultMessage={summary}
            className="relative"
          />
        </div>
      )}
    </div>
  );
}
