"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BATTERIES,
  CHEMISTRY,
  computeBank,
  computeNeed,
  fmt,
  fmt1,
  lifetimeYears,
  systemVoltageFor,
  unitKwh,
  type Chemistry,
} from "@/lib/battery/sizing";
import { ArrowRight, Icon } from "@/components/icons";

// Rafgeymareiknivél – sömu forsendur og sólarorkureiknivélin (80 % afhleðsla,
// 94 % nýtni áriðils) svo tölurnar stemmi milli reiknivéla.

type Mode = "duration" | "size";

const inputCls =
  "mt-1 h-11 w-full rounded-xl border border-mist-300 bg-mist-50 px-3 text-sm text-ink-900 outline-none placeholder:text-ink-900/35 focus:border-brand-500 focus:bg-white";

export function BatteryCalculator() {
  const [mode, setMode] = useState<Mode>("duration");
  const [modelId, setModelId] = useState(BATTERIES[0].id);
  const [customVolts, setCustomVolts] = useState(51.2);
  const [customAh, setCustomAh] = useState(200);
  const [chemistry, setChemistry] = useState<Chemistry>("lifepo4");
  const [count, setCount] = useState(2);
  const [dodPct, setDodPct] = useState(80);
  const [loadW, setLoadW] = useState(600);
  const [dailyKwh, setDailyKwh] = useState(12);
  const [days, setDays] = useState(2);
  const [cold, setCold] = useState(false);

  const custom = modelId === "custom";
  const model = BATTERIES.find((b) => b.id === modelId);
  const volts = custom ? customVolts : (model?.volts ?? 51.2);
  const ah = custom ? customAh : (model?.ah ?? 200);
  const unitMaxA = custom ? undefined : model?.maxDischargeA;
  const chem = CHEMISTRY[chemistry];
  // Kerfisspennan fylgir rafgeyminum sem er valinn
  const systemVoltage = systemVoltageFor(volts);

  // Efnafræðin ræður hámarksdýpt; sleðinn eltir hana þegar skipt er
  const maxDod = Math.round(chem.dod * 100);
  const dod = Math.min(dodPct, maxDod) / 100;

  const need = useMemo(
    () => computeNeed({ dailyKwh, days, dod, chemistry, cold, volts, ah, systemVoltage }),
    [dailyKwh, days, dod, chemistry, cold, volts, ah, systemVoltage],
  );

  const shownCount = mode === "duration" ? count : need.units;
  const shownBank = useMemo(
    () => computeBank({ count: shownCount, volts, ah, chemistry, systemVoltage, dod, loadW, cold, unitMaxA }),
    [shownCount, volts, ah, chemistry, systemVoltage, dod, loadW, cold, unitMaxA],
  );

  const years = lifetimeYears(chemistry, 1);
  // Sami banki úr hinu efninu til samanburðar
  const other = CHEMISTRY[chemistry === "lifepo4" ? "agm" : "lifepo4"];
  const otherNominal =
    (shownBank.usableKwh / (chem.roundTrip * chem.dod)) * (other.roundTrip * other.dod) > 0
      ? shownBank.usableKwh / other.dod / other.roundTrip
      : 0;

  const loads = [200, 500, 1000, 2000, 3000];

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
              <h2 className="font-display text-lg font-semibold leading-tight">Hvað viltu vita?</h2>
              <p className="mt-0.5 text-sm text-ink-900/55">
                Hvað bankinn þinn dugar lengi – eða hversu stóran banka þú þarft.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {(
              [
                { id: "duration", label: "Hvað dugar bankinn?", note: "þú veist stærðina" },
                { id: "size", label: "Hvað þarf stóran banka?", note: "þú veist notkunina" },
              ] as { id: Mode; label: string; note: string }[]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  mode === m.id
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                    : "border-mist-300 bg-white hover:border-brand-300"
                }`}
              >
                <span className="block text-sm font-semibold">{m.label}</span>
                <span className="block text-xs text-ink-900/55">{m.note}</span>
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
              <h2 className="font-display text-lg font-semibold leading-tight">Rafgeymirinn</h2>
              <p className="mt-0.5 text-sm text-ink-900/55">Veldu einingu og fjölda – spennan fylgir geyminum.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            {BATTERIES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setModelId(b.id);
                  setChemistry(b.chemistry);
                }}
                className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition ${
                  modelId === b.id
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                    : "border-mist-300 bg-white hover:border-brand-300"
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{b.name}</span>
                  <span className="block text-xs text-ink-900/55">{b.note}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-display text-sm font-semibold tabular-nums text-brand-600">
                    {fmt1.format(unitKwh(b))} kWst
                  </span>
                  <span className="block text-xs tabular-nums text-ink-900/45">{fmt.format(b.maxDischargeA)} A</span>
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setModelId("custom")}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                custom ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-mist-300 bg-white hover:border-brand-300"
              }`}
            >
              <span className="block text-sm font-semibold">Annar rafgeymir</span>
              <span className="block text-xs text-ink-900/55">Sláðu inn spennu og Ah</span>
            </button>
          </div>

          {custom && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="text-xs font-medium text-ink-900/80">Spenna (V)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={6}
                  step={0.1}
                  value={customVolts}
                  onChange={(e) => setCustomVolts(Number(e.target.value) || 0)}
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-ink-900/80">Rýmd (Ah)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  value={customAh}
                  onChange={(e) => setCustomAh(Number(e.target.value) || 0)}
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-ink-900/80">Gerð</span>
                <select
                  value={chemistry}
                  onChange={(e) => setChemistry(e.target.value as Chemistry)}
                  className={`${inputCls} appearance-none`}
                >
                  <option value="lifepo4">LiFePO4</option>
                  <option value="agm">Blýgeymir (AGM)</option>
                </select>
              </label>
            </div>
          )}

          {mode === "duration" && (
            <label className="mt-5 block">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink-900">Fjöldi eininga</span>
                <span className="font-display text-lg font-semibold text-brand-600">{count}</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="mt-3 w-full accent-brand-500"
              />
              <span className="mt-1 block text-xs text-ink-900/50">
                {count > 1 ? `${count} samsíða · ` : ""}
                {fmt1.format(unitKwh({ volts, ah }) * count)} kWst nafnrýmd á {systemVoltage} V kerfi
              </span>
            </label>
          )}
        </section>

        <section className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-sm font-semibold text-white">
              3
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold leading-tight">
                {mode === "duration" ? "Álagið" : "Notkunin"}
              </h2>
              <p className="mt-0.5 text-sm text-ink-900/55">
                {mode === "duration"
                  ? "Meðalafl sem tekið er af bankanum um áriðilinn."
                  : "Dagleg orkunotkun og hversu lengi bankinn á að duga einn."}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {mode === "duration" ? (
              <label className="block sm:col-span-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-ink-900">Meðalálag</span>
                  <span className="font-display text-lg font-semibold text-brand-600">{fmt.format(loadW)} W</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={5000}
                  step={50}
                  value={loadW}
                  onChange={(e) => setLoadW(Number(e.target.value))}
                  className="mt-3 w-full accent-brand-500"
                />
                <span className="mt-1 block text-xs text-ink-900/50">
                  {fmt1.format((loadW * 24) / 1000)} kWst á sólarhring ef álagið helst
                </span>
              </label>
            ) : (
              <>
                <label className="block">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-ink-900">Dagleg notkun</span>
                    <span className="font-display text-lg font-semibold text-brand-600">{fmt1.format(dailyKwh)} kWst</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    step={1}
                    value={dailyKwh}
                    onChange={(e) => setDailyKwh(Number(e.target.value))}
                    className="mt-3 w-full accent-brand-500"
                  />
                </label>
                <label className="block">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-ink-900">Dagar án hleðslu</span>
                    <span className="font-display text-lg font-semibold text-brand-600">
                      {days} {days === 1 ? "dagur" : "dagar"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="mt-3 w-full accent-brand-500"
                  />
                </label>
              </>
            )}

            <label className="block">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink-900">Afhleðsludýpt</span>
                <span className="font-display text-lg font-semibold text-brand-600">{Math.round(dod * 100)} %</span>
              </div>
              <input
                type="range"
                min={20}
                max={maxDod}
                step={5}
                value={Math.min(dodPct, maxDod)}
                onChange={(e) => setDodPct(Number(e.target.value))}
                className="mt-3 w-full accent-brand-500"
              />
              <span className="mt-1 block text-xs text-ink-900/50">
                {chem.name}: mest {maxDod} % í daglegri notkun
              </span>
            </label>

            <button
              type="button"
              role="switch"
              aria-checked={cold}
              onClick={() => setCold((c) => !c)}
              className={`flex h-fit items-center justify-between gap-3 self-end rounded-xl border px-4 py-3 text-left transition ${
                cold ? "border-brand-500 bg-brand-50" : "border-mist-300 bg-white hover:border-brand-300"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold">Ókynt rými</span>
                <span className="block text-xs text-ink-900/55">Kuldi tekur um 12 % af rýmdinni</span>
              </span>
              <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${cold ? "bg-brand-500" : "bg-mist-300"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${cold ? "left-[18px]" : "left-0.5"}`} />
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* ================= NIÐURSTAÐA ================= */}
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-6 text-white sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/30 blur-[80px]" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-volt-400">
              <span className="h-px w-6 bg-current opacity-60" />
              {mode === "duration" ? "Bankinn þinn" : "Bankinn sem þarf"}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {mode === "size" ? (
                <Stat
                  icon="battery"
                  label="Fjöldi eininga"
                  value={`${need.units} ×`}
                  sub={`${fmt1.format(unitKwh({ volts, ah }))} kWst hver`}
                  accent
                />
              ) : (
                <Stat
                  icon="bolt"
                  label="Keyrslutími"
                  value={shownBank.hours >= 48 ? `${fmt1.format(shownBank.hours / 24)} dagar` : `${fmt1.format(shownBank.hours)} klst`}
                  sub={`við ${fmt.format(loadW)} W álag`}
                  accent
                />
              )}
              <Stat icon="grid" label="Heildarorka" value={`${fmt1.format(shownBank.totalKwh)} kWst`} sub="nafnrýmd" />
              <Stat
                icon="battery"
                label="Nýtanleg orka"
                value={`${fmt1.format(shownBank.usableKwh)} kWst`}
                sub={`${Math.round(dod * 100)} % afhleðsla${cold ? " · kalt" : ""}`}
              />
              <Stat
                icon="gauge"
                label="Hámarksstraumur"
                value={`${fmt.format(shownBank.maxDischargeA)} A`}
                sub={`≈ ${fmt1.format(shownBank.maxLoadW / 1000)} kW samfellt`}
              />
            </div>

            {mode === "duration" && shownBank.overCurrent && (
              <p className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Álagið kallar á {fmt.format(shownBank.dischargeA)} A en bankinn ræður við{" "}
                {fmt.format(shownBank.maxDischargeA)} A samfellt. Fjölgaðu einingum eða minnkaðu álagið.
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={`/reiknivelar/solarorkukerfi?daily=${
                  mode === "size" ? dailyKwh : Math.round((loadW * 24) / 1000)
                }`}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_rgb(18_136_202/0.8)] transition hover:bg-brand-400"
              >
                Hvað þarf margar sellur til að fylla hann?
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Uppsetning */}
        <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <h3 className="font-display text-lg font-semibold">Uppsetning</h3>
          <dl className="mt-4 divide-y divide-mist-200 text-sm">
            <Row label="Tenging" value={shownCount > 1 ? `${shownCount} einingar samsíða` : "Ein eining"} />
            <Row label="Kerfisspenna" value={`${fmt1.format(volts)} V · ${systemVoltage} V kerfi`} />
            <Row label="Rýmd bankans" value={`${fmt.format(ah * shownCount)} Ah á ${fmt1.format(volts)} V`} />
            <Row
              label="Hámarksstraumur"
              value={`${fmt.format(shownBank.maxDischargeA)} A${shownCount > 1 ? ` (${fmt.format(shownBank.maxDischargeA / shownCount)} A × ${shownCount})` : ""}`}
            />
            <Row label="Ráðlagður hleðslustraumur" value={`${fmt.format(shownBank.chargeA)} A`} />
            <Row
              label="Full hleðsla úr tómum banka"
              value={`${fmt1.format(shownBank.rechargeHours)} klst á þeim straumi`}
            />
            <Row
              label="Ending"
              value={`${fmt.format(CHEMISTRY[chemistry].cycles)} lotur ≈ ${fmt.format(years)} ár við eina lotu á dag`}
            />
          </dl>
        </div>

        {/* Keyrslutími við mismunandi álag */}
        {mode === "duration" && (
          <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
            <h3 className="font-display text-lg font-semibold">Hvað dugar bankinn lengi?</h3>
            <p className="mt-0.5 text-sm text-ink-900/55">
              {fmt1.format(shownBank.acKwh)} kWst skila sér út um áriðilinn.
            </p>
            <ul className="mt-4 space-y-2.5">
              {loads.map((w) => {
                const h = (shownBank.acKwh * 1000) / w;
                const over = w / 0.94 / volts > shownBank.maxDischargeA;
                return (
                  <li key={w} className="grid grid-cols-[4.5rem_1fr_6rem] items-center gap-3 text-sm">
                    <span className="tabular-nums font-medium">{fmt.format(w)} W</span>
                    <div className="h-4 overflow-hidden rounded-md bg-mist-100">
                      <div
                        className={`h-full rounded-md ${over ? "bg-amber-500" : "bg-brand-500"}`}
                        style={{ width: `${Math.min(100, (h / 48) * 100)}%` }}
                      />
                    </div>
                    <span className="text-right tabular-nums text-ink-900/70">
                      {h >= 48 ? `${fmt1.format(h / 24)} dagar` : `${fmt1.format(h)} klst`}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-ink-900/50">Gult þýðir að straumurinn fer yfir það sem bankinn ræður við.</p>
          </div>
        )}

        {mode === "size" && (
          <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
            <h3 className="font-display text-lg font-semibold">Hvernig talan er fundin</h3>
            <ol className="mt-4 space-y-3 text-sm text-ink-900/75">
              <li className="flex gap-3">
                <span className="font-display font-semibold text-brand-500">1</span>
                <span>
                  {fmt1.format(dailyKwh)} kWst × {days} {days === 1 ? "dagur" : "dagar"} ={" "}
                  <strong className="text-ink-900">{fmt1.format(need.neededUsableKwh)} kWst</strong> þurfa að komast út um
                  áriðilinn.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-display font-semibold text-brand-500">2</span>
                <span>
                  Að teknu tilliti til {Math.round(dod * 100)} % afhleðslu, {Math.round(chem.dischargeEff * 100)} % nýtni
                  rafgeymis og 94 % nýtni áriðils{cold ? " og kulda" : ""} kallar það á{" "}
                  <strong className="text-ink-900">{fmt1.format(need.neededNominalKwh)} kWst</strong> nafnrýmd.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-display font-semibold text-brand-500">3</span>
                <span>
                  Það gera <strong className="text-ink-900">{need.units} einingar</strong> ={" "}
                  {fmt1.format(need.actualKwh)} kWst nafnrýmd.
                </span>
              </li>
            </ol>
          </div>
        )}

        {/* Samanburður */}
        <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-card sm:p-7">
          <h3 className="font-display text-lg font-semibold">{chem.name} á móti {other.name}</h3>
          <p className="mt-0.5 text-sm text-ink-900/55">{chem.note}</p>
          <dl className="mt-4 divide-y divide-mist-200 text-sm">
            <Row label={`Nýtanleg orka núna`} value={`${fmt1.format(shownBank.usableKwh)} kWst`} />
            <Row
              label={`Sama orka úr ${other.name.toLowerCase()}`}
              value={`${fmt1.format(otherNominal)} kWst nafnrýmd`}
            />
            <Row
              label="Hleðslulotur"
              value={`${fmt.format(chem.cycles)} á móti ${fmt.format(other.cycles)}`}
            />
            <Row
              label="Nýtni inn og út"
              value={`${Math.round(chem.roundTrip * 100)} % á móti ${Math.round(other.roundTrip * 100)} %`}
            />
          </dl>
          <Link
            href="/frodleikur/rafgeymar"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-500"
          >
            Lesa um muninn á LiFePO4 og blýi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="px-2 text-xs leading-relaxed text-ink-900/45">
          Rýmd og straumþol eru nafngildi fyrir einingarnar sem Bláorka selur – staðfestu tölurnar í gagnablaði hverrar
          gerðar áður en kerfi er hannað. LiFePO4 má ekki hlaða í frosti nema geymirinn sé með innbyggða upphitun.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-ink-900/60">{label}</dt>
      <dd className="text-right font-medium tabular-nums">{value}</dd>
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
  icon: "bolt" | "gauge" | "battery" | "grid";
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
