// Rafgeymareiknivél – hrein stærðfræði, engin React-tengsl.
//
// Tvær áttir: annars vegar hvað tiltekinn banki dugar lengi, hins vegar hversu
// stóran banka þarf fyrir gefna dagsnotkun. Sömu forsendur og í
// sólarorkureiknivélinni (src/lib/solar/sizing.ts) svo tölurnar stemmi milli
// reiknivéla: 80 % afhleðsludýpt og 94 % nýtni áriðils.

import { makeFormatter } from "@/lib/format";

export const fmt = makeFormatter(0);
export const fmt1 = makeFormatter(1);
export const fmt2 = makeFormatter(2);

/** Nýtni áriðils (DC → AC) – sama tala og í sólarorkureiknivélinni. */
export const INVERTER_EFF = 0.94;
/** Nýtni rafgeymis inn og út (LiFePO4 skilar nær öllu sem sett er inn). */
export const ROUND_TRIP = 0.96;

export type Chemistry = "lifepo4" | "agm";

export interface ChemistryInfo {
  id: Chemistry;
  name: string;
  /** Ráðlögð afhleðsludýpt í daglegri notkun */
  dod: number;
  /** Hleðslulotur við þá dýpt */
  cycles: number;
  /** Nýtni inn og út */
  roundTrip: number;
  /** Varfærinn samfelldur afhleðslustraumur sem hlutfall af rýmd (C) */
  maxDischargeC: number;
  /** Ráðlagður hleðslustraumur sem hlutfall af rýmd (C) */
  chargeC: number;
  note: string;
}

export const CHEMISTRY: Record<Chemistry, ChemistryInfo> = {
  lifepo4: {
    id: "lifepo4",
    name: "LiFePO4",
    dod: 0.8,
    cycles: 6000,
    roundTrip: 0.96,
    maxDischargeC: 0.5,
    chargeC: 0.3,
    note: "Þolir djúpa afhleðslu, skilar fullu afli niður í botn og endist þúsundir lota.",
  },
  agm: {
    id: "agm",
    name: "Blýgeymir (AGM)",
    dod: 0.5,
    cycles: 600,
    roundTrip: 0.85,
    maxDischargeC: 0.2,
    chargeC: 0.15,
    note: "Má ekki tæma nema til hálfs og tapar rými við mikinn straum (Peukert).",
  },
};

export interface BatteryModel {
  id: string;
  name: string;
  /** Nafnspenna, V */
  volts: number;
  /** Rýmd, Ah */
  ah: number;
  chemistry: Chemistry;
  note: string;
}

/**
 * Rafgeymar sem Bláorka selur. Nafngildi – staðfestu straumþol í gagnablaði
 * fyrir hverja einingu áður en kerfi er hannað.
 */
export const BATTERIES: BatteryModel[] = [
  {
    id: "51-200",
    name: "Bláorku 51,2 V 200 Ah",
    volts: 51.2,
    ah: 200,
    chemistry: "lifepo4",
    note: "Bankinn í flestum húsa- og fjarskiptakerfum",
  },
  {
    id: "51-100",
    name: "Bláorku 51,2 V 100 Ah",
    volts: 51.2,
    ah: 100,
    chemistry: "lifepo4",
    note: "Minni 48 V kerfi, auðvelt að stækka síðar",
  },
  {
    id: "25-230",
    name: "Bláorku 25,6 V 230 Ah",
    volts: 25.6,
    ah: 230,
    chemistry: "lifepo4",
    note: "Bátar og millistærð á 24 V",
  },
  {
    id: "12-460",
    name: "Bláorku 12,8 V 460 Ah",
    volts: 12.8,
    ah: 460,
    chemistry: "lifepo4",
    note: "Stærsti 12 V geymirinn – húsbílar og hjólhýsi",
  },
  {
    id: "12-230",
    name: "Bláorku 12,8 V 230 Ah",
    volts: 12.8,
    ah: 230,
    chemistry: "lifepo4",
    note: "Algengasta stærðin í ferðakerfum",
  },
  {
    id: "12-100",
    name: "Bláorku 12,8 V 100 Ah",
    volts: 12.8,
    ah: 100,
    chemistry: "lifepo4",
    note: "Minnsta einingin – léttur ferðageymir",
  },
];

export const SYSTEM_VOLTAGES = [12, 24, 48] as const;
export type SystemVoltage = (typeof SYSTEM_VOLTAGES)[number];

/** Orka einnar einingar í kWst. */
export function unitKwh(b: { volts: number; ah: number }): number {
  return (b.volts * b.ah) / 1000;
}

/** Kerfisspennan sem eining af gefinni nafnspennu tilheyrir. */
export function systemVoltageFor(unitVolts: number): SystemVoltage {
  if (unitVolts >= 40) return 48;
  if (unitVolts >= 20) return 24;
  return 12;
}

/**
 * Hvernig einingar raðast í kerfi: hversu margar í röð til að ná
 * kerfisspennunni og hversu margar slíkar raðir eru samsíða.
 */
export function wiring(unitVolts: number, systemVoltage: SystemVoltage, count: number) {
  const nominal = systemVoltage === 48 ? 51.2 : systemVoltage === 24 ? 25.6 : 12.8;
  const series = Math.max(1, Math.round(nominal / unitVolts));
  const parallel = Math.floor(count / series);
  return { series, parallel, usable: series * parallel, fits: count >= series && count % series === 0 };
}

export interface BankInput {
  /** Fjöldi eininga í bankanum */
  count: number;
  volts: number;
  ah: number;
  chemistry: Chemistry;
  systemVoltage: SystemVoltage;
  /** Afhleðsludýpt sem miðað er við, 0–1 */
  dod: number;
  /** Meðalálag á AC-hlið, W */
  loadW: number;
  /** Er rafgeymirinn í ókyntu rými? Kuldi minnkar nýtanlega rýmd. */
  cold: boolean;
}

export interface BankResult {
  /** Heildarorka bankans, kWst */
  totalKwh: number;
  /** Nýtanleg orka eftir afhleðsludýpt og kulda, kWst */
  usableKwh: number;
  /** Orka sem skilar sér út um áriðilinn, kWst */
  acKwh: number;
  /** Keyrslutími við uppgefið álag, klst */
  hours: number;
  /** Straumur af rafgeyminum við það álag, A */
  dischargeA: number;
  /** Hámarks samfelldur afhleðslustraumur bankans, A */
  maxDischargeA: number;
  /** Hámarksafl sem bankinn ræður við, W (AC-megin) */
  maxLoadW: number;
  /** Ráðlagður hleðslustraumur, A */
  chargeA: number;
  /** Tími til að fylla tóman banka á þeim straumi, klst */
  rechargeHours: number;
  /** Uppsetning eininga */
  wiring: ReturnType<typeof wiring>;
  /** Álagið er meira en bankinn ræður við */
  overCurrent: boolean;
}

/** Kuldastuðull: LiFePO4 skilar minni rýmd í frosti og má ekki hlaða undir 0 °C. */
const COLD_FACTOR = 0.88;

export function computeBank(input: BankInput): BankResult {
  const chem = CHEMISTRY[input.chemistry];
  const totalKwh = unitKwh(input) * input.count;
  const cold = input.cold ? COLD_FACTOR : 1;
  const usableKwh = totalKwh * input.dod * cold;
  const acKwh = usableKwh * chem.roundTrip * INVERTER_EFF;

  const dcW = input.loadW / INVERTER_EFF;
  const bankVolts = input.volts * wiring(input.volts, input.systemVoltage, input.count).series;
  const dischargeA = bankVolts > 0 ? dcW / bankVolts : 0;

  const w = wiring(input.volts, input.systemVoltage, input.count);
  const parallel = Math.max(1, w.parallel);
  const maxDischargeA = input.ah * chem.maxDischargeC * parallel;
  const maxLoadW = maxDischargeA * bankVolts * INVERTER_EFF;
  const chargeA = input.ah * chem.chargeC * parallel;
  const rechargeHours = chargeA > 0 ? (usableKwh * 1000) / (chargeA * bankVolts) : 0;

  return {
    totalKwh,
    usableKwh,
    acKwh,
    hours: input.loadW > 0 ? (acKwh * 1000) / input.loadW : 0,
    dischargeA,
    maxDischargeA,
    maxLoadW,
    chargeA,
    rechargeHours,
    wiring: w,
    overCurrent: dischargeA > maxDischargeA,
  };
}

export interface NeedInput {
  /** Dagleg orkunotkun á AC-hlið, kWst */
  dailyKwh: number;
  /** Dagar sem bankinn á að duga án hleðslu */
  days: number;
  dod: number;
  chemistry: Chemistry;
  cold: boolean;
  volts: number;
  ah: number;
  systemVoltage: SystemVoltage;
}

export interface NeedResult {
  /** Orka sem þarf að vera nýtanleg, kWst */
  neededUsableKwh: number;
  /** Nafnrýmd bankans sem það kallar á, kWst */
  neededNominalKwh: number;
  /** Fjöldi eininga (námundað upp í heila röð) */
  units: number;
  /** Raunveruleg stærð bankans með þeim fjölda */
  actualKwh: number;
  /** Ah á kerfisspennunni */
  ah: number;
  wiring: ReturnType<typeof wiring>;
}

export function computeNeed(input: NeedInput): NeedResult {
  const chem = CHEMISTRY[input.chemistry];
  const cold = input.cold ? COLD_FACTOR : 1;
  const neededUsableKwh = input.dailyKwh * input.days;
  const neededNominalKwh = neededUsableKwh / (chem.roundTrip * INVERTER_EFF) / input.dod / cold;
  const per = unitKwh(input);
  const series = wiring(input.volts, input.systemVoltage, 99).series;
  const rows = Math.max(1, Math.ceil(neededNominalKwh / (per * series)));
  const units = rows * series;
  const w = wiring(input.volts, input.systemVoltage, units);
  const actualKwh = per * units;
  return {
    neededUsableKwh,
    neededNominalKwh,
    units,
    actualKwh,
    ah: (actualKwh * 1000) / (input.volts * series),
    wiring: w,
  };
}

/** Ending í árum miðað við eina lotu á dag við valda dýpt. */
export function lifetimeYears(chemistry: Chemistry, cyclesPerDay: number): number {
  const chem = CHEMISTRY[chemistry];
  return cyclesPerDay > 0 ? chem.cycles / (cyclesPerDay * 365) : 0;
}
