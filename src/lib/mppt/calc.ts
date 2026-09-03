// MPPT-reiknivél – hrein stærðfræði, sömu reglur og MPPT-reiknivél Victron:
//  1. Voc strengs í mesta kulda  ≤ hámarksinnspenna stýringar (voc_max)
//  2. Vmp strengs í mesta hita   ≥ float-spenna rafgeyma + 5 V (ræsimörk) og ≥ vmpp_min (RS)
//  3. Isc í mesta hita           ≤ hámarks PV-straumur (samtals, eða per tracker á RS)
//  4. PV-afl / nafnafl stýringar = „aflhlutfall" – >1 er yfirstærð (leyfilegt en aflið er takmarkað)

import { victronControllers, type VictronController } from "./controllers";
import { formatIs } from "@/lib/format";

export interface PanelSpec {
  name: string;
  /** Wp við STC */
  pmax: number;
  voc: number;
  vmp: number;
  isc: number;
  imp: number;
  /** Hitastuðull Voc, %/°C (neikvæður) */
  tcVoc: number;
  /** Hitastuðull Isc, %/°C (jákvæður) */
  tcIsc: number;
  /** Hitastuðull Pmax, %/°C (neikvæður) – notaður fyrir Vmp */
  tcPmax: number;
}

export type SystemVoltage = 12 | 24 | 36 | 48;

export const SYSTEM_VOLTAGES: SystemVoltage[] = [12, 24, 36, 48];

/** Sjálfgefin float-spenna LiFePO4 (3,375 V/sellu) */
export const DEFAULT_FLOAT: Record<SystemVoltage, number> = { 12: 13.5, 24: 27, 36: 40.5, 48: 54 };

/** PV þarf að vera a.m.k. þetta yfir rafgeymaspennu til að stýringin ræsi */
export const START_MARGIN_V = 5;

export interface MpptInput {
  panel: PanelSpec;
  series: number;
  strings: number;
  systemVoltage: SystemVoltage;
  floatVoltage: number;
  tMin: number;
  tMax: number;
  allowOversized: boolean;
  requireBluetooth: boolean;
  requireVeCan: boolean;
  requireMc4: boolean;
  includeCombos: boolean;
}

/** Hitaleiðrétting: gildi við 25 °C × (1 + tc% × ΔT) */
export const atTemp = (value: number, tcPct: number, temp: number) =>
  value * (1 + (tcPct / 100) * (temp - 25));

export interface ArrayResult {
  panels: number;
  pStc: number;
  kWp: number;
  vocCold: number;
  vocStc: number;
  vmpHot: number;
  vmpStc: number;
  /** Isc eins strengs í hita */
  iscStringHot: number;
  /** Isc allra strengja samtals í hita */
  iscTotalHot: number;
  impStc: number;
  pCold: number;
  pHot: number;
}

export function computeArray(i: MpptInput): ArrayResult {
  const { panel: p, series, strings, tMin, tMax } = i;
  const n = series * strings;
  return {
    panels: n,
    pStc: p.pmax * n,
    kWp: (p.pmax * n) / 1000,
    vocCold: atTemp(p.voc, p.tcVoc, tMin) * series,
    vocStc: p.voc * series,
    vmpHot: atTemp(p.vmp, p.tcPmax, tMax) * series,
    vmpStc: p.vmp * series,
    iscStringHot: atTemp(p.isc, p.tcIsc, tMax),
    iscTotalHot: atTemp(p.isc, p.tcIsc, tMax) * strings,
    impStc: p.imp * strings,
    pCold: atTemp(p.pmax, p.tcPmax, tMin) * n,
    pHot: atTemp(p.pmax, p.tcPmax, tMax) * n,
  };
}

export type CheckStatus = "ok" | "warn" | "fail";

export interface Check {
  key: "voltage" | "voc" | "vmp" | "isc" | "strings" | "power" | "feature";
  status: CheckStatus;
  label: string;
  detail: string;
  hint?: string;
}

export interface ControllerResult {
  controller: VictronController;
  status: "ok" | "oversized" | "fail";
  checks: Check[];
  /** PV-afl / nafnafl stýringar við kerfisspennu */
  powerRatio: number;
  nominalPower: number;
  /** Afl sem stýringin skilar að hámarki (takmarkað af nafnafli) */
  usablePower: number;
  chargeCurrentCold: number;
  chargeCurrentHot: number;
  /** Ef RS: hve margir trackerar nýtast */
  trackersUsed: number;
}

const powerAt = (c: VictronController, v: SystemVoltage) =>
  ({ 12: c.power_at_12v, 24: c.power_at_24v, 36: c.power_at_36v, 48: c.power_at_48v })[v];
const effAt = (c: VictronController, v: SystemVoltage) =>
  ({ 12: c.efficiency_at_12v, 24: c.efficiency_at_24v, 36: c.efficiency_at_36v, 48: c.efficiency_at_48v })[v] || 0.97;
const supports = (c: VictronController, v: SystemVoltage) =>
  ({ 12: c.system_voltage_12, 24: c.system_voltage_24, 36: c.system_voltage_36, 48: c.system_voltage_48 })[v] === 1;

const f1 = (n: number) => formatIs(n, 1);
const f0 = (n: number) => formatIs(n, 0);

export function evaluateController(c: VictronController, i: MpptInput, a: ArrayResult): ControllerResult | null {
  const isCombo = c.inverter > 0 || c.ac_charger > 0;
  if (isCombo && !i.includeCombos) return null;
  if (i.requireBluetooth && !c.victron_connect) return null;
  if (i.requireVeCan && !c.ve_can) return null;
  if (i.requireMc4 && !c.mc4) return null;

  const checks: Check[] = [];
  const nominalPower = powerAt(c, i.systemVoltage);

  if (!supports(c, i.systemVoltage) || nominalPower <= 0) {
    return {
      controller: c,
      status: "fail",
      checks: [
        {
          key: "voltage",
          status: "fail",
          label: "Kerfisspenna",
          detail: `Styður ekki ${i.systemVoltage} V kerfi`,
        },
      ],
      powerRatio: 0,
      nominalPower: 0,
      usablePower: 0,
      chargeCurrentCold: 0,
      chargeCurrentHot: 0,
      trackersUsed: 0,
    };
  }

  // 1. Voc í kulda
  const vocOk = a.vocCold <= c.voc_max;
  checks.push({
    key: "voc",
    status: vocOk ? (a.vocCold > c.voc_max * 0.95 ? "warn" : "ok") : "fail",
    label: `Voc við ${i.tMin} °C`,
    detail: `${f1(a.vocCold)} V af ${c.voc_max} V hámarki`,
    hint: vocOk
      ? a.vocCold > c.voc_max * 0.95
        ? "Mjög nálægt hámarki – lægra hitastig gæti farið yfir."
        : undefined
      : "Fækkaðu sellum í streng, notaðu sellur með lægri spennu eða stýringu með hærri innspennu.",
  });

  // 2. Vmp í hita – þarf að ræsa yfir float + 5 V (og vmpp_min á RS)
  const vmpFloor = Math.max(i.floatVoltage + START_MARGIN_V, c.vmpp_min);
  const vmpOk = a.vmpHot >= vmpFloor;
  checks.push({
    key: "vmp",
    status: vmpOk ? (a.vmpHot < vmpFloor * 1.1 ? "warn" : "ok") : "fail",
    label: `Vmp við ${i.tMax} °C`,
    detail: `${f1(a.vmpHot)} V – þarf ≥ ${f1(vmpFloor)} V (float ${f1(i.floatVoltage)} V + ${START_MARGIN_V} V${c.vmpp_min > START_MARGIN_V ? `, lágmark ${c.vmpp_min} V` : ""})`,
    hint: vmpOk
      ? a.vmpHot < vmpFloor * 1.1
        ? "Lítið svigrúm í hita – hleðsla gæti stöðvast á heitum dögum."
        : undefined
      : "Fjölgaðu sellum í streng eða notaðu lægri kerfisspennu.",
  });

  // 3. Straumur
  const rs = c.rs_model === 1;
  let trackersUsed = 1;
  if (rs) {
    trackersUsed = Math.min(i.strings, c.max_strings);
    const stringsOk = i.strings <= c.max_strings;
    checks.push({
      key: "strings",
      status: stringsOk ? "ok" : "fail",
      label: "Strengir / trackerar",
      detail: `${i.strings} ${i.strings === 1 ? "strengur" : "strengir"} á ${c.max_strings} trackera`,
      hint: stringsOk ? undefined : "Skiptu kerfinu á fleiri stýringar eða tengdu strengi saman í hlið (athugaðu straummörk).",
    });
    const iscOk = a.iscStringHot <= c.ipv_max;
    checks.push({
      key: "isc",
      status: iscOk ? (a.iscStringHot > c.ipv_max * 0.9 ? "warn" : "ok") : "fail",
      label: `Isc per tracker við ${i.tMax} °C`,
      detail: `${f1(a.iscStringHot)} A af ${c.ipv_max} A hámarki`,
      hint: iscOk ? undefined : "Einn strengur per tracker – notaðu sellur með lægri Isc.",
    });
  } else {
    const iscOk = a.iscTotalHot <= c.ipv_max;
    checks.push({
      key: "isc",
      status: iscOk ? (a.iscTotalHot > c.ipv_max * 0.9 ? "warn" : "ok") : "fail",
      label: `Isc samtals við ${i.tMax} °C`,
      detail: `${f1(a.iscTotalHot)} A af ${c.ipv_max} A hámarki`,
      hint: iscOk ? undefined : "Fækkaðu strengjum í hlið (fleiri í röð í staðinn) eða skiptu á fleiri stýringar.",
    });
  }

  // 4. Aflhlutfall
  const powerRatio = a.pStc / nominalPower;
  const oversized = powerRatio > 1;
  checks.push({
    key: "power",
    status: oversized ? (i.allowOversized ? "warn" : "fail") : "ok",
    label: "Aflhlutfall PV / stýring",
    detail: `${f0(a.pStc)} W af ${f0(nominalPower)} W nafnafli (${f0(powerRatio * 100)} %)`,
    hint: oversized
      ? `Stýringin takmarkar við ${f0(nominalPower)} W – umframafl nýtist ekki á björtustu stundum en gefur meira í skýjuðu veðri.`
      : powerRatio < 0.5
        ? "Stýringin er mun stærri en þarf – minni stýring dugar."
        : undefined,
  });

  const anyFail = checks.some((ch) => ch.status === "fail");
  const eff = effAt(c, i.systemVoltage);
  const usablePower = Math.min(a.pStc, nominalPower);
  const cc = (p: number) => Math.min((Math.min(p, nominalPower) * eff) / i.floatVoltage, c.i_bat_max);

  return {
    controller: c,
    status: anyFail ? "fail" : oversized ? "oversized" : "ok",
    checks,
    powerRatio,
    nominalPower,
    usablePower,
    chargeCurrentCold: cc(a.pCold),
    chargeCurrentHot: cc(a.pHot),
    trackersUsed,
  };
}

export function evaluateAll(i: MpptInput): { array: ArrayResult; results: ControllerResult[] } {
  const array = computeArray(i);
  const results = victronControllers
    .map((c) => evaluateController(c, i, array))
    .filter((r): r is ControllerResult => r !== null);

  // Röðun: passar fyrst (best nýting efst), svo yfirstærð, svo fellur
  const rank = (r: ControllerResult) => (r.status === "ok" ? 0 : r.status === "oversized" ? 1 : 2);
  results.sort((x, y) => {
    const d = rank(x) - rank(y);
    if (d !== 0) return d;
    if (x.status === "ok" && y.status === "ok") return y.powerRatio - x.powerRatio; // mest nýting fyrst
    if (x.status === "oversized" && y.status === "oversized") return x.powerRatio - y.powerRatio; // minnst yfirstærð fyrst
    return x.controller.i_bat_max - y.controller.i_bat_max;
  });
  return { array, results };
}

/** Punktar fyrir spennugraf: Voc og Vmp strengs sem fall af hitastigi */
export function voltageCurve(i: MpptInput, tFrom = -40, tTo = 80, step = 5) {
  const pts: { t: number; voc: number; vmp: number }[] = [];
  for (let t = tFrom; t <= tTo; t += step) {
    pts.push({
      t,
      voc: atTemp(i.panel.voc, i.panel.tcVoc, t) * i.series,
      vmp: atTemp(i.panel.vmp, i.panel.tcPmax, t) * i.series,
    });
  }
  return pts;
}
