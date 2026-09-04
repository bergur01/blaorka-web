// Kapalreiknivél – hrein stærðfræði, engin React-tengsl.
//
// Þversnið kapals ræðst af tvennu: spennufallinu sem má leyfa og straumnum sem
// leiðarinn þolir. Reiknivélin skoðar hvort tveggja og velur stærra svarið.

import { makeFormatter } from "@/lib/format";

export const fmt = makeFormatter(0);
export const fmt1 = makeFormatter(1);
export const fmt2 = makeFormatter(2);

/** Eðlisviðnám kopars við 20 °C, Ω·mm²/m */
export const RHO_CU_20 = 0.01724;
/** Hitastuðull kopars á °C */
export const ALPHA_CU = 0.00393;

/** Eðlisviðnám kopars við tiltekið leiðarahitastig. */
export function rho(conductorTempC: number): number {
  return RHO_CU_20 * (1 + ALPHA_CU * (conductorTempC - 20));
}

/** Þversnið sem fást í búð, mm². */
export const SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240] as const;

/**
 * Straumþol eins leiðara úr kopar, lagður frjáls í lofti við 30 °C.
 * Varfærnar tölur; lagnaaðferð, einangrun og hitastig geta breytt þeim.
 */
export const AMPACITY: Record<number, number> = {
  1.5: 18,
  2.5: 26,
  4: 35,
  6: 45,
  10: 62,
  16: 83,
  25: 110,
  35: 137,
  50: 170,
  70: 216,
  95: 260,
  120: 300,
  150: 340,
  185: 390,
  240: 460,
};

/**
 * Öryggi fyrir jafnstraum – MEGA/ANL/NH stærðirnar sem notaðar eru í
 * rafgeymarásum. Valið er með 10 % borði ofan á samfellda strauminn.
 */
export const FUSES_DC = [30, 40, 50, 60, 80, 100, 125, 150, 175, 200, 250, 300, 355, 400, 500];
/**
 * Varrofar fyrir riðstraum – IEC-röðin sem notuð er í íslenskum töflum.
 * Rofinn á að vera af stærð álagsins, ekki hærri.
 */
export const BREAKERS_AC = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];

export type Install = "loft" | "ror" | "heitt";

export const INSTALLS: { id: Install; label: string; factor: number; note: string }[] = [
  { id: "loft", label: "Frjálst í lofti", factor: 1, note: "kapall liggur einn og kælist vel" },
  { id: "ror", label: "Í röri eða búnti", factor: 0.75, note: "margir leiðarar saman, minni kæling" },
  { id: "heitt", label: "Heitt rými", factor: 0.85, note: "yfir 40 °C umhverfishiti" },
];

export type CircuitKind = "dc" | "ac1" | "ac3";

export const CIRCUITS: { id: CircuitKind; label: string; note: string }[] = [
  { id: "dc", label: "Jafnstraumur (DC)", note: "rafgeymar, sellur, MPPT" },
  { id: "ac1", label: "230 V einfasa", note: "venjuleg heimilislögn" },
  { id: "ac3", label: "400 V þriggja fasa", note: "stærri kerfi og vélar" },
];

export interface CableInput {
  /** Straumur, A */
  current: number;
  /** Kerfisspenna, V */
  voltage: number;
  /** Lengd aðra leiðina, m */
  length: number;
  /** Leyfilegt spennufall, % */
  maxDropPct: number;
  circuit: CircuitKind;
  install: Install;
  /** Hitastig leiðarans í fullu álagi, °C */
  conductorTempC: number;
}

export interface CableRow {
  size: number;
  /** Spennufall á þessari stærð, V */
  dropV: number;
  dropPct: number;
  /** Afltap í leiðurunum, W */
  lossW: number;
  /** Straumþol eftir leiðréttingu, A */
  ampacity: number;
  okDrop: boolean;
  okAmp: boolean;
}

export interface CableResult {
  /** Lágmarksþversnið vegna spennufalls, mm² (óafrúnnað) */
  minAreaDrop: number;
  /** Minnsta staðlaða stærð sem stenst spennufallið */
  sizeByDrop: number | null;
  /** Minnsta staðlaða stærð sem þolir strauminn */
  sizeByAmp: number | null;
  /** Stærðin sem stenst hvort tveggja */
  size: number | null;
  dropV: number;
  dropPct: number;
  lossW: number;
  lossPct: number;
  ampacity: number;
  /** Ráðlagt öryggi (DC) eða varrofi (AC), A */
  fuse: number | null;
  /** Hvað réð stærðinni */
  reason: "fall" | "straumur" | "oryggi" | null;
  /** Heildarlengd leiðara (fram og til baka þar sem það á við), m */
  conductorLength: number;
  rows: CableRow[];
}

/** Margfaldari fyrir leiðaralengd eftir gerð rásar. */
function lengthFactor(circuit: CircuitKind): number {
  return circuit === "ac3" ? Math.sqrt(3) : 2;
}

export function computeCable(input: CableInput): CableResult {
  const { current, voltage, length, maxDropPct, circuit, install } = input;
  const r = rho(input.conductorTempC);
  const k = lengthFactor(circuit);
  const allowedV = (voltage * maxDropPct) / 100;
  const derate = INSTALLS.find((i) => i.id === install)?.factor ?? 1;

  const minAreaDrop = allowedV > 0 && current > 0 ? (k * length * current * r) / allowedV : 0;

  const rows: CableRow[] = SIZES.map((size) => {
    const dropV = (k * length * current * r) / size;
    const resistance = (k * length * r) / size;
    return {
      size,
      dropV,
      dropPct: voltage > 0 ? (dropV / voltage) * 100 : 0,
      lossW: current * current * resistance,
      ampacity: AMPACITY[size] * derate,
      okDrop: dropV <= allowedV,
      okAmp: AMPACITY[size] * derate >= current,
    };
  });

  const sizeByDrop = rows.find((x) => x.okDrop)?.size ?? null;
  const sizeByAmp = rows.find((x) => x.okAmp)?.size ?? null;

  // Vörnin á að hleypa álaginu í gegn en aldrei fara yfir straumþol kapalsins.
  // Í jafnstraumsrásum er 10 % borð ofan á samfellda strauminn; í riðstraumi
  // er rofinn valinn af stærð álagsins eins og venja er í töflum.
  const devices = circuit === "dc" ? FUSES_DC : BREAKERS_AC;
  const minDevice = circuit === "dc" ? current * 1.1 : current;
  const fuseFor = (ampacity: number) => devices.find((f) => f >= minDevice && f <= ampacity) ?? null;
  const chosen = rows.find((x) => x.okDrop && x.okAmp && fuseFor(x.ampacity) !== null) ?? null;
  const size = chosen?.size ?? null;
  const fuse = chosen ? fuseFor(chosen.ampacity) : null;

  const reason: CableResult["reason"] =
    chosen == null
      ? null
      : sizeByAmp !== null && chosen.size > sizeByAmp
        ? sizeByDrop !== null && chosen.size <= sizeByDrop
          ? "fall"
          : "oryggi"
        : sizeByDrop !== null && chosen.size > sizeByDrop
          ? "straumur"
          : "fall";

  const transferredW = current * voltage;

  return {
    minAreaDrop,
    sizeByDrop,
    sizeByAmp,
    size,
    dropV: chosen?.dropV ?? 0,
    dropPct: chosen?.dropPct ?? 0,
    lossW: chosen?.lossW ?? 0,
    lossPct: transferredW > 0 ? ((chosen?.lossW ?? 0) / transferredW) * 100 : 0,
    ampacity: chosen?.ampacity ?? 0,
    fuse,
    reason,
    conductorLength: k * length,
    rows,
  };
}

export interface CablePreset {
  id: string;
  label: string;
  note: string;
  input: Pick<CableInput, "current" | "voltage" | "length" | "maxDropPct" | "circuit">;
}

/** Dæmigerðar rásir í kerfum Bláorku. */
export const PRESETS: CablePreset[] = [
  {
    id: "multiplus5000",
    label: "Rafgeymir → MultiPlus-II 48/5000",
    note: "110 A samfellt, stutt og digurt",
    input: { current: 110, voltage: 48, length: 2, maxDropPct: 2, circuit: "dc" },
  },
  {
    id: "multiplus3000",
    label: "Rafgeymir → MultiPlus-II 48/3000",
    note: "70 A samfellt",
    input: { current: 70, voltage: 48, length: 2, maxDropPct: 2, circuit: "dc" },
  },
  {
    id: "mppt",
    label: "SmartSolar 250/100 → rafgeymir",
    note: "100 A hleðslustraumur",
    input: { current: 100, voltage: 48, length: 4, maxDropPct: 2, circuit: "dc" },
  },
  {
    id: "strengur",
    label: "Sellustrengur → MPPT",
    note: "14 A af þaki, oft löng leið",
    input: { current: 14, voltage: 350, length: 25, maxDropPct: 3, circuit: "dc" },
  },
  {
    id: "husbill",
    label: "Húsbíll 12 V",
    note: "1200 W áriðill á 12 V = 110 A",
    input: { current: 110, voltage: 12, length: 2.5, maxDropPct: 2, circuit: "dc" },
  },
  {
    id: "ac",
    label: "230 V lögn í útihús",
    note: "16 A, löng leið frá töflu",
    input: { current: 16, voltage: 230, length: 40, maxDropPct: 3, circuit: "ac1" },
  },
];
