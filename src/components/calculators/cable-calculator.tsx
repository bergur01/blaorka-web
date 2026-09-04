"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CIRCUITS,
  INSTALLS,
  PRESETS,
  computeCable,
  fmt,
  fmt1,
  fmt2,
  rho,
  type CircuitKind,
  type Install,
} from "@/lib/cables/sizing";
import { ArrowRight, Icon } from "@/components/icons";

// Kapalreiknivél – spennufall og straumþol fyrir DC og AC lagnir í kerfum
// Bláorku. Reglurnar og töflurnar eru í src/lib/cables/sizing.ts.

const inputCls =
  "mt-1 h-11 w-full rounded-xl border border-mist-300 bg-mist-50 px-3 text-sm text-ink-900 outline-none placeholder:text-ink-900/35 focus:border-brand-500 focus:bg-white";

export function CableCalculator() {
  const [current, setCurrent] = useState(110);
  const [voltage, setVoltage] = useState(48);
  const [length, setLength] = useState(2);
  const [maxDropPct, setMaxDropPct] = useState(2);
  const [circuit, setCircuit] = useState<CircuitKind>("dc");
  const [install, setInstall] = useState<Install>("loft");
  const [conductorTempC, setConductorTempC] = useState(45);
  const [preset, setPreset] = useState<string | null>("multiplus5000");
  const [byPower, setByPower] = useState(false);
  const [powerW, setPowerW] = useState(5000);

  // Straumur má annaðhvort slá inn beint eða reikna út frá afli
  const effectiveCurrent = byPower && voltage > 0 ? powerW / voltage : current;

  const result = useMemo(
    () =>
      computeCable({
        current: effectiveCurrent,
        voltage,
        length,
        maxDropPct,
        circuit,
        install,
        conductorTempC,
      }),
    [effectiveCurrent, voltage, length, maxDropPct, circuit, install, conductorTempC],
  );

  function applyPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setCurrent(p.input.current);
    setVoltage(p.input.voltage);
    setLength(p.input.length);
    setMaxDropPct(p.input.maxDropPct);
    setCircuit(p.input.circuit);
    setByPower(false);
    setPreset(id);
  }

  const touched = () => setPreset(null);
  const dropLimitV = (voltage * maxDropPct) / 100;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* ================= INNTAK ================= */}
      <div className="space-y-5">
        <section className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-sm font-semibold text-white">
              1
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold leading-tight">Hvaða lögn?</h2>
              <p className="mt-0.5 text-sm text-ink-900/55">Byrjaðu á dæmigerðri rás eða sláðu inn þínar eigin tölur.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  preset === p.id
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                    : "border-mist-300 bg-white hover:border-brand-300"
                }`}
              >
                <span className="block text-sm font-semibold">{p.label}</span>
                <span className="block text-xs text-ink-900/55">{p.note}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-sm font-semibold text-white">
              2
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold leading-tight">Straumur og lengd</h2>
              <p className="mt-0.5 text-sm text-ink-900/55">Lengdin er önnur leiðin – reiknivélin tvöfaldar hana sjálf.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {CIRCUITS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCircuit(c.id);
                  if (c.id === "ac1") setVoltage(230);
                  if (c.id === "ac3") setVoltage(400);
                  touched();
                }}
                className={`rounded-xl border px-3 py-2.5 text-left transition ${
                  circuit === c.id
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                    : "border-mist-300 bg-white hover:border-brand-300"
                }`}
              >
                <span className="block text-sm font-semibold">{c.label}</span>
                <span className="block text-xs text-ink-900/55">{c.note}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ink-900">Spenna</span>
              {circuit === "dc" ? (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[12, 24, 48, 350].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setVoltage(v);
                        touched();
                      }}
                      className={`rounded-xl border px-1 py-2 text-sm font-semibold transition ${
                        voltage === v
                          ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500"
                          : "border-mist-300 text-ink-900/70 hover:border-brand-300"
                      }`}
                    >
                      {v} V
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="number"
                  inputMode="decimal"
                  min={100}
                  value={voltage}
                  onChange={(e) => {
                    setVoltage(Number(e.target.value) || 0);
                    touched();
                  }}
                  className={inputCls}
                />
              )}
              {circuit === "dc" && voltage === 350 && (
                <span className="mt-1.5 block text-xs text-ink-900/50">Dæmigerð strengspenna af þaki inn á MPPT</span>
              )}
            </label>

            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink-900">Straumur</span>
                <button
                  type="button"
                  onClick={() => setByPower((v) => !v)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-500"
                >
                  {byPower ? "Slá inn straum" : "Reikna út frá afli"}
                </button>
              </div>
              {byPower ? (
                <>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    value={powerW}
                    onChange={(e) => {
                      setPowerW(Number(e.target.value) || 0);
                      touched();
                    }}
                    className={inputCls}
                  />
                  <span className="mt-1.5 block text-xs text-ink-900/50">
                    {fmt.format(powerW)} W á {fmt.format(voltage)} V = {fmt1.format(effectiveCurrent)} A
                  </span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    value={current}
                    onChange={(e) => {
                      setCurrent(Number(e.target.value) || 0);
                      touched();
                    }}
                    className={inputCls}
                  />
                  <span className="mt-1.5 block text-xs text-ink-900/50">
                    {fmt.format(effectiveCurrent * voltage)} W flutt afl
                  </span>
                </>
              )}
            </div>

            <label className="block">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink-900">Lengd (önnur leið)</span>
                <span className="font-display text-lg font-semibold text-brand-600">{fmt1.format(length)} m</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={60}
                step={0.5}
                value={length}
                onChange={(e) => {
                  setLength(Number(e.target.value));
                  touched();
                }}
                className="mt-3 w-full accent-brand-500"
              />
              <span className="mt-1 block text-xs text-ink-900/50">
                {fmt1.format(result.conductorLength)} m af leiðara alls
              </span>
            </label>

            <label className="block">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink-900">Leyfilegt spennufall</span>
                <span className="font-display text-lg font-semibold text-brand-600">{fmt1.format(maxDropPct)} %</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.5}
                value={maxDropPct}
                onChange={(e) => {
                  setMaxDropPct(Number(e.target.value));
                  touched();
                }}
                className="mt-3 w-full accent-brand-500"
              />
              <span className="mt-1 block text-xs text-ink-900/50">
                {fmt2.format(dropLimitV)} V · rafgeymarásir 2 %, hleðslurásir og lýsing 3 %
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-sm font-semibold text-white">
              3
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold leading-tight">Aðstæður</h2>
              <p className="mt-0.5 text-sm text-ink-900/55">Kæling og hiti ráða því hvað leiðarinn þolir.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {INSTALLS.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setInstall(i.id)}
                className={`rounded-xl border px-3 py-2.5 text-left transition ${
                  install === i.id
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                    : "border-mist-300 bg-white hover:border-brand-300"
                }`}
              >
                <span className="block text-sm font-semibold">{i.label}</span>
                <span className="block text-xs text-ink-900/55">{i.note}</span>
              </button>
            ))}
          </div>
          <label className="mt-5 block">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-ink-900">Hitastig leiðarans</span>
              <span className="font-display text-lg font-semibold text-brand-600">{conductorTempC} °C</span>
            </div>
            <input
              type="range"
              min={20}
              max={90}
              step={5}
              value={conductorTempC}
              onChange={(e) => setConductorTempC(Number(e.target.value))}
              className="mt-3 w-full accent-brand-500"
            />
            <span className="mt-1 block text-xs text-ink-900/50">
              Heitur kopar leiðir verr: {fmt2.format(rho(conductorTempC) * 1000)} mΩ·mm²/m
            </span>
          </label>
        </section>
      </div>

      {/* ================= NIÐURSTAÐA ================= */}
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-6 text-white sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/30 blur-[80px]" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-volt-400">
              <span className="h-px w-6 bg-current opacity-60" />
              Niðurstaða
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Stat
                icon="cable"
                label="Ráðlagður kapall"
                value={result.size ? `${fmt1.format(result.size)} mm²` : "—"}
                sub={
                  result.reason === "straumur"
                    ? "ræðst af straumþoli"
                    : result.reason === "oryggi"
                      ? "ræðst af öryggisstærð"
                      : "ræðst af spennufalli"
                }
                accent
              />
              <Stat
                icon="gauge"
                label="Lágmark"
                value={`${fmt1.format(result.minAreaDrop)} mm²`}
                sub="hreint reiknað út frá spennufalli"
              />
              <Stat
                icon="bolt"
                label="Spennufall"
                value={`${fmt2.format(result.dropV)} V`}
                sub={`${fmt1.format(result.dropPct)} % af ${fmt.format(voltage)} V`}
              />
              <Stat
                icon="wave"
                label={circuit === "dc" ? "Öryggi" : "Varrofi"}
                value={result.fuse ? `${fmt.format(result.fuse)} A` : "—"}
                sub={`kapall þolir ${fmt.format(result.ampacity)} A`}
              />
            </div>

            <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/75 ring-1 ring-white/10">
              Tapið í leiðurunum er <strong className="text-white">{fmt1.format(result.lossW)} W</strong> við{" "}
              {fmt1.format(effectiveCurrent)} A, eða {fmt1.format(result.lossPct)} % af fluttu afli.
            </div>

            {result.size === null && (
              <p className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Engin stöðluð stærð dugar. Styttu leiðina, leyfðu meira spennufall eða skiptu álaginu á fleiri kapla.
              </p>
            )}
            {result.size !== null && result.fuse === null && (
              <p className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Straumurinn er of hár fyrir stöðluð öryggi á þessari stærð – veldu digurri kapal.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <h3 className="font-display text-lg font-semibold">Stærðirnar hlið við hlið</h3>
          <p className="mt-0.5 text-sm text-ink-900/55">
            Spennufall og tap á {fmt1.format(length)} m leið við {fmt1.format(effectiveCurrent)} A.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-sm">
              <thead>
                <tr className="border-b border-mist-200 text-left text-xs uppercase tracking-wider text-ink-900/45">
                  <th className="pb-2 font-medium">mm²</th>
                  <th className="pb-2 text-right font-medium">Spennufall</th>
                  <th className="pb-2 text-right font-medium">Tap</th>
                  <th className="pb-2 text-right font-medium">Þolir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist-100">
                {result.rows
                  .filter((r) => result.size === null || (r.size >= result.size / 4 && r.size <= result.size * 4))
                  .map((r) => {
                    const chosen = r.size === result.size;
                    return (
                      <tr key={r.size} className={chosen ? "bg-brand-50" : undefined}>
                        <td className={`py-2 tabular-nums ${chosen ? "font-semibold text-brand-700" : ""}`}>
                          {fmt1.format(r.size)}
                          {chosen && <span className="ml-2 text-xs font-normal text-brand-600">valið</span>}
                        </td>
                        <td className={`py-2 text-right tabular-nums ${r.okDrop ? "text-ink-900/70" : "text-amber-600"}`}>
                          {fmt2.format(r.dropV)} V · {fmt1.format(r.dropPct)} %
                        </td>
                        <td className="py-2 text-right tabular-nums text-ink-900/70">{fmt.format(r.lossW)} W</td>
                        <td className={`py-2 text-right tabular-nums ${r.okAmp ? "text-ink-900/70" : "text-amber-600"}`}>
                          {fmt.format(r.ampacity)} A
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-900/50">
            Gular tölur standast ekki kröfuna sem þú settir. Straumþolið er miðað við {INSTALLS.find((i) => i.id === install)?.label.toLowerCase()}.
          </p>
        </div>

        <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <h3 className="font-display text-lg font-semibold">Þrjár reglur sem borgar sig að muna</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-900/75">
            <li className="flex gap-3">
              <Icon name="bolt" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span>
                Spennufall er hlutfall af kerfisspennunni. Sömu 0,5 V eru {fmt1.format((0.5 / 12) * 100)} % á 12 V en aðeins{" "}
                {fmt1.format((0.5 / 48) * 100)} % á 48 V – þess vegna er 48 V svona miklu ódýrara í köplum.
              </span>
            </li>
            <li className="flex gap-3">
              <Icon name="cable" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span>
                Tvöföld lengd kallar á tvöfalt þversnið. Styttu leiðina milli rafgeymis og áriðils áður en þú kaupir digrari
                kapal.
              </span>
            </li>
            <li className="flex gap-3">
              <Icon name="gauge" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span>
                Öryggið ver kapalinn, ekki tækið. Það á að vera stærra en samfelldi straumurinn en aldrei stærra en
                straumþol kapalsins.
              </span>
            </li>
          </ul>
          <Link
            href="/frodleikur/otengd-kerfi-grunnur"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-500"
          >
            Ótengt kerfi frá A til Ö
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="px-2 text-xs leading-relaxed text-ink-900/45">
          Reiknað með kopar og hitaleiðréttu eðlisviðnámi, og aflstuðli 1 í riðstraumsrásum. Straumþolstölurnar eru
          varfærin viðmið fyrir einn leiðara og koma ekki í stað hönnunar löggilts rafverktaka – lagnaaðferð, einangrun,
          búnt og umhverfishiti breyta þeim.
        </p>
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
  icon: "bolt" | "gauge" | "cable" | "wave";
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
