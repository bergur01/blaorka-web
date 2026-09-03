import { makeFormatter } from "@/lib/format";

// Hrein stærðfræði fyrir sólarorkureiknivélina – keyrir bæði á bakenda og í vafra.
// Engin ytri köll hér; geislunargögn koma inn sem SolarProfiles (sjá pvgis.ts).

/** PVGIS azimuth: 0 = suður, 90 = vestur, -90 = austur, 180 = norður */
export const ASPECTS = [0, 45, 90, 135, 180, -135, -90, -45] as const;
export type Aspect = (typeof ASPECTS)[number];

export const ASPECT_LABELS: Record<Aspect, { short: string; long: string }> = {
  0: { short: "S", long: "Suður" },
  45: { short: "SV", long: "Suðvestur" },
  90: { short: "V", long: "Vestur" },
  135: { short: "NV", long: "Norðvestur" },
  180: { short: "N", long: "Norður" },
  [-135]: { short: "NA", long: "Norðaustur" },
  [-90]: { short: "A", long: "Austur" },
  [-45]: { short: "SA", long: "Suðaustur" },
};

export interface SolarProfiles {
  lat: number;
  lon: number;
  tilt: number;
  /** Gagnagrunnur PVGIS, t.d. PVGIS-SARAH3 eða PVGIS-ERA5 */
  db: string;
  /** kWst á kWp á mánuði (12 gildi) fyrir hverja átt */
  byAspect: Record<Aspect, number[]>;
  /** Besti halli og átt skv. PVGIS ásamt framleiðslu */
  optimal: { tilt: number; aspect: number; monthly: number[]; annual: number };
}

export const MONTHS = ["jan", "feb", "mar", "apr", "maí", "jún", "júl", "ágú", "sep", "okt", "nóv", "des"];
export const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export type Goal = "summer" | "extended" | "year";
export const GOALS: Record<
  Goal,
  { label: string; hint: string; months: number[]; tilt: number; tiltRange: [number, number] | null }
> = {
  // Ráðlagður halli: lágur á sumrin (sól hátt á lofti), brattari eftir því sem
  // veturinn vegur þyngra. „Allt árið" notar besta halla skv. PVGIS (≈42° á Íslandi).
  summer: { label: "Sumarhálfár", hint: "apríl – september", months: [3, 4, 5, 6, 7, 8], tilt: 15, tiltRange: [10, 20] },
  extended: { label: "Mars – október", hint: "átta mánuðir", months: [2, 3, 4, 5, 6, 7, 8, 9], tilt: 25, tiltRange: [20, 30] },
  year: { label: "Allt árið", hint: "krefst mjög stórs kerfis", months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], tilt: 42, tiltRange: null },
};

/** Ráðlagður halli fyrir markmið – „allt árið" notar besta halla PVGIS ef hann er þekktur. */
export function recommendedTilt(goal: Goal, optimalTilt?: number): number {
  if (goal === "year" && optimalTilt) return optimalTilt;
  return GOALS[goal].tilt;
}

export type Phase = 1 | 3;

export interface SizingInput {
  dailyKwh: number;
  peakKw: number;
  phase: Phase;
  autonomyDays: number;
  goal: Goal;
  aspect: Aspect;
  profiles: SolarProfiles;
  /** Handvirk yfirtaka á sólarafli (kWp) – annars reiknað út frá markmiði */
  overrideKwp?: number | null;
  /** Handvirk yfirtaka á rafgeymarýmd (kWst) – annars reiknað út frá dögum án sólar */
  overrideBatteryKwh?: number | null;
}

// Búnaður – forsendur
export const PANEL_W = 455; // W per sella – sellan sem Bláorka selur
/** Stærð sellu í mm (Bláorku 455 W) */
export const PANEL_DIMS = { length: 1762, width: 1134, depth: 30 } as const;
/** Flatarmál einnar sellu, m² */
export const PANEL_AREA_M2 = (PANEL_DIMS.length * PANEL_DIMS.width) / 1e6;
export const BANK_KWH = 10; // Bláorku 48 V 200 Ah ≈ 9,6 kWst
export const DOD = 0.8; // nýtanleg afhleðsludýpt
export const INVERTER_EFF = 0.94;

interface InverterModel {
  name: string;
  contKw: number;
}
const MULTIPLUS: InverterModel[] = [
  { name: "MultiPlus-II 48/3000", contKw: 2.4 },
  { name: "MultiPlus-II 48/5000", contKw: 4.0 },
  { name: "MultiPlus-II 48/8000", contKw: 6.4 },
  { name: "MultiPlus-II 48/15000", contKw: 12.0 },
];

export interface SizingResult {
  kWp: number;
  panels: number;
  /** Mánaðarleg framleiðsla, kWst */
  production: number[];
  /** Mánaðarleg notkun, kWst */
  consumption: number[];
  annualProduction: number;
  annualConsumption: number;
  /** Hlutfall ársnotkunar sem sólin dekkar (0–1) */
  solarShare: number;
  /** Hlutfall notkunar dekkað per mánuð (0–1) */
  coverage: number[];
  /** Mánuðir þar sem framleiðsla ≥ notkun */
  monthsCovered: number;
  surplusKwh: number;
  deficitKwh: number;
  battery: { banks: number; kWh: number; usableKwh: number; autonomyDays: number };
  inverter: { model: string; count: number; totalKva: number };
  mppt: { model: string; count: number };
  /** Sjálfvirk tillaga – til samanburðar þegar notandi stillir handvirkt */
  recommended: { kWp: number; panels: number; banks: number; kWh: number };
  manual: { kWp: boolean; battery: boolean };
}

export function computeSizing(input: SizingInput): SizingResult {
  const { dailyKwh, peakKw, phase, autonomyDays, goal, aspect, profiles, overrideKwp, overrideBatteryKwh } = input;
  const yieldPerKwp = profiles.byAspect[aspect];
  const consumption = MONTH_DAYS.map((d) => dailyKwh * d);
  const targetMonths = GOALS[goal].months;

  const needed = targetMonths.reduce((s, m) => s + consumption[m], 0);
  const perKwp = targetMonths.reduce((s, m) => s + yieldPerKwp[m], 0);
  const rawKwp = perKwp > 0 ? needed / perKwp : 0;
  const recPanels = Math.max(1, Math.ceil((rawKwp * 1000) / PANEL_W));
  const manualKwp = overrideKwp != null && overrideKwp > 0;
  const panels = manualKwp ? Math.max(1, Math.round((overrideKwp * 1000) / PANEL_W)) : recPanels;
  const kWp = (panels * PANEL_W) / 1000;

  const production = yieldPerKwp.map((y) => y * kWp);
  const coverage = production.map((p, i) => (consumption[i] > 0 ? Math.min(1, p / consumption[i]) : 1));
  const annualProduction = production.reduce((a, b) => a + b, 0);
  const annualConsumption = consumption.reduce((a, b) => a + b, 0);
  const used = production.reduce((s, p, i) => s + Math.min(p, consumption[i]), 0);
  const surplusKwh = production.reduce((s, p, i) => s + Math.max(0, p - consumption[i]), 0);
  const deficitKwh = production.reduce((s, p, i) => s + Math.max(0, consumption[i] - p), 0);

  // Rafgeymar: dagar án sólar × dagleg notkun, leiðrétt fyrir DoD og áriðilstapi
  const usableNeeded = dailyKwh * autonomyDays;
  const grossNeeded = usableNeeded / DOD / INVERTER_EFF;
  const recBanks = Math.max(1, Math.ceil(grossNeeded / BANK_KWH));
  const manualBattery = overrideBatteryKwh != null && overrideBatteryKwh > 0;
  const banks = manualBattery ? Math.max(1, Math.round(overrideBatteryKwh / BANK_KWH)) : recBanks;

  // Áriðill: samfellt afl ≥ hámarksálag × 1,15 (per fasa í þriggja fasa kerfi)
  const perUnitKw = (peakKw * 1.15) / phase;
  let model = MULTIPLUS.find((m) => m.contKw >= perUnitKw);
  let perPhaseCount = 1;
  if (!model) {
    model = MULTIPLUS[MULTIPLUS.length - 1];
    perPhaseCount = Math.ceil(perUnitKw / model.contKw);
  }
  const count = perPhaseCount * phase;
  const totalKva = count * (parseInt(model.name.split("/")[1], 10) / 1000);

  // MPPT: SmartSolar 250/100 ræður við ~5,8 kW á 48 V, RS 450/200 ~11,5 kW
  const mppt =
    kWp <= 5.8
      ? { model: "SmartSolar MPPT 250/100", count: 1 }
      : { model: "MPPT RS 450/200", count: Math.ceil(kWp / 11.5) };

  return {
    kWp,
    panels,
    production,
    consumption,
    annualProduction,
    annualConsumption,
    solarShare: annualConsumption > 0 ? used / annualConsumption : 0,
    coverage,
    monthsCovered: coverage.filter((c) => c >= 0.999).length,
    surplusKwh,
    deficitKwh,
    battery: {
      banks,
      kWh: banks * BANK_KWH,
      usableKwh: banks * BANK_KWH * DOD,
      autonomyDays: dailyKwh > 0 ? (banks * BANK_KWH * DOD * INVERTER_EFF) / dailyKwh : 0,
    },
    inverter: { model: model.name, count, totalKva },
    mppt,
    recommended: {
      kWp: (recPanels * PANEL_W) / 1000,
      panels: recPanels,
      banks: recBanks,
      kWh: recBanks * BANK_KWH,
    },
    manual: { kWp: manualKwp, battery: manualBattery },
  };
}

/** Raðar áttum eftir framleiðslu í markmiðsmánuðum (kWst/kWp). */
export function rankAspects(profiles: SolarProfiles, goal: Goal) {
  const months = GOALS[goal].months;
  return ASPECTS.map((aspect) => {
    const monthly = profiles.byAspect[aspect];
    return {
      aspect,
      annual: monthly.reduce((a, b) => a + b, 0),
      target: months.reduce((s, m) => s + monthly[m], 0),
    };
  }).sort((a, b) => b.target - a.target);
}

export const fmt = makeFormatter(0);
export const fmt1 = makeFormatter(1);
